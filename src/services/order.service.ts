import { PrismaClient, Order, OrderStatus, Prisma } from '@prisma/client';
import { CreateOrderInput, GetOrdersQuery, UpdateOrderStatusInput } from '../validators/order.validator';
import prisma from '../config/database';
import productService from './product.service';
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';
import env from '../config/env';
import {
  stockRollbackTotal,
  stockRollbackDuration,
} from '../utils/metrics';

export class OrderService {
  async getOrders(tenantId: string, query: GetOrdersQuery, userRole?: string, userPermissions?: any) {
    const { page, limit, status, customerId, outletId, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    // Handle sendToKitchen filter (from query params)
    const sendToKitchen = (query as any).sendToKitchen;
    const kitchenStatus = (query as any).kitchenStatus;

    // Handle kitchenStatus filter (array or single value)
    let kitchenStatusWhere: any = undefined;
    if (kitchenStatus) {
      if (Array.isArray(kitchenStatus)) {
        kitchenStatusWhere = { in: kitchenStatus };
      } else {
        kitchenStatusWhere = kitchenStatus;
      }
    }

    // Filter by store permissions
    let outletFilter: any = outletId ? { outletId } : {};

    // CASHIER dan KITCHEN: otomatis filter berdasarkan assignedStoreId
    if ((userRole === 'CASHIER' || userRole === 'KITCHEN') && userPermissions?.assignedStoreId) {
      const assignedStoreId = userPermissions.assignedStoreId;
      outletFilter = { outletId: assignedStoreId };
    }
    // SUPERVISOR: filter berdasarkan allowedStoreIds
    else if (userRole === 'SUPERVISOR' && userPermissions?.allowedStoreIds) {
      const allowedStoreIds = userPermissions.allowedStoreIds;
      if (allowedStoreIds.length > 0) {
        // If outletId is provided, check if it's in allowedStoreIds
        if (outletId) {
          if (!allowedStoreIds.includes(outletId)) {
            // Supervisor trying to access outlet they don't have access to
            return {
              data: [],
              pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
              },
            };
          }
          outletFilter = { outletId };
        } else {
          // Filter to only show orders from allowed stores
          outletFilter = { outletId: { in: allowedStoreIds } };
        }
      } else {
        // No stores assigned, return empty
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...outletFilter,
      ...(startDate && endDate && {
        createdAt: {
          gte: new Date(startDate),
          lte: (() => {
            // If endDate is a date string (YYYY-MM-DD), set to end of day (23:59:59)
            const endDateObj = new Date(endDate);
            // Check if it's a date string (no time component)
            if (endDate.includes('T') || endDate.includes(' ')) {
              // Already has time component, use as is
              return endDateObj;
            } else {
              // Date string only, set to end of day
              endDateObj.setHours(23, 59, 59, 999);
              return endDateObj;
            }
          })(),
        },
      }),
      // Filter by sendToKitchen if explicitly requested
      ...(sendToKitchen === true || sendToKitchen === 'true' ? { sendToKitchen: true } : {}),
      // Kitchen users only see orders sent to kitchen
      ...(userRole === 'KITCHEN' && { sendToKitchen: true }),
      // Filter by kitchenStatus if provided
      ...(kitchenStatusWhere && { kitchenStatus: kitchenStatusWhere }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          member: true,
          outlet: true,
          storeShift: {
            select: {
              id: true,
              shiftType: true,
              openedAt: true,
              openedBy: true,
              opener: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(id: string, tenantId: string): Promise<Order | null> {
    return prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        member: true,
        outlet: true,
        transaction: true, // Include transaction untuk mendapatkan servedBy
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async createOrder(data: CreateOrderInput, userId: string, tenantId: string, idempotencyKey?: string, userRole?: string): Promise<Order> {
    // Validasi: Kasir harus punya shift aktif
    if (userRole === 'CASHIER') {
      const cashShiftService = (await import('./cash-shift.service')).default;
      const hasActiveShift = await cashShiftService.hasActiveShift(tenantId, userId);
      if (!hasActiveShift) {
        throw new Error('Kasir harus membuka shift terlebih dahulu sebelum melakukan transaksi');
      }
    }

    // CRITICAL FIX: Validate order items
    const itemsArray = Array.isArray(data.items) ? data.items : [];
    if (itemsArray.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate each item
    for (let i = 0; i < itemsArray.length; i++) {
      const item = itemsArray[i];
      if (!item) {
        throw new Error(`Item at index ${i} is null or undefined`);
      }
      if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
        throw new Error(`Item at index ${i} must have a valid productId`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new Error(`Item at index ${i} must have quantity greater than 0`);
      }
      if (item.price === undefined || item.price === null || typeof item.price !== 'number' || item.price < 0) {
        throw new Error(`Item at index ${i} must have price greater than or equal to 0`);
      }
    }

    // Calculate subtotal from items (before any discounts)
    const subtotal = itemsArray.reduce((sum: number, item: any) => {
      return sum + ((item?.price || 0) * (item?.quantity || 0));
    }, 0);

    // Apply automatic discounts (from discount rules)
    let autoDiscount = 0;
    let discountDetails: any[] = [];
    try {
      const discountService = (await import('./discount.service')).default;
      const autoDiscountResult = await discountService.applyDiscounts(
        tenantId,
        itemsArray.map((item: any) => ({
          productId: item?.productId,
          quantity: item?.quantity || 0,
          price: item?.price || 0,
        })),
        subtotal
      );
      autoDiscount = autoDiscountResult.discountAmount;
      discountDetails = autoDiscountResult.discountDetails || [];
    } catch (error: any) {
      // If discount service fails (e.g., table doesn't exist yet), continue without auto discount
      logger.warn('Failed to apply automatic discounts:', error.message);
      autoDiscount = 0;
      discountDetails = [];
    }

    // Calculate subtotal after auto discount
    const subtotalAfterAutoDiscount = subtotal - autoDiscount;

    // Apply member discount if exists (calculated from subtotal after auto discount)
    let memberDiscount = 0;
    if (data.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: data.memberId },
      });
      if (member && member.isActive && member.discountType && member.discountValue) {
        if (member.discountType === 'PERCENTAGE') {
          memberDiscount = (subtotalAfterAutoDiscount * Number(member.discountValue)) / 100;
        } else {
          memberDiscount = Number(member.discountValue);
        }
      }
    }

    // Apply manual order discount (if any)
    const manualDiscount = data.discount || 0;

    // Calculate final total
    const total = subtotalAfterAutoDiscount - memberDiscount - manualDiscount;

    // CRITICAL FIX: Validate that total is not negative after discounts
    if (total < 0) {
      throw new Error(
        `Total cannot be negative after discounts. ` +
        `Subtotal: ${subtotal}, Auto Discount: ${autoDiscount}, ` +
        `Member Discount: ${memberDiscount}, Manual Discount: ${manualDiscount}, ` +
        `Final Total: ${total}`
      );
    }

    // Validate that total discount doesn't exceed subtotal
    const totalDiscount = autoDiscount + memberDiscount + manualDiscount;
    if (totalDiscount > subtotal) {
      throw new Error(
        `Total discount (${totalDiscount}) cannot exceed subtotal (${subtotal})`
      );
    }

    // Enhanced duplicate detection: check by idempotencyKey if provided, else fallback to item/time-based detection
    let duplicateOrder: Order | null = null;
    if (idempotencyKey) {
      duplicateOrder = await prisma.order.findFirst({
        where: {
          tenantId,
          idempotencyKey: idempotencyKey,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (duplicateOrder) {
        logger.warn(`Duplicate order detected (idempotencyKey: ${idempotencyKey}), returning existing order ${duplicateOrder.id}`);
        return duplicateOrder;
      }
    } else {
      // Fallback: check for duplicate order by items within last 5 minutes
      const recentOrder = await prisma.order.findFirst({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (recentOrder) {
        const existingItems = await prisma.orderItem.findMany({
          where: { orderId: recentOrder.id },
        });
        const itemsArray = Array.isArray(data.items) ? data.items : [];
        const existingItemsArray = Array.isArray(existingItems) ? existingItems : [];
        const isDuplicate = itemsArray.every((item: any) =>
          existingItemsArray.some((ei: any) =>
            ei && item && ei.productId === item.productId &&
            ei.quantity === item.quantity &&
            Math.abs(Number(ei.price) - item.price) < 0.01
          )
        ) && existingItemsArray.length === itemsArray.length;
        if (isDuplicate) {
          logger.warn(`Duplicate order detected (fallback, no idempotencyKey), returning existing order ${recentOrder.id}`);
          return recentOrder;
        }
      }
    }

    // Create order with items in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Get tenant info for order number generation
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
      });

      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Generate tenant initials (3 letters, uppercase)
      const tenantName = tenant.name || 'TENANT';
      const initials = tenantName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 3)
        .padEnd(3, 'X'); // Pad with X if less than 3 characters

      // Get the latest order number for this tenant to determine next sequence
      const latestOrder = await tx.order.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true },
      });

      let sequence = 1;
      if (latestOrder && latestOrder.orderNumber) {
        // Extract sequence from existing order number (format: PDG-001-ABC)
        const match = latestOrder.orderNumber.match(/^[A-Z]{3}-(\d+)-[A-Z]{3}$/);
        if (match) {
          sequence = parseInt(match[1], 10) + 1;
        } else {
          // If format doesn't match, count all orders
          const orderCount = await tx.order.count({
            where: { tenantId },
          });
          sequence = orderCount + 1;
        }
      }

      // Generate unique random letters (exactly 3 characters)
      let uniqueLetters = Math.random().toString(36).substring(2, 5).toUpperCase();
      // Ensure exactly 3 characters
      while (uniqueLetters.length < 3) {
        uniqueLetters += Math.random().toString(36).substring(2, 1).toUpperCase();
      }
      uniqueLetters = uniqueLetters.substring(0, 3);

      // Generate order number: [INITIALS]-[SEQUENCE]-[UNIQUE_LETTERS]
      // Format: PDG-001-ABC (sequence with leading zeros, always 3 digits)
      const sequenceStr = sequence.toString().padStart(3, '0');
      let orderNumber = `${initials}-${sequenceStr}-${uniqueLetters}`;

      // Ensure uniqueness by checking if order number already exists
      let retryCount = 0;
      while (retryCount < 10) {
        const existingOrder = await tx.order.findUnique({
          where: { orderNumber },
        });

        if (!existingOrder) {
          break; // Order number is unique
        }

        // If duplicate, generate new unique letters (exactly 3 characters)
        uniqueLetters = Math.random().toString(36).substring(2, 5).toUpperCase();
        while (uniqueLetters.length < 3) {
          uniqueLetters += Math.random().toString(36).substring(2, 1).toUpperCase();
        }
        uniqueLetters = uniqueLetters.substring(0, 3);
        orderNumber = `${initials}-${sequenceStr}-${uniqueLetters}`;
        retryCount++;
      }

      if (retryCount >= 10) {
        throw new Error('Failed to generate unique order number after multiple attempts');
      }
      // Stock verification will be done inside transaction when updating
      // This is just a preliminary check to fail fast
      const itemsArrayForCheck = Array.isArray(data.items) ? data.items : [];
      for (const item of itemsArrayForCheck) {
        if (!item || !item.productId) {
          throw new Error('Invalid item data');
        }
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId },
          select: { id: true, name: true, stock: true },
        });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        const itemQuantity = item.quantity || 0;
        if (product.stock < itemQuantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${itemQuantity}`);
        }
      }

      // Prepare order items with cost and profit calculation
      const orderItemsData = await Promise.all(
        itemsArray.map(async (item: any) => {
          if (!item || !item.productId) {
            throw new Error('Invalid item data');
          }
          // Get product to retrieve cost (use transaction client)
          const product = await tx.product.findFirst({
            where: { id: item.productId, tenantId },
          });
          if (!product) {
            throw new Error(`Product ${item.productId} not found`);
          }

          // Get cost from product (if available)
          const cost = product.cost ? Number(product.cost) : null;

          // Calculate profit = (price - cost) * quantity (only if cost exists)
          const itemPrice = item?.price || 0;
          const itemQuantity = item?.quantity || 0;
          const profit = cost !== null ? (itemPrice - cost) * itemQuantity : null;

          return {
            productId: item.productId,
            quantity: itemQuantity,
            price: itemPrice.toString(),
            cost: cost !== null ? cost.toString() : null,
            subtotal: (itemPrice * itemQuantity).toString(),
            profit: profit !== null ? profit.toString() : null,
          };
        })
      );

      // Get current shift for this store (if outletId provided)
      let storeShiftId: string | null = null;
      if (data.outletId) {
        try {
          const storeShiftService = (await import('./store-shift.service')).default;
          const currentShift = await storeShiftService.getCurrentShift(tenantId, data.outletId);
          if (currentShift) {
            storeShiftId = currentShift.id;
          }
        } catch (error: any) {
          // If error getting shift, continue without shift (for backward compatibility)
          logger.warn('Failed to get current shift for order:', error.message);
        }
      }

      // Prepare notes with discount details
      let orderNotes = data.notes || '';
      if (discountDetails.length > 0) {
        const discountInfo = JSON.stringify({
          discountDetails: discountDetails.map((d: any) => ({
            discountId: d.discountId,
            discountName: d.discountName,
            discountAmount: d.discountAmount,
            appliedTo: d.appliedTo, // Product IDs yang mendapat diskon
          })),
        });
        // Store discount details in notes with special marker
        orderNotes = orderNotes
          ? `${orderNotes}\n\n__DISCOUNT_DETAILS__:${discountInfo}`
          : `__DISCOUNT_DETAILS__:${discountInfo}`;
      }

      // Create order
      const order = await tx.order.create({
        data: {
          tenantId,
          userId,
          orderNumber,
          customerId: data.customerId,
          memberId: data.memberId,
          temporaryCustomerName: data.temporaryCustomerName,
          outletId: data.outletId,
          storeShiftId: storeShiftId, // Link to current store shift
          subtotal: subtotal.toString(),
          discount: totalDiscount.toString(),
          total: total.toString(),
          status: 'PENDING',
          sendToKitchen: data.sendToKitchen || false,
          kitchenStatus: data.sendToKitchen ? 'PENDING' : null,
          notes: orderNotes,
          idempotencyKey: idempotencyKey || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock within transaction (CRITICAL: must be in same transaction)
      // CRITICAL FIX: Add structured logging for stock operations
      logger.info('Creating order with stock updates', {
        tenantId,
        userId,
        orderNumber,
        itemsCount: data.items.length,
        items: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      for (const item of data.items) {
        // Get current product stock
        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId },
        });

        if (!product) {
          logger.error('Product not found during order creation', {
            productId: item.productId,
            tenantId,
            orderNumber,
          });
          throw new Error(`Product ${item.productId} not found`);
        }

        // Verify stock is sufficient
        if (product.stock < item.quantity) {
          logger.error('Insufficient stock during order creation', {
            productId: item.productId,
            productName: product.name,
            availableStock: product.stock,
            requiredQuantity: item.quantity,
            tenantId,
            orderNumber,
          });
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
        }

        // Update stock atomically within transaction
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity, // Atomic decrement
            },
          },
        });

        logger.debug('Stock decremented for order', {
          productId: item.productId,
          quantity: item.quantity,
          orderNumber,
        });
      }

      return order;
    }, {
      timeout: (env.ORDER_TRANSACTION_TIMEOUT * 1000), // Configurable timeout (default 30 seconds)
      isolationLevel: 'ReadCommitted',
    });

    // Emit socket events after transaction completes (outside transaction)
    for (const item of data.items) {
      const updatedProduct = await productService.getProductById(item.productId, tenantId, false);
      if (updatedProduct) {
        const { emitToTenant } = await import('../socket/socket');
        emitToTenant(tenantId, 'product:stock-update', {
          productId: item.productId,
          stock: updatedProduct.stock,
        });
      }
    }

    // Emit order created event
    const { emitToTenant } = await import('../socket/socket');
    emitToTenant(tenantId, 'order:new', {
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

    // Invalidate analytics cache after order creation
    await this.invalidateAnalyticsCache(tenantId);

    return order;
  }

  /**
   * Invalidate analytics cache for a tenant
   */
  private async invalidateAnalyticsCache(tenantId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      if (redis) {
        // Delete all analytics cache keys for this tenant
        const keys = await redis.keys(`analytics:*:${tenantId}`);
        const keys2 = await redis.keys(`analytics:${tenantId}:*`);
        const allKeys = [...keys, ...keys2];
        if (allKeys.length > 0) {
          await redis.del(...allKeys);
          logger.info('Invalidated analytics cache after order operation', {
            tenantId,
            cacheKeysDeleted: allKeys.length
          });
        }
      }
    } catch (error: any) {
      logger.warn('Failed to invalidate analytics cache', {
        error: error.message,
        tenantId
      });
    }
  }

  async updateOrder(id: string, data: any, tenantId: string): Promise<Order> {
    const order = await this.getOrderById(id, tenantId);
    if (!order) {
      throw new Error('Order not found');
    }

    // If updating items, handle stock changes and recalculate totals
    if (data.items && Array.isArray(data.items)) {
      return prisma.$transaction(async (tx) => {
        // Get current order with items
        const currentOrder = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });

        if (!currentOrder) {
          throw new Error('Order not found');
        }

        // Restore stock for removed items
        const currentItemsArray = Array.isArray(currentOrder.items) ? currentOrder.items : [];
        const newItemsArray = Array.isArray(data.items) ? data.items : [];

        const currentItemIds = new Set(currentItemsArray.map((item: any) => item?.productId).filter(Boolean));
        const newItemIds = new Set(newItemsArray.map((item: any) => item?.productId).filter(Boolean));

        // Items to remove (in current but not in new)
        const itemsToRemove = currentItemsArray.filter((item: any) => item && !newItemIds.has(item.productId));
        for (const item of itemsToRemove) {
          if (item?.productId && item?.quantity) {
            await productService.updateStock(item.productId, item.quantity, tenantId, 'add');
          }
        }

        // Update quantities for existing items
        for (const currentItem of currentItemsArray) {
          if (!currentItem?.productId) continue;
          const newItem = newItemsArray.find((item: any) => item && item.productId === currentItem.productId);
          if (newItem) {
            const quantityDiff = (newItem.quantity || 0) - (currentItem.quantity || 0);
            if (quantityDiff !== 0) {
              // Adjust stock based on quantity difference
              if (quantityDiff > 0) {
                // Quantity increased, subtract stock
                await productService.updateStock(currentItem.productId, quantityDiff, tenantId, 'subtract');
              } else {
                // Quantity decreased, add stock back
                await productService.updateStock(currentItem.productId, Math.abs(quantityDiff), tenantId, 'add');
              }
            }
          }
        }

        // Add stock for new items
        const itemsToAdd = newItemsArray.filter((item: any) => item && !currentItemIds.has(item.productId));
        for (const item of itemsToAdd) {
          if (item?.productId && item?.quantity) {
            await productService.updateStock(item.productId, item.quantity, tenantId, 'subtract');
          }
        }

        // Delete all existing items
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        });

        // Create new items with cost and profit
        const newItems = await Promise.all(
          newItemsArray.map(async (item: any) => {
            if (!item || !item.productId) {
              throw new Error('Invalid item data');
            }
            // Get product to retrieve cost
            const product = await productService.getProductById(item.productId, tenantId);
            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            // Get cost from product (if available)
            const cost = product.cost ? Number(product.cost) : null;

            // Calculate profit = (price - cost) * quantity (only if cost exists)
            const itemPrice = item?.price || 0;
            const itemQuantity = item?.quantity || 0;
            const profit = cost !== null ? (itemPrice - cost) * itemQuantity : null;

            return {
              orderId: id,
              productId: item.productId,
              quantity: itemQuantity,
              price: itemPrice.toString(),
              cost: cost !== null ? cost.toString() : null,
              subtotal: (item.price * item.quantity).toString(),
              profit: profit !== null ? profit.toString() : null,
            };
          })
        );

        await tx.orderItem.createMany({
          data: newItems,
        });

        // Update order totals
        const updateData: any = {};
        if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
        if (data.total !== undefined) updateData.total = data.total;
        if (data.discount !== undefined) updateData.discount = data.discount.toString();
        if (data.sendToKitchen !== undefined) {
          updateData.sendToKitchen = data.sendToKitchen;
          updateData.kitchenStatus = data.sendToKitchen ? 'PENDING' : null;
        }
        if (data.temporaryCustomerName !== undefined) updateData.temporaryCustomerName = data.temporaryCustomerName;
        if (data.notes !== undefined) updateData.notes = data.notes;

        // Emit stock updates via socket
        const { emitToTenant } = await import('../socket/socket');
        for (const item of data.items) {
          const product = await productService.getProductById(item.productId, tenantId);
          if (product) {
            emitToTenant(tenantId, 'product:stock-update', {
              productId: item.productId,
              stock: product.stock,
            });
          }
        }

        return tx.order.update({
          where: { id },
          data: updateData,
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
            member: true,
            outlet: true,
          },
        });
      });
    }

    // Simple update without items
    const updateData: any = {};
    if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
    if (data.total !== undefined) updateData.total = data.total;
    if (data.discount !== undefined) updateData.discount = data.discount.toString();
    if (data.sendToKitchen !== undefined) {
      updateData.sendToKitchen = data.sendToKitchen;
      updateData.kitchenStatus = data.sendToKitchen ? 'PENDING' : null;
    }
    if (data.temporaryCustomerName !== undefined) updateData.temporaryCustomerName = data.temporaryCustomerName;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        member: true,
        outlet: true,
      },
    });

    // Invalidate analytics cache after order update
    await this.invalidateAnalyticsCache(tenantId);

    return updatedOrder;
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusInput, tenantId: string): Promise<Order> {
    const order = await this.getOrderById(id, tenantId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get order with items
    const orderWithItems = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    // If cancelling or refunding, restore product stock
    // CRITICAL FIX: Use atomic transaction to restore all stock at once
    if ((data.status === 'CANCELLED' || data.status === 'REFUNDED') && order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      if (orderWithItems?.items && orderWithItems.items.length > 0) {
        const rollbackStartTime = Date.now();

        try {
          // Restore stock atomically within a transaction
          await prisma.$transaction(async (tx) => {
            const stockUpdates: Array<{ productId: string; newStock: number }> = [];

            for (const item of orderWithItems.items) {
              if (!item?.productId || !item?.quantity) continue;

              // Get current product stock
              const product = await tx.product.findFirst({
                where: { id: item.productId, tenantId },
                select: { id: true, stock: true },
              });

              if (!product) {
                logger.warn(`Product ${item.productId} not found when restoring stock for order ${id}`);
                continue;
              }

              // Calculate new stock (add back the quantity)
              const newStock = product.stock + item.quantity;

              // Update stock atomically
              await tx.product.update({
                where: { id: item.productId, tenantId },
                data: { stock: newStock },
              });

              stockUpdates.push({ productId: item.productId, newStock });
            }

            // Emit socket events after transaction completes (outside transaction for better performance)
            if (stockUpdates.length > 0) {
              const { emitToTenant } = await import('../socket/socket');
              for (const update of stockUpdates) {
                emitToTenant(tenantId, 'product:stock-update', {
                  productId: update.productId,
                  stock: update.newStock,
                });
              }
            }
          }, {
            timeout: (env.ORDER_TRANSACTION_TIMEOUT * 1000) / 2, // Half of order timeout for stock restore
            isolationLevel: 'ReadCommitted',
          });

          // Track successful rollback
          const rollbackDuration = (Date.now() - rollbackStartTime) / 1000;
          stockRollbackDuration.observe({ tenant_id: tenantId }, rollbackDuration);
          stockRollbackTotal.inc({ status: 'success', tenant_id: tenantId });
        } catch (error: any) {
          // Track failed rollback
          const rollbackDuration = (Date.now() - rollbackStartTime) / 1000;
          stockRollbackDuration.observe({ tenant_id: tenantId }, rollbackDuration);
          stockRollbackTotal.inc({ status: 'failure', tenant_id: tenantId });

          logger.error(`Failed to restore stock for order ${id}:`, error);
          throw error; // Re-throw to prevent order status update if stock restore fails
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Emit status update event
    const { emitToTenant } = await import('../socket/socket');
    emitToTenant(tenantId, 'order:update', {
      orderId: order.id,
      status: data.status,
    });

    // Invalidate analytics cache after order status update
    await this.invalidateAnalyticsCache(tenantId);

    return updatedOrder;
  }

  /**
   * Delete single order
   * Only allow deletion of CANCELLED or REFUNDED orders
   */
  async deleteOrder(orderId: string, tenantId: string): Promise<void> {
    const order = await this.getOrderById(orderId, tenantId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Only allow deletion of CANCELLED or REFUNDED orders
    if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      throw new Error(`Order ${order.orderNumber} cannot be deleted. Status must be CANCELLED or REFUNDED.`);
    }

    // Delete transaction first (if exists)
    // This is a safety measure in case onDelete: Cascade hasn't been applied yet
    try {
      await prisma.transaction.deleteMany({
        where: { orderId },
      });
    } catch (error: any) {
      // If transaction doesn't exist or already deleted, continue
      logger.warn('Transaction deletion warning (may not exist):', error.message);
    }

    // Delete order items first
    await prisma.orderItem.deleteMany({
      where: { orderId },
    });

    // Delete order (transaction will be cascade deleted if onDelete: Cascade is set)
    await prisma.order.delete({
      where: { id: orderId },
    });

    // Invalidate analytics cache after order deletion
    await this.invalidateAnalyticsCache(tenantId);
  }

  /**
   * Bulk delete orders
   * Only allow deletion of CANCELLED or REFUNDED orders
   */
  async bulkDeleteOrders(tenantId: string, orderIds: string[]): Promise<{ deleted: number; failed: number; errors: string[] }> {
    let deleted = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const orderId of orderIds) {
      try {
        const order = await this.getOrderById(orderId, tenantId);
        if (!order) {
          failed++;
          errors.push(`Order ${orderId} not found`);
          continue;
        }

        // Only allow deletion of CANCELLED or REFUNDED orders
        if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
          failed++;
          errors.push(`Order ${order.orderNumber} cannot be deleted. Status must be CANCELLED or REFUNDED.`);
          continue;
        }

        // Delete transaction first (if exists)
        // This is a safety measure in case onDelete: Cascade hasn't been applied yet
        try {
          await prisma.transaction.deleteMany({
            where: { orderId },
          });
        } catch (error: any) {
          // If transaction doesn't exist or already deleted, continue
          logger.warn(`Transaction deletion warning for order ${orderId} (may not exist):`, error.message);
        }

        // Delete order items first
        await prisma.orderItem.deleteMany({
          where: { orderId },
        });

        // Delete order (transaction will be cascade deleted if onDelete: Cascade is set)
        await prisma.order.delete({
          where: { id: orderId },
        });

        deleted++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to delete order ${orderId}: ${error.message}`);
      }
    }

    return { deleted, failed, errors };
  }

  /**
   * Bulk refund orders
   * Only allow refund of COMPLETED orders
   */
  async bulkRefundOrders(tenantId: string, orderIds: string[]): Promise<{ refunded: number; failed: number; errors: string[] }> {
    let refunded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const orderId of orderIds) {
      try {
        const order = await this.getOrderById(orderId, tenantId);
        if (!order) {
          failed++;
          errors.push(`Order ${orderId} not found`);
          continue;
        }

        // Only allow refund of COMPLETED orders
        if (order.status !== 'COMPLETED') {
          failed++;
          errors.push(`Order ${order.orderNumber} cannot be refunded. Status must be COMPLETED.`);
          continue;
        }

        // Refund order (update status to REFUNDED and restore stock)
        await this.updateOrderStatus(orderId, { status: 'REFUNDED' }, tenantId);
        refunded++;
      } catch (error: any) {
        failed++;
        errors.push(`Failed to refund order ${orderId}: ${error.message}`);
      }
    }

    return { refunded, failed, errors };
  }

  async getOrderStats(tenantId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {
      tenantId,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [totalOrders, totalRevenue, completedOrders, pendingOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.order.count({ where: { ...where, status: 'PENDING' } }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      completedOrders,
      pendingOrders,
      averageOrderValue: completedOrders > 0 ? Number(totalRevenue._sum.total || 0) / completedOrders : 0,
    };
  }

  /**
   * Bulk update kitchen status for multiple orders
   */
  async bulkUpdateKitchenStatus(tenantId: string, orderIds: string[], status: 'PENDING' | 'COOKING' | 'READY' | 'SERVED') {
    // Verify all orders belong to tenant and are sent to kitchen
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        tenantId,
        sendToKitchen: true, // Only update orders sent to kitchen
      },
    });

    if (orders.length !== orderIds.length) {
      throw new Error('Some orders not found or not sent to kitchen');
    }

    // Bulk update
    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        tenantId,
        sendToKitchen: true,
      },
      data: {
        kitchenStatus: status,
      },
    });

    // Emit socket events for real-time updates
    const { emitToTenant } = await import('../socket/socket');
    orderIds.forEach(orderId => {
      emitToTenant(tenantId, 'order:update', {
        orderId,
        kitchenStatus: status,
      });
    });

    return {
      updated: result.count,
      orderIds,
      status,
    };
  }
}

export default new OrderService();


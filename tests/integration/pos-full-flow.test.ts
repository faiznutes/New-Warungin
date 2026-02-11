/**
 * Integration Tests: POS Full Flow
 * Covers: Login -> Create Tenant Setup -> POS Order -> Idempotency -> Member Multi-tenancy
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { testPrisma } from '../setup';
import { createTestTenant, createTestUser, createTestProduct } from '../helpers/test-helpers';
import orderService from '../../src/services/order.service';
import productService from '../../src/services/product.service';

describe('POS Full Flow Integration Tests', () => {
    let tenant1: any;
    let tenant2: any;
    let user1: any;
    let user2: any;
    let product1: any;
    let product2: any;

    beforeAll(async () => {
        const timestamp = Date.now();
        // Setup Tenant 1
        tenant1 = await createTestTenant({
            name: `Flow Tenant 1 ${timestamp}`,
            email: `flow1-${timestamp}@warungin.com`,
            slug: `flow-tenant-1-${timestamp}`,
        });
        user1 = await createTestUser({
            tenantId: tenant1.id,
            email: `cashier1-${timestamp}@warungin.com`,
            role: 'CASHIER',
        });
        product1 = await createTestProduct({
            tenantId: tenant1.id,
            name: 'Product T1',
            price: 10000,
            stock: 50,
        });

        // Setup Tenant 2
        tenant2 = await createTestTenant({
            name: `Flow Tenant 2 ${timestamp}`,
            email: `flow2-${timestamp}@warungin.com`,
            slug: `flow-tenant-2-${timestamp}`,
        });
        user2 = await createTestUser({
            tenantId: tenant2.id,
            email: `cashier2-${timestamp}@warungin.com`,
            role: 'CASHIER',
        });
        product2 = await createTestProduct({
            tenantId: tenant2.id,
            name: 'Product T2',
            price: 20000,
            stock: 30,
        });
    });

    describe('Multi-tenant Member Isolation (I9)', () => {
        it('should allow same phone number for members in different tenants', async () => {
            const phone = '08123456789';

            // Member in Tenant 1
            const member1 = await testPrisma.member.create({
                data: {
                    tenantId: tenant1.id,
                    name: 'Member T1',
                    phone: phone,
                }
            });

            // Member in Tenant 2 with SAME phone number
            const member2 = await testPrisma.member.create({
                data: {
                    tenantId: tenant2.id,
                    name: 'Member T2',
                    phone: phone,
                }
            });

            expect(member1.id).not.toBe(member2.id);
            expect(member1.phone).toBe(member2.phone);
            expect(member1.tenantId).toBe(tenant1.id);
            expect(member2.tenantId).toBe(tenant2.id);
        });

        it('should fail to create duplicate phone number within the SAME tenant', async () => {
            const phone = '08999999999';

            await testPrisma.member.create({
                data: {
                    tenantId: tenant1.id,
                    name: 'Original Member',
                    phone: phone,
                }
            });

            await expect(
                testPrisma.member.create({
                    data: {
                        tenantId: tenant1.id,
                        name: 'Duplicate Member',
                        phone: phone,
                    }
                })
            ).rejects.toThrow();
        });
    });

    describe('POS Order & Idempotency', () => {
        it('should create order and verify stock across tenants correctly', async () => {
            const orderData = {
                items: [
                    {
                        productId: product1.id,
                        quantity: 2,
                        price: product1.price,
                    }
                ],
                paymentMethod: 'CASH',
                total: product1.price * 2,
            };

            // Create order in Tenant 1
            const order1 = await orderService.createOrder(orderData, user1.id, tenant1.id);
            expect(order1.tenantId).toBe(tenant1.id);

            // Verify stock T1 decreased
            const updatedP1 = await productService.getProductById(product1.id, tenant1.id);
            expect(updatedP1?.stock).toBe(48);

            // Verify stock T2 remained unchanged
            const updatedP2 = await productService.getProductById(product2.id, tenant2.id);
            expect(updatedP2?.stock).toBe(30);
        });

        it('should handle idempotency key correctly', async () => {
            const idempotencyKey = `idemp-${Date.now()}`;
            const orderData = {
                items: [{ productId: product2.id, quantity: 1, price: product2.price }],
                paymentMethod: 'QRIS',
                total: product2.price,
            };

            // First call
            const order1 = await orderService.createOrder(orderData, user2.id, tenant2.id, idempotencyKey);
            const stockAfterFirst = (await productService.getProductById(product2.id, tenant2.id))?.stock;

            // Second call with same key
            const order2 = await orderService.createOrder(orderData, user2.id, tenant2.id, idempotencyKey);
            const stockAfterSecond = (await productService.getProductById(product2.id, tenant2.id))?.stock;

            expect(order1.id).toBe(order2.id);
            expect(stockAfterFirst).toBe(stockAfterSecond); // Stock should not decrease again
        });
    });
});

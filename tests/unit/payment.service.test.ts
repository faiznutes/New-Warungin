/**
 * Unit Tests: Payment Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentService from '../../src/services/payment.service';
import prisma from '../../src/config/database';

// Mock dependencies
vi.mock('../../src/config/database', () => ({
  default: {
    order: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

vi.mock('midtrans-client', () => ({
  default: {
    Snap: vi.fn(),
    CoreApi: vi.fn(),
  },
}));

vi.mock('../../src/utils/webhook-queue', () => ({
  isProcessed: vi.fn(() => false),
  markAsProcessed: vi.fn(),
  addToRetryQueue: vi.fn(),
}));

describe('Payment Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create cash payment successfully', async () => {
    const result = await paymentService.createPayment({
      orderId: 'order-1',
      amount: 50000,
      customerName: 'Test Customer',
      paymentMethod: 'CASH',
      items: [],
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('CASH');
  });

  it('should create QRIS payment with QR code', async () => {
    const result = await paymentService.createPayment({
      orderId: 'order-1',
      amount: 50000,
      customerName: 'Test Customer',
      paymentMethod: 'QRIS',
      qrCode: 'test-qr-code',
      items: [],
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('QRIS');
    expect(result.qrCode).toBe('test-qr-code');
  });

  it('should handle webhook with idempotency check', async () => {
    const webhookPayload = {
      transaction_time: new Date().toISOString(),
      transaction_status: 'settlement',
      transaction_id: 'test-txn-1',
      order_id: 'order-1',
      gross_amount: '50000',
    };

    (prisma.order.findFirst as any).mockResolvedValue({
      id: 'order-1',
      tenantId: 'tenant-1',
      status: 'PENDING',
    });

    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          update: vi.fn().mockResolvedValue({
            id: 'order-1',
            status: 'PAID',
          }),
        },
      };
      return callback(tx);
    });

    // First webhook should process
    await paymentService.handleWebhook(webhookPayload);

    // Second webhook with same transaction_id should be idempotent
    const { isProcessed } = await import('../../src/utils/webhook-queue');
    (isProcessed as any).mockReturnValueOnce(true);

    // Should not process duplicate
    await expect(
      paymentService.handleWebhook(webhookPayload)
    ).rejects.toThrow();
  });
});

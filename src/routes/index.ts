import { Router } from 'express';
import authRoutes from './auth.routes';
import tenantRoutes from './tenant.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import dashboardRoutes from './dashboard.routes';
import customerRoutes from './customer.routes';
import memberRoutes from './member.routes';
import subscriptionRoutes from './subscription.routes';
import addonRoutes from './addon.routes';
import receiptRoutes from './receipt.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import settingsRoutes from './settings.routes';
import tenantProfileRoutes from './tenant-profile.routes';
import paymentRoutes from './payment.routes';
import transactionRoutes from './transaction.routes';
import deliveryRoutes from './delivery.routes';
import contactRoutes from './contact.routes';
import outletRoutes from './outlet.routes';
import pdfRoutes from './pdf.routes';
import discountRoutes from './discount.routes';
import internalRoutes from './internal.routes';
import subscriptionReceiptRoutes from './subscription-receipt.routes';
import auditLogRoutes from './audit-log.routes';
import twoFactorRoutes from './2fa.routes';
import sessionRoutes from './session.routes';
import passwordRoutes from './password.routes';
import webhookRoutes from './webhook.routes';
import employeeRoutes from './employee.routes';
import archiveRoutes from './archive.routes';
import supplierRoutes from './supplier.routes';
import purchaseOrderRoutes from './purchase-order.routes';
import stockAlertRoutes from './stock-alert.routes';
import superadminBackupRoutes from './superadmin-backup.routes';
import tenantBackupRoutes from './tenant-backup.routes';
import cashShiftRoutes from './cash-shift.routes';
import adminMonitorRoutes from './admin-monitor.routes';
import stockTransferRoutes from './stock-transfer.routes';
import storeShiftRoutes from './store-shift.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Versioning - v1 routes
import v1Routes from './v1/index';
router.use('/v1', v1Routes);

// API routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);

// Add more routes here
router.use('/members', memberRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/addons', addonRoutes);
router.use('/receipts', receiptRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/tenant', tenantProfileRoutes);
router.use('/payment', paymentRoutes);
router.use('/transactions', transactionRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/contact', contactRoutes);
router.use('/outlets', outletRoutes);
router.use('/pdf', pdfRoutes);
router.use('/discounts', discountRoutes);
router.use('/internal', internalRoutes);
router.use('/subscription-receipts', subscriptionReceiptRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/2fa', twoFactorRoutes);
router.use('/sessions', sessionRoutes);
router.use('/password', passwordRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/employees', employeeRoutes);
router.use('/archives', archiveRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/stock-alerts', stockAlertRoutes);
router.use('/superadmin/backups', superadminBackupRoutes);
router.use('/tenant/backup', tenantBackupRoutes);
router.use('/cash-shift', cashShiftRoutes);
router.use('/admin', adminMonitorRoutes);
router.use('/stock-transfers', stockTransferRoutes);
router.use('/store-shift', storeShiftRoutes);

export default router;


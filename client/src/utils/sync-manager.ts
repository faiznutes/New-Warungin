/**
 * Sync Manager
 * Handles automatic synchronization of offline transactions
 */

import api from '../api';
import { offlineStorage } from './offline-storage';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
}

class SyncManager {
  private syncInterval: number | null = null;
  private syncIntervalMs = 10000; // 10 seconds
  private statusCallbacks: ((status: SyncStatus) => void)[] = [];
  private currentStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
  };

  constructor() {
    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.currentStatus.isOnline = true;
      this.notifyStatus();
      this.startAutoSync();
    });

    window.addEventListener('offline', () => {
      this.currentStatus.isOnline = false;
      this.notifyStatus();
      this.stopAutoSync();
    });

    // Start auto sync if online
    if (this.currentStatus.isOnline) {
      this.startAutoSync();
    }
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    callback(this.currentStatus); // Call immediately with current status

    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * Notify all subscribers of status change
   */
  private notifyStatus(): void {
    this.statusCallbacks.forEach(callback => callback(this.currentStatus));
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    // Sync immediately
    this.sync();

    // Then sync every interval
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, this.syncIntervalMs);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Manual sync trigger
   */
  async sync(): Promise<void> {
    if (!this.currentStatus.isOnline || this.currentStatus.isSyncing) {
      return;
    }

    this.currentStatus.isSyncing = true;
    this.notifyStatus();

    try {
      const unsyncedOrders = await offlineStorage.getUnsyncedOrders();
      this.currentStatus.pendingCount = unsyncedOrders.length;

      if (unsyncedOrders.length === 0) {
        this.currentStatus.isSyncing = false;
        this.currentStatus.lastSyncTime = Date.now();
        this.notifyStatus();
        return;
      }

      console.log(`🔄 Syncing ${unsyncedOrders.length} offline orders...`);

      // Sync orders one by one
      for (const order of unsyncedOrders) {
        try {
          // Create order
          const orderResponse = await api.post('/orders', order.orderData);
          const serverOrder = orderResponse.data;

          // Create transaction if order data includes transaction info
          if (order.orderData.transactionData) {
            const transactionData = {
              ...order.orderData.transactionData,
              orderId: serverOrder.id,
            };
            await api.post('/transactions', transactionData);
          }

          // Mark as synced
          await offlineStorage.markOrderAsSynced(order.id, serverOrder.id);

          // Delete from local storage after successful sync
          await offlineStorage.deleteOrder(order.id);

          console.log(`✅ Synced order ${order.id} → ${serverOrder.id}`);
        } catch (error: any) {
          console.error(`❌ Failed to sync order ${order.id}:`, error);
          // Continue with next order even if one fails
        }
      }

      // Update pending count
      const remainingOrders = await offlineStorage.getUnsyncedOrders();
      this.currentStatus.pendingCount = remainingOrders.length;
      this.currentStatus.lastSyncTime = Date.now();

      console.log(`✅ Sync completed. ${remainingOrders.length} orders remaining.`);
    } catch (error: any) {
      console.error('❌ Sync error:', error);
    } finally {
      this.currentStatus.isSyncing = false;
      this.notifyStatus();
    }
  }

  /**
   * Force sync (manual trigger)
   */
  async forceSync(): Promise<void> {
    await this.sync();
  }

  /**
   * Get pending orders count
   */
  async getPendingCount(): Promise<number> {
    const orders = await offlineStorage.getUnsyncedOrders();
    this.currentStatus.pendingCount = orders.length;
    this.notifyStatus();
    return orders.length;
  }
}

export const syncManager = new SyncManager();

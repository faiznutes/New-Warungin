export type PlanCatalogItem = {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
};

export type AddonCatalogItem = {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  icon: string;
  defaultLimit: number | null;
  features: string[];
  comingSoon?: boolean;
};

export const PLAN_CATALOG: PlanCatalogItem[] = [
  {
    id: "basic",
    name: "BASIC (Starter)",
    code: "BASIC",
    price: 149000,
    description: "Opsi terbaik untuk UMKM yang baru memulai digitalisasi bisnis.",
    features: [
      "Hingga 50 Produk Aktif",
      "Maksimal 3 User Staf",
      "1 Outlet Operasional",
      "Cloud Backup Harian",
      "Laporan Penjualan Dasar",
      "Support Email 24 Jam",
    ],
  },
  {
    id: "pro",
    name: "PRO (Growth)",
    code: "PRO",
    price: 299000,
    description:
      "Solusi lengkap untuk akselerasi bisnis dengan fitur manajemen stok lanjut.",
    features: [
      "Unlimited Produk & Kategori",
      "Hingga 10 User Staf",
      "3 Outlet Terintegrasi",
      "Advanced Inventory System",
      "Manajemen Supplier & PO",
      "Prioritas Chat Support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    code: "ENTERPRISE",
    price: 499000,
    description:
      "Kendali penuh untuk skema bisnis besar (Franchise/Chain) tanpa batas.",
    features: [
      "Unlimited User & Outlet",
      "Custom Domain Branding",
      "API Access & Integration",
      "Account Manager Khusus",
      "Fitur Loyalty & CRM Lanjut",
      "Service Level Agreement (SLA)",
    ],
  },
  {
    id: "demo",
    name: "DEMO",
    code: "DEMO",
    price: 0,
    description: "Akses semua fitur premium untuk periode trial.",
    features: [
      "Semua fitur aktif",
      "Cocok untuk onboarding",
      "Durasi trial fleksibel",
    ],
  },
];

export const ADDON_CATALOG: AddonCatalogItem[] = [
  {
    id: "whatsapp_integration",
    name: "WhatsApp Integration",
    type: "WHATSAPP_INTEGRATION",
    description:
      "Kirim struk otomatis dan notifikasi promo langsung ke WhatsApp pelanggan.",
    price: 50000,
    icon: "message",
    defaultLimit: null,
    features: ["Broadcast", "Auto Receipt", "Template Notification"],
  },
  {
    id: "advanced_analytics",
    name: "Advanced Analytics",
    type: "BUSINESS_ANALYTICS",
    description:
      "Visualisasi data AI-powered untuk prediksi stok dan tren penjualan.",
    price: 75000,
    icon: "query_stats",
    defaultLimit: null,
    features: ["Prediksi Penjualan", "Laba Rugi", "Insight Harian"],
  },
  {
    id: "hardware_sync",
    name: "Hardware Sync",
    type: "HARDWARE_SYNC",
    description:
      "Dukungan sinkronisasi printer, scanner, dan cash drawer di semua outlet.",
    price: 25000,
    icon: "print",
    defaultLimit: null,
    features: ["Thermal Printer", "Cash Drawer", "Scanner Barcode"],
  },
  {
    id: "loyalty_engine",
    name: "Loyalty Engine",
    type: "LOYALTY_ENGINE",
    description:
      "Sistem poin, kupon, dan tier membership untuk retensi pelanggan.",
    price: 40000,
    icon: "redeem",
    defaultLimit: null,
    features: ["Poin", "Tier Membership", "Voucher"],
  },
  {
    id: "offline_sync_pro",
    name: "Offline Sync Pro",
    type: "OFFLINE_SYNC_PRO",
    description:
      "Jaminan transaksi tetap berjalan meski koneksi internet padam total.",
    price: 0,
    icon: "cloud_off",
    defaultLimit: null,
    features: ["Queue Offline", "Auto Sync", "Conflict Resolver"],
  },
  {
    id: "custom_mobile_app",
    name: "Custom Mobile App",
    type: "CUSTOM_MOBILE_APP",
    description:
      "Aplikasi Android khusus dengan brand toko untuk pesanan online.",
    price: 150000,
    icon: "smartphone",
    defaultLimit: null,
    features: ["Branded App", "Order Tracking", "Push Notification"],
    comingSoon: true,
  },
  {
    id: "add_outlets",
    name: "Tambah Outlet",
    type: "ADD_OUTLETS",
    description: "Tambah kuota outlet/cabang untuk tenant.",
    price: 50000,
    icon: "storefront",
    defaultLimit: 1,
    features: ["+1 Outlet", "Aktif langsung", "Bisa dibeli berulang"],
  },
  {
    id: "add_users",
    name: "Tambah User",
    type: "ADD_USERS",
    description: "Tambah kuota user staf untuk tenant.",
    price: 30000,
    icon: "group_add",
    defaultLimit: 1,
    features: ["+1 User", "Role fleksibel", "Bisa dibeli berulang"],
  },
  {
    id: "add_products",
    name: "Tambah Produk",
    type: "ADD_PRODUCTS",
    description: "Tambah kuota produk aktif untuk tenant.",
    price: 20000,
    icon: "inventory_2",
    defaultLimit: 100,
    features: ["+100 Produk", "Aktif langsung", "Bisa dibeli berulang"],
  },
];

export function getPlanPrice(planCode: string): number {
  const code = planCode.toUpperCase();
  return PLAN_CATALOG.find((p) => p.code === code)?.price ?? 0;
}

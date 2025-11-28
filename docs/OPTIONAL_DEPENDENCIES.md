# Optional Dependencies

Beberapa dependencies bersifat optional dan tidak wajib di-install untuk menjalankan aplikasi. Dependencies ini hanya diperlukan jika fitur tertentu digunakan.

## Dependencies Optional

### 1. firebase-admin
**Digunakan untuk:** Push notifications via Firebase Cloud Messaging (FCM)

**Install:**
```bash
npm install firebase-admin
```

**File yang menggunakan:**
- `src/services/push-notification.service.ts`

**Catatan:** 
- Jika tidak di-install, push notification akan menggunakan OneSignal sebagai fallback
- Error handling sudah ditambahkan untuk menangani kasus package tidak terinstall

### 2. twilio
**Digunakan untuk:** SMS gateway via Twilio

**Install:**
```bash
npm install twilio
```

**File yang menggunakan:**
- `src/services/sms-gateway.service.ts`

**Catatan:**
- Jika tidak di-install, SMS gateway akan menggunakan Zenziva sebagai fallback
- Error handling sudah ditambahkan untuk menangani kasus package tidak terinstall

## Implementasi

Kedua dependencies ini menggunakan **dynamic import** dengan error handling:

```typescript
// Dynamic import dengan error handling
let twilio: any;
try {
  // @ts-ignore - Optional dependency
  twilio = await import('twilio');
} catch (importError) {
  throw new Error('twilio package is not installed. Install it with: npm install twilio');
}
```

## Build Docker

Dependencies ini **tidak** diperlukan untuk build Docker. TypeScript build akan berhasil karena:
1. Menggunakan `@ts-ignore` untuk mengabaikan type checking
2. Menggunakan `any` type untuk dynamic import
3. Error handling yang proper jika package tidak tersedia

## Menambahkan Optional Dependency Baru

Jika ingin menambahkan optional dependency baru:

1. Gunakan dynamic import:
```typescript
let packageName: any;
try {
  // @ts-ignore - Optional dependency
  packageName = await import('package-name');
} catch (importError) {
  // Handle error atau gunakan fallback
  throw new Error('package-name is not installed');
}
```

2. Tambahkan `@ts-ignore` untuk menghindari TypeScript error
3. Tambahkan error handling yang proper
4. Dokumentasikan di file ini


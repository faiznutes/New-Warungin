# Vite TypeScript Configuration Guide

## ⚠️ Penting: Konfigurasi TypeScript untuk Vite

File ini menjelaskan konfigurasi TypeScript yang benar untuk project Vite agar tidak terjadi error type definitions.

## ✅ Konfigurasi yang BENAR

### `client/tsconfig.json` - Versi yang Benar

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client", "node"]  // ✅ WAJIB ADA
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"],
  "references": [{ "path": "./tsconfig.node.json" }],
  "vueCompilerOptions": {
    "target": 3
  }
}
```

## ❌ Kesalahan yang HARUS Dihindari

### 1. JANGAN gunakan `typeRoots`

```json
// ❌ SALAH - Ini akan memutus akses ke vite/client.d.ts
"typeRoots": ["./node_modules/@types"]
```

**Alasan:** `typeRoots` memaksa TypeScript hanya mencari types di `@types`, padahal `vite/client.d.ts` ada di `node_modules/vite/`, bukan di `@types`.

### 2. JANGAN hapus array `types`

```json
// ❌ SALAH - Tanpa ini, TypeScript tidak akan load vite/client types
// Tidak ada "types": ["vite/client", "node"]
```

**Alasan:** Tanpa deklarasi eksplisit, TypeScript tidak akan otomatis load `vite/client.d.ts`.

### 3. JANGAN extend dari tsconfig server

```json
// ❌ SALAH - Jangan extend dari server tsconfig
"extends": "../tsconfig.json"
```

**Alasan:** Client akan ketarik semua tipe server → ini bikin error lebih kompleks.

## ✅ Dependencies yang WAJIB Terinstall

Pastikan dependencies berikut terinstall di `client/`:

```bash
cd client
npm install
npm install -D @types/node
npm install vite
```

Atau jika menggunakan pnpm:

```bash
cd client
pnpm install
pnpm add -D @types/node
pnpm add vite
```

## 📝 File `client/src/env.d.ts` - WAJIB Ada

File ini harus ada dan berisi:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 🔧 Troubleshooting

### Error: "Cannot find type definition file for 'vite/client'"

**Solusi:**
1. Pastikan `"types": ["vite/client", "node"]` ada di `tsconfig.json`
2. Pastikan `vite` terinstall: `npm install vite`
3. Pastikan file `node_modules/vite/client.d.ts` ada
4. Restart TypeScript server di IDE: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Error: "Cannot find type definition file for 'node'"

**Solusi:**
1. Pastikan `"types": ["vite/client", "node"]` ada di `tsconfig.json`
2. Install `@types/node`: `npm install -D @types/node`
3. Restart TypeScript server di IDE

### ⚠️ Error di Cursor Worktree

Jika error muncul di Cursor worktree (path seperti `/c:/Users/Iz/.cursor/worktrees/...`):

**Penyebab:** Worktree tidak memiliki `node_modules` yang lengkap.

**Solusi Cepat:**
1. Buka terminal di Cursor
2. Masuk ke folder worktree client:
   ```bash
   cd c:/Users/Iz/.cursor/worktrees/New-Warungin/oso/client
   ```
3. Install dependencies:
   ```bash
   npm install
   npm install -D @types/node
   npm install vite
   ```
4. Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

**Atau gunakan script yang sudah disediakan:**
- PowerShell: `.\scripts\install-worktree-deps.ps1`
- Bash: `bash scripts/install-worktree-deps.sh`

**Catatan:** Worktree memiliki `node_modules` terpisah dari repo utama. Dependencies harus diinstall di worktree juga!

### Error masih muncul setelah perbaikan

**Solusi:**
1. Hapus `node_modules` dan `package-lock.json`:
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   ```
2. Install ulang dependencies:
   ```bash
   npm install
   npm install -D @types/node vite
   ```
3. Restart TypeScript server di IDE
4. Reload window: `Ctrl+Shift+P` → "Developer: Reload Window"

## 📋 Checklist Setup Baru

Saat setup project baru atau clone repository:

- [ ] Install dependencies: `cd client && npm install`
- [ ] Install type definitions: `npm install -D @types/node vite`
- [ ] Pastikan `tsconfig.json` memiliki `"types": ["vite/client", "node"]`
- [ ] Pastikan `tsconfig.json` TIDAK memiliki `typeRoots`
- [ ] Pastikan file `client/src/env.d.ts` ada dengan `/// <reference types="vite/client" />`
- [ ] Restart TypeScript server di IDE

## 🎯 Kesimpulan

**Konfigurasi yang BENAR:**
- ✅ `"types": ["vite/client", "node"]` di `compilerOptions`
- ✅ TIDAK ada `typeRoots`
- ✅ `vite` dan `@types/node` terinstall
- ✅ File `env.d.ts` dengan reference ke `vite/client`

**Konfigurasi yang SALAH:**
- ❌ Menggunakan `typeRoots`
- ❌ Tidak ada array `types`
- ❌ Extend dari server tsconfig

---

**Last Updated:** December 10, 2025
**Status:** ✅ Implemented and Verified


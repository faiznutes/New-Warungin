# WSL Cleanup & Maintenance Guide

**Purpose**: Cek status WSL dan bersihkan distributions yang tidak digunakan
**OS**: Windows 11
**Date**: December 31, 2025

---

## Step 1: Cek Status WSL (Check)

### Command untuk Cek WSL
```powershell
# Buka PowerShell sebagai Administrator
# (Windows + X, pilih Terminal (Admin))

# Cek versi WSL
wsl.exe --version

# Expected Output:
# WSL version: 2.X.X
# Kernel version: X.X.X
```

### List Semua WSL Distributions
```powershell
# List dengan status verbose
wsl.exe --list --verbose

# Expected Output:
#   NAME            STATE           VERSION
# * Ubuntu          Running         2
#   Ubuntu-22.04    Stopped         2
#   Debian          Stopped         1

# Notes:
# - NAME: Nama distribution
# - STATE: Running atau Stopped
# - VERSION: WSL 1 atau WSL 2
```

### List Hanya Online Distributions
```powershell
# List yang active/running saja
wsl.exe --list --online

# Expected Output:
# The following is a list of valid distributions that can be installed.
# Ubuntu
# Debian
# ...
```

---

## Step 2: Shutdown WSL (Stop Running Instances)

### Stop Semua WSL Instance
```powershell
# Shutdown semua WSL yang sedang running
wsl.exe --shutdown

# Ini akan stop semua distributions
# Expected: Command berhasil tanpa output
```

### Verifikasi WSL sudah shutdown
```powershell
# Cek status lagi
wsl.exe --list --verbose

# Semua harus di state "Stopped"
```

---

## Step 3: Uninstall WSL Distributions yang Tidak Digunakan

### Uninstall Specific Distribution
```powershell
# Uninstall satu distribution
wsl.exe --unregister Ubuntu

# Atau jika namanya berbeda:
wsl.exe --unregister Ubuntu-22.04
wsl.exe --unregister Debian
wsl.exe --unregister Alpine

# Expected Output:
# Unregistering distribution...
# Pengertian: Distribution akan dihapus dari WSL registry
```

### Uninstall SEMUA WSL Distributions
```powershell
# HATI-HATI: Ini akan menghapus SEMUA WSL!
# Jalankan satu per satu sesuai list:

# 1. Cek daftar WSL
wsl.exe --list --all

# 2. Uninstall masing-masing (ganti NAME dengan nama yang benar)
wsl.exe --unregister Ubuntu
wsl.exe --unregister Ubuntu-22.04
wsl.exe --unregister Debian
wsl.exe --unregister Alpine
wsl.exe --unregister CentOS

# Atau gunakan loop PowerShell:
wsl.exe --list --raw | ForEach-Object { 
    if ($_ -ne "") { 
        wsl.exe --unregister $_ 
    } 
}
```

### Verifikasi Uninstall Berhasil
```powershell
# Cek list kosong
wsl.exe --list --all

# Expected Output:
# Windows Subsystem for Linux has no installed distributions.
# Use 'wsl.exe --install' to download and install a distribution.
```

---

## Step 4: Clean Up WSL Storage

### Clear WSL Cache
```powershell
# Hapus cache data
$wslCachePath = "$env:LOCALAPPDATA\Microsoft\Windows Subsystem for Linux"

# Remove cache
if (Test-Path $wslCachePath) {
    Remove-Item -Recurse -Force $wslCachePath
    Write-Host "WSL cache cleared"
} else {
    Write-Host "Cache path tidak ditemukan"
}
```

### Check Disk Space
```powershell
# Cek berapa besar space yang dibebaskan
$wslDiskPath = "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.UbuntuonWindows_*"

# List WSL related folders
Get-ChildItem -Path "$env:LOCALAPPDATA\Packages" -Filter "*Canonical*" -Directory

# Get size
Get-ChildItem -Path "$env:LOCALAPPDATA\Packages" -Filter "*Canonical*" -Directory | 
    ForEach-Object { 
        $size = (Get-ChildItem -Path $_.FullName -Recurse | 
            Measure-Object -Property Length -Sum).Sum / 1GB
        "$($_.Name): $([math]::Round($size, 2)) GB"
    }
```

### Remove WSL Package Folders (Optional)
```powershell
# HATI-HATI: Ini akan menghapus folder WSL yang terinstall
# Pastikan sudah unregister dulu!

# Hapus Ubuntu folder
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.UbuntuonWindows*" -ErrorAction SilentlyContinue

# Hapus Debian folder
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Packages\TheDebianProject.DebianGNU-Linux*" -ErrorAction SilentlyContinue

# Hapus Alpine folder
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Packages\LimabytheLinuxFoundation.ALP*" -ErrorAction SilentlyContinue
```

---

## Step 5: Cleanup Virtual Disk Image (VHDX)

### Locate VHDX Files
```powershell
# WSL 2 menyimpan VHD files
$vhdPath = "$env:LOCALAPPDATA\Packages"

# Find semua VHDX files
Get-ChildItem -Path $vhdPath -Filter "*.vhdx" -Recurse

# Atau cari di default location:
Get-ChildItem -Path "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.UbuntuonWindows*\LocalState" -Filter "*.vhdx"
```

### Compact VHDX Files (Shrink Size)
```powershell
# HATI-HATI: VHDX harus di-unregister dulu

# Compact semua VHDX
Get-ChildItem -Path "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.UbuntuonWindows*\LocalState\*.vhdx" -ErrorAction SilentlyContinue |
    ForEach-Object {
        Write-Host "Compacting: $($_.FullName)"
        diskpart.exe /s - << @"
select vdisk file="$($_.FullName)"
detach vdisk
compact vdisk
attach vdisk
@
    }
```

### Remove VHDX Files
```powershell
# Setelah unregister, hapus VHDX
Remove-Item -Path "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.UbuntuonWindows*\LocalState\*.vhdx" -Force
```

---

## Step 6: Reinstall WSL (Optional)

### Install WSL 2 Fresh
```powershell
# Install WSL 2
wsl.exe --install --no-launch

# Install specific distribution
wsl.exe --install Ubuntu

# Atau dari Microsoft Store:
# Buka PowerShell sebagai Admin, lalu:
wsl.exe --install
```

### Verify Installation
```powershell
# Cek WSL version
wsl.exe --version

# List distributions
wsl.exe --list --verbose
```

---

## Complete Cleanup PowerShell Script

Jalankan script ini untuk full cleanup:

```powershell
# ============================================
# WSL Complete Cleanup Script
# ============================================

Write-Host "=== WSL Cleanup Script ===" -ForegroundColor Green

# Step 1: Shutdown WSL
Write-Host "`n[1/6] Shutting down WSL..." -ForegroundColor Yellow
wsl.exe --shutdown
Start-Sleep -Seconds 2

# Step 2: List all distributions
Write-Host "`n[2/6] Current WSL distributions:" -ForegroundColor Yellow
$distros = (wsl.exe --list --raw).Split("`n") | Where-Object { $_ -ne "" }
$distros

# Step 3: Unregister all distributions
Write-Host "`n[3/6] Unregistering all WSL distributions..." -ForegroundColor Yellow
$distros | ForEach-Object { 
    Write-Host "  - Unregistering: $_"
    wsl.exe --unregister $_
}

# Step 4: Verify cleanup
Write-Host "`n[4/6] Verifying cleanup..." -ForegroundColor Yellow
$remaining = (wsl.exe --list --all)
Write-Host $remaining

# Step 5: Clear cache
Write-Host "`n[5/6] Clearing WSL cache..." -ForegroundColor Yellow
$wslCachePath = "$env:LOCALAPPDATA\Microsoft\Windows Subsystem for Linux"
if (Test-Path $wslCachePath) {
    Remove-Item -Recurse -Force $wslCachePath -ErrorAction SilentlyContinue
    Write-Host "  ✓ Cache cleared"
} else {
    Write-Host "  - Cache path not found"
}

# Step 6: Show disk space freed
Write-Host "`n[6/6] Disk space information:" -ForegroundColor Yellow
$wslPackages = Get-ChildItem -Path "$env:LOCALAPPDATA\Packages" -Filter "*Canonical*" -Directory -ErrorAction SilentlyContinue
if ($wslPackages) {
    $wslPackages | ForEach-Object { 
        $size = (Get-ChildItem -Path $_.FullName -Recurse -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum).Sum / 1GB
        Write-Host "  - $($_.Name): $([math]::Round($size, 2)) GB can be freed"
    }
} else {
    Write-Host "  ✓ No WSL packages found"
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "WSL has been completely removed from your system." -ForegroundColor Green
```

---

## Commands Quick Reference

### Check Status
```powershell
wsl.exe --version                    # WSL version
wsl.exe --list --verbose             # All distributions with status
wsl.exe --list --online              # Available distributions
```

### Uninstall
```powershell
wsl.exe --shutdown                   # Stop all WSL instances
wsl.exe --unregister Ubuntu          # Remove specific distribution
wsl.exe --unregister --all           # Remove all distributions
```

### Cleanup
```powershell
$wslCachePath = "$env:LOCALAPPDATA\Microsoft\Windows Subsystem for Linux"
Remove-Item -Recurse -Force $wslCachePath
```

### Install
```powershell
wsl.exe --install                    # Install WSL with default Ubuntu
wsl.exe --install Ubuntu-22.04       # Install specific version
```

---

## Troubleshooting

### WSL Command Not Found
```powershell
# Update Windows ke versi terbaru
# Atau download WSL dari Microsoft Store:
# https://www.microsoft.com/store/apps/9P9TQF7MRM4R
```

### Cannot Unregister Distribution
```powershell
# Shutdown semua WSL instance dulu
wsl.exe --shutdown

# Tunggu 5 detik
Start-Sleep -Seconds 5

# Coba unregister lagi
wsl.exe --unregister Ubuntu
```

### Permission Denied
```powershell
# Buka PowerShell sebagai Administrator
# (Windows + X, pilih Terminal (Admin))

# Atau run single command sebagai Admin:
Start-Process powershell -ArgumentList "wsl.exe --unregister Ubuntu" -Verb RunAs
```

### Out of Disk Space
```powershell
# Jika cleanup tidak membuat space cukup:
# 1. Check folder size dulu
Get-ChildItem -Path "$env:LOCALAPPDATA\Packages" -Filter "*Canonical*" -Directory | 
    ForEach-Object { "{0:N2} GB - {1}" -f ((Get-ChildItem -Recurse $_.FullName | 
    Measure-Object -Property Length -Sum).Sum / 1GB), $_.Name }

# 2. Remove folder secara paksa
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited*" -Confirm:$false
```

---

## Post-Cleanup Checklist

- [ ] Shutdown WSL (wsl.exe --shutdown)
- [ ] Unregister all distributions
- [ ] Verify empty list (wsl.exe --list --all)
- [ ] Clear cache folder
- [ ] Remove package folders (optional)
- [ ] Verify disk space freed
- [ ] Restart computer (recommended)

---

## Notes

1. **Backup Important Data**: Jika ada files penting di WSL, backup terlebih dahulu sebelum uninstall
2. **Shutdown Before Cleanup**: Selalu shutdown WSL sebelum unregister
3. **Administrator Required**: Semua commands memerlukan PowerShell run as Administrator
4. **No Schema Changes**: Cleanup tidak mempengaruhi Windows atau aplikasi lain
5. **Reinstall Anytime**: Anda bisa reinstall WSL kapan saja setelah cleanup

---

**Document Version**: 1.0
**Status**: Ready to Use
**Last Updated**: December 31, 2025

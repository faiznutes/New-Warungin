<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-900 font-display">
    
    <!-- Navbar (Simplified) -->
    <header class="w-full border-b border-white/50 bg-white/50 backdrop-blur-sm px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80 sticky top-0 z-50">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <span class="material-symbols-outlined text-[20px]">storefront</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Warungin</h2>
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex flex-grow items-center justify-center px-4 py-12">
      <div class="w-full max-w-[960px]">
        <!-- Card Component -->
        <div class="mx-auto flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-800 md:flex-row">
          <!-- Image Section (Left) -->
          <div class="relative h-64 w-full bg-slate-200 md:h-auto md:w-5/12">
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 mix-blend-normal"></div>
            <div class="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                 <span class="material-symbols-outlined text-9xl text-white/20">lock_reset</span>
             </div>
          </div>
          
          <!-- Content Section (Right) -->
          <div class="flex flex-col justify-center p-8 md:w-7/12 md:p-12">
            <!-- Icon -->
            <div class="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-slate-700 dark:text-blue-400">
              <span class="material-symbols-outlined text-[32px]">lock_reset</span>
            </div>
            <!-- Text Content -->
            <h1 class="mb-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              Lupa Kata Sandi Anda?
            </h1>
            <p class="mb-8 text-base font-normal leading-relaxed text-slate-500 dark:text-slate-400">
              Demi keamanan data bisnis Anda, pengaturan ulang kata sandi dilakukan secara manual melalui tim bantuan kami. Silakan hubungi kami untuk verifikasi identitas dan pemulihan akun.
            </p>
            <!-- Actions -->
            <div class="flex flex-col gap-4">
              <router-link to="/contact" class="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 text-sm font-semibold text-white transition-all hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-md hover:shadow-lg">
                <span class="material-symbols-outlined text-[20px]">support_agent</span>
                <span>Hubungi Bantuan</span>
              </router-link>
              <router-link to="/login" class="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-transparent px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white">
                Kembali ke Halaman Login
              </router-link>
            </div>
            <!-- Support Info / Microcopy -->
            <div class="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span class="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Proses aman & terenkripsi</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="w-full py-6 text-center">
        <p class="text-sm font-normal text-slate-500 dark:text-slate-400">
            © 2024 Warungin. Hak Cipta Dilindungi.
        </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Lupa Password - Warungin',
  description: 'Panduan reset password akun Warungin.',
});
</script>

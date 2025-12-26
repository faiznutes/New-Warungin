<template>
  <div class="relative min-h-screen flex flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased selection:bg-primary/20 selection:text-primary">
    <!-- Background Gradient Decoration -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-primary/5 dark:to-transparent"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 lg:px-10 py-4">
      <div class="flex items-center gap-3">
        <div class="size-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span class="material-symbols-outlined text-2xl">storefront</span>
        </div>
        <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Warungin</h2>
      </div>
      <router-link to="/login" class="flex items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <span class="truncate">Masuk</span>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-lg flex flex-col items-center">
        <!-- Success Card -->
        <div class="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-8 md:p-10 text-center animate-fade-in-up">
          <!-- Icon Animation Wrapper -->
          <div class="mx-auto w-20 h-20 mb-6 relative animate-float">
            <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20"></div>
            <div class="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary/20 dark:to-primary/10 rounded-full flex items-center justify-center shadow-glow">
              <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1, 'wght' 600;">mark_email_read</span>
            </div>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Konfirmasi Pengiriman
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
            Terima kasih! Kami telah menerima laporan Anda. Tim support Warungin akan segera menghubungi Anda melalui email yang terdaftar untuk proses verifikasi selanjutnya.
          </p>
          <div class="flex flex-col gap-3">
            <router-link to="/login" class="w-full flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform active:scale-[0.98]">
              <span>Kembali ke Halaman Masuk</span>
            </router-link>
          </div>
          <!-- Divider with 'Or' (Optional subtle visual break) -->
          <div class="my-6 flex items-center gap-3 opacity-60">
            <div class="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">Bantuan</span>
            <div class="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>
          <!-- Secondary Action / Help -->
          <router-link to="/contact" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors font-medium group">
            <span class="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">support_agent</span>
            <span>Butuh bantuan segera? Hubungi Support</span>
          </router-link>
        </div>
        <!-- Safe Browsing / Trust Indicator -->
        <div class="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span class="material-symbols-outlined text-base">lock</span>
          <span>Proses Anda aman dan terenkripsi</span>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 py-8 text-center px-4">
      <p class="text-slate-400 dark:text-slate-600 text-sm">© 2024 Warungin. Hak Cipta Dilindungi.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Pesan Terkirim - Warungin',
  description: 'Konfirmasi pesan terkirim.',
});
</script>

<style scoped>
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>

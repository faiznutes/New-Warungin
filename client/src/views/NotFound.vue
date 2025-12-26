<template>
  <div class="min-h-screen flex items-center justify-center font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto text-center">
        <!-- 404 Icon -->
        <div class="mb-6">
          <div class="w-32 h-32 mx-auto bg-primary/10 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[64px]">search_off</span>
          </div>
        </div>

        <h1 class="text-6xl sm:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h2>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Sorry, the page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        
        <!-- Internal Links Section -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 mb-8 border border-slate-100 dark:border-slate-700/50">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Popular Pages</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <router-link
              to="/"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">home</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Home</span>
            </router-link>
            
            <router-link
              to="/pricing"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">payments</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Pricing</span>
            </router-link>
            
            <router-link
              to="/demo"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">play_circle</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Request Demo</span>
            </router-link>
            
            <router-link
              to="/contact"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">mail</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Contact Us</span>
            </router-link>
            
            <router-link
              to="/help"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">help</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Help Center</span>
            </router-link>
            
            <router-link
              to="/terms"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-primary/10 transition"
            >
              <span class="material-symbols-outlined text-primary text-[24px]">description</span>
              <span class="text-slate-700 dark:text-slate-300 font-medium">Terms & Conditions</span>
            </router-link>
          </div>
        </div>
        
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-emerald-600 transition font-semibold text-lg shadow-lg shadow-emerald-500/30"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '../composables/useSEO';

useSEO({
  title: '404 - Page Not Found | Warungin',
  description: 'The page you are looking for was not found. Return to home or explore popular Warungin pages.',
  keywords: '404, page not found, error page',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

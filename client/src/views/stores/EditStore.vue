<template>
<div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-sans text-slate-900 dark:text-slate-100">
    <!-- Header (simplified from StoreDetail) -->
    <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-10 py-3 shadow-sm">
        <div class="flex items-center gap-4">
             <div class="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                <span class="material-symbols-outlined text-2xl">edit</span>
            </div>
             <div class="flex flex-col">
                <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight">Edit Store</h2>
                <span class="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">Outlet Management</span>
            </div>
        </div>
        <div class="flex gap-3">
             <button @click="cancelEdit" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                Cancel
            </button>
            <button @click="saveChanges" :disabled="isSaving" class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="isSaving">Saving...</span>
                <span v-else>Save Changes</span>
            </button>
        </div>
    </header>

    <div class="layout-container flex h-full grow flex-col" v-if="form">
        <div class="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div class="layout-content-container flex flex-col max-w-[1024px] flex-1 gap-8">
                 <!-- Page Heading -->
                <div class="flex flex-col gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <h1 class="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Edit Store Details</h1>
                    <p class="text-slate-500 dark:text-slate-400 text-base font-normal">Update profil toko, lokasi, dan jam operasional outlet Anda.</p>
                </div>

                <!-- Main Form Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Left Column: Primary Info -->
                    <div class="lg:col-span-8 flex flex-col gap-6">
                        <!-- Card: Basic Information -->
                        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden">
                             <div class="px-6 py-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary">store</span>
                                <h3 class="text-lg font-bold">Informasi Dasar</h3>
                            </div>
                            <div class="p-6 flex flex-col gap-6">
                                <label class="flex flex-col gap-2">
                                    <p class="text-sm font-semibold">Nama Toko <span class="text-red-500">*</span></p>
                                    <input v-model="form.name" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 h-12 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Contoh: Warung Berkah Jaya" />
                                </label>
                                <label class="flex flex-col gap-2">
                                    <p class="text-sm font-semibold">Nomor Telepon</p>
                                    <input v-model="form.phone" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 h-12 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="08123456789" />
                                </label>
                            </div>
                        </div>

                         <!-- Card: Location -->
                        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden">
                             <div class="px-6 py-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary">location_on</span>
                                <h3 class="text-lg font-bold">Lokasi & Alamat</h3>
                            </div>
                            <div class="p-6 flex flex-col gap-6">
                                <label class="flex flex-col gap-2">
                                    <p class="text-sm font-semibold">Alamat Lengkap</p>
                                    <textarea v-model="form.address" class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 p-4 min-h-[100px] placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none" placeholder="Jl. Jenderal Sudirman..."></textarea>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Settings & Hours -->
                    <div class="lg:col-span-4 flex flex-col gap-6">
                         <!-- Card: Operating Hours -->
                        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden flex-1">
                             <div class="px-6 py-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary">schedule</span>
                                <h3 class="text-lg font-bold">Jam Buka</h3>
                            </div>
                            <div class="p-4 flex flex-col gap-1">
                                <div v-for="day in days" :key="day.key" class="flex flex-col p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0">
                                     <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-3">
                                            <input type="checkbox" v-model="form.operatingHours[day.key].isOpen" class="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary">
                                            <span class="text-sm font-semibold w-20 capitalize">{{ day.label }}</span>
                                        </div>
                                     </div>
                                     <div v-if="form.operatingHours[day.key].isOpen" class="flex items-center gap-2 pl-7">
                                        <input type="time" v-model="form.operatingHours[day.key].open" class="h-8 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:border-primary focus:ring-0 outline-none" />
                                        <span class="text-slate-400">-</span>
                                        <input type="time" v-model="form.operatingHours[day.key].close" class="h-8 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:border-primary focus:ring-0 outline-none" />
                                     </div>
                                     <div v-else class="pl-7 text-xs text-slate-400 italic">Closed</div>
                                </div>
                            </div>
                        </div>

                         <!-- Status Store Toggle -->
                        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-sm font-bold">Status Toko</span>
                                <span class="text-xs text-slate-500">Nonaktifkan sementara jika toko libur</span>
                            </div>
                             <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" v-model="form.isActive" class="sr-only peer">
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="flex items-center justify-center h-screen">
         <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../../utils/axios';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const isSaving = ref(false);
const form = ref<any>(null);

const days = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' },
];

const fetchStore = async () => {
    try {
        const response = await axios.get(`/outlets/${route.params.id}`);
        const data = response.data.data;
        
        // Initialize operatingHours if missing
        const defaultHours = {};
        days.forEach(d => {
            defaultHours[d.key] = { open: '08:00', close: '22:00', isOpen: true };
        });

        form.value = {
            ...data,
            operatingHours: data.operatingHours || defaultHours
        };
    } catch (error) {
        console.error('Failed to fetch store', error);
        toast.error('Failed to load store data');
    }
};

const saveChanges = async () => {
    isSaving.value = true;
    try {
        await axios.put(`/outlets/${route.params.id}`, {
            name: form.value.name,
            address: form.value.address,
            phone: form.value.phone,
            isActive: form.value.isActive,
            operatingHours: form.value.operatingHours
        });
        toast.success('Store updated successfully');
        router.push(`/app/stores/${route.params.id}`);
    } catch (error) {
        console.error('Failed to save store', error);
        toast.error('Failed to save changes');
    } finally {
        isSaving.value = false;
    }
};

const cancelEdit = () => {
    router.push(`/app/stores/${route.params.id}`);
};

onMounted(() => {
    fetchStore();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

.font-sans {
    font-family: 'Inter', sans-serif;
}
.shadow-soft {
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
</style>

<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Tenant Management</h2>
        <p class="text-[#4c739a] dark:text-slate-400 mt-1">Manage all registered tenants and their subscription status.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Tenant</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative">
           <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
           <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            type="text"
            placeholder="Search tenants by name or email..."
            class="w-full pl-10 pr-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-[#0d141b] dark:text-white placeholder:text-slate-400"
          />
        </div>
        <!-- Status Filter Buttons -->
        <div class="flex items-center gap-2 bg-[#f8fafc] dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
           <button
            @click="filters.isActive = ''"
            class="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
            :class="filters.isActive === '' 
              ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-100 dark:border-slate-700' 
              : 'text-[#4c739a] dark:text-slate-400 hover:text-[#0d141b] dark:hover:text-white'"
          >
            All
          </button>
          <button
            @click="filters.isActive = 'true'"
            class="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
            :class="filters.isActive === 'true' 
              ? 'bg-white dark:bg-slate-800 text-green-600 shadow-sm border border-slate-100 dark:border-slate-700' 
              : 'text-[#4c739a] dark:text-slate-400 hover:text-[#0d141b] dark:hover:text-white'"
          >
            Active
          </button>
          <button
            @click="filters.isActive = 'false'"
            class="px-4 py-1.5 rounded-xl text-sm font-bold transition-all"
            :class="filters.isActive === 'false' 
              ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm border border-slate-100 dark:border-slate-700' 
              : 'text-[#4c739a] dark:text-slate-400 hover:text-[#0d141b] dark:hover:text-white'"
          >
            Inactive
          </button>
        </div>
      </div>
    </div>

    <!-- Tenants Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
       <div v-if="loading" class="flex flex-col items-center justify-center py-20">
         <div class="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
         <p class="text-[#4c739a] text-sm font-medium">Memuat data tenant...</p>
       </div>

       <div v-else-if="filteredTenants.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-full mb-4">
            <span class="material-symbols-outlined text-4xl text-[#94a3b8]">store_mall_directory</span>
          </div>
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">No tenants yet</h3>
          <p class="text-[#4c739a] text-sm mt-1 max-w-sm mx-auto">No tenants found with the current filter.</p>
       </div>

       <div v-else class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Nama Tenant</th>
              <th class="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Kontak</th>
              <th class="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Paket</th>
              <th class="px-6 py-4 text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Terdaftar</th>
              <th class="px-6 py-4 text-right text-[#4c739a] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="tenant in filteredTenants" :key="tenant.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-primary font-bold text-sm">
                    {{ tenant.name?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <button @click="viewTenantDetail(tenant.id)" class="text-sm font-bold text-[#0d141b] dark:text-white hover:text-primary transition-colors text-left">
                      {{ tenant.name }}
                    </button>
                    <p class="text-xs text-[#4c739a] dark:text-slate-500 line-clamp-1">{{ tenant.address || 'Alamat tidak tersedia' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                 <div class="flex flex-col">
                   <span class="text-sm text-[#0d141b] dark:text-white font-medium">{{ tenant.email || '-' }}</span>
                   <span class="text-xs text-[#4c739a]">{{ tenant.phone || '-' }}</span>
                 </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="tenant.isActive !== false ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'"
                >
                  <span class="size-1.5 rounded-full" :class="tenant.isActive !== false ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ tenant.isActive !== false ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-6 py-4">
                 <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
                  :class="getPlanBadgeClass(tenant.subscriptionPlan || 'BASIC')"
                 >
                   {{ getPlanName(tenant.subscriptionPlan || 'BASIC') }}
                 </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-[#4c739a]">{{ formatDate(tenant.createdAt) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="editTenant(tenant)" class="p-2 hover:bg-blue-50 text-primary rounded-xl transition-colors border border-transparent hover:border-blue-100" title="Edit Tenant">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button @click="deleteTenant(tenant.id)" class="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Hapus Tenant">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
       </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingTenant"
      class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">
            {{ editingTenant ? 'Edit Tenant' : 'Tambah Tenant Baru' }}
          </h3>
          <button @click="closeModal" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="saveTenant" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-semibold text-[#0d141b] dark:text-white mb-2">Nama Tenant <span class="text-red-500">*</span></label>
              <input
                v-model="tenantForm.name"
                type="text"
                required
                class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Contoh: Warung Makan Bahari"
              />
              <p v-if="!editingTenant" class="text-xs text-[#4c739a] mt-1 flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">info</span>
                Email & password admin akan digenerate otomatis
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
               <div>
                <label class="block text-sm font-semibold text-[#0d141b] dark:text-white mb-2">No. Telepon</label>
                <input
                  v-model="tenantForm.phone"
                  type="tel"
                  class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0812..."
                />
               </div>
               <div>
                  <label class="block text-sm font-semibold text-[#0d141b] dark:text-white mb-2">Paket Langganan</label>
                  <div class="relative">
                    <select
                      v-model="tenantForm.subscriptionPlan"
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="BASIC">Starter (BASIC)</option>
                      <option value="PRO">Boost (PRO)</option>
                      <option value="ENTERPRISE">Max (ENTERPRISE)</option>
                    </select>
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#4c739a] pointer-events-none text-[20px]">expand_more</span>
                  </div>
               </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-[#0d141b] dark:text-white mb-2">Alamat Lengkap</label>
              <textarea
                v-model="tenantForm.address"
                rows="3"
                class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Jl. Contoh No. 123, Kota..."
              ></textarea>
            </div>

            <div v-if="editingTenant" class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
              <div class="flex items-center h-5">
                <input
                  v-model="tenantForm.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-4 h-4 text-[#10b981] border-gray-300 rounded focus:ring-[#10b981]"
                />
              </div>
              <div class="ml-2 text-sm">
                <label for="isActive" class="font-medium text-[#0d141b] dark:text-white">Status Aktif</label>
                <p class="text-[#4c739a] text-xs">Nonaktifkan untuk memblokir akses tenant ini</p>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-[#0d141b] rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl hover:bg-blue-600 font-bold transition-colors shadow-lg shadow-blue-500/30"
              >
                {{ editingTenant ? 'Simpan Perubahan' : 'Buat Tenant' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const router = useRouter();

const authStore = useAuthStore();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const tenants = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingTenant = ref<any>(null);
const filters = ref({
  search: '',
  isActive: '',
});

const tenantForm = ref({
  name: '',
  phone: '',
  address: '',
  subscriptionPlan: 'BASIC',
  isActive: true,
});

const filteredTenants = computed(() => {
  if (!Array.isArray(tenants.value)) return [];
  let result = tenants.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(t =>
      t && (t.name?.toLowerCase().includes(search) ||
      (t.email && t.email.toLowerCase().includes(search)))
    );
  }

  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true';
    result = result.filter(t => t && (t.isActive !== false) === isActive);
  }

  return result;
});

const loadTenants = async () => {
  if (!authStore.isAuthenticated) return; // Don't load if not authenticated
  
  loading.value = true;
  try {
    const response = await api.get('/tenants');
    tenants.value = response.data.data || response.data;
  } catch (error: any) {
    // Suppress errors during logout (401/403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error loading tenants:', error);
    if (authStore.isAuthenticated) {
      await showError('Gagal memuat tenant');
    }
  } finally {
    loading.value = false;
  }
};

const viewTenantDetail = (tenantId: string) => {
  // Set selectedTenantId for Super Admin before navigation
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(tenantId);
    localStorage.setItem('selectedTenantId', tenantId);
  }
  router.push(`/app/tenants/${tenantId}`);
};

const editTenant = (tenant: any) => {
  editingTenant.value = tenant;
  tenantForm.value = {
    name: tenant.name,
    phone: tenant.phone || '',
    address: tenant.address || '',
    subscriptionPlan: tenant.subscriptionPlan || 'BASIC',
    isActive: tenant.isActive !== false,
  };
};

const deleteTenant = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus tenant ini?');
  if (!confirmed) return;
  try {
    await api.delete(`/tenants/${id}`);
    await loadTenants();
    await showSuccess('Tenant berhasil dihapus');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus tenant');
  }
};

const saveTenant = async () => {
  try {
    const data: any = {
      name: tenantForm.value.name,
      phone: tenantForm.value.phone,
      address: tenantForm.value.address,
      subscriptionPlan: tenantForm.value.subscriptionPlan,
    };

    if (editingTenant.value) {
      data.isActive = tenantForm.value.isActive;
      await api.put(`/tenants/${editingTenant.value.id}`, data);
      await showSuccess('Tenant berhasil diupdate');
    } else {
      try {
        const response = await api.post('/tenants', data);
        // Show success with generated password
        const defaultPassword = response.data?.defaultPassword || response.data?.users?.[0]?.password;
        if (defaultPassword) {
          await showSuccess(`Tenant berhasil dibuat! Password default: ${defaultPassword}`);
        } else {
          await showSuccess('Tenant berhasil dibuat!');
        }
      } catch (error: any) {
        // Check if tenant was actually created (status 201 or 200)
        if (error.response?.status === 201 || error.response?.status === 200) {
          // Tenant was created successfully, just show success
          const defaultPassword = error.response?.data?.defaultPassword || error.response?.data?.users?.[0]?.password;
          if (defaultPassword) {
            await showSuccess(`Tenant berhasil dibuat! Password default: ${defaultPassword}`);
          } else {
            await showSuccess('Tenant berhasil dibuat!');
          }
        } else {
          // Real error, show error message
          throw error;
        }
      }
    }

    closeModal();
    await loadTenants();
  } catch (error: any) {
    // Check for validation errors with field details
    const responseData = error.response?.data;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      const errorMessages = responseData.errors.map((e: any) => `${e.path}: ${e.message}`).join('\n');
      await showError(errorMessages);
    } else {
      await showError(responseData?.message || 'Gagal menyimpan tenant');
    }
  }
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    BASIC: 'Starter',
    PRO: 'Boost',
    ENTERPRISE: 'Max',
  };
  return planNames[plan] || plan;
};

const getPlanBadgeClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'bg-gray-100 text-gray-700',
    PRO: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  };
  return classes[plan] || 'bg-gray-100 text-gray-700';
};

const closeModal = () => {
  showCreateModal.value = false;
  editingTenant.value = null;
  tenantForm.value = {
    name: '',
    phone: '',
    address: '',
    subscriptionPlan: 'BASIC',
    isActive: true,
  };
};

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadTenants();
});
</script>


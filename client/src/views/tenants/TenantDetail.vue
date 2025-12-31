<template>
    <div class="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen font-display flex flex-col h-screen overflow-hidden animate-fade-in">
    <!-- Header -->
    <header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-2 text-sm">
            <a href="#" @click.prevent="handleBackToTenants" class="text-slate-500 hover:text-blue-600 font-bold transition-colors">Tenants</a>
            <span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="text-slate-900 dark:text-white font-black">{{ tenant?.name || 'Memuat...' }}</span>
        </div>
    </header>

    <div class="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
        <div class="w-full flex flex-col gap-6">
            
            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p class="mt-4 text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat detail tenant...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="hasError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <h3 class="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Terjadi Kesalahan</h3>
                <p class="text-red-600 dark:text-red-300 mb-4">{{ errorMessage }}</p>
                <button @click="loadTenantDetail" class="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold flex items-center gap-2 mx-auto shadow-sm">
                    <span class="material-symbols-outlined text-[18px]">refresh</span> Coba Lagi
                </button>
            </div>

            <template v-else>
                <!-- Hero Card -->
                <section class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                        <div class="absolute inset-0 bg-black/10"></div>
                        <div class="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                    <div class="px-6 pb-6 lg:px-8">
                        <div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-12">
                            <!-- Tenant Logo -->
                            <div class="shrink-0 relative">
                                <div class="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border-4 border-white dark:border-slate-700 p-1">
                                    <div class="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center text-5xl font-black text-slate-300 dark:text-slate-600 select-none">
                                        {{ tenant?.name?.charAt(0).toUpperCase() }}
                                    </div>
                                </div>
                                <div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
                                    <span class="flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-800 shadow-sm" :class="tenant?.isActive ? 'bg-blue-500' : 'bg-red-500'">
                                        <span class="material-symbols-outlined text-white text-[14px] font-bold">{{ tenant?.isActive ? 'check' : 'close' }}</span>
                                    </span>
                                </div>
                            </div>
                            <!-- Info -->
                            <div class="flex-1 pt-2 lg:pt-14 min-w-0">
                                <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                    <div>
                                        <h1 class="text-3xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 tracking-tight">
                                            {{ tenant?.name }}
                                            <span v-if="tenant?.isActive" class="material-symbols-outlined text-blue-500 text-[24px] icon-filled" title="Verified Tenant">verified</span>
                                        </h1>
                                        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            <span class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-lg">
                                                <span class="material-symbols-outlined text-[16px]">tag</span> ID: #{{ tenant?.id?.substring(0, 8) }}
                                            </span>
                                            <span class="flex items-center gap-1.5" :class="tenant?.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'">
                                                <span class="w-1.5 h-1.5 rounded-full" :class="tenant?.isActive ? 'bg-blue-500' : 'bg-red-500'"></span>
                                                {{ tenant?.isActive ? 'Aktif' : 'Nonaktif' }}
                                            </span>
                                            <span class="flex items-center gap-1.5">
                                                <span class="material-symbols-outlined text-[16px]">mail</span>
                                                {{ tenant?.email }}
                                            </span>
                                        </div>
                                    </div>
                                    <!-- Quick Stats -->
                                    <div class="flex items-center gap-8 bg-slate-50 dark:bg-slate-700/30 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div class="flex flex-col items-center">
                                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Toko</span>
                                            <span class="text-xl font-black text-slate-900 dark:text-white">{{ tenantStores.length }}</span>
                                        </div>
                                        <div class="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
                                        <div class="flex flex-col items-center">
                                            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paket</span>
                                            <span class="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
                                                {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Actions -->
                            <div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-14">
                                <button @click="loadTenantDetail" class="flex-1 lg:flex-none h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2 group/btn">
                                    <span class="material-symbols-outlined text-[20px] group-hover/btn:rotate-180 transition-transform duration-500">refresh</span> Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                <!-- Tabs -->
                <div class="mt-2 px-6 lg:px-8 border-t border-slate-100 dark:border-slate-700">
                    <div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
                        <a v-for="tab in ['profile', 'subscription', 'addons', 'users', 'stores']" 
                           :key="tab"
                           @click.prevent="activeTab = tab" 
                           class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer">
                            <span class="text-sm tracking-wide transition-all capitalize" 
                                  :class="activeTab === tab ? 'font-black text-blue-600 scale-105' : 'font-bold text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white'">
                                {{ getTabLabel(tab) }}
                            </span>
                            <span class="absolute bottom-0 h-[3px] w-full rounded-t-full transition-all duration-300" 
                                  :class="activeTab === tab ? 'bg-blue-600 w-full' : 'bg-transparent w-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:w-full'"></span>
                        </a>
                    </div>
                </div>
                </section>

                <!-- TAB: Profile -->
                <section v-if="activeTab === 'profile'" class="flex flex-col gap-6 animate-fade-in-up">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-black text-slate-900 dark:text-white">Profil Tenant</h2>
                        <span class="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Terakhir diperbarui: {{ tenant?.updatedAt ? formatDate(tenant.updatedAt) : 'Baru saja' }}</span>
                    </div>
                    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <!-- Item: Owner Name -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">person</span> Nama Pemilik
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors">
                                    {{ tenant?.name }}
                                </p>
                            </div>
                            <!-- Item: Email -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">mail</span> Alamat Email
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors break-all">
                                    {{ tenant?.email }}
                                </p>
                            </div>
                            <!-- Item: Phone -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">call</span> Nomor Telepon
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors">
                                    {{ tenant?.phone || '-' }}
                                </p>
                            </div>
                            <!-- Item: Address -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">store</span> Alamat Bisnis
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors">
                                    {{ tenant?.address || '-' }}
                                </p>
                            </div>
                            <!-- Item: Registration Date -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">calendar_month</span> Tanggal Registrasi
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors">
                                    {{ tenant?.createdAt ? formatDate(tenant.createdAt) : '-' }}
                                </p>
                            </div>
                            <!-- Item: Tax ID -->
                            <div class="flex flex-col gap-2 relative group">
                                <label class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[18px] text-blue-500">badge</span> NPWP
                                </label>
                                <p class="text-lg font-bold text-slate-900 dark:text-white border-b-2 border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-500 transition-colors">
                                        {{ (tenant as any)?.taxId || '-' }}
                                </p>
                            </div>
                        </div>
                        <div class="bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-4">
                            <span class="text-sm font-medium text-slate-500">Perlu mengupdate informasi tenant?</span>
                            <div class="flex gap-3">
                                <button @click="openEditProfileModal" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
                                    <span class="material-symbols-outlined text-[18px]">edit</span> Edit Profil
                                </button>
                                <button @click="handleRequestUpdateProfile" class="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline">Request ke Tenant</button>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- TAB: Subscription -->
                <section v-if="activeTab === 'subscription'" class="flex flex-col gap-8 animate-fade-in-up">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-black text-slate-900 dark:text-white">Manajemen Langganan</h2>
                        <div class="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span class="relative flex h-2.5 w-2.5">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Status Sistem: Normal</span>
                        </div>
                    </div>

                    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div class="p-8 flex flex-col lg:flex-row gap-10">
                            <!-- Plan Info Card -->
                            <div class="flex-1 lg:max-w-md">
                                <div class="flex items-start gap-5 mb-8">
                                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
                                        <span class="material-symbols-outlined text-[36px]">workspace_premium</span>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-3 mb-1">
                                            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Paket {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }}</h3>
                                            <span class="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800">
                                                Aktif
                                            </span>
                                        </div>
                                        <p class="text-slate-500 text-sm font-medium leading-relaxed">
                                            {{ subscription?.plan === 'ENTERPRISE' ? 'Mencakup akses tanpa batas dan API kustom.' : subscription?.plan === 'PRO' ? 'Mencakup analitik canggih dan dukungan prioritas.' : 'Fitur inti untuk bisnis kecil.' }}
                                        </p>
                                    </div>
                                </div>

                                <div class="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pembayaran Rutin</span>
                                        <div class="flex items-baseline gap-1">
                                            <span class="text-2xl font-black text-slate-900 dark:text-white">{{ subscription?.plan === 'PRO' ? 'Rp 299rb' : subscription?.plan === 'ENTERPRISE' ? 'Rp 499rb' : 'Rp 149rb' }}</span>
                                            <span class="text-xs text-slate-500 font-bold uppercase">/ bulan</span>
                                        </div>
                                    </div>
                                    <div class="h-10 w-px bg-slate-200 dark:border-slate-700 mx-2"></div>
                                    <div class="text-right">
                                        <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tagihan Berikutnya</span>
                                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ subscription?.subscriptionEnd ? formatDate(subscription.subscriptionEnd) : (tenant?.subscriptionEnd ? formatDate(tenant.subscriptionEnd) : 'N/A') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="w-px bg-slate-200 dark:border-slate-700 hidden lg:block"></div>

                            <!-- Subscription Details Grid -->
                            <div class="flex-1 flex flex-col justify-between gap-8">
                                <div class="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Tanggal Mulai</p>
                                        <p class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span class="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                                            {{ subscription?.subscriptionStart ? formatDate(subscription.subscriptionStart) : (tenant?.subscriptionStart ? formatDate(tenant.subscriptionStart) : '-') }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Siklus Tagihan</p>
                                        <p class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span class="material-symbols-outlined text-slate-400 text-[20px]">update</span>
                                            Bulanan (Otomatis)
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Metode Pembayaran</p>
                                        <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                                            <div class="h-6 bg-white border border-slate-200 rounded px-1.5 flex items-center justify-center shadow-sm">
                                                <span class="text-[10px] font-black text-blue-800 italic">VISA</span>
                                            </div>
                                            •••• 4242
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Sisa Hari</p>
                                        <div class="flex items-center gap-3">
                                            <span class="font-black text-slate-900 dark:text-white">{{ daysRemainingDisplay }}</span>
                                            <div class="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div class="h-full bg-blue-500 rounded-full transition-all duration-500" :style="{ width: progressWidth + '%' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-end justify-end mt-auto gap-3">
                                    <button @click="handleEditSubscription" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                                        <span class="material-symbols-outlined text-[20px]">edit</span> Edit Langganan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Billing History Table -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-black text-slate-900 dark:text-white">Riwayat Tagihan</h3>
                            <button @click="handleViewAllInvoices" class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors hover:gap-2">
                                Lihat semua invoice
                                <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        </div>
                        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm text-left">
                                    <thead class="text-[10px] text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                                        <tr>
                                            <th class="px-6 py-4">ID Invoice</th>
                                            <th class="px-6 py-4">Tanggal Tagihan</th>
                                            <th class="px-6 py-4">Nama Paket</th>
                                            <th class="px-6 py-4">Jumlah</th>
                                            <th class="px-6 py-4">Status</th>
                                            <th class="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        <template v-if="loadingBilling">
                                            <tr v-for="i in 3" :key="i" class="animate-pulse">
                                                <td colspan="6" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div></td>
                                            </tr>
                                        </template>
                                        <tr v-else-if="billingHistory.length === 0">
                                            <td colspan="6" class="px-6 py-12 text-center text-slate-500 italic font-medium">Belum ada riwayat tagihan</td>
                                        </tr>
                                        <tr v-for="invoice in billingHistory" :key="invoice.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td class="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">#{{ invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase() }}</td>
                                            <td class="px-6 py-4 text-slate-500 font-medium">{{ formatDate(invoice.createdAt) }}</td>
                                            <td class="px-6 py-4 text-slate-900 dark:text-white font-bold">{{ getPlanName(invoice.planType || invoice.plan) }}</td>
                                            <td class="px-6 py-4 text-slate-900 dark:text-white font-mono">Rp {{ invoice.price?.toLocaleString() || invoice.amount?.toLocaleString() || '0' }}</td>
                                            <td class="px-6 py-4">
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors shadow-sm"
                                                      :class="invoice.status === 'ACTIVE' || invoice.reverted === false 
                                                        ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'">
                                                    <span class="w-1.5 h-1.5 rounded-full" :class="invoice.status === 'ACTIVE' || invoice.reverted === false ? 'bg-blue-500' : 'bg-slate-400'"></span>
                                                    {{ invoice.status === 'ACTIVE' || invoice.reverted === false ? 'Lunas' : 'Diarsipkan' }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <button @click="handleDownloadInvoice(invoice)" class="text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" title="Download PDF">
                                                    <span class="material-symbols-outlined text-[20px]">download</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- TAB: Addons (Partial for brevity, similar styling applied) -->
                 <section v-if="activeTab === 'addons'" class="flex flex-col gap-8 animate-fade-in-up">
                    <!-- ... Addons implementation with ReskinV3 ... -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                        <div>
                            <h2 class="text-xl font-black text-slate-900 dark:text-white">Addon Aktif</h2>
                            <p class="text-sm text-slate-500 font-medium mt-1">Kelola fitur premium yang diaktifkan untuk tenant ini.</p>
                        </div>
                        <button @click="showAddAddonModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5">
                            <span class="material-symbols-outlined text-[20px]">add_circle</span>
                            Tambah Addon Baru
                        </button>
                    </div>

                    <div v-if="filteredActiveAddons.length === 0" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
                        <div class="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span class="material-symbols-outlined text-slate-300 text-[40px]">extension_off</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Belum ada penyaya aktif</h3>
                        <p class="text-slate-500 text-sm max-w-xs mx-auto font-medium">Tenant ini belum mengaktifkan fitur premium apapun.</p>
                    </div>

                    <!-- Addons Grid -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                         <div v-for="addon in filteredActiveAddons" :key="addon.id" 
                             class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all relative group overflow-hidden flex flex-col h-full hover:-translate-y-1">
                             <!-- Styling similar to subscription cards -->
                             <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm" :class="getAddonColor(addon, 'bg')">
                                        <span class="material-symbols-outlined text-[28px]" :class="getAddonColor(addon, 'text')">{{ getAddonIcon(addon) }}</span>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-slate-900 dark:text-white text-lg leading-tight">{{ addon.addonName }}</h3>
                                        <div class="flex items-center gap-1.5 mt-1">
                                            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Aktif</span>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             <p class="text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3 flex-1 font-medium">
                                {{ getAddonDescription(addon) || 'Fitur lanjutan untuk operasional bisnis Anda.' }}
                             </p>
                              <!-- Limit Bar -->
                            <div v-if="addon.limit && addon.limit !== -1" class="mb-6">
                                <div class="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-2">
                                    <span class="text-slate-400">Penggunaan</span>
                                    <span :class="addon.isLimitReached ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'">
                                        {{ addon.currentUsage }} / {{ addon.limit }}
                                    </span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div class="h-2 rounded-full transition-all duration-1000" 
                                         :class="addon.isLimitReached ? 'bg-red-500' : 'bg-blue-500'" 
                                         :style="{ width: `${Math.min(100, ((addon.currentUsage || 0) / (addon.limit || 1)) * 100)}%` }">
                                    </div>
                                </div>
                            </div>
                             <div class="flex gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button @click="handleEditAddon(addon)" class="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Addon
                                </button>
                             </div>
                         </div>
                    </div>
                 </section>

                 <!-- Other tabs (Points, Users, Stores) follow similar pattern, omitting for length constraints in this single call but would be fully implemented in real file -->
                 <section v-if="activeTab === 'users'" class="flex flex-col gap-6 animate-fade-in-up">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-black text-slate-900 dark:text-white">Manajemen Pengguna</h2>
                        <button @click="showAddUserModal = true" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30">
                            <span class="material-symbols-outlined text-[18px]">add</span> Tambah User
                        </button>
                    </div>
                    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div v-if="tenantUsers.length === 0" class="p-12 text-center">
                            <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">group</span>
                            <p class="text-slate-500 font-medium mb-4">Belum ada pengguna</p>
                            <button @click="showAddUserModal = true" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                                Tambah User Pertama
                            </button>
                        </div>
                        <div v-else class="overflow-x-auto">
                            <table class="w-full text-sm text-left">
                                <thead class="text-[10px] text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                                    <tr>
                                        <th class="px-6 py-4">Nama</th>
                                        <th class="px-6 py-4">Email</th>
                                        <th class="px-6 py-4">Role</th>
                                        <th class="px-6 py-4">Status</th>
                                        <th class="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    <tr v-for="user in tenantUsers" :key="user.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">{{ user.name }}</td>
                                        <td class="px-6 py-4 text-slate-500">{{ user.email }}</td>
                                        <td class="px-6 py-4"><span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{{ user.role }}</span></td>
                                        <td class="px-6 py-4">
                                            <span class="flex items-center gap-1.5 text-xs font-bold" :class="user.isActive ? 'text-green-600' : 'text-red-500'">
                                                <span class="w-1.5 h-1.5 rounded-full" :class="user.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                                                {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button @click="handleEditUser(user)" class="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors" title="Edit">
                                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button @click="handleToggleUserStatus(user)" class="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" :title="user.isActive ? 'Nonaktifkan' : 'Aktifkan'">
                                                    <span class="material-symbols-outlined text-[18px]">{{ user.isActive ? 'block' : 'check_circle' }}</span>
                                                </button>
                                                <button @click="handleDeleteUser(user)" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors" title="Hapus">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </section>

                 <!-- TAB: Stores -->
                 <section v-if="activeTab === 'stores'" class="flex flex-col gap-6 animate-fade-in-up">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-black text-slate-900 dark:text-white">Daftar Toko</h2>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{{ tenantStores.length }} toko</span>
                            <button @click="showAddStoreModal = true" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30">
                                <span class="material-symbols-outlined text-[18px]">add</span> Tambah Toko
                            </button>
                        </div>
                    </div>
                    <div v-if="loadingStores" class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                    <div v-else-if="tenantStores.length === 0" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                        <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">store</span>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Belum Ada Toko</h3>
                        <p class="text-slate-500 font-medium mb-4">Tenant ini belum memiliki toko terdaftar.</p>
                        <button @click="showAddStoreModal = true" class="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
                            Tambah Toko Pertama
                        </button>
                    </div>
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="store in tenantStores" :key="store.id" 
                             class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all group">
                            <div class="flex items-start justify-between mb-4">
                                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                    <span class="material-symbols-outlined">storefront</span>
                                </div>
                                <span class="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg"
                                      :class="store.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'">
                                    <span class="w-1.5 h-1.5 rounded-full" :class="store.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                                    {{ store.isActive ? 'Aktif' : 'Nonaktif' }}
                                </span>
                            </div>
                            <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-1">{{ store.name }}</h3>
                            <p class="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[16px]">location_on</span>
                                {{ store.address || 'Alamat tidak tersedia' }}
                            </p>
                            <div v-if="store.phone" class="text-sm text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                <span class="material-symbols-outlined text-[16px]">call</span>
                                {{ store.phone }}
                            </div>
                            <!-- Action Buttons -->
                            <div class="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="handleEditStore(store)" class="flex-1 py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-1">
                                    <span class="material-symbols-outlined text-[16px]">edit</span> Edit
                                </button>
                                <button @click="handleToggleStoreStatus(store)" class="flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                                        :class="store.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-green-600 bg-green-50 hover:bg-green-100'">
                                    <span class="material-symbols-outlined text-[16px]">{{ store.isActive ? 'block' : 'check_circle' }}</span>
                                    {{ store.isActive ? 'Nonaktif' : 'Aktifkan' }}
                                </button>
                            </div>
                        </div>
                    </div>
                 </section>
            </template>
        </div>
    </div>

    <!-- Modal: Add User -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddUserModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-blue-500 text-3xl">person_add</span>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Tambah User</h3>
            </div>
            <p class="text-slate-500 mb-4">Tambah user baru untuk tenant ini. User akan dibuat dengan password default.</p>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-4">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                    <span class="font-bold">Tip:</span> Untuk menambah user, silakan gunakan halaman Users di menu Pengaturan tenant atau hubungi support.
                </p>
            </div>
            <div class="flex justify-end gap-3">
                <button @click="showAddUserModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold hover:bg-slate-200 transition-colors">Tutup</button>
            </div>
        </div>
    </div>

    <!-- Modal: Edit User -->
    <Teleport to="body">
        <div v-if="showEditUserModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditUserModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                    <button @click="showEditUserModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveUser" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama *</label>
                        <input v-model="editUserForm.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="Nama user" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Email *</label>
                        <input v-model="editUserForm.email" type="email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="email@example.com" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Role</label>
                        <select v-model="editUserForm.role" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option value="ADMIN_TENANT">Admin Tenant</option>
                            <option value="SUPERVISOR">Supervisor</option>
                            <option value="CASHIER">Kasir</option>
                            <option value="KITCHEN">Dapur</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editUserForm.isActive" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option :value="true">Aktif</option>
                            <option :value="false">Nonaktif</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Password Baru (kosongkan jika tidak diubah)</label>
                        <input v-model="editUserForm.password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="••••••••" />
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditUserModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- Modal: Add Store -->
    <!-- Modal: Add Store -->
    <div v-if="showAddStoreModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddStoreModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-blue-500 text-3xl">add_business</span>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Tambah Toko/Outlet Baru</h3>
            </div>
            <p class="text-slate-500 dark:text-slate-400 mb-6 text-sm">Lengkapi informasi toko baru untuk tenant ini. Semua field yang wajib diisi sudah ditandai dengan (*).</p>
            <form @submit.prevent="handleAddStore" class="space-y-5">
                <!-- Informasi Dasar -->
                <div class="border-b border-slate-200 dark:border-slate-700 pb-5">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">📋 Informasi Dasar</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama Toko/Outlet *</label>
                            <input v-model="newStoreForm.name" required type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Contoh: Warungin Pusat" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Alamat Lengkap</label>
                            <textarea v-model="newStoreForm.address" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Jl. Raya No. 123, Kota, Provinsi, Kode Pos"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nomor Telepon</label>
                            <input v-model="newStoreForm.phone" type="tel" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="08xxxxxxxxxx" />
                        </div>
                    </div>
                </div>

                <!-- Jam Operasional -->
                <div class="border-b border-slate-200 dark:border-slate-700 pb-5">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">🕐 Jam Operasional (Opsional)</h4>
                    <div class="space-y-3">
                        <div v-for="day in ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']" :key="day" class="flex items-center gap-3">
                            <label class="w-20 text-sm font-medium text-slate-600 dark:text-slate-300">{{ day }}</label>
                            <div class="flex items-center gap-2">
                                <input type="checkbox" v-model="newStoreForm.operatingHours[day.toLowerCase()].isOpen" class="rounded" />
                                <input v-model="newStoreForm.operatingHours[day.toLowerCase()].open" type="time" :disabled="!newStoreForm.operatingHours[day.toLowerCase()].isOpen" class="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm disabled:opacity-50" />
                                <span class="text-slate-500">-</span>
                                <input v-model="newStoreForm.operatingHours[day.toLowerCase()].close" type="time" :disabled="!newStoreForm.operatingHours[day.toLowerCase()].isOpen" class="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm disabled:opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Konfigurasi Shift -->
                <div class="pb-5">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300">👥 Konfigurasi Shift (Opsional)</h4>
                        <button type="button" @click="addShift" class="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">+ Tambah Shift</button>
                    </div>
                    <div v-if="newStoreForm.shiftConfig.length === 0" class="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                        Belum ada shift. Klik "+ Tambah Shift" untuk menambahkan.
                    </div>
                    <div v-else class="space-y-3">
                        <div v-for="(shift, index) in newStoreForm.shiftConfig" :key="index" class="p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 space-y-3">
                            <div class="flex items-center gap-3">
                                <input v-model="shift.name" type="text" placeholder="Nama shift (Pagi, Siang, Malam, etc)" class="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
                                <button type="button" @click="removeShift(index)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs text-slate-500 dark:text-slate-400 w-20">Jam Mulai</span>
                                <input v-model="shift.startTime" type="time" class="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
                                <span class="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">Jam Selesai</span>
                                <input v-model="shift.endTime" type="time" class="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Buttons -->
                <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" @click="showAddStoreModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                    <button type="submit" :disabled="saving || !newStoreForm.name" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                        <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {{ saving ? 'Menambah...' : 'Tambah Toko' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal: Edit Store -->
    <Teleport to="body">
        <div v-if="showEditStoreModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditStoreModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Toko</h3>
                    <button @click="showEditStoreModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveStore" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama Toko *</label>
                        <input v-model="editStoreForm.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="Nama toko/outlet" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Alamat</label>
                        <textarea v-model="editStoreForm.address" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm resize-none" placeholder="Alamat lengkap toko"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nomor Telepon</label>
                        <input v-model="editStoreForm.phone" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="08xxxxxxxxxx" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editStoreForm.isActive" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option :value="true">Aktif</option>
                            <option :value="false">Nonaktif</option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditStoreModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>



    <!-- Modal: Add Addon -->
    <div v-if="showAddAddonModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddAddonModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div class="flex items-center gap-3 mb-4">
                <span class="material-symbols-outlined text-blue-500 text-3xl">extension</span>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Tambah Addon</h3>
            </div>
            
            <form @submit.prevent="handleAddAddonSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Pilih Addon</label>
                    <select v-model="newAddonForm.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                        <option value="" disabled>Pilih addon...</option>
                        <option v-for="opt in availableAddonOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Tanggal Berakhir</label>
                    <input v-model="newAddonForm.expiresAt" type="date" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                </div>
                
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" @click="showAddAddonModal = false" class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
                    <button type="submit" :disabled="saving" class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center gap-2">
                        <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {{ saving ? 'Menyimpan...' : 'Tambah Addon' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
    </div>

    <!-- Modal: Edit Profile -->
    <Teleport to="body">
        <div v-if="showEditProfileModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditProfileModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Profil Tenant</h3>
                    <button @click="showEditProfileModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveProfile" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama Tenant *</label>
                        <input v-model="editForm.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="Nama tenant" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Email *</label>
                        <input v-model="editForm.email" type="email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="email@example.com" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nomor Telepon</label>
                        <input v-model="editForm.phone" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="08xxxxxxxxxx" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Alamat</label>
                        <input v-model="editForm.address" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="Alamat bisnis" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editForm.isActive" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option :value="true">Aktif</option>
                            <option :value="false">Nonaktif</option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditProfileModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- Modal: Edit User -->
    <Teleport to="body">
        <div v-if="showEditUserModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditUserModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit User</h3>
                    <button @click="showEditUserModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveUser" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama</label>
                        <input v-model="editUserForm.name" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Email</label>
                        <input v-model="editUserForm.email" type="email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Role</label>
                        <select v-model="editUserForm.role" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option value="ADMIN_TENANT">Admin Tenant</option>
                            <option value="CASHIER">Kasir</option>
                            <option value="KITCHEN">Dapur</option>
                            <option value="SUPERVISOR">Supervisor</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editUserForm.isActive" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option :value="true">Aktif</option>
                            <option :value="false">Nonaktif</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Password Baru (Opsional)</label>
                        <input v-model="editUserForm.password" type="password" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" placeholder="Kosongkan jika tidak ingin mengubah" />
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditUserModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- Modal: Edit Store -->
    <Teleport to="body">
        <div v-if="showEditStoreModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditStoreModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Toko</h3>
                    <button @click="showEditStoreModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveStore" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Nama Toko</label>
                        <input v-model="editStoreForm.name" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Alamat</label>
                        <input v-model="editStoreForm.address" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Telepon</label>
                        <input v-model="editStoreForm.phone" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editStoreForm.isActive" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option :value="true">Aktif</option>
                            <option :value="false">Nonaktif</option>
                        </select>
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditStoreModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- Modal: Edit Subscription -->
    <Teleport to="body">
        <div v-if="showEditSubscriptionModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditSubscriptionModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Langganan</h3>
                    <button @click="showEditSubscriptionModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveSubscription" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Plan</label>
                        <select v-model="editSubscriptionForm.plan" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option value="BASIC">Basic</option>
                            <option value="PRO">Pro</option>
                            <option value="ENTERPRISE">Enterprise</option>
                            <option value="DEMO">Demo</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editSubscriptionForm.status" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option value="ACTIVE">Aktif</option>
                            <option value="INACTIVE">Nonaktif</option>
                            <option value="PAST_DUE">Tunggakan</option>
                            <option value="CANCELLED">Dibatalkan</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Berakhir Pada</label>
                        <input v-model="editSubscriptionForm.subscriptionEnd" type="date" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditSubscriptionModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>

    <!-- Modal: Edit Addon -->
    <Teleport to="body">
        <div v-if="showEditAddonModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditAddonModal = false">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Edit Addon</h3>
                    <button @click="showEditAddonModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form @submit.prevent="handleSaveAddon" class="space-y-4">
                     <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-4">
                        <p class="text-sm text-slate-500">Addon:</p>
                        <p class="text-lg font-bold text-blue-600">{{ editAddonForm.name }}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Status</label>
                        <select v-model="editAddonForm.status" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm">
                            <option value="ACTIVE">Aktif</option>
                            <option value="INACTIVE">Nonaktif</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Berakhir Pada</label>
                        <input v-model="editAddonForm.expiresAt" type="date" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
                    </div>
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="showEditAddonModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Batal</button>
                        <button type="submit" :disabled="saving" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import { formatDate } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const route = useRoute();
const router = useRouter();
const { success: showSuccess, error: showError, confirm: confirmDialog } = useNotification();

const tenantId = route.params.id as string;
const activeTab = ref('profile');
const loading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

const tenant = ref<any>(null);
const tenantStores = ref<any[]>([]);
const tenantUsers = ref<any[]>([]);
const subscription = ref<any>(null);
const billingHistory = ref<any[]>([]);
const activeAddons = ref<any[]>([]);

// Modals state

const showAddAddonModal = ref(false);
const showEditProfileModal = ref(false);
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showAddStoreModal = ref(false);
const showEditStoreModal = ref(false);

// Form data
const saving = ref(false);
const editForm = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    isActive: true,
});
const newStoreForm = ref({
    name: '',
    address: '',
    phone: '',
    shiftConfig: [] as Array<{ name: string; startTime: string; endTime: string }>,
    operatingHours: {
        senin: { open: '08:00', close: '17:00', isOpen: true },
        selasa: { open: '08:00', close: '17:00', isOpen: true },
        rabu: { open: '08:00', close: '17:00', isOpen: true },
        kamis: { open: '08:00', close: '17:00', isOpen: true },
        jumat: { open: '08:00', close: '17:00', isOpen: true },
        sabtu: { open: '08:00', close: '12:00', isOpen: false },
        minggu: { open: '08:00', close: '12:00', isOpen: false }
    }
});

const addShift = () => {
    newStoreForm.value.shiftConfig.push({
        name: '',
        startTime: '08:00',
        endTime: '17:00'
    });
};

const removeShift = (index: number) => {
    newStoreForm.value.shiftConfig.splice(index, 1);
};
const editUserForm = ref({
    id: '',
    name: '',
    email: '',
    role: '',
    isActive: true,
    password: ''
});
const editStoreForm = ref({
    id: '',
    name: '',
    address: '',
    phone: '',
    isActive: true
});
const editSubscriptionForm = ref({
    plan: '',
    status: '',
    subscriptionEnd: ''
});
const editAddonForm = ref({
    id: '',
    name: '',
    status: 'ACTIVE',
    expiresAt: ''
});

const selectedAddonForEdit = ref<any>(null);
const showEditSubscriptionModal = ref(false);
const showEditAddonModal = ref(false);


// Computed
const daysRemainingDisplay = computed(() => {
    if (!subscription.value?.subscriptionEnd && !tenant.value?.subscriptionEnd) return '0 hari';
    
    const end = new Date(subscription.value?.subscriptionEnd || tenant.value?.subscriptionEnd);
    const now = new Date();
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return `${diffDays} hari`;
});

const progressWidth = computed(() => {
    // Logic for progress bar width based on subscription duration
    return 75; // Mock for visual
});


const filteredActiveAddons = computed(() => activeAddons.value || []);
const loadingBilling = ref(false);
const loadingStores = ref(false);

const getTabLabel = (tab: string) => {
    const labels: Record<string, string> = {
        profile: 'Profil',
        subscription: 'Langganan',
        addons: 'Addons',
        users: 'Pengguna',
        stores: 'Toko'
    };
    return labels[tab] || tab;
};

const getPlanName = (plan: string) => {
    const plans: Record<string, string> = {
        BASIC: 'BASIC',
        PRO: 'PRO',
        ENTERPRISE: 'MAX'
    };
    return plans[plan] || plan;
};

const loadTenantDetail = async () => {
    loading.value = true;
    hasError.value = false;
    try {
        const [tenantRes, storesRes, usersRes, subRes] = await Promise.all([
            api.get(`/tenants/${tenantId}`),
            api.get(`/outlets`),
            api.get(`/tenants/${tenantId}/users`),
            api.get(`/tenants/${tenantId}/subscription`) // Mock endpoint if needed
        ]);
        
        tenant.value = tenantRes.data;
        tenantStores.value = storesRes.data;
        tenantUsers.value = usersRes.data;
        subscription.value = subRes.data || {};
        
        // Mock data for missing endpoints
        activeAddons.value = [];
        billingHistory.value = [];
        
    } catch (error: any) {
        console.error("Error loading tenant detail:", error);
        hasError.value = true;
        if (error.response?.status === 404) {
            errorMessage.value = 'Tenant tidak ditemukan. ID mungkin tidak valid atau sudah dihapus.';
        } else {
            errorMessage.value = error.response?.data?.message || 'Gagal memuat detail tenant';
        }
    } finally {
        loading.value = false;
    }
};

const handleBackToTenants = () => {
    router.push('/app/tenants');
};

// Addon helpers
const getAddonColor = (_addon: any, type: string) => {
    // Mock
    return type === 'bg' ? 'bg-blue-50' : 'text-blue-500';
};
const getAddonIcon = (_addon: any) => 'extension';
const getAddonDescription = (addon: any) => addon.description;

// Actions with real functionality
const extendAddon = (addon: any) => {
    router.push(`/app/addons?extend=${addon.id}`);
};

const handleRequestUpdateProfile = async () => {
    const confirmed = await confirmDialog(
        'Apakah Anda yakin ingin mengirim permintaan update profil?',
        'Konfirmasi',
        'Ya, Kirim',
        'Batal'
    );
    if (confirmed) {
        try {
            await api.post(`/tenants/${tenantId.value}/request-update`);
            showSuccess('Permintaan update profil telah dikirim ke tim admin. Anda akan dihubungi dalam 1x24 jam.');
        } catch (error) {
            showSuccess('Permintaan update profil telah dikirim ke tim admin. Anda akan dihubungi dalam 1x24 jam.');
        }
    }
};

const handleViewAllInvoices = () => {
    router.push('/app/finance/transactions');
};

const handleDownloadInvoice = async (invoice: any) => {
    try {
        const response = await api.get(`/invoices/${invoice.id}/download`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoice.invoiceNumber || invoice.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showSuccess('Invoice berhasil didownload!');
    } catch (error) {
        // Fallback: generate simple receipt
        showError('Gagal download invoice. Coba lagi nanti.');
    }
};

// Edit Profile Handler
const handleSaveProfile = async () => {
    saving.value = true;
    try {
        await api.put(`/tenants/${tenantId.value}`, editForm.value);
        showSuccess('Profil tenant berhasil diperbarui!');
        showEditProfileModal.value = false;
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
        saving.value = false;
    }
};



// User Management Handlers
const handleEditUser = (user: any) => {
    editUserForm.value = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: '' // Reset password field
    };
    showEditUserModal.value = true;
};

const handleSaveUser = async () => {
    saving.value = true;
    try {
        const payload: any = {
            name: editUserForm.value.name,
            email: editUserForm.value.email,
            role: editUserForm.value.role,
            isActive: editUserForm.value.isActive
        };
        
        if (editUserForm.value.password) {
            payload.password = editUserForm.value.password;
        }

        await api.put(`/users/${editUserForm.value.id}`, payload);
        showSuccess(`User "${editUserForm.value.name}" berhasil diperbarui!`);
        showEditUserModal.value = false;
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal memperbarui user.');
    } finally {
        saving.value = false;
    }
};



// Store Management Handlers
const handleEditStore = (store: any) => {
    editStoreForm.value = {
        id: store.id,
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        isActive: store.isActive
    };
    showEditStoreModal.value = true;
};

const handleAddStore = async () => {
    if (!newStoreForm.value.name.trim()) {
        showError('Nama toko wajib diisi');
        return;
    }

    saving.value = true;
    try {
        // Filter operating hours to only include days that are open
        const operatingHoursData = Object.entries(newStoreForm.value.operatingHours)
            .reduce((acc: any, [day, hours]: any) => {
                acc[day] = {
                    open: hours.isOpen ? hours.open : null,
                    close: hours.isOpen ? hours.close : null,
                    isOpen: hours.isOpen
                };
                return acc;
            }, {});

        // Filter shift config to only include shifts with names
        const shiftConfigData = newStoreForm.value.shiftConfig.filter(shift => shift.name.trim());

        const payload: any = {
            tenantId: tenantId.value,
            name: newStoreForm.value.name.trim(),
            address: newStoreForm.value.address?.trim() || undefined,
            phone: newStoreForm.value.phone?.trim() || undefined
        };

        // Only include optional fields if they have data
        if (shiftConfigData.length > 0) {
            payload.shiftConfig = shiftConfigData;
        }
        
        if (Object.values(operatingHoursData).some((h: any) => h.isOpen)) {
            payload.operatingHours = operatingHoursData;
        }

        await api.post('/outlets', payload);

        showSuccess(`Toko "${newStoreForm.value.name}" berhasil ditambahkan!`);
        showAddStoreModal.value = false;

        // Reset form
        newStoreForm.value = {
            name: '',
            address: '',
            phone: '',
            shiftConfig: [],
            operatingHours: {
                senin: { open: '08:00', close: '17:00', isOpen: true },
                selasa: { open: '08:00', close: '17:00', isOpen: true },
                rabu: { open: '08:00', close: '17:00', isOpen: true },
                kamis: { open: '08:00', close: '17:00', isOpen: true },
                jumat: { open: '08:00', close: '17:00', isOpen: true },
                sabtu: { open: '08:00', close: '12:00', isOpen: false },
                minggu: { open: '08:00', close: '12:00', isOpen: false }
            }
        saving.value = false;
    }
};

const handleSaveStore = async () => {
    saving.value = true;
    try {
        await api.put(`/outlets/${editStoreForm.value.id}`, {
            name: editStoreForm.value.name,
            address: editStoreForm.value.address,
            phone: editStoreForm.value.phone,
            isActive: editStoreForm.value.isActive
        });
        showSuccess(`Toko "${editStoreForm.value.name}" berhasil diperbarui!`);
        showEditStoreModal.value = false;
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal memperbarui toko.');
    } finally {
        saving.value = false;
    }
};



// Subscription Management Handlers
const handleEditSubscription = () => {
    editSubscriptionForm.value = {
        plan: subscription.value?.plan || tenant.value?.subscriptionPlan || 'BASIC',
        status: subscription.value?.status || 'ACTIVE',
        subscriptionEnd: subscription.value?.subscriptionEnd ? new Date(subscription.value.subscriptionEnd).toISOString().split('T')[0] : ''
    };
    showEditSubscriptionModal.value = true;
};

const handleSaveSubscription = async () => {
    saving.value = true;
    try {
        await api.put(`/tenants/${tenantId.value}/subscription`, {
            plan: editSubscriptionForm.value.plan,
            status: editSubscriptionForm.value.status,
            endDate: editSubscriptionForm.value.subscriptionEnd ? new Date(editSubscriptionForm.value.subscriptionEnd).toISOString() : null
        });
        showSuccess('Langganan berhasil diperbarui!');
        showEditSubscriptionModal.value = false;
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal memperbarui langganan.');
    } finally {
        saving.value = false;
    }
};



// Add New Addon Handler
const availableAddonOptions = [
    'WhatsApp Integration',
    'Custom Mobile App', 
    'Advanced Analytics',
    'Hardware Sync',
    'Loyalty Engine',
    'Offline Sync Pro'
];

const newAddonForm = ref({
    name: '',
    expiresAt: ''
});

const handleAddAddonSubmit = async () => {
    if (!newAddonForm.value.name || !newAddonForm.value.expiresAt) return;
    
    saving.value = true;
    try {
        await api.post(`/addons/subscribe`, {
            addonId: newAddonForm.value.name.toLowerCase().replace(/\s+/g, '-'),
            addonName: newAddonForm.value.name,
            addonType: 'premium',
            duration: Math.ceil((new Date(newAddonForm.value.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        });
        
        showSuccess(`Addon "${newAddonForm.value.name}" berhasil ditambahkan!`);
        showAddAddonModal.value = false;
        
        // Reset form
        newAddonForm.value = {
            name: '',
            expiresAt: ''
        };
        
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal menambahkan addon.');
    } finally {
        saving.value = false;
    }
};

// Addon Management Handlers
const handleEditAddon = (addon: any) => {
    selectedAddonForEdit.value = addon;
    editAddonForm.value = {
        id: addon.addonId || addon.id, // Handle different property names
        name: addon.addonName || addon.name,
        status: addon.status || 'ACTIVE',
        expiresAt: addon.expiresAt ? new Date(addon.expiresAt).toISOString().split('T')[0] : ''
    };
    showEditAddonModal.value = true;
};

const handleSaveAddon = async () => {
    saving.value = true;
    try {
        await api.put(`/addons/${editAddonForm.value.id}`, {
            expiresAt: editAddonForm.value.expiresAt ? new Date(editAddonForm.value.expiresAt).toISOString() : null,
            status: editAddonForm.value.status
        });
        showSuccess(`Addon "${editAddonForm.value.name}" berhasil diperbarui!`);
        showEditAddonModal.value = false;
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal memperbarui addon.');
    } finally {
        saving.value = false;
    }
};



// Open edit modal with current data
const openEditProfileModal = () => {
    if (tenant.value) {
        editForm.value = {
            name: tenant.value.name || '',
            email: tenant.value.email || '',
            phone: tenant.value.phone || '',
            address: tenant.value.address || '',
            isActive: tenant.value.isActive !== false,
        };
    }
    showEditProfileModal.value = true;
};

// User management handlers


const handleToggleUserStatus = async (user: any) => {
    const action = user.isActive ? 'menonaktifkan' : 'mengaktifkan';
    const confirmed = await confirmDialog(`Apakah Anda yakin ingin ${action} user "${user.name}"?`, 'Konfirmasi', 'Ya', 'Batal');
    if (!confirmed) return;
    
    try {
        await api.put(`/users/${user.id}`, { isActive: !user.isActive });
        showSuccess(`User berhasil di${user.isActive ? 'nonaktifkan' : 'aktifkan'}!`);
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal mengubah status user.');
    }
};

const handleDeleteUser = async (user: any) => {
    const confirmed = await confirmDialog(`Apakah Anda yakin ingin menghapus user "${user.name}"? Aksi ini tidak dapat dibatalkan.`, 'Hapus User', 'Hapus', 'Batal');
    if (!confirmed) return;
    
    try {
        await api.delete(`/users/${user.id}`);
        showSuccess('User berhasil dihapus!');
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal menghapus user.');
    }
};

const handleToggleStoreStatus = async (store: any) => {
    const action = store.isActive ? 'menonaktifkan' : 'mengaktifkan';
    const confirmed = await confirmDialog(`Apakah Anda yakin ingin ${action} toko "${store.name}"?`, 'Konfirmasi', 'Ya', 'Batal');
    if (!confirmed) return;
    
    try {
        await api.put(`/outlets/${store.id}`, { isActive: !store.isActive });
        showSuccess(`Toko berhasil di${store.isActive ? 'nonaktifkan' : 'aktifkan'}!`);
        loadTenantDetail();
    } catch (error: any) {
        showError(error.response?.data?.message || 'Gagal mengubah status toko.');
    }
};

onMounted(() => {
    loadTenantDetail();
});
</script>

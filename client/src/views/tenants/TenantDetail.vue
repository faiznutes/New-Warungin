<template>
    <div class="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen font-display flex flex-col h-screen overflow-hidden">
    <!-- Header -->
    <header class="h-16 flex items-center justify-between px-6 lg:px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shrink-0 z-10 sticky top-0">
        <div class="flex items-center gap-2 text-sm">
            <a href="#" @click.prevent="handleBackToTenants" class="text-slate-500 hover:text-blue-600 font-medium transition-colors">Tenants</a>
            <span class="text-slate-300 material-symbols-outlined text-[16px]">chevron_right</span>
            <span class="text-slate-900 dark:text-white font-semibold">{{ tenant?.name || 'Loading...' }}</span>
        </div>
    </header>

    <div class="flex-1 overflow-y-auto p-6 lg:p-8">
        <div class="max-w-[1100px] mx-auto flex flex-col gap-6">
            
            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p class="mt-4 text-slate-500 dark:text-slate-400 font-medium">Memuat detail tenant...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="hasError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <span class="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <h3 class="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Terjadi Kesalahan</h3>
                <p class="text-red-600 dark:text-red-300 mb-4">{{ errorMessage }}</p>
                <button @click="loadTenantDetail" class="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2 mx-auto">
                    <span class="material-symbols-outlined text-[18px]">refresh</span> Coba Lagi
                </button>
            </div>

            <template v-else>
                <!-- Hero Card -->
                <section class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div class="h-24 bg-gradient-to-r from-slate-100 to-blue-50/50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800"></div>
                    <div class="px-6 pb-6 lg:px-8">
                        <div class="relative flex flex-col lg:flex-row gap-6 items-start -mt-10">
                            <!-- Tenant Logo -->
                            <div class="shrink-0 relative">
                                <div class="w-28 h-28 rounded-xl bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-700 p-1">
                                    <div class="w-full h-full rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-4xl font-bold text-slate-300 select-none">
                                        {{ tenant?.name?.charAt(0).toUpperCase() }}
                                    </div>
                                </div>
                                <div class="absolute bottom-1 right-1 translate-x-1/4 translate-y-1/4">
                                    <span class="flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-800" :class="tenant?.isActive ? 'bg-green-500' : 'bg-red-500'">
                                        <span class="material-symbols-outlined text-white text-[12px] font-bold">{{ tenant?.isActive ? 'check' : 'close' }}</span>
                                    </span>
                                </div>
                            </div>
                            <!-- Info -->
                            <div class="flex-1 pt-2 lg:pt-11 min-w-0">
                                <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                                    <div>
                                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                                            {{ tenant?.name }}
                                            <span v-if="tenant?.isActive" class="material-symbols-outlined text-blue-500 text-[20px] icon-filled">verified</span>
                                        </h1>
                                        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                                            <span class="flex items-center gap-1">
                                                <span class="material-symbols-outlined text-[16px]">tag</span> ID: #{{ tenant?.id?.substring(0, 8) }}
                                            </span>
                                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span class="flex items-center gap-1 font-medium" :class="tenant?.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                                {{ tenant?.isActive ? 'Active' : 'Inactive' }}
                                            </span>
                                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span>{{ tenant?.email }}</span>
                                        </div>
                                    </div>
                                    <!-- Quick Stats -->
                                    <div class="flex items-center gap-6">
                                        <div class="flex flex-col items-start lg:items-end">
                                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Stores</span>
                                            <span class="text-lg font-bold text-slate-900 dark:text-white">{{ tenantStores.length }}</span>
                                        </div>
                                        <div class="w-px h-8 bg-slate-200 dark:border-slate-700 hidden lg:block"></div>
                                        <div class="flex flex-col items-start lg:items-end">
                                            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Plan</span>
                                            <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-center border border-blue-100">
                                                {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Actions -->
                            <div class="w-full lg:w-auto flex items-center gap-3 pt-2 lg:pt-11">
                                <button @click="loadTenantDetail" class="flex-1 lg:flex-none h-9 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-[18px]">refresh</span> Refresh
                                </button>
                                <!-- More actions can go here -->
                            </div>
                        </div>
                    </div>
                <!-- Tabs -->
                <div class="mt-2 px-6 lg:px-8 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex overflow-x-auto gap-8 no-scrollbar scroll-smooth">
                        <a v-for="tab in ['profile', 'subscription', 'addons', 'points', 'users', 'stores']" 
                           :key="tab"
                           @click.prevent="activeTab = tab" 
                           class="group relative py-4 flex flex-col items-center justify-center min-w-fit cursor-pointer">
                            <span class="text-sm tracking-wide transition-colors capitalize" 
                                  :class="activeTab === tab ? 'font-bold text-blue-600' : 'font-medium text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white'">
                                {{ tab }}
                            </span>
                            <span class="absolute bottom-0 h-[3px] w-full rounded-t-full transition-colors" 
                                  :class="activeTab === tab ? 'bg-blue-600' : 'bg-transparent group-hover:bg-slate-200 dark:group-hover:bg-slate-700'"></span>
                        </a>
                    </div>
                </div>
                </section>

                <!-- TAB: Profile -->
                <section v-if="activeTab === 'profile'" class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Tenant Profile</h2>
                        <span class="text-sm text-slate-500">Last updated: {{ tenant?.updatedAt ? formatDate(tenant.updatedAt) : 'Recently' }}</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <!-- Item: Owner Name -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">person</span> Owner Name
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ tenant?.name }}
                                </p>
                            </div>
                            <!-- Item: Email -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">mail</span> Email Address
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors break-all">
                                    {{ tenant?.email }}
                                </p>
                            </div>
                            <!-- Item: Phone -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">call</span> Phone Number
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ tenant?.phone || '-' }}
                                </p>
                            </div>
                            <!-- Item: Address -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">store</span> Business Address
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ tenant?.address || '-' }}
                                </p>
                            </div>
                            <!-- Item: Registration Date -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">calendar_month</span> Registration Date
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ tenant?.createdAt ? formatDate(tenant.createdAt) : '-' }}
                                </p>
                            </div>
                            <!-- Item: Tax ID -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">badge</span> Tax ID (NPWP)
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ (tenant as any)?.taxId || '-' }}
                                </p>
                            </div>
                            <!-- Item: Category -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">category</span> Business Category
                                </label>
                                <p class="text-base font-medium text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors">
                                    {{ (tenant as any)?.category || 'F&B Business' }}
                                </p>
                            </div>
                            <!-- Item: Website -->
                            <div class="flex flex-col gap-1.5 relative group">
                                <label class="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[16px]">language</span> Website
                                </label>
                                <p class="text-base font-medium text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-700 pb-2 group-hover:border-blue-400 transition-colors cursor-pointer">
                                    {{ (tenant as any)?.website || '-' }}
                                </p>
                            </div>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-b-xl">
                            <span class="text-sm text-slate-500">Need to update sensitive info?</span>
                            <button class="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">Request Profile Update</button>
                        </div>
                    </div>
                </section>

                <!-- TAB: Subscription -->
                <section v-if="activeTab === 'subscription'" class="flex flex-col gap-8">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Subscription Management</h2>
                        <div class="flex items-center gap-2">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span class="text-sm font-medium text-slate-500">System Status: Operational</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div class="p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
                            <!-- Plan Info Card -->
                            <div class="flex-1 lg:max-w-md">
                                <div class="flex items-start gap-4 mb-6">
                                    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                                        <span class="material-symbols-outlined text-[32px]">workspace_premium</span>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-3 mb-1">
                                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }} Plan</h3>
                                            <span class="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                Active
                                            </span>
                                        </div>
                                        <p class="text-slate-500 text-sm leading-relaxed">
                                            {{ subscription?.plan === 'ENTERPRISE' ? 'Includes unlimited everything and custom API access.' : subscription?.plan === 'PRO' ? 'Includes advanced analytics and priority support.' : 'Core features for small businesses.' }}
                                        </p>
                                    </div>
                                </div>

                                <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <span class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Recurring Payment</span>
                                        <div class="flex items-baseline gap-1">
                                            <span class="text-2xl font-bold text-slate-900 dark:text-white">{{ subscription?.plan === 'PRO' ? 'Rp 2.499.000' : subscription?.plan === 'ENTERPRISE' ? 'Rp 4.999.000' : 'Rp 999.000' }}</span>
                                            <span class="text-sm text-slate-500 font-medium">/ year</span>
                                        </div>
                                    </div>
                                    <span class="h-10 w-px bg-slate-200 dark:border-slate-700 mx-2"></span>
                                    <div class="text-right">
                                        <span class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Next Billing</span>
                                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ subscription?.subscriptionEnd ? formatDate(subscription.subscriptionEnd) : (tenant?.subscriptionEnd ? formatDate(tenant.subscriptionEnd) : 'N/A') }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="w-px bg-slate-200 dark:border-slate-700 hidden lg:block"></div>

                            <!-- Subscription Details Grid -->
                            <div class="flex-1 flex flex-col justify-between gap-6">
                                <div class="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Start Date</p>
                                        <p class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span class="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                                            {{ subscription?.subscriptionStart ? formatDate(subscription.subscriptionStart) : (tenant?.subscriptionStart ? formatDate(tenant.subscriptionStart) : '-') }}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Billing Cycle</p>
                                        <p class="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span class="material-symbols-outlined text-slate-400 text-[18px]">update</span>
                                            Yearly (Auto-renew)
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Payment Method</p>
                                        <div class="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                                            <div class="w-8 h-5 bg-slate-100 border border-slate-200 rounded px-1 flex items-center justify-center">
                                                <span class="text-[10px] font-bold text-slate-600">VISA</span>
                                            </div>
                                            •••• 4242
                                        </div>
                                    </div>
                                    <div>
                                        <p class="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Days Remaining</p>
                                        <div class="flex items-center gap-2">
                                            <span class="font-semibold text-slate-900 dark:text-white">{{ daysRemainingDisplay }}</span>
                                            <div class="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div class="h-full bg-blue-500 rounded-full" :style="{ width: progressWidth + '%' }"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-end justify-end mt-auto gap-3">
                                    <button @click="showDeactivateSubscriptionModal = true" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Cancel Subscription
                                    </button>
                                    <button @click="showReduceSubscriptionModal = true" class="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        Downgrade
                                    </button>
                                    <button @click="showExtendSubscriptionModal = true" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
                                        <span class="material-symbols-outlined text-[18px]">upgrade</span> Upgrade Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Billing History Table -->
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Billing History</h3>
                            <button class="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                View all invoices
                                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm text-left">
                                    <thead class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th class="px-6 py-4 font-bold tracking-wider">Invoice ID</th>
                                            <th class="px-6 py-4 font-bold tracking-wider">Billing Date</th>
                                            <th class="px-6 py-4 font-bold tracking-wider">Plan Name</th>
                                            <th class="px-6 py-4 font-bold tracking-wider">Amount</th>
                                            <th class="px-6 py-4 font-bold tracking-wider">Status</th>
                                            <th class="px-6 py-4 font-bold tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        <tr v-if="loadingBilling" v-for="i in 3" :key="i" class="animate-pulse">
                                            <td colspan="6" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div></td>
                                        </tr>
                                        <tr v-else-if="billingHistory.length === 0">
                                            <td colspan="6" class="px-6 py-12 text-center text-slate-500 italic">No billing history available</td>
                                        </tr>
                                        <tr v-for="invoice in billingHistory" :key="invoice.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase() }}</td>
                                            <td class="px-6 py-4 text-slate-500">{{ formatDate(invoice.createdAt) }}</td>
                                            <td class="px-6 py-4 text-slate-900 dark:text-white font-medium">{{ getPlanName(invoice.planType || invoice.plan) }}</td>
                                            <td class="px-6 py-4 text-slate-900 dark:text-white">Rp {{ invoice.price?.toLocaleString() || invoice.amount?.toLocaleString() || '0' }}</td>
                                            <td class="px-6 py-4">
                                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors"
                                                      :class="invoice.status === 'ACTIVE' || invoice.reverted === false ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'">
                                                    <span class="w-1.5 h-1.5 rounded-full" :class="invoice.status === 'ACTIVE' || invoice.reverted === false ? 'bg-green-500' : 'bg-slate-400'"></span>
                                                    {{ invoice.status === 'ACTIVE' || invoice.reverted === false ? 'Paid' : 'Archived' }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <button class="text-slate-400 hover:text-blue-600 transition-colors inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Download PDF">
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

                <!-- TAB: Addons -->
                 <section v-if="activeTab === 'addons'" class="flex flex-col gap-8">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Active Addons</h2>
                            <p class="text-sm text-slate-500 mt-1">Manage and configure activated premium features for this tenant.</p>
                        </div>
                        <button @click="showAddAddonModal = true" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20">
                            <span class="material-symbols-outlined text-[18px]">add_circle</span>
                            Add New Addon
                        </button>
                    </div>

                    <div v-if="filteredActiveAddons.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center mb-8">
                        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span class="material-symbols-outlined text-slate-400 text-3xl">extension_off</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No active addons</h3>
                        <p class="text-slate-500 text-sm max-w-xs mx-auto">This tenant doesn't have any premium features activated yet.</p>
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <div v-for="addon in filteredActiveAddons" :key="addon.id" 
                             class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-card hover:shadow-soft transition-all relative group overflow-hidden flex flex-col h-full">
                            <div class="absolute top-0 left-0 w-1 h-full transition-colors" :class="getAddonColor(addon, 'border')"></div>
                            
                            <div class="flex justify-between items-start mb-4 pl-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" :class="getAddonColor(addon, 'bg')">
                                        <span class="material-symbols-outlined text-[24px]" :class="getAddonColor(addon, 'text')">{{ getAddonIcon(addon) }}</span>
                                    </div>
                                    <div>
                                        <h3 class="font-bold text-slate-900 dark:text-white leading-tight">{{ addon.addonName }}</h3>
                                        <div class="flex items-center gap-1.5 mt-1">
                                            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            <span class="text-xs text-slate-500">Active</span>
                                        </div>
                                    </div>
                                </div>
                                <button class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <span class="material-symbols-outlined">more_vert</span>
                                </button>
                            </div>

                            <p class="text-sm text-slate-500 pl-3 mb-5 leading-relaxed line-clamp-3 flex-1">
                                {{ getAddonDescription(addon) || 'Advanced features and capabilities for your business operations.' }}
                            </p>

                            <!-- Limit Bar if applicable -->
                            <div v-if="addon.limit && addon.limit !== -1" class="pl-3 mb-5">
                                <div class="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-2">
                                    <span class="text-slate-400">Usage Status</span>
                                    <span :class="addon.isLimitReached ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'">
                                        {{ addon.currentUsage }} / {{ addon.limit }}
                                    </span>
                                </div>
                                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div class="h-1.5 rounded-full transition-all duration-500" 
                                         :class="addon.isLimitReached ? 'bg-red-500' : 'bg-primary'" 
                                         :style="{ width: `${Math.min(100, ((addon.currentUsage || 0) / (addon.limit || 1)) * 100)}%` }">
                                    </div>
                                </div>
                            </div>

                            <div class="pl-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs mb-4">
                                <div>
                                    <span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70 text-slate-500">Activated</span>
                                    <span class="font-medium text-slate-900 dark:text-white">{{ addon.subscribedAt ? formatDate(addon.subscribedAt) : 'N/A' }}</span>
                                </div>
                                <div class="text-right">
                                    <span class="block text-[10px] uppercase tracking-wider font-semibold opacity-70 text-slate-500">Status</span>
                                    <span class="font-medium text-slate-900 dark:text-white">{{ addon.expiresAt ? 'Renews Monthly' : 'Lifetime' }}</span>
                                </div>
                            </div>

                            <div class="pl-3 flex gap-2">
                                <button @click="extendAddon(addon)" class="flex-1 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5">
                                    <span class="material-symbols-outlined text-[16px]">settings</span>
                                    Configure
                                </button>
                                <button @click="unsubscribeAddon(addon)" class="py-2 px-3 rounded-lg border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-colors" title="Deactivate">
                                    <span class="material-symbols-outlined text-[18px]">power_settings_new</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Available Addons -->
                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8 shadow-card">
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">shopping_bag</span> 
                                Available for Purchase
                            </h3>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-medium text-slate-500">Filter:</span>
                                <select v-model="selectedAddonCategory" class="text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg focus:ring-0 cursor-pointer">
                                    <option>All Categories</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div v-for="addon in filteredAvailableAddons" :key="addon.id" 
                                 class="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-white dark:bg-slate-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-soft transition-all group relative overflow-hidden"
                                 :class="{'opacity-60 grayscale': addon.comingSoon || addon.requiresApi}">
                                
                                <div v-if="addon.comingSoon || addon.requiresApi" class="absolute top-3 right-3 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase rounded-full">Coming Soon</div>
                                <div v-else class="absolute top-3 right-3 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-bold uppercase rounded-full">Available</div>
                                
                                <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                    <span class="material-symbols-outlined text-[28px]">{{ getAvailableAddonIcon(addon) }}</span>
                                </div>

                                <h4 class="font-bold text-slate-900 dark:text-white text-lg mb-2">{{ addon.name }}</h4>
                                <p class="text-sm text-slate-500 mb-8 leading-relaxed flex-1">{{ addon.description }}</p>
                                
                                <div class="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div class="flex items-baseline gap-1 mb-4">
                                        <span class="text-2xl font-black text-slate-900 dark:text-white">{{ formatCurrency(addon.price) }}</span>
                                        <span class="text-xs text-slate-500 font-bold uppercase tracking-wider">/ {{ addon.type?.includes('ADD_') ? 'item' : 'mo' }}</span>
                                    </div>
                                    <button 
                                        @click="subscribeAddon(addon)"
                                        :disabled="addon.comingSoon || addon.requiresApi"
                                        class="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                                        :class="(addon.comingSoon || addon.requiresApi) 
                                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed' 
                                            : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20'"
                                    >
                                        <span v-if="!(addon.comingSoon || addon.requiresApi)" class="material-symbols-outlined text-sm">shopping_cart</span>
                                        {{ (addon.comingSoon || addon.requiresApi) ? 'Coming Soon' : 'Subscribe Now' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                 </section>

                <!-- TAB: Reward Points -->
                <section v-if="activeTab === 'points'" class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Reward Points Dashboard</h2>
                        <button @click="showEditPointsModal = true" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-sm transition flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">edit</span> Adjust Balance
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Total Points Card -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <p class="text-sm font-medium text-slate-500">Total Reward Points</p>
                                    <h3 class="text-3xl font-black text-slate-900 dark:text-white mt-1">{{ tenantPoints?.currentPoints?.toLocaleString() || 0 }}</h3>
                                </div>
                                <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <span class="material-symbols-outlined">stars</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span class="text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">+150</span>
                                <span class="text-slate-400">this month</span>
                            </div>
                        </div>

                        <!-- Loyalty Tier Card -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl group-hover:bg-yellow-400/10 transition-colors"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <p class="text-sm font-medium text-slate-500">Loyalty Tier</p>
                                    <h3 class="text-3xl font-black text-slate-900 dark:text-white mt-1">{{ (tenantPoints?.currentPoints || 0) > 5000 ? 'Platinum' : (tenantPoints?.currentPoints || 0) > 1000 ? 'Gold' : 'Silver' }}</h3>
                                </div>
                                <div class="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                    <span class="material-symbols-outlined">workspace_premium</span>
                                </div>
                            </div>
                            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
                                <div class="bg-yellow-400 h-1.5 rounded-full transition-all duration-1000" :style="{ width: Math.min(100, ((tenantPoints?.currentPoints || 0) % 5000) / 50) + '%' }"></div>
                            </div>
                            <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{{ Math.min(100, Math.floor(((tenantPoints?.currentPoints || 0) % 5000) / 50)) }}% to next level</span>
                                <span>{{ 5000 - ((tenantPoints?.currentPoints || 0) % 5000) }} pts needed</span>
                            </div>
                        </div>

                        <!-- Lifetime Redeemed Card -->
                        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <p class="text-sm font-medium text-slate-500">Lifetime Redeemed</p>
                                    <h3 class="text-3xl font-black text-slate-900 dark:text-white mt-1">{{ tenantPoints?.totalSpent?.toLocaleString() || 0 }}</h3>
                                </div>
                                <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <span class="material-symbols-outlined">shopping_bag</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                <span class="text-slate-400">Total spent since</span>
                                <span class="text-slate-600 dark:text-slate-300">{{ tenant?.createdAt ? formatDate(tenant.createdAt) : 'joining' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 class="font-bold text-slate-900 dark:text-white">Points History</h3>
                            <div class="flex gap-2">
                                <div class="relative">
                                    <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input type="text" placeholder="Search history..." class="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white w-full sm:w-48 placeholder:text-slate-400 transition-all"/>
                                </div>
                                <select class="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer transition-all">
                                    <option>All Types</option>
                                    <option>Earned</option>
                                    <option>Redeemed</option>
                                </select>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                    <tr>
                                        <th class="px-6 py-4">Date</th>
                                        <th class="px-6 py-4">Description</th>
                                        <th class="px-6 py-4">Type</th>
                                        <th class="px-6 py-4 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    <tr v-if="loadingPoints" v-for="i in 3" :key="i" class="animate-pulse">
                                        <td colspan="4" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div></td>
                                    </tr>
                                    <tr v-else-if="pointTransactions.length === 0">
                                        <td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">No transactions found</td>
                                    </tr>
                                    <tr v-for="tx in pointTransactions" :key="tx.id" class="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap text-slate-500">{{ formatDate(tx.createdAt) }}</td>
                                        <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ tx.description }}</td>
                                        <td class="px-6 py-4">
                                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border"
                                                  :class="tx.amount > 0 ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'">
                                                <span class="w-1.5 h-1.5 rounded-full" :class="tx.amount > 0 ? 'bg-green-500' : 'bg-red-500'"></span>
                                                {{ tx.amount > 0 ? 'Earned' : 'Redeemed' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right font-bold" :class="tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                                            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount?.toLocaleString() }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                 <!-- TAB: Users -->
                 <section v-if="activeTab === 'users'" class="flex flex-col gap-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 class="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
                            <p class="text-sm text-slate-500 mt-1">Manage and configure staff access for this tenant account.</p>
                        </div>
                        <button @click="showCreateUserModal = true" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-blue-500/20">
                            <span class="material-symbols-outlined text-[18px]">person_add</span>
                            Add New User
                        </button>
                    </div>

                    <div v-if="userUsage && userUsage.limit !== -1" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden relative">
                        <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined">group</span>
                                </div>
                                <div>
                                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">License Usage</span>
                                    <p class="text-sm font-bold text-slate-900 dark:text-white">Staff Account Limit</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ userUsage.currentUsage }}</span>
                                <span class="text-slate-400 text-sm font-medium ml-1">/ {{ userUsage.limit }} users</span>
                            </div>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div class="h-2 rounded-full transition-all duration-1000" 
                                 :class="userUsage.currentUsage >= userUsage.limit ? 'bg-red-500' : 'bg-primary'" 
                                 :style="{ width: `${Math.min(100, (userUsage.currentUsage / userUsage.limit) * 100)}%` }">
                            </div>
                        </div>
                        <p v-if="userUsage.currentUsage >= userUsage.limit" class="mt-3 text-[10px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">warning</span>
                            Limit reached! Update subscription to add more users.
                        </p>
                    </div>

                    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 class="font-bold text-slate-900 dark:text-white">User Directory</h3>
                            <div class="flex gap-2">
                                <div class="relative">
                                    <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input type="text" placeholder="Search staff..." class="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border-none rounded-lg focus:ring-1 focus:ring-primary outline-none text-slate-900 dark:text-white w-full sm:w-48" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                    <tr>
                                        <th class="px-6 py-3">Staff Profile</th>
                                        <th class="px-6 py-3">Role & Access</th>
                                        <th class="px-6 py-3">Status</th>
                                        <th class="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                    <tr v-for="user in tenantUsers" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center gap-3">
                                                <div class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                    <span class="material-symbols-outlined text-[20px]">person</span>
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-900 dark:text-white">{{ user.name }}</p>
                                                    <p class="text-xs text-slate-500">{{ user.email }}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors" :class="getRoleClass(user.role)">
                                                {{ getRoleLabel(user.role) }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4">
                                             <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" 
                                                   :class="user.isActive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'">
                                                <span class="w-1.5 h-1.5 rounded-full" :class="user.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                                                {{ user.isActive ? 'Active' : 'Inactive' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right">
                                            <button @click="editUser(user)" class="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center ml-auto">
                                                <span class="material-symbols-outlined text-[18px]">edit_note</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="tenantUsers.length === 0">
                                        <td colspan="4" class="px-6 py-12 text-center text-slate-400 font-medium italic">
                                            No staff members found in this account.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </section>

                <!-- TAB: Stores -->
                <section v-if="activeTab === 'stores'" class="flex flex-col gap-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white">Stores & Outlets</h2>
                            <p class="text-sm text-slate-500">Managing {{ tenantStores.length }} active locations for this tenant.</p>
                        </div>
                        <button @click="openCreateStoreModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">add_business</span> New Store
                        </button>
                    </div>

                    <div v-if="loadingStores" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="i in 3" :key="i" class="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    </div>

                    <div v-else-if="tenantStores.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <span class="material-symbols-outlined text-4xl">storefront</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No stores found</h3>
                        <p class="text-slate-500 mb-6">Start by adding the first store location.</p>
                        <button @click="openCreateStoreModal" class="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">Add New Store</button>
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="(store, index) in tenantStores" :key="store.id" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full">
                            <!-- Card Header with Gradient -->
                            <div class="h-32 relative overflow-hidden" :class="[
                                index % 3 === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 
                                index % 3 === 1 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 
                                'bg-gradient-to-br from-amber-500 to-orange-600'
                            ]">
                                <div class="absolute inset-0 bg-black/10"></div>
                                <div class="absolute top-3 right-3">
                                    <span class="inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-green-700 dark:text-green-400 shadow-sm uppercase">
                                        <span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        Open
                                    </span>
                                </div>
                                <div class="absolute bottom-3 left-4 right-4">
                                    <h3 class="text-white font-bold text-lg truncate">{{ store.name }}</h3>
                                    <p class="text-white/80 text-[11px] truncate flex items-center gap-1">
                                        <span class="material-symbols-outlined text-[14px]">location_on</span>
                                        {{ store.address || 'No address provided' }}
                                    </p>
                                </div>
                            </div>

                            <!-- Card Body -->
                            <div class="p-5 flex-1 flex flex-col gap-4">
                                <div class="grid grid-cols-2 gap-y-4 gap-x-2">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Store ID</span>
                                        <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ store.id.substring(0, 8).toUpperCase() }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Staff</span>
                                        <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ (store as any).staffCount || 0 }} Employees</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Devices</span>
                                        <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ (store as any).deviceCount || 0 }} Active POS</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Type</span>
                                        <span class="text-xs font-semibold text-slate-900 dark:text-white">{{ (store as any).type || 'Main Store' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Card Footer -->
                            <div class="px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                <button @click="editStore(store)" class="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 text-xs font-bold transition-all">
                                    Edit
                                </button>
                                <button class="flex-1 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all flex items-center justify-center gap-1">
                                    Manage
                                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

            </template>
        </div>
    </div>
    <!-- Edit Plan Modal -->
    <Teleport to="body">
      <div v-if="showEditPlanModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditPlanModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
           <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Paket Langganan</h3>
           <div class="space-y-4">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                 <p class="text-sm font-medium text-blue-900 dark:text-blue-100">Packet Saat Ini: {{ getPlanName(subscription?.plan || tenant?.subscriptionPlan || 'BASIC') }}</p>
              </div>
              <div>
                 <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Pilih Paket Baru</label>
                 <select v-model="planForm.subscriptionPlan" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium">
                    <option value="BASIC">Starter (BASIC)</option>
                    <option value="PRO">Boost (PRO)</option>
                    <option value="ENTERPRISE">Max (ENTERPRISE)</option>
                 </select>
              </div>
              <div>
                 <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Durasi (Hari)</label>
                 <input v-model.number="planForm.durationDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
              </div>
              <div class="flex gap-3 pt-2">
                 <button @click="showEditPlanModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                 <button @click="handleEditPlan" class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">Simpan</button>
              </div>
           </div>
        </div>
      </div>
    </Teleport>
    <!-- Reduce Subscription Modal -->
    <Teleport to="body">
       <div v-if="showReduceSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showReduceSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Kurangi Durasi Langganan</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Potong Durasi (Hari)</label>
                   <input v-model.number="reduceSubscriptionDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showReduceSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleReduceSubscription" :disabled="reducing" class="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-500/30">
                      {{ reducing ? 'Memproses...' : 'Kurangi' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Extend Subscription Modal -->
    <Teleport to="body">
       <div v-if="showExtendSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showExtendSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Perpanjang Langganan</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Durasi (Hari)</label>
                   <input v-model.number="extendSubscriptionDays" type="number" min="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showExtendSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleExtendSubscription" :disabled="extending" class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ extending ? 'Memproses...' : 'Perpanjang' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
    <!-- Reduce Addon Modal -->
    <Teleport to="body">
      <div
        v-if="showReduceAddonModal"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="showReduceAddonModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-[#0d141b] mb-4">Kurangi Durasi Addon</h3>
          <div class="mb-4">
            <p class="text-sm text-[#4c739a] mb-2">Addon: <span class="font-semibold">{{ selectedAddon?.addonName }}</span></p>
            <p class="text-sm text-[#4c739a]">Sisa waktu: <span class="font-semibold">{{ selectedAddon ? getAddonDaysRemaining(selectedAddon) : 0 }} hari</span></p>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Durasi untuk dikurangi (hari)</label>
              <input
                v-model.number="reduceAddonDays"
                type="number"
                min="1"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500"
                placeholder="Masukkan jumlah hari"
              />
            </div>
            <div class="flex space-x-3">
              <button
                @click="showReduceAddonModal = false"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                @click="handleReduceAddon"
                :disabled="!reduceAddonDays || reduceAddonDays < 1 || reducing"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ reducing ? 'Memproses...' : 'Kurangi' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Extend Addon Modal -->
    <div
      v-if="showExtendAddonModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="showExtendAddonModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 class="text-xl font-bold text-[#0d141b] mb-4">Perpanjang Addon</h3>
        <div class="mb-4">
          <p class="text-sm text-[#4c739a] mb-2">Addon: <span class="font-semibold">{{ selectedAddon?.addonName }}</span></p>
          <p class="text-sm text-[#4c739a]">Sisa waktu: <span class="font-semibold">{{ selectedAddon ? getAddonDaysRemaining(selectedAddon) : 0 }} hari</span></p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Durasi (hari)</label>
            <input
              v-model.number="extendAddonDays"
              type="number"
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan jumlah hari"
            />
          </div>
          <div class="flex space-x-3">
            <button
              @click="showExtendAddonModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              @click="handleExtendAddon"
              :disabled="!extendAddonDays || extendAddonDays < 1 || extending"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ extending ? 'Memproses...' : 'Perpanjang' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Addon Modal (Subscribe) -->
    <Teleport to="body">
       <div v-if="showAddAddonModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showAddAddonModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Tambah Addon</h3>
             <div class="space-y-4">
                <div 
                  v-for="addon in filteredAvailableAddons" 
                  :key="addon.id"
                  @click="handleSelectAddon(addon)"
                  class="border rounded-xl p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  :class="[
                     addon.comingSoon || addon.requiresApi ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-blue-400',
                     selectedAddonForSubscribe?.id === addon.id && !addon.comingSoon ? 'border-[#10b981] ring-1 ring-[#10b981] bg-blue-50/50' : 'border-slate-200 dark:border-slate-700'
                  ]"
                >
                   <div class="flex justify-between items-start">
                      <div>
                         <h4 class="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                            {{ addon.name }}
                            <span v-if="addon.comingSoon" class="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">Coming Soon</span>
                         </h4>
                         <p class="text-xs text-[#4c739a] dark:text-slate-400 mt-1">{{ addon.description }}</p>
                      </div>
                      <div class="text-right">
                         <span class="font-bold text-[#10b981]">{{ formatCurrency(addon.price) }}</span>
                         <span class="text-xs text-[#4c739a]">/bln</span>
                      </div>
                   </div>
                </div>
             </div>
             <div class="flex gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button @click="showAddAddonModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                <button 
                  @click="handleSubscribeAddon" 
                  :disabled="!selectedAddonForSubscribe || selectedAddonForSubscribe?.comingSoon" 
                  class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                   Berlangganan
                </button>
             </div>
          </div>
       </div>
    </Teleport>
    
    <!-- Create Store Modal -->
    <Teleport to="body">
       <div v-if="showCreateStoreModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showCreateStoreModal = false">
           <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
              <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">{{ editingStore ? 'Edit Toko' : 'Buat Toko Baru' }}</h3>
              <form @submit.prevent="handleSaveStore" class="space-y-4">
                 <div>
                    <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama Toko</label>
                   <input v-model="createStoreForm.name" type="text" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Alamat</label>
                   <input v-model="createStoreForm.address" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Telepon</label>
                   <input v-model="createStoreForm.phone" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button type="button" @click="closeCreateStoreModal" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button type="submit" :disabled="creatingStore" class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30">
                      {{ creatingStore ? 'Menyimpan...' : (editingStore ? 'Simpan Perubahan' : 'Buat Toko') }}
                   </button>
                </div>
             </form>
          </div>
       </div>
    </Teleport>
    
    <!-- Create User Modal -->
    <Teleport to="body">
       <div v-if="showCreateUserModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showCreateUserModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Tambah Pengguna Baru</h3>
             <form @submit.prevent="handleCreateUser" class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama</label>
                   <input v-model="createUserForm.name" type="text" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Email</label>
                   <input v-model="createUserForm.email" type="email" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Role</label>
                   <select v-model="createUserForm.role" required class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium">
                      <option value="ADMIN_TENANT">Admin</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CASHIER">Kasir</option>
                      <option value="KITCHEN">Dapur</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Password (Opsional)</label>
                   <input v-model="createUserForm.password" type="password" placeholder="Auto-generate jika kosong" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button type="button" @click="showCreateUserModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button type="submit" :disabled="creatingUser" class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ creatingUser ? 'Membuat...' : 'Buat Pengguna' }}
                   </button>
                </div>
             </form>
          </div>
       </div>
    </Teleport>
    <!-- Edit User Modal -->
    <Teleport to="body">
       <div v-if="showEditUserModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditUserModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Pengguna</h3>
             <div class="space-y-4">
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Nama</label>
                   <input v-model="editUserForm.name" type="text" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Email</label>
                   <input v-model="editUserForm.email" type="email" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Role</label>
                   <select v-model="editUserForm.role" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium">
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN_TENANT">Admin</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="CASHIER">Kasir</option>
                      <option value="KITCHEN">Dapur</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Status</label>
                   <select v-model="editUserForm.isActive" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium">
                      <option :value="true">Aktif</option>
                      <option :value="false">Tidak Aktif</option>
                   </select>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Password Baru (Opsional)</label>
                   <input v-model="editUserForm.password" type="password" placeholder="Kosongkan jika tidak ingin mengubah" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" />
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showEditUserModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleUpdateUser" :disabled="updatingUser || !editUserForm.name || !editUserForm.email" class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ updatingUser ? 'Menyimpan...' : 'Simpan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Deactivate Subscription Modal -->
    <Teleport to="body">
       <div v-if="showDeactivateSubscriptionModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showDeactivateSubscriptionModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Nonaktifkan Langganan</h3>
             <div class="space-y-4">
                <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                   <p class="text-sm text-amber-800 dark:text-amber-200 font-bold mb-2 flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px]">warning</span>
                      Peringatan
                   </p>
                   <p class="text-sm text-amber-700 dark:text-amber-300">
                      Dengan menonaktifkan langganan, semua fitur yang memerlukan langganan aktif akan dinonaktifkan.
                   </p>
                   <ul class="text-xs text-amber-700 dark:text-amber-300 mt-2 list-disc list-inside space-y-1 font-medium ml-1">
                      <li>POS (Point of Sale)</li>
                      <li>Kitchen Orders</li>
                      <li>Manajemen Produk</li>
                      <li>Laporan dan Analytics</li>
                   </ul>
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showDeactivateSubscriptionModal = false" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleDeactivateSubscription" :disabled="deactivatingSubscription" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-500/30">
                      {{ deactivatingSubscription ? 'Memproses...' : 'Nonaktifkan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>

    <!-- Edit Points Modal -->
    <Teleport to="body">
       <div v-if="showEditPointsModal" class="fixed inset-0 bg-[#0d141b]/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="showEditPointsModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
             <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-4">Edit Point Tenant</h3>
             <div class="space-y-4">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                   <p class="text-xs text-[#4c739a] dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Point Saat Ini</p>
                   <p class="text-2xl font-black text-[#10b981]">{{ tenantPoints?.currentPoints || 0 }}</p>
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Penyesuaian Point (+/-)</label>
                   <input v-model.number="editPointsForm.points" type="number" step="1" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" placeholder="Contoh: 100 atau -50" />
                </div>
                <div>
                   <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Alasan</label>
                   <textarea v-model="editPointsForm.reason" rows="3" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#10b981] outline-none font-medium" placeholder="Wajib diisi..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                   <button @click="showEditPointsModal = false; editPointsForm = { points: 0, reason: '' };" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition">Batal</button>
                   <button @click="handleUpdatePoints" :disabled="updatingPoints" class="flex-1 px-4 py-2.5 bg-[#10b981] text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/30">
                      {{ updatingPoints ? 'Memproses...' : 'Simpan' }}
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
</div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import api from '../../api';
import { formatCurrency, formatDate, formatRemainingTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import { safeArrayMethod, safeFilter, safeMap, safeFind } from '../../utils/array-helpers';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  subscriptionPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

interface Subscription {
  plan?: string;
  daysRemaining: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  secondsRemaining?: number;
  isExpired: boolean;
  isTemporaryUpgrade?: boolean;
  status: string;
  startDate?: string; // Added for normalization
  endDate?: string;   // Added for normalization
  subscription?: {
    temporaryUpgrade?: boolean;
    previousPlan?: string;
    plan?: string;
  };
}

interface Addon {
  id: string;
  addonId: string;
  addonName: string;
  addonType: string;
  status?: string;
  limit?: number;
  currentUsage?: number;
  isLimitReached?: boolean;
  expiresAt?: string;
  subscribedAt?: string;
}

interface AvailableAddon {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  defaultLimit?: number;
}

const tenant = ref<Tenant | null>(null);
const subscription = ref<Subscription | null>(null);
const activeAddons = ref<Addon[]>([]);
const availableAddons = ref<AvailableAddon[]>([]);
const loading = ref(true); // Start with true to show loading state immediately
const isReloadingTenant = ref(false); // Flag to prevent multiple reloads
const currentTime = ref(new Date());
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let pointsUpdateInterval: ReturnType<typeof setInterval> | null = null;
const extending = ref(false);
const reducing = ref(false);
const hasError = ref(false);
const errorMessage = ref<string>('');

const showExtendSubscriptionModal = ref(false);
const showReduceSubscriptionModal = ref(false);
const showEditPlanModal = ref(false);
const showExtendAddonModal = ref(false);
const showReduceAddonModal = ref(false);
const showAddAddonModal = ref(false);
const showEditUserModal = ref(false);
const showCreateUserModal = ref(false);
const showCreateStoreModal = ref(false);
const showDeactivateSubscriptionModal = ref(false);
const deactivatingSubscription = ref(false);
const loadingUsers = ref(false);
const tenantUsers = ref<any[]>([]);
const updatingUser = ref(false);
const selectedUser = ref<any>(null);
const userUsage = ref<{ currentUsage: number; limit: number } | null>(null);
const showEditPointsModal = ref(false);
const loadingPoints = ref(false);
const tenantPoints = ref<{ currentPoints: number; totalEarned: number; totalSpent: number } | null>(null);
const pointTransactions = ref<any[]>([]);
const updatingPoints = ref(false);
const editPointsForm = ref({
  points: 0,
  reason: '',
});
const loadingStores = ref(false);
const tenantStores = ref<any[]>([]);
const editingStore = ref<any>(null); // For editing store
const outletUsage = ref<{ currentUsage: number; limit: number } | null>(null);
const billingHistory = ref<any[]>([]);
const loadingBilling = ref(false);
const selectedUsers = ref<any[]>([]);
const creatingUser = ref(false);
const createUserForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'CASHIER' as 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN',
});
const editUserForm = ref({
  name: '',
  email: '',
  role: 'CASHIER' as 'ADMIN_TENANT' | 'SUPERVISOR' | 'CASHIER' | 'KITCHEN',
  isActive: true,
  password: '',
});
const createStoreForm = ref({
  name: '',
  address: '',
  phone: '',
});
const creatingStore = ref(false);
const planForm = ref({
  subscriptionPlan: 'BASIC' as 'BASIC' | 'PRO' | 'ENTERPRISE',
  durationDays: 30, // Default 30 hari
});
const extendSubscriptionDays = ref<number>(30);
const reduceSubscriptionDays = ref<number>(30);
const extendAddonDays = ref<number>(30);
const reduceAddonDays = ref<number>(30);
const selectedAddon = ref<Addon | null>(null);
const selectedAddonForSubscribe = ref<AvailableAddon | null>(null);
const selectedAddonCategory = ref('All Categories');
const activeTab = ref('profile');

const getAddonDaysRemaining = (addon: Addon) => {
  if (!addon.expiresAt) return 0;
  const now = new Date();
  const expiresAt = new Date(addon.expiresAt);
  // Check if addon is expired
  if (expiresAt <= now) return 0;
  const diffTime = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};


// Helper to calculate subscription duration
const getSubscriptionDuration = (sub: any) => {
  if (!sub?.startDate || !sub?.endDate) return 0;
  const start = new Date(sub.startDate);
  const end = new Date(sub.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

// Filtered active addons
const filteredActiveAddons = computed(() => {
  return safeArrayMethod(
    activeAddons.value,
    (addons) => {
      try {
        if (!Array.isArray(addons)) return [];
        const now = new Date();
        return addons.filter(a => {
          if (!a) return false;
          // Filter: only show addons that are actually active (status === 'active' or no status but not expired)
          if (a.status && a.status !== 'active') return false;
          if (a.expiresAt) {
            const expiresAt = new Date(a.expiresAt);
            return expiresAt > now;
          }
          return true;
        });
      } catch (error) {
        console.error('Error filtering active addons:', error);
        return [];
      }
    },
    []
  );
});

// Removed unused isAddonActive function
const _isAddonActive = (addonId: string) => {
  const now = new Date();
  return safeArrayMethod(
    activeAddons.value,
    (addons) => {
      try {
        if (!Array.isArray(addons)) return false;
        return addons.some(a => {
          if (!a || a.addonId !== addonId) return false;
          // Check if addon is active (status === 'active' and not expired)
          if (a.status !== 'active') return false;
          // Check if expired
          if (a.expiresAt) {
            const expiresAt = new Date(a.expiresAt);
            return expiresAt > now;
          }
          // If no expiry date, consider it active if status is active
          return true;
        });
      } catch (error) {
        console.error('Error checking addon active status:', error);
        return false;
      }
    },
    false
  );
};

// Check if addon has defaultLimit (Tambah Outlet, Pengguna, Produk - bisa beli berapapun = Unlimited)
const hasDefaultLimit = (addon: any) => {
  return addon.defaultLimit !== null && addon.defaultLimit !== undefined;
};

// Filter available addons: semua addon selalu ditampilkan (bisa dibeli berkali-kali)
// Sort: aktif di depan, coming soon di belakang
const filteredAvailableAddons = computed(() => {
  // Remove duplicates based on id first
  const uniqueAddons = Array.isArray(availableAddons.value) 
    ? availableAddons.value.filter((addon, index, self) => 
        addon && index === self.findIndex(a => a && addon && a.id === addon.id)
      )
    : [];
  
  // Filter by category if selected
  const filtered = safeFilter(uniqueAddons, (addon: any) => {
    if (selectedAddonCategory.value === 'All Categories') return true;
    return getAddonCategory(addon) === selectedAddonCategory.value;
  });
  
  // Sort: 
  // 1. Unlimited (defaultLimit !== null - Tambah Outlet, Pengguna, Produk) di atas
  // 2. Limited (defaultLimit === null - Business Analytics, dll) di tengah
  // 3. Coming soon (comingSoon === true) di bawah
  return filtered.sort((a, b) => {
    const aIsComingSoon = a?.comingSoon === true || a?.requiresApi === true;
    const bIsComingSoon = b?.comingSoon === true || b?.requiresApi === true;
    const aHasDefaultLimit = hasDefaultLimit(a);
    const bHasDefaultLimit = hasDefaultLimit(b);
    
    // Coming soon selalu di bawah
    if (aIsComingSoon && !bIsComingSoon) return 1;
    if (!aIsComingSoon && bIsComingSoon) return -1;
    
    // Jika keduanya coming soon, urutkan seperti biasa
    if (aIsComingSoon && bIsComingSoon) return 0;
    
    // Unlimited (dengan defaultLimit) di atas, Limited (tanpa defaultLimit) di bawah
    if (aHasDefaultLimit && !bHasDefaultLimit) return -1;
    if (!aHasDefaultLimit && bHasDefaultLimit) return 1;
    
    return 0;
  });
});

const getAddonDescription = (activeAddon: any) => {
  // Find matching addon from available addons by addonId or addonType
  if (!Array.isArray(availableAddons.value)) return '';
  const matchedAddon = availableAddons.value.find(
    a => a.id === activeAddon.addonId || a.type === activeAddon.addonType
  );
  return matchedAddon?.description || activeAddon.addonType || 'Tidak ada deskripsi';
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    BASIC: 'Starter',
    PRO: 'Boost',
    ENTERPRISE: 'Max',
  };
  return planNames[plan] || plan;
};

const getDaysRemaining = (dateStr: string) => {
  if (!dateStr) return 0;
  const end = new Date(dateStr);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  if (diffTime <= 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getAddonIcon = (addon: any) => {
  const name = (addon.addonName || '').toLowerCase();
  const type = (addon.addonType || '').toLowerCase();
  
  if (name.includes('inventory') || type.includes('inventory')) return 'inventory_2';
  if (name.includes('kitchen') || type.includes('kitchen') || type.includes('kds')) return 'soup_kitchen';
  if (name.includes('loyalty') || name.includes('point') || type.includes('loyalty')) return 'loyalty';
  if (name.includes('account') || name.includes('accounting') || type.includes('accounting')) return 'account_balance';
  if (name.includes('online') || name.includes('store') || type.includes('online')) return 'shopping_bag';
  if (name.includes('user') || type.includes('user')) return 'group_add';
  if (name.includes('outlet') || type.includes('outlet')) return 'add_business';
  
  return 'extension';
};

const getAvailableAddonIcon = (addon: any) => {
  const name = (addon.name || '').toLowerCase();
  const type = (addon.type || '').toLowerCase();
  
  if (name.includes('inventory') || type.includes('inventory')) return 'inventory_2';
  if (name.includes('kitchen') || type.includes('kitchen') || type.includes('kds')) return 'soup_kitchen';
  if (name.includes('loyalty') || name.includes('point') || type.includes('loyalty')) return 'loyalty';
  if (name.includes('account') || name.includes('accounting') || type.includes('accounting')) return 'account_balance';
  if (name.includes('online') || name.includes('store') || type.includes('online')) return 'shopping_bag';
  if (name.includes('user') || type.includes('user')) return 'group_add';
  if (name.includes('outlet') || type.includes('outlet')) return 'add_business';
  
  return 'extension';
};

const getAddonColor = (addon: any, part: 'bg' | 'text' | 'border') => {
  const name = (addon.addonName || addon.name || '').toLowerCase();
  const type = (addon.addonType || addon.type || '').toLowerCase();
  
  let color = 'blue'; // default
  
  if (name.includes('inventory') || type.includes('inventory')) color = 'blue';
  else if (name.includes('kitchen') || type.includes('kitchen') || type.includes('kds')) color = 'indigo';
  else if (name.includes('loyalty') || name.includes('point') || type.includes('loyalty')) color = 'amber';
  else if (name.includes('account') || name.includes('accounting') || type.includes('accounting')) color = 'teal';
  else if (name.includes('online') || name.includes('store') || type.includes('online')) color = 'pink';
  else if (name.includes('user') || type.includes('user')) color = 'purple';
  else if (name.includes('outlet') || type.includes('outlet')) color = 'emerald';

  const colorMap: Record<string, Record<string, string>> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'bg-blue-500/80 group-hover:bg-blue-500'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'bg-indigo-500/80 group-hover:bg-indigo-500'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'bg-amber-500/80 group-hover:bg-amber-500'
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'bg-teal-500/80 group-hover:bg-teal-500'
    },
    pink: {
      bg: 'bg-pink-50 dark:bg-pink-900/20',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'bg-pink-500/80 group-hover:bg-pink-500'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'bg-purple-500/80 group-hover:bg-purple-500'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'bg-emerald-500/80 group-hover:bg-emerald-500'
    }
  };
  
  return colorMap[color][part];
};

const getAddonCategory = (addon: any) => {
  const name = (addon.addonName || addon.name || '').toLowerCase();
  const type = (addon.addonType || addon.type || '').toLowerCase();
  
  // Operations: Inventory, Kitchen, Outlets, Users, Products
  if (name.includes('inventory') || type.includes('inventory') || 
      name.includes('kitchen') || type.includes('kitchen') || type.includes('kds') ||
      name.includes('outlet') || type.includes('outlet') ||
      name.includes('user') || type.includes('user') ||
      name.includes('product') || type.includes('product')) {
    return 'Operations';
  }
  
  // Marketing: Loyalty, Online Store
  if (name.includes('loyalty') || name.includes('point') || type.includes('loyalty') ||
      name.includes('online') || name.includes('store') || type.includes('online')) {
    return 'Marketing';
  }
  
  // Advanced: Accounting, Analytics
  if (name.includes('account') || name.includes('accounting') || type.includes('accounting') ||
      name.includes('analytic') || type.includes('reporting')) {
    return 'Advanced';
  }
  
  return 'Operations'; // default to Operations
};

const getPlanBadgeClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'bg-[#f6f7f8] text-gray-700',
    PRO: 'bg-blue-100 text-blue-700',
    ENTERPRISE: 'bg-purple-100 text-purple-700',
  };
  return classes[plan] || 'bg-[#f6f7f8] text-gray-700';
};


const loadActiveAddons = async () => {
  if (!tenant.value?.id) return;
  
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/addons');
    // Handle paginated response (response.data.data) or direct array (response.data)
    const addonsData = response.data?.data || response.data || [];
    // Filter to only show active addons (status === 'active' and not expired)
    const now = new Date();
    const filteredAddons = (Array.isArray(addonsData) ? addonsData : []).filter((addon: any) => {
      // Ensure status exists and is 'active'
      if (addon.status && addon.status !== 'active') return false;
      // If no status field, assume active if not expired
      if (addon.expiresAt) {
        const expiresAt = new Date(addon.expiresAt);
        return expiresAt > now;
      }
      return true;
    });
    
    // For addons with limits (ADD_OUTLETS, ADD_USERS, ADD_PRODUCTS), get total limit from check-limit API
    // This ensures we show total limit (subscription + all addons) instead of individual addon limit
    const limitAddonTypes = ['ADD_OUTLETS', 'ADD_USERS', 'ADD_PRODUCTS'];
    const limitPromises: Record<string, Promise<any>> = {};
    
    // Get total limits for each addon type
    for (const addonType of limitAddonTypes) {
      const hasAddonType = safeArrayMethod(
        filteredAddons,
        (addons) => {
          if (!Array.isArray(addons)) return false;
          return addons.some((a: any) => a && a.addonType === addonType);
        },
        false
      );
      if (hasAddonType) {
        limitPromises[addonType] = api.get(`/addons/check-limit/${addonType}`).catch(() => ({ data: { limit: -1, currentUsage: 0 } }));
      }
    }
    
    // Wait for all limit checks
    const limitResults = await Promise.all(Object.values(limitPromises).filter((p: any) => p instanceof Promise));
    const limitMap: Record<string, { limit: number; currentUsage: number }> = {};
    let limitIndex = 0;
    for (const addonType of limitAddonTypes) {
      if (limitPromises[addonType]) {
        limitMap[addonType] = limitResults[limitIndex].data;
        limitIndex++;
      }
    }
    
    // Update addons with total limit and currentUsage
    activeAddons.value = filteredAddons.map((addon: any) => {
      if (limitMap[addon.addonType]) {
        return {
          ...addon,
          limit: limitMap[addon.addonType].limit,
          currentUsage: limitMap[addon.addonType].currentUsage,
          isLimitReached: limitMap[addon.addonType].limit !== -1 && limitMap[addon.addonType].currentUsage >= limitMap[addon.addonType].limit,
        };
      }
      return addon;
    });
  } catch (error: any) {
    console.error('Error loading active addons:', error);
    // Don't show error for addons, just set empty array
    activeAddons.value = [];
  }
};

const loadAvailableAddons = async () => {
  try {
    // Available addons are the same for all tenants
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/addons/available');
    availableAddons.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading available addons:', error);
    // Don't show error for addons, just set empty array
    availableAddons.value = [];
  }
};

const loadTenantUsers = async () => {
  if (!tenant.value?.id) return;
  loadingUsers.value = true;
  try {
    const response = await api.get('/users', {
      params: { limit: 1000 },
    });
    tenantUsers.value = response.data.data || [];
    
    // Get user usage
    const usageResponse = await api.get('/users/usage');
    userUsage.value = usageResponse.data;
  } catch (error: any) {
    console.error('Error loading users:', error);
    tenantUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

const loadUsers = async () => {
  if (!tenant.value?.id) return;
  
  loadingUsers.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/users', {
      params: {
        page: 1,
        limit: 100, // Get all users for this tenant
      },
    });
    tenantUsers.value = response.data.data || [];
    
    // Load user usage limit
    try {
      const usageResponse = await api.get('/addons/check-limit/ADD_USERS');
      userUsage.value = {
        currentUsage: usageResponse.data.currentUsage || 0,
        limit: usageResponse.data.limit === undefined ? -1 : usageResponse.data.limit,
      };
    } catch (error: any) {
      console.error('Error loading user usage:', error);
      // Set default if error
      userUsage.value = {
        currentUsage: tenantUsers.value.length,
        limit: -1,
      };
    }
  } catch (error: any) {
    console.error('Error loading users:', error);
    showError(error.response?.data?.message || 'Gagal memuat daftar pengguna');
  } finally {
    loadingUsers.value = false;
  }
};

const loadStores = async () => {
  if (!tenant.value?.id) return;
  
  loadingStores.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    const response = await api.get('/outlets');
    tenantStores.value = response.data.data || [];
    
    // Load outlet usage limit
    try {
      const usageResponse = await api.get('/addons/check-limit/ADD_OUTLETS');
      outletUsage.value = {
        currentUsage: usageResponse.data.currentUsage || 0,
        limit: usageResponse.data.limit === undefined ? -1 : usageResponse.data.limit,
      };
    } catch (error: any) {
      console.error('Error loading outlet usage:', error);
      // Set default if error
      outletUsage.value = {
        currentUsage: Array.isArray(tenantStores.value) ? tenantStores.value.filter((s: any) => s.isActive !== false).length : 0,
        limit: -1,
      };
    }
  } catch (error: any) {
    console.error('Error loading stores:', error);
    showError(error.response?.data?.message || 'Gagal memuat daftar store');
  } finally {
    loadingStores.value = false;
  }
};

const loadTenantPoints = async () => {
  if (!tenant.value?.id || !authStore.isSuperAdmin) return;
  
  loadingPoints.value = true;
  try {
    const balanceRes = await api.get(`/rewards/tenant/${tenant.value.id}/balance`);
    tenantPoints.value = balanceRes.data;
    
    const transactionsRes = await api.get(`/rewards/tenant/${tenant.value.id}/transactions`, {
      params: { limit: 20 },
    });
    pointTransactions.value = transactionsRes.data;
  } catch (error: any) {
    console.error('Error loading tenant points:', error);
    // Don't show error, just set defaults
    tenantPoints.value = { currentPoints: 0, totalEarned: 0, totalSpent: 0 };
    pointTransactions.value = [];
  } finally {
    loadingPoints.value = false;
  }
};

const loadBillingHistory = async () => {
  if (!tenant.value?.id) return;
  
  loadingBilling.value = true;
  try {
    // Current backend has subscriptionHistory table in Prisma
    const response = await api.get(`/tenants/${tenant.value.id}/billing-history`);
    billingHistory.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading billing history:', error);
    // Silent fail for history, just keep it empty
    billingHistory.value = [];
  } finally {
    loadingBilling.value = false;
  }
};

const handleUpdatePoints = async () => {
  if (!tenant.value?.id) return;
  
  if (!editPointsForm.value.reason.trim()) {
    await showError('Alasan wajib diisi');
    return;
  }
  
  if (editPointsForm.value.points === 0) {
    await showError('Point harus lebih dari 0');
    return;
  }
  
  updatingPoints.value = true;
  try {
    const response = await api.post(`/rewards/tenant/${tenant.value.id}/update`, {
      points: Math.floor(editPointsForm.value.points), // Ensure integer
      reason: editPointsForm.value.reason,
    });
    
    if (response.data.success) {
      await showSuccess(response.data.message);
      showEditPointsModal.value = false;
      editPointsForm.value = { points: 0, reason: '' };
      await loadTenantPoints();
    } else {
      await showError(response.data.message || 'Gagal mengupdate point');
    }
  } catch (error: any) {
    console.error('Error updating points:', error);
    await showError(error.response?.data?.message || 'Gagal mengupdate point');
  } finally {
    updatingPoints.value = false;
  }
};

const toggleStoreStatus = async (store: any) => {
  const action = store.isActive !== false ? 'nonaktifkan' : 'aktifkan';
  const confirmed = await showConfirm(`Apakah Anda yakin ingin ${action} store "${store.name}"?`);
  if (!confirmed) return;
  
  try {
    await api.put(`/outlets/${store.id}`, {
      isActive: !store.isActive,
    });
    await showSuccess(`Store berhasil di${action}`);
    await loadStores();
  } catch (error: any) {
    await showError(error.response?.data?.message || `Gagal ${action} store`);
  }
};

// Helper to get remaining days display
const daysRemainingDisplay = computed(() => {
  let isExpiredState = false;
  
  // Priority 1: Use daysRemaining from backend subscription object
  if (subscription.value && subscription.value.isExpired !== undefined) {
     isExpiredState = subscription.value.isExpired;
  } 
  // Priority 2: Calculate from tenant.subscriptionEnd
  else if (tenant.value?.subscriptionEnd) {
     isExpiredState = new Date(tenant.value.subscriptionEnd) <= new Date();
  }
  
  if (isExpiredState) return 'Expired';

  const sub = subscription.value as any;
  if (sub && sub.daysRemaining === 0) {
    const hours = String(sub.hoursRemaining || 0).padStart(2, '0');
    const minutes = String(sub.minutesRemaining || 0).padStart(2, '0');
    const seconds = String(sub.secondsRemaining || 0).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  const days = sub?.daysRemaining || (tenant.value?.subscriptionEnd ? getDaysRemaining(tenant.value.subscriptionEnd) : 0);
  return `${days} ${days === 1 ? 'Day' : 'Days'}`;
});

const totalDurationDays = computed(() => {
  const start = subscription.value?.subscriptionStart || tenant.value?.subscriptionStart;
  const end = subscription.value?.subscriptionEnd || tenant.value?.subscriptionEnd;
  
  if (start && end) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diff = endTime - startTime;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  return 365; // Fallback
});

const progressWidth = computed(() => {
  const end = subscription.value?.subscriptionEnd || tenant.value?.subscriptionEnd;
  const start = subscription.value?.subscriptionStart || tenant.value?.subscriptionStart;
  
  if (!end || !start) return 0;
  
  const endTime = new Date(end).getTime();
  const startTime = new Date(start).getTime();
  const nowTime = currentTime.value.getTime();
  
  const total = endTime - startTime;
  const remaining = endTime - nowTime;
  
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (remaining / total) * 100));
});

// Bulk user operations
const isUserSelected = (userId: string) => {
  if (!Array.isArray(selectedUsers.value)) return false;
  return selectedUsers.value.some(u => u.id === userId);
};

const toggleUserSelection = (user: any) => {
  if (!Array.isArray(selectedUsers.value)) selectedUsers.value = [];
  const index = selectedUsers.value.findIndex(u => u.id === user.id);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(user);
  }
};

const toggleSelectAllUsers = () => {
  if (!Array.isArray(selectedUsers.value)) selectedUsers.value = [];
  if (!Array.isArray(tenantUsers.value)) return;
  
  if (selectedUsers.value.length === tenantUsers.value.length) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = [...tenantUsers.value];
  }
};

const bulkActivateUsers = async () => {
  if (!Array.isArray(selectedUsers.value)) return;
  const inactiveUsers = selectedUsers.value.filter(u => !u.isActive);
  if (inactiveUsers.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin mengaktifkan ${inactiveUsers.length} pengguna?`,
    'Aktifkan Pengguna'
  );
  if (!confirmed) return;

  try {
    const userIds = inactiveUsers.map(u => u.id);
    const response = await api.post('/users/bulk-update-status', {
      userIds,
      isActive: true,
    });
    
    if (response.data.updated > 0) {
      await showSuccess(`${response.data.updated} pengguna berhasil diaktifkan`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pengguna gagal diaktifkan. ${response.data.errors.join(', ')}`);
    }
    
    selectedUsers.value = [];
    await loadUsers();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal mengaktifkan pengguna');
  }
};

const bulkDeactivateUsers = async () => {
  if (!Array.isArray(selectedUsers.value)) return;
  const activeUsers = selectedUsers.value.filter(u => u.isActive);
  if (activeUsers.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menonaktifkan ${activeUsers.length} pengguna?`,
    'Nonaktifkan Pengguna'
  );
  if (!confirmed) return;

  try {
    const userIds = activeUsers.map(u => u.id);
    const response = await api.post('/users/bulk-update-status', {
      userIds,
      isActive: false,
    });
    
    if (response.data.updated > 0) {
      await showSuccess(`${response.data.updated} pengguna berhasil dinonaktifkan`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pengguna gagal dinonaktifkan. ${response.data.errors.join(', ')}`);
    }
    
    selectedUsers.value = [];
    await loadUsers();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menonaktifkan pengguna');
  }
};

const getRoleClass = (role: string) => {
  const classes: Record<string, string> = {
    ADMIN_TENANT: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
    SUPERVISOR: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    CASHIER: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
    KITCHEN: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  };
  return classes[role] || 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN_TENANT: 'Admin',
    SUPERVISOR: 'Supervisor',
    CASHIER: 'Kasir',
    KITCHEN: 'Dapur',
  };
  return labels[role] || role;
};

const editUser = (user: any) => {
  selectedUser.value = user;
  editUserForm.value = {
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    password: '',
  };
  showEditUserModal.value = true;
};

const handleUpdateUser = async () => {
  if (!selectedUser.value) return;
  
  updatingUser.value = true;
  try {
    const updateData: any = {
      name: editUserForm.value.name,
      email: editUserForm.value.email,
      role: editUserForm.value.role,
      isActive: editUserForm.value.isActive,
    };
    
    // Only include password if provided
    if (editUserForm.value.password && editUserForm.value.password.trim() !== '') {
      updateData.password = editUserForm.value.password;
    }
    
    await api.put(`/users/${selectedUser.value.id}`, updateData);
    
    // Close modal first
    showEditUserModal.value = false;
    selectedUser.value = null;
    editUserForm.value = {
      name: '',
      email: '',
      role: 'CASHIER',
      isActive: true,
      password: '',
    };
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Pengguna berhasil diperbarui');
    await loadUsers(); // Auto-reload users after update
  } catch (error: any) {
    console.error('Error updating user:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui pengguna');
  } finally {
    updatingUser.value = false;
  }
};

const handleBackToTenants = () => {
  // Clear selectedTenantId when going back to tenants list
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
  router.push('/app/tenants');
};

const retryLoad = () => {
  hasError.value = false;
  errorMessage.value = '';
  loadTenantDetail();
};

const loadTenantDetail = async () => {
  // Check if user is still authenticated before making API calls
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  const tenantId = route.params.id as string;
  if (!tenantId) {
    // Clear selectedTenantId when no tenant ID
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    router.push('/app/tenants');
    return;
  }

  // Set selectedTenantId for Super Admin before loading data
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(tenantId);
    localStorage.setItem('selectedTenantId', tenantId);
  }

  // Reset state
  loading.value = true;
  hasError.value = false;
  errorMessage.value = '';
  tenant.value = null; // Reset tenant to show loading state
  
  try {
    // Load tenant info
    const tenantRes = await api.get(`/tenants/${tenantId}`);
    
    // Check if tenant data is null or undefined
    if (!tenantRes?.data) {
      throw new Error('Tenant data is null or undefined');
    }
    
    tenant.value = tenantRes.data;

    // Load subscription
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    let subRes: any = null;
    try {
      subRes = await api.get('/subscriptions/current');
      subscription.value = subRes?.data || null;
      
      // IMPORTANT: Use isExpired from backend response directly
      // Don't recalculate isExpired based on subscriptionEnd to avoid flash to expired
      // Backend already calculated isExpired correctly after revert
      if (subRes?.data && subRes.data.isExpired !== undefined && subscription.value) {
        // Use isExpired from backend
        subscription.value.isExpired = subRes.data.isExpired;
      }
    } catch (subError: any) {
      console.error('Error loading subscription:', subError);
      // Set default subscription if error
      subscription.value = {
        plan: tenant.value?.subscriptionPlan || 'BASIC',
        daysRemaining: 0,
        isExpired: true,
        status: 'EXPIRED',
      };
    }
    
    // Set initial plan form value
    planForm.value.subscriptionPlan = (subscription.value?.plan || tenant.value?.subscriptionPlan || 'BASIC') as 'BASIC' | 'PRO' | 'ENTERPRISE';
    planForm.value.durationDays = 30; // Reset durasi ke default

    // Use daysRemaining, hoursRemaining, minutesRemaining, secondsRemaining from backend if available
    // Only calculate if backend didn't provide these values
    if (subRes?.data?.daysRemaining === undefined) {
      // Calculate remaining time for countdown only if backend didn't provide
      // Use tenant.subscriptionEnd as fallback if subscription.subscription.endDate is not available
      const subscriptionEndDate = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
      if (subscription.value && subscriptionEndDate) {
        const endDate = new Date(subscriptionEndDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        
        if (diffTime > 0) {
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          subscription.value.daysRemaining = days > 1 ? days : 0;
          subscription.value.hoursRemaining = totalHours % 24;
          subscription.value.minutesRemaining = totalMinutes % 60;
          subscription.value.secondsRemaining = totalSeconds % 60;
        } else {
          subscription.value.daysRemaining = 0;
          subscription.value.hoursRemaining = 0;
          subscription.value.minutesRemaining = 0;
          subscription.value.secondsRemaining = 0;
        }
      }
    }
    
    // Start countdown if subscription exists and has endDate
    // Always start countdown if subscription exists and has endDate
    // The countdown will handle expired state internally
    const subscriptionEndDateForCountdown = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
    if (subscription.value && subscriptionEndDateForCountdown) {
      // Initialize countdown values from backend response
      if (subscription.value.daysRemaining !== undefined) {
        // Backend already calculated, use those values
        startCountdown();
      } else {
        // Calculate from endDate if backend didn't provide
        const endDate = new Date(subscriptionEndDateForCountdown);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        
        if (diffTime > 0) {
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          subscription.value.daysRemaining = days > 1 ? days : 0;
          subscription.value.hoursRemaining = totalHours % 24;
          subscription.value.minutesRemaining = totalMinutes % 60;
          subscription.value.secondsRemaining = totalSeconds % 60;
          // Don't set isExpired here - use from backend
        } else {
          // Only set isExpired if backend didn't provide it
          if (subscription.value.isExpired === undefined) {
            subscription.value.isExpired = true;
          }
          subscription.value.daysRemaining = 0;
          subscription.value.hoursRemaining = 0;
          subscription.value.minutesRemaining = 0;
          subscription.value.secondsRemaining = 0;
        }
        
        startCountdown();
      }
    }

    // Load active addons (don't fail if error)
    try {
      await loadActiveAddons();
    } catch (error) {
      console.error('Error loading active addons:', error);
    }
    
    // Load available addons (don't fail if error)
    try {
      await loadAvailableAddons();
    } catch (error) {
      console.error('Error loading available addons:', error);
    }
    
    // Load users and stores for this tenant (don't fail if error)
    try {
      await loadUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
    
    // Load users, stores, points, and billing history in parallel
    try {
      await Promise.all([
        loadUsers(),
        loadStores(),
        loadTenantPoints(),
        loadBillingHistory()
      ]);
    } catch (error) {
      console.error('Error loading parallel data (users, stores, points, billing):', error);
      // Individual load functions already handle their own errors,
      // but this catch ensures any Promise.all rejection is logged.
    }
  } catch (error: any) {
    console.error('Error in onMounted:', error);
    
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
      return;
    }
    
    // Clear selectedTenantId on error to prevent dashboard showing wrong view
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    
    // Set error state for error boundary
    hasError.value = true;
    errorMessage.value = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat memuat halaman';
    
    // Ensure tenant is null to show error state
    tenant.value = null;
    loading.value = false;
    
    // Only show error notification if it's not a navigation error
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      await showError(error.response?.data?.message || 'Gagal memuat detail tenant');
    }
    // Don't redirect on error - let user see the error state
    // Only redirect on 404 (not found)
    if (error.response?.status === 404) {
      errorMessage.value = 'Tenant tidak ditemukan';
      await showError('Tenant tidak ditemukan');
      // Clear selectedTenantId before redirect
      if (authStore.isSuperAdmin) {
        authStore.setSelectedTenant(null);
        localStorage.removeItem('selectedTenantId');
      }
      // Small delay before redirect to show error message
      setTimeout(() => {
        // Clear selectedTenantId before redirect
        if (authStore.isSuperAdmin) {
          authStore.setSelectedTenant(null);
          localStorage.removeItem('selectedTenantId');
        }
        router.push('/app/tenants');
      }, 1500);
    }
  } finally {
    loading.value = false;
  }
};

const handleExtendSubscription = async () => {
  if (!extendSubscriptionDays.value || extendSubscriptionDays.value < 1) return;

  extending.value = true;
  try {
    // Super Admin can extend without plan, just duration
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/subscriptions/extend', {
      duration: extendSubscriptionDays.value,
    });
    // Close modal first
    showExtendSubscriptionModal.value = false;
    extendSubscriptionDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Langganan berhasil diperpanjang');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error extending subscription:', error);
    await showError(error.response?.data?.message || 'Gagal memperpanjang langganan');
  } finally {
    extending.value = false;
  }
};

const handleReduceSubscription = async () => {
  // Validate input
  if (!reduceSubscriptionDays.value) {
    await showError('Durasi harus diisi');
    return;
  }

  // Convert to number and validate
  const durationValue = Number(reduceSubscriptionDays.value);
  if (isNaN(durationValue) || durationValue < 1 || !Number.isInteger(durationValue)) {
    await showError('Durasi harus berupa angka bulat positif');
    return;
  }

  const duration = Math.floor(durationValue);

  reducing.value = true;
  try {
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/subscriptions/reduce', {
      duration: duration, // Send as integer
    });
    
    // Close modal first
    showReduceSubscriptionModal.value = false;
    reduceSubscriptionDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Durasi langganan berhasil dikurangi');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error reducing subscription:', error);
    const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Gagal mengurangi durasi langganan';
    await showError(errorMessage);
  } finally {
    reducing.value = false;
  }
};

const handleEditPlan = async () => {
  if (!planForm.value.subscriptionPlan || !tenant.value?.id || !planForm.value.durationDays || planForm.value.durationDays < 1) {
    await showError('Mohon lengkapi semua field');
    return;
  }
  
  try {
    await api.put(`/tenants/${tenant.value.id}/upgrade-plan`, {
      subscriptionPlan: planForm.value.subscriptionPlan,
      durationDays: planForm.value.durationDays,
    });
    // Close modal first
    showEditPlanModal.value = false;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Paket berhasil diupdate (temporary upgrade)');
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error updating plan:', error);
    await showError(error.response?.data?.message || 'Gagal mengupdate paket');
  }
};

const extendAddon = (addon: Addon) => {
  selectedAddon.value = addon;
  extendAddonDays.value = 30;
  showExtendAddonModal.value = true;
};

const reduceAddon = (addon: Addon) => {
  selectedAddon.value = addon;
  reduceAddonDays.value = 30;
  showReduceAddonModal.value = true;
};

const handleExtendAddon = async () => {
  if (!selectedAddon.value || !extendAddonDays.value || extendAddonDays.value < 1) return;

  extending.value = true;
  try {
    // Ensure we have the correct addon data from database
    if (!selectedAddon.value.addonId) {
      await showError('Data addon tidak valid');
      return;
    }
    
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/addons/extend', {
      addonId: selectedAddon.value.addonId,
      duration: extendAddonDays.value,
    });
    // Close modal first
    showExtendAddonModal.value = false;
    selectedAddon.value = null;
    extendAddonDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Addon berhasil diperpanjang');
    // Reload addons to show updated list
    await loadActiveAddons();
  } catch (error: any) {
    console.error('Error extending addon:', error);
    await showError(error.response?.data?.message || 'Gagal memperpanjang addon');
  } finally {
    extending.value = false;
  }
};

const handleReduceAddon = async () => {
  if (!selectedAddon.value || !reduceAddonDays.value || reduceAddonDays.value < 1) return;

  reducing.value = true;
  try {
    // Ensure we have the correct addon data from database
    if (!selectedAddon.value.addonId) {
      await showError('Data addon tidak valid');
      return;
    }
    
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post('/addons/reduce', {
      addonId: selectedAddon.value.addonId,
      duration: reduceAddonDays.value,
    });
    // Close modal first
    showReduceAddonModal.value = false;
    selectedAddon.value = null;
    reduceAddonDays.value = 30;
    // Wait a bit for modal to close, then show success
    await new Promise(resolve => setTimeout(resolve, 100));
    await showSuccess('Durasi addon berhasil dikurangi');
    // Reload addons to show updated list
    await loadActiveAddons();
  } catch (error: any) {
    console.error('Error reducing addon:', error);
    await showError(error.response?.data?.message || 'Gagal mengurangi durasi addon');
  } finally {
    reducing.value = false;
  }
};

const subscribeAddon = async (addon: AvailableAddon) => {
  // Block subscription for API-based addons (coming soon)
  if (addon.comingSoon || addon.requiresApi) {
    await showError('Addon ini belum tersedia (Coming Soon)');
    return;
  }
  
  try {
    // If Super Admin, directly subscribe addon without payment
    if (authStore.isSuperAdmin) {
      await api.post('/addons/subscribe', {
        addonId: addon.id,
        addonName: addon.name,
        addonType: addon.type,
        limit: addon.defaultLimit ?? undefined,
        duration: 30, // Default 30 days
      });
      
      await showSuccess('Addon berhasil ditambahkan');
      // Reload addons to show updated list
      await loadActiveAddons();
      await loadAvailableAddons();
      return;
    }

    // For non-Super Admin, use payment flow
    const response = await api.post('/payment/addon', {
      itemName: addon.name,
      amount: addon.price,
      itemId: addon.id,
      itemType: 'addon',
    });

    if (response.data.success && response.data.paymentUrl) {
      // Redirect to Midtrans payment page
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error subscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menambahkan addon');
  }
};

const handleCreateUser = async () => {
  if (!createUserForm.value.name || !createUserForm.value.email || !createUserForm.value.role) {
    await showError('Nama, email, dan role wajib diisi');
    return;
  }

  if (!tenant.value?.id) {
    await showError('Tenant ID tidak ditemukan');
    return;
  }

  creatingUser.value = true;
  try {
    const response = await api.post('/users', {
      name: createUserForm.value.name,
      email: createUserForm.value.email,
      password: createUserForm.value.password || undefined,
      role: createUserForm.value.role,
      tenantId: tenant.value.id,
    });

    showCreateUserModal.value = false;
    createUserForm.value = {
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
    };

    const defaultPassword = response.data?.password || response.data?.defaultPassword;
    if (defaultPassword) {
      await showSuccess(`Pengguna berhasil dibuat! Password: ${defaultPassword}`);
    } else {
      await showSuccess('Pengguna berhasil dibuat!');
    }

    await loadTenantUsers();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuat pengguna';
    await showError(errorMessage);
  } finally {
    creatingUser.value = false;
  }
};

const editStore = (store: any) => {
  editingStore.value = store;
  createStoreForm.value = {
    name: store.name,
    address: store.address || '',
    phone: store.phone || '',
  };
  showCreateStoreModal.value = true;
};

const handleSaveStore = async () => {
  if (editingStore.value) {
    await handleUpdateStore();
  } else {
    await handleCreateStore();
  }
};

const handleUpdateStore = async () => {
  if (!editingStore.value) return;
  
  // Validate
  if (!createStoreForm.value.name) {
    await showError('Nama toko wajib diisi');
    return;
  }

  creatingStore.value = true; // reusing creatingStore loading state
  try {
    const response = await api.put(`/outlets/${editingStore.value.id}`, createStoreForm.value);
    
    await showSuccess('Store berhasil diperbarui');
    showCreateStoreModal.value = false;
    editingStore.value = null; // Reset editing state
    createStoreForm.value = { name: '', address: '', phone: '' };
    await loadStores();
  } catch (error: any) {
    console.error('Error updating store:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui store');
  } finally {
    creatingStore.value = false;
  }
};

const openCreateStoreModal = () => {
  editingStore.value = null;
  createStoreForm.value = { name: '', address: '', phone: '' };
  showCreateStoreModal.value = true;
};

const closeCreateStoreModal = () => {
  showCreateStoreModal.value = false;
  editingStore.value = null;
  createStoreForm.value = { name: '', address: '', phone: '' };
};

const handleCreateStore = async () => {
  if (!createStoreForm.value.name) {
    await showError('Nama toko wajib diisi');
    return;
  }

  if (!tenant.value?.id) {
    await showError('Tenant ID tidak ditemukan');
    return;
  }

  creatingStore.value = true;
  try {
    await api.post('/outlets', {
      name: createStoreForm.value.name,
      address: createStoreForm.value.address || undefined,
      phone: createStoreForm.value.phone || undefined,
    });

    showCreateStoreModal.value = false;
    createStoreForm.value = {
      name: '',
      address: '',
      phone: '',
    };

    await showSuccess('Toko berhasil dibuat!');
    await loadStores();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuat toko';
    await showError(errorMessage);
  } finally {
    creatingStore.value = false;
  }
};

const handleSelectAddon = (addon: any) => {
  if (!addon.comingSoon && !addon.requiresApi) {
    selectedAddonForSubscribe.value = addon;
  }
};

const handleSubscribeAddon = async () => {
  if (!selectedAddonForSubscribe.value) return;

  // Block subscription for API-based addons (coming soon)
  if (selectedAddonForSubscribe.value.comingSoon || selectedAddonForSubscribe.value.requiresApi) {
    await showError('Addon ini belum tersedia (Coming Soon)');
    return;
  }

  try {
    // If Super Admin, directly subscribe addon without payment
    if (authStore.isSuperAdmin) {
      const addon = selectedAddonForSubscribe.value;
      await api.post('/addons/subscribe', {
        addonId: addon.id,
        addonName: addon.name,
        addonType: addon.type,
        limit: addon.defaultLimit ?? undefined,
        duration: 30, // Default 30 days
      });
      
      // Close modal first
      showAddAddonModal.value = false;
      selectedAddonForSubscribe.value = null;
      // Wait a bit for modal to close, then show success
      await new Promise(resolve => setTimeout(resolve, 100));
      await showSuccess('Addon berhasil ditambahkan');
      // Reload addons to show updated list
      await loadActiveAddons();
      await loadAvailableAddons();
      return;
    }

    // For non-Super Admin, use payment flow
    const response = await api.post('/payment/addon', {
      itemName: selectedAddonForSubscribe.value.name,
      amount: selectedAddonForSubscribe.value.price,
      itemId: selectedAddonForSubscribe.value.id,
      itemType: 'addon',
    });

    if (response.data.success && response.data.paymentUrl) {
      // Redirect to Midtrans payment page
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error subscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menambahkan addon');
  }
};

const unsubscribeAddon = async (addon: Addon) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menonaktifkan addon ini?');
  if (!confirmed) return;

  try {
    // Use addon.id (database ID) instead of addonId for unsubscribe
    // tenantId will be added automatically by API interceptor for SUPER_ADMIN
    await api.post(`/addons/unsubscribe/${addon.addonId}`);
    await showSuccess('Addon berhasil dinonaktifkan');
    // Reload addons to show updated list
    await loadActiveAddons();
    await loadAvailableAddons();
  } catch (error: any) {
    console.error('Error unsubscribing addon:', error);
    await showError(error.response?.data?.message || 'Gagal menonaktifkan addon');
  }
};

const handleDeactivateSubscription = async () => {
  if (!tenant.value?.id) return;
  
  deactivatingSubscription.value = true;
  try {
    await api.put(`/tenants/${tenant.value.id}/deactivate-subscription`);
    
    showSuccess('Langganan berhasil dinonaktifkan');
    showDeactivateSubscriptionModal.value = false;
    await loadTenantDetail();
  } catch (error: any) {
    console.error('Error deactivating subscription:', error);
    showError(error.response?.data?.message || 'Gagal menonaktifkan langganan');
  } finally {
    deactivatingSubscription.value = false;
  }
};

// Watch for route changes to update selectedTenantId
// Watch for route changes to update selectedTenantId and reload data
// Watch for route param changes (but not on initial mount to avoid double loading)
let isInitialMount = true;
watch(() => route.params.id, (newTenantId, oldTenantId) => {
  // Skip on initial mount - onMounted will handle it
  if (isInitialMount) {
    isInitialMount = false;
    return;
  }
  
  if (newTenantId) {
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(newTenantId as string);
      localStorage.setItem('selectedTenantId', newTenantId as string);
    }
    // Reload tenant detail when route param changes
    if (authStore.isAuthenticated && newTenantId !== oldTenantId) {
      // Reset state to show loading state
      tenant.value = null;
      subscription.value = null;
      activeAddons.value = [];
      tenantUsers.value = [];
      tenantStores.value = [];
      hasError.value = false;
      errorMessage.value = '';
      loading.value = true;
      loadTenantDetail();
    }
  } else {
    // If no tenant ID, clear state and redirect
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    router.push('/app/tenants');
  }
});

// Countdown real-time
const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(() => {
    currentTime.value = new Date();
    
    // Update subscription remaining time if subscription exists
    // Use tenant.subscriptionEnd as fallback if subscription.subscription.endDate is not available
    // IMPORTANT: Skip if subscriptionEnd is null (already deactivated, don't reload)
    const subscriptionEndDate = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
    if (subscription.value && subscriptionEndDate) {
      const endDate = new Date(subscriptionEndDate);
      const diffTime = endDate.getTime() - currentTime.value.getTime();
      
      // Only update if there's still time remaining (diffTime > 0)
      // If diffTime <= 0, mark as expired but don't stop countdown immediately
      // This allows the UI to show "0 hari" or "Kadaluwarsa" properly
      if (diffTime > 0) {
        const totalSeconds = Math.floor(diffTime / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        subscription.value.daysRemaining = days > 1 ? days : 0; // Use 0 for specifically the last 24h to trigger H:M:S display
        subscription.value.hoursRemaining = totalHours % 24;
        subscription.value.minutesRemaining = totalMinutes % 60;
        subscription.value.secondsRemaining = totalSeconds % 60;
        subscription.value.isExpired = false;
      } else {
        // Time has expired
        subscription.value.isExpired = true;
        subscription.value.daysRemaining = 0;
        subscription.value.hoursRemaining = 0;
        subscription.value.minutesRemaining = 0;
        subscription.value.secondsRemaining = 0;
        
        // Stop countdown
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        
        // IMPORTANT: Only auto refresh if current plan is BOOST (PRO/ENTERPRISE) and expired
        // If current plan is BASIC and expired, don't auto refresh (just show expired state)
        // This prevents unnecessary page refresh for BASIC plan
        const currentPlan = subscription.value?.plan || tenant.value?.subscriptionPlan || 'BASIC';
        const subscriptionEnd = (subscription.value as any)?.subscription?.endDate || tenant.value?.subscriptionEnd;
        
        // Only reload if:
        // 1. Current plan is PRO or ENTERPRISE (boost) and expired
        // 2. SubscriptionEnd is not null (might be temporary upgrade that needs revert)
        // 3. Not already reloading
        if ((currentPlan === 'PRO' || currentPlan === 'ENTERPRISE') && subscriptionEnd && !isReloadingTenant.value) {
          // Boost plan expired - reload to get reverted BASIC plan with remaining time
          isReloadingTenant.value = true;
          loadTenantDetail().finally(() => {
            isReloadingTenant.value = false;
          });
        } else if (currentPlan === 'BASIC' || !subscriptionEnd) {
          // BASIC plan expired or subscriptionEnd is null - don't reload to prevent page refresh
          // Just stop countdown and show expired state
        }
      }
    }
  }, 1000); // Update every second
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

onMounted(async () => {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check authentication first
    if (!authStore.isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Check if tenant ID exists in route
    const tenantId = route.params.id as string;
    if (!tenantId) {
      if (authStore.isSuperAdmin) {
        authStore.setSelectedTenant(null);
        localStorage.removeItem('selectedTenantId');
      }
      router.push('/app/tenants');
      return;
    }
    
    // Set selectedTenantId for Super Admin
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(tenantId);
      localStorage.setItem('selectedTenantId', tenantId);
    }
    
    // Initialize state - set loading to true first
    hasError.value = false;
    errorMessage.value = '';
    tenant.value = null;
    loading.value = true;
    
    // Load tenant detail
    await loadTenantDetail();
    
    // Load points once for Super Admin (no auto-refresh)
    if (authStore.isSuperAdmin && tenant.value) {
      try {
        await loadTenantPoints();
      } catch (error) {
        console.error('Error loading tenant points:', error);
        // Don't fail the whole page if points loading fails
      }
    }
  } catch (error: any) {
    console.error('Error in onMounted:', error);
    hasError.value = true;
    errorMessage.value = error?.message || 'Terjadi kesalahan saat memuat halaman';
    loading.value = false;
  }
});

// Clear selectedTenantId when leaving tenant detail
onBeforeRouteLeave((to: any, from: any, next: any) => {
  // If super admin is navigating to dashboard, super-dashboard, or tenant list, clear selectedTenantId
  if (authStore.isSuperAdmin && (to.name === 'dashboard' || to.name === 'super-dashboard' || to.name === 'tenants')) {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
  next();
});

onUnmounted(() => {
  stopCountdown();
  // Clear points update interval
  if (pointsUpdateInterval) {
    clearInterval(pointsUpdateInterval);
    pointsUpdateInterval = null;
  }
});
</script>


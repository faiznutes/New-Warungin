<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Management</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Manage cash flow, expenses, taxes, and bank reconciliation.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="showCashFlowModal = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Record Cash Flow</span>
        </button>
        <button
          @click="showExpenseModal = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-sm font-medium text-white shadow-lg shadow-rose-500/30 transition-all"
        >
          <span class="material-symbols-outlined text-[20px]">remove</span>
          <span>Record Expense</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
      <button
        v-for="tab in ['cashflow', 'expenses', 'tax', 'forecast', 'reconciliation']"
        :key="tab"
        @click="activeTab = tab"
        class="px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap capitalize"
        :class="activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'"
      >
        {{ tab.replace(/([A-Z])/g, ' $1').trim() }}
      </button>
    </div>

    <!-- Cash Flow Tab -->
    <div v-if="activeTab === 'cashflow'" class="space-y-6 animate-fade-in">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
               <p class="text-[10px] text-slate-400">Incoming funds</p>
             </div>
             <div class="bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">trending_up</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(cashFlowSummary.totalIncome) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Total Expenses</p>
               <p class="text-[10px] text-slate-400">Pengeluaran</p>
             </div>
             <div class="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">trending_down</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(cashFlowSummary.totalExpenses) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Net Cash Flow</p>
               <p class="text-[10px] text-slate-400">Selisih</p>
             </div>
             <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">account_balance_wallet</span>
             </div>
          </div>
          <p class="text-2xl font-bold" :class="cashFlowSummary.netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'">
            {{ formatCurrency(cashFlowSummary.netCashFlow) }}
          </p>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="flex items-center gap-2 w-full sm:w-auto">
             <input
              v-model="dateRange.startDate"
              type="date"
              class="w-full sm:w-auto px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
            <span class="text-[#4c739a] dark:text-slate-400 text-sm">s/d</span>
            <input
              v-model="dateRange.endDate"
              type="date"
              class="w-full sm:w-auto px-4 py-2 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <button
            @click="loadCashFlowSummary"
            class="w-full sm:w-auto px-6 py-2 bg-[#137fec] text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition"
          >
            Filter
          </button>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-4">By Category</h3>
        <div class="space-y-3">
          <div
            v-for="(amount, category) in cashFlowSummary.byCategory"
            :key="category"
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-[#137fec]/30 transition-all"
          >
            <span class="font-bold text-[#0d141b] dark:text-white">{{ category }}</span>
            <span class="text-[#4c739a] font-mono">{{ formatCurrency(amount) }}</span>
          </div>
          <div v-if="Object.keys(cashFlowSummary.byCategory).length === 0" class="text-center py-8 text-slate-400 text-sm">
             Tidak ada data kategori untuk periode ini.
          </div>
        </div>
      </div>
    </div>

    <!-- Expenses Tab -->
    <div v-if="activeTab === 'expenses'" class="space-y-6 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Expenses by Category</h3>
        <div class="space-y-3">
          <div
            v-for="(amount, category) in expensesByCategory"
            :key="category"
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-red-500/30 transition-all"
          >
            <span class="font-bold text-[#0d141b] dark:text-white">{{ category }}</span>
            <span class="text-red-600 font-mono font-medium">{{ formatCurrency(amount) }}</span>
          </div>
          <div v-if="Object.keys(expensesByCategory).length === 0" class="text-center py-8 text-slate-400 text-sm">
             Tidak ada expense tercatat.
          </div>
        </div>
      </div>
    </div>

    <!-- Tax Tab -->
    <div v-if="activeTab === 'tax'" class="space-y-6 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 max-w-2xl mx-auto">
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-6">Calculate Tax</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Period (YYYY-MM)</label>
            <input
              v-model="taxPeriod"
              type="month"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="calculateTax"
              class="w-full px-4 py-2.5 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition"
            >
              Calculate
            </button>
          </div>
        </div>

        <div v-if="taxCalculation" class="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-4">
          <div class="grid grid-cols-2 gap-6">
            <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p class="text-xs text-[#4c739a] mb-1">Total Revenue</p>
              <p class="text-lg font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(taxCalculation.totalRevenue) }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p class="text-xs text-[#4c739a] mb-1">Total Expenses</p>
              <p class="text-lg font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(taxCalculation.totalExpenses) }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p class="text-xs text-[#4c739a] mb-1">Taxable Income</p>
              <p class="text-lg font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(taxCalculation.taxableIncome) }}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
              <p class="text-xs text-[#4c739a] mb-1">Tax Rate</p>
              <p class="text-lg font-bold text-[#0d141b] dark:text-white">{{ (taxCalculation.taxRate * 100).toFixed(1) }}%</p>
            </div>
            <div class="col-span-2 p-4 bg-[#137fec]/10 border border-[#137fec]/20 rounded-xl flex justify-between items-center">
              <p class="text-sm font-bold text-[#0d141b] dark:text-white">Estimasi Pajak</p>
              <p class="text-2xl font-bold text-red-600">{{ formatCurrency(taxCalculation.taxAmount) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forecast Tab -->
    <div v-if="activeTab === 'forecast'" class="space-y-6 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-4">Financial Forecast</h3>
        <div class="flex items-end gap-4 mb-8">
          <div class="flex-1 max-w-xs">
            <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Months to Forecast</label>
            <input
              v-model.number="forecastMonths"
              type="number"
              min="1"
              max="12"
              class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
            />
          </div>
          <button
            @click="loadForecast"
            class="px-6 py-2.5 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition"
          >
            Generate Forecast
          </button>
        </div>

        <div v-if="forecast.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="item in forecast"
            :key="item.month"
            class="relative border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm hover:border-indigo-400 transition-colors"
          > 
            <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>
            <div class="flex items-center justify-between mb-3 pl-2">
              <h4 class="font-bold text-[#0d141b] dark:text-white text-lg">{{ item.month }}</h4>
              <span class="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">Conf: {{ (item.confidence * 100).toFixed(0) }}%</span>
            </div>
            <div class="grid grid-cols-1 gap-2 pl-2">
              <div class="flex justify-between items-center text-sm">
                <span class="text-[#4c739a]">Revenue</span>
                <span class="font-bold text-emerald-600">{{ formatCurrency(item.projectedRevenue) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-[#4c739a]">Expenses</span>
                <span class="font-bold text-red-600">{{ formatCurrency(item.projectedExpenses) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-700 mt-1">
                <span class="font-bold text-[#0d141b] dark:text-white">Profit</span>
                <span class="font-bold" :class="item.projectedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(item.projectedProfit) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bank Reconciliation Tab -->
    <div v-if="activeTab === 'reconciliation'" class="space-y-6 animate-fade-in">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Bank Reconciliation</h3>
            <button
              @click="showReconciliationModal = true"
              class="px-4 py-2 bg-[#137fec] hover:bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/30 transition"
            >
              New Reconciliation
            </button>
        </div>

        <div v-if="reconciliations.length > 0" class="space-y-4">
          <div
            v-for="recon in reconciliations"
            :key="recon.id"
            class="border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative overflow-hidden"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1" :class="recon.reconciled ? 'bg-emerald-500' : 'bg-amber-500'"></div>
            <div class="flex items-center justify-between mb-4 pl-2">
              <h4 class="font-bold text-[#0d141b] dark:text-white text-lg">{{ recon.bankAccount }}</h4>
              <span
                class="px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider"
                :class="recon.reconciled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
              >
                {{ recon.reconciled ? 'Reconciled' : 'Pending' }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm pl-2">
              <div>
                <p class="text-[#4c739a] text-xs mb-1">Statement Balance</p>
                <p class="font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(recon.statementBalance) }}</p>
              </div>
              <div>
                <p class="text-[#4c739a] text-xs mb-1">Book Balance</p>
                <p class="font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(recon.bookBalance) }}</p>
              </div>
              <div>
                <p class="text-[#4c739a] text-xs mb-1">Difference</p>
                <p class="font-bold" :class="Math.abs(recon.difference) < 0.01 ? 'text-emerald-600' : 'text-red-600'">
                  {{ formatCurrency(recon.difference) }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
             <div class="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm mb-3 inline-block">
                <span class="material-symbols-outlined text-slate-400 text-2xl">account_balance</span>
             </div>
             <p class="text-sm font-medium text-[#0d141b] dark:text-white">No reconciliation yet</p>
             <p class="text-xs text-[#4c739a]">Start bank reconciliation to match book balances.</p>
        </div>
      </div>
    </div>

    <!-- Modals (Re-styled) -->
    <Teleport to="body">
       <!-- Cash Flow Modal -->
      <div
        v-if="showCashFlowModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="closeCashFlowModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Record Cash Flow</h3>
            <button @click="closeCashFlowModal" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto">
             <form @submit.prevent="saveCashFlow" class="flex flex-col gap-4">
                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Type *</label>
                  <select
                    v-model="cashFlowForm.type"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  >
                    <option value="">Pilih Type</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Category *</label>
                  <input
                    v-model="cashFlowForm.category"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Amount *</label>
                  <input
                    v-model.number="cashFlowForm.amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    v-model="cashFlowForm.description"
                    rows="3"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Date *</label>
                    <input
                      v-model="cashFlowForm.date"
                      type="date"
                      required
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Payment Method *</label>
                    <input
                      v-model="cashFlowForm.paymentMethod"
                      type="text"
                      required
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                </div>

                <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    @click="closeCashFlowModal"
                    class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="flex-1 px-4 py-2.5 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
                  >
                    {{ saving ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      <!-- Expense Modal -->
      <div
        v-if="showExpenseModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="closeExpenseModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Record Expense</h3>
            <button @click="closeExpenseModal" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto">
             <form @submit.prevent="saveExpense" class="flex flex-col gap-4">
               <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Category *</label>
                  <input
                    v-model="expenseForm.category"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Amount *</label>
                  <input
                    v-model.number="expenseForm.amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Description *</label>
                  <textarea
                    v-model="expenseForm.description"
                    rows="3"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Date *</label>
                    <input
                      v-model="expenseForm.date"
                      type="date"
                      required
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Vendor</label>
                    <input
                      v-model="expenseForm.vendor"
                      type="text"
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                </div>

                <div class="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <input
                    v-model="expenseForm.isTaxDeductible"
                    type="checkbox"
                    id="taxDeductible"
                    class="h-4 w-4 text-[#137fec] rounded focus:ring-[#137fec]"
                  />
                  <label for="taxDeductible" class="text-sm font-medium text-[#0d141b] dark:text-white cursor-pointer">Tax Deductible</label>
                </div>

                <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    @click="closeExpenseModal"
                    class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 transition disabled:opacity-50"
                  >
                    {{ saving ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>

      <!-- Reconciliation Modal -->
      <div
        v-if="showReconciliationModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="closeReconciliationModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full flex flex-col max-h-[90vh]">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Bank Reconciliation</h3>
            <button @click="closeReconciliationModal" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto">
             <form @submit.prevent="saveReconciliation" class="flex flex-col gap-6">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Bank Account *</label>
                    <input
                      v-model="reconciliationForm.bankAccount"
                      type="text"
                      required
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Statement Date *</label>
                    <input
                      v-model="reconciliationForm.statementDate"
                      type="date"
                      required
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Statement Balance *</label>
                  <input
                    v-model.number="reconciliationForm.statementBalance"
                    type="number"
                    step="0.01"
                    required
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#137fec]/50 text-[#0d141b] dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Transactions</label>
                  <div class="space-y-2">
                    <div
                      v-for="(tx, index) in reconciliationForm.transactions"
                      :key="index"
                      class="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                       <div class="col-span-3">
                        <label class="text-[10px] text-slate-400 mb-1 block">Date</label>
                        <input v-model="tx.date" type="date" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                       </div>
                       <div class="col-span-4">
                        <label class="text-[10px] text-slate-400 mb-1 block">Desc</label>
                        <input v-model="tx.description" type="text" placeholder="Description" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                       </div>
                       <div class="col-span-2">
                        <label class="text-[10px] text-slate-400 mb-1 block">Amount</label>
                        <input v-model.number="tx.amount" type="number" step="0.01" placeholder="Amount" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                       </div>
                       <div class="col-span-2">
                        <label class="text-[10px] text-slate-400 mb-1 block">Type</label>
                        <select v-model="tx.type" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs">
                           <option value="DEPOSIT">Deposit</option>
                           <option value="WITHDRAWAL">Withdrawal</option>
                        </select>
                       </div>
                       <div class="col-span-1 text-right">
                         <button type="button" @click="removeTransaction(index)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                           <span class="material-symbols-outlined text-[16px]">close</span>
                         </button>
                       </div>
                    </div>
                    <button
                      type="button"
                      @click="addTransaction"
                      class="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                    >
                      + Add Transaction
                    </button>
                  </div>
                </div>

                <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    @click="closeReconciliationModal"
                    class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="flex-1 px-4 py-2.5 bg-[#137fec] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
                  >
                    {{ saving ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();

const activeTab = ref('cashflow');
const cashFlowSummary = ref({
  totalIncome: 0,
  totalExpenses: 0,
  netCashFlow: 0,
  byCategory: {} as Record<string, number>,
  byMonth: [] as any[],
});
const expensesByCategory = ref<Record<string, number>>({});
const taxCalculation = ref<any>(null);
const forecast = ref<any[]>([]);
const reconciliations = ref<any[]>([]);
const dateRange = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});
const taxPeriod = ref(new Date().toISOString().slice(0, 7));
const forecastMonths = ref(6);
const showCashFlowModal = ref(false);
const showExpenseModal = ref(false);
const showReconciliationModal = ref(false);
const saving = ref(false);

const cashFlowForm = ref({
  type: 'INCOME',
  category: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: '',
  reference: '',
});

const expenseForm = ref({
  category: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
  vendor: '',
  receipt: '',
  isTaxDeductible: false,
});

const reconciliationForm = ref({
  bankAccount: '',
  statementDate: new Date().toISOString().split('T')[0],
  statementBalance: 0,
  transactions: [{
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'DEPOSIT',
  }],
});

const loadCashFlowSummary = async () => {
  try {
    const params: any = {};
    if (dateRange.value.startDate) params.startDate = dateRange.value.startDate;
    if (dateRange.value.endDate) params.endDate = dateRange.value.endDate;
    const response = await api.get('/financial-management/cash-flow/summary', { params });
    cashFlowSummary.value = response.data;
  } catch (error: any) {
    console.error('Error loading cash flow summary:', error);
    await showError('Gagal memuat cash flow summary');
  }
};

const loadExpensesByCategory = async () => {
  try {
    const params: any = {};
    if (dateRange.value.startDate) params.startDate = dateRange.value.startDate;
    if (dateRange.value.endDate) params.endDate = dateRange.value.endDate;
    const response = await api.get('/financial-management/expenses/by-category', { params });
    expensesByCategory.value = response.data;
  } catch (error: any) {
    console.error('Error loading expenses:', error);
  }
};

const calculateTax = async () => {
  try {
    const response = await api.post('/financial-management/tax/calculate', {
      period: taxPeriod.value,
    });
    taxCalculation.value = response.data;
    await showSuccess('Tax calculation berhasil');
  } catch (error: any) {
    console.error('Error calculating tax:', error);
    await showError('Gagal menghitung tax');
  }
};

const loadForecast = async () => {
  try {
    const response = await api.get('/financial-management/forecast', {
      params: { months: forecastMonths.value },
    });
    forecast.value = response.data;
  } catch (error: any) {
    console.error('Error loading forecast:', error);
    await showError('Gagal memuat forecast');
  }
};

const saveCashFlow = async () => {
  saving.value = true;
  try {
    await api.post('/financial-management/cash-flow', {
      ...cashFlowForm.value,
      date: new Date(cashFlowForm.value.date).toISOString(),
    });
    await showSuccess('Cash flow berhasil direcord');
    closeCashFlowModal();
    await loadCashFlowSummary();
  } catch (error: any) {
    console.error('Error saving cash flow:', error);
    await showError('Gagal menyimpan cash flow');
  } finally {
    saving.value = false;
  }
};

const saveExpense = async () => {
  saving.value = true;
  try {
    await api.post('/financial-management/expenses', {
      ...expenseForm.value,
      date: new Date(expenseForm.value.date).toISOString(),
    });
    await showSuccess('Expense berhasil direcord');
    closeExpenseModal();
    await loadExpensesByCategory();
  } catch (error: any) {
    console.error('Error saving expense:', error);
    await showError('Gagal menyimpan expense');
  } finally {
    saving.value = false;
  }
};

const saveReconciliation = async () => {
  saving.value = true;
  try {
    const data = {
      ...reconciliationForm.value,
      statementDate: new Date(reconciliationForm.value.statementDate).toISOString(),
      transactions: reconciliationForm.value.transactions.map(tx => ({
        ...tx,
        date: new Date(tx.date).toISOString(),
      })),
    };
    const response = await api.post('/financial-management/bank-reconciliation', data);
    reconciliations.value.push(response.data);
    await showSuccess('Bank reconciliation berhasil dibuat');
    closeReconciliationModal();
  } catch (error: any) {
    console.error('Error saving reconciliation:', error);
    await showError('Gagal menyimpan reconciliation');
  } finally {
    saving.value = false;
  }
};

const addTransaction = () => {
  reconciliationForm.value.transactions.push({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'DEPOSIT',
  });
};

const removeTransaction = (index: number) => {
  reconciliationForm.value.transactions.splice(index, 1);
};

const closeCashFlowModal = () => {
  showCashFlowModal.value = false;
  cashFlowForm.value = {
    type: 'INCOME',
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
  };
};

const closeExpenseModal = () => {
  showExpenseModal.value = false;
  expenseForm.value = {
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    receipt: '',
    isTaxDeductible: false,
  };
};

const closeReconciliationModal = () => {
  showReconciliationModal.value = false;
  reconciliationForm.value = {
    bankAccount: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    transactions: [{
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      type: 'DEPOSIT',
    }],
  };
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

onMounted(() => {
  loadCashFlowSummary();
  loadExpensesByCategory();
});
</script>

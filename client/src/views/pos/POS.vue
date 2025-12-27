<template>
  <!-- Shift Guard Overlay - Blocks POS if no active shift -->
  <div v-if="shiftRequired && (checkingShift || !hasActiveShift)" class="fixed inset-0 bg-gradient-to-br from-[#1a2332] via-[#15202e] to-[#0f151e] flex items-center justify-center z-[100]">
    <!-- Loading State -->
    <div v-if="checkingShift" class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      <p class="text-white/70 text-lg">Memeriksa status shift...</p>
    </div>
    
    <!-- No Shift Open -->
    <div v-else class="text-center max-w-md mx-4 p-8">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-3">Shift Belum Dibuka</h2>
      <p class="text-gray-400 mb-8">Untuk mengakses POS, Anda harus membuka shift kasir terlebih dahulu.</p>
      <button
        @click="goToShiftPage"
        class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02]"
      >
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          Buka Shift Sekarang
        </span>
      </button>
      <button
        @click="handleLogout"
        class="w-full mt-4 py-3 px-6 bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 font-medium rounded-xl transition-all duration-300"
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Simple POS Mode -->
  <div v-if="isSimpleMode" class="min-h-screen p-4 bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <!-- Orientation Warning (Portrait) -->
    <div
      v-if="isPortrait"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 text-center max-w-md mx-4">
        <svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Rotate Device</h2>
        <p class="text-gray-600 mb-4">Simple POS Mode requires landscape orientation</p>
        <p class="text-sm text-gray-500">Please rotate your device to landscape position</p>
      </div>
    </div>

    <!-- Main Content (only visible in landscape) -->
    <div v-if="!isPortrait" class="h-screen flex flex-col">
      <!-- Offline Status Indicator -->
      <div
        v-if="!isOnline"
        class="mb-2 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-semibold text-yellow-800">You are offline — transactions saved locally</span>
      </div>
      <div
        v-else-if="isSyncing"
        class="mb-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-xl flex items-center gap-2"
      >
        <div class="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Syncing Data... ({{ pendingSyncCount }} pending)</span>
      </div>
      <div
        v-else-if="pendingSyncCount > 0"
        class="mb-2 p-3 bg-green-100 border-l-4 border-green-500 rounded-xl flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-semibold text-green-800">Sync complete! ({{ pendingSyncCount }} pending)</span>
      </div>
      
      <div class="bg-white rounded-xl shadow-md p-4 mb-4">
        <h1 class="text-3xl font-bold text-gray-900 text-center">SIMPLE POS</h1>
        <p class="text-center text-gray-600 mt-1">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <!-- Categories -->
        <div class="bg-white rounded-xl shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">CATEGORIES</h2>
          <div class="space-y-3">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="w-full py-6 px-4 text-lg font-bold rounded-xl transition-all"
              :class="selectedCategory === category 
                ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            >
              {{ category === 'SEMUA' ? 'ALL' : (category || 'ALL') }}
            </button>
          </div>
        </div>

        <!-- Products -->
        <div class="bg-white rounded-xl shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">PRODUCTS</h2>
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="filteredProductsSimple.length === 0" class="text-center py-12 text-gray-500">
            <p>No products found</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <button
              v-for="product in filteredProductsSimple"
              :key="product.id"
              @click="addToCart(product)"
              :disabled="product.stock <= 0"
              class="py-8 px-4 text-lg font-bold rounded-xl transition-all active:scale-95"
              :class="product.stock <= 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : isInCart(product.id)
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-emerald-500 text-white hover:bg-emerald-500 shadow-md'"
            >
              <div class="text-3xl mb-2">{{ product.emoji || '📦' }}</div>
              <div class="text-sm font-semibold">{{ product.name }}</div>
              <div class="text-xs mt-1 opacity-90">{{ formatCurrency(product.price) }}</div>
              <div v-if="product.stock <= 0" class="text-xs mt-1 text-red-200">OUT OF STOCK</div>
            </button>
          </div>
        </div>

        <!-- Cart & Payment -->
        <div class="bg-white rounded-xl shadow-md p-4 flex flex-col">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">CART</h2>
          
          <div class="flex-1 overflow-y-auto mb-4 space-y-2">
            <div
              v-for="item in cart"
              :key="item.id"
              class="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-600">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="w-8 h-8 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600"
                >
                  -
                </button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.id)"
                  class="w-8 h-8 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"
                >
                  +
                </button>
                <button
                  @click="removeFromCart(item.id)"
                  class="w-8 h-8 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
            <div v-if="cart.length === 0" class="text-center py-12 text-gray-400">
              <p>Cart is empty</p>
            </div>
          </div>

          <div class="border-t-2 border-gray-300 pt-4 mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xl font-bold text-gray-700">TOTAL:</span>
              <span class="text-2xl font-bold text-emerald-500">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Quick Discount</label>
            <div class="flex space-x-2">
              <input
                v-model.number="quickDiscount"
                type="number"
                min="0"
                placeholder="0"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-lg"
              />
              <select
                v-model="discountType"
                class="px-4 py-2 border border-gray-300 rounded-xl"
              >
                <option value="amount">Rp</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          <!-- Cash Amount Input (only for CASH payment) -->
          <div v-if="showCashInput" class="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <label class="block text-sm font-medium text-gray-700 mb-2">Cash Amount</label>
            <input
              v-model.number="cashAmount"
              type="number"
              min="0"
              :placeholder="`Min: ${formatCurrency(total)}`"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @keyup.enter="processPaymentSimple('CASH')"
            />
            <div v-if="cashAmount > 0" class="mt-2 text-sm">
              <div class="flex justify-between text-gray-700">
                <span>Total:</span>
                <span class="font-bold">{{ formatCurrency(total) }}</span>
              </div>
              <div class="flex justify-between text-green-700 font-bold">
                <span>Change:</span>
                <span>{{ formatCurrency(Math.max(0, cashAmount - total)) }}</span>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                @click="showCashInput = false; cashAmount = 0"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                @click="processPaymentSimple('CASH')"
                :disabled="!cashAmount || cashAmount < total || processing"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <button
              v-if="!showCashInput"
              @click="showCashInput = true; cashAmount = total"
              :disabled="cart.length === 0 || processing"
              class="w-full py-6 bg-green-600 text-white rounded-xl font-bold text-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💵 CASH
            </button>
            <button
              @click="processPaymentSimple('QRIS')"
              :disabled="cart.length === 0 || processing || showCashInput"
              class="w-full py-6 bg-emerald-500 text-white rounded-xl font-bold text-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📱 QRIS
            </button>
            <button
              @click="clearCart"
              :disabled="cart.length === 0"
              class="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CLEAR ALL
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal POS Mode -->
  <!-- Normal POS Mode (V3 Reskin) -->
  <div v-else class="bg-slate-50 text-slate-900 font-display overflow-hidden h-screen w-screen flex flex-col relative">
    <!-- Header -->
    <header class="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-30 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <!-- Burger Menu Button -->
        <button 
          @click="showNavSidebar = !showNavSidebar"
          class="w-10 h-10 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors"
          aria-label="Toggle navigation"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="flex items-center gap-2 text-emerald-600">
          <span class="material-symbols-outlined text-[28px]">point_of_sale</span>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Warungin POS 
            <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full ml-2">CASHIER</span>
          </h1>
        </div>
        <div class="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
        <div class="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <span class="material-symbols-outlined text-[18px] text-slate-400">storefront</span>
          <span>{{ authStore.user?.tenantName || 'Main Store' }}</span>
        </div>
      </div>

      <!-- Center: Status & Clock -->
      <div class="hidden lg:flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm" :class="isOnline ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'">
          <span class="w-2 h-2 rounded-full animate-pulse" :class="isOnline ? 'bg-emerald-500' : 'bg-red-500'"></span>
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
        <div class="text-slate-900 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{{ currentTime }}</div>
      </div>

      <!-- Right: Actions -->
       <div class="flex items-center gap-3">
          <!-- Held Orders Button -->
          <button 
            v-if="heldOrders.length > 0"
            @click="showHeldOrdersModal = true"
            class="h-10 px-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-2 hover:bg-amber-100 transition-all font-bold text-xs shadow-sm shadow-amber-500/10"
          >
             <span class="material-symbols-outlined text-[18px]">pause_circle</span>
             <span>{{ heldOrders.length }} Terparkir</span>
          </button>

          <button class="flex items-center gap-2 text-slate-900 hover:text-emerald-600 transition-colors p-1 pr-2 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200">
            <div class="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm border border-slate-200 ring-2 ring-white shadow-sm">
              {{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="text-sm text-left hidden lg:block">
               <p class="font-bold leading-none text-slate-800">{{ authStore.user?.name || 'Cashier' }}</p>
               <p class="text-[10px] text-slate-500 mt-0.5 font-medium">Shift #{{ Math.floor(Math.random() * 999) }}</p>
            </div>
            <span class="material-symbols-outlined text-slate-400">expand_more</span>
          </button>
       </div>
    </header>

    <!-- Navigation Sidebar Overlay -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition name="fade">
        <div 
          v-if="showNavSidebar"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          @click="showNavSidebar = false"
        ></div>
      </Transition>
      
      <!-- Sidebar -->
      <Transition name="slide-left">
        <aside 
          v-if="showNavSidebar"
          class="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-2xl z-[101] flex flex-col"
        >
          <!-- Sidebar Header -->
          <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span class="material-symbols-outlined text-white text-2xl">storefront</span>
              </div>
              <div>
                <h2 class="font-bold text-slate-900 dark:text-white">{{ authStore.user?.tenantName || 'Warungin' }}</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Menu Navigasi</p>
              </div>
            </div>
            <button 
              @click="showNavSidebar = false"
              class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <!-- Navigation Links -->
          <nav class="flex-1 p-4 overflow-y-auto">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Menu Utama</p>
            
            <router-link 
              to="/app/dashboard" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">dashboard</span>
              <span class="font-medium">Dashboard</span>
            </router-link>
            
            <router-link 
              to="/pos" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">point_of_sale</span>
              <span class="font-medium">POS</span>
              <span class="ml-auto text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Active</span>
            </router-link>
            
            <router-link 
              to="/app/orders" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="authStore.user?.role !== 'Cashier'"
            >
              <span class="material-symbols-outlined">receipt_long</span>
              <span class="font-medium">Orders</span>
            </router-link>
            
            <router-link 
              to="/app/products" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="authStore.user?.role !== 'Cashier'"
            >
              <span class="material-symbols-outlined">inventory_2</span>
              <span class="font-medium">Products</span>
            </router-link>
            
            <router-link 
              to="/app/customers" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="authStore.user?.role !== 'Cashier'"
            >
              <span class="material-symbols-outlined">group</span>
              <span class="font-medium">Customers</span>
            </router-link>
            
            <router-link 
              to="/app/reports" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="authStore.user?.role !== 'Cashier'"
            >
              <span class="material-symbols-outlined">bar_chart</span>
              <span class="font-medium">Reports</span>
            </router-link>
            
            <div class="my-4 border-t border-slate-200 dark:border-slate-700"></div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Kasir</p>
            
            <router-link 
              to="/app/cashier/cash-shift" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 transition-colors mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">payments</span>
              <span class="font-medium">Cash Shift</span>
            </router-link>
          </nav>
          
          <!-- User Section -->
          <div class="p-4 border-t border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 font-bold">
                {{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 dark:text-white truncate">{{ authStore.user?.name || 'User' }}</p>
                <p class="text-xs text-emerald-600 font-bold uppercase">{{ authStore.user?.role || 'Staff' }}</p>
              </div>
            </div>
            <button 
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              <span class="material-symbols-outlined text-[20px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[90px_1fr_420px] bg-slate-50">
       <!-- 1. Categories Sidebar -->
       <!-- 1. Categories Sidebar -->
       <aside class="hidden lg:flex flex-col items-center py-6 nav-emerald-tint border-r border-emerald-100/60 gap-4 overflow-y-auto no-scrollbar z-20">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat === 'SEMUA' ? '' : cat"
            class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl transition-all relative"
            :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'category-active bg-white shadow-sm text-emerald-600' : 'hover:bg-white hover:shadow-sm hover:text-emerald-500 text-slate-400'"
          >
             <span class="material-symbols-outlined text-2xl relative z-10 transition-transform group-hover:scale-110">
               {{ getCategoryIcon(cat) }}
             </span>
             <span 
               class="text-[10px] font-medium text-center w-full truncate px-1 transition-colors group-hover:font-bold"
               :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'font-bold' : ''"
             >
               {{ cat === 'SEMUA' ? 'All' : cat }}
             </span>
          </button>
          
          <div class="mt-auto flex flex-col items-center gap-4 w-full px-2">
            <div class="h-px w-10 bg-emerald-200/50"></div>
            <button class="group flex flex-col items-center gap-1 w-full py-2 hover:bg-red-50 rounded-xl transition-all">
                <span class="material-symbols-outlined text-red-400 group-hover:text-red-500">logout</span>
                <span class="text-[10px] font-medium text-red-400 group-hover:text-red-500">Logout</span>
            </button>
          </div>
       </aside>

       <!-- Mobile Categories (Horizontal Scroll) -->
       <div class="lg:hidden flex overflow-x-auto p-2 gap-2 bg-white border-b border-slate-200 no-scrollbar">
          <button 
             v-for="cat in categories"
             :key="cat"
             @click="selectedCategory = cat === 'SEMUA' ? '' : cat"
             class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
             :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'"
          >
             {{ cat === 'SEMUA' ? 'All' : cat }}
          </button>
       </div>

       <!-- 2. Product Grid Section -->
       <section class="flex-1 flex flex-col h-full overflow-hidden relative">
          <!-- Search Bar Sticky -->
          <div class="p-4 lg:p-6 pb-2 sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm">
             <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  aria-label="Search products"
                  placeholder="Search menu, sku or barcode..." 
                  class="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium placeholder:text-slate-400"
                >
             </div>
          </div>

          <!-- Grid -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-6 pt-2">
             <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-slate-400">
                <span class="material-symbols-outlined text-5xl mb-2">search_off</span>
                <p>No products found</p>
             </div>
             <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-20 lg:pb-0">
                <div 
                  v-for="product in filteredProducts" 
                  :key="product.id"
                  @click="addToCart(product)"
                  @keydown.enter="addToCart(product)"
                  @keydown.space.prevent="addToCart(product)"
                  role="button"
                  tabindex="0"
                  class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer product-card-hover group transition-all duration-200 shadow-sm relative focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                >
                   <!-- Image -->
                   <div class="relative aspect-square w-full overflow-hidden bg-slate-100">
                      <img 
                        v-if="product.image" 
                        :src="product.image" 
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt="Product"
                      >
                      <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                        {{ product.emoji || '📦' }}
                      </div>
                      
                      <!-- Category Badge -->
                      <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-xs font-bold text-slate-700 shadow-sm">
                        {{ product.category || 'Item' }}
                      </div>
                      
                      <!-- Add Overlay on Hover -->
                      <div class="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <span class="material-symbols-outlined text-emerald-600 font-bold">add</span>
                         </div>
                      </div>
                      
                      <!-- Stock Badge -->
                       <div v-if="product.stock <= 5" class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/95 shadow-lg backdrop-blur-md border border-slate-100/50" :class="product.stock === 0 ? 'text-red-500' : 'text-amber-600'">
                          {{ product.stock === 0 ? 'Habis' : `${product.stock} Tersisa` }}
                       </div>
                   </div>

                   <!-- Info -->
                   <div class="p-3">
                      <h3 class="text-slate-800 font-bold text-base truncate mb-2">{{ product.name }}</h3>
                      <div class="flex justify-between items-end">
                         <p class="text-slate-400 text-xs font-medium">SKU: {{ product.sku || 'N/A' }}</p>
                         <p class="text-emerald-600 font-bold text-lg leading-none">{{ formatCurrency(product.price) }}</p>
                      </div>
                   </div>
                   
                   <!-- In Cart Indicator -->
                    <div v-if="isInCart(product.id)" class="absolute top-3 left-3 w-7 h-7 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 z-10 border-2 border-white animate-bounce-in">
                       <span class="material-symbols-outlined text-[16px] font-black">check</span>
                    </div>
                </div>
             </div>
          </div>
       </section>

       <!-- 3. Cart Sidebar -->
       <aside class="glass-effect flex flex-col border-l border-slate-200 h-[40vh] lg:h-full relative shadow-2xl lg:shadow-none z-30">
          <!-- Cart Header -->
          <div class="p-5 border-b border-slate-100 bg-white/60 sticky top-0 z-10 space-y-3">
             <div class="flex items-center justify-between mb-2">
                <h2 class="text-lg font-extrabold text-slate-900">Current Order</h2>
                <span class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">#{{ lastOrderReceipt?.orderNumber || 'NEW' }}</span>
             </div>
             
             <!-- Customer Selector (Compact) -->
             <div class="flex gap-2">
                 <button 
                    @click="showCustomerModal = true" 
                    id="customer-selector-btn" 
                    class="flex-1 flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-emerald-400 hover:shadow-sm transition-all text-left group"
                 >
                    <div class="flex items-center gap-2">
                       <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">person</span>
                       <span class="font-medium truncate">{{ customerName || selectedMember?.name || 'Walk-in Customer' }}</span>
                    </div>
                    <span class="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
                 </button>
                 <!-- Simple toggle or add -->
                 <button @click="switchCustomerType(customerType === 'customer' ? 'member' : 'customer')" class="w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-primary hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-sm" title="Switch Type">
                    <span class="material-symbols-outlined text-[20px]">person_add</span>
                 </button>
             </div>
             
             <!-- Customer Input Expansion (Simple implementation) -->
             <div v-if="showCustomerModal" class="absolute top-full left-0 right-0 p-4 bg-white shadow-xl border-b border-slate-200 z-20">
                <div class="flex gap-2 mb-2">
                   <button @click="switchCustomerType('customer')" :class="customerType === 'customer' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'" class="flex-1 py-2 rounded-lg text-xs font-bold">Customer</button>
                   <button @click="switchCustomerType('member')" :class="customerType === 'member' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'" class="flex-1 py-2 rounded-lg text-xs font-bold">Member</button>
                </div>
                <div v-if="customerType === 'customer'">
                   <input v-model="customerInput" @blur="handleCustomerInput" placeholder="Name" class="w-full p-2 border rounded-lg text-sm mb-2" />
                </div>
                <div v-else>
                   <select v-model="selectedMemberId" @change="handleMemberSelect" class="w-full p-2 border rounded-lg text-sm mb-2">
                      <option value="">Select Member</option>
                      <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                   </select>
                </div>
                <button @click="showCustomerModal = false" class="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Done</button>
             </div>
          </div>

          <!-- Cart Items -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
             <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                 <span class="material-symbols-outlined text-6xl mb-2">shopping_bag</span>
                 <p class="font-medium">Cart is empty</p>
                 <p class="text-xs">Scan barcode or select item</p>
             </div>
             <div 
               v-for="item in cart" 
               :key="item.id"
               class="flex gap-3 group relative"
             >
                <!-- Item Image -->
                <div class="w-16 h-16 rounded-xl bg-slate-100 shrink-0 border border-slate-100 shadow-sm overflow-hidden">
                   <img v-if="item.image" :src="item.image" class="w-full h-full object-cover">
                   <div v-else class="w-full h-full flex items-center justify-center text-xl">{{ item.emoji || '📦' }}</div>
                </div>
                
                <!-- Details -->
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                   <div class="flex justify-between items-start">
                      <h4 class="text-slate-800 text-sm font-bold truncate pr-2">{{ item.name }}</h4>
                      <p class="text-slate-900 font-bold text-sm">{{ formatCurrency(item.price * item.quantity) }}</p>
                   </div>
                   
                   <div class="flex justify-between items-end mt-1">
                      <p class="text-slate-500 text-xs truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 max-w-[120px]">
                         {{ formatCurrency(item.price) }}/unit
                      </p>
                      
                      <!-- Qty Controls -->
                      <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 h-8 shadow-sm">
                          <button @click="decreaseQuantity(item.id)" class="text-slate-400 hover:text-red-500 flex items-center justify-center w-6 h-full transition-colors">
                             <span class="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span class="text-slate-800 text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
                          <button @click="increaseQuantity(item.id)" class="text-primary hover:text-emerald-700 flex items-center justify-center w-6 h-full transition-colors">
                             <span class="material-symbols-outlined text-[16px]">add</span>
                          </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Total & Actions -->
          <div class="px-5 py-3 grid grid-cols-4 gap-2 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
             <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm" @click="holdOrder">
                <span class="material-symbols-outlined text-[20px]">pause_circle</span>
                <span class="text-[10px] font-bold">Hold</span>
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm">
                <span class="material-symbols-outlined text-[20px]">percent</span>
                <span class="text-[10px] font-bold">Discount</span>
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-emerald-50 hover:text-primary text-slate-500 transition-all shadow-sm" @click="toggleSplitBill">
                <span class="material-symbols-outlined text-[20px]">call_split</span>
                <span class="text-[10px] font-bold">Split</span>
             </button>
             <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 transition-all shadow-sm" @click="clearCart">
                <span class="material-symbols-outlined text-[20px]">delete</span>
                <span class="text-[10px] font-bold">Clear</span>
             </button>
          </div>
          
          <div class="bg-white border-t border-slate-200 p-5 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">
             <div class="space-y-3 mb-5">
                <div class="flex justify-between text-slate-500 text-sm font-medium">
                   <span>Subtotal</span>
                   <span class="text-slate-800">{{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-slate-500 text-sm font-medium">
                   <span>Tax (10%)</span>
                   <span class="text-slate-800">{{ formatCurrency(tax || 0) }}</span>
                </div>
                <div class="flex justify-between text-sm text-emerald-600 font-medium" v-if="discount > 0">
                   <span>Discount</span>
                   <span>-{{ formatCurrency(discount) }}</span>
                </div>
                <div class="h-px w-full bg-slate-100 my-2"></div>
                <div class="flex justify-between items-center">
                   <span class="text-slate-900 font-bold text-lg">Total</span>
                   <span class="text-3xl font-extrabold text-primary-dark">{{ formatCurrency(total) }}</span>
                </div>
             </div>
             
             <!-- Kitchen Toggle (F&B Feature) -->
             <div class="flex items-center justify-between gap-2 mb-4 px-1 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm" v-if="authStore.user?.role !== 'Cashier' && authStore.user?.role !== 'KITCHEN'">
                <div class="flex items-center gap-2">
                   <div class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                      <span class="material-symbols-outlined text-xl">restaurant</span>
                   </div>
                   <span class="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Kirim ke Dapur?</span>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                   <input type="checkbox" v-model="sendToKitchen" class="sr-only peer">
                   <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </label>
             </div>

             <button 
               @click="showPaymentModal = true" 
               :disabled="cart.length === 0"
               class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-[0.98] transition-all flex justify-between items-center px-6 ring-4 ring-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <span>BAYAR</span>
                <span class="bg-black/10 px-3 py-1 rounded-lg text-base font-bold">{{ formatCurrency(total) }}</span>
             </button>
          </div>
       </aside>
    </main>

    <!-- Success Overlay (New) -->
     <div v-if="showSuccessOverlay" class="absolute inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center">
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-emerald-100 transform scale-100 animate-bounce-in">
           <div class="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <span class="material-symbols-outlined text-5xl text-emerald-500 animate-pulse">check_circle</span>
              <div class="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-20"></div>
           </div>
           
           <h2 class="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h2>
           <p class="text-slate-500 mb-8 font-medium">Transaction #{{ lastOrderReceipt?.orderNumber }} has been completed</p>
           
           <div class="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <p class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Change Due</p>
              <p class="text-4xl font-black text-slate-900">{{ formatCurrency(lastOrderReceipt?.change || 0) }}</p>
           </div>
           
           <div class="space-y-3">
              <button @click="printReceiptAndClose" class="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                 <span class="material-symbols-outlined">print</span> Print Receipt
              </button>
              <button @click="closeSuccessOverlay" class="w-full py-3.5 bg-white text-slate-600 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 transition">
                 New Order
              </button>
           </div>
        </div>
     </div>

    <!-- Modals -->
    <PaymentModal
      :show="showPaymentModal"
      :total="total"
      :discount="estimatedDiscount"
      :processing="processing"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <ReceiptPrinter
      :show="showReceiptModal"
      :order-id="lastOrderId"
      :receipt-data="lastOrderReceipt"
      @close="showReceiptModal = false"
      ref="printerRef"
    />

    <!-- Low Stock Reminder Modal (Shared) -->
    <div
      v-if="showLowStockModal && criticalStockProducts.length > 0"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      @click.self="showLowStockModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 transform transition-all scale-100">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-50 rounded-xl">
               <span class="material-symbols-outlined text-red-600">warning</span>
            </div>
            <h3 class="text-xl font-bold text-[#0d141b]">Low Stock Alert</h3>
          </div>
          <button
            @click="dismissLowStockModal"
            class="text-slate-400 hover:text-[#4c739a] transition-colors"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-[#4c739a] mb-4">
            There are <span class="font-bold text-red-600">{{ criticalStockProducts.length }}</span> products that need immediate attention:
          </p>
          <div class="max-h-64 overflow-y-auto space-y-3 pr-1">
            <div
              v-for="product in criticalStockProducts"
              :key="product.id"
              class="p-4 rounded-xl border flex items-center justify-between bg-white"
              :class="product.stock === 0 ? 'border-red-200 bg-red-50/30' : 'border-yellow-200 bg-yellow-50/30'"
            >
              <div>
                <p class="font-bold text-[#0d141b]">{{ product.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
                     Stock: {{ product.stock }}
                   </span>
                   <span class="text-xs text-[#4c739a]">Min: {{ product.minStock }}</span>
                </div>
              </div>
              <button
                @click="goToRestock(product.id)"
                class="px-3 py-1.5 bg-white border border-slate-100 dark:border-slate-700 text-[#0d141b] rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                Restock
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button
            @click="dismissLowStockModal"
            class="flex-1 px-4 py-2.5 bg-slate-100 text-[#0d141b] rounded-xl hover:bg-slate-200 transition font-semibold"
          >
            Dismiss
          </button>
          <button
            @click="goToStockAlerts"
            class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-primary/20 font-semibold"
          >
            View All Alerts
          </button>
        </div>
      </div>
    </div>

    <!-- Held Orders Modal -->
    <div v-if="showHeldOrdersModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Held Orders</h3>
                <button @click="showHeldOrdersModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <span class="material-symbols-outlined text-slate-500">close</span>
                </button>
            </div>
            <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <div v-if="heldOrders.length === 0" class="text-center py-8 text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>No held orders found.</p>
                </div>
                <div v-for="order in heldOrders" :key="order.id" class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <p class="font-bold text-[#0d141b] dark:text-white">{{ order.checkName }}</p>
                        <p class="text-xs text-slate-500">{{ new Date(order.date).toLocaleTimeString() }} • {{ order.items.length }} Items</p>
                        <p class="font-bold text-primary mt-1">{{ formatCurrency(order.total) }}</p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="deleteHeldOrder(order)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                        <button @click="restoreHeldOrder(order)" class="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-primary/20">
                            Resume
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button @click="showHeldOrdersModal = false" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                    Close
                </button>
            </div>
        </div>
    </div>

    <!-- Split Bill Modal -->
    <div v-if="showSplitBillModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Split Bill</h3>
                    <p class="text-xs text-slate-500 mt-1">Distribusi item untuk pembayaran terpisah</p>
                </div>
                <div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button @click="splitMode = 'ITEM'" :class="splitMode === 'ITEM' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Per Item</button>
                    <button @click="splitMode = 'EQUAL'" :class="splitMode === 'EQUAL' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Sama Rata</button>
                </div>
            </div>
            
            <div class="flex-1 overflow-hidden flex p-6 gap-6">
                <!-- Mode Item: Side by Side -->
                <template v-if="splitMode === 'ITEM'">
                    <div v-for="(scat, idx) in splitCarts" :key="idx" class="flex-1 flex flex-col border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                        <div class="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">BILL {{ String.fromCharCode(65 + idx) }}</span>
                            <span class="text-xs font-bold text-emerald-600">{{ formatCurrency(scat.reduce((sum, i) => sum + i.price * i.quantity, 0)) }}</span>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4 space-y-2">
                             <div v-for="(item, iidx) in scat" :key="item.id + iidx" class="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</p>
                                    <p class="text-[10px] text-slate-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
                                </div>
                                <button @click="moveItemToSplit(iidx, idx, idx === 0 ? 1 : 0)" class="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                                    <span class="material-symbols-outlined text-lg">{{ idx === 0 ? 'arrow_forward' : 'arrow_back' }}</span>
                                </button>
                             </div>
                        </div>
                    </div>
                </template>

                <!-- Mode Equal: Simple Input -->
                <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div class="size-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                        <span class="material-symbols-outlined text-4xl">payments</span>
                    </div>
                    <h4 class="text-lg font-bold mb-2">Split Sama Rata</h4>
                    <p class="text-sm text-slate-500 mb-8 max-w-sm">Bagi total tagihan menjadi beberapa bagian sama besar secara otomatis.</p>
                    
                    <div class="flex items-center gap-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button @click="splitParts = Math.max(2, splitParts - 1)" class="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600">-</button>
                        <div class="text-center min-w-[100px]">
                            <p class="text-2xl font-black">{{ splitParts }}</p>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bagian</p>
                        </div>
                        <button @click="splitParts++" class="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600">+</button>
                    </div>
                    
                    <div class="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-700/30 w-full max-w-xs">
                        <p class="text-xs text-emerald-600 font-bold mb-1">Per Bagian</p>
                        <p class="text-xl font-black text-emerald-700 dark:text-emerald-400">{{ formatCurrency(total / splitParts) }}</p>
                    </div>
                </div>
            </div>

             <div class="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button @click="showSplitBillModal = false" class="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                    Batalkan
                </button>
                <button @click="confirmSplitBill" class="px-8 py-2.5 bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all">
                    Konfirmasi Split
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { safeSome, safeFilter, safeMap, safeReduce, safeFind } from '../../utils/array-helpers';
import { useSocket } from '../../composables/useSocket';
import { useNotification } from '../../composables/useNotification';
import { offlineStorage } from '../../utils/offline-storage';
import { syncManager } from '../../utils/sync-manager';
import PaymentModal from '../../components/PaymentModal.vue';
import ReceiptPrinter from '../../components/ReceiptPrinter.vue';
import StoreSelector from '../../components/StoreSelector.vue';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  emoji?: string;
}

const authStore = useAuthStore();
const { socket } = useSocket();
const { success: showSuccess, error: showError, warning: showWarning, confirm: showConfirm } = useNotification();

// State
const isSimpleMode = ref(false);
const isPortrait = ref(false);
const showNavSidebar = ref(false);
const products = ref<any[]>([]);
const cart = ref<CartItem[]>([]);
const loading = ref(false);
const processing = ref(false);
const searchQuery = ref('');
const selectedCategory = ref<string>('');
const quickDiscount = ref<number>(0);
const discountType = ref<'amount' | 'percent'>('amount');
const showCashInput = ref(false);
const cashAmount = ref<number>(0);
const customerType = ref<'customer' | 'member'>('customer');
const customerInput = ref('');
const customerName = ref('');
const selectedMember = ref<any>(null);
const selectedMemberId = ref<string>('');
const members = ref<any[]>([]);
const sendToKitchen = ref(false);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);
const showSuccessOverlay = ref(false);
const currentTime = ref('');
const showCustomerModal = ref(false);
const printerRef = ref<any>(null);
const showLowStockModal = ref(false);
const criticalStockProducts = ref<any[]>([]);
const selectedPaymentMethod = ref<string>('CASH');
const lastOrderReceipt = ref<any>(null);
const lastOrderId = ref<string | undefined>(undefined);
const estimatedDiscount = ref(0);

// New Features State
const heldOrders = ref<any[]>(JSON.parse(localStorage.getItem('pos_held_orders') || '[]'));
const showHeldOrdersModal = ref(false);
const discounts = ref<any[]>([]);
const showSplitBillModal = ref(false);
const splitParts = ref(2); // Default 2 split
const splitMode = ref<'EQUAL' | 'ITEM'>('EQUAL');
const splitCarts = ref<CartItem[][]>([[], []]); // For ITEM split
const activeSplitIndex = ref(0);
const isSplitActive = ref(false);

// Offline mode state
const isOnline = ref(navigator.onLine);
const isSyncing = ref(false);

const pendingSyncCount = ref(0);
let clockInterval: any;

// Shift Guard State
const shiftRequired = ref(true); // Enable shift guard
const hasActiveShift = ref(false);
const checkingShift = ref(true);


// Computed
const categories = computed(() => {
  const categoriesList = safeMap(products.value, (p: any) => p?.category).filter(Boolean);
  const cats = new Set(categoriesList);
  return ['SEMUA', ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  let items = products.value;
  
  // Filter by Category
  if (selectedCategory.value && selectedCategory.value !== 'SEMUA') {
    items = safeFilter(items, (p: any) => p?.category === selectedCategory.value);
  }
  
  // Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = safeFilter(items, (p: any) => 
      p?.name?.toLowerCase().includes(query) || 
      p?.sku?.toLowerCase().includes(query) ||
      p?.barcode?.toLowerCase().includes(query)
    );
  }
  
  // Active & Positive Stock (or allow OOS viewing?)
  // Keeping original logic: must be active and stock > 0
  return safeFilter(items, (p: any) => p?.isActive && p?.stock > 0);
});

const filteredProductsSimple = computed(() => {
  let filtered = safeFilter(products.value, (p: any) => p?.isActive && p?.stock > 0);
  if (selectedCategory.value && selectedCategory.value !== 'SEMUA') {
    filtered = safeFilter(filtered, (p: any) => p?.category === selectedCategory.value);
  }
  return filtered;
});

const subtotal = computed(() => {
  return safeReduce(cart.value, (sum: number, item: any) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
});



// Separated Discount Calculations to mirror Backend Service
const promotionDiscounts = computed(() => {
  let totalPromoDiscount = 0;
  const details: any[] = [];
  const globalProductsWithDiscount = new Set<string>();

  if (discounts.value.length === 0) return { amount: 0, details: [] };

  // Track if any promotion is "Exclusive" (not in schema yet, but good for future)
  // For now, follow backend: sequential application
  discounts.value.forEach((d: any) => {
    if (d.applicableTo === 'MEMBER_ONLY' && !selectedMember.value) return;

    let discountAmount = 0;
    const appliedTo: string[] = [];

    if (d.discountType === 'AMOUNT_BASED') {
      const minAmount = d.minAmount ? Number(d.minAmount) : 0;
      const minQuantity = d.minQuantity || 1;

      if (subtotal.value >= minAmount && cart.value.length >= minQuantity) {
        let currentParsing: any = d.applicableProducts;
        if (typeof currentParsing === 'string') {
          try { currentParsing = JSON.parse(currentParsing); } catch (e) { currentParsing = []; }
        }
        const applicableProductIds = (Array.isArray(currentParsing) && currentParsing.length > 0)
          ? currentParsing
          : cart.value.map(item => item.id);

        cart.value.forEach(item => {
          if (applicableProductIds.includes(item.id)) {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            if (d.discountValueType === 'PERCENTAGE') {
              let evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
              discountAmount += evalAmt;
            } else {
              discountAmount += Number(d.discountValue);
            }
            appliedTo.push(item.id);
          }
        });
        
        // Cap total discount for this rule if PERCENTAGE
        if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
          discountAmount = Number(d.maxDiscountAmount);
        }
      }
    } else if (d.discountType === 'BUNDLE') {
      let bundleParsing: any = d.bundleProducts;
      if (typeof bundleParsing === 'string') {
        try { bundleParsing = JSON.parse(bundleParsing); } catch (e) { bundleParsing = []; }
      }
      const bundleProductIds = Array.isArray(bundleParsing) ? bundleParsing : [];
      const discountProductId = d.bundleDiscountProduct;

      const orderProductIds = cart.value.map(item => item.id);
      const hasAllBundleProducts = bundleProductIds.length > 0 && bundleProductIds.every((id: string) => orderProductIds.includes(id));

      if (hasAllBundleProducts && discountProductId) {
        const discountItem = cart.value.find(item => item.id === discountProductId);
        if (discountItem) {
          const itemSubtotal = (discountItem.price || 0) * (discountItem.quantity || 0);
          if (d.discountValueType === 'PERCENTAGE') {
            let evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
            if (d.maxDiscountAmount && evalAmt > d.maxDiscountAmount) evalAmt = d.maxDiscountAmount;
            discountAmount = evalAmt;
          } else {
            discountAmount = Number(d.discountValue);
          }
          appliedTo.push(discountProductId);
        }
      }
    } else if (d.discountType === 'PRODUCT_BASED') {
      let productParsing: any = d.applicableProducts;
      if (typeof productParsing === 'string') {
        try { productParsing = JSON.parse(productParsing); } catch (e) { productParsing = []; }
      }
      const applicableProductIds = Array.isArray(productParsing) ? productParsing : [];

      cart.value.forEach(item => {
        if ((applicableProductIds.length === 0 || applicableProductIds.includes(item.id)) 
            && !globalProductsWithDiscount.has(item.id)) {
          const itemSubtotal = (item.price || 0) * (item.quantity || 0);
          if (d.discountValueType === 'PERCENTAGE') {
            let evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
            // Note: maxDiscountAmount usually applies per rule, not per product for PRODUCT_BASED in backend
            discountAmount += evalAmt;
          } else {
            discountAmount += Number(d.discountValue) * (item.quantity || 0);
          }
          appliedTo.push(item.id);
          globalProductsWithDiscount.add(item.id);
        }
      });
      
      // Cap total discount for this rule if PERCENTAGE
      if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
        discountAmount = Number(d.maxDiscountAmount);
      }
    } else if (d.discountType === 'QUANTITY_BASED') {
      const minQuantity = d.minQuantity || 1;
      let qtyParsing: any = d.applicableProducts;
      if (typeof qtyParsing === 'string') {
        try { qtyParsing = JSON.parse(qtyParsing); } catch (e) { qtyParsing = []; }
      }
      const applicableProductIds = Array.isArray(qtyParsing) ? qtyParsing : [];

      cart.value.forEach(item => {
        if (applicableProductIds.length === 0 || applicableProductIds.includes(item.id)) {
          if ((item.quantity || 0) >= minQuantity) {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            if (d.discountValueType === 'PERCENTAGE') {
              let evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
              discountAmount += evalAmt;
            } else {
              discountAmount += Number(d.discountValue) * (item.quantity || 0);
            }
            appliedTo.push(item.id);
          }
        }
      });
      
      // Cap total discount for this rule if PERCENTAGE
      if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
        discountAmount = Number(d.maxDiscountAmount);
      }
    }

    if (discountAmount > 0) {
      totalPromoDiscount += discountAmount;
      details.push({
        id: d.id,
        name: d.name,
        amount: discountAmount,
        appliedTo
      });
    }
  });

  return { amount: totalPromoDiscount, details };
});

const memberDiscount = computed(() => {
  if (!selectedMember.value?.discountValue) return 0;
  
  // Member discount applies after promo discounts
  const subtotalAfterPromo = Math.max(0, subtotal.value - promotionDiscounts.value.amount);
  
  if (selectedMember.value.discountType === 'PERCENTAGE') {
    return (subtotalAfterPromo * Number(selectedMember.value.discountValue)) / 100;
  } else {
    // Fixed member discount cannot exceed remaining subtotal
    return Math.min(Number(selectedMember.value.discountValue), subtotalAfterPromo);
  }
});

const autoDiscount = computed(() => {
  return promotionDiscounts.value.amount + memberDiscount.value;
});

const discount = computed(() => {
  // Priority: Quick Discount > Member/Auto Discount
  if (quickDiscount.value > 0) {
      if (discountType.value === 'percent') {
        return (subtotal.value * quickDiscount.value) / 100;
      }
      return Math.min(quickDiscount.value, subtotal.value);
  }
  return autoDiscount.value;
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value);
});

const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    'SEMUA': 'grid_view', 'ALL': 'grid_view',
    'MAKANAN': 'restaurant', 'FOOD': 'restaurant', 'FOODS': 'restaurant',
    'MINUMAN': 'local_cafe', 'DRINK': 'local_cafe', 'DRINKS': 'local_cafe',
    'SNACK': 'cookie', 'SNACKS': 'cookie',
    'DESSERT': 'icecream', 'DESSERTS': 'icecream'
  };
  return map[category.toUpperCase()] || 'category';
};

// Methods
const checkOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth;
  
  // Try to lock orientation to landscape in Simple POS Mode
  if (isSimpleMode.value && isPortrait.value) {
    // Request landscape orientation (if supported)
    // Use type assertion to avoid TypeScript errors
    const screenAny = screen as any;
    const orientation = screenAny.orientation || screenAny.mozOrientation || screenAny.msOrientation;
    
    if (orientation && typeof orientation.lock === 'function') {
      (orientation as { lock: (orientation: string) => Promise<void> }).lock('landscape').catch((err: any) => {
        // Lock failed (user may have denied or browser doesn't support)

      });
    } else if (screenAny.lockOrientation) {
      // Fallback for older browsers
      screenAny.lockOrientation('landscape');
    } else if (screenAny.mozLockOrientation) {
      // Firefox
      screenAny.mozLockOrientation('landscape');
    } else if (screenAny.msLockOrientation) {
      // IE/Edge
      screenAny.msLockOrientation('landscape');
    }
  }
};

const loadTenantFeatures = async () => {
  try {
    const response = await api.get('/tenant/profile');
    const features = response.data.features || {};
    isSimpleMode.value = features.simplePosMode === true;
  } catch (error: any) {

    isSimpleMode.value = false;
  }
};

const loadProducts = async (retryCount = 0) => {
  // For SUPER_ADMIN, ensure tenantId is available
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (!selectedTenantId) {

      return;
    }
    authStore.setSelectedTenant(selectedTenantId);
  }

  // For ADMIN_TENANT and other roles, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    showError('Tenant ID unavailable. Please login again.');
    return;
  }

  loading.value = true;
  try {
    // Ensure tenantId is set in params for SUPER_ADMIN
    const params: any = { isActive: true };
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    // Try to load from API first
    const response = await api.get('/products', { params });
    const productsData = response.data.data || response.data;
    products.value = Array.isArray(productsData) ? productsData : [];
    
    // Cache products for offline use
    if (Array.isArray(products.value)) {
      await offlineStorage.cacheProducts(products.value);
    }
    
    await checkCriticalStock();
  } catch (err: any) {
    // Retry logic
    if (retryCount < 3 && isOnline.value) {
        console.warn(`Product load failed, retrying (${retryCount + 1}/3)...`);
        setTimeout(() => loadProducts(retryCount + 1), 1500);
        return;
    }

    // If offline, try to load from cache
    if (!isOnline.value) {

      const cachedProducts = await offlineStorage.getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        products.value = cachedProducts;
        showWarning('Offline Mode: Using cached product data');
      } else {
        showError('No cached product data found. Internet connection required for first load.');
      }
    } else {
      const errorMessage = err.response?.data?.message || 'Failed to load products';
      console.error('Error loading products:', err);
      showError(`${errorMessage}. Please check connection.`, 'Error');
    }
  } finally {
    if (retryCount >= 3 || !isOnline.value || products.value.length > 0) {
        loading.value = false;
    }
  }
};

const checkCriticalStock = async () => {
  try {
    const response = await api.get('/inventory/restock-suggestions/critical', {
      params: { limit: 5 },
    });
    criticalStockProducts.value = response.data || [];
    if (criticalStockProducts.value.length > 0) {
      const dismissedToday = localStorage.getItem(`lowStockDismissed_${new Date().toDateString()}`);
      if (!dismissedToday) {
        showLowStockModal.value = true;
      }
    }
  } catch (error: any) {

  }
};

const dismissLowStockModal = () => {
  showLowStockModal.value = false;
  localStorage.setItem(`lowStockDismissed_${new Date().toDateString()}`, 'true');
};

const goToRestock = (productId: string) => {
  dismissLowStockModal();
  window.location.href = `/app/products?highlight=${productId}`;
};

const goToStockAlerts = () => {
  dismissLowStockModal();
  window.location.href = '/app/inventory/stock-alerts';
};

const isInCart = (productId: string) => {
  return safeSome(cart.value, (item: any) => item && item.id === productId);
};

const addToCart = async (product: any) => {
  try {
    const response = await api.get(`/products/${product.id}`);
    const updatedProduct = response.data;
    
    if (updatedProduct.stock <= 0) {
      showError('Product is out of stock', 'Out of Stock');
      if (Array.isArray(products.value)) {
      const productIndex = products.value.findIndex(p => p.id === product.id);
      if (productIndex !== -1) {
        products.value[productIndex].stock = updatedProduct.stock;
        }
      }
      return;
    }

    if (!Array.isArray(cart.value)) cart.value = [];
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= updatedProduct.stock) {
        await showWarning('Insufficient stock');
        if (Array.isArray(products.value)) {
        const productIndex = products.value.findIndex(p => p.id === product.id);
        if (productIndex !== -1) {
          products.value[productIndex].stock = updatedProduct.stock;
          }
        }
        return;
      }
      existingItem.quantity++;
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        emoji: product.emoji,
      });
    }
    
    if (Array.isArray(products.value)) {
    const productIndex = products.value.findIndex(p => p.id === product.id);
    if (productIndex !== -1) {
      products.value[productIndex].stock = updatedProduct.stock;
      }
    }
  } catch (error: any) {
    console.error('Error checking product stock:', error);
    if (product.stock <= 0) {
      await showWarning('Product is out of stock');
      return;
    }
    if (!Array.isArray(cart.value)) cart.value = [];
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        await showWarning('Insufficient stock');
        return;
      }
      existingItem.quantity++;
    } else {
      cart.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        emoji: product.emoji,
      });
    }
  }
};

const increaseQuantity = async (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    try {
      const response = await api.get(`/products/${productId}`);
      const updatedProduct = response.data;
      
      if (item.quantity >= updatedProduct.stock) {
        showError('Insufficient stock', 'Out of Stock');
        if (Array.isArray(products.value)) {
        const productIndex = products.value.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          products.value[productIndex].stock = updatedProduct.stock;
          }
        }
        return;
      }
      item.quantity++;
      
      if (Array.isArray(products.value)) {
      const productIndex = products.value.findIndex(p => p.id === productId);
      if (productIndex !== -1) {
        products.value[productIndex].stock = updatedProduct.stock;
        }
      }
    } catch (error: any) {
      if (!Array.isArray(products.value)) return;
      const product = products.value.find(p => p.id === productId);
      if (product && item.quantity >= product.stock) {
        showError('Insufficient stock', 'Out of Stock');
        return;
      }
      item.quantity++;
    }
  }
};

const decreaseQuantity = (productId: string) => {
  const item = cart.value.find(item => item.id === productId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      removeFromCart(productId);
    }
  }
};

const removeFromCart = (productId: string) => {
  if (!Array.isArray(cart.value)) cart.value = [];
  cart.value = cart.value.filter(item => item.id !== productId);
};

const clearCart = async () => {
  if (!isSimpleMode.value) {
    const confirmed = await showConfirm('Hapus semua item dari keranjang?');
    if (!confirmed) return;
  }
  cart.value = [];
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  quickDiscount.value = 0;
  customerType.value = 'customer';
  sendToKitchen.value = false;
  showCashInput.value = false;
  cashAmount.value = 0;
};

const handleCustomerInput = async () => {
  if (!customerInput.value.trim()) {
    customerName.value = '';
    return;
  }
  customerName.value = customerInput.value.trim();
  selectedMember.value = null;
  estimatedDiscount.value = 0;
};

const handleMemberSelect = () => {
  if (!selectedMemberId.value) {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
    return;
  }

  const member = members.value.find(m => m.id === selectedMemberId.value);
  if (member) {
    selectedMember.value = member;
    customerName.value = '';
    if (member.discountType === 'PERCENTAGE') {
      estimatedDiscount.value = (subtotal.value * Number(member.discountValue)) / 100;
    } else {
      estimatedDiscount.value = Number(member.discountValue);
    }
  } else {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
  }
};

const switchCustomerType = (type: 'customer' | 'member') => {
  if (customerType.value === type) return;
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  customerType.value = type;
};

const clearCustomer = () => {
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
};

const handleStoreChange = (_storeId: string | null) => {
  loadProducts();
  loadMembers();
};

const loadMembers = async () => {
  try {
    const response = await api.get('/members', {
      params: { limit: 100, isActive: 'true' },
    });
    const result = response.data.data || response.data;
    members.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error('Error loading members:', error);
    members.value = [];
  }
};

const loadDiscounts = async () => {
  try {
    const response = await api.get('/discounts');
    const result = response.data.data || response.data;
    discounts.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error('Error loading discounts:', error);
    discounts.value = [];
  }
};

const refreshProducts = async () => {
  loading.value = true;
  await Promise.all([
    loadProducts(),
    loadMembers(),
    loadDiscounts(),
    fetchInventoryAddonStatus()
  ]);
  showSuccess('Data refreshed');
};

const handlePaymentConfirm = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  selectedPaymentMethod.value = paymentData.paymentMethod;
  showPaymentModal.value = false;
  await processPayment(paymentData);
};

const processPaymentSimple = async (paymentMethod: string) => {
  if (cart.value.length === 0) return;
  
  // Validate cash amount for CASH payment
  if (paymentMethod === 'CASH') {
    if (!cashAmount.value || cashAmount.value < total.value) {
      showError(`Cash amount must be at least ${formatCurrency(total.value)}`);
      return;
    }
  }
  
  processing.value = true;
  try {
    const orderData: any = {
      items: Array.isArray(cart.value) ? cart.value.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })) : [],
      discount: discount.value,
      sendToKitchen: sendToKitchen.value,
    };

    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    const transactionData: any = {
      amount: total.value,
      paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Cashier',
    };
    
    // Add cash amount and change for CASH payment
    if (paymentMethod === 'CASH' && cashAmount.value) {
      transactionData.cashAmount = cashAmount.value;
      transactionData.change = cashAmount.value - total.value;
    }

    // Combine order and transaction data for offline storage
    const fullOrderData = {
      ...orderData,
      transactionData,
    };

    if (isOnline.value) {
      // Online: Create order and transaction normally
      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;
      transactionData.orderId = order.id;
      await api.post('/transactions', transactionData);
      showSuccess('Payment successful!');
    } else {
      // Offline: Store locally
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
    }
    
    // Clear sendToKitchen after success
    sendToKitchen.value = false;
    
    // Reset cash input
    showCashInput.value = false;
    cashAmount.value = 0;
    
    clearCart();
    if (isOnline.value) {
      await loadProducts();
    }
  } catch (error: any) {
    // If network error and we're supposed to be online, try offline mode
    if (!isOnline.value || error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
      // Store offline
      const orderData: any = {
        items: Array.isArray(cart.value) ? cart.value.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })) : [],
        discount: discount.value,
      };
      const transactionData: any = {
        amount: total.value,
        paymentMethod,
        status: 'COMPLETED',
        servedBy: authStore.user?.name || 'Cashier',
      };
      if (paymentMethod === 'CASH' && cashAmount.value) {
        transactionData.cashAmount = cashAmount.value;
        transactionData.change = cashAmount.value - total.value;
      }
      const fullOrderData = { ...orderData, transactionData };
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      clearCart();
    } else {
      showError(error.response?.data?.message || 'Payment failed');
    }
  } finally {
    processing.value = false;
  }
};

const toggleSplitBill = () => {
    if (cart.value.length === 0) return;
    
    // Initialize split carts
    splitCarts.value = [
        [...cart.value], // All in Part A
        []              // None in Part B
    ];
    showSplitBillModal.value = true;
};

const moveItemToSplit = (itemIndex: number, fromIndex: number, toIndex: number) => {
    const item = splitCarts.value[fromIndex][itemIndex];
    if (item.quantity > 1) {
        // Just move one quantity
        const existingInTarget = splitCarts.value[toIndex].find(i => i.id === item.id);
        if (existingInTarget) {
            existingInTarget.quantity++;
        } else {
            splitCarts.value[toIndex].push({ ...item, quantity: 1 });
        }
        item.quantity--;
    } else {
        // Move entire item
        const existingInTarget = splitCarts.value[toIndex].find(i => i.id === item.id);
        if (existingInTarget) {
            existingInTarget.quantity += item.quantity;
        } else {
            splitCarts.value[toIndex].push({ ...item });
        }
        splitCarts.value[fromIndex].splice(itemIndex, 1);
    }
};

const confirmSplitBill = () => {
    if (splitMode.value === 'ITEM') {
        const hasItemsInAll = splitCarts.value.every(c => c.length > 0);
        if (!hasItemsInAll && splitCarts.value.length > 0) {
            showError('Each split part must have at least one item.');
            return;
        }
    } else {
        // EQUAL split logic - distribute items automatically
        const totalParts = splitParts.value;
        const newSplitCarts = Array.from({ length: totalParts }, (): CartItem[] => []);
        
        // Flatten cart into individual units for easier distribution
        const allUnits: CartItem[] = [];
        cart.value.forEach(item => {
            const qty = Number(item.quantity) || 0;
            for (let i = 0; i < qty; i++) {
                allUnits.push({ ...item, quantity: 1 });
            }
        });

        // Distribute units
        allUnits.forEach((unit, index) => {
            const targetIndex = index % totalParts;
            const existing = newSplitCarts[targetIndex].find(i => i.id === unit.id);
            if (existing) {
                existing.quantity++;
            } else {
                newSplitCarts[targetIndex].push({ ...unit });
            }
        });
        
        splitCarts.value = newSplitCarts;
    }
    
    // Start process with Part A
    isSplitActive.value = true;
    activeSplitIndex.value = 0;
    cart.value = [...splitCarts.value[0]];
    
    // Set custom label for split
    const suffix = ` (Split ${String.fromCharCode(65 + activeSplitIndex.value)})`;
    if (!customerName.value || customerName.value === '') {
        customerName.value = 'Pelanggan' + suffix;
    } else {
        customerName.value += suffix;
    }
    
    showSplitBillModal.value = false;
    showSuccess('Bill split successfully. Please process payments sequentially.');
};

const nextSplitPart = () => {
    if (!isSplitActive.value) return;
    
    activeSplitIndex.value++;
    if (activeSplitIndex.value < splitCarts.value.length) {
        cart.value = [...splitCarts.value[activeSplitIndex.value]];
        // Update label
        const suffix = ` (Split ${String.fromCharCode(65 + activeSplitIndex.value)})`;
        if (!customerName.value.includes('(Split')) {
            customerName.value += suffix;
        } else {
            customerName.value = customerName.value.replace(/\(Split .*\)/, suffix);
        }
        showSuccess(`Moving to ${suffix}`);
    } else {
        isSplitActive.value = false;
        activeSplitIndex.value = 0;
        showSuccess('All split parts processed.');
    }
};
const processPayment = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  if (cart.value.length === 0) return;
  processing.value = true;
  try {
    const orderData: any = {
      items: cart.value.map(item => ({
        productId: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      sendToKitchen: Boolean(sendToKitchen.value),
      discount: 0,
    };

    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    if (customerType.value === 'customer' && customerName.value?.trim()) {
      orderData.temporaryCustomerName = customerName.value.trim();
    }
    
    if (customerType.value === 'member' && selectedMember.value?.id) {
      orderData.memberId = selectedMember.value.id;
    }

    const finalTotal = subtotal.value - estimatedDiscount.value;
    
    const transactionData: any = {
      amount: finalTotal,
      paymentMethod: paymentData.paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Unknown',
    };
    
    if (paymentData.paymentMethod === 'QRIS' && paymentData.qrCode) {
      transactionData.qrCode = paymentData.qrCode;
    }

    let order: any = null;
    let orderDiscount = 0;
    let finalTotalFromOrder = finalTotal;

    if (isOnline.value) {
      // Online: Create order and transaction normally
      try {
        const orderResponse = await api.post('/orders', orderData);
        order = orderResponse.data;
        
        orderDiscount = parseFloat(order.discount || 0);
        estimatedDiscount.value = orderDiscount;

        finalTotalFromOrder = parseFloat(order.total);
        transactionData.orderId = order.id;
        transactionData.amount = finalTotalFromOrder;
        
        await api.post('/transactions', transactionData);
        
        lastOrderId.value = order.id;
        
        if (sendToKitchen.value && socket?.connected) {
          socket.emit('order:new', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: cart.value,
          });
        }
      } catch (error: any) {
        // If network error, fallback to offline mode
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
          isOnline.value = false;
          // Fall through to offline handling
        } else {
          throw error;
        }
      }
    }
    
    if (!isOnline.value || !order) {
      // Offline: Store locally
      const fullOrderData = {
        ...orderData,
        transactionData,
      };
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      clearCart();
      return; // Exit early for offline mode
    }
    
    // At this point, order should be defined (we returned early if offline)
    if (!order) {
      showError('Order not found');
      return;
    }

    orderDiscount = estimatedDiscount.value;

    const receiptData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customerName: customerName.value || null,
      memberName: selectedMember.value?.name || null,
      items: Array.isArray(cart.value) ? cart.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })) : [],
      subtotal: parseFloat(order.subtotal),
      discount: orderDiscount,
      total: finalTotalFromOrder,
      paymentMethod: paymentData.paymentMethod,
      cashAmount: paymentData.cashAmount,
      change: paymentData.paymentMethod === 'CASH' && paymentData.cashAmount 
        ? paymentData.cashAmount - finalTotalFromOrder 
        : 0,
      servedBy: authStore.user?.name || 'Unknown',
    };

    lastOrderReceipt.value = receiptData;

    lastOrderReceipt.value = receiptData;


    // showReceiptModal.value = true;
    showSuccessOverlay.value = true;
    clearCart();
    // Don't modify estimatedDiscount directly here, it will be reset by clearCart
    await loadProducts();
  } catch (error: any) {
    console.error('Error processing payment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Payment processing failed';
    showError(errorMessage, 'Payment Failed');
  } finally {
    processing.value = false;
  }
};

const closeSuccessOverlay = () => {
  showSuccessOverlay.value = false;
  if (isSplitActive.value) {
    nextSplitPart();
  }
};

const printReceiptAndClose = async () => {
  // Use the existing ReceiptPrinter component logic
  // We need to pass the data to it or ensure it has it
  if (printerRef.value) {
    // Assuming printerRef invokes ReceiptPrinter component
    // If ReceiptPrinter exposes a method, we call it.
    // If not, we might need to rely on showReceiptModal logic if we use that component.
    // Actually, ReceiptPrinter takes props.
    // Let's just set showReceiptModal = true to trigger the printer visible?
    // But we want to print without opening the old modal?
    // ReceiptPrinter usually has a print button.
    // If we want to auto print or print on demand, we need access to its print function.
    // Let's assume for now we just show the old modal if they want to print?
    // The user design "Print Receipt" button implies immediate print.
    // I'll check ReceiptPrinter.vue later. For now, let's just make it visible.
    showReceiptModal.value = true;
    showSuccessOverlay.value = false;
  }
};

// Hold Order Functions
const holdOrder = async () => {
  // If cart is empty, show held orders modal instead
  if (cart.value.length === 0) {
    showHeldOrdersModal.value = true;
    return;
  }
  
  // Prompt for a name for this held order
  const holdName = customerName.value || customerInput.value || `Order ${new Date().toLocaleTimeString()}`;
  
  const heldOrder = {
    id: Date.now().toString(),
    checkName: holdName,
    items: [...cart.value],
    total: total.value,
    customer: customerName.value || customerInput.value,
    memberId: selectedMember.value?.id,
    date: new Date().toISOString(),
  };
  
  heldOrders.value.push(heldOrder);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  
  // Clear the cart
  cart.value = [];
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  quickDiscount.value = 0;
  
  showSuccess(`Order "${holdName}" parked successfully`);
};

const deleteHeldOrder = async (order: any) => {
  const confirmed = await showConfirm(`Delete held order "${order.checkName}"?`);
  if (!confirmed) return;
  
  heldOrders.value = heldOrders.value.filter((o: any) => o.id !== order.id);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  showSuccess('Held order deleted');
};

const restoreHeldOrder = (order: any) => {
  // If there are items in cart, ask to merge or replace
  if (cart.value.length > 0) {
    showConfirm(`Current cart has items. Replace with held order "${order.checkName}"?`).then(confirmed => {
      if (confirmed) {
        performRestore(order);
      }
    });
  } else {
    performRestore(order);
  }
};

const performRestore = (order: any) => {
  cart.value = [...order.items];
  customerName.value = order.customer || '';
  if (order.memberId) {
    selectedMemberId.value = order.memberId;
    handleMemberSelect();
  }
  
  // Remove from held orders
  heldOrders.value = heldOrders.value.filter((o: any) => o.id !== order.id);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  
  showHeldOrdersModal.value = false;
  showSuccess(`Order "${order.checkName}" restored`);
};

// Handle logout
const handleLogout = () => {
  showNavSidebar.value = false;
  authStore.clearAuth();
  window.location.replace('/login');
};

// Check if shift is open before allowing POS access
const checkShiftStatus = async () => {
  if (!shiftRequired.value) {
    hasActiveShift.value = true;
    checkingShift.value = false;
    return;
  }
  
  checkingShift.value = true;
  try {
    const response = await api.get('/cash-shift/current');
    // If we get a current shift, it's active
    hasActiveShift.value = response.data && response.data.id && !response.data.shiftEnd;
  } catch (error: any) {
    // 404 means no shift, other errors we treat as no shift
    hasActiveShift.value = false;
  } finally {
    checkingShift.value = false;
  }
};

// Redirect to shift page
const goToShiftPage = () => {
  router.push('/open-shift');
};

// Watch for tenantId changes
watch(
  () => {
    const fromStore = authStore.selectedTenantId;
    const fromStorage = localStorage.getItem('selectedTenantId');
    return fromStore || fromStorage;
  },
  (newTenantId, oldTenantId) => {
    if (authStore.isSuperAdmin && newTenantId && newTenantId !== oldTenantId) {
      if (!authStore.selectedTenantId) {
        authStore.setSelectedTenant(newTenantId);
      }
      loadTenantFeatures();
      loadProducts();
      loadMembers();
      if (socket?.connected) {
        socket.emit('join-tenant', newTenantId);
      }
    }
  },
  { immediate: false }
);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Check shift status first
  checkShiftStatus();
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  // Setup offline/online status
  isOnline.value = navigator.onLine;
  window.addEventListener('online', () => {
    isOnline.value = true;
    syncManager.forceSync();
  });
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });

  // Subscribe to sync status
  syncManager.onStatusChange((status) => {
    isOnline.value = status.isOnline;
    isSyncing.value = status.isSyncing;
    pendingSyncCount.value = status.pendingCount;
  });

  // Get initial pending count
  syncManager.getPendingCount().then(count => {
    pendingSyncCount.value = count;
  });
  
  if (isSimpleMode.value) {
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
  }
  
  if (authStore.isSuperAdmin) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (selectedTenantId) {
      authStore.setSelectedTenant(selectedTenantId);
      setTimeout(() => {
        loadTenantFeatures();
        loadProducts();
        loadMembers();
        loadDiscounts();
      }, 100);
    } else {
      setTimeout(() => {
        const tenantId = localStorage.getItem('selectedTenantId');
        if (tenantId) {
          authStore.setSelectedTenant(tenantId);
          loadTenantFeatures();
          loadProducts();
          loadMembers();
          loadDiscounts();
        }
      }, 500);
    }
  } else {
    loadTenantFeatures();
    loadProducts();
    loadMembers();
    loadDiscounts();
  }
  
  const tenantIdForSocket = authStore.isSuperAdmin 
    ? authStore.selectedTenantId || localStorage.getItem('selectedTenantId') || authStore.user?.tenantId
    : authStore.user?.tenantId;
  if (socket && tenantIdForSocket) {
    socket.emit('join-tenant', tenantIdForSocket);
  }
  
  if (socket) {
    socket.on('product:stock-update', (data: { productId: string; stock: number }) => {
      if (Array.isArray(products.value)) {
      const productIndex = products.value.findIndex(p => p.id === data.productId);
      if (productIndex !== -1) {
        products.value[productIndex].stock = data.stock;
        }
      }
    });
    
    socket.on('order:created', (data: any) => {
      if (data.orderId && data.items && Array.isArray(products.value)) {
        if (Array.isArray(data.items)) {
        data.items.forEach((item: any) => {
          const productIndex = products.value.findIndex(p => p.id === item.id || p.id === item.productId);
          if (productIndex !== -1 && item.stock !== undefined) {
            products.value[productIndex].stock = item.stock;
          }
        });
        }
      }
    });
  }

  // Clock Logic
  // Clock Logic
  const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  if (isSimpleMode.value) {
    window.removeEventListener('resize', checkOrientation);
    window.removeEventListener('orientationchange', checkOrientation);
  }
});
</script>

<style scoped>
@media (orientation: portrait) {
  body {
    overflow: hidden;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@keyframes bounce-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Navigation Sidebar Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}


.nav-emerald-tint {
  background: linear-gradient(to bottom, rgba(236, 253, 245, 0.6), rgba(255, 255, 255, 0.4));
}

.category-active {
  background: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border-left: 3px solid #10b981;
  color: #059669;
}

.product-card-hover:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
  border-color: #34d399;
}
</style>

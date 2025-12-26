<template>
  <!-- Simple POS Mode -->
  <div v-if="isSimpleMode" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
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
        class="mb-2 p-3 bg-blue-100 border-l-4 border-blue-500 rounded-xl flex items-center gap-2"
      >
        <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-semibold text-blue-800">Syncing... ({{ pendingSyncCount }} pending)</span>
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
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
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
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'"
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
              <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(total) }}</span>
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
              class="w-full py-6 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
    <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-6 relative z-30 shrink-0">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <span class="material-symbols-outlined text-white text-2xl">point_of_sale</span>
        </div>
        <div class="hidden md:block">
          <h1 class="text-xl font-bold text-slate-900 leading-tight">Warungin POS</h1>
          <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
             <span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-emerald-500' : 'bg-red-500'"></span>
             {{ authStore.user?.tenantName || 'Main Store' }}
          </div>
        </div>
      </div>

      <!-- Center: Stats & Clock -->
      <div class="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
        <div class="flex flex-col items-center">
             <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
             <span class="text-sm font-bold flex items-center gap-1.5" :class="isOnline ? 'text-emerald-600' : 'text-red-600'">
               <span class="material-symbols-outlined text-[18px]">{{ isOnline ? 'wifi' : 'wifi_off' }}</span>
               {{ isOnline ? 'ONLINE' : 'OFFLINE' }}
             </span>
        </div>
        <div class="w-px h-8 bg-slate-200"></div>
        <div class="flex flex-col items-center">
             <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</span>
             <span class="text-sm font-bold text-slate-700 font-mono">{{ currentTime }}</span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
         <button class="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors relative">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
         </button>
         <div class="h-10 pl-1 pr-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              {{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="hidden md:block text-left">
               <p class="text-sm font-bold text-slate-900 leading-none">{{ authStore.user?.name || 'Cashier' }}</p>
               <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-wide mt-0.5">{{ authStore.user?.role || 'Staff' }}</p>
            </div>
         </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[90px_1fr_420px] bg-slate-50">
       <!-- 1. Categories Sidebar -->
       <aside class="hidden lg:flex flex-col items-center py-6 bg-white border-r border-slate-200 gap-4 overflow-y-auto no-scrollbar">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat === 'SEMUA' ? '' : cat"
            class="flex flex-col items-center group w-full px-2"
          >
             <div 
               class="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-300 relative overflow-hidden"
               :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'"
             >
                <span class="material-symbols-outlined text-2xl relative z-10">
                  {{ cat === 'SEMUA' ? 'apps' : 'category' }}
                </span>
             </div>
             <span 
               class="text-[10px] font-bold text-center w-full truncate px-1 transition-colors"
               :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'"
             >
               {{ cat === 'SEMUA' ? 'All' : cat }}
             </span>
          </button>
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
                  class="bg-white rounded-2xl p-3 shadow-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-transparent hover:border-emerald-500/30 overflow-hidden relative"
                >
                   <!-- Image -->
                   <div class="aspect-[4/3] rounded-xl bg-slate-100 mb-3 overflow-hidden relative">
                      <img 
                        v-if="product.image" 
                        :src="product.image" 
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt="Product"
                      >
                      <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                        {{ product.emoji || '📦' }}
                      </div>
                      
                      <!-- Add Overlay on Hover -->
                      <div class="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                         <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <span class="material-symbols-outlined text-emerald-600 font-bold">add</span>
                         </div>
                      </div>
                      
                      <!-- Stock Badge -->
                      <div v-if="product.stock <= 5" class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 shadow-sm backdrop-blur-sm" :class="product.stock === 0 ? 'text-red-500' : 'text-amber-500'">
                         {{ product.stock === 0 ? 'Out' : `${product.stock} Left` }}
                      </div>
                   </div>

                   <!-- Info -->
                   <div>
                      <h3 class="font-bold text-slate-800 leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">{{ product.name }}</h3>
                      <div class="flex items-center justify-between">
                         <span class="text-emerald-600 font-bold">{{ formatCurrency(product.price) }}</span>
                      </div>
                   </div>
                   
                   <!-- In Cart Indicator -->
                   <div v-if="isInCart(product.id)" class="absolute top-3 left-3 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
                      <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                   </div>
                </div>
             </div>
          </div>
       </section>

       <!-- 3. Cart Sidebar -->
       <aside class="bg-white flex flex-col border-l border-slate-200 h-[40vh] lg:h-full relative shadow-2xl lg:shadow-none z-30">
          <!-- Cart Header -->
          <div class="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
             <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-extrabold text-slate-800">Current Order</h2>
                <div class="px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                   <span class="text-xs font-bold text-emerald-600">ID #{{ lastOrderReceipt?.orderNumber || 'NEW' }}</span>
                </div>
             </div>
             
             <!-- Customer Selector (Compact) -->
             <div class="flex gap-2">
                 <button 
                    @click="showCustomerModal = true" 
                    id="customer-selector-btn" 
                    class="flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-xl flex items-center justify-between group transition-all"
                 >
                    <div class="flex items-center gap-2 overflow-hidden">
                       <div class="w-6 h-6 rounded-full bg-slate-200 group-hover:bg-emerald-200 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors">
                          <span class="material-symbols-outlined text-sm">person</span>
                       </div>
                       <span class="text-sm font-semibold text-slate-600 group-hover:text-emerald-700 truncate">
                          {{ customerName || selectedMember?.name || 'Walk-in Customer' }}
                       </span>
                    </div>
                    <span class="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 text-sm">edit</span>
                 </button>
                 <!-- Simple toggle or add -->
                 <button @click="switchCustomerType(customerType === 'customer' ? 'member' : 'customer')" class="w-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400 hover:text-emerald-500 transition-colors" title="Switch Type">
                    <span class="material-symbols-outlined text-xl">swap_horiz</span>
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
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
             <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                 <span class="material-symbols-outlined text-6xl mb-2">shopping_bag</span>
                 <p class="font-medium">Cart is empty</p>
                 <p class="text-xs">Scan barcode or select item</p>
             </div>
             <div 
               v-for="item in cart" 
               :key="item.id"
               class="flex gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group relative border border-transparent hover:border-slate-200"
             >
                <!-- Item Image -->
                <div class="w-14 h-14 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
                   <img v-if="item.image" :src="item.image" class="w-full h-full object-cover">
                   <div v-else class="w-full h-full flex items-center justify-center text-xl">{{ item.emoji || '📦' }}</div>
                </div>
                
                <!-- Details -->
                <div class="flex-1 min-w-0">
                   <div class="flex justify-between items-start">
                      <h4 class="font-bold text-slate-800 text-sm truncate pr-2">{{ item.name }}</h4>
                      <span class="font-bold text-slate-900 text-sm">{{ formatCurrency(item.price * item.quantity) }}</span>
                   </div>
                   <p class="text-xs text-slate-400 mb-1.5">{{ formatCurrency(item.price) }} / unit</p>
                   
                   <!-- Qty Controls -->
                   <div class="flex items-center gap-3">
                       <button @click="decreaseQuantity(item.id)" class="w-6 h-6 rounded bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-500 flex items-center justify-center transition-colors">
                          <span class="material-symbols-outlined text-sm font-bold">remove</span>
                       </button>
                       <span class="font-bold text-sm text-slate-900 w-4 text-center">{{ item.quantity }}</span>
                       <button @click="increaseQuantity(item.id)" class="w-6 h-6 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center transition-colors">
                          <span class="material-symbols-outlined text-sm font-bold">add</span>
                       </button>
                   </div>
                </div>
             </div>
          </div>

          <!-- Total & Actions -->
          <div class="p-5 bg-slate-50 border-t border-slate-200">
             
             <!-- Totals -->
             <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm text-slate-500">
                   <span>Subtotal</span>
                   <span>{{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="flex justify-between text-sm text-emerald-600 font-medium" v-if="discount > 0">
                   <span>Discount</span>
                   <span>-{{ formatCurrency(discount) }}</span>
                </div>
                <div class="flex justify-between items-end mt-4 pt-4 border-t border-slate-200">
                   <span class="text-slate-600 font-bold">Total Payment</span>
                   <span class="text-2xl font-black text-slate-900">{{ formatCurrency(total) }}</span>
                </div>
             </div>

             <!-- Action Buttons -->
             <div class="grid grid-cols-4 gap-2 mb-3">
                <button class="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors flex flex-col items-center justify-center gap-1" @click="clearCart">
                   <span class="material-symbols-outlined text-xl">delete</span>
                </button>
                 <button class="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-500 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center gap-1">
                   <span class="material-symbols-outlined text-xl">pause</span>
                </button>
                 <button class="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-1">
                   <span class="material-symbols-outlined text-xl">percent</span>
                </button>
                 <button class="p-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-purple-500 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center gap-1">
                   <span class="material-symbols-outlined text-xl">split_mode</span>
                </button>
             </div>

             <!-- Pay Button -->
             <button 
               @click="showPaymentModal = true" 
               :disabled="cart.length === 0"
               class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
                <span class="material-symbols-outlined">payments</span>
                Proccess Payment
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
            class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition shadow-lg shadow-primary/20 font-semibold"
          >
            View All Alerts
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

// Offline mode state
const isOnline = ref(navigator.onLine);
const isSyncing = ref(false);

const pendingSyncCount = ref(0);
let clockInterval: any;

// Computed
const categories = computed(() => {
  const categoriesList = safeMap(products.value, (p: any) => p?.category).filter(Boolean);
  const cats = new Set(categoriesList);
  return ['SEMUA', ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) {
    return safeFilter(products.value, (p: any) => p?.isActive && p?.stock > 0);
  }
  const query = searchQuery.value.toLowerCase();
  return safeFilter(products.value, (p: any) => 
    p?.isActive && p?.stock > 0 && 
    (p?.name?.toLowerCase().includes(query) || p?.category?.toLowerCase().includes(query))
  );
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

const discount = computed(() => {
  if (quickDiscount.value <= 0) return 0;
  if (discountType.value === 'percent') {
    return (subtotal.value * quickDiscount.value) / 100;
  }
  return Math.min(quickDiscount.value, subtotal.value);
});

const total = computed(() => {
  if (isSimpleMode.value) {
    return Math.max(0, subtotal.value - discount.value);
  }
  return Math.max(0, subtotal.value - estimatedDiscount.value);
});

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
        console.log('Orientation lock not available:', err);
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
    console.log('Could not load tenant features:', error);
    isSimpleMode.value = false;
  }
};

const loadProducts = async () => {
  // For SUPER_ADMIN, ensure tenantId is available
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (!selectedTenantId) {
      if (!isSimpleMode.value) console.log('Waiting for tenant selection...');
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
    // If offline, try to load from cache
    if (!isOnline.value) {
      console.log('Offline: Loading products from cache...');
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
      showError(errorMessage, 'Error');
    }
  } finally {
    loading.value = false;
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
    console.log('Could not check critical stock:', error);
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
      }, 100);
    } else {
      setTimeout(() => {
        const tenantId = localStorage.getItem('selectedTenantId');
        if (tenantId) {
          authStore.setSelectedTenant(tenantId);
          loadTenantFeatures();
          loadProducts();
          loadMembers();
        }
      }, 500);
    }
  } else {
    loadTenantFeatures();
    loadProducts();
    loadMembers();
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
</style>

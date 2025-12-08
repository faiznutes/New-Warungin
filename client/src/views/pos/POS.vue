<template>
  <!-- Simple POS Mode -->
  <div v-if="isSimpleMode" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <!-- Orientation Warning (Portrait) -->
    <div
      v-if="isPortrait"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        <svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Putar Perangkat</h2>
        <p class="text-gray-600 mb-4">Mode Kasir Sederhana memerlukan orientasi landscape (mendatar)</p>
        <p class="text-sm text-gray-500">Silakan putar perangkat Anda ke posisi landscape</p>
      </div>
    </div>

    <!-- Main Content (only visible in landscape) -->
    <div v-if="!isPortrait" class="h-screen flex flex-col">
      <!-- Offline Status Indicator -->
      <div
        v-if="!isOnline"
        class="mb-2 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-semibold text-yellow-800">Anda offline — transaksi aman disimpan lokal</span>
      </div>
      <div
        v-else-if="isSyncing"
        class="mb-2 p-3 bg-blue-100 border-l-4 border-blue-500 rounded-lg flex items-center gap-2"
      >
        <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm font-semibold text-blue-800">Sedang sync... ({{ pendingSyncCount }} transaksi)</span>
      </div>
      <div
        v-else-if="pendingSyncCount > 0"
        class="mb-2 p-3 bg-green-100 border-l-4 border-green-500 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-semibold text-green-800">Sync berhasil! ({{ pendingSyncCount }} menunggu sync)</span>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 mb-4">
        <h1 class="text-3xl font-bold text-gray-900 text-center">KASIR SEDERHANA</h1>
        <p class="text-center text-gray-600 mt-1">{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <!-- Categories -->
        <div class="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">KATEGORI</h2>
          <div class="space-y-3">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="w-full py-6 px-4 text-lg font-bold rounded-lg transition-all"
              :class="selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            >
              {{ category || 'SEMUA' }}
            </button>
          </div>
        </div>

        <!-- Products -->
        <div class="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">PRODUK</h2>
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div v-else-if="filteredProductsSimple.length === 0" class="text-center py-12 text-gray-500">
            <p>Tidak ada produk</p>
          </div>
          <div v-else class="grid grid-cols-2 gap-3">
            <button
              v-for="product in filteredProductsSimple"
              :key="product.id"
              @click="addToCart(product)"
              :disabled="product.stock <= 0"
              class="py-8 px-4 text-lg font-bold rounded-lg transition-all active:scale-95"
              :class="product.stock <= 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : isInCart(product.id)
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'"
            >
              <div class="text-3xl mb-2">{{ product.emoji || '📦' }}</div>
              <div class="text-sm font-semibold">{{ product.name }}</div>
              <div class="text-xs mt-1 opacity-90">{{ formatCurrency(product.price) }}</div>
              <div v-if="product.stock <= 0" class="text-xs mt-1 text-red-200">HABIS</div>
            </button>
          </div>
        </div>

        <!-- Cart & Payment -->
        <div class="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">KERANJANG</h2>
          
          <div class="flex-1 overflow-y-auto mb-4 space-y-2">
            <div
              v-for="item in cart"
              :key="item.id"
              class="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
            >
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ item.name }}</p>
                <p class="text-sm text-gray-600">{{ formatCurrency(item.price) }} x {{ item.quantity }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="w-8 h-8 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
                >
                  -
                </button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.id)"
                  class="w-8 h-8 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                >
                  +
                </button>
                <button
                  @click="removeFromCart(item.id)"
                  class="w-8 h-8 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
            <div v-if="cart.length === 0" class="text-center py-12 text-gray-400">
              <p>Keranjang kosong</p>
            </div>
          </div>

          <div class="border-t-2 border-gray-300 pt-4 mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xl font-bold text-gray-700">TOTAL:</span>
              <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Diskon Cepat</label>
            <div class="flex space-x-2">
              <input
                v-model.number="quickDiscount"
                type="number"
                min="0"
                placeholder="0"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-lg"
              />
              <select
                v-model="discountType"
                class="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="amount">Rp</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>

          <!-- Cash Amount Input (only for CASH payment) -->
          <div v-if="showCashInput" class="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Uang</label>
            <input
              v-model.number="cashAmount"
              type="number"
              min="0"
              :placeholder="`Min: ${formatCurrency(total)}`"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @keyup.enter="processPaymentSimple('CASH')"
            />
            <div v-if="cashAmount > 0" class="mt-2 text-sm">
              <div class="flex justify-between text-gray-700">
                <span>Total:</span>
                <span class="font-bold">{{ formatCurrency(total) }}</span>
              </div>
              <div class="flex justify-between text-green-700 font-bold">
                <span>Kembalian:</span>
                <span>{{ formatCurrency(Math.max(0, cashAmount - total)) }}</span>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                @click="showCashInput = false; cashAmount = 0"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Batal
              </button>
              <button
                @click="processPaymentSimple('CASH')"
                :disabled="!cashAmount || cashAmount < total || processing"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bayar
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <button
              v-if="!showCashInput"
              @click="showCashInput = true; cashAmount = total"
              :disabled="cart.length === 0 || processing"
              class="w-full py-6 bg-green-600 text-white rounded-lg font-bold text-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💵 TUNAI
            </button>
            <button
              @click="processPaymentSimple('QRIS')"
              :disabled="cart.length === 0 || processing || showCashInput"
              class="w-full py-6 bg-blue-600 text-white rounded-lg font-bold text-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📱 QRIS
            </button>
            <button
              @click="clearCart"
              :disabled="cart.length === 0"
              class="w-full py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              HAPUS SEMUA
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal POS Mode -->
  <div v-else class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
    <!-- Offline Status Indicator -->
    <div
      v-if="!isOnline"
      class="p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg m-4 flex items-center gap-2"
    >
      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span class="text-sm font-semibold text-yellow-800">Anda offline — transaksi aman disimpan lokal</span>
    </div>
    <div
      v-else-if="isSyncing"
      class="p-3 bg-blue-100 border-l-4 border-blue-500 rounded-lg m-4 flex items-center gap-2"
    >
      <div class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span class="text-sm font-semibold text-blue-800">Sedang sync... ({{ pendingSyncCount }} transaksi)</span>
    </div>
    <div
      v-else-if="pendingSyncCount > 0"
      class="p-3 bg-green-100 border-l-4 border-green-500 rounded-lg m-4 flex items-center gap-2"
    >
      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="text-sm font-semibold text-green-800">Sync berhasil! ({{ pendingSyncCount }} menunggu sync)</span>
    </div>
    <!-- Store Selector (Hanya untuk SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'" class="px-4 sm:px-6 pt-4 sm:pt-6">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>
    
    <!-- Header Section -->
    <div class="mb-4 sm:mb-6 px-4 sm:px-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Point of Sale</h2>
        <p class="text-sm sm:text-base text-gray-600">Pilih produk dan lakukan transaksi</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 h-full px-4 sm:px-6 pb-4 sm:pb-6">
      <!-- Product Grid -->
      <div class="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 overflow-y-auto">
        <!-- Search Section -->
        <div class="mb-4 sm:mb-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari produk..."
              class="block w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition"
            />
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="text-center py-12 text-gray-500">
          <p>Tidak ada produk ditemukan</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            @click="addToCart(product)"
            class="bg-gradient-to-br from-white to-gray-50 border-2 rounded-xl p-3 sm:p-4 cursor-pointer hover:border-primary-500 hover:shadow-xl transition-all active:scale-95 group"
            :class="{ 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-md': isInCart(product.id), 'border-gray-200': !isInCart(product.id) }"
          >
            <div class="text-center">
              <div class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                <span v-else-if="product.emoji" class="text-3xl sm:text-4xl md:text-5xl">{{ product.emoji }}</span>
                <span v-else class="text-2xl sm:text-3xl">📦</span>
              </div>
              <h3 class="font-semibold text-xs sm:text-sm text-gray-900 mb-1 truncate">{{ product.name }}</h3>
              <p class="text-sm sm:text-base md:text-lg font-bold text-primary-600 mb-1 sm:mb-2">{{ formatCurrency(product.price) }}</p>
              <p class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block">Stok: {{ product.stock }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar -->
      <div class="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 flex flex-col">
        <div class="mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Keranjang</h2>
          <p class="text-sm text-gray-600">{{ cart.length }} item</p>
        </div>

        <div class="flex-1 overflow-y-auto mb-4">
          <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
            <p>Keranjang kosong</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in cart"
              :key="item.id"
              class="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  <span v-else-if="item.emoji" class="text-2xl sm:text-3xl">{{ item.emoji }}</span>
                  <span v-else class="text-xl">📦</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 truncate text-sm sm:text-base">{{ item.name }}</h4>
                  <p class="text-xs sm:text-sm text-gray-600">{{ formatCurrency(item.price) }} × {{ item.quantity }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="decreaseQuantity(item.id)"
                  class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition font-semibold text-gray-700"
                >
                  −
                </button>
                <span class="w-10 text-center font-bold text-gray-900">{{ item.quantity }}</span>
                <button
                  @click="increaseQuantity(item.id)"
                  class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300 transition font-semibold text-gray-700"
                >
                  +
                </button>
                <button
                  @click="removeFromCart(item.id)"
                  class="ml-2 p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer/Member Info -->
        <div class="mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
          <p class="text-xs font-medium text-gray-700 mb-3">Tipe Pelanggan</p>
          <div class="flex gap-2 mb-3">
            <button
              @click="switchCustomerType('customer')"
              :class="[
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                customerType === 'customer'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-300'
              ]"
            >
              Pelanggan
            </button>
            <button
              @click="switchCustomerType('member')"
              :class="[
                'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                customerType === 'member'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-300'
              ]"
            >
              Member
            </button>
          </div>
          
          <div v-if="customerType === 'customer'" class="flex gap-2">
            <input
              v-model="customerInput"
              type="text"
              placeholder="Nama pelanggan (opsional)"
              class="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              @blur="handleCustomerInput"
            />
            <button
              @click="clearCustomer"
              v-if="customerInput"
              class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              ✕
            </button>
          </div>

          <div v-else class="flex gap-2">
            <select
              v-model="selectedMemberId"
              @change="handleMemberSelect"
              class="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">-- Pilih Member --</option>
              <option
                v-for="member in members"
                :key="member.id"
                :value="member.id"
              >
                {{ member.name }} ({{ member.phone }}){{ member.discountType && member.discountValue ? ` - ${member.discountType === 'PERCENTAGE' ? member.discountValue + '%' : formatCurrency(member.discountValue)}` : '' }}
              </option>
            </select>
            <button
              @click="clearCustomer"
              v-if="selectedMember"
              class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              ✕
            </button>
          </div>

          <div v-if="selectedMember" class="mt-3 p-2.5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div class="flex items-center gap-2 text-xs sm:text-sm text-green-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">Member: {{ selectedMember.name }}</span>
              <span v-if="selectedMember.discountType && selectedMember.discountValue" class="text-green-700">
                ({{ selectedMember.discountType === 'PERCENTAGE' ? selectedMember.discountValue + '%' : formatCurrency(selectedMember.discountValue) }})
              </span>
            </div>
          </div>
          <div v-else-if="customerType === 'customer' && customerName" class="mt-3 p-2.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div class="flex items-center gap-2 text-xs sm:text-sm text-blue-800">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="font-medium">Pelanggan: {{ customerName }}</span>
            </div>
          </div>
        </div>

        <!-- Send to Kitchen -->
        <div class="mb-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              v-model="sendToKitchen"
              type="checkbox"
              class="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span class="text-sm text-gray-700">Kirim ke dapur</span>
          </label>
        </div>

        <!-- Total -->
        <div class="mb-4 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
          <div class="flex justify-between items-center mb-2 pb-2 border-b border-primary-200">
            <span class="text-sm text-gray-700 font-medium">Subtotal:</span>
            <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(subtotal) }}</span>
          </div>
          <div v-if="estimatedDiscount > 0" class="flex justify-between items-center mb-2 pb-2 border-b border-primary-200">
            <span class="text-sm text-green-700 font-medium">Diskon:</span>
            <span class="text-sm font-semibold text-green-700">-{{ formatCurrency(estimatedDiscount) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2">
            <span class="text-base sm:text-lg font-bold text-gray-900">Total:</span>
            <span class="text-lg sm:text-xl font-bold text-primary-600">{{ formatCurrency(total) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <button
            @click="showPaymentModal = true"
            :disabled="cart.length === 0 || processing"
            class="w-full px-4 sm:px-6 py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
          >
            <svg v-if="!processing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span v-if="processing" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Memproses...
            </span>
            <span v-else>Bayar Sekarang</span>
          </button>
          <button
            @click="clearCart"
            :disabled="cart.length === 0"
            class="w-full px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Hapus Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal
      :show="showPaymentModal"
      :total="total"
      :discount="estimatedDiscount"
      :processing="processing"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <!-- Receipt Printer -->
    <ReceiptPrinter
      :show="showReceiptModal"
      :order-id="lastOrderId"
      :receipt-data="lastOrderReceipt"
      @close="showReceiptModal = false"
    />
  </div>

  <!-- Low Stock Reminder Modal (Shared) -->
  <div
    v-if="showLowStockModal && criticalStockProducts.length > 0"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="showLowStockModal = false"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-red-600">⚠️ Peringatan Stok Habis/Menipis</h3>
        <button
          @click="dismissLowStockModal"
          class="text-gray-400 hover:text-gray-600"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="mb-4">
        <p class="text-gray-700 mb-4">
          Ada {{ criticalStockProducts.length }} produk yang perlu perhatian segera:
        </p>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="product in criticalStockProducts"
            :key="product.id"
            class="p-3 rounded-lg border"
            :class="product.stock === 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">{{ product.name }}</p>
                <p class="text-sm text-gray-600">
                  Stok: <span :class="product.stock === 0 ? 'text-red-600 font-bold' : 'text-yellow-600 font-semibold'">{{ product.stock }}</span>
                  | Minimal: {{ product.minStock }}
                </p>
              </div>
              <button
                @click="goToRestock(product.id)"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
              >
                Tambah Stok
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex space-x-3">
        <button
          @click="dismissLowStockModal"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Abaikan Hari Ini
        </button>
        <button
          @click="goToStockAlerts"
          class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Lihat Semua
        </button>
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
  if (authStore.isSuperAdmin && !authStore.selectedTenantId) {
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (!selectedTenantId) {
      if (!isSimpleMode.value) console.log('Waiting for tenant selection...');
      return;
    }
    authStore.setSelectedTenant(selectedTenantId);
  }

  loading.value = true;
  try {
    // Try to load from API first
    const response = await api.get('/products', {
      params: { isActive: true },
    });
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
        showWarning('Mode offline: Menggunakan data produk yang di-cache');
      } else {
        showError('Tidak ada data produk tersimpan. Perlu koneksi internet untuk memuat produk pertama kali.');
      }
    } else {
      const errorMessage = err.response?.data?.message || 'Gagal memuat produk';
      showError(errorMessage, 'Terjadi Kesalahan');
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
      showError('Stok produk habis', 'Stok Tidak Tersedia');
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
        await showWarning('Stok tidak mencukupi');
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
      await showWarning('Stok produk habis');
      return;
    }
    if (!Array.isArray(cart.value)) cart.value = [];
    const existingItem = cart.value.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        await showWarning('Stok tidak mencukupi');
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
        showError('Stok tidak mencukupi', 'Stok Tidak Tersedia');
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
        showError('Stok tidak mencukupi', 'Stok Tidak Tersedia');
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
      showError(`Jumlah uang harus minimal ${formatCurrency(total.value)}`);
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
      servedBy: authStore.user?.name || 'Kasir',
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
      showSuccess('Pembayaran berhasil!');
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
      
      showSuccess('Transaksi disimpan offline. Akan di-sync otomatis saat online.');
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
        servedBy: authStore.user?.name || 'Kasir',
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
      
      showSuccess('Transaksi disimpan offline. Akan di-sync otomatis saat online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      clearCart();
    } else {
      showError(error.response?.data?.message || 'Gagal memproses pembayaran');
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
      
      showSuccess('Transaksi disimpan offline. Akan di-sync otomatis saat online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      clearCart();
      return; // Exit early for offline mode
    }
    
    // At this point, order should be defined (we returned early if offline)
    if (!order) {
      showError('Order tidak ditemukan');
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

    showReceiptModal.value = true;
    clearCart();
    await loadProducts();
  } catch (error: any) {
    console.error('Error processing payment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Gagal memproses pembayaran';
    showError(errorMessage, 'Gagal Memproses Pembayaran');
  } finally {
    processing.value = false;
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
});

onUnmounted(() => {
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
</style>

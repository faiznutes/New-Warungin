<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">
            {{ editingProduct ? 'Edit Produk' : 'Tambah Produk' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Produk *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan nama produk"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan deskripsi produk"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Harga Jual *</label>
              <input
                v-model.number="form.price"
                type="number"
                required
                min="0"
                step="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Harga Pokok (HPP) *</label>
              <input
                v-model.number="form.cost"
                type="number"
                min="0"
                step="100"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
                @input="loadPriceSuggestions"
              />
              <p class="text-xs text-gray-500 mt-1">Harga beli/pokok untuk rekomendasi harga jual</p>
            </div>
          </div>

          <!-- Price Suggestions -->
          <div v-if="priceSuggestions && form.cost && form.cost > 0" class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-blue-900 mb-3">💡 Rekomendasi Harga Jual</h4>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                <div>
                  <p class="text-xs text-gray-600">Margin 20%</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(priceSuggestions.suggestedPrice20) }}</p>
                </div>
                <button
                  type="button"
                  @click="applyPrice(priceSuggestions.suggestedPrice20)"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Gunakan
                </button>
              </div>
              <div class="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
                <div>
                  <p class="text-xs text-gray-600">Margin 30%</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatCurrency(priceSuggestions.suggestedPrice30) }}</p>
                </div>
                <button
                  type="button"
                  @click="applyPrice(priceSuggestions.suggestedPrice30)"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Gunakan
                </button>
              </div>
              <div v-if="priceSuggestions.marketPrice" class="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                <div>
                  <p class="text-xs text-gray-600">Harga Pasaran (Kategori)</p>
                  <p class="text-lg font-bold text-green-700">{{ formatCurrency(priceSuggestions.marketPrice) }}</p>
                </div>
                <button
                  type="button"
                  @click="applyPrice(priceSuggestions.marketPrice!)"
                  class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Gunakan
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Masukkan kategori"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <div class="flex items-center h-10">
                <input
                  v-model="form.isConsignment"
                  type="checkbox"
                  id="isConsignment"
                  class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label for="isConsignment" class="ml-2 text-sm text-gray-700 cursor-pointer">
                  Produk Titipan
                </label>
              </div>
              <p class="text-xs text-gray-500 mt-1">Centang jika produk titipan dari orang lain</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stok *</label>
              <input
                v-model.number="form.stock"
                type="number"
                required
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stok Minimum</label>
              <input
                v-model.number="form.minStock"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Gambar/Emoji Produk</label>
            
            <!-- Type Selection -->
            <div class="flex gap-2 mb-3">
              <button
                type="button"
                @click="imageType = 'image'"
                class="flex-1 px-4 py-2 rounded-lg transition"
                :class="imageType === 'image' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                📷 Gambar
              </button>
              <button
                type="button"
                @click="imageType = 'emoji'"
                class="flex-1 px-4 py-2 rounded-lg transition"
                :class="imageType === 'emoji' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                😀 Emoji
              </button>
            </div>

            <!-- Image Type -->
            <div v-if="imageType === 'image'">
              <!-- Image Preview -->
              <div v-if="form.image" class="mb-3">
                <div class="relative inline-block">
                  <img
                    :src="form.image"
                    alt="Product preview"
                    class="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    @click="form.image = ''"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-2 mb-2">
                <button
                  type="button"
                  @click="openFileInput"
                  class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Pilih dari Gallery</span>
                </button>
                <button
                  type="button"
                  @click="openUrlInput"
                  class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Masukkan URL</span>
                </button>
              </div>

              <!-- URL Input (hidden by default) -->
              <div v-if="showUrlInput" class="mb-2">
                <input
                  v-model="form.image"
                  type="url"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/image.jpg"
                  @blur="showUrlInput = false"
                />
                <p class="text-xs text-gray-500 mt-1">Masukkan URL gambar produk</p>
              </div>

              <!-- Hidden File Input -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>

            <!-- Emoji Type -->
            <div v-else>
              <!-- Emoji Preview -->
              <div v-if="form.emoji" class="mb-3">
                <div class="relative inline-block">
                  <div class="w-32 h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <span class="text-6xl">{{ form.emoji }}</span>
                  </div>
                  <button
                    type="button"
                    @click="form.emoji = ''"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Emoji Picker -->
              <div class="mb-2">
                <input
                  v-model="form.emoji"
                  type="text"
                  maxlength="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-2xl text-center"
                  placeholder="Pilih atau ketik emoji (contoh: 🍕 🍔 🍟)"
                />
                <p class="text-xs text-gray-500 mt-1">Ketik emoji atau pilih dari keyboard emoji</p>
              </div>

              <!-- Popular Emojis -->
              <div class="mb-2">
                <p class="text-xs text-gray-600 mb-2">Emoji Populer:</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="emoji in popularEmojis"
                    :key="emoji"
                    type="button"
                    @click="form.emoji = emoji"
                    class="w-10 h-10 text-2xl hover:bg-gray-100 rounded-lg transition flex items-center justify-center"
                    :class="{ 'bg-primary-100 border-2 border-primary-500': form.emoji === emoji }"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <label for="isActive" class="ml-2 text-sm text-gray-700">Aktif</label>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? 'Menyimpan...' : (editingProduct ? 'Update' : 'Simpan') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image Cropper Modal -->
    <ImageCropperModal
      :show="showCropper"
      :image-src="selectedImageSrc"
      @close="showCropper = false"
      @cropped="handleImageCropped"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import ImageCropperModal from './ImageCropperModal.vue';
import { useNotification } from '../composables/useNotification';
import api from '../api';
import { formatCurrency } from '../utils/formatters';

const { error: showError } = useNotification();

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  image?: string;
  emoji?: string;
  isActive: boolean;
  isConsignment?: boolean;
}

interface Props {
  show: boolean;
  product?: Product | null;
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
});

const emit = defineEmits<{
  close: [];
  save: [product: Partial<Product>];
}>();

const form = ref<Partial<Product>>({
  name: '',
  description: '',
  price: 0,
  cost: undefined,
  stock: 0,
  minStock: 0,
  category: '',
  image: '',
  emoji: '',
  isActive: true,
  isConsignment: false,
});

const saving = ref(false);
const editingProduct = computed(() => !!props.product);
const fileInput = ref<HTMLInputElement | null>(null);
const showUrlInput = ref(false);
const showCropper = ref(false);
const selectedImageSrc = ref('');
const imageType = ref<'image' | 'emoji'>('image');
const priceSuggestions = ref<{
  suggestedPrice20: number;
  suggestedPrice30: number;
  marketPrice?: number;
  cost: number;
} | null>(null);
const loadingSuggestions = ref(false);

const popularEmojis = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚',
  '🍳', '🥞', '🧇', '🥨', '🥯', '🥐', '🍞', '🥖',
  '🥨', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫',
  '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪',
  '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢',
  '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂',
  '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰',
  '🥜', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺',
  '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
];

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: typeof newProduct.price === 'string' ? parseFloat(newProduct.price) : newProduct.price || 0,
      cost: typeof (newProduct as any).cost === 'string' ? parseFloat((newProduct as any).cost) : (newProduct as any).cost || undefined,
      stock: newProduct.stock || 0,
      minStock: newProduct.minStock || 0,
      category: newProduct.category || '',
      image: newProduct.image || '',
      emoji: newProduct.emoji || '',
      isActive: newProduct.isActive !== false,
      isConsignment: (newProduct as any).isConsignment || false,
    };
    // Set image type based on what exists
    imageType.value = newProduct.emoji ? 'emoji' : 'image';
    // Load price suggestions if cost exists
    if (form.value.cost && form.value.cost > 0) {
      loadPriceSuggestions();
    }
  } else {
    form.value = {
      name: '',
      description: '',
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: 0,
      category: '',
      image: '',
      emoji: '',
      isActive: true,
      isConsignment: false,
    };
    imageType.value = 'image';
  }
}, { immediate: true });

watch(() => props.show, (newShow) => {
  if (!newShow) {
    // Reset form when modal closes
    form.value = {
      name: '',
      description: '',
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: 0,
      category: '',
      image: '',
      emoji: '',
      isActive: true,
      isConsignment: false,
    };
    imageType.value = 'image';
    priceSuggestions.value = null;
  }
});

watch(() => imageType.value, (newType) => {
  // Clear the other type when switching
  if (newType === 'image') {
    form.value.emoji = '';
  } else if (newType === 'emoji') {
    form.value.image = '';
  }
});

// Watch emoji changes to ensure it's saved
watch(() => form.value.emoji, (newEmoji) => {
  if (newEmoji && imageType.value === 'emoji') {
    // Ensure image is cleared when emoji is set
    form.value.image = '';
  }
});

// Watch category changes to reload price suggestions
watch(() => form.value.category, () => {
  if (form.value.cost && form.value.cost > 0) {
    loadPriceSuggestions();
  }
});

const openFileInput = () => {
  fileInput.value?.click();
};

const openUrlInput = () => {
  showUrlInput.value = true;
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    await showError('File harus berupa gambar');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    await showError('Ukuran file maksimal 5MB');
    return;
  }

  // Read file as data URL
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    selectedImageSrc.value = result;
    showCropper.value = true;
  };
  reader.readAsDataURL(file);

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleImageCropped = (imageDataUrl: string) => {
  form.value.image = imageDataUrl;
  form.value.emoji = ''; // Clear emoji when image is set
  showCropper.value = false;
  selectedImageSrc.value = '';
};

const loadPriceSuggestions = async () => {
  if (!form.value.cost || form.value.cost <= 0) {
    priceSuggestions.value = null;
    return;
  }

  // Debounce: wait 500ms after user stops typing
  if ((window as any).priceSuggestionTimeout) {
    clearTimeout((window as any).priceSuggestionTimeout);
  }

  (window as any).priceSuggestionTimeout = setTimeout(async () => {
    loadingSuggestions.value = true;
    try {
      const params: any = { cost: form.value.cost };
      if (form.value.category) {
        params.category = form.value.category;
      }
      
      const response = await api.get('/product/price-suggestion/by-cost', { params });
      priceSuggestions.value = response.data;
    } catch (error: any) {
      console.error('Error loading price suggestions:', error);
      priceSuggestions.value = null;
    } finally {
      loadingSuggestions.value = false;
    }
  }, 500);
};

const applyPrice = (price: number) => {
  form.value.price = Math.round(price);
};

const handleSubmit = () => {
  saving.value = true;
  
  // Prepare data - ensure emoji/image are properly set based on type
  const submitData = { ...form.value };
  
  // If emoji type is selected, clear image
  if (imageType.value === 'emoji') {
    submitData.image = '';
  }
  // If image type is selected, clear emoji
  if (imageType.value === 'image') {
    submitData.emoji = '';
  }
  
  emit('save', submitData);
  setTimeout(() => {
    saving.value = false;
  }, 500);
};
</script>



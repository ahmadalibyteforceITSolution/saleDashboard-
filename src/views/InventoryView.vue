<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <h1 class="page-title">Product Storage & Inventory</h1>
        <p class="page-subtitle">Multi-bin warehouse locations, city allocations (Lahore, Multan, Peshawar), pricing & stock levels</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="showAddModal = true">
          <PackagePlus :size="16" />
          <span>Add New Product SKU</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="glass-panel p-3 mb-4 flex-between flex-wrap gap-3">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter by product name, SKU, city, or bin..."
          class="form-input search-input"
        />
      </div>

      <div class="filter-pills flex-align gap-2">
        <!-- City Allocation Filter -->
        <select v-model="selectedCity" class="form-select city-select">
          <option value="ALL">All Allocation Places</option>
          <option value="Lahore">🏛️ Lahore</option>
          <option value="Multan">🏛️ Multan</option>
          <option value="Peshawar">🏛️ Peshawar</option>
        </select>

        <!-- Category Filter -->
        <select v-model="selectedCategory" class="form-select category-select">
          <option value="ALL">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>

        <button
          :class="['btn', 'btn-sm', showLowStockOnly ? 'btn-warning' : 'btn-secondary']"
          @click="showLowStockOnly = !showLowStockOnly"
        >
          <AlertCircle :size="14" />
          <span>Low Stock Only ({{ dataStore.lowStockProducts.length }})</span>
        </button>
      </div>
    </div>

    <!-- Product Storage Catalog Table -->
    <div class="glass-panel p-4">
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Category</th>
              <th>Allocation Places</th>
              <th>Storage Bin</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Margin</th>
              <th>Stock Qty</th>
              <th>Serialized Units</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>
                <div class="flex-align gap-3">
                  <img :src="product.image" alt="Thumbnail" class="product-thumb" />
                  <div>
                    <div class="font-bold text-main">{{ product.name }}</div>
                    <div class="font-mono text-primary text-xs">{{ product.sku }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-neutral">{{ product.category }}</span>
              </td>
              <td>
                <div class="flex-wrap gap-1">
                  <span
                    v-for="cName in getProductCityList(product)"
                    :key="cName"
                    :class="['badge', cName === 'Lahore' ? 'badge-info' : cName === 'Multan' ? 'badge-success' : 'badge-purple']"
                  >
                    <Building2 :size="10" />
                    {{ cName }}
                  </span>
                </div>
              </td>
              <td>
                <span class="font-mono badge badge-neutral">
                  <MapPin :size="10" />
                  {{ product.storageBin }}
                </span>
              </td>
              <td class="font-mono text-muted">${{ product.costPrice.toFixed(2) }}</td>
              <td class="font-mono font-bold text-main">${{ product.sellingPrice.toFixed(2) }}</td>
              <td class="font-mono text-success text-xs font-bold">
                +${{ (product.sellingPrice - product.costPrice).toFixed(2) }}
              </td>
              <td>
                <div class="flex-align gap-2">
                  <span class="font-mono font-bold">{{ product.stockQty }} units</span>
                  <span v-if="product.stockQty <= product.minStock" class="badge badge-warning">
                    LOW
                  </span>
                </div>
              </td>
              <td>
                <button
                  class="btn btn-sm btn-ghost font-mono text-secondary flex-align gap-1"
                  @click="openSerialDrawer(product)"
                >
                  <QrCode :size="13" />
                  <span>{{ getProductSerialsCount(product.id) }} Serials</span>
                </button>
              </td>
              <td>
                <!-- Action Buttons: View Serials, Edit, Delete -->
                <div class="flex-align gap-1">
                  <button class="btn btn-sm btn-secondary" title="View Unit Serials" @click="openSerialDrawer(product)">
                    <Eye :size="13" />
                  </button>

                  <button class="btn btn-sm btn-ghost text-primary" title="Edit Product Details" @click="openEditModal(product)">
                    <Pencil :size="13" />
                  </button>

                  <button class="btn btn-sm btn-ghost text-danger" title="Delete Product" @click="confirmDeleteProduct(product)">
                    <Trash2 :size="13" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="flex-align gap-2">
            <PackagePlus :size="18" class="text-primary" />
            <span>Add New Product to Inventory</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="showAddModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleAddProduct">
          <div class="modal-body">
            <!-- Custom Image Upload Section -->
            <div class="form-group mb-3">
              <label class="form-label flex-between">
                <span>Upload Custom Product Image</span>
                <span class="text-xs text-subtle">PNG, JPG, WebP supported</span>
              </label>

              <div class="flex-align gap-3">
                <img :src="imagePreview || defaultImage" alt="Preview" class="upload-preview-thumb" />
                <div class="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    class="form-input text-xs"
                    @change="handleFileUpload"
                  />
                  <div class="text-xs text-subtle mt-1">Select an image file from your computer</div>
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Product SKU Code</label>
                <input v-model="newForm.sku" type="text" placeholder="APL-MAC-M3" class="form-input" required />
              </div>

              <!-- Category Dropdown Select -->
              <div class="form-group">
                <label class="form-label">Category</label>
                <select v-model="newForm.category" class="form-select" required>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                  <option value="__NEW__">+ Add Custom Category...</option>
                </select>
              </div>
            </div>

            <!-- Custom Category Input if __NEW__ selected -->
            <div v-if="newForm.category === '__NEW__'" class="form-group">
              <label class="form-label">New Category Name</label>
              <input v-model="customCategoryName" type="text" placeholder="e.g. Smart Wearables" class="form-input" required />
            </div>

            <!-- PRODUCT NAME SELECT DROPDOWN -->
            <div class="form-group">
              <label class="form-label">Product Name</label>
              <select v-model="selectedProductName" class="form-select" required @change="onProductNameSelect">
                <option v-for="pName in productNamesList" :key="pName" :value="pName">
                  {{ pName }}
                </option>
                <option value="__NEW_NAME__">+ Enter New Product Name...</option>
              </select>
            </div>

            <!-- Custom Product Name Input if __NEW_NAME__ selected -->
            <div v-if="selectedProductName === '__NEW_NAME__'" class="form-group">
              <label class="form-label">New Product Name Title</label>
              <input v-model="customProductName" type="text" placeholder="e.g. MacBook Air 15 M3" class="form-input" required />
            </div>

            <!-- PER-CITY QUANTITY ALLOCATION SECTION -->
            <div class="form-group mb-3">
              <label class="form-label flex-between">
                <span>City Location Stock Units Allocation</span>
                <span class="badge badge-purple font-mono">TOTAL: {{ calculatedTotalStock }} UNITS</span>
              </label>

              <div class="city-allocation-box p-3 glass-panel rounded">
                <div v-for="cityName in ['Lahore', 'Multan', 'Peshawar']" :key="cityName" class="city-qty-row flex-between mb-2">
                  <label class="checkbox-label flex-align gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      :value="cityName"
                      v-model="newForm.allocationCities"
                      @change="onCityCheckboxToggle(cityName)"
                    />
                    <span class="font-bold text-xs">🏛️ {{ cityName }} Depot</span>
                  </label>

                  <div v-if="newForm.allocationCities.includes(cityName)" class="flex-align gap-1">
                    <span class="text-xs text-muted">Allocated Units:</span>
                    <input
                      v-model.number="newForm.cityQuantities[cityName]"
                      type="number"
                      min="1"
                      class="form-input text-xs qty-mini-input font-mono font-bold"
                      required
                    />
                  </div>
                  <div v-else class="text-xs text-subtle font-mono">0 Units</div>
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Storage Bin / Warehouse Bin</label>
                <input v-model="newForm.storageBin" type="text" placeholder="WH-A1-B01" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Min Reorder Alert Qty</label>
                <input v-model.number="newForm.minStock" type="number" class="form-input" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Cost Purchase Price ($)</label>
                <input v-model.number="newForm.costPrice" type="number" step="0.01" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Selling Retail Price ($)</label>
                <input v-model.number="newForm.sellingPrice" type="number" step="0.01" class="form-input" required />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Product & Register Serials</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="editingProduct" class="modal-backdrop" @click.self="editingProduct = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="flex-align gap-2">
            <Pencil :size="18" class="text-primary" />
            <span>Edit Product Details ({{ editingProduct.name }})</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="editingProduct = null">&times;</button>
        </div>

        <form @submit.prevent="handleSaveEditProduct">
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Product SKU Code</label>
                <input v-model="editForm.sku" type="text" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <input v-model="editForm.category" type="text" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Product Name</label>
              <input v-model="editForm.name" type="text" class="form-input" required />
            </div>

            <!-- Allocation Cities Selection -->
            <div class="form-group mb-3">
              <label class="form-label">Allocation Place / City Location(s)</label>
              <div class="flex-wrap gap-3 p-3 glass-panel rounded">
                <label v-for="cName in ['Lahore', 'Multan', 'Peshawar']" :key="cName" class="checkbox-label flex-align gap-2 cursor-pointer">
                  <input type="checkbox" :value="cName" v-model="editForm.allocationCities" />
                  <span class="font-bold text-xs">🏛️ {{ cName }} Depot</span>
                </label>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Storage Bin / Warehouse Bin</label>
                <input v-model="editForm.storageBin" type="text" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Min Reorder Alert Qty</label>
                <input v-model.number="editForm.minStock" type="number" class="form-input" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Cost Purchase Price ($)</label>
                <input v-model.number="editForm.costPrice" type="number" step="0.01" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Selling Retail Price ($)</label>
                <input v-model.number="editForm.sellingPrice" type="number" step="0.01" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Total Stock Quantity</label>
              <input v-model.number="editForm.stockQty" type="number" min="0" class="form-input" required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="editingProduct = null">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Product Changes</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Serial Number Quick Peek Drawer Modal with Search Filter -->
    <div v-if="selectedProductSerials" class="modal-backdrop" @click.self="selectedProductSerials = null">
      <div class="modal-content drawer-modal">
        <div class="modal-header">
          <div>
            <h3 class="font-bold text-main">{{ selectedProductSerials.product.name }}</h3>
            <span class="font-mono text-primary text-xs">
              SKU: {{ selectedProductSerials.product.sku }} • Allocation: {{ selectedProductSerials.product.allocationCity }} • Bin: {{ selectedProductSerials.product.storageBin }}
            </span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="selectedProductSerials = null">&times;</button>
        </div>

        <div class="modal-body">
          <!-- SEARCH & STATUS FILTER BAR INSIDE MODAL -->
          <div class="glass-panel p-2 mb-3 flex-between flex-wrap gap-2">
            <div class="search-box flex-1">
              <Search :size="14" class="search-icon-sm" />
              <input
                v-model="drawerSearchQuery"
                type="text"
                placeholder="Filter serial number, city, or customer..."
                class="form-input text-xs drawer-search-input"
              />
            </div>

            <div class="flex-align gap-2">
              <select v-model="drawerStatusFilter" class="form-select text-xs drawer-status-select">
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Defective">Defective</option>
              </select>
              <span class="text-xs text-subtle font-mono">({{ filteredDrawerSerials.length }} items)</span>
            </div>
          </div>

          <!-- Serial Numbers Table -->
          <div class="table-container">
            <table class="table-lined">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th>City Allocation</th>
                  <th>Bin Location</th>
                  <th>Registered</th>
                  <th>Sold Info</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ser in filteredDrawerSerials" :key="ser.serialCode">
                  <td class="font-mono font-bold text-primary">{{ ser.serialCode }}</td>
                  <td>
                    <span :class="['badge', ser.status === 'Available' ? 'badge-success' : ser.status === 'Defective' ? 'badge-danger' : 'badge-neutral']">
                      {{ ser.status }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-info">{{ ser.allocationCity || selectedProductSerials.product.allocationCity || 'Lahore' }}</span>
                  </td>
                  <td class="font-mono text-xs">{{ ser.binLocation }}</td>
                  <td class="font-mono text-xs text-subtle">{{ ser.registeredDate }}</td>
                  <td class="text-xs">
                    <span v-if="ser.customer" class="text-main">{{ ser.customer }} ({{ ser.invoiceNo }})</span>
                    <span v-else class="text-subtle">N/A</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  PackagePlus,
  Search,
  AlertCircle,
  MapPin,
  Building2,
  QrCode,
  Eye,
  Pencil,
  Trash2
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const selectedCity = ref('ALL')
const selectedCategory = ref('ALL')
const showLowStockOnly = ref(false)

const drawerSearchQuery = ref('')
const drawerStatusFilter = ref('ALL')

const showAddModal = ref(false)
const editingProduct = ref(null)
const selectedProductSerials = ref(null)
const customCategoryName = ref('')
const customProductName = ref('')
const imagePreview = ref('')
const defaultImage = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80'

const availableCategories = ref(['Electronics', 'Laptops', 'Smartphones', 'Audio', 'Displays', 'Peripherals'])
const selectedProductName = ref(dataStore.products[0]?.name || 'MacBook Pro 16" M3 Max')

const newForm = ref({
  sku: '',
  name: '',
  category: 'Electronics',
  allocationCities: ['Lahore'],
  cityQuantities: {
    Lahore: 5,
    Multan: 3,
    Peshawar: 2
  },
  storageBin: 'WH-A1-B01',
  costPrice: 100,
  sellingPrice: 150,
  minStock: 3
})

const editForm = ref({
  sku: '',
  name: '',
  category: '',
  allocationCities: [],
  storageBin: '',
  costPrice: 0,
  sellingPrice: 0,
  stockQty: 0,
  minStock: 3
})

const calculatedTotalStock = computed(() => {
  return newForm.value.allocationCities.reduce((sum, c) => {
    return sum + (Number(newForm.value.cityQuantities[c]) || 0)
  }, 0)
})

const productNamesList = computed(() => {
  const set = new Set(dataStore.products.map(p => p.name))
  return Array.from(set)
})

const categories = computed(() => {
  const set = new Set([...dataStore.products.map(p => p.category), ...availableCategories.value])
  return Array.from(set)
})

function getProductCityList(p) {
  if (p.allocationCities && p.allocationCities.length > 0) return p.allocationCities
  if (p.allocationCity) return p.allocationCity.split(',').map(s => s.trim())
  return ['Lahore']
}

function onCityCheckboxToggle(cityName) {
  if (newForm.value.allocationCities.includes(cityName)) {
    if (!newForm.value.cityQuantities[cityName]) {
      newForm.value.cityQuantities[cityName] = 3
    }
  }
}

const filteredProducts = computed(() => {
  return dataStore.products.filter(p => {
    const citiesStr = (p.allocationCity || '').toLowerCase()
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          citiesStr.includes(searchQuery.value.toLowerCase()) ||
                          p.storageBin.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCity = selectedCity.value === 'ALL' || citiesStr.includes(selectedCity.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value
    const matchesLowStock = !showLowStockOnly.value || p.stockQty <= p.minStock
    return matchesSearch && matchesCity && matchesCategory && matchesLowStock
  })
})

const filteredDrawerSerials = computed(() => {
  if (!selectedProductSerials.value) return []
  return selectedProductSerials.value.list.filter(ser => {
    const q = drawerSearchQuery.value.toLowerCase()
    const matchesSearch = !q || ser.serialCode.toLowerCase().includes(q) ||
                          (ser.allocationCity && ser.allocationCity.toLowerCase().includes(q)) ||
                          (ser.customer && ser.customer.toLowerCase().includes(q)) ||
                          (ser.binLocation && ser.binLocation.toLowerCase().includes(q))
    const matchesStatus = drawerStatusFilter.value === 'ALL' || ser.status === drawerStatusFilter.value
    return matchesSearch && matchesStatus
  })
})

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imagePreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

function onProductNameSelect() {
  if (selectedProductName.value !== '__NEW_NAME__') {
    const match = dataStore.products.find(p => p.name === selectedProductName.value)
    if (match) {
      newForm.value.category = match.category
      newForm.value.costPrice = match.costPrice
      newForm.value.sellingPrice = match.sellingPrice
    }
  }
}

function openEditModal(product) {
  editingProduct.value = product
  editForm.value = {
    sku: product.sku,
    name: product.name,
    category: product.category,
    allocationCities: getProductCityList(product),
    storageBin: product.storageBin,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    stockQty: product.stockQty,
    minStock: product.minStock
  }
}

function handleSaveEditProduct() {
  if (editingProduct.value) {
    dataStore.updateProduct(editingProduct.value.id, editForm.value, authStore.user)
    uiStore.showToast(`Updated details for product ${editForm.value.name}!`, 'success')
    editingProduct.value = null
  }
}

function confirmDeleteProduct(product) {
  uiStore.showModal(
    'Confirm Delete Product',
    `Are you sure you want to permanently delete SKU "${product.sku}" (${product.name}) and all its associated serial numbers from the system?`,
    'danger',
    'Delete Product'
  )
  
  // Store reference to confirm deletion if user approves
  const unwatch = uiStore.$subscribe((mutation, state) => {
    if (!state.modal.show) {
      // Check if deleted
      unwatch()
    }
  })

  dataStore.deleteProduct(product.id, authStore.user)
  uiStore.showToast(`Product ${product.name} deleted from inventory!`, 'danger')
}

function getProductSerialsCount(productId) {
  return dataStore.serials.filter(s => s.productId === productId).length
}

function openSerialDrawer(product) {
  const list = dataStore.serials.filter(s => s.productId === product.id)
  drawerSearchQuery.value = ''
  drawerStatusFilter.value = 'ALL'
  selectedProductSerials.value = { product, list }
}

function handleAddProduct() {
  let finalCategory = newForm.value.category
  if (finalCategory === '__NEW__') {
    finalCategory = customCategoryName.value.trim() || 'Electronics'
    if (!availableCategories.value.includes(finalCategory)) {
      availableCategories.value.push(finalCategory)
    }
  }

  let finalName = selectedProductName.value
  if (finalName === '__NEW_NAME__') {
    finalName = customProductName.value.trim() || 'New Product Item'
  }

  if (!newForm.value.allocationCities || newForm.value.allocationCities.length === 0) {
    newForm.value.allocationCities = ['Lahore']
  }

  const payload = {
    ...newForm.value,
    name: finalName,
    category: finalCategory,
    image: imagePreview.value || defaultImage,
    stockQty: calculatedTotalStock.value
  }

  dataStore.addProduct(payload, authStore.user)
  showAddModal.value = false
  uiStore.showToast(`Product ${payload.name} allocated across ${payload.allocationCities.join(', ')} (${calculatedTotalStock.value} Units) registered!`, 'success')
  newForm.value = { sku: '', name: '', category: 'Electronics', allocationCities: ['Lahore'], cityQuantities: { Lahore: 5, Multan: 3, Peshawar: 2 }, storageBin: 'WH-A1-B01', costPrice: 100, sellingPrice: 150, minStock: 3 }
  customCategoryName.value = ''
  customProductName.value = ''
  imagePreview.value = ''
  selectedProductName.value = dataStore.products[0]?.name || 'MacBook Pro 16" M3 Max'
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-1 { margin-top: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.85rem 1.25rem; }
.p-4 { padding: 1.25rem; }

.search-box { position: relative; width: 300px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-icon-sm { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-input { padding-left: 2.2rem; }
.drawer-search-input { padding-left: 1.8rem; }
.city-select { width: 185px; }
.category-select { width: 165px; }
.drawer-status-select { width: 130px; }
.qty-mini-input { width: 75px; padding: 0.2rem 0.4rem; text-align: center; }

.drawer-modal { max-width: 720px; }
.upload-preview-thumb { width: 46px; height: 46px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color); }

.flex-1 { flex: 1; }

.product-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
.cursor-pointer { cursor: pointer; }
.rounded { border-radius: var(--radius-md); }
</style>

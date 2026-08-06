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
              <th>Allocation Place</th>
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
                <span :class="['badge', product.allocationCity === 'Lahore' ? 'badge-info' : product.allocationCity === 'Multan' ? 'badge-success' : 'badge-purple']">
                  <Building2 :size="11" />
                  {{ product.allocationCity || 'Lahore' }}
                </span>
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
                <button class="btn btn-sm btn-secondary" @click="openSerialDrawer(product)">
                  <Eye :size="13" />
                  <span>View Serials</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Product Modal (Category is a Select Dropdown) -->
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

            <div class="form-group">
              <label class="form-label">Product Name</label>
              <input v-model="newForm.name" type="text" placeholder="MacBook Air 15 M3" class="form-input" required />
            </div>

            <!-- Allocation Place Selection & Storage Bin Grid -->
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Allocation Place / City Location</label>
                <select v-model="newForm.allocationCity" class="form-select" required>
                  <option value="Lahore">🏛️ Lahore Warehouse</option>
                  <option value="Multan">🏛️ Multan Hub</option>
                  <option value="Peshawar">🏛️ Peshawar Depot</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Storage Bin / Warehouse Bin</label>
                <input v-model="newForm.storageBin" type="text" placeholder="WH-A1-B01" class="form-input" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Min Reorder Alert Qty</label>
                <input v-model.number="newForm.minStock" type="number" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Cost Purchase Price ($)</label>
                <input v-model.number="newForm.costPrice" type="number" step="0.01" class="form-input" required />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Selling Retail Price ($)</label>
                <input v-model.number="newForm.sellingPrice" type="number" step="0.01" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Initial Stock Quantity (Auto-Serials)</label>
                <input v-model.number="newForm.stockQty" type="number" min="0" class="form-input" required />
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
  Eye
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
const selectedProductSerials = ref(null)
const customCategoryName = ref('')

const availableCategories = ref(['Electronics', 'Laptops', 'Smartphones', 'Audio', 'Displays', 'Peripherals'])

const newForm = ref({
  sku: '',
  name: '',
  category: 'Electronics',
  allocationCity: 'Lahore',
  storageBin: 'WH-A1-B01',
  costPrice: 100,
  sellingPrice: 150,
  stockQty: 5,
  minStock: 3
})

const categories = computed(() => {
  const set = new Set([...dataStore.products.map(p => p.category), ...availableCategories.value])
  return Array.from(set)
})

const filteredProducts = computed(() => {
  return dataStore.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          (p.allocationCity && p.allocationCity.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
                          p.storageBin.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCity = selectedCity.value === 'ALL' || p.allocationCity === selectedCity.value
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

  const payload = {
    ...newForm.value,
    category: finalCategory
  }

  dataStore.addProduct(payload, authStore.user)
  showAddModal.value = false
  uiStore.showToast(`Product ${payload.name} allocated to ${payload.allocationCity} registered!`, 'success')
  newForm.value = { sku: '', name: '', category: 'Electronics', allocationCity: 'Lahore', storageBin: 'WH-A1-B01', costPrice: 100, sellingPrice: 150, stockQty: 5, minStock: 3 }
  customCategoryName.value = ''
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
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

.drawer-modal { max-width: 720px; }

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
</style>

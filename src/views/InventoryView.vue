<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <h1 class="page-title">Product Storage & Inventory</h1>
        <p class="page-subtitle">Multi-bin warehouse locations, cost & retail pricing, stock levels and serial numbers</p>
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
          placeholder="Filter by product name, SKU, or storage bin..."
          class="form-input search-input"
        />
      </div>

      <div class="filter-pills flex-align gap-2">
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
                <span class="font-mono badge badge-info">
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
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Product SKU Code</label>
                <input v-model="newForm.sku" type="text" placeholder="APL-MAC-M3" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Category</label>
                <input v-model="newForm.category" type="text" placeholder="Laptops" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Product Name</label>
              <input v-model="newForm.name" type="text" placeholder="MacBook Air 15 M3" class="form-input" required />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Storage Bin / Warehouse Bin</label>
                <input v-model="newForm.storageBin" type="text" placeholder="WH-A3-B02" class="form-input" required />
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

            <div class="form-group">
              <label class="form-label">Initial Stock Quantity (Auto-generates Serials)</label>
              <input v-model.number="newForm.stockQty" type="number" min="0" class="form-input" required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Product & Register Serials</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Serial Number Quick Peek Drawer Modal -->
    <div v-if="selectedProductSerials" class="modal-backdrop" @click.self="selectedProductSerials = null">
      <div class="modal-content">
        <div class="modal-header">
          <div>
            <h3 class="font-bold text-main">{{ selectedProductSerials.product.name }}</h3>
            <span class="font-mono text-primary text-xs">SKU: {{ selectedProductSerials.product.sku }} • Bin: {{ selectedProductSerials.product.storageBin }}</span>
          </div>
          <button class="btn btn-ghost btn-sm" @click="selectedProductSerials = null">&times;</button>
        </div>

        <div class="modal-body">
          <div class="table-container">
            <table class="table-lined">
              <thead>
                <tr>
                  <th>Serial Code</th>
                  <th>Status</th>
                  <th>Bin Location</th>
                  <th>Registered</th>
                  <th>Sold Info</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ser in selectedProductSerials.list" :key="ser.serialCode">
                  <td class="font-mono font-bold text-primary">{{ ser.serialCode }}</td>
                  <td>
                    <span :class="['badge', ser.status === 'Available' ? 'badge-success' : ser.status === 'Defective' ? 'badge-danger' : 'badge-neutral']">
                      {{ ser.status }}
                    </span>
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
  QrCode,
  Eye
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

const searchQuery = ref('')
const selectedCategory = ref('ALL')
const showLowStockOnly = ref(false)

const showAddModal = ref(false)
const selectedProductSerials = ref(null)

const newForm = ref({
  sku: '',
  name: '',
  category: 'Electronics',
  storageBin: 'WH-A1-B01',
  costPrice: 100,
  sellingPrice: 150,
  stockQty: 5,
  minStock: 3
})

const categories = computed(() => {
  const set = new Set(dataStore.products.map(p => p.category))
  return Array.from(set)
})

const filteredProducts = computed(() => {
  return dataStore.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          p.storageBin.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value
    const matchesLowStock = !showLowStockOnly.value || p.stockQty <= p.minStock
    return matchesSearch && matchesCategory && matchesLowStock
  })
})

function getProductSerialsCount(productId) {
  return dataStore.serials.filter(s => s.productId === productId).length
}

function openSerialDrawer(product) {
  const list = dataStore.serials.filter(s => s.productId === product.id)
  selectedProductSerials.value = { product, list }
}

function handleAddProduct() {
  dataStore.addProduct(newForm.value, authStore.user)
  showAddModal.value = false
  uiStore.showToast(`Product ${newForm.value.name} and initial serials registered!`, 'success')
  newForm.value = { sku: '', name: '', category: 'Electronics', storageBin: 'WH-A1-B01', costPrice: 100, sellingPrice: 150, stockQty: 5, minStock: 3 }
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-3 { padding: 0.85rem 1.25rem; }
.p-4 { padding: 1.25rem; }

.search-box { position: relative; width: 320px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-input { padding-left: 2.2rem; }
.category-select { width: 180px; }

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

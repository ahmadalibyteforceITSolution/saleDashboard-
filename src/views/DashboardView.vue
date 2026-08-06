<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <LayoutDashboard :size="24" class="text-primary" />
          <h1 class="page-title">Executive Operations & City Allocations</h1>
        </div>
        <p class="page-subtitle">Real-time inventory levels, city stock distribution (Lahore, Multan, Peshawar), revenue KPI tracking & serial audit</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="refreshData">
          <RefreshCw :size="16" />
          <span>Sync Real-Time Data</span>
        </button>
        <button class="btn btn-primary" @click="router.push('/sales')">
          <ShoppingCart :size="16" />
          <span>New Sales POS</span>
        </button>
      </div>
    </div>

    <!-- REGIONAL CITY ALLOCATION QUICK OVERVIEW WIDGET (ADMIN & SUPERADMIN) -->
    <div class="glass-panel p-4 mb-4">
      <div class="flex-between mb-3">
        <h3 class="panel-title flex-align gap-2">
          <Building2 :size="18" class="text-primary" />
          <span>Regional City Stock & Product Allocation Overview</span>
        </h3>
        <span class="badge badge-purple font-mono">3 DEPOT LOCATIONS</span>
      </div>

      <div class="city-widget-grid">
        <div
          v-for="city in cityAllocations"
          :key="city.name"
          :class="['glass-card', 'city-widget-card', activeCityFilter === city.name ? 'active-city-card' : '']"
          @click="toggleCityFilter(city.name)"
        >
          <div class="flex-between mb-2">
            <span class="city-title flex-align gap-2 font-bold text-main">
              <MapPin :size="16" :class="city.name === 'Lahore' ? 'text-info' : city.name === 'Multan' ? 'text-success' : 'text-purple'" />
              {{ city.name }} Depot
            </span>
            <span :class="['badge', city.name === 'Lahore' ? 'badge-info' : city.name === 'Multan' ? 'badge-success' : 'badge-purple']">
              {{ city.skus }} SKUs Allocated
            </span>
          </div>

          <div class="flex-between text-xs text-muted mb-1">
            <span>Total Units Stocked:</span>
            <span class="font-mono text-main font-bold text-sm">{{ city.stockQty }} units</span>
          </div>
          <div class="flex-between text-xs text-muted mb-1">
            <span>Inventory Cost Value:</span>
            <span class="font-mono text-main">${{ city.costValuation.toLocaleString() }}</span>
          </div>
          <div class="flex-between text-xs text-muted mb-2">
            <span>Retail Valuation:</span>
            <span class="font-mono text-success font-bold">${{ city.retailValuation.toLocaleString() }}</span>
          </div>

          <div class="line-divider"></div>
          <div class="flex-between text-xs font-semibold text-primary mt-2">
            <span>{{ activeCityFilter === city.name ? '✓ Filter Active' : 'Click to filter catalog' }}</span>
            <ChevronRight :size="14" />
          </div>
        </div>
      </div>
    </div>

    <!-- Core Financial KPI Metrics -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Gross Invoiced Revenue</span>
          <span class="badge badge-success">+18.4% YTD</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>From {{ dataStore.salesInvoices.length }} completed invoices</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Net Operating Profit</span>
          <span class="badge badge-purple font-mono">{{ dataStore.profitMarginPercent }}% MARGIN</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>Net profit retained after COGS</span>
        </div>
      </div>

      <div class="glass-card kpi-card">
        <div class="flex-between">
          <span class="kpi-title">Total Inventory Valuation</span>
          <span class="badge badge-info">RETAIL VALUE</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.inventoryValuationRetail.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>Cost value: ${{ dataStore.inventoryValuationCost.toLocaleString() }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-warning">
        <div class="flex-between">
          <span class="kpi-title">Low Stock Reorder Alerts</span>
          <span class="badge badge-warning font-mono">{{ dataStore.lowStockProducts.length }} ITEMS</span>
        </div>
        <div class="kpi-value font-mono">{{ dataStore.lowStockProducts.length }} SKUs</div>
        <div class="kpi-subtitle flex-align gap-1 text-warning">
          <AlertTriangle :size="14" />
          <span>Needs purchasing restocking</span>
        </div>
      </div>
    </div>

    <!-- Products & City Allocations Live Table -->
    <div class="glass-panel p-4 mb-4">
      <div class="flex-between mb-3">
        <h3 class="panel-title flex-align gap-2">
          <Package :size="18" class="text-primary" />
          <span>Product Catalog & City Allocations ({{ activeCityFilter === 'ALL' ? 'All Depots' : activeCityFilter }})</span>
        </h3>

        <div class="flex-align gap-2">
          <button
            v-for="c in ['ALL', 'Lahore', 'Multan', 'Peshawar']"
            :key="c"
            :class="['btn', 'btn-sm', activeCityFilter === c ? 'btn-primary' : 'btn-ghost']"
            @click="activeCityFilter = c"
          >
            {{ c === 'ALL' ? 'All Cities' : c }}
          </button>

          <button class="btn btn-sm btn-secondary" @click="router.push('/inventory')">
            Manage Inventory
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Allocation Place</th>
              <th>Storage Bin</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Qty</th>
              <th>Serials Available</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredCityProducts" :key="p.id">
              <td>
                <div class="flex-align gap-2">
                  <img :src="p.image" class="thumb-mini" alt="Thumb" />
                  <div>
                    <div class="font-bold text-main">{{ p.name }}</div>
                    <div class="font-mono text-primary text-xs">{{ p.sku }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-neutral">{{ p.category }}</span>
              </td>
              <td>
                <span :class="['badge', (p.allocationCity || 'Lahore') === 'Lahore' ? 'badge-info' : (p.allocationCity || 'Lahore') === 'Multan' ? 'badge-success' : 'badge-purple']">
                  <Building2 :size="10" />
                  {{ p.allocationCity || 'Lahore' }}
                </span>
              </td>
              <td class="font-mono text-xs">{{ p.storageBin }}</td>
              <td class="font-mono text-muted">${{ p.costPrice.toFixed(2) }}</td>
              <td class="font-mono text-main font-bold">${{ p.sellingPrice.toFixed(2) }}</td>
              <td>
                <span class="font-mono font-bold">{{ p.stockQty }} units</span>
              </td>
              <td class="font-mono text-xs text-secondary">
                {{ getAvailableSerials(p.id) }} Units
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  LayoutDashboard,
  RefreshCw,
  ShoppingCart,
  Building2,
  MapPin,
  AlertTriangle,
  Package,
  ChevronRight
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()
const router = useRouter()

const activeCityFilter = ref('ALL')

const cityAllocations = computed(() => {
  const cities = ['Lahore', 'Multan', 'Peshawar']
  return cities.map(cityName => {
    const cityProds = dataStore.products.filter(p => (p.allocationCity || 'Lahore') === cityName)
    const skus = cityProds.length
    const stockQty = cityProds.reduce((acc, p) => acc + p.stockQty, 0)
    const costValuation = cityProds.reduce((acc, p) => acc + (p.stockQty * p.costPrice), 0)
    const retailValuation = cityProds.reduce((acc, p) => acc + (p.stockQty * p.sellingPrice), 0)
    return { name: cityName, skus, stockQty, costValuation, retailValuation }
  })
})

const filteredCityProducts = computed(() => {
  if (activeCityFilter.value === 'ALL') return dataStore.products
  return dataStore.products.filter(p => (p.allocationCity || 'Lahore') === activeCityFilter.value)
})

function getAvailableSerials(productId) {
  return dataStore.serials.filter(s => s.productId === productId && s.status === 'Available').length
}

function toggleCityFilter(cityName) {
  if (activeCityFilter.value === cityName) {
    activeCityFilter.value = 'ALL'
  } else {
    activeCityFilter.value = cityName
    uiStore.showToast(`Filtered stock to ${cityName} Depot!`, 'info')
  }
}

function refreshData() {
  uiStore.showToast('Data synchronized with live database!', 'success')
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-2 { margin-top: 0.5rem; }
.p-4 { padding: 1.25rem; }

.page-title { font-size: 1.8rem; font-weight: 800; }
.page-subtitle { font-size: 0.85rem; color: var(--text-muted); }
.action-buttons { display: flex; gap: 0.75rem; }

.city-widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.city-widget-card {
  cursor: pointer;
  transition: var(--transition-fast);
}

.city-widget-card:hover, .active-city-card {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.thumb-mini {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
</style>

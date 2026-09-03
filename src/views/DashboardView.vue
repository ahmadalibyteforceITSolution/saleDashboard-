<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title + quick action buttons
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Head Office (Peshawar) Executive Dashboard"
      subtitle="Central monitoring of branch sales (Peshawar HO, Multan, Lahore), machine serial tracking, payment ledgers & stock transfers"
    >
      <template #actions>
        <div class="flex gap-2 flex-wrap">
          <button class="btn btn-secondary" @click="router.push('/universal-search')">
            <span>🔍 Universal Search</span>
          </button>
          <button class="btn btn-secondary flex items-center gap-1.5" @click="showTransferModal = true">
            <ArrowRightLeft :size="16" />
            <span>Branch Transfer</span>
          </button>
          <button class="btn btn-success flex items-center gap-1.5" @click="showAddModal = true">
            <PackagePlus :size="16" />
            <span>Add Equipment</span>
          </button>
          <button class="btn btn-primary flex items-center gap-1.5" @click="router.push('/sales')">
            <ShoppingCart :size="16" />
            <span>New Sales POS</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      CITY DEPOT OVERVIEW — 3 clickable location cards
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4">
      <div class="flex justify-between items-center flex-wrap gap-3 mb-4">
        <h3 class="flex items-center gap-2 font-bold text-main">
          <Building2 :size="18" class="text-primary" />
          <span>Regional City Stock & Product Allocation Overview</span>
        </h3>
        <StatBadge color="purple" :mono="true">3 DEPOT LOCATIONS</StatBadge>
      </div>

      <!-- City cards: click to filter the product table below -->
      <div class="city-widget-grid">
        <div
          v-for="city in cityAllocations"
          :key="city.name"
          :class="['glass-card', 'city-widget-card', activeCityFilter === city.name ? 'active-city-card' : '']"
          @click="toggleCityFilter(city.name)"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="flex items-center gap-2 font-bold text-main">
              <MapPin :size="16" :class="city.name === 'Lahore' ? 'text-info' : city.name === 'Multan' ? 'text-success' : 'text-purple'" />
              {{ city.name }} Depot
            </span>
            <StatBadge :color="city.name === 'Lahore' ? 'info' : city.name === 'Multan' ? 'success' : 'purple'">
              {{ city.skus }} SKUs Allocated
            </StatBadge>
          </div>

          <div class="flex justify-between text-xs text-muted mb-1">
            <span>Total Units Stocked:</span>
            <span class="font-mono text-main font-bold text-sm">{{ city.stockQty }} units</span>
          </div>
          <div class="flex justify-between text-xs text-muted mb-1">
            <span>Inventory Cost Value:</span>
            <span class="font-mono text-main">PKR {{ (city.costValuation || 0).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-xs text-muted mb-2">
            <span>Retail Valuation:</span>
            <span class="font-mono text-success font-bold">PKR {{ (city.retailValuation || 0).toLocaleString() }}</span>
          </div>

          <div class="line-divider"></div>
          <div class="flex justify-between text-xs font-semibold text-primary mt-2">
            <span>{{ activeCityFilter === city.name ? '✓ Filter Active' : 'Click to filter catalog' }}</span>
            <ChevronRight :size="14" />
          </div>
        </div>
      </div>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      SALES PERIOD FILTER BAR — Update Prices & KPIs According to Selected Date
    ════════════════════════════════════════════ -->
    <DateFilterBar
      v-model="salesDateFilter"
      title="Sale Date Filter:"
    />

    <!-- ════════════════════════════════════════════
      CORE KPI METRICS — Revenue, Profit, Stock, Alerts
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Gross Invoiced Revenue"
        :value="`PKR ${(salesMetrics.revenue || 0).toLocaleString()}`"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? `From ${salesMetrics.count} completed invoices`
          : `From ${salesMetrics.count} invoices (${salesFilterLabel})`"
        :badge="`${salesMetrics.count} INVOICES`"
        badge-color="success"
        accent-class="kpi-success"
      />

      <KpiCard
        label="Net Operating Profit"
        :value="`PKR ${(salesMetrics.profit || 0).toLocaleString()}`"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? 'Net profit retained after COGS'
          : `Retained profit for ${salesFilterLabel}`"
        :badge="`${salesMetrics.marginPercent}% MARGIN`"
        badge-color="purple"
        accent-class="kpi-purple"
      />

      <KpiCard
        label="Total Inventory Valuation"
        :value="`PKR ${(dataStore.inventoryValuationRetail || 0).toLocaleString()}`"
        :subtitle="`Cost value: PKR ${(dataStore.inventoryValuationCost || 0).toLocaleString()}`"
        badge="RETAIL VALUE"
        badge-color="info"
      />

      <KpiCard
        label="Low Stock Reorder Alerts"
        :value="`${dataStore.lowStockProducts.length} SKUs`"
        :badge="`${dataStore.lowStockProducts.length} ITEMS`"
        badge-color="warning"
        accent-class="kpi-warning"
      >
        <!-- Custom content: warning icon + message -->
        <div class="flex items-center gap-1 text-warning text-xs">
          <AlertTriangle :size="14" />
          <span>Needs purchasing restocking</span>
        </div>
      </KpiCard>
    </div>

    <!-- ════════════════════════════════════════════
      PRODUCT TABLE — Filtered by selected city depot & sorted
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4">
      <!-- Table header + filter buttons -->
      <div class="flex justify-between items-center flex-wrap gap-3 mb-3">
        <h3 class="flex items-center gap-2 font-bold text-main">
          <Package :size="18" class="text-primary" />
          <span>Product Catalog & City Allocations ({{ activeCityFilter === 'ALL' ? 'All Depots' : activeCityFilter }})</span>
        </h3>

        <div class="flex items-center flex-wrap gap-2">
          <!-- City filter buttons -->
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

      <!-- Sorting Controls & Search Bar -->
      <div class="dash-catalog-toolbar">
        <div class="dash-sort-group">
          <div class="dash-select-box">
            <ArrowUpDown :size="13" class="text-primary flex-shrink-0" />
            <span class="text-xs text-subtle font-semibold">Sort:</span>
            <select v-model="productSortKey" class="dash-select">
              <option value="sellingPrice">Selling Price</option>
              <option value="costPrice">Cost Price</option>
              <option value="stockQty">Stock Qty</option>
              <option value="name">Product Name</option>
              <option value="sku">SKU Code</option>
            </select>
          </div>

          <!-- Ascending / Descending Toggle Buttons -->
          <div class="dash-toggle-group">
            <button
              type="button"
              :class="['dash-toggle-btn', productSortOrder === 'asc' ? 'active' : '']"
              @click="productSortOrder = 'asc'"
              title="Sort Ascending (Lowest Price / A-Z)"
            >
              <ArrowUp :size="12" />
              <span>Asc</span>
            </button>
            <button
              type="button"
              :class="['dash-toggle-btn', productSortOrder === 'desc' ? 'active' : '']"
              @click="productSortOrder = 'desc'"
              title="Sort Descending (Highest Price / Z-A)"
            >
              <ArrowDown :size="12" />
              <span>Desc</span>
            </button>
          </div>
        </div>

        <div class="dash-search-group">
          <div class="relative">
            <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="productSearchQuery"
              type="text"
              placeholder="Search SKU, name..."
              class="dash-search-input"
            />
          </div>
          <span class="badge badge-neutral text-xs font-mono py-1 px-2.5 h-8 flex items-center whitespace-nowrap">
            {{ sortedCityProducts.length }} SKUs
          </span>
        </div>
      </div>

      <!-- Product table using DataTable component with clickable sort headers -->
      <DataTable
        :columns="productTableColumns"
        :sort-key="productSortKey"
        :sort-order="productSortOrder"
        @sort="handleProductHeaderSort"
        :empty="sortedCityProducts.length === 0"
        empty-message="No products found matching the selected filter."
      >
        <tr v-for="p in sortedCityProducts" :key="p.id">
          <td>
            <div class="flex items-center gap-2">
              <img :src="p.image" class="thumb-mini" alt="Thumb" />
              <div>
                <div class="font-bold text-main">{{ p.name }}</div>
                <div class="font-mono text-primary text-xs">{{ p.sku }}</div>
              </div>
            </div>
          </td>
          <td><StatBadge color="neutral">{{ p.category }}</StatBadge></td>
          <td>
            <StatBadge :color="(p.allocationCity || 'Lahore') === 'Lahore' ? 'info' : (p.allocationCity || 'Lahore') === 'Multan' ? 'success' : 'purple'">
              <Building2 :size="10" />
              {{ p.allocationCity || 'Lahore' }}
            </StatBadge>
          </td>
          <td class="font-mono text-xs">{{ p.storageBin }}</td>
          <td class="font-mono text-muted">PKR {{ (p.costPrice || 0).toLocaleString() }}</td>
          <td><span class="font-mono font-bold text-success">PKR {{ (p.sellingPrice || p.salePrice || 0).toLocaleString() }}</span></td>
          <td><span class="font-mono font-bold">{{ activeCityFilter === 'ALL' ? p.stockQty : getAvailableSerials(p.id, activeCityFilter) }} units</span></td>
          <td class="font-mono text-xs text-secondary">{{ getAvailableSerials(p.id, activeCityFilter) }} Units Available</td>
        </tr>
      </DataTable>
    </GlassPanel>

    <!-- Extracted Modals -->
    <AddEquipmentModal :show="showAddModal" @close="showAddModal = false" />
    <StockTransferModal :show="showTransferModal" @close="showTransferModal = false" />
  </div>
</template>

<script setup>
// ──────────────────────────────────────────────────────────────
//  DashboardView — Executive HO Dashboard
//  Uses reusable components from:
//    src/components/ui/    → PageHeader, KpiCard, GlassPanel, StatBadge, DataTable
// ──────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'

// Reusable UI components
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard    from '@/components/ui/KpiCard.vue'
import GlassPanel from '@/components/ui/GlassPanel.vue'
import StatBadge  from '@/components/ui/StatBadge.vue'
import DataTable  from '@/components/ui/DataTable.vue'
import DateFilterBar from '@/components/ui/DateFilterBar.vue'
import AddEquipmentModal from '@/components/AddEquipmentModal.vue'
import StockTransferModal from '@/components/StockTransferModal.vue'

// Lucide icons
import {
  LayoutDashboard,
  ShoppingCart,
  Building2,
  MapPin,
  AlertTriangle,
  Package,
  ChevronRight,
  ArrowRightLeft,
  PackagePlus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-vue-next'

// ── Stores & router ───────────────────────────────────────────
const authStore  = useAuthStore()
const dataStore  = useDataStore()
const uiStore    = useUiStore()
const router     = useRouter()

// ── State ─────────────────────────────────────────────────────
const activeCityFilter = ref('ALL')
const showTransferModal = ref(false)
const showAddModal = ref(false)

// ── Sales Date Filter State & Dynamic Metrics ─────────────────
const salesDateFilter = ref({
  preset: 'All Time',
  startDate: null,
  endDate: null
})

const salesMetrics = computed(() => {
  if (salesDateFilter.value.preset === 'All Time') {
    return {
      revenue: dataStore.totalRevenue,
      profit: dataStore.grossProfit,
      marginPercent: dataStore.profitMarginPercent,
      count: dataStore.salesInvoices.length
    }
  }
  return dataStore.getSalesMetrics(salesDateFilter.value.startDate, salesDateFilter.value.endDate)
})

const salesFilterLabel = computed(() => {
  const { preset, startDate, endDate } = salesDateFilter.value
  if (preset === 'All Time') return 'All Time'
  if (startDate && endDate) {
    return startDate === endDate ? `${preset}: ${startDate}` : `${startDate} ~ ${endDate}`
  }
  return preset
})

// ── Product Sorting & Search State ───────────────────────────
const productSortKey = ref('sellingPrice')
const productSortOrder = ref('desc') // 'asc' | 'desc'
const productSearchQuery = ref('')

const productTableColumns = [
  { label: 'Product / SKU', key: 'name', sortable: true },
  { label: 'Category', key: 'category', sortable: true },
  { label: 'Allocation Place', key: 'allocationCity', sortable: false },
  { label: 'Storage Bin', key: 'storageBin', sortable: false },
  { label: 'Cost Price', key: 'costPrice', sortable: true },
  { label: 'Selling Price', key: 'sellingPrice', sortable: true },
  { label: 'Stock Qty', key: 'stockQty', sortable: true },
  { label: 'Serials Available', key: 'serialsAvailable', sortable: false }
]

function handleProductHeaderSort(key) {
  if (productSortKey.value === key) {
    productSortOrder.value = productSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    productSortKey.value = key
    productSortOrder.value = 'asc'
  }
}

// ── City depot overview cards ─────────────────────────────────
const cityAllocations = computed(() => {
  return ['Lahore', 'Multan', 'Peshawar'].map(cityName => {
    const citySerials = dataStore.serials.filter(s => (s.allocationCity || 'Peshawar') === cityName && s.status === 'Available')
    const cityProductIds = new Set(citySerials.map(s => s.productId))
    const cityProds = dataStore.products.filter(p => 
      cityProductIds.has(p.id) || 
      (Array.isArray(p.allocationCities) && p.allocationCities.includes(cityName)) ||
      (p.allocationCity && p.allocationCity.includes(cityName))
    )
    const stockQty = citySerials.length || (dataStore.serials.length === 0 ? cityProds.reduce((acc, p) => acc + (p.stockQty || 0), 0) : 0)
    const costValuation = citySerials.reduce((acc, s) => {
      const p = dataStore.products.find(x => x.id === s.productId || x.sku === s.sku)
      return acc + (p ? (p.costPrice || 0) : 0)
    }, 0)
    const retailValuation = citySerials.reduce((acc, s) => {
      const p = dataStore.products.find(x => x.id === s.productId || x.sku === s.sku)
      return acc + (p ? (p.sellingPrice || p.salePrice || 0) : 0)
    }, 0)

    return {
      name:            cityName,
      skus:            cityProds.length,
      stockQty,
      costValuation,
      retailValuation
    }
  })
})

// ── Filtered & Sorted product list ─────────────────────────────
const filteredCityProducts = computed(() => {
  if (activeCityFilter.value === 'ALL') return dataStore.products
  const targetCity = activeCityFilter.value
  return dataStore.products.filter(p => {
    const hasSerialsInCity = dataStore.serials.some(s => (s.productId === p.id || s.sku === p.sku) && s.allocationCity === targetCity && s.status === 'Available')
    const isAllocatedArr = Array.isArray(p.allocationCities) && p.allocationCities.includes(targetCity)
    const isAllocatedStr = p.allocationCity && p.allocationCity.includes(targetCity)
    return hasSerialsInCity || isAllocatedArr || isAllocatedStr
  })
})

const sortedCityProducts = computed(() => {
  let list = [...filteredCityProducts.value]

  if (productSearchQuery.value.trim()) {
    const q = productSearchQuery.value.toLowerCase().trim()
    list = list.filter(p => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    )
  }

  list.sort((a, b) => {
    let aVal = a[productSortKey.value]
    let bVal = b[productSortKey.value]

    if (productSortKey.value === 'sellingPrice') {
      aVal = Number(a.sellingPrice || a.salePrice || 0)
      bVal = Number(b.sellingPrice || b.salePrice || 0)
    } else if (productSortKey.value === 'costPrice') {
      aVal = Number(a.costPrice || 0)
      bVal = Number(b.costPrice || 0)
    } else if (productSortKey.value === 'stockQty') {
      aVal = activeCityFilter.value === 'ALL' ? Number(a.stockQty || 0) : getAvailableSerials(a.id, activeCityFilter.value)
      bVal = activeCityFilter.value === 'ALL' ? Number(b.stockQty || 0) : getAvailableSerials(b.id, activeCityFilter.value)
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase()
      bVal = (bVal || '').toLowerCase()
      return productSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    if (productSortOrder.value === 'asc') {
      return (aVal || 0) - (bVal || 0)
    } else {
      return (bVal || 0) - (aVal || 0)
    }
  })

  return list
})

// ── Helper functions ──────────────────────────────────────────
function getAvailableSerials(productId, city = 'ALL') {
  return dataStore.serials.filter(s => 
    s.productId === productId && 
    s.status === 'Available' && 
    (city === 'ALL' || s.allocationCity === city)
  ).length
}

function toggleCityFilter(cityName) {
  if (activeCityFilter.value === cityName) {
    activeCityFilter.value = 'ALL'
  } else {
    activeCityFilter.value = cityName
    uiStore.showToast(`Filtered stock to ${cityName} Depot!`, 'info')
  }
}
</script>

<style scoped>
/* ── City depot grid ──────────────────────────────────────── */
.city-widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.city-widget-card {
  cursor: pointer;
  transition: var(--transition-fast);
}

.city-widget-card:hover,
.active-city-card {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* ── Product image thumbnail ──────────────────────────────── */
.thumb-mini {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

/* ── Responsive adjustments ───────────────────────────────── */
@media (max-width: 480px) {
  .city-widget-grid { grid-template-columns: 1fr; }
}

/* ── Dashboard Catalog Toolbar ────────────────────────────── */
.dash-catalog-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.85rem;
  background: rgba(17, 24, 39, 0.4);
  border: 1px solid var(--border-line);
  border-radius: var(--radius-md);
}

.dash-sort-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.dash-select-box {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.15rem;
  padding: 0 0.5rem 0 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.dash-select-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.dash-select {
  width: auto !important;
  height: 100% !important;
  min-height: auto !important;
  padding: 0 1.25rem 0 0 !important;
  border: none !important;
  background: transparent !important;
  font-size: 0.825rem !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}

.dash-toggle-group {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.dash-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.6rem;
  height: calc(2.15rem - 4px);
  border: none;
  background: transparent;
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  transition: var(--transition-fast);
}

.dash-toggle-btn:hover {
  color: var(--text-main);
}

.dash-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dash-search-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dash-search-input {
  width: 12rem !important;
  height: 2.15rem !important;
  min-height: 2.15rem !important;
  padding: 0 0.5rem 0 1.85rem !important;
  font-size: 0.8rem !important;
  background: var(--bg-input) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-main) !important;
  transition: var(--transition-fast);
}

.dash-search-input:focus {
  border-color: var(--primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px var(--primary-glow) !important;
}

/* Light Mode Overrides */
[data-theme="light"] .dash-catalog-toolbar {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .dash-select-box,
[data-theme="light"] .dash-toggle-group,
[data-theme="light"] .dash-search-input {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

[data-theme="light"] .dash-select {
  color: #0f172a !important;
}

[data-theme="light"] .dash-toggle-btn {
  color: #475569;
}

[data-theme="light"] .dash-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
}
</style>

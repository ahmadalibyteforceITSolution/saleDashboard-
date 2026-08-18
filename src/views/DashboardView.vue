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
          <button class="btn btn-primary" @click="router.push('/sales')">
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
      CORE KPI METRICS — Revenue, Profit, Stock, Alerts
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Gross Invoiced Revenue"
        :value="`PKR ${(dataStore.totalRevenue || 0).toLocaleString()}`"
        :subtitle="`From ${dataStore.salesInvoices.length} completed invoices`"
        :badge="`${dataStore.salesInvoices.length} INVOICES`"
        badge-color="success"
        accent-class="kpi-success"
      />

      <KpiCard
        label="Net Operating Profit"
        :value="`PKR ${(dataStore.grossProfit || 0).toLocaleString()}`"
        subtitle="Net profit retained after COGS"
        :badge="`${dataStore.profitMarginPercent}% MARGIN`"
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
      PRODUCT TABLE — Filtered by selected city depot
    ════════════════════════════════════════════ -->
    <GlassPanel extra-class="p-4">
      <!-- Table header + filter buttons -->
      <div class="flex justify-between items-center flex-wrap gap-3 mb-4">
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

      <!-- Product table using DataTable component -->
      <DataTable
        :columns="['Product / SKU', 'Category', 'Allocation Place', 'Storage Bin', 'Cost Price', 'Selling Price', 'Stock Qty', 'Serials Available']"
        :empty="filteredCityProducts.length === 0"
        empty-message="No products found for this city filter."
      >
        <tr v-for="p in filteredCityProducts" :key="p.id">
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
          <td><span class="font-mono font-bold">{{ activeCityFilter === 'ALL' ? p.stockQty : getAvailableSerials(p.id, activeCityFilter) }} units</span></td>
          <td class="font-mono text-xs text-secondary">{{ getAvailableSerials(p.id, activeCityFilter) }} Units Available</td>
        </tr>
      </DataTable>
    </GlassPanel>

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

// Lucide icons
import { LayoutDashboard, ShoppingCart, Building2, MapPin, AlertTriangle, Package, ChevronRight } from 'lucide-vue-next'

// ── Stores & router ───────────────────────────────────────────
const authStore  = useAuthStore()
const dataStore  = useDataStore()
const uiStore    = useUiStore()
const router     = useRouter()

// ── State ─────────────────────────────────────────────────────
const activeCityFilter = ref('ALL')

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

// ── Filtered product list ─────────────────────────────────────
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
</style>

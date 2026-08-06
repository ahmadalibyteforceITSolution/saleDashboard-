<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <TrendingUp :size="24" class="text-primary" />
          <h1 class="page-title">Revenue, COGS & Profit Analytics</h1>
        </div>
        <p class="page-subtitle">Deep financial analysis of sales margins, category profitability, date range filtering, and CSV export reporting</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="exportCSVReport">
          <Download :size="16" />
          <span>Export Sales CSV ({{ filteredInvoices.length }})</span>
        </button>
      </div>
    </div>

    <!-- Date Range Filter Bar for Sales Reporting -->
    <div class="glass-panel p-3 mb-4 flex-between flex-wrap gap-3">
      <div class="flex-align gap-2">
        <Calendar :size="18" class="text-primary" />
        <span class="font-bold text-xs text-main">SALES DATE RANGE FILTER:</span>
      </div>

      <div class="date-filter-inputs flex-align gap-2">
        <div class="flex-align gap-1">
          <label class="form-label text-xs">From:</label>
          <input v-model="startDate" type="date" class="form-input date-input" />
        </div>

        <div class="flex-align gap-1">
          <label class="form-label text-xs">To:</label>
          <input v-model="endDate" type="date" class="form-input date-input" />
        </div>

        <button
          v-if="startDate || endDate"
          class="btn btn-sm btn-ghost text-xs text-danger"
          @click="clearDateFilter"
        >
          Reset Dates
        </button>
      </div>

      <div class="preset-pills flex-align gap-2">
        <button
          :class="['btn', 'btn-sm', datePreset === 'ALL' ? 'btn-primary' : 'btn-ghost']"
          @click="setPreset('ALL')"
        >
          All Time
        </button>
        <button
          :class="['btn', 'btn-sm', datePreset === 'MONTH' ? 'btn-primary' : 'btn-ghost']"
          @click="setPreset('MONTH')"
        >
          This Month
        </button>
        <button
          :class="['btn', 'btn-sm', datePreset === 'TODAY' ? 'btn-primary' : 'btn-ghost']"
          @click="setPreset('TODAY')"
        >
          Today
        </button>
      </div>
    </div>

    <!-- Analytics Metrics Overview (Filtered by Date Range) -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Gross Revenue</span>
          <span class="badge badge-success">{{ filteredInvoices.length }} Sales</span>
        </div>
        <div class="kpi-value font-mono">${{ filteredRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle text-xs">
          <span>Invoiced from {{ startDate || 'Start' }} to {{ endDate || 'Current Date' }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-danger">
        <div class="flex-between">
          <span class="kpi-title">Cost of Goods Sold (COGS)</span>
          <span class="badge badge-danger">DIRECT UNIT COST</span>
        </div>
        <div class="kpi-value font-mono">${{ filteredCOGS.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle text-xs">
          <span>Unit cost of sold items in range</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Net Profit</span>
          <span class="badge badge-purple font-mono">{{ filteredMargin }}% MARGIN</span>
        </div>
        <div class="kpi-value font-mono">${{ filteredNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle text-xs">
          <span>Net retained profit after unit COGS</span>
        </div>
      </div>
    </div>

    <!-- Category Profitability Table -->
    <div class="glass-panel p-4 mb-4">
      <h3 class="panel-title mb-3 flex-align gap-2">
        <PieChart :size="18" class="text-secondary" />
        <span>Product Category Profitability Breakdown</span>
      </h3>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Category</th>
              <th>Catalog SKUs</th>
              <th>Total Stock Units</th>
              <th>Cost Valuation</th>
              <th>Retail Potential</th>
              <th>Profit Potential</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categoryAnalysis" :key="cat.name">
              <td class="font-bold text-main">{{ cat.name }}</td>
              <td class="font-mono text-xs">{{ cat.skus }} SKUs</td>
              <td class="font-mono text-xs">{{ cat.units }} units</td>
              <td class="font-mono text-muted">${{ cat.costValuation.toLocaleString() }}</td>
              <td class="font-mono text-main">${{ cat.retailValuation.toLocaleString() }}</td>
              <td class="font-mono text-success font-bold">+${{ (cat.retailValuation - cat.costValuation).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import { TrendingUp, Download, PieChart, Calendar } from 'lucide-vue-next'

const dataStore = useDataStore()
const uiStore = useUiStore()

const startDate = ref('')
const endDate = ref('')
const datePreset = ref('ALL')

function setPreset(preset) {
  datePreset.value = preset
  const today = new Date().toISOString().substring(0, 10)
  
  if (preset === 'TODAY') {
    startDate.value = today
    endDate.value = today
  } else if (preset === 'MONTH') {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
    startDate.value = firstDay
    endDate.value = today
  } else {
    startDate.value = ''
    endDate.value = ''
  }
}

function clearDateFilter() {
  startDate.value = ''
  endDate.value = ''
  datePreset.value = 'ALL'
}

const filteredInvoices = computed(() => {
  return dataStore.salesInvoices.filter(inv => {
    if (!inv.saleDate) return true
    const invDate = inv.saleDate.substring(0, 10)
    const matchesStart = !startDate.value || invDate >= startDate.value
    const matchesEnd = !endDate.value || invDate <= endDate.value
    return matchesStart && matchesEnd
  })
})

const filteredRevenue = computed(() => {
  return filteredInvoices.value.reduce((acc, inv) => acc + (inv.subtotal - (inv.discount || 0)), 0)
})

const filteredCOGS = computed(() => {
  return filteredInvoices.value.reduce((acc, inv) => acc + (inv.totalCost || 0), 0)
})

const filteredNetProfit = computed(() => {
  return filteredRevenue.value - filteredCOGS.value
})

const filteredMargin = computed(() => {
  if (!filteredRevenue.value) return '0.00'
  return ((filteredNetProfit.value / filteredRevenue.value) * 100).toFixed(2)
})

const categoryAnalysis = computed(() => {
  const map = {}
  dataStore.products.forEach(p => {
    if (!map[p.category]) {
      map[p.category] = { name: p.category, skus: 0, units: 0, costValuation: 0, retailValuation: 0 }
    }
    map[p.category].skus += 1
    map[p.category].units += p.stockQty
    map[p.category].costValuation += (p.stockQty * p.costPrice)
    map[p.category].retailValuation += (p.stockQty * p.sellingPrice)
  })
  return Object.values(map)
})

function exportCSVReport() {
  if (!filteredInvoices.value.length) {
    uiStore.showToast('No sales invoices found in the selected date range to export.', 'warning')
    return
  }

  const headers = ['InvoiceNo', 'Customer', 'SaleDate', 'PaymentMethod', 'Subtotal', 'Tax', 'Discount', 'GrandTotal', 'NetProfit', 'Seller']
  const rows = filteredInvoices.value.map(inv => [
    inv.invoiceNo,
    `"${inv.customer}"`,
    inv.saleDate,
    inv.paymentMethod,
    inv.subtotal,
    inv.tax,
    inv.discount,
    inv.grandTotal,
    inv.netProfit,
    inv.sellerName
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  const fileDateStr = (startDate.value && endDate.value) ? `${startDate.value}_to_${endDate.value}` : 'all_time'
  link.setAttribute('download', `sales_revenue_report_${fileDateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  uiStore.showToast(`Exported ${filteredInvoices.value.length} sales records to CSV!`, 'success')
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-3 { padding: 0.85rem 1.25rem; }
.p-4 { padding: 1.25rem; }

.page-title { font-size: 1.8rem; font-weight: 800; }
.page-subtitle { font-size: 0.85rem; color: var(--text-muted); }
.date-input { width: 140px; padding: 0.35rem 0.5rem; font-size: 0.8rem; }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
</style>

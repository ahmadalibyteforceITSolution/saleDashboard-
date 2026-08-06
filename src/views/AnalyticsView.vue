<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <TrendingUp :size="24" class="text-primary" />
          <h1 class="page-title">Revenue, COGS & Profit Analytics</h1>
        </div>
        <p class="page-subtitle">Deep financial analysis of sales margins, category profitability, and audit reporting</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="exportCSVReport">
          <Download :size="16" />
          <span>Export Sales CSV</span>
        </button>
      </div>
    </div>

    <!-- Analytics Metrics Overview -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Gross Revenue</span>
          <span class="badge badge-success">+14.2%</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
      </div>

      <div class="glass-card kpi-card kpi-danger">
        <div class="flex-between">
          <span class="kpi-title">Cost of Goods Sold (COGS)</span>
          <span class="badge badge-danger">DIRECT UNIT COST</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
      </div>

      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Net Profit</span>
          <span class="badge badge-purple font-mono">{{ dataStore.profitMarginPercent }}% MARGIN</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
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
import { computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { TrendingUp, Download, PieChart } from 'lucide-vue-next'

const dataStore = useDataStore()

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
  const headers = ['InvoiceNo', 'Customer', 'SaleDate', 'PaymentMethod', 'Subtotal', 'Tax', 'Discount', 'GrandTotal', 'NetProfit', 'Seller']
  const rows = dataStore.salesInvoices.map(inv => [
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
  link.setAttribute('download', `sales_revenue_report_${new Date().toISOString().substring(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.gap-2 { gap: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-4 { padding: 1.25rem; }

.page-title { font-size: 1.8rem; font-weight: 800; }
.page-subtitle { font-size: 0.85rem; color: var(--text-muted); }
.text-xs { font-size: 0.75rem; }
.font-bold { font-weight: 700; }
</style>

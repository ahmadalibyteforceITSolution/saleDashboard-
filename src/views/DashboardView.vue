<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <h1 class="page-title">Executive Dashboard</h1>
        <p class="page-subtitle">Real-time inventory valuation, serial tracking, and financial performance</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="router.push('/purchasing')">
          <Truck :size="16" />
          <span>New PO</span>
        </button>
        <button class="btn btn-secondary" @click="router.push('/inventory')">
          <PackagePlus :size="16" />
          <span>Add Product</span>
        </button>
        <button class="btn btn-primary" @click="router.push('/sales')">
          <ShoppingCart :size="16" />
          <span>POS Checkout</span>
        </button>
      </div>
    </div>

    <!-- KPI Metric Cards Grid -->
    <div class="kpi-grid">
      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Gross Sales Revenue</span>
          <span class="badge badge-success">+14.2%</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <TrendingUp :size="14" class="text-success" />
          <span>From {{ dataStore.salesInvoices.length }} completed sales invoices</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Net Operating Profit</span>
          <span class="badge badge-purple font-mono">{{ dataStore.profitMarginPercent }}% MARGIN</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <DollarSign :size="14" class="text-purple" />
          <span>Gross Margin after COGS ($${{ dataStore.totalCOGS.toLocaleString() }})</span>
        </div>
      </div>

      <div class="glass-card kpi-card">
        <div class="flex-between">
          <span class="kpi-title">Inventory Valuation (Cost)</span>
          <span class="badge badge-info">{{ dataStore.products.length }} SKUs</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.inventoryValuationCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <Package :size="14" class="text-info" />
          <span>Retail Value: ${{ dataStore.inventoryValuationRetail.toLocaleString() }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-warning">
        <div class="flex-between">
          <span class="kpi-title">Serialized Stock Items</span>
          <span :class="['badge', dataStore.lowStockProducts.length ? 'badge-warning' : 'badge-success']">
            {{ dataStore.lowStockProducts.length }} Low Stock
          </span>
        </div>
        <div class="kpi-value font-mono">{{ dataStore.availableSerialsCount }} Units</div>
        <div class="kpi-subtitle">
          <QrCode :size="14" class="text-warning" />
          <span>Active registered unique serial numbers in bins</span>
        </div>
      </div>
    </div>

    <!-- Main Content Layout Grid -->
    <div class="dashboard-main-grid">
      <!-- Left Column: Financial Breakdown & Low Stock -->
      <div class="grid-col-left">
        <!-- Financial Overview Panel -->
        <div class="glass-panel p-4 mb-4">
          <div class="flex-between mb-3">
            <h3 class="panel-title flex-align gap-2">
              <BarChart3 :size="18" class="text-primary" />
              <span>Financial Revenue & Cost Breakdown</span>
            </h3>
            <span class="text-subtle font-mono text-xs">YTD AUDITED</span>
          </div>

          <div class="financial-bars">
            <div class="bar-group">
              <div class="flex-between text-sm mb-1">
                <span class="text-muted">Total Sales Invoiced</span>
                <span class="font-mono text-main font-bold">${{ dataStore.totalRevenue.toLocaleString() }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-primary" style="width: 100%;"></div>
              </div>
            </div>

            <div class="bar-group">
              <div class="flex-between text-sm mb-1">
                <span class="text-muted">Cost of Goods Sold (COGS)</span>
                <span class="font-mono text-danger font-bold">${{ dataStore.totalCOGS.toLocaleString() }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-danger" :style="{ width: (dataStore.totalRevenue ? (dataStore.totalCOGS / dataStore.totalRevenue * 100) : 0) + '%' }"></div>
              </div>
            </div>

            <div class="bar-group">
              <div class="flex-between text-sm mb-1">
                <span class="text-muted">Net Retained Profit</span>
                <span class="font-mono text-success font-bold">${{ dataStore.grossProfit.toLocaleString() }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill bg-success" :style="{ width: (dataStore.totalRevenue ? (dataStore.grossProfit / dataStore.totalRevenue * 100) : 0) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Storage & Low Stock Table -->
        <div class="glass-panel p-4">
          <div class="flex-between mb-3">
            <h3 class="panel-title flex-align gap-2">
              <AlertCircle :size="18" class="text-warning" />
              <span>Storage Bin & Low Stock Reorder Alerts</span>
            </h3>
            <router-link to="/inventory" class="text-xs text-primary font-bold">View Catalog &rarr;</router-link>
          </div>

          <div class="table-container">
            <table class="table-lined">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Bin Location</th>
                  <th>Cost / Retail</th>
                  <th>Stock Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in dataStore.products" :key="product.id">
                  <td>
                    <div class="flex-align gap-2">
                      <img :src="product.image" alt="Thumbnail" class="table-thumb" />
                      <div>
                        <div class="font-bold text-main">{{ product.name }}</div>
                        <div class="font-mono text-subtle text-xs">{{ product.sku }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="font-mono badge badge-neutral">{{ product.storageBin }}</span>
                  </td>
                  <td class="font-mono">
                    <div>${{ product.costPrice }}</div>
                    <div class="text-subtle text-xs">Ret: ${{ product.sellingPrice }}</div>
                  </td>
                  <td class="font-mono font-bold">{{ product.stockQty }} units</td>
                  <td>
                    <span v-if="product.stockQty <= product.minStock" class="badge badge-warning">
                      REORDER
                    </span>
                    <span v-else class="badge badge-success">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Recent Serial Movements & Audit Highlights -->
      <div class="grid-col-right">
        <!-- Serial Lifecycle Activity Feed -->
        <div class="glass-panel p-4 mb-4">
          <div class="flex-between mb-3">
            <h3 class="panel-title flex-align gap-2">
              <QrCode :size="18" class="text-secondary" />
              <span>Recent Serial Movements</span>
            </h3>
            <router-link to="/serials" class="text-xs text-secondary font-bold">Search All &rarr;</router-link>
          </div>

          <div class="serial-timeline">
            <div
              v-for="serial in dataStore.serials.slice(0, 5)"
              :key="serial.serialCode"
              class="timeline-item"
            >
              <div class="timeline-indicator">
                <CheckCircle2 v-if="serial.status === 'Sold'" :size="16" class="text-success" />
                <AlertTriangle v-else-if="serial.status === 'Defective'" :size="16" class="text-danger" />
                <Box v-else :size="16" class="text-info" />
              </div>
              <div class="timeline-content">
                <div class="flex-between">
                  <span class="font-mono font-bold text-main">{{ serial.serialCode }}</span>
                  <span :class="['badge', serial.status === 'Sold' ? 'badge-neutral' : serial.status === 'Defective' ? 'badge-danger' : 'badge-success']">
                    {{ serial.status }}
                  </span>
                </div>
                <div class="text-xs text-muted mt-1">
                  SKU: <span class="font-mono text-main">{{ serial.sku }}</span> • Bin: <span class="font-mono text-primary">{{ serial.binLocation }}</span>
                </div>
                <div v-if="serial.customer" class="text-xs text-subtle mt-1">
                  Sold to <span class="text-main font-semibold">{{ serial.customer }}</span> (Inv: {{ serial.invoiceNo }})
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SuperAdmin Audit Quick Feed -->
        <div v-if="authStore.isSuperAdmin" class="glass-panel p-4 border-purple">
          <div class="flex-between mb-3">
            <h3 class="panel-title flex-align gap-2 text-purple">
              <Crown :size="18" />
              <span>SuperAdmin Audit Feed</span>
            </h3>
            <router-link to="/superadmin" class="text-xs text-purple font-bold">Audit Center &rarr;</router-link>
          </div>

          <div class="audit-quick-list">
            <div
              v-for="log in dataStore.auditLogs.slice(0, 3)"
              :key="log.id"
              class="audit-quick-item"
            >
              <div class="font-bold text-xs text-main">{{ log.action }}</div>
              <div class="text-xs text-muted">{{ log.details }}</div>
              <div class="flex-between mt-1 text-subtle text-xs font-mono">
                <span>By: {{ log.user }}</span>
                <span>{{ log.timestamp.split(' ')[1] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import {
  Truck,
  PackagePlus,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  QrCode,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Box,
  Crown
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const router = useRouter()
</script>

<style scoped>
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-align {
  display: flex;
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-4 { padding: 1.25rem; }
.mt-1 { margin-top: 0.25rem; }

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.dashboard-main-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 1024px) {
  .dashboard-main-grid {
    grid-template-columns: 1fr;
  }
}

.panel-title {
  font-size: 1rem;
  font-weight: 700;
}

.financial-bars {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.progress-track {
  height: 10px;
  background: var(--bg-dark-900);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.5s ease;
}

.bg-primary { background: var(--primary); }
.bg-danger { background: var(--danger); }
.bg-success { background: var(--success); }

.table-thumb {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.serial-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  gap: 0.85rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-line);
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-content {
  flex: 1;
}

.border-purple {
  border-color: rgba(139, 92, 246, 0.3);
}

.audit-quick-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.audit-quick-item {
  padding: 0.65rem;
  background: var(--bg-dark-900);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--purple);
}

.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
</style>

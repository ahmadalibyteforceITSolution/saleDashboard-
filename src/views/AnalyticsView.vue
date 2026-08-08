<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-purple font-mono">MEDIMAGE ERP REPORTING</span>
          <span class="badge badge-success font-mono">BRANCH & MACHINE ANALYTICS</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Executive ERP Reports</h1>
        <p class="text-slate-300 text-sm mt-1">
          Branch-wise sales & stock reports, machine payment tracking reports (Paid vs Unpaid), daily/monthly sales, and CSV export.
        </p>
      </div>

      <button @click="exportCSVReport" class="btn btn-success btn-lg shadow-xl">
        <Download :size="18" />
        <span>Export Sales & Machine Report (CSV)</span>
      </button>
    </div>

    <!-- Branch Wise Sales Summary Cards -->
    <div class="kpi-grid">
      <div v-for="bName in ['Peshawar', 'Multan', 'Lahore']" :key="bName" class="kpi-card glass-panel p-5 space-y-3">
        <div class="flex justify-between items-center">
          <span class="kpi-title uppercase flex items-center gap-1.5">
            <Building2 :size="14" class="text-indigo-400" />
            <span>{{ bName }} Branch</span>
          </span>
          <span class="badge badge-info font-mono">
            {{ getBranchSalesCount(bName) }} Invoices
          </span>
        </div>

        <div class="kpi-value text-emerald-400">
          PKR {{ getBranchSalesTotal(bName).toLocaleString() }}
        </div>

        <div class="flex justify-between text-xs text-subtle border-t border-slate-800 pt-2">
          <span>Available Stock:</span>
          <span class="font-bold text-white">{{ getBranchStockCount(bName) }} machines</span>
        </div>
      </div>
    </div>

    <!-- Machine Payment Status Report Card (Paid vs Unpaid Machines) -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Tag :size="20" class="text-purple-400" />
          <span>Machine-Wise Payment Status Report</span>
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass-panel p-4 border border-emerald-500/30 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <CheckCircle2 :size="14" class="text-emerald-400" />
            <span>Fully Paid Machines</span>
          </div>
          <div class="text-2xl font-extrabold text-emerald-400 font-mono">{{ paidMachinesCount }}</div>
          <div class="text-xs text-subtle">Payment receipt verified</div>
        </div>

        <div class="glass-panel p-4 border border-red-500/30 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <Clock :size="14" class="text-red-400" />
            <span>Unpaid / Pending Machines</span>
          </div>
          <div class="text-2xl font-extrabold text-red-400 font-mono">{{ pendingMachinesCount }}</div>
          <div class="text-xs text-subtle">Payment expected</div>
        </div>

        <div class="glass-panel p-4 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <PieChart :size="14" class="text-blue-400" />
            <span>Collection Ratio</span>
          </div>
          <div class="text-2xl font-extrabold text-white font-mono">{{ collectionPercentage }}%</div>
          <div class="text-xs text-subtle">Paid vs total sold machines</div>
        </div>
      </div>
    </div>

    <!-- Historical Stock Position Report Card -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Calendar :size="20" class="text-emerald-400" />
            <span>Historical Stock Position Report (As of Target Date)</span>
          </h3>
          <p class="text-xs text-subtle mt-0.5">
            Query total available machines and SKU breakdown on any selected historical date.
          </p>
        </div>

        <div class="flex items-center gap-3 w-full sm:w-auto">
          <input
            v-model="historicalDate"
            type="date"
            @change="updateHistoricalReport"
            class="form-input text-xs font-mono py-2 text-white bg-slate-900"
          />
          <select
            v-model="historicalBranch"
            @change="updateHistoricalReport"
            class="form-select text-xs font-bold py-2 text-white bg-slate-900"
          >
            <option value="ALL">All Branches</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Multan">Multan Branch</option>
            <option value="Lahore">Lahore Branch</option>
          </select>
        </div>
      </div>

      <div v-if="historicalStock" class="space-y-4">
        <div class="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Available Stock Count as of {{ historicalDate }}</span>
            <div class="text-2xl font-extrabold text-white font-mono mt-1">
              {{ historicalStock.totalUnits }} Units Available
              <span class="text-xs font-normal text-slate-400">({{ historicalBranch }} Location)</span>
            </div>
          </div>
          <span class="badge badge-success font-mono">DATE SNAPSHOT VERIFIED</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Serial Code</th>
                <th>Machine Code</th>
                <th>Product SKU</th>
                <th>Category</th>
                <th>Branch Location</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in historicalStock.serialsSnapshot" :key="s.serialCode">
                <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
                <td class="font-mono font-bold text-purple-400">{{ s.machineCode }}</td>
                <td class="font-bold text-white text-xs">{{ s.sku }}</td>
                <td><span class="badge badge-purple">{{ s.hsnCode || 'Medical Device' }}</span></td>
                <td class="font-bold text-emerald-400">{{ s.allocationCity }}</td>
                <td class="font-mono text-xs text-subtle">{{ s.registeredDate || '2026-07-10' }}</td>
              </tr>
              <tr v-if="historicalStock.serialsSnapshot.length === 0">
                <td colspan="6" class="p-6 text-center text-subtle italic">No available stock recorded on {{ historicalDate }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Master Machine Inventory & Payment Audit Log -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 :size="20" class="text-blue-400" />
          <span>All Registered Machines Journey Audit Table</span>
        </h3>
        <span class="badge badge-neutral font-mono">{{ dataStore.serials.length }} Units</span>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Machine Code</th>
              <th>Product SKU</th>
              <th>Branch Location</th>
              <th>Customer</th>
              <th>Sale Invoice #</th>
              <th>Unit Sale Price</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in dataStore.serials" :key="s.serialCode">
              <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
              <td class="font-mono font-bold text-purple-400">{{ s.machineCode || 'N/A' }}</td>
              <td class="text-xs font-bold text-white">{{ s.sku }}</td>
              <td>
                <span class="badge badge-purple">
                  <Building2 :size="10" />
                  {{ s.allocationCity || 'Peshawar' }}
                </span>
              </td>
              <td class="text-xs">
                <span v-if="s.customer" class="font-semibold text-main">{{ s.customer }}</span>
                <span v-else class="text-subtle">Available in Stock</span>
              </td>
              <td class="font-mono text-xs text-secondary">{{ s.invoiceNo || 'N/A' }}</td>
              <td class="font-bold text-emerald-400">PKR {{ (s.salePrice || 0).toLocaleString() }}</td>
              <td>
                <span :class="['badge', s.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger']">
                  {{ s.paymentStatus || 'Pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import {
  Download,
  BarChart2,
  Building2,
  Tag,
  CheckCircle2,
  Clock,
  PieChart,
  Calendar
} from 'lucide-vue-next'

const dataStore = useDataStore()

const historicalDate = ref(new Date().toISOString().substring(0, 10))
const historicalBranch = ref('ALL')
const historicalStock = ref(null)

onMounted(() => {
  updateHistoricalReport()
})

function updateHistoricalReport() {
  if (!historicalDate.value) return
  historicalStock.value = dataStore.getHistoricalStock(historicalDate.value, historicalBranch.value)
}

function getBranchSalesCount(branch) {
  return dataStore.salesInvoices.filter(i => (i.branch || 'Peshawar') === branch).length
}

function getBranchSalesTotal(branch) {
  return dataStore.salesInvoices
    .filter(i => (i.branch || 'Peshawar') === branch)
    .reduce((acc, i) => acc + (i.grandTotal || 0), 0)
}

function getBranchStockCount(branch) {
  return dataStore.serials.filter(s => (s.allocationCity || 'Peshawar') === branch && s.status === 'Available').length
}

const paidMachinesCount = computed(() => {
  return dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus === 'Paid').length
})

const pendingMachinesCount = computed(() => {
  return dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus !== 'Paid').length
})

const collectionPercentage = computed(() => {
  const soldTotal = dataStore.serials.filter(s => s.status === 'Sold').length
  if (!soldTotal) return 100
  return ((paidMachinesCount.value / soldTotal) * 100).toFixed(1)
})

function exportCSVReport() {
  const headers = ['Serial Code', 'Machine Code', 'SKU', 'Status', 'Payment Status', 'Branch', 'Customer', 'Invoice No', 'Sale Price']
  const rows = dataStore.serials.map(s => [
    s.serialCode,
    s.machineCode || '',
    s.sku,
    s.status,
    s.paymentStatus || 'Pending',
    s.allocationCity,
    s.customer || '',
    s.invoiceNo || '',
    s.salePrice || 0
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `medimage_erpsales_report_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

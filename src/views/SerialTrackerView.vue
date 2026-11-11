<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <QrCode :size="24" class="text-secondary" />
          <h1 class="page-title">Serial Number Registry & Lineage</h1>
        </div>
        <p class="page-subtitle">Granular unit tracking from supplier inbound PO to city allocations (Lahore, Multan, Peshawar) & customer invoices</p>
      </div>

      <div class="action-buttons flex-align gap-2">
        <div class="stat-pill font-mono">
          <span class="text-muted">Total Units Registered:</span>
          <span class="text-primary font-bold ml-1">{{ dataStore.serials.length }}</span>
        </div>
        <button class="btn btn-secondary flex-align gap-1.5 shadow-sm" @click="showPrintModal = true">
          <Printer :size="15" />
          <span>Print Registry</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="glass-panel p-3 mb-4 space-y-3">
      <!-- Row 1: Search, City & Stock Status -->
      <div class="flex-between flex-wrap gap-3">
        <div class="search-box">
          <Search :size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search Serial Number (e.g. US10-8801), Customer, City, Invoice..."
            class="form-input search-input"
          />
        </div>

        <div class="filter-pills flex-align gap-2 flex-wrap">
          <select v-if="authStore.isSuperAdmin" v-model="selectedCity" class="form-select city-select">
            <option value="ALL">All Allocation Cities</option>
            <option value="Peshawar">Peshawar</option>
            <option value="Lahore">Lahore</option>
            <option value="Multan">Multan</option>
            <option value="Karachi">Karachi</option>
            <option value="Islamabad">Islamabad</option>
          </select>
          <span v-else class="text-xs font-bold text-slate-200 px-2 py-1 bg-slate-900/80 border border-slate-700 rounded-lg">
            📍 {{ authStore.userBranch || 'Lahore' }} Depot
          </span>

          <button
            v-for="st in ['ALL', 'Available', 'Sold', 'Defective']"
            :key="st"
            :class="['btn', 'btn-sm', selectedStatus === st ? 'btn-primary' : 'btn-ghost']"
            @click="selectedStatus = st"
          >
            {{ st }}
          </button>
        </div>
      </div>

      <!-- Row 2: Paid/Unpaid Filter & Date Range Filter -->
      <div class="flex-between flex-wrap gap-3 pt-2.5 border-t border-slate-700/40 text-xs">
        <!-- Payment Status Filter (Paid vs Unpaid/Pending) -->
        <div class="flex-align gap-2">
          <span class="font-semibold text-slate-400 flex items-center gap-1.5">
            <CreditCard :size="14" class="text-teal-400" />
            <span>Payment:</span>
          </span>
          <div class="flex-align gap-1 bg-slate-900/60 p-0.5 rounded-lg border border-slate-700/60">
            <button
              :class="['btn btn-xs', selectedPaymentStatus === 'ALL' ? 'btn-primary' : 'btn-ghost text-slate-300']"
              @click="selectedPaymentStatus = 'ALL'"
            >
              All
            </button>
            <button
              :class="['btn btn-xs', selectedPaymentStatus === 'Paid' ? 'btn-success font-bold' : 'btn-ghost text-slate-300']"
              @click="selectedPaymentStatus = 'Paid'"
            >
              Paid Only
            </button>
            <button
              :class="['btn btn-xs', selectedPaymentStatus === 'Pending' ? 'btn-danger font-bold' : 'btn-ghost text-slate-300']"
              @click="selectedPaymentStatus = 'Pending'"
            >
              Unpaid / Pending
            </button>
          </div>
        </div>

        <!-- Date Range Filter -->
        <div class="flex-align gap-2 flex-wrap">
          <span class="font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar :size="14" class="text-teal-400" />
            <span>Date Filter:</span>
          </span>
          <select v-model="datePreset" @change="applyDatePreset" class="form-select text-xs py-1 px-2 h-8 bg-slate-900 border-slate-700 rounded-lg">
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="CUSTOM">Custom Range</option>
          </select>

          <div v-if="datePreset === 'CUSTOM' || dateFrom || dateTo" class="flex-align gap-1.5">
            <input type="date" v-model="dateFrom" class="form-input text-xs py-1 px-2 h-8 bg-slate-900 border-slate-700 rounded-lg" placeholder="From" />
            <span class="text-slate-400">to</span>
            <input type="date" v-model="dateTo" class="form-input text-xs py-1 px-2 h-8 bg-slate-900 border-slate-700 rounded-lg" placeholder="To" />
            <button v-if="dateFrom || dateTo" @click="clearDates" class="btn btn-xs btn-ghost text-slate-400 hover:text-white" title="Reset Dates">✕</button>
          </div>

          <span v-if="filteredSerials.length !== dataStore.serials.length" class="text-[11px] text-teal-400 font-mono font-semibold ml-1">
            ({{ filteredSerials.length }} match)
          </span>
        </div>
      </div>
    </div>

    <!-- Serial Numbers Master Table -->
    <div class="glass-panel p-4">
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Machine Code</th>
              <th>Product SKU</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Branch Allocation</th>
              <th>Inbound Date</th>
              <th>Sold / Customer</th>
              <th>Invoice Ref</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ser in paginatedSerials" :key="ser.serialCode">
              <td class="font-mono font-bold text-primary text-base">{{ (ser.serialCode || '').replace(/^SN-/i, '') }}</td>
              <td class="font-mono font-bold text-purple-400">{{ ser.machineCode || 'N/A' }}</td>
              <td class="font-mono text-main">{{ ser.sku }}</td>
              <td>
                <span :class="['badge', ser.status === 'Available' ? 'badge-success' : ser.status === 'Defective' ? 'badge-danger' : 'badge-neutral']">
                  {{ ser.status }}
                </span>
              </td>
              <td>
                <span :class="['badge', ser.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger']">
                  {{ ser.paymentStatus || 'Pending' }}
                </span>
              </td>
              <td>
                <span :class="['badge', ser.allocationCity === 'Lahore' ? 'badge-info' : ser.allocationCity === 'Multan' ? 'badge-success' : 'badge-purple']">
                  <Building2 :size="10" />
                  {{ ser.allocationCity || 'Peshawar' }}
                </span>
              </td>
              <td class="font-mono text-xs text-subtle">{{ ser.registeredDate }}</td>
              <td class="text-xs">
                <span v-if="ser.customer" class="font-semibold text-main">{{ ser.customer }}</span>
                <span v-else class="text-subtle">Not Sold</span>
              </td>
              <td class="font-mono text-xs text-secondary">
                {{ ser.invoiceNo || 'N/A' }}
              </td>
              <td>
                <div class="flex-align gap-2">
                  <button class="btn btn-sm btn-primary" @click="router.push({ path: '/universal-search', query: { q: ser.serialCode } })">
                    360° Journey
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="selectedSerialDetail = ser">
                    <History :size="13" />
                    <span>Lineage</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredSerials.length === 0">
              <td colspan="10" class="p-8 text-center text-slate-500 italic">
                No serial numbers found matching current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Serial Registry Pagination Bar -->
      <PaginationBar
        v-model="currentPage"
        v-model:pageSize="pageSize"
        :total-items="filteredSerials.length"
      />
    </div>

    <!-- Serial Lineage Detail Modal -->
    <div v-if="selectedSerialDetail" class="modal-backdrop" @click.self="selectedSerialDetail = null">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div>
            <h3 class="font-mono font-bold text-indigo-400 text-lg flex items-center gap-2">
              <span>{{ (selectedSerialDetail.serialCode || '').replace(/^SN-/i, '') }}</span>
              <span v-if="selectedSerialDetail.machineCode" class="text-xs bg-purple-950/60 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded font-mono">({{ selectedSerialDetail.machineCode }})</span>
            </h3>
            <span class="text-xs text-subtle">SKU: {{ selectedSerialDetail.sku }} • Branch: {{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span>
          </div>
          <button class="btn-icon text-slate-400 hover:text-white" @click="selectedSerialDetail = null">✕</button>
        </div>

        <div class="modal-body space-y-4">
          <div class="serial-meta-grid">
            <div class="serial-meta-item">
              <span class="serial-meta-label">Machine Code</span>
              <span class="serial-meta-val font-mono font-bold text-purple-400">
                {{ selectedSerialDetail.machineCode || 'N/A' }}
              </span>
            </div>
            <div class="serial-meta-item">
              <span class="serial-meta-label">Bin Location</span>
              <span class="serial-meta-val font-mono font-bold text-indigo-400">
                {{ selectedSerialDetail.binLocation || 'HQ-PEW-A01' }}
              </span>
            </div>
            <div class="serial-meta-item">
              <span class="serial-meta-label">Payment Status</span>
              <div class="serial-meta-val">
                <span :class="['badge', selectedSerialDetail.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning']">
                  {{ selectedSerialDetail.paymentStatus || 'Pending' }}
                </span>
              </div>
            </div>
            <div class="serial-meta-item">
              <span class="serial-meta-label">Sale Price</span>
              <span class="serial-meta-val font-mono font-bold text-emerald-400">
                {{ selectedSerialDetail.salePrice ? formatBalance(selectedSerialDetail.salePrice) : 'In Stock' }}
              </span>
            </div>
          </div>

          <div class="serial-history-timeline space-y-4">
            <!-- Step 1: Inbound -->
            <div class="history-step flex gap-3">
              <div class="step-icon bg-emerald-950 text-emerald-400 p-2 rounded-full border border-emerald-800"><PackageCheck :size="14" /></div>
              <div class="step-info text-xs space-y-0.5">
                <div class="step-title font-bold text-white">1. Inbound Stock Registration</div>
                <div class="step-date text-slate-400">Registered on {{ selectedSerialDetail.registeredDate || selectedSerialDetail.purchaseDate || '2026-07-10' }}</div>
                <div class="step-desc text-slate-300">
                  Received under PO <span class="font-mono text-indigo-400 font-bold">{{ selectedSerialDetail.purchaseInvoiceNo || 'PO-2026-901' }}</span>. Allocated to <span class="font-bold text-white">{{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span> depot.
                </div>
              </div>
            </div>

            <!-- Step 2: Current Status / Sale -->
            <div class="history-step flex gap-3">
              <div :class="['step-icon p-2 rounded-full border', selectedSerialDetail.status === 'Sold' ? 'bg-blue-950 text-blue-400 border-blue-800' : selectedSerialDetail.status === 'Defective' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-amber-400 border-slate-700']">
                <CheckCircle2 v-if="selectedSerialDetail.status === 'Sold'" :size="14" />
                <AlertTriangle v-else-if="selectedSerialDetail.status === 'Defective'" :size="14" />
                <Clock v-else :size="14" />
              </div>
              <div class="step-info text-xs space-y-0.5">
                <div class="step-title font-bold text-white">2. Current Status: <span class="text-indigo-400">{{ selectedSerialDetail.status }}</span></div>
                <div v-if="selectedSerialDetail.soldDate" class="step-date text-slate-400">Outbound Sold on {{ selectedSerialDetail.soldDate }}</div>
                <div v-if="selectedSerialDetail.customer" class="step-desc text-slate-300">
                  Issued to <span class="font-bold text-white">{{ selectedSerialDetail.customer }}</span> under invoice <span class="font-mono text-indigo-400 font-bold">{{ selectedSerialDetail.invoiceNo }}</span>.
                  <div v-if="selectedSerialDetail.paymentReceiptNo" class="text-emerald-400 mt-1">Receipt: {{ selectedSerialDetail.paymentReceiptNo }}</div>
                </div>
                <div v-else-if="selectedSerialDetail.status === 'Defective'" class="step-desc text-red-300">
                  Unit flagged as defective. Moved to RMA Hold bin for technical inspection.
                </div>
                <div v-else class="step-desc text-slate-400">
                  Unit in active available stock in <span class="text-white font-bold">{{ selectedSerialDetail.allocationCity || 'Peshawar' }}</span> depot.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer flex justify-between items-center">
          <div class="flex items-center gap-2">
            <button v-if="selectedSerialDetail.status === 'Available'" @click="updateSerialStatusHandler(selectedSerialDetail, 'Defective')" class="btn btn-xs btn-danger">
              <AlertTriangle :size="12" />
              <span>Flag Defective</span>
            </button>
            <button v-if="selectedSerialDetail.status === 'Defective'" @click="updateSerialStatusHandler(selectedSerialDetail, 'Available')" class="btn btn-xs btn-success">
              <CheckCircle2 :size="12" />
              <span>Restore Available</span>
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" @click="selectedSerialDetail = null">Close</button>
        </div>
      </div>
    </div>

    <!-- Printable Registry Modal -->
    <div v-if="showPrintModal" class="modal-backdrop" @click.self="showPrintModal = false">
      <div class="modal-content max-w-5xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white text-slate-800">
        <!-- Modal Top Action Bar (Hidden during actual print) -->
        <div class="no-print p-4 bg-slate-900 text-white flex-between border-b border-slate-800 shrink-0">
          <div class="flex-align gap-2">
            <Printer :size="18" class="text-teal-400" />
            <span class="font-bold text-sm">Serial Number Registry & Lineage Report</span>
            <span class="text-xs text-slate-400">({{ filteredSerials.length }} Units Matched)</span>
          </div>
          <div class="flex-align gap-2">
            <button class="btn btn-sm btn-primary flex-align gap-1.5" @click="triggerPrint">
              <Printer :size="14" />
              <span>Print Document</span>
            </button>
            <button class="btn btn-sm btn-secondary" @click="showPrintModal = false">
              ✕ Close
            </button>
          </div>
        </div>

        <!-- Printable Document Body -->
        <div class="printable-registry-area flex-1 overflow-y-auto p-8 bg-white text-slate-900 space-y-6">
          <!-- Report Header -->
          <div class="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-teal-700">Official Equipment Statement</div>
              <h1 class="text-2xl font-black tracking-tight text-slate-900 uppercase">Serial Number & Machine Registry</h1>
              <p class="text-xs text-slate-600 font-medium mt-0.5">Granular Unit Tracking, City Allocations & Payment Status</p>
            </div>
            <div class="text-right text-xs space-y-0.5">
              <div class="font-bold text-slate-900">Generated: {{ printTimestamp }}</div>
              <div class="text-slate-600">Printed By: <span class="font-semibold">{{ authStore.user?.name || 'Administrator' }}</span> ({{ authStore.userBranch || 'Headquarters' }})</div>
            </div>
          </div>

          <!-- Applied Filters Banner -->
          <div class="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span class="text-slate-500 block uppercase font-bold text-[10px]">Depot / City</span>
              <span class="font-semibold text-slate-800">{{ selectedCity === 'ALL' ? 'All Depots (Peshawar, Lahore, Multan, Karachi)' : selectedCity }}</span>
            </div>
            <div>
              <span class="text-slate-500 block uppercase font-bold text-[10px]">Stock Status</span>
              <span class="font-semibold text-slate-800">{{ selectedStatus }}</span>
            </div>
            <div>
              <span class="text-slate-500 block uppercase font-bold text-[10px]">Payment Status</span>
              <span class="font-semibold" :class="selectedPaymentStatus === 'Paid' ? 'text-emerald-700' : selectedPaymentStatus === 'Pending' ? 'text-rose-700' : 'text-slate-800'">
                {{ selectedPaymentStatus === 'ALL' ? 'All (Paid & Unpaid)' : selectedPaymentStatus === 'Paid' ? 'Paid Only' : 'Unpaid / Pending' }}
              </span>
            </div>
            <div>
              <span class="text-slate-500 block uppercase font-bold text-[10px]">Date Range</span>
              <span class="font-semibold text-slate-800">{{ dateFrom || dateTo ? `${dateFrom || 'Start'} to ${dateTo || 'Current'}` : 'All Time' }}</span>
            </div>
          </div>

          <!-- Metric Counters -->
          <div class="grid grid-cols-5 gap-2 text-center text-xs">
            <div class="p-2 rounded bg-slate-100 border border-slate-200">
              <span class="text-slate-500 block text-[10px] font-bold">TOTAL UNITS</span>
              <span class="text-base font-bold font-mono text-slate-900">{{ filterStats.total }}</span>
            </div>
            <div class="p-2 rounded bg-emerald-50 border border-emerald-200">
              <span class="text-emerald-700 block text-[10px] font-bold">AVAILABLE</span>
              <span class="text-base font-bold font-mono text-emerald-800">{{ filterStats.available }}</span>
            </div>
            <div class="p-2 rounded bg-blue-50 border border-blue-200">
              <span class="text-blue-700 block text-[10px] font-bold">SOLD</span>
              <span class="text-base font-bold font-mono text-blue-800">{{ filterStats.sold }}</span>
            </div>
            <div class="p-2 rounded bg-emerald-50 border border-emerald-200">
              <span class="text-emerald-700 block text-[10px] font-bold">PAID UNITS</span>
              <span class="text-base font-bold font-mono text-emerald-800">{{ filterStats.paid }}</span>
            </div>
            <div class="p-2 rounded bg-rose-50 border border-rose-200">
              <span class="text-rose-700 block text-[10px] font-bold">UNPAID / PENDING</span>
              <span class="text-base font-bold font-mono text-rose-800">{{ filterStats.pending }}</span>
            </div>
          </div>

          <!-- Printable Data Table -->
          <table class="w-full text-left border-collapse text-[11px] border border-slate-300">
            <thead>
              <tr class="bg-slate-100 border-b border-slate-300 font-bold text-slate-700 uppercase">
                <th class="p-2 border-r border-slate-300 w-8 text-center">#</th>
                <th class="p-2 border-r border-slate-300">Serial Number</th>
                <th class="p-2 border-r border-slate-300">Machine Code</th>
                <th class="p-2 border-r border-slate-300">Product SKU</th>
                <th class="p-2 border-r border-slate-300 text-center">Status</th>
                <th class="p-2 border-r border-slate-300 text-center">Payment</th>
                <th class="p-2 border-r border-slate-300">Depot</th>
                <th class="p-2 border-r border-slate-300">Inbound Date</th>
                <th class="p-2 border-r border-slate-300">Sold Customer</th>
                <th class="p-2">Invoice #</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ser, idx) in filteredSerials" :key="ser.serialCode" class="border-b border-slate-200">
                <td class="p-1.5 border-r border-slate-200 text-center font-mono text-slate-500">{{ idx + 1 }}</td>
                <td class="p-1.5 border-r border-slate-200 font-mono font-bold text-slate-900">{{ (ser.serialCode || '').replace(/^SN-/i, '') }}</td>
                <td class="p-1.5 border-r border-slate-200 font-mono font-bold text-purple-700">{{ ser.machineCode || '—' }}</td>
                <td class="p-1.5 border-r border-slate-200 font-mono text-slate-700">{{ ser.sku }}</td>
                <td class="p-1.5 border-r border-slate-200 text-center font-semibold">
                  {{ ser.status }}
                </td>
                <td class="p-1.5 border-r border-slate-200 text-center font-bold" :class="ser.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-rose-700'">
                  {{ ser.paymentStatus || 'Pending' }}
                </td>
                <td class="p-1.5 border-r border-slate-200 font-semibold text-slate-700">{{ ser.allocationCity || 'Peshawar' }}</td>
                <td class="p-1.5 border-r border-slate-200 font-mono text-slate-600">{{ ser.registeredDate || ser.inboundDate || '—' }}</td>
                <td class="p-1.5 border-r border-slate-200 text-slate-800">{{ ser.customer || 'Not Sold' }}</td>
                <td class="p-1.5 font-mono text-slate-700">{{ ser.invoiceNo || '—' }}</td>
              </tr>
              <tr v-if="filteredSerials.length === 0">
                <td colspan="10" class="p-6 text-center text-slate-500 italic">No serial records match the specified filters.</td>
              </tr>
            </tbody>
          </table>

          <!-- Signatures Footer -->
          <div class="pt-8 flex justify-between items-end text-xs text-slate-600">
            <div>
              <div class="border-t border-slate-400 w-44 pt-1 font-semibold text-center">Prepared By</div>
            </div>
            <div>
              <div class="border-t border-slate-400 w-44 pt-1 font-semibold text-center">Inventory Controller</div>
            </div>
            <div>
              <div class="border-t border-slate-400 w-44 pt-1 font-semibold text-center">Authorized Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import {
  QrCode,
  Search,
  MapPin,
  Building2,
  History,
  AlertTriangle,
  PackageCheck,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  CreditCard
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const dataStore = useDataStore()

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

const searchQuery = ref('')
const selectedCity = ref(authStore.isSuperAdmin ? 'ALL' : (authStore.userBranch || 'Lahore'))
const selectedStatus = ref('ALL')
const selectedPaymentStatus = ref('ALL') // 'ALL', 'Paid', 'Pending'
const selectedSerialDetail = ref(null)

// Date Range Filter States
const datePreset = ref('ALL')
const dateFrom = ref('')
const dateTo = ref('')

// Print Modal State
const showPrintModal = ref(false)
const printTimestamp = computed(() => new Date().toLocaleString())

function applyDatePreset() {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  if (datePreset.value === 'ALL') {
    dateFrom.value = ''
    dateTo.value = ''
  } else if (datePreset.value === 'TODAY') {
    dateFrom.value = todayStr
    dateTo.value = todayStr
  } else if (datePreset.value === 'THIS_MONTH') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    dateFrom.value = firstDay
    dateTo.value = todayStr
  } else if (datePreset.value === 'LAST_30_DAYS') {
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    dateFrom.value = past
    dateTo.value = todayStr
  }
}

function clearDates() {
  datePreset.value = 'ALL'
  dateFrom.value = ''
  dateTo.value = ''
}

function triggerPrint() {
  window.print()
}

const currentPage = ref(1)
const pageSize = ref(10)

watch([searchQuery, selectedCity, selectedStatus, selectedPaymentStatus, dateFrom, dateTo], () => {
  currentPage.value = 1
})

const filteredSerials = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const qClean = q.replace(/^sn-/i, '')
  const effectiveCity = authStore.isSuperAdmin ? selectedCity.value : (authStore.userBranch || 'Lahore')

  return (dataStore.visibleSerials || []).filter(s => {
    const sCode = (s.serialCode || '').toLowerCase()
    const sClean = sCode.replace(/^sn-/i, '')
    const mCode = (s.machineCode || '').toLowerCase()
    const sku = (s.sku || '').toLowerCase()
    const city = (s.allocationCity || s.branch || '').toLowerCase()
    const cust = (s.customer || '').toLowerCase()
    const inv = (s.invoiceNo || '').toLowerCase()

    const matchesSearch = !q ||
                          sCode.includes(q) ||
                          sClean.includes(qClean) ||
                          mCode.includes(q) ||
                          sku.includes(q) ||
                          city.includes(q) ||
                          cust.includes(q) ||
                          inv.includes(q)
    const matchesCity = effectiveCity === 'ALL' || city.includes(effectiveCity.toLowerCase())
    const matchesStatus = selectedStatus.value === 'ALL' || s.status === selectedStatus.value

    // Payment Status Filter (Paid vs Unpaid / Pending)
    let matchesPayment = true
    if (selectedPaymentStatus.value === 'Paid') {
      matchesPayment = (s.paymentStatus === 'Paid')
    } else if (selectedPaymentStatus.value === 'Pending') {
      matchesPayment = (s.paymentStatus !== 'Paid')
    }

    // Date Range Filter
    let matchesDate = true
    if (dateFrom.value || dateTo.value) {
      const rawDate = s.registeredDate || s.inboundDate || s.purchaseDate || s.soldDate || s.date || ''
      const itemDate = String(rawDate).slice(0, 10)
      if (itemDate) {
        if (dateFrom.value && itemDate < dateFrom.value) matchesDate = false
        if (dateTo.value && itemDate > dateTo.value) matchesDate = false
      }
    }

    return matchesSearch && matchesCity && matchesStatus && matchesPayment && matchesDate
  })
})

const filterStats = computed(() => {
  const list = filteredSerials.value
  let available = 0
  let sold = 0
  let defective = 0
  let paid = 0
  let pending = 0

  for (const s of list) {
    if (s.status === 'Available') available++
    else if (s.status === 'Sold') sold++
    else if (s.status === 'Defective') defective++

    if (s.paymentStatus === 'Paid') paid++
    else pending++
  }

  return { total: list.length, available, sold, defective, paid, pending }
})

const paginatedSerials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSerials.value.slice(start, start + pageSize.value)
})

function toggleDefective(serial) {
  const newStatus = serial.status === 'Defective' ? 'Available' : 'Defective'
  dataStore.updateSerialStatus(serial.serialCode, newStatus, authStore.user)
}

async function updateSerialStatusHandler(serial, newStatus) {
  await dataStore.updateSerialStatus(serial.serialCode, newStatus, authStore.user)
  serial.status = newStatus
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.mb-4 { margin-bottom: 1.25rem; }
.p-3 { padding: 0.85rem 1.25rem; }
.p-4 { padding: 1.25rem; }
.ml-1 { margin-left: 0.25rem; }

.search-box { position: relative; width: 340px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-input { padding-left: 2.2rem; }
.city-select { width: 175px; }

.stat-pill {
  padding: 0.4rem 0.85rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.serial-history-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.history-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.step-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.bg-success { background: var(--success); }
.bg-primary { background: var(--primary); }
.bg-danger { background: var(--danger); }
.bg-neutral { background: var(--text-subtle); }

.step-title { font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
.step-date { font-size: 0.75rem; color: var(--text-muted); margin: 2px 0; }
.step-desc { font-size: 0.82rem; color: var(--text-muted); }
.text-xs { font-size: 0.75rem; }
.text-base { font-size: 0.95rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
  }

  .action-buttons {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .filter-pills {
    width: 100%;
    flex-wrap: wrap;
  }

  .city-select {
    width: 100%;
  }
}

@media print {
  /* Hide all app chrome, sidebars, headers, pagination, modals background */
  body * {
    visibility: hidden;
  }

  .printable-registry-area,
  .printable-registry-area * {
    visibility: visible;
  }

  .printable-registry-area {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: auto;
    margin: 0;
    padding: 1.5rem !important;
    background: #ffffff !important;
    color: #000000 !important;
    z-index: 99999;
  }

  .no-print {
    display: none !important;
  }
}
</style>

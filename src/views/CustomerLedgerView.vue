<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono">CLIENT GOVERNANCE</span>
          <span class="badge badge-success font-mono">ITEMIZED LEDGERS</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Customer Financial Ledger</h1>
        <p class="text-slate-300 text-sm mt-1">
          Separate categorized sections for Sales Invoices, Payment In Receipts, Equipment History, and Paid vs Pending Machine tracking.
        </p>
      </div>

      <!-- Customer Selector -->
      <div class="w-full sm:w-auto min-w-[280px]">
        <label class="form-label mb-1 block">Select Customer Account</label>
        <div class="relative">
          <select
            v-model="selectedCustomerName"
            @change="loadLedger"
            class="form-select font-bold py-3 text-white"
          >
            <option v-for="cust in customerOptions" :key="cust" :value="cust">
              {{ cust }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Active Ledger Display -->
    <div v-if="ledger" class="space-y-6">
      <!-- Financial Summary Metric Cards -->
      <div class="kpi-grid">
        <!-- Total Invoiced -->
        <div class="kpi-card glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Total Invoiced Sales</span>
            <FileText :size="20" class="text-blue-400" />
          </div>
          <div class="kpi-value text-white mt-1">PKR {{ (ledger.totalInvoiced || 0).toLocaleString() }}</div>
          <div class="kpi-subtitle">
            <TrendingUp :size="12" class="text-blue-400" />
            <span>{{ ledger.invoices.length }} Sale Invoices Issued</span>
          </div>
        </div>

        <!-- Total Payments Received -->
        <div class="kpi-card kpi-success glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Total Payment Received</span>
            <Receipt :size="20" class="text-emerald-400" />
          </div>
          <div class="kpi-value text-emerald-400 mt-1">PKR {{ (ledger?.totalPaid || 0).toLocaleString() }}</div>
          <div class="kpi-subtitle text-emerald-400">
            <CheckCircle2 :size="12" />
            <span>{{ ledger.receipts.length }} Cash / Bank Receipts</span>
          </div>
        </div>

        <!-- Outstanding Balance -->
        <div class="kpi-card kpi-danger glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Outstanding Balance</span>
            <DollarSign :size="20" class="text-red-400" />
          </div>
          <div :class="['kpi-value mt-1', (ledger?.outstandingBalance || 0) > 0 ? 'text-red-400' : 'text-emerald-400']">
            PKR {{ (ledger?.outstandingBalance || 0).toLocaleString() }}
          </div>
          <div class="kpi-subtitle text-red-400">
            <Clock :size="12" />
            <span>Unpaid Balance Due</span>
          </div>
        </div>

        <!-- Machine Paid vs Pending Count -->
        <div class="kpi-card kpi-purple glass-panel p-5">
          <div class="flex items-center justify-between">
            <span class="kpi-title">Machine Payment Ratio</span>
            <Tag :size="20" class="text-purple-400" />
          </div>
          <div class="kpi-value text-white mt-1 flex items-center gap-2">
            <span class="text-emerald-400 font-bold">{{ ledger.paidMachines.length }} Paid</span>
            <span class="text-slate-500">/</span>
            <span class="text-red-400 font-bold">{{ ledger.pendingMachines.length }} Pending</span>
          </div>
          <div class="kpi-subtitle">
            <span>Total Units: {{ ledger.customerMachines.length }}</span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Bar -->
      <div class="glass-panel p-2 flex flex-wrap gap-2">
        <button
          @click="activeTab = 'invoices'"
          :class="['btn', activeTab === 'invoices' ? 'btn-primary' : 'btn-ghost']"
        >
          <FileText :size="16" />
          <span>Sales Invoices ({{ ledger.invoices.length }})</span>
        </button>

        <button
          @click="activeTab = 'payments'"
          :class="['btn', activeTab === 'payments' ? 'btn-primary' : 'btn-ghost']"
        >
          <Receipt :size="16" />
          <span>Payment In Receipts ({{ ledger.receipts.length }})</span>
        </button>

        <button
          @click="activeTab = 'machines'"
          :class="['btn', activeTab === 'machines' ? 'btn-primary' : 'btn-ghost']"
        >
          <Tag :size="16" />
          <span>Machine Code & Serial Payment Track</span>
        </button>

        <button
          @click="activeTab = 'returns'"
          :class="['btn', activeTab === 'returns' ? 'btn-primary' : 'btn-ghost']"
        >
          <RotateCcw :size="16" />
          <span>Sales & Purchase Returns</span>
        </button>

        <button
          @click="activeTab = 'equipment'"
          :class="['btn', activeTab === 'equipment' ? 'btn-primary' : 'btn-ghost']"
        >
          <Package :size="16" />
          <span>Equipment Purchase History</span>
        </button>
      </div>

      <!-- Tab 1: Sales Invoices -->
      <div v-if="activeTab === 'invoices'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <FileText :size="20" class="text-blue-400" />
            <span>Sales Invoices</span>
          </h3>
          <span class="badge badge-neutral font-mono">{{ ledger.invoices.length }} Invoices</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Branch</th>
                <th>Items Purchased</th>
                <th>Grand Total</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in ledger.invoices" :key="inv.invoiceNo">
                <td class="font-mono font-bold text-blue-400">{{ inv.invoiceNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ inv.saleDate }}</td>
                <td>
                  <span class="badge badge-purple">
                    <Building2 :size="10" />
                    {{ inv.branch || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <div v-for="item in inv.items" :key="item.productName" class="text-xs py-0.5">
                    <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
                    <span v-if="item.serials?.length" class="text-slate-400 font-mono">({{ item.serials.join(', ') }})</span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">PKR {{ (inv.grandTotal || 0).toLocaleString() }}</td>
                <td>
                  <span class="badge badge-neutral">{{ inv.paymentMethod }}</span>
                </td>
              </tr>
              <tr v-if="ledger.invoices.length === 0">
                <td colspan="6" class="p-6 text-center text-subtle italic">No sales invoices recorded for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Payment In Receipts -->
      <div v-if="activeTab === 'payments'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Receipt :size="20" class="text-emerald-400" />
            <span>Payment In Receipts</span>
          </h3>
          <span class="badge badge-success font-mono">{{ ledger.receipts.length }} Receipts</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Allocated Machines</th>
                <th>Amount Received</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rcp in ledger.receipts" :key="rcp.receiptNo">
                <td class="font-mono font-bold text-emerald-400">{{ rcp.receiptNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ rcp.paymentDate }}</td>
                <td>
                  <span :class="['badge', (rcp.paymentType || rcp.paymentMethod) === 'Cash Payment' ? 'badge-warning' : 'badge-info']">
                    {{ rcp.paymentType || rcp.paymentMethod || 'Cash Payment' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-purple">
                    <Building2 :size="10" />
                    {{ rcp.branch || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="item in rcp.paidSerials" :key="item.serialCode" class="badge badge-neutral font-mono text-xs">
                      {{ item.machineCode }} ({{ item.serialCode }})
                    </span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">PKR {{ (rcp.amount || rcp.amountReceived || 0).toLocaleString() }}</td>
                <td class="text-xs text-subtle">{{ rcp.description }}</td>
              </tr>
              <tr v-if="ledger.receipts.length === 0">
                <td colspan="7" class="p-6 text-center text-subtle italic">No payment receipts recorded for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Machine Code & Serial Payment Tracking -->
      <div v-if="activeTab === 'machines'" class="glass-panel p-6 shadow-xl space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Tag :size="20" class="text-purple-400" />
            <span>Machine Level Itemized Payment Tracking</span>
          </h3>
          <span class="badge badge-purple font-mono">Itemized Machine Status</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Paid Machines -->
          <div class="glass-panel p-4 border border-emerald-500/30">
            <h4 class="font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <CheckCircle2 :size="16" />
              <span>Paid Machines ({{ ledger.paidMachines.length }})</span>
            </h4>
            <div class="table-container">
              <table class="table-lined">
                <thead>
                  <tr>
                    <th>Machine Code</th>
                    <th>Serial Number</th>
                    <th>Product</th>
                    <th>Receipt Ref</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in ledger.paidMachines" :key="m.serialCode">
                    <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                    <td class="font-mono text-xs text-primary">{{ m.serialCode }}</td>
                    <td class="text-xs">{{ m.sku }}</td>
                    <td class="font-mono text-xs text-emerald-400">{{ m.paymentReceiptNo || 'PAID' }}</td>
                  </tr>
                  <tr v-if="ledger.paidMachines.length === 0">
                    <td colspan="4" class="p-4 text-center text-subtle italic">No paid machines logged yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pending Machines -->
          <div class="glass-panel p-4 border border-red-500/30">
            <h4 class="font-bold text-red-400 mb-3 flex items-center gap-2">
              <Clock :size="16" />
              <span>Pending Payment Machines ({{ ledger.pendingMachines.length }})</span>
            </h4>
            <div class="table-container">
              <table class="table-lined">
                <thead>
                  <tr>
                    <th>Machine Code</th>
                    <th>Serial Number</th>
                    <th>Product</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in ledger.pendingMachines" :key="m.serialCode">
                    <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                    <td class="font-mono text-xs text-primary">{{ m.serialCode }}</td>
                    <td class="text-xs">{{ m.sku }}</td>
                    <td>
                      <span class="badge badge-danger">Unpaid Due</span>
                    </td>
                  </tr>
                  <tr v-if="ledger.pendingMachines.length === 0">
                    <td colspan="4" class="p-4 text-center text-emerald-400 italic font-semibold">All machines fully paid for this customer!</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 4: Sales & Purchase Returns -->
      <div v-if="activeTab === 'returns'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw :size="20" class="text-amber-400" />
            <span>Sales & Purchase Returns Ledger</span>
          </h3>
          <span class="badge badge-warning font-mono">Returns & Credit Notes</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Type</th>
                <th>Date</th>
                <th>Item / Machine Code</th>
                <th>Serial Code</th>
                <th>Refund Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="6" class="p-6 text-center text-subtle italic">No return or credit note entries logged for {{ selectedCustomerName }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 5: Equipment Purchase History -->
      <div v-if="activeTab === 'equipment'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Package :size="20" class="text-blue-400" />
            <span>Equipment Purchase Breakdown History (Since Last Year)</span>
          </h3>
          <span class="badge badge-info font-mono">{{ ledger.purchasedItems?.length || 0 }} Items</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Total Units Purchased</th>
                <th>Total Invoiced Amount</th>
                <th>Latest Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="eq in ledger.purchasedItems" :key="eq.productName">
                <td class="font-bold text-main">{{ eq.productName }}</td>
                <td class="font-mono font-bold text-primary">{{ eq.totalQty }} units</td>
                <td class="font-bold text-emerald-400">PKR {{ (eq.totalAmount || 0).toLocaleString() }}</td>
                <td class="font-mono text-xs text-subtle">{{ eq.lastPurchaseDate }}</td>
              </tr>
              <tr v-if="!ledger.purchasedItems || ledger.purchasedItems.length === 0">
                <td colspan="4" class="p-6 text-center text-subtle italic">No equipment purchase breakdown found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import {
  FileText,
  Receipt,
  Tag,
  Package,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  RotateCcw
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()

const selectedCustomerName = ref('Northwest General Hospital Peshawar')
const activeTab = ref('invoices')
const ledger = ref(null)

const customerOptions = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(s => { 
    if (s.customer) set.add(s.customer) 
    if (s.customerName) set.add(s.customerName)
  })
  dataStore.serials.forEach(s => { if (s.customer) set.add(s.customer) })
  if (!set.size) {
    set.add('Northwest General Hospital Peshawar')
    set.add('Multan Medical Complex')
    set.add('Khyber Aesthetics & Laser Clinic')
  }
  return Array.from(set)
})

onMounted(() => {
  if (route.query.customer) {
    selectedCustomerName.value = route.query.customer
  }
  loadLedger()
})

function loadLedger() {
  if (!selectedCustomerName.value) return
  ledger.value = dataStore.getCustomerLedger(selectedCustomerName.value)
}
</script>

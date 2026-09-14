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

      <!-- Actions: Customer Selector & View/Hide Balance Button -->
      <div class="flex items-end gap-3 w-full sm:w-auto">
        <!-- Customer Selector -->
        <div class="w-full sm:w-auto min-w-[240px]">
          <label class="form-label mb-1.5 block">Select Customer Account</label>
          <div class="relative">
            <select
              v-model="selectedCustomerName"
              @change="loadLedger"
              class="form-select font-bold text-white h-11 !min-h-0 py-0 px-3.5"
            >
              <option v-if="customerOptions.length === 0" value="" disabled>
                No Customer Accounts Available
              </option>
              <option v-for="cust in customerOptions" :key="cust" :value="cust">
                {{ cust }}
              </option>
            </select>
          </div>
        </div>

        <!-- View / Hide Balance Security Button -->
        <div class="shrink-0">
          <button
            @click="handleBalanceToggle"
            :class="[
              'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-11 !min-h-0 px-4 whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="18" />
            <Eye v-else :size="18" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
          </button>
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
          <div class="kpi-value text-white mt-1">{{ formatBalance(ledger.totalInvoiced) }}</div>
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
          <div class="kpi-value text-emerald-400 mt-1">{{ formatBalance(ledger?.totalPaid) }}</div>
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
            {{ formatBalance(ledger?.outstandingBalance) }}
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
          @click="activeTab = 'paid'"
          :class="['btn', activeTab === 'paid' ? 'btn-success text-white' : 'btn-ghost']"
        >
          <CheckCircle2 :size="16" />
          <span>Paid Machines ({{ ledger.paidMachines.length }})</span>
        </button>

        <button
          @click="activeTab = 'unpaid'"
          :class="['btn', activeTab === 'unpaid' ? 'btn-danger text-white' : 'btn-ghost']"
        >
          <Clock :size="16" />
          <span>Unpaid Machines ({{ ledger.pendingMachines.length }})</span>
        </button>

        <button
          @click="activeTab = 'returns'"
          :class="['btn', activeTab === 'returns' ? 'btn-warning text-white' : 'btn-ghost']"
        >
          <RotateCcw :size="16" />
          <span>Sales Returns ({{ (ledger.returns || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'paymentOut'"
          :class="['btn', activeTab === 'paymentOut' ? 'btn-primary' : 'btn-ghost']"
        >
          <DollarSign :size="16" />
          <span>Payment Out ({{ (ledger.paymentsOut || []).length }})</span>
        </button>

        <button
          @click="activeTab = 'equipment'"
          :class="['btn', activeTab === 'equipment' ? 'btn-primary' : 'btn-ghost']"
        >
          <Package :size="16" />
          <span>Equipment History ({{ ledger.purchasedItems?.length || 0 }})</span>
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
                <th>Customer Name</th>
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
                <td class="font-bold text-white">{{ inv.customer || selectedCustomerName }}</td>
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
                <td class="font-bold text-emerald-400">{{ formatBalance(inv.grandTotal) }}</td>
                <td>
                  <span class="badge badge-neutral">{{ inv.paymentMethod }}</span>
                </td>
              </tr>
              <tr v-if="ledger.invoices.length === 0">
                <td colspan="7" class="p-6 text-center text-subtle italic">No sales invoices recorded for this customer.</td>
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
                <th>Customer Name</th>
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
                <td class="font-bold text-white">{{ rcp.customer || selectedCustomerName }}</td>
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
                      {{ item.machineCode }} ({{ (item.serialCode || '').replace(/^SN-/i, '') }})
                    </span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">{{ formatBalance(rcp.amount || rcp.amountReceived) }}</td>
                <td class="text-xs text-subtle">{{ rcp.description }}</td>
              </tr>
              <tr v-if="ledger.receipts.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No payment receipts recorded for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Dedicated PAID Machines Tab -->
      <div v-if="activeTab === 'paid'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 :size="20" />
              <span>Paid Machines & Cleared Equipment</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              All equipment units for {{ selectedCustomerName }} that have been fully paid.
            </p>
          </div>
          <span class="badge badge-success font-mono">{{ ledger.paidMachines.length }} Fully Paid</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Serial Number</th>
                <th>Equipment Name</th>
                <th>Customer Name</th>
                <th>Paid Amount</th>
                <th>Payment Date</th>
                <th>Receipt / Ref #</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in ledger.paidMachines" :key="m.serialCode">
                <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                <td class="font-mono text-xs text-primary font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                <td class="text-sm font-semibold text-white">{{ m.productName || m.sku }}</td>
                <td class="font-bold text-slate-200">{{ m.customer || selectedCustomerName }}</td>
                <td class="font-bold text-emerald-400">{{ formatBalance(m.paymentAmount || m.salePrice) }}</td>
                <td class="font-mono text-xs text-subtle">{{ m.paymentDate || m.unpaidDate || 'N/A' }}</td>
                <td class="font-mono text-xs text-emerald-300 font-bold">{{ m.paymentReceiptNo || 'PAID (Cash Sale)' }}</td>
                <td>
                  <span class="badge badge-success flex items-center gap-1 w-max">
                    <CheckCircle2 :size="11" />
                    PAID
                  </span>
                </td>
              </tr>
              <tr v-if="ledger.paidMachines.length === 0">
                <td colspan="8" class="p-8 text-center text-subtle italic">No cleared/paid machines logged for this customer yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 4: Dedicated UNPAID Machines Tab -->
      <div v-if="activeTab === 'unpaid'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-red-400 flex items-center gap-2">
              <Clock :size="20" />
              <span>Unpaid & Pending Equipment Machines</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Outstanding equipment machines pending settlement. Shows exact unpaid date and invoice source.
            </p>
          </div>
          <span class="badge badge-danger font-mono">{{ ledger.pendingMachines.length }} Pending Due</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Machine Code</th>
                <th>Serial Number</th>
                <th>Equipment Name</th>
                <th>Customer Name</th>
                <th>Unpaid Due Amount</th>
                <th>Invoice #</th>
                <th>Unpaid Date</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in ledger.pendingMachines" :key="m.serialCode">
                <td class="font-mono font-bold text-purple-400">{{ m.machineCode }}</td>
                <td class="font-mono text-xs text-primary font-bold">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</td>
                <td class="text-sm font-semibold text-white">{{ m.productName || m.sku }}</td>
                <td class="font-bold text-slate-200">{{ m.customer || selectedCustomerName }}</td>
                <td class="font-bold text-red-400">{{ formatBalance(m.salePrice) }}</td>
                <td class="font-mono text-xs text-blue-400 font-bold">{{ m.invoiceNo || 'N/A' }}</td>
                <td class="font-mono text-xs text-amber-400 font-bold">
                  {{ m.unpaidDate || 'N/A' }}
                </td>
                <td>
                  <span class="badge badge-purple text-xs">
                    <Building2 :size="10" />
                    {{ m.allocationCity || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-danger flex items-center gap-1 w-max">
                    <Clock :size="11" />
                    UNPAID DUE
                  </span>
                </td>
                <td>
                  <router-link
                    :to="`/payment-in?customer=${encodeURIComponent(selectedCustomerName)}`"
                    class="btn btn-sm btn-primary text-xs flex items-center gap-1"
                  >
                    <Receipt :size="12" />
                    <span>Pay Due</span>
                  </router-link>
                </td>
              </tr>
              <tr v-if="ledger.pendingMachines.length === 0">
                <td colspan="10" class="p-8 text-center text-emerald-400 font-bold italic">
                  🎉 Great news! All machines are fully paid for {{ selectedCustomerName }}. No pending due machines.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 5: Sales & Purchase Returns -->
      <div v-if="activeTab === 'returns'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw :size="20" class="text-amber-400" />
              <span>Sales Returns & Credit Notes</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Returned products restocked to available inventory under distinct Return IDs (RET-2026-xxx).
            </p>
          </div>
          <span class="badge badge-warning font-mono">{{ (ledger.returns || []).length }} Returns</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Original Invoice #</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Returned Machines / Serials</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Restock Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ret in (ledger.returns || [])" :key="ret.returnNo">
                <td class="font-mono font-bold text-amber-400">{{ ret.returnNo }}</td>
                <td class="font-mono text-xs text-blue-400 font-bold">{{ ret.invoiceNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ ret.returnDate }}</td>
                <td class="font-bold text-white">{{ ret.customer || selectedCustomerName }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="s in ret.returnedSerials" :key="s.serialCode" class="badge badge-neutral font-mono text-xs">
                      {{ s.machineCode || '' }} ({{ s.serialCode }}) - {{ s.productName }}
                    </span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400">{{ formatBalance(ret.totalRefundAmount) }}</td>
                <td class="text-xs text-slate-300">{{ ret.reason }}</td>
                <td>
                  <span class="badge badge-success text-xs">
                    Restocked to Available
                  </span>
                </td>
              </tr>
              <tr v-if="!ledger.returns || ledger.returns.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No product returns or credit notes recorded for {{ selectedCustomerName }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 6: Payment Out (Refunds / Customer Disbursements) -->
      <div v-if="activeTab === 'paymentOut'" class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign :size="20" class="text-amber-400" />
              <span>Payment Out (Refunds & Customer Disbursements)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Outflow vouchers recorded for customer refund payout or account debit.
            </p>
          </div>
          <span class="badge badge-warning font-mono">{{ (ledger.paymentsOut || []).length }} Vouchers</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Voucher #</th>
                <th>Date</th>
                <th>Payee</th>
                <th>Category</th>
                <th>Payment Mode</th>
                <th>Branch</th>
                <th>Amount Out</th>
                <th>Description / Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="vou in (ledger.paymentsOut || [])" :key="vou.voucherNo">
                <td class="font-mono font-bold text-amber-400">{{ vou.voucherNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ vou.paymentDate }}</td>
                <td class="font-bold text-white">{{ vou.payee || selectedCustomerName }}</td>
                <td>
                  <span class="badge badge-neutral text-xs">{{ vou.category }}</span>
                </td>
                <td>
                  <span class="badge badge-info text-xs">{{ vou.paymentType || 'Cash Payment' }}</span>
                </td>
                <td>
                  <span class="badge badge-purple text-xs">{{ vou.branch || 'Peshawar' }}</span>
                </td>
                <td class="font-bold text-red-400">{{ formatBalance(vou.amount) }}</td>
                <td class="text-xs text-slate-300">{{ vou.description }}</td>
              </tr>
              <tr v-if="!ledger.paymentsOut || ledger.paymentsOut.length === 0">
                <td colspan="8" class="p-6 text-center text-subtle italic">No payment out vouchers or refund debits recorded for {{ selectedCustomerName }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 7: Equipment Purchase History -->
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
                <td class="font-bold text-emerald-400">{{ formatBalance(eq.totalAmount) }}</td>
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

    <!-- Empty State when no customer / transactions exist -->
    <div v-else class="glass-panel p-12 text-center space-y-3 shadow-xl">
      <div class="w-16 h-16 rounded-full bg-slate-800/70 mx-auto flex items-center justify-center text-slate-400">
        <FileText :size="28" />
      </div>
      <h3 class="text-lg font-bold text-white">No Customer Ledger Found</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto">
        There are currently no customer transaction records in the system. As soon as you issue a sales invoice or record a payment, the customer ledger will automatically appear here.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
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
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()

const selectedCustomerName = ref('')
const activeTab = ref('invoices')
const ledger = ref(null)

function handleBalanceToggle() {
  authStore.toggleBalance()
}

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

const customerOptions = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(s => { 
    if (s.customer) set.add(s.customer) 
    if (s.customerName) set.add(s.customerName)
  })
  dataStore.serials.forEach(s => { if (s.customer) set.add(s.customer) })
  return Array.from(set)
})

watch(customerOptions, (opts) => {
  if (opts.length > 0) {
    if (!selectedCustomerName.value || !opts.includes(selectedCustomerName.value)) {
      selectedCustomerName.value = opts[0]
      loadLedger()
    }
  } else {
    selectedCustomerName.value = ''
    ledger.value = null
  }
}, { immediate: true })

onMounted(() => {
  if (route.query.customer) {
    selectedCustomerName.value = route.query.customer
  }
  loadLedger()
})

function loadLedger() {
  if (!selectedCustomerName.value) {
    ledger.value = null
    return
  }
  ledger.value = dataStore.getCustomerLedger(selectedCustomerName.value)
}
</script>

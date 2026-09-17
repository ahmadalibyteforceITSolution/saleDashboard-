<template>
  <div class="page-wrapper space-y-6">
    <!-- Header -->
    <div class="header-card flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-success font-mono">CASH FLOW ENGINE</span>
          <span class="badge badge-info font-mono">MONEY IN & OUT</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mt-1.5 tracking-tight">Payment & Cash Flow Management</h1>
        <p class="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
          Monitor Money Coming In (Customer Collections & Receipts) versus Money Coming Out (Refunds, Vendor Disbursements & Expenses).
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap shrink-0">
        <!-- View / Hide Balance Security Toggle -->
        <button
          @click="authStore.toggleBalance()"
          :class="[
            'btn font-bold flex items-center justify-center gap-1.5 shadow-md transition-all h-10 px-3.5 text-xs whitespace-nowrap',
            authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
          ]"
          :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
          :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
        >
          <EyeOff v-if="authStore.isBalanceVisible" :size="15" />
          <Eye v-else :size="15" />
          <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
        </button>

        <button
          @click="showCreateModal = true"
          class="btn btn-success h-10 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap"
        >
          <Plus :size="15" />
          <span>Record Payment In</span>
        </button>

        <button
          @click="showPaymentOutModal = true"
          class="btn btn-danger h-10 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-md whitespace-nowrap"
        >
          <ArrowUpRight :size="15" />
          <span>Record Payment Out</span>
        </button>
      </div>
    </div>

    <!-- Financial Liquidity KPI Cards -->
    <div class="kpi-grid">
      <!-- Total Money In -->
      <div class="kpi-card kpi-success glass-panel p-5">
        <div class="flex items-center justify-between">
          <span class="kpi-title">Money Coming In</span>
          <ArrowDownLeft :size="22" class="text-emerald-400" />
        </div>
        <div class="kpi-value text-emerald-400 mt-1">{{ formatBalance(dataStore.totalMoneyIn) }}</div>
        <div class="kpi-subtitle text-emerald-400">
          <Receipt :size="12" />
          <span>{{ dataStore.paymentReceipts.length }} Inflow Receipts</span>
        </div>
      </div>

      <!-- Total Money Out -->
      <div class="kpi-card kpi-danger glass-panel p-5">
        <div class="flex items-center justify-between">
          <span class="kpi-title">Money Coming Out</span>
          <ArrowUpRight :size="22" class="text-red-400" />
        </div>
        <div class="kpi-value text-red-400 mt-1">{{ formatBalance(dataStore.totalMoneyOut) }}</div>
        <div class="kpi-subtitle text-red-400">
          <DollarSign :size="12" />
          <span>{{ (dataStore.paymentOutVouchers || []).length }} Outflow Vouchers</span>
        </div>
      </div>

      <!-- Net Cash Flow -->
      <div class="kpi-card kpi-purple glass-panel p-5">
        <div class="flex items-center justify-between">
          <span class="kpi-title">Net Cash Flow Liquidity</span>
          <TrendingUp :size="22" :class="dataStore.netCashFlow >= 0 ? 'text-purple-400' : 'text-red-400'" />
        </div>
        <div :class="['kpi-value mt-1', dataStore.netCashFlow >= 0 ? 'text-purple-400' : 'text-red-400']">
          {{ formatBalance(dataStore.netCashFlow) }}
        </div>
        <div class="kpi-subtitle">
          <span>{{ dataStore.netCashFlow >= 0 ? 'Positive Operating Surplus' : 'Net Liquidity Deficit' }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="glass-panel p-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
      <!-- Tabs for Direction / View Mode -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          @click="activeView = 'all'"
          :class="['btn btn-sm', activeView === 'all' ? 'btn-primary' : 'btn-ghost']"
        >
          <span>All Cash Flow ({{ filteredCashFlowList.length }})</span>
        </button>

        <button
          @click="activeView = 'in'"
          :class="['btn btn-sm', activeView === 'in' ? 'btn-success text-white' : 'btn-ghost']"
        >
          <ArrowDownLeft :size="14" />
          <span>Money In ({{ dataStore.paymentReceipts.length }})</span>
        </button>

        <button
          @click="activeView = 'out'"
          :class="['btn btn-sm', activeView === 'out' ? 'btn-danger text-white' : 'btn-ghost']"
        >
          <ArrowUpRight :size="14" />
          <span>Money Out ({{ (dataStore.paymentOutVouchers || []).length }})</span>
        </button>
      </div>

      <!-- Filter Controls: Branch, Method, Search -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Branch filter -->
        <select v-model="filterBranch" class="form-select filter-select font-bold">
          <option value="ALL">🏢 All Branches</option>
          <option value="Peshawar">🏢 Peshawar HO</option>
          <option value="Multan">🏢 Multan Branch</option>
          <option value="Lahore">🏢 Lahore Office</option>
        </select>

        <!-- Method filter -->
        <select v-model="filterMethod" class="form-select filter-select font-bold">
          <option value="ALL">💳 All Payment Types</option>
          <option value="Cash">💵 Cash Payments</option>
          <option value="Bank">🏦 Bank Payments</option>
        </select>

        <!-- Text search -->
        <div class="filter-search-box">
          <Search :size="14" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search party, ref #..."
            class="form-input filter-search-input"
          />
        </div>
      </div>
    </div>

    <!-- Unified Cash Flow & Payment Table -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Receipt :size="20" class="text-emerald-400" />
          <span v-if="activeView === 'all'">Combined Money Coming In & Coming Out Ledger</span>
          <span v-else-if="activeView === 'in'">Money Coming In Receipts (Customer Collections)</span>
          <span v-else>Money Coming Out Vouchers (Disbursements & Refunds)</span>
        </h3>
        <span class="badge badge-neutral font-mono">{{ displayedList.length }} Transactions Found</span>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Direction</th>
              <th>Voucher / Ref #</th>
              <th>Date</th>
              <th>Party / Customer Name</th>
              <th>Category</th>
              <th>Payment Method</th>
              <th>Branch</th>
              <th>Amount (PKR)</th>
              <th>Description / Machine Codes</th>
              <th>Staff</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in displayedList" :key="tx.id">
              <!-- Direction Badge -->
              <td>
                <span :class="['badge flex items-center gap-1 font-bold text-xs w-max', tx.direction === 'IN' ? 'badge-success' : 'badge-danger']">
                  <ArrowDownLeft v-if="tx.direction === 'IN'" :size="11" />
                  <ArrowUpRight v-else :size="11" />
                  {{ tx.direction === 'IN' ? 'MONEY IN' : 'MONEY OUT' }}
                </span>
              </td>

              <!-- Ref / Voucher No -->
              <td class="font-mono font-bold" :class="tx.direction === 'IN' ? 'text-emerald-400' : 'text-amber-400'">
                {{ tx.voucherOrReceiptNo }}
              </td>

              <!-- Date -->
              <td class="font-mono text-xs text-subtle">{{ tx.date }}</td>

              <!-- Party -->
              <td class="font-bold text-white">{{ tx.partyName }}</td>

              <!-- Category -->
              <td>
                <span class="badge badge-neutral text-xs">{{ tx.category }}</span>
              </td>

              <!-- Payment Method -->
              <td>
                <span :class="['badge text-xs', tx.paymentMethod?.toLowerCase().includes('cash') ? 'badge-warning' : 'badge-info']">
                  {{ tx.paymentMethod }}
                </span>
              </td>

              <!-- Branch -->
              <td>
                <span class="badge badge-purple text-xs">
                  <Building2 :size="10" />
                  {{ tx.branch }}
                </span>
              </td>

              <!-- Amount -->
              <td class="font-bold font-mono text-base" :class="tx.direction === 'IN' ? 'text-emerald-400' : 'text-red-400'">
                {{ tx.direction === 'IN' ? '+' : '-' }} {{ formatBalance(tx.amount) }}
              </td>

              <!-- Description -->
              <td class="text-xs text-slate-300 max-w-xs truncate" :title="tx.description">
                {{ tx.description }}
              </td>

              <!-- User -->
              <td class="text-xs text-subtle">{{ tx.user }}</td>
            </tr>

            <tr v-if="displayedList.length === 0">
              <td colspan="10" class="p-8 text-center text-subtle italic">
                No payment transactions matched your selected filter criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      CREATE PAYMENT IN MODAL (Customer Receipt)
    ════════════════════════════════════════════ -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft :size="20" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">Record Money Coming In</h3>
              <p class="text-xs text-slate-400">Customer payment receipt allocated to machine serials</p>
            </div>
          </div>
          <button @click="showCreateModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPayment" class="modal-body space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Customer -->
            <div class="form-group">
              <label class="form-label">Customer / Hospital Name *</label>
              <input
                v-model="form.customer"
                type="text"
                list="cust-suggestions"
                @change="fetchCustomerPendingMachines"
                placeholder="Type or select customer name..."
                required
                class="form-input font-bold"
              />
              <datalist id="cust-suggestions">
                <option v-for="cust in customerList" :key="cust" :value="cust">{{ cust }}</option>
              </datalist>
            </div>

            <!-- Payment Type -->
            <div class="form-group">
              <label class="form-label">Payment Method *</label>
              <select v-model="form.paymentType" required class="form-select font-bold">
                <option value="Cash Payment">Cash Payment (Immediate Cash Inflow)</option>
                <option value="Bank Payment (HBL)">Bank Transfer (HBL)</option>
                <option value="Bank Payment (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                <option value="Bank Payment (Cheque)">Bank Payment (Cheque)</option>
              </select>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">Amount Received (PKR) *</label>
              <input v-model.number="form.amount" type="number" required min="1" class="form-input font-bold text-emerald-400" />
            </div>

            <!-- Branch -->
            <div class="form-group">
              <label class="form-label">Receiving Branch *</label>
              <select v-model="form.branch" required class="form-select font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Office</option>
              </select>
            </div>
          </div>

          <!-- Unpaid Machine Allocation Selector -->
          <div v-if="form.customer" class="form-group pt-2 border-t border-slate-800">
            <label class="form-label">Select Machines Paid Against (Serial / Code)</label>
            <div v-if="pendingMachinesForCustomer.length > 0" class="space-y-2 max-h-48 overflow-y-auto glass-panel p-3">
              <div v-for="m in pendingMachinesForCustomer" :key="m.serialCode" class="flex items-center justify-between p-2 hover:bg-slate-800/60 rounded border border-slate-800">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" :value="m.serialCode" v-model="selectedSerialCodes" @change="autoFillAmount" class="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500" />
                  <div>
                    <span class="font-mono text-sm font-bold text-white">{{ (m.serialCode || '').replace(/^SN-/i, '') }}</span>
                    <span class="ml-2 font-mono text-xs text-purple-400 font-bold">({{ m.machineCode }})</span>
                    <div class="text-xs text-slate-400">{{ m.productName || m.sku }} - Inv: {{ m.invoiceNo || 'N/A' }}</div>
                  </div>
                </label>
                <div class="text-xs font-bold text-amber-400">PKR {{ (m.salePrice || 0).toLocaleString() }}</div>
              </div>
            </div>
            <div v-else class="text-xs text-emerald-400 p-3 bg-emerald-950/40 rounded-lg border border-emerald-800">
              Note: No pending unpaid machines on record for this customer. Payment will be logged as general advance or settlement.
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Payment Description / Transaction Ref #</label>
            <textarea v-model="form.description" rows="2" placeholder="e.g. Received via Meezan Bank Online Transfer Ref # MB-9901..." class="form-textarea text-sm"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showCreateModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success font-bold flex items-center gap-1.5">
              <Check :size="16" />
              <span>Save Payment In Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      CREATE PAYMENT OUT MODAL (Voucher / Disbursement)
    ════════════════════════════════════════════ -->
    <div v-if="showPaymentOutModal" class="modal-backdrop" @click.self="showPaymentOutModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <ArrowUpRight :size="20" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">Record Money Coming Out</h3>
              <p class="text-xs text-slate-400">Issue outflow disbursement voucher (Customer Refund, Vendor, Expense)</p>
            </div>
          </div>
          <button @click="showPaymentOutModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPaymentOut" class="modal-body space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Payee -->
            <div class="form-group">
              <label class="form-label">Payee / Recipient Name *</label>
              <input
                v-model="outForm.payee"
                type="text"
                placeholder="e.g. Hospital name, Vendor, or Utility..."
                required
                class="form-input font-bold"
              />
            </div>

            <!-- Outflow Category -->
            <div class="form-group">
              <label class="form-label">Outflow Category *</label>
              <select v-model="outForm.category" required class="form-select font-bold">
                <option value="Customer Refund">Customer Return Refund</option>
                <option value="Vendor Payment">Vendor / Manufacturer Purchase Payment</option>
                <option value="Operational Expense">Operational / Logistics Expense</option>
                <option value="Branch Disbursement">Branch Cash Disbursement</option>
                <option value="Staff Commission">Staff Commission & Travel</option>
                <option value="Other">Other Outflow</option>
              </select>
            </div>

            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">Disbursement Amount (PKR) *</label>
              <input v-model.number="outForm.amount" type="number" required min="1" class="form-input font-bold text-red-400" />
            </div>

            <!-- Payment Method -->
            <div class="form-group">
              <label class="form-label">Payment Method *</label>
              <select v-model="outForm.paymentType" required class="form-select font-bold">
                <option value="Cash Payment">Cash Payment (Petty Cash / Counter)</option>
                <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
                <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                <option value="Cheque Disbursement">Cheque Disbursement</option>
              </select>
            </div>

            <!-- Branch -->
            <div class="form-group">
              <label class="form-label">Disbursing Branch *</label>
              <select v-model="outForm.branch" required class="form-select font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Office</option>
              </select>
            </div>

            <!-- Ref Invoice / Document # -->
            <div class="form-group">
              <label class="form-label">Ref Invoice / PO / Return #</label>
              <input v-model="outForm.refInvoiceNo" type="text" placeholder="e.g. RET-2026-001 or PO-2026-01" class="form-input font-mono" />
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Payment Out Reason / Remarks *</label>
            <textarea v-model="outForm.description" rows="2" placeholder="e.g. Full refund for returned ultrasound machine or freight clearance..." required class="form-textarea text-sm"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showPaymentOutModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-danger font-bold flex items-center gap-1.5">
              <Check :size="16" />
              <span>Issue Payment Out Voucher</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  DollarSign,
  Plus,
  Receipt,
  Building2,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Search,
  Eye,
  EyeOff
} from 'lucide-vue-next'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

const showCreateModal = ref(false)
const showPaymentOutModal = ref(false)

const activeView = ref('all') // 'all' | 'in' | 'out'
const filterBranch = ref('ALL')
const filterMethod = ref('ALL')
const searchQuery = ref('')

// Form for Payment In (Receipt)
const form = ref({
  customer: '',
  paymentType: 'Cash Payment',
  amount: 0,
  branch: 'Peshawar',
  description: ''
})

const selectedSerialCodes = ref([])

// Form for Payment Out (Disbursement)
const outForm = ref({
  payee: '',
  category: 'Customer Refund',
  paymentType: 'Cash Payment',
  amount: 0,
  branch: 'Peshawar',
  refInvoiceNo: '',
  description: ''
})

const customerList = computed(() => {
  const set = new Set()
  dataStore.salesInvoices.forEach(i => { if (i.customer) set.add(i.customer) })
  dataStore.serials.forEach(s => { if (s.customer) set.add(s.customer) })
  return Array.from(set)
})

const pendingMachinesForCustomer = computed(() => {
  if (!form.value.customer) return []
  const ledger = dataStore.getCustomerLedger(form.value.customer)
  return ledger ? ledger.pendingMachines : []
})

function fetchCustomerPendingMachines() {
  selectedSerialCodes.value = []
}

function autoFillAmount() {
  let total = 0
  selectedSerialCodes.value.forEach(code => {
    const s = dataStore.serials.find(x => x.serialCode === code)
    if (s) total += Number(s.salePrice || 0)
  })
  if (total > 0) {
    form.value.amount = total
  }
}

// Master Cash Flow list retrieved from store
const filteredCashFlowList = computed(() => {
  return dataStore.getCashFlowLedger(null, null, filterBranch.value, filterMethod.value, 'ALL')
})

const displayedList = computed(() => {
  let list = filteredCashFlowList.value

  // Direction filter
  if (activeView.value === 'in') {
    list = list.filter(item => item.direction === 'IN')
  } else if (activeView.value === 'out') {
    list = list.filter(item => item.direction === 'OUT')
  }

  // Text search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => 
      (item.partyName && item.partyName.toLowerCase().includes(q)) ||
      (item.voucherOrReceiptNo && item.voucherOrReceiptNo.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    )
  }

  return list
})

onMounted(() => {
  if (route.query.customer) {
    form.value.customer = route.query.customer
    showCreateModal.value = true
  }
})

async function submitPayment() {
  if (!form.value.customer || !form.value.amount) {
    uiStore.showModal('Input Error', 'Please select customer and enter valid payment amount.', 'warning')
    return
  }

  const allocatedSerials = selectedSerialCodes.value.map(code => {
    const s = dataStore.serials.find(x => x.serialCode === code)
    return {
      serialCode: code,
      machineCode: s ? s.machineCode : '',
      productName: s ? s.sku : '',
      amountAllocated: s ? s.salePrice : 0
    }
  })

  await dataStore.recordPaymentIn({
    ...form.value,
    allocatedSerials
  }, authStore.user)

  uiStore.showModal(
    'Payment In Recorded',
    `Successfully saved Payment In receipt and updated ${allocatedSerials.length} machine payment status(es) to Paid.`,
    'success'
  )

  showCreateModal.value = false
  form.value = { customer: '', paymentType: 'Cash Payment', amount: 0, branch: 'Peshawar', description: '' }
  selectedSerialCodes.value = []
}

async function submitPaymentOut() {
  if (!outForm.value.payee || !outForm.value.amount) {
    uiStore.showModal('Input Error', 'Please enter payee name and disbursement amount.', 'warning')
    return
  }

  const newVoucher = await dataStore.recordPaymentOut({
    ...outForm.value
  }, authStore.user)

  uiStore.showModal(
    'Payment Out Recorded',
    `Disbursement Voucher ${newVoucher.voucherNo} of PKR ${Number(outForm.value.amount).toLocaleString()} issued successfully.`,
    'success'
  )

  showPaymentOutModal.value = false
  outForm.value = { payee: '', category: 'Customer Refund', paymentType: 'Cash Payment', amount: 0, branch: 'Peshawar', refInvoiceNo: '', description: '' }
}
</script>

<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title + New Sale button
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Sales Invoices & Device Dispatch"
      subtitle="Issue medical equipment sales invoices with mandatory serial selection, internal machine code assignment, custom sales tax %, and HSN code tracking."
      :badges="[
        { label: 'MEDIMAGE OUTBOUND SALES', color: 'success' },
        { label: 'SERIAL & MACHINE CODE MANDATORY', color: 'info' }
      ]"
    >
      <template #actions>
        <div class="flex items-center gap-2 flex-wrap">
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-12 px-4 whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
            <Eye v-else :size="16" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
          </button>
          <button
            @click="openReturnModal()"
            class="btn btn-warning btn-lg shadow-xl text-white font-bold"
            style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;"
          >
            <RotateCcw :size="18" />
            <span>Process Product Return</span>
          </button>
          <button @click="showPOSModal = true" class="btn btn-success btn-lg shadow-xl">
            <ShoppingCart :size="18" />
            <span>New Sales Checkout</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      SALES PERIOD FILTER BAR & BALANCE SECURITY TOGGLE
    ════════════════════════════════════════════ -->
    <div class="date-filter-toolbar">
      <div class="filter-bar-flex">
        <DateFilterBar
          v-model="salesDateFilter"
          title="Sale Date Filter:"
          :no-margin="true"
        />
      </div>
      <button
        @click="authStore.toggleBalance()"
        :class="[
          'balance-toggle-action',
          authStore.isBalanceVisible ? 'is-visible-state' : 'is-hidden-state'
        ]"
        :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
      >
        <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
        <Eye v-else :size="16" />
        <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      KPI CARDS — Revenue + Profit Filtered by Date (Password Protected)
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Gross Revenue Invoiced"
        :value="formatBalance(salesMetrics.revenue)"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? `From ${salesMetrics.count} completed sales invoices`
          : `From ${salesMetrics.count} invoices (${salesFilterLabel})`"
        :badge="salesDateFilter.preset === 'All Time' ? 'TOTAL SALES' : `${salesMetrics.count} INVOICES`"
        badge-color="success"
        accent-class="kpi-success"
        value-color="text-emerald-400"
      />
      <KpiCard
        label="Gross Retained Profit"
        :value="formatBalance(salesMetrics.profit)"
        :subtitle="salesDateFilter.preset === 'All Time'
          ? 'Retained profit after equipment import COGS'
          : `Retained profit for ${salesFilterLabel}`"
        :badge="authStore.isBalanceVisible ? `${salesMetrics.marginPercent}% MARGIN` : '••% MARGIN'"
        badge-color="purple"
        accent-class="kpi-purple"
      />
    </div>

    <!-- ════════════════════════════════════════════
      SALES INVOICES TABLE
    ════════════════════════════════════════════ -->
    <GlassPanel>
      <!-- Table header + search + sort controls -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <SectionTitle title="Sales Invoices">
          <template #icon><FileText :size="20" class="text-emerald-400" /></template>
        </SectionTitle>

        <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <!-- Sort Controls -->
          <div class="sales-sort-wrapper">
            <ArrowUpDown :size="13" class="text-primary flex-shrink-0" />
            <span class="text-xs text-subtle font-semibold">Sort:</span>
            <select v-model="invoiceSortKey" class="sales-select">
              <option value="saleDate">Sale Date</option>
              <option value="grandTotal">Grand Total</option>
              <option value="invoiceNo">Invoice #</option>
              <option value="customer">Customer</option>
              <option value="branch">Branch</option>
            </select>
          </div>

          <div class="sales-toggle-group">
            <button
              type="button"
              :class="['sales-toggle-btn', invoiceSortOrder === 'asc' ? 'active' : '']"
              @click="invoiceSortOrder = 'asc'"
              title="Sort Ascending (Oldest Date / Low Total / A-Z)"
            >
              <ArrowUp :size="12" />
              <span>Asc</span>
            </button>
            <button
              type="button"
              :class="['sales-toggle-btn', invoiceSortOrder === 'desc' ? 'active' : '']"
              @click="invoiceSortOrder = 'desc'"
              title="Sort Descending (Newest Date / High Total / Z-A)"
            >
              <ArrowDown :size="12" />
              <span>Desc</span>
            </button>
          </div>

          <SearchInput v-model="invoiceSearchQuery" placeholder="Search customer, invoice #..." class="w-48" />
        </div>
      </div>

      <DataTable
        :columns="invoiceTableColumns"
        :sort-key="invoiceSortKey"
        :sort-order="invoiceSortOrder"
        @sort="handleInvoiceSort"
        :empty="filteredInvoices.length === 0"
        empty-message="No matching sales invoices found for selected filter."
      >
        <tr v-for="inv in filteredInvoices" :key="inv.invoiceNo">
          <td class="font-mono font-bold text-blue-400">{{ inv.invoiceNo }}</td>
          <td class="font-mono text-xs text-subtle">{{ inv.saleDate }}</td>
          <td class="font-bold text-main">{{ inv.customer }}</td>
          <td>
            <StatBadge color="purple">
              <Building2 :size="10" />
              {{ inv.branch || 'Peshawar' }}
            </StatBadge>
          </td>
          <td>
            <div v-for="item in inv.items" :key="item.productName" class="text-xs py-0.5">
              <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
              <div class="text-[11px] text-slate-400 font-mono">
                Serials: {{ item.serials?.join(', ') }} | Codes: {{ item.machineCodes?.join(', ') }}
              </div>
            </div>
          </td>
          <td class="font-mono text-indigo-300 font-bold">{{ inv.taxRatio || 18 }}%</td>
          <td class="font-bold text-emerald-400">{{ formatBalance(inv.grandTotal) }}</td>
          <td>
            <StatBadge :color="inv.paymentMethod === 'Cash Payment' ? 'warning' : 'info'">
              {{ inv.paymentMethod }}
            </StatBadge>
          </td>
          <td>
            <button
              @click="openReturnModal(inv)"
              class="btn btn-xs btn-outline border-amber-500/50 text-amber-400 hover:bg-amber-500/20 flex items-center gap-1"
              title="Process product return for this invoice"
            >
              <RotateCcw :size="12" />
              <span>Return</span>
            </button>
          </td>
        </tr>
      </DataTable>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      POS MODAL — Create new sales invoice
    ════════════════════════════════════════════ -->
    <div v-if="showPOSModal" class="modal-backdrop" @click.self="showPOSModal = false">
      <div class="modal-content max-w-3xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart :size="20" class="text-emerald-400" />
            <span>Issue New Medical Equipment Sale Invoice</span>
          </h3>
          <button @click="showPOSModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleProcessSale" class="modal-body space-y-4">

          <!-- Row 1: Customer + Branch -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Customer / Hospital Name" input-id="customer" :required="true" class="sm:col-span-2">
              <input id="customer" v-model="posForm.customer" type="text"
                placeholder="Northwest General Hospital Peshawar / Clinic..." class="form-input font-bold" required />
            </FormField>

            <FormField label="Sale Branch" input-id="branch" :required="true">
              <SelectInput id="branch" v-model="posForm.branch"
                :options="['Peshawar', 'Multan', 'Lahore']" class="font-bold" />
            </FormField>
          </div>

          <!-- Row 2: Payment method + Tax -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Payment Method" input-id="paymentMethod" :required="true">
              <SelectInput id="paymentMethod" v-model="posForm.paymentMethod"
                :options="[
                  { value: 'Cash Payment',              label: 'Cash Payment (Full Immediate Cash)' },
                  { value: 'Bank Transfer (HBL)',        label: 'Bank Transfer (HBL)' },
                  { value: 'Bank Transfer (Meezan Bank)',label: 'Bank Transfer (Meezan Bank)' },
                  { value: 'Credit Terms / Pending',     label: 'Credit Terms (Machine-Wise Pending Payment)' }
                ]"
                class="font-bold"
              />
            </FormField>

            <FormField label="Custom Sales Tax Ratio (%)" input-id="taxRatio">
              <input id="taxRatio" v-model.number="posForm.taxRatio" type="number" step="0.1" class="form-input font-bold" />
            </FormField>
          </div>

          <!-- Product Picker + Serial Selection -->
          <GlassPanel extra-class="p-4 space-y-3">
            <div class="font-bold text-white text-sm flex items-center justify-between">
              <span>Select Equipment Product & Serials</span>
              <span class="text-xs text-subtle font-normal">Mandatory Serial Selection</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Equipment Product SKU" input-id="productPicker" :required="true">
                <select id="productPicker" v-model="selectedCartProductId" @change="cartSelectedSerials = []" class="form-select font-bold">
                  <option value="" disabled>Choose Product SKU...</option>
                  <option v-for="p in availableProducts" :key="p.id" :value="p.id">
                    {{ p.name }} (Stock: {{ p.stockQty }})
                  </option>
                </select>
              </FormField>

              <FormField v-if="selectedCartProductId" label="Select Machines (Serial / Machine Code)" input-id="serialPicker" :required="true">
                <div class="max-h-32 overflow-y-auto glass-panel p-2 space-y-1">
                  <div v-for="s in availableSerialsForSelectedProduct" :key="s.serialCode" class="flex items-center gap-2 text-xs">
                    <input type="checkbox" :value="s.serialCode" v-model="cartSelectedSerials"
                      class="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500" />
                    <span class="font-mono font-bold text-white">{{ (s.serialCode || '').replace(/^SN-/i, '') }}</span>
                    <span class="font-mono text-purple-400 font-bold">({{ s.machineCode }})</span>
                  </div>
                  <div v-if="availableSerialsForSelectedProduct.length === 0" class="text-xs text-subtle italic">
                    No available serials in stock for this product.
                  </div>
                </div>
              </FormField>
            </div>

            <button type="button" @click="addCartItem" class="btn btn-primary btn-sm w-full">
              <Plus :size="14" />
              <span>+ Add Selected Machines to Cart</span>
            </button>
          </GlassPanel>

          <!-- Cart Line Items -->
          <DataTable
            v-if="cartItems.length > 0"
            :columns="['Product', 'Qty', 'Machine Serials / Codes', 'Unit Price', 'Total', 'Action']"
          >
            <tr v-for="(ci, idx) in cartItems" :key="ci.productId">
              <td class="font-bold text-white">{{ ci.productName }}</td>
              <td class="font-mono">{{ ci.qty }}</td>
              <td class="font-mono text-xs text-purple-400 font-bold">{{ ci.serials.join(', ') }}</td>
              <td class="font-mono">PKR {{ (ci.sellingPrice || 0).toLocaleString() }}</td>
              <td class="font-bold text-emerald-400">PKR {{ ((ci.qty || 0) * (ci.sellingPrice || 0)).toLocaleString() }}</td>
              <td>
                <button type="button" @click="cartItems.splice(idx, 1)" class="btn btn-sm btn-ghost text-red-400">Remove</button>
              </td>
            </tr>
          </DataTable>

          <!-- Grand Total Banner -->
          <GlassPanel extra-class="p-4 flex justify-between items-center">
            <div>
              <div class="text-xs text-subtle">
                Subtotal: PKR {{ (cartSubtotal || 0).toLocaleString() }} | Tax ({{ posForm.taxRatio }}%): PKR {{ (cartTax || 0).toLocaleString() }}
              </div>
              <div class="text-xl font-extrabold text-white">Grand Total: PKR {{ (cartGrandTotal || 0).toLocaleString() }}</div>
            </div>
            <StatBadge color="success" :mono="true">TAX INCLUDED</StatBadge>
          </GlassPanel>

          <!-- Modal Action Buttons -->
          <div class="modal-footer">
            <button type="button" @click="showPOSModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success">
              <Check :size="16" />
              <span>Complete Sale & Issue Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      SALES RETURN MODAL — Return Product & Restock
    ════════════════════════════════════════════ -->
    <div v-if="showReturnModal" class="modal-backdrop" @click.self="showReturnModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <RotateCcw :size="20" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">Process Equipment Return</h3>
              <p class="text-xs text-slate-400">Return ID will be issued as a distinct Return Invoice (<span class="text-amber-400 font-mono font-bold">{{ previewReturnNo }}</span>)</p>
            </div>
          </div>
          <button @click="showReturnModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleProcessReturn" class="modal-body space-y-4">
          <!-- Select Origin Invoice -->
          <FormField label="Origin Sales Invoice" input-id="retInvoice">
            <select id="retInvoice" v-model="returnForm.invoiceNo" @change="onReturnInvoiceSelect" class="form-select font-bold">
              <option value="">Direct Return (No Specific Invoice)</option>
              <option v-for="inv in dataStore.salesInvoices" :key="inv.invoiceNo" :value="inv.invoiceNo">
                {{ inv.invoiceNo }} — {{ inv.customer }} (PKR {{ (inv.grandTotal || 0).toLocaleString() }})
              </option>
            </select>
          </FormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer Name" input-id="retCustomer" :required="true">
              <input id="retCustomer" v-model="returnForm.customer" type="text" class="form-input font-bold" required />
            </FormField>

            <FormField label="Branch" input-id="retBranch" :required="true">
              <SelectInput id="retBranch" v-model="returnForm.branch" :options="['Peshawar', 'Multan', 'Lahore']" class="font-bold" />
            </FormField>
          </div>

          <!-- Serials / Machines to Return -->
          <GlassPanel extra-class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-white">Select Machines to Return</span>
              <span class="text-xs text-amber-400 font-medium">Restocks to Available</span>
            </div>

            <div v-if="eligibleReturnSerials.length > 0" class="max-h-40 overflow-y-auto space-y-1.5">
              <label
                v-for="s in eligibleReturnSerials"
                :key="s.serialCode"
                class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-700/50 hover:border-amber-500/50 cursor-pointer text-xs"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="s.serialCode"
                    v-model="returnForm.selectedSerials"
                    @change="calculateReturnRefund"
                    class="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
                  <span class="font-mono text-purple-400">({{ s.machineCode }})</span>
                  <span class="text-slate-300">{{ s.productName || s.sku }}</span>
                </div>
                <span class="font-mono text-emerald-400 font-bold">PKR {{ (s.salePrice || 0).toLocaleString() }}</span>
              </label>
            </div>
            <div v-else class="text-xs text-subtle italic p-2">
              No sold machine units found for this customer/invoice. Enter manual serial if needed below.
            </div>

            <div v-if="eligibleReturnSerials.length === 0" class="mt-2">
              <label class="text-xs text-slate-400 block mb-1">Manual Serial Code (Optional)</label>
              <input v-model="returnForm.manualSerial" placeholder="e.g. US10-8803" class="form-input text-xs" />
            </div>
          </GlassPanel>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Refund Amount (PKR)" input-id="retRefund">
              <input id="retRefund" v-model.number="returnForm.refundAmount" type="number" class="form-input font-bold text-emerald-400" />
            </FormField>

            <FormField label="Return Reason" input-id="retReason">
              <input id="retReason" v-model="returnForm.reason" placeholder="e.g. Clinical exchange / Customer cancellation" class="form-input" />
            </FormField>
          </div>

          <!-- Refund Payout Option -->
          <GlassPanel extra-class="p-3 flex items-center justify-between">
            <div>
              <div class="text-sm font-bold text-white">Disburse Refund Voucher (Payment Out)</div>
              <div class="text-xs text-subtle">Immediately records an outflow voucher in Payment Out / Cash Flow</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="returnForm.payoutRefund" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </GlassPanel>

          <FormField v-if="returnForm.payoutRefund" label="Refund Payment Method" input-id="retPayMethod">
            <SelectInput id="retPayMethod" v-model="returnForm.paymentMethod" :options="['Cash Payment', 'Bank Transfer (HBL)', 'Bank Transfer (Meezan Bank)']" class="font-bold" />
          </FormField>

          <div class="modal-footer">
            <button type="button" @click="showReturnModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-warning text-white font-bold flex items-center gap-1.5">
              <RotateCcw :size="16" />
              <span>Confirm Return & Restock Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
// ──────────────────────────────────────────────────────────────
//  SalesView — Sales Invoices & POS Checkout
//  Uses reusable components from:
//    src/components/ui/    → PageHeader, KpiCard, GlassPanel, SectionTitle, StatBadge, DataTable
//    src/components/forms/ → FormField, SelectInput, SearchInput
// ──────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

// Reusable UI components
import PageHeader   from '@/components/ui/PageHeader.vue'
import KpiCard      from '@/components/ui/KpiCard.vue'
import GlassPanel   from '@/components/ui/GlassPanel.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import StatBadge    from '@/components/ui/StatBadge.vue'
import DataTable    from '@/components/ui/DataTable.vue'
import DateFilterBar from '@/components/ui/DateFilterBar.vue'

// Reusable form components
import FormField    from '@/components/forms/FormField.vue'
import SelectInput  from '@/components/forms/SelectInput.vue'
import SearchInput  from '@/components/forms/SearchInput.vue'

// Lucide icons
import {
  ShoppingCart,
  FileText,
  Building2,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-vue-next'

// ── Stores ────────────────────────────────────────────────────
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore   = useUiStore()

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

// ── Modal & search state ──────────────────────────────────────
const showPOSModal       = ref(false)
const invoiceSearchQuery = ref('')

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

// ── Invoices Sorting & Columns ────────────────────────────────
const invoiceSortKey = ref('saleDate')
const invoiceSortOrder = ref('desc') // 'asc' | 'desc'

const invoiceTableColumns = [
  { label: 'Invoice #', key: 'invoiceNo', sortable: true },
  { label: 'Date', key: 'saleDate', sortable: true },
  { label: 'Customer', key: 'customer', sortable: true },
  { label: 'Branch', key: 'branch', sortable: true },
  { label: 'Equipment & Serial / Machine Codes', key: 'items', sortable: false },
  { label: 'Tax %', key: 'taxRatio', sortable: true },
  { label: 'Grand Total', key: 'grandTotal', sortable: true },
  { label: 'Payment Method', key: 'paymentMethod', sortable: false },
  { label: 'Action', key: 'action', sortable: false }
]

function handleInvoiceSort(key) {
  if (invoiceSortKey.value === key) {
    invoiceSortOrder.value = invoiceSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    invoiceSortKey.value = key
    invoiceSortOrder.value = 'asc'
  }
}

// ── POS form state ────────────────────────────────────────────
const posForm = ref({
  customer:      '',
  branch:        'Peshawar',
  paymentMethod: 'Cash Payment',
  taxRatio:      18
})

// ── Cart state ────────────────────────────────────────────────
const selectedCartProductId   = ref('')
const cartSelectedSerials     = ref([])
const cartItems               = ref([])

// ── Computed: filtered options ────────────────────────────────
const availableProducts = computed(() => dataStore.products.filter(p => p.stockQty > 0))

const availableSerialsForSelectedProduct = computed(() => {
  if (!selectedCartProductId.value) return []
  return dataStore.serials.filter(s => s.productId === selectedCartProductId.value && s.status === 'Available')
})

const filteredInvoices = computed(() => {
  let list = dataStore.salesInvoices

  // Date range filter
  if (salesDateFilter.value.preset !== 'All Time') {
    const sDate = salesDateFilter.value.startDate
    const eDate = salesDateFilter.value.endDate
    if (sDate && eDate) {
      list = list.filter(i => {
        const d = (i.saleDate || '').substring(0, 10)
        return d >= sDate && d <= eDate
      })
    } else if (sDate) {
      list = list.filter(i => (i.saleDate || '').substring(0, 10) >= sDate)
    } else if (eDate) {
      list = list.filter(i => (i.saleDate || '').substring(0, 10) <= eDate)
    }
  }

  // Search query filter
  const q = invoiceSearchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(i =>
      (i.invoiceNo || '').toLowerCase().includes(q) ||
      (i.customer || '').toLowerCase().includes(q) ||
      (i.branch || '').toLowerCase().includes(q)
    )
  }

  // Ascending / Descending sorting
  list = [...list].sort((a, b) => {
    let aVal = a[invoiceSortKey.value]
    let bVal = b[invoiceSortKey.value]

    if (invoiceSortKey.value === 'grandTotal') {
      aVal = Number(a.grandTotal || 0)
      bVal = Number(b.grandTotal || 0)
    } else if (invoiceSortKey.value === 'taxRatio') {
      aVal = Number(a.taxRatio || 0)
      bVal = Number(b.taxRatio || 0)
    } else if (invoiceSortKey.value === 'saleDate') {
      aVal = a.saleDate || ''
      bVal = b.saleDate || ''
      return invoiceSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase()
      bVal = (bVal || '').toLowerCase()
      return invoiceSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return invoiceSortOrder.value === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
  })

  return list
})

// ── Cart totals ───────────────────────────────────────────────
const cartSubtotal   = computed(() => cartItems.value.reduce((acc, i) => acc + (i.qty * i.sellingPrice), 0))
const cartTax        = computed(() => cartSubtotal.value * ((posForm.value.taxRatio || 0) / 100))
const cartGrandTotal = computed(() => cartSubtotal.value + cartTax.value)

// ── Add item to cart ──────────────────────────────────────────
function addCartItem() {
  if (!selectedCartProductId.value) {
    uiStore.showModal('Selection Required', 'Please select an Equipment Product SKU first.', 'warning')
    return
  }
  if (cartSelectedSerials.value.length === 0) {
    const avail = availableSerialsForSelectedProduct.value
    if (avail.length > 0) {
      cartSelectedSerials.value = [avail[0].serialCode]
    } else {
      uiStore.showModal('Selection Required', 'No available machine serial numbers found in stock.', 'warning')
      return
    }
  }
  const prod = dataStore.products.find(p => p.id === selectedCartProductId.value)
  if (!prod) return
  const machineCodes = cartSelectedSerials.value.map(sCode => {
    const s = dataStore.serials.find(x => x.serialCode === sCode)
    return s ? s.machineCode : ''
  })
  cartItems.value.push({
    productId:    prod.id,
    productName:  prod.name,
    sku:          prod.sku,
    costPrice:    prod.costPrice || 0,
    sellingPrice: prod.sellingPrice || prod.salePrice || 0,
    qty:          cartSelectedSerials.value.length,
    serials:      [...cartSelectedSerials.value],
    machineCodes
  })
  selectedCartProductId.value = ''
  cartSelectedSerials.value   = []
}

// ── Process sale & issue invoice ──────────────────────────────
async function handleProcessSale() {
  if (cartItems.value.length === 0 && selectedCartProductId.value) addCartItem()

  if (!posForm.value.customer) {
    uiStore.showModal('Checkout Error', 'Please enter Customer / Hospital Name.', 'warning')
    return
  }
  if (cartItems.value.length === 0) {
    uiStore.showModal('Checkout Error', 'Please select an equipment product and machine serial.', 'warning')
    return
  }

  await dataStore.createSalesInvoice({
    customer:      posForm.value.customer,
    branch:        posForm.value.branch,
    paymentMethod: posForm.value.paymentMethod,
    taxRatio:      posForm.value.taxRatio,
    subtotal:      cartSubtotal.value,
    taxAmount:     cartTax.value,
    grandTotal:    cartGrandTotal.value,
    items:         cartItems.value
  }, authStore.user)

  uiStore.showModal('Invoice Issued', `Successfully created Sales Invoice for ${posForm.value.customer}. Serial numbers & machine codes marked as Sold.`, 'success')

  // Reset form and cart
  showPOSModal.value = false
  cartItems.value    = []
  posForm.value      = { customer: '', branch: 'Peshawar', paymentMethod: 'Cash Payment', taxRatio: 18 }
}

// ── Return State & Methods ────────────────────────────────────
const showReturnModal = ref(false)
const returnForm = ref({
  invoiceNo: '',
  customer: '',
  branch: 'Peshawar',
  selectedSerials: [],
  manualSerial: '',
  refundAmount: 0,
  payoutRefund: true,
  paymentMethod: 'Cash Payment',
  reason: 'Customer Equipment Return'
})

const previewReturnNo = computed(() => {
  return `RET-2026-${String((dataStore.salesReturns?.length || 0) + 1).padStart(3, '0')}`
})

const eligibleReturnSerials = computed(() => {
  const cName = returnForm.value.customer?.trim().toLowerCase()
  const invNo = returnForm.value.invoiceNo?.trim()

  return dataStore.serials.filter(s => {
    if (s.status !== 'Sold') return false
    if (invNo && s.invoiceNo === invNo) return true
    if (cName && s.customer && s.customer.trim().toLowerCase() === cName) return true
    return false
  })
})

function openReturnModal(inv = null) {
  if (inv) {
    returnForm.value.invoiceNo = inv.invoiceNo
    returnForm.value.customer = inv.customer
    returnForm.value.branch = inv.branch || 'Peshawar'
    const invSerials = []
    inv.items?.forEach(it => {
      if (it.serials) invSerials.push(...it.serials)
    })
    returnForm.value.selectedSerials = invSerials
    returnForm.value.refundAmount = inv.grandTotal || 0
  } else {
    returnForm.value.invoiceNo = ''
    returnForm.value.customer = ''
    returnForm.value.branch = 'Peshawar'
    returnForm.value.selectedSerials = []
    returnForm.value.refundAmount = 0
  }
  returnForm.value.payoutRefund = true
  returnForm.value.reason = 'Customer Equipment Return'
  showReturnModal.value = true
}

function onReturnInvoiceSelect() {
  const inv = dataStore.salesInvoices.find(i => i.invoiceNo === returnForm.value.invoiceNo)
  if (inv) {
    returnForm.value.customer = inv.customer
    returnForm.value.branch = inv.branch || 'Peshawar'
    const invSerials = []
    inv.items?.forEach(it => {
      if (it.serials) invSerials.push(...it.serials)
    })
    returnForm.value.selectedSerials = invSerials
    returnForm.value.refundAmount = inv.grandTotal || 0
  } else {
    returnForm.value.selectedSerials = []
    returnForm.value.refundAmount = 0
  }
}

function calculateReturnRefund() {
  let total = 0
  returnForm.value.selectedSerials.forEach(sCode => {
    const s = dataStore.serials.find(x => x.serialCode === sCode)
    if (s) total += Number(s.salePrice || 0)
  })
  if (total > 0) returnForm.value.refundAmount = total
}

async function handleProcessReturn() {
  if (!returnForm.value.customer) {
    uiStore.showModal('Validation Error', 'Please specify a customer name.', 'warning')
    return
  }

  const serialsToReturn = [...returnForm.value.selectedSerials]
  if (serialsToReturn.length === 0 && returnForm.value.manualSerial) {
    serialsToReturn.push(returnForm.value.manualSerial.trim())
  }

  if (serialsToReturn.length === 0) {
    uiStore.showModal('Validation Error', 'Please select or enter at least one machine serial to return.', 'warning')
    return
  }

  const resReturn = await dataStore.processSalesReturn({
    invoiceNo: returnForm.value.invoiceNo || 'DIRECT-RET',
    customer: returnForm.value.customer,
    branch: returnForm.value.branch,
    serials: serialsToReturn.map(s => ({
      serialCode: s,
      refundAmount: returnForm.value.refundAmount / serialsToReturn.length
    })),
    totalRefundAmount: returnForm.value.refundAmount,
    reason: returnForm.value.reason,
    payoutRefund: returnForm.value.payoutRefund,
    paymentMethod: returnForm.value.paymentMethod
  }, authStore.user)

  uiStore.showModal(
    'Return Processed Successfully',
    `Return Invoice ${resReturn.returnNo} has been generated. ${serialsToReturn.length} machine unit(s) restocked to Available status in inventory.`,
    'success'
  )

  showReturnModal.value = false
}
</script>

<style scoped>
.sales-sort-wrapper {
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

.sales-sort-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.sales-select {
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

.sales-toggle-group {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.sales-toggle-btn {
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

.sales-toggle-btn:hover {
  color: var(--text-main);
}

.sales-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .sales-sort-wrapper,
[data-theme="light"] .sales-toggle-group {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

[data-theme="light"] .sales-select {
  color: #0f172a !important;
}

[data-theme="light"] .sales-toggle-btn {
  color: #475569;
}

[data-theme="light"] .sales-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
}
</style>

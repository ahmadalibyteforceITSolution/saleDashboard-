<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-success font-mono">MEDIMAGE OUTBOUND SALES</span>
          <span class="badge badge-info font-mono">SERIAL & MACHINE CODE MANDATORY</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Sales Invoices & Device Dispatch</h1>
        <p class="text-slate-300 text-sm mt-1">
          Issue medical equipment sales invoices with mandatory serial selection, internal machine code assignment, custom sales tax %, and HSN code tracking.
        </p>
      </div>

      <button @click="showPOSModal = true" class="btn btn-success btn-lg shadow-xl">
        <ShoppingCart :size="18" />
        <span>New Sales Checkout</span>
      </button>
    </div>

    <!-- Sales KPI Overview -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-success glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Gross Revenue Invoiced</span>
          <span class="badge badge-success font-mono">TOTAL SALES</span>
        </div>
        <div class="kpi-value text-emerald-400 mt-2">PKR {{ (dataStore.totalRevenue || 0).toLocaleString() }}</div>
        <div class="kpi-subtitle text-subtle">From {{ dataStore.salesInvoices.length }} completed sales invoices</div>
      </div>

      <div class="kpi-card kpi-purple glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Gross Retained Profit</span>
          <span class="badge badge-purple font-mono">{{ dataStore.profitMarginPercent }}% MARGIN</span>
        </div>
        <div class="kpi-value text-white mt-2">PKR {{ (dataStore.grossProfit || 0).toLocaleString() }}</div>
        <div class="kpi-subtitle text-subtle">Retained profit after equipment import COGS</div>
      </div>
    </div>

    <!-- Sales Invoices Table -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <FileText :size="20" class="text-emerald-400" />
          <span>Sales Invoices</span>
        </h3>
        <div class="relative w-full sm:w-72">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="invoiceSearchQuery" type="text" placeholder="Search customer, invoice #..." class="form-input pl-10 text-sm" />
        </div>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Branch</th>
              <th>Equipment & Serial / Machine Codes</th>
              <th>Tax %</th>
              <th>Grand Total</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredInvoices" :key="inv.invoiceNo">
              <td class="font-mono font-bold text-blue-400">{{ inv.invoiceNo }}</td>
              <td class="font-mono text-xs text-subtle">{{ inv.saleDate }}</td>
              <td class="font-bold text-main">{{ inv.customer }}</td>
              <td>
                <span class="badge badge-purple">
                  <Building2 :size="10" />
                  {{ inv.branch || 'Peshawar' }}
                </span>
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
              <td class="font-bold text-emerald-400">PKR {{ (inv.grandTotal || 0).toLocaleString() }}</td>
              <td>
                <span :class="['badge', inv.paymentMethod === 'Cash Payment' ? 'badge-warning' : 'badge-info']">
                  {{ inv.paymentMethod }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="8" class="p-6 text-center text-subtle italic">No matching sales invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Sales Invoice POS Modal -->
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
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2 form-group">
              <label class="form-label">Customer / Hospital Name *</label>
              <input v-model="posForm.customer" type="text" placeholder="Northwest General Hospital Peshawar / Clinic..." class="form-input font-bold" required />
            </div>

            <div class="form-group">
              <label class="form-label">Sale Branch *</label>
              <select v-model="posForm.branch" required class="form-select font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Payment Method *</label>
              <select v-model="posForm.paymentMethod" required class="form-select font-bold">
                <option value="Cash Payment">Cash Payment (Full Immediate Cash)</option>
                <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
                <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                <option value="Credit Terms / Pending">Credit Terms (Machine-Wise Pending Payment)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Custom Sales Tax Ratio (%)</label>
              <input v-model.number="posForm.taxRatio" type="number" step="0.1" class="form-input font-bold" />
            </div>
          </div>

          <!-- Product Picker & Mandatory Serial Selection -->
          <div class="glass-panel p-4 space-y-3">
            <div class="font-bold text-white text-sm flex items-center justify-between">
              <span>Select Equipment Product & Serials</span>
              <span class="text-xs text-subtle font-normal">Mandatory Serial Selection</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Equipment Product SKU *</label>
                <select v-model="selectedCartProductId" @change="cartSelectedSerials = []" class="form-select font-bold">
                  <option value="" disabled>Choose Product SKU...</option>
                  <option v-for="p in availableProducts" :key="p.id" :value="p.id">
                    {{ p.name }} (Stock: {{ p.stockQty }})
                  </option>
                </select>
              </div>

              <!-- Available Serials for Selected Product -->
              <div v-if="selectedCartProductId" class="form-group">
                <label class="form-label">Select Machines (Serial / Machine Code) *</label>
                <div class="max-h-32 overflow-y-auto glass-panel p-2 space-y-1">
                  <div v-for="s in availableSerialsForSelectedProduct" :key="s.serialCode" class="flex items-center gap-2 text-xs">
                    <input type="checkbox" :value="s.serialCode" v-model="cartSelectedSerials" class="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500" />
                    <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
                    <span class="font-mono text-purple-400 font-bold">({{ s.machineCode }})</span>
                  </div>
                  <div v-if="availableSerialsForSelectedProduct.length === 0" class="text-xs text-subtle italic">
                    No available serials in stock for this product.
                  </div>
                </div>
              </div>
            </div>

            <button type="button" @click="addCartItem" class="btn btn-primary btn-sm w-full">
              <Plus :size="14" />
              <span>+ Add Selected Machines to Cart</span>
            </button>
          </div>

          <!-- Cart Line Items -->
          <div v-if="cartItems.length > 0" class="table-container">
            <table class="table-lined">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Machine Serials / Codes</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(ci, idx) in cartItems" :key="ci.productId">
                  <td class="font-bold text-white">{{ ci.productName }}</td>
                  <td class="font-mono">{{ ci.qty }}</td>
                  <td class="font-mono text-xs text-purple-400 font-bold">
                    {{ ci.serials.join(', ') }}
                  </td>
                  <td class="font-mono">PKR {{ (ci.sellingPrice || 0).toLocaleString() }}</td>
                  <td class="font-bold text-emerald-400">PKR {{ ((ci.qty || 0) * (ci.sellingPrice || 0)).toLocaleString() }}</td>
                  <td>
                    <button type="button" @click="cartItems.splice(idx, 1)" class="btn btn-sm btn-ghost text-red-400">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Calculation Banner -->
          <div class="glass-panel p-4 flex justify-between items-center">
            <div>
              <div class="text-xs text-subtle">Subtotal: PKR {{ (cartSubtotal || 0).toLocaleString() }} | Tax ({{ posForm.taxRatio }}%): PKR {{ (cartTax || 0).toLocaleString() }}</div>
              <div class="text-xl font-extrabold text-white">Grand Total: PKR {{ (cartGrandTotal || 0).toLocaleString() }}</div>
            </div>
            <span class="badge badge-success font-mono">TAX INCLUDED</span>
          </div>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  ShoppingCart,
  FileText,
  Search,
  Building2,
  Plus,
  Check
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const showPOSModal = ref(false)
const invoiceSearchQuery = ref('')

const posForm = ref({
  customer: '',
  branch: 'Peshawar',
  paymentMethod: 'Cash Payment',
  taxRatio: 18
})

const selectedCartProductId = ref('')
const cartSelectedSerials = ref([])
const cartItems = ref([])

const availableProducts = computed(() => {
  return dataStore.products.filter(p => p.stockQty > 0)
})

const availableSerialsForSelectedProduct = computed(() => {
  if (!selectedCartProductId.value) return []
  return dataStore.serials.filter(s => s.productId === selectedCartProductId.value && s.status === 'Available')
})

const filteredInvoices = computed(() => {
  const q = invoiceSearchQuery.value.toLowerCase().trim()
  if (!q) return dataStore.salesInvoices
  return dataStore.salesInvoices.filter(i => 
    i.invoiceNo.toLowerCase().includes(q) ||
    i.customer.toLowerCase().includes(q)
  )
})

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
      uiStore.showModal('Selection Required', 'No available machine serial numbers found in stock for this product.', 'warning')
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
    productId: prod.id,
    productName: prod.name,
    sku: prod.sku,
    costPrice: prod.costPrice || 0,
    sellingPrice: prod.sellingPrice || prod.salePrice || 0,
    qty: cartSelectedSerials.value.length,
    serials: [...cartSelectedSerials.value],
    machineCodes
  })

  selectedCartProductId.value = ''
  cartSelectedSerials.value = []
}

const cartSubtotal = computed(() => cartItems.value.reduce((acc, i) => acc + (i.qty * i.sellingPrice), 0))
const cartTax = computed(() => cartSubtotal.value * ((posForm.value.taxRatio || 0) / 100))
const cartGrandTotal = computed(() => cartSubtotal.value + cartTax.value)

async function handleProcessSale() {
  // If cart is empty but user selected a product or serials, auto-add them!
  if (cartItems.value.length === 0 && selectedCartProductId.value) {
    addCartItem()
  }

  if (!posForm.value.customer) {
    uiStore.showModal('Checkout Error', 'Please enter Customer / Hospital Name.', 'warning')
    return
  }

  if (cartItems.value.length === 0) {
    uiStore.showModal('Checkout Error', 'Please select an equipment product and machine serial to add to the cart.', 'warning')
    return
  }

  const invoiceData = {
    customer: posForm.value.customer,
    branch: posForm.value.branch,
    paymentMethod: posForm.value.paymentMethod,
    taxRatio: posForm.value.taxRatio,
    subtotal: cartSubtotal.value,
    taxAmount: cartTax.value,
    grandTotal: cartGrandTotal.value,
    items: cartItems.value
  }

  await dataStore.createSalesInvoice(invoiceData, authStore.user)

  uiStore.showModal(
    'Invoice Issued',
    `Successfully created Sales Invoice for ${posForm.value.customer}. Serial numbers & machine codes marked as Sold.`,
    'success'
  )

  showPOSModal.value = false
  cartItems.value = []
  posForm.value = { customer: '', branch: 'Peshawar', paymentMethod: 'Cash Payment', taxRatio: 18 }
}
</script>

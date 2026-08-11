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
        <button @click="showPOSModal = true" class="btn btn-success btn-lg shadow-xl">
          <ShoppingCart :size="18" />
          <span>New Sales Checkout</span>
        </button>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      KPI CARDS — Revenue + Profit
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        label="Gross Revenue Invoiced"
        :value="`PKR ${(dataStore.totalRevenue || 0).toLocaleString()}`"
        :subtitle="`From ${dataStore.salesInvoices.length} completed sales invoices`"
        badge="TOTAL SALES"
        badge-color="success"
        accent-class="kpi-success"
        value-color="text-emerald-400"
      />
      <KpiCard
        label="Gross Retained Profit"
        :value="`PKR ${(dataStore.grossProfit || 0).toLocaleString()}`"
        subtitle="Retained profit after equipment import COGS"
        :badge="`${dataStore.profitMarginPercent}% MARGIN`"
        badge-color="purple"
        accent-class="kpi-purple"
      />
    </div>

    <!-- ════════════════════════════════════════════
      SALES INVOICES TABLE
    ════════════════════════════════════════════ -->
    <GlassPanel>
      <!-- Table header + search -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionTitle title="Sales Invoices">
          <template #icon><FileText :size="20" class="text-emerald-400" /></template>
        </SectionTitle>
        <SearchInput v-model="invoiceSearchQuery" placeholder="Search customer, invoice #..." />
      </div>

      <DataTable
        :columns="['Invoice #', 'Date', 'Customer', 'Branch', 'Equipment & Serial / Machine Codes', 'Tax %', 'Grand Total', 'Payment Method']"
        :empty="filteredInvoices.length === 0"
        empty-message="No matching sales invoices found."
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
          <td class="font-bold text-emerald-400">PKR {{ (inv.grandTotal || 0).toLocaleString() }}</td>
          <td>
            <StatBadge :color="inv.paymentMethod === 'Cash Payment' ? 'warning' : 'info'">
              {{ inv.paymentMethod }}
            </StatBadge>
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
                    <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
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

// Reusable form components
import FormField    from '@/components/forms/FormField.vue'
import SelectInput  from '@/components/forms/SelectInput.vue'
import SearchInput  from '@/components/forms/SearchInput.vue'

// Lucide icons
import { ShoppingCart, FileText, Building2, Plus, Check } from 'lucide-vue-next'

// ── Stores ────────────────────────────────────────────────────
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore   = useUiStore()

// ── Modal & search state ──────────────────────────────────────
const showPOSModal       = ref(false)
const invoiceSearchQuery = ref('')

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
  const q = invoiceSearchQuery.value.toLowerCase().trim()
  if (!q) return dataStore.salesInvoices
  return dataStore.salesInvoices.filter(i =>
    i.invoiceNo.toLowerCase().includes(q) ||
    i.customer.toLowerCase().includes(q)
  )
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
</script>

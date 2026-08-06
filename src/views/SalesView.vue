<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <ShoppingCart :size="24" class="text-success" />
          <h1 class="page-title">Sales Invoices & POS Outbound</h1>
        </div>
        <p class="page-subtitle">Dataset filtering (City, Category, Price), POS order checkout, serial allocation, and invoice generation</p>
      </div>

      <div class="action-buttons">
        <button class="btn btn-success btn-lg" @click="showPOSModal = true">
          <CreditCard :size="18" />
          <span>New Sales Checkout</span>
        </button>
      </div>
    </div>

    <!-- Sales KPI Overview -->
    <div class="kpi-grid mb-4">
      <div class="glass-card kpi-card kpi-success">
        <div class="flex-between">
          <span class="kpi-title">Gross Revenue Invoiced</span>
          <span class="badge badge-success">+18% YTD</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>From {{ dataStore.salesInvoices.length }} completed invoices</span>
        </div>
      </div>

      <div class="glass-card kpi-card kpi-purple">
        <div class="flex-between">
          <span class="kpi-title">Net Profit Margin</span>
          <span class="badge badge-purple font-mono">{{ dataStore.profitMarginPercent }}%</span>
        </div>
        <div class="kpi-value font-mono">${{ dataStore.grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</div>
        <div class="kpi-subtitle">
          <span>Net retained profit after unit COGS</span>
        </div>
      </div>
    </div>

    <!-- Filter Invoices List Bar -->
    <div class="glass-panel p-3 mb-4 flex-between flex-wrap gap-3">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="invoiceSearchQuery"
          type="text"
          placeholder="Filter invoices by number, customer, serial, or seller..."
          class="form-input search-input"
        />
      </div>

      <div class="filter-pills flex-align gap-2">
        <select v-model="invoicePaymentFilter" class="form-select payment-select">
          <option value="ALL">All Payment Methods</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Wire Transfer">Wire Transfer</option>
          <option value="Cash">Cash</option>
        </select>
      </div>
    </div>

    <!-- Sales Invoices Table -->
    <div class="glass-panel p-4">
      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Items & Assigned Serials</th>
              <th>Grand Total</th>
              <th>Net Profit</th>
              <th>Seller</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in filteredSalesInvoices" :key="inv.invoiceNo">
              <td class="font-mono font-bold text-success">{{ inv.invoiceNo }}</td>
              <td class="font-bold text-main">{{ inv.customer }}</td>
              <td class="font-mono text-xs text-subtle">{{ inv.saleDate }}</td>
              <td>
                <span class="badge badge-neutral">{{ inv.paymentMethod }}</span>
              </td>
              <td>
                <div v-for="item in inv.items" :key="item.productId" class="text-xs text-muted mb-1">
                  {{ item.qty }}x <span class="text-main font-semibold">{{ item.productName }}</span>
                  <div v-if="item.serials.length" class="font-mono text-primary text-xs">
                    SN: {{ item.serials.join(', ') }}
                  </div>
                </div>
              </td>
              <td class="font-mono font-bold text-main">${{ inv.grandTotal.toFixed(2) }}</td>
              <td class="font-mono text-success font-bold text-xs">
                +${{ inv.netProfit.toFixed(2) }} ({{ inv.marginPercent }}%)
              </td>
              <td class="text-xs text-muted">{{ inv.sellerName }}</td>
              <td>
                <button class="btn btn-sm btn-secondary" @click="selectedInvoiceReceipt = inv">
                  <Receipt :size="13" />
                  <span>Receipt</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- POS New Sale Checkout & Dataset Filtering Modal -->
    <div v-if="showPOSModal" class="modal-backdrop" @click.self="showPOSModal = false">
      <div class="modal-content pos-modal">
        <div class="modal-header">
          <h3 class="flex-align gap-2">
            <ShoppingCart :size="18" class="text-success" />
            <span>POS Dataset Filter & Invoice Generation Terminal</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="showPOSModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleProcessSale">
          <div class="modal-body">
            <!-- Customer & Payment Details -->
            <div class="form-grid mb-3">
              <div class="form-group">
                <label class="form-label">Customer / Corporate Name</label>
                <input v-model="posForm.customer" type="text" placeholder="Quantum Enterprises" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select v-model="posForm.paymentMethod" class="form-select">
                  <option value="Credit Card">Credit Card</option>
                  <option value="Wire Transfer">Wire Transfer / Bank</option>
                  <option value="Cash">Cash Payment</option>
                </select>
              </div>
            </div>

            <div class="line-divider"></div>

            <!-- DATASET FILTER BAR FOR PRODUCT SELECTION -->
            <div class="dataset-filter-section glass-panel p-3 mb-3">
              <div class="flex-between mb-2">
                <span class="font-bold text-xs text-primary flex-align gap-1">
                  <Filter :size="14" />
                  DATASET PRODUCT CATALOG FILTER
                </span>
                <span class="text-xs text-subtle">{{ filteredCatalogDataset.length }} Products Available</span>
              </div>

              <div class="dataset-filter-grid">
                <input
                  v-model="datasetQuery"
                  type="text"
                  placeholder="Filter catalog by SKU, Product Name..."
                  class="form-input text-xs"
                />

                <select v-model="datasetCity" class="form-select text-xs">
                  <option value="ALL">All City Allocations</option>
                  <option value="Lahore">Lahore Depot</option>
                  <option value="Multan">Multan Hub</option>
                  <option value="Peshawar">Peshawar Depot</option>
                </select>

                <select v-model="datasetCategory" class="form-select text-xs">
                  <option value="ALL">All Categories</option>
                  <option v-for="cat in datasetCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <!-- Quick Add Product Cards Grid from Filtered Dataset -->
              <div class="dataset-products-list mt-2">
                <div
                  v-for="p in filteredCatalogDataset"
                  :key="p.id"
                  class="dataset-item-row flex-between p-2 mb-1 border-line rounded"
                >
                  <div class="flex-align gap-2">
                    <img :src="p.image" class="thumb-mini" alt="Thumb" />
                    <div>
                      <div class="font-bold text-xs text-main">{{ p.name }}</div>
                      <div class="text-xs text-muted font-mono">
                        {{ p.sku }} • <span class="text-primary">{{ p.allocationCity || 'Lahore' }}</span> • Stock: {{ p.stockQty }}
                      </div>
                    </div>
                  </div>

                  <div class="flex-align gap-2">
                    <span class="font-mono font-bold text-xs text-success">${{ p.sellingPrice }}</span>
                    <button
                      type="button"
                      class="btn btn-sm btn-primary py-1 px-2 text-xs"
                      :disabled="p.stockQty <= 0"
                      @click="addProductToCart(p)"
                    >
                      + Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- CART ITEMS & SEARCHABLE SERIAL ALLOCATION -->
            <div class="pos-items-section mb-3">
              <div class="flex-between mb-2">
                <span class="font-bold text-sm text-main">Selected Invoice Cart Line Items ({{ posForm.items.length }})</span>
                <button type="button" class="btn btn-sm btn-secondary" @click="addEmptyCartItem">
                  <Plus :size="12" /> Add Line
                </button>
              </div>

              <div v-for="(item, idx) in posForm.items" :key="idx" class="cart-line-card glass-panel p-3 mb-2">
                <div class="flex-align gap-2 mb-2">
                  <select v-model="item.productId" class="form-select flex-1" @change="onPOSProductSelect(item)">
                    <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                      {{ p.name }} ({{ p.allocationCity || 'Lahore' }}) - Stock: {{ p.stockQty }} - ${{ p.sellingPrice }}
                    </option>
                  </select>

                  <input v-model.number="item.qty" type="number" min="1" placeholder="Qty" class="form-input w-20" required />
                  <input v-model.number="item.unitPrice" type="number" step="0.01" placeholder="Price ($)" class="form-input w-28" required />

                  <button type="button" class="btn btn-sm btn-ghost text-danger" @click="removeCartItem(idx)">&times;</button>
                </div>

                <!-- SEARCHABLE SERIAL NUMBER DROPDOWN & FILTER -->
                <div v-if="getAvailableSerialsForProduct(item.productId).length" class="serial-picker-wrapper">
                  <div class="flex-between mb-1">
                    <label class="form-label text-xs text-primary flex-align gap-1">
                      <QrCode :size="12" />
                      ASSIGN UNIT SERIAL NUMBER(S) (Selected: {{ item.selectedSerials.length }} of {{ item.qty }}):
                    </label>

                    <button
                      type="button"
                      class="btn btn-xs btn-ghost text-xs text-secondary"
                      @click="item.showDropdown = !item.showDropdown"
                    >
                      <ChevronDown v-if="!item.showDropdown" :size="14" />
                      <ChevronUp v-else :size="14" />
                      <span>{{ item.showDropdown ? 'Close Dropdown' : 'Search & Select Serials' }}</span>
                    </button>
                  </div>

                  <!-- Serial Search Bar & City Dropdown Filter -->
                  <div class="serial-filter-bar flex-align gap-2 mb-2">
                    <div class="search-box flex-1">
                      <Search :size="14" class="search-icon-sm" />
                      <input
                        v-model="item.serialSearch"
                        type="text"
                        placeholder="Search serial code (e.g. 88401)..."
                        class="form-input text-xs serial-search-input"
                      />
                    </div>

                    <select v-model="item.serialCityFilter" class="form-select text-xs w-36">
                      <option value="ALL">All Cities</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                    </select>
                  </div>

                  <!-- Filtered Serial List Box / Dropdown Menu -->
                  <div class="serial-list-box border-line p-2 rounded">
                    <div v-if="getFilteredSerials(item).length" class="flex-wrap gap-2">
                      <label
                        v-for="s in getFilteredSerials(item)"
                        :key="s.serialCode"
                        :class="['serial-checkbox-label', item.selectedSerials.includes(s.serialCode) ? 'active-serial' : '']"
                      >
                        <input type="checkbox" :value="s.serialCode" v-model="item.selectedSerials" />
                        <span class="font-mono text-xs">{{ s.serialCode }}</span>
                        <span class="badge badge-info text-xs py-0 px-1">{{ s.allocationCity || 'Lahore' }}</span>
                      </label>
                    </div>

                    <div v-else class="text-xs text-subtle text-center py-2">
                      No serial numbers matching "{{ item.serialSearch }}"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Manual Approved Discount ($)</label>
              <input v-model.number="posForm.discount" type="number" step="0.01" class="form-input" />
            </div>

            <!-- Total Preview Summary -->
            <div class="pos-summary-box glass-panel p-3">
              <div class="flex-between text-xs text-muted mb-1">
                <span>Subtotal:</span>
                <span class="font-mono">${{ posSubtotal.toFixed(2) }}</span>
              </div>
              <div class="flex-between text-xs text-muted mb-1">
                <span>Est. Tax (8% VAT):</span>
                <span class="font-mono">${{ (posSubtotal * 0.08).toFixed(2) }}</span>
              </div>
              <div class="flex-between text-xs text-warning mb-2">
                <span>Discount Applied:</span>
                <span class="font-mono">-${{ (posForm.discount || 0).toFixed(2) }}</span>
              </div>
              <div class="line-divider"></div>
              <div class="flex-between font-bold text-lg text-main mt-1">
                <span>Grand Total:</span>
                <span class="font-mono text-success">${{ posGrandTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showPOSModal = false">Cancel</button>
            <button type="submit" class="btn btn-success btn-lg">
              <CheckCircle :size="18" /> Generate Sales Invoice
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Printable Receipt Modal -->
    <div v-if="selectedInvoiceReceipt" class="modal-backdrop" @click.self="selectedInvoiceReceipt = null">
      <div class="modal-content receipt-modal">
        <div class="modal-header">
          <span class="font-mono font-bold text-success">{{ selectedInvoiceReceipt.invoiceNo }}</span>
          <button class="btn btn-ghost btn-sm" @click="selectedInvoiceReceipt = null">&times;</button>
        </div>

        <div class="modal-body receipt-body font-mono">
          <div class="receipt-header text-center mb-3">
            <h2>NEXIS ENTERPRISE ERP</h2>
            <p>OFFICIAL SALES INVOICE & SERIAL RECEIPT</p>
            <p>Date: {{ selectedInvoiceReceipt.saleDate }}</p>
          </div>

          <div class="line-divider"></div>

          <div class="mb-3 text-xs">
            <div>CUSTOMER: {{ selectedInvoiceReceipt.customer }}</div>
            <div>PAYMENT METHOD: {{ selectedInvoiceReceipt.paymentMethod }}</div>
            <div>SELLER: {{ selectedInvoiceReceipt.sellerName }}</div>
          </div>

          <div class="receipt-items mb-3">
            <div v-for="item in selectedInvoiceReceipt.items" :key="item.productId" class="receipt-row mb-1">
              <div class="flex-between text-xs">
                <span>{{ item.qty }}x {{ item.productName }}</span>
                <span>${{ item.total.toFixed(2) }}</span>
              </div>
              <div v-if="item.serials.length" class="text-xs text-primary">
                SERN: {{ item.serials.join(', ') }}
              </div>
            </div>
          </div>

          <div class="line-divider"></div>

          <div class="text-xs">
            <div class="flex-between"><span>SUBTOTAL:</span><span>${{ selectedInvoiceReceipt.subtotal.toFixed(2) }}</span></div>
            <div class="flex-between"><span>TAX:</span><span>${{ selectedInvoiceReceipt.tax.toFixed(2) }}</span></div>
            <div class="flex-between"><span>DISCOUNT:</span><span>-${{ selectedInvoiceReceipt.discount.toFixed(2) }}</span></div>
            <div class="flex-between font-bold text-sm mt-1"><span>TOTAL PAID:</span><span>${{ selectedInvoiceReceipt.grandTotal.toFixed(2) }}</span></div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-primary w-full" @click="printReceipt">
            <Printer :size="16" /> Print Official Copy
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  ShoppingCart,
  CreditCard,
  Receipt,
  Plus,
  CheckCircle,
  Printer,
  Search,
  Filter,
  QrCode,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

const showPOSModal = ref(false)
const selectedInvoiceReceipt = ref(null)

const invoiceSearchQuery = ref('')
const invoicePaymentFilter = ref('ALL')

// Dataset Filter State inside POS Modal
const datasetQuery = ref('')
const datasetCity = ref('ALL')
const datasetCategory = ref('ALL')

const posForm = ref({
  customer: 'Quantum Systems Ltd',
  paymentMethod: 'Credit Card',
  discount: 0,
  items: [
    {
      productId: dataStore.products[0]?.id || '',
      productName: dataStore.products[0]?.name || '',
      qty: 1,
      unitPrice: dataStore.products[0]?.sellingPrice || 100,
      selectedSerials: [],
      serialSearch: '',
      serialCityFilter: 'ALL',
      showDropdown: true
    }
  ]
})

const datasetCategories = computed(() => {
  const set = new Set(dataStore.products.map(p => p.category))
  return Array.from(set)
})

const filteredCatalogDataset = computed(() => {
  return dataStore.products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(datasetQuery.value.toLowerCase()) ||
                         p.sku.toLowerCase().includes(datasetQuery.value.toLowerCase())
    const matchesCity = datasetCity.value === 'ALL' || p.allocationCity === datasetCity.value
    const matchesCategory = datasetCategory.value === 'ALL' || p.category === datasetCategory.value
    return matchesQuery && matchesCity && matchesCategory
  })
})

const filteredSalesInvoices = computed(() => {
  return dataStore.salesInvoices.filter(inv => {
    const matchesQuery = inv.invoiceNo.toLowerCase().includes(invoiceSearchQuery.value.toLowerCase()) ||
                         inv.customer.toLowerCase().includes(invoiceSearchQuery.value.toLowerCase()) ||
                         inv.sellerName.toLowerCase().includes(invoiceSearchQuery.value.toLowerCase())
    const matchesPayment = invoicePaymentFilter.value === 'ALL' || inv.paymentMethod === invoicePaymentFilter.value
    return matchesQuery && matchesPayment
  })
})

const posSubtotal = computed(() => {
  return posForm.value.items.reduce((acc, i) => acc + ((i.qty || 0) * (i.unitPrice || 0)), 0)
})

const posGrandTotal = computed(() => {
  const tax = posSubtotal.value * 0.08
  return Math.max(0, (posSubtotal.value + tax) - (posForm.value.discount || 0))
})

function getAvailableSerialsForProduct(productId) {
  return dataStore.serials.filter(s => s.productId === productId && s.status === 'Available')
}

function getFilteredSerials(item) {
  const available = getAvailableSerialsForProduct(item.productId)
  return available.filter(s => {
    const query = (item.serialSearch || '').toLowerCase()
    const matchesSearch = !query || s.serialCode.toLowerCase().includes(query) || (s.allocationCity && s.allocationCity.toLowerCase().includes(query))
    const matchesCity = !item.serialCityFilter || item.serialCityFilter === 'ALL' || s.allocationCity === item.serialCityFilter
    return matchesSearch && matchesCity
  })
}

function addProductToCart(product) {
  const existing = posForm.value.items.find(i => i.productId === product.id)
  if (existing) {
    existing.qty += 1
  } else {
    posForm.value.items.push({
      productId: product.id,
      productName: product.name,
      qty: 1,
      unitPrice: product.sellingPrice,
      selectedSerials: [],
      serialSearch: '',
      serialCityFilter: 'ALL',
      showDropdown: true
    })
  }
  uiStore.showToast(`Added ${product.name} to POS Cart!`, 'success')
}

function addEmptyCartItem() {
  const p = dataStore.products[0]
  posForm.value.items.push({
    productId: p?.id || '',
    productName: p?.name || '',
    qty: 1,
    unitPrice: p?.sellingPrice || 100,
    selectedSerials: [],
    serialSearch: '',
    serialCityFilter: 'ALL',
    showDropdown: true
  })
}

function removeCartItem(idx) {
  if (posForm.value.items.length > 1) {
    posForm.value.items.splice(idx, 1)
  }
}

function onPOSProductSelect(item) {
  const p = dataStore.products.find(prod => prod.id === item.productId)
  if (p) {
    item.productName = p.name
    item.unitPrice = p.sellingPrice
    item.selectedSerials = []
    item.serialSearch = ''
    item.serialCityFilter = 'ALL'
  }
}

function handleProcessSale() {
  const inv = dataStore.processSaleInvoice(posForm.value, authStore.user)
  showPOSModal.value = false
  uiStore.showToast(`Sales Invoice ${inv.invoiceNo} generated for $${inv.grandTotal.toFixed(2)}!`, 'success')
  selectedInvoiceReceipt.value = inv
}

function printReceipt() {
  window.print()
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.85rem; }
.p-4 { padding: 1.25rem; }
.py-0 { padding-top: 0; padding-bottom: 0; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }

.search-box { position: relative; width: 340px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-icon-sm { position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
.search-input { padding-left: 2.2rem; }
.serial-search-input { padding-left: 1.8rem; }
.payment-select { width: 180px; }

.flex-1 { flex: 1; }
.w-20 { width: 80px; }
.w-28 { width: 110px; }
.w-36 { width: 140px; }
.w-full { width: 100%; }

.pos-modal { max-width: 780px; }
.receipt-modal { max-width: 440px; }

.dataset-filter-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 0.5rem;
}

.dataset-products-list {
  max-height: 180px;
  overflow-y: auto;
}

.serial-list-box {
  max-height: 140px;
  overflow-y: auto;
  background: var(--bg-dark-900);
}

.thumb-mini {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.border-line {
  border: 1px solid var(--border-line);
}

.rounded {
  border-radius: var(--radius-sm);
}

.serial-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  background: var(--bg-dark-800);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.serial-checkbox-label.active-serial {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.15);
}

.text-center { text-align: center; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
</style>

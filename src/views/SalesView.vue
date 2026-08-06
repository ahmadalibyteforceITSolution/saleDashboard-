<template>
  <div class="page-wrapper">
    <!-- Header Banner -->
    <div class="dashboard-header flex-between mb-4">
      <div>
        <div class="flex-align gap-2">
          <ShoppingCart :size="24" class="text-success" />
          <h1 class="page-title">Sales Invoices & POS Outbound</h1>
        </div>
        <p class="page-subtitle">POS order checkout, customer billing, serial assignment, and profit margin analysis</p>
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
            <tr v-for="inv in dataStore.salesInvoices" :key="inv.invoiceNo">
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

    <!-- POS New Sale Checkout Modal -->
    <div v-if="showPOSModal" class="modal-backdrop" @click.self="showPOSModal = false">
      <div class="modal-content pos-modal">
        <div class="modal-header">
          <h3 class="flex-align gap-2">
            <ShoppingCart :size="18" class="text-success" />
            <span>POS Sales Checkout Terminal</span>
          </h3>
          <button class="btn btn-ghost btn-sm" @click="showPOSModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleProcessSale">
          <div class="modal-body">
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

            <div class="pos-items-section mb-3">
              <div class="flex-between mb-2">
                <span class="font-bold text-sm text-main">Cart Line Items & Serial Allocation</span>
                <button type="button" class="btn btn-sm btn-secondary" @click="addCartItem">
                  <Plus :size="12" /> Add Product
                </button>
              </div>

              <div v-for="(item, idx) in posForm.items" :key="idx" class="cart-line-card glass-panel p-3 mb-2">
                <div class="flex-align gap-2 mb-2">
                  <select v-model="item.productId" class="form-select flex-1" @change="onPOSProductSelect(item)">
                    <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                      {{ p.name }} (Stock: {{ p.stockQty }}) - ${{ p.sellingPrice }}
                    </option>
                  </select>

                  <input v-model.number="item.qty" type="number" min="1" placeholder="Qty" class="form-input w-20" required />
                  <input v-model.number="item.unitPrice" type="number" step="0.01" placeholder="Price ($)" class="form-input w-28" required />

                  <button type="button" class="btn btn-sm btn-ghost text-danger" @click="removeCartItem(idx)">&times;</button>
                </div>

                <!-- Serial Number Picker for this item -->
                <div v-if="getAvailableSerialsForProduct(item.productId).length" class="serial-picker">
                  <label class="form-label text-xs text-primary">Assign Unit Serial Number(s):</label>
                  <div class="flex-wrap gap-2">
                    <label v-for="s in getAvailableSerialsForProduct(item.productId)" :key="s.serialCode" class="serial-checkbox-label">
                      <input type="checkbox" :value="s.serialCode" v-model="item.selectedSerials" />
                      <span class="font-mono text-xs">{{ s.serialCode }}</span>
                    </label>
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
              <CheckCircle :size="18" /> Complete Checkout & Issue Invoice
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
import {
  ShoppingCart,
  CreditCard,
  Receipt,
  Plus,
  CheckCircle,
  Printer
} from 'lucide-vue-next'

const authStore = useAuthStore()
const dataStore = useDataStore()

const showPOSModal = ref(false)
const selectedInvoiceReceipt = ref(null)

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
      selectedSerials: []
    }
  ]
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

function addCartItem() {
  const p = dataStore.products[0]
  posForm.value.items.push({
    productId: p?.id || '',
    productName: p?.name || '',
    qty: 1,
    unitPrice: p?.sellingPrice || 100,
    selectedSerials: []
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
  }
}

function handleProcessSale() {
  dataStore.processSaleInvoice(posForm.value, authStore.user)
  showPOSModal.value = false
  alert('Sale successfully completed! Invoice issued & serial status updated to Sold.')
}

function printReceipt() {
  window.print()
}
</script>

<style scoped>
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.flex-align { display: flex; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.gap-2 { gap: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }
.mt-1 { margin-top: 0.25rem; }
.p-3 { padding: 0.85rem; }
.p-4 { padding: 1.25rem; }

.flex-1 { flex: 1; }
.w-20 { width: 80px; }
.w-28 { width: 110px; }
.w-full { width: 100%; }

.pos-modal { max-width: 700px; }
.receipt-modal { max-width: 440px; }

.serial-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
  background: var(--bg-dark-900);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.text-center { text-align: center; }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-lg { font-size: 1.25rem; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
</style>

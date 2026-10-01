<template>
  <div v-if="uiStore.showGlobalSaleModal" class="modal-backdrop" @click.self="uiStore.closeSaleModal">
    <div class="modal-content pos-modal max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700">
      <div class="modal-header flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ShoppingCart :size="18" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white leading-tight">Outbound Equipment Sales POS</h3>
            <p class="text-[11px] text-slate-400">Order creation, price history check & ledger reconciliation</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="authStore.toggleBalance()"
            :class="[
              'btn btn-xs flex items-center gap-1 font-mono transition-all',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Reveal customer balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="12" />
            <Eye v-else :size="12" />
            <span>{{ authStore.isBalanceVisible ? 'Mask Balances' : 'Reveal Balances' }}</span>
          </button>
          <button @click="uiStore.closeSaleModal" class="btn btn-ghost text-slate-400 hover:text-white">✕</button>
        </div>
      </div>

      <form @submit.prevent="handleProcessSale" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="modal-body p-5 overflow-y-auto space-y-4 text-xs text-slate-200">
          <!-- Order Type Selector -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-900/90 dark:bg-slate-900 rounded-lg border border-slate-700/80 w-fit">
            <button
              type="button"
              @click="posForm.orderType = 'Invoice'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'Invoice' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
            >
              Sales Invoice
            </button>
            <button
              type="button"
              @click="posForm.orderType = 'Quotation'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'Quotation' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
            >
              Quotation / Proforma
            </button>
            <button
              type="button"
              @click="posForm.orderType = 'SalesOrder'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'SalesOrder' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
            >
              Sales Order
            </button>
          </div>

          <!-- Customer & Branch Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
            <div class="md:col-span-2">
              <div class="flex items-center justify-between mb-1">
                <label class="form-label text-xs mb-0 font-bold">Customer / Party Account *</label>
                <button
                  type="button"
                  @click="showAddPartyModal = true"
                  class="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus :size="12" />
                  <span>+ Add Party</span>
                </button>
              </div>

              <!-- Custom Searchable Dropdown Box -->
              <div>
                <div
                  @click="isPosCustomerDropdownOpen = !isPosCustomerDropdownOpen"
                  class="form-select flex items-center justify-between cursor-pointer text-xs font-bold w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-white min-h-[38px] hover:border-sky-500 transition-all"
                  :class="{ 'border-sky-500 ring-1 ring-sky-500/40 bg-slate-950': isPosCustomerDropdownOpen }"
                >
                  <div v-if="selectedPosCustomerObj" class="flex items-center gap-2 min-w-0 flex-wrap">
                    <span class="font-bold text-white truncate">{{ selectedPosCustomerObj.name }}</span>
                    <span class="badge text-[10px] py-0 px-1.5 font-mono badge-success">
                      {{ selectedPosCustomerObj.category || 'REGULAR' }}
                    </span>
                    <span v-if="selectedPosCustomerObj.branch" class="text-[10px] text-slate-400">
                      📍 {{ selectedPosCustomerObj.branch }}
                    </span>
                  </div>
                  <div v-else class="text-slate-400 flex items-center gap-2">
                    <Search :size="13" class="text-slate-500" />
                    <span>Select or search customer account...</span>
                  </div>

                  <div class="flex items-center gap-1 text-slate-400 ml-2 shrink-0">
                    <button
                      v-if="posForm.customer"
                      type="button"
                      @click.stop="posForm.customer = ''"
                      class="hover:text-red-400 p-0.5 text-xs font-bold"
                      title="Clear selection"
                    >
                      ✕
                    </button>
                    <ChevronDown :size="14" class="transition-transform duration-200" :class="{ 'rotate-180 text-sky-400': isPosCustomerDropdownOpen }" />
                  </div>
                </div>

                <!-- Inline Expandable Parties Panel -->
                <div
                  v-if="isPosCustomerDropdownOpen"
                  class="mt-2 bg-[#0b1329] border border-sky-500/60 rounded-xl p-3 space-y-2.5 shadow-xl transition-all"
                >
                  <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                      <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        v-model="posPartySearchQuery"
                        type="text"
                        placeholder="Search party by name, phone, branch..."
                        class="w-full pl-8 pr-7 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      @click="isPosCustomerDropdownOpen = false"
                      class="px-2.5 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Done ✕
                    </button>
                  </div>

                  <div class="overflow-y-auto space-y-1.5 pr-1 max-h-52">
                    <div
                      v-for="c in filteredPosPartyList"
                      :key="c.id || c.name"
                      @click="selectCustomer(c)"
                      class="p-2.5 rounded-lg hover:bg-slate-800/90 cursor-pointer transition-colors flex items-center justify-between gap-2 border border-slate-800/80 hover:border-sky-500/60"
                      :class="{ 'bg-sky-950/70 border-sky-500/80': posForm.customer === c.name }"
                    >
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="font-bold text-white text-xs">{{ c.name }}</span>
                          <span class="badge text-[9px] py-0 px-1 font-mono badge-success">
                            {{ c.category || 'REGULAR' }}
                          </span>
                        </div>
                        <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span v-if="c.branch">📍 {{ c.branch }}</span>
                          <span v-if="c.phone">📞 {{ c.phone }}</span>
                        </div>
                      </div>
                      <div class="text-right shrink-0">
                        <div class="text-[10px] font-mono text-amber-400 font-bold">
                          Bal: PKR {{ (c.balance || 0).toLocaleString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Branch Field (Locked for non-superadmin) -->
            <div>
              <label class="form-label text-xs font-bold flex items-center justify-between mb-1">
                <span>Sales Branch *</span>
                <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-400 font-semibold">🔒 Locked</span>
              </label>

              <div
                v-if="!authStore.isSuperAdmin"
                class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs flex items-center justify-between shadow-inner select-none cursor-not-allowed min-h-[38px]"
              >
                <span class="flex items-center gap-1.5 text-slate-200">
                  <span>📍</span>
                  <span>{{ authStore.userBranch || 'Lahore' }} Depot</span>
                </span>
                <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
              </div>

              <select
                v-else
                v-model="posForm.branch"
                required
                class="form-select text-xs font-bold w-full min-h-[38px]"
              >
                <option value="Peshawar">Peshawar (Head Office)</option>
                <option value="Lahore">Lahore</option>
                <option value="Multan">Multan</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Karachi">Karachi</option>
              </select>
            </div>
          </div>

          <!-- Payment Terms, Delivery Date, Origin BL -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Delivery Date (Starts 30-day reminder) *</label>
              <input v-model="posForm.deliveryDate" type="date" required class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Payment Terms *</label>
              <select v-model="posForm.paymentTerms" required class="form-select w-full p-2 border rounded font-bold">
                <option value="Cash Payment">Cash Payment (Immediate Full Recovery)</option>
                <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
                <option value="Credit Terms (30 Days)">Credit Terms (30 Days)</option>
                <option value="Installment (3-Months)">Installment (3-Months)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Bill of Lading (BL) Origin</label>
              <select v-model="posForm.blNumber" class="form-select w-full p-2 border rounded font-bold">
                <option value="">Consolidated Warehouse Consignment</option>
                <option v-for="bl in dataStore.blList" :key="bl.blNumber" :value="bl.blNumber">
                  {{ bl.blNumber }} ({{ bl.supplierName || 'Import Consignment' }})
                </option>
              </select>
            </div>
          </div>

          <!-- ── Equipment SKU & Serial Selection ── -->
          <div class="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Package :size="13" />
                <span>Select Equipment Product & Machine Serials</span>
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Select Equipment SKU ({{ posForm.branch }} Stock) *</label>
                <select v-model="selectedCartProductId" @change="cartSelectedSerials = []" class="form-select w-full p-2 border rounded font-bold">
                  <option value="" disabled>Choose Equipment...</option>
                  <option v-for="p in branchProducts" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ p.sku }}) — PKR {{ (p.sellingPrice || p.costPrice || 0).toLocaleString() }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label font-bold mb-1 block">Available Serials in {{ posForm.branch }}</label>
                <div v-if="availableSerialsForProduct.length > 0" class="max-h-24 overflow-y-auto p-1.5 bg-slate-950 rounded border border-slate-800 flex flex-wrap gap-1.5">
                  <button
                    v-for="s in availableSerialsForProduct"
                    :key="s.serialCode"
                    type="button"
                    @click="toggleSerialSelection(s.serialCode)"
                    :class="['px-2 py-1 rounded text-[11px] font-mono font-bold transition-all', cartSelectedSerials.includes(s.serialCode) ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700']"
                  >
                    {{ s.machineCode ? `${s.machineCode} (${s.serialCode})` : s.serialCode }}
                  </button>
                </div>
                <div v-else class="text-xs text-slate-500 italic p-2 bg-slate-950 rounded border border-slate-800">
                  {{ selectedCartProductId ? 'No available serials in this depot.' : 'Select a product first.' }}
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addEquipmentToCart"
              :disabled="!selectedCartProductId || cartSelectedSerials.length === 0"
              class="w-full py-2 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus :size="14" />
              <span>+ Add Selected Machines to Order ({{ cartSelectedSerials.length }} units @ PKR {{ formatPrice(selectedProductPrice * cartSelectedSerials.length) }})</span>
            </button>
          </div>

          <!-- Order Items Table -->
          <div v-if="posCartItems.length > 0" class="overflow-x-auto border border-slate-800 rounded-lg">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-900 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <th class="p-2">Item</th>
                  <th class="p-2">Qty</th>
                  <th class="p-2">Serials</th>
                  <th class="p-2">Unit Price (PKR)</th>
                  <th class="p-2 text-right">Total (PKR)</th>
                  <th class="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, idx) in posCartItems" :key="idx" class="border-b border-slate-800/60 bg-slate-950/40">
                  <td class="p-2 font-bold text-white">{{ it.productName }}</td>
                  <td class="p-2 font-mono font-bold text-sky-400">{{ it.qty }}</td>
                  <td class="p-2 font-mono text-[11px] text-teal-300">{{ (it.serials || []).join(', ') }}</td>
                  <td class="p-2 font-mono">PKR {{ Number(it.unitPrice).toLocaleString() }}</td>
                  <td class="p-2 font-mono font-bold text-emerald-400 text-right">PKR {{ (it.qty * it.unitPrice).toLocaleString() }}</td>
                  <td class="p-2 text-right">
                    <button type="button" @click="posCartItems.splice(idx, 1)" class="text-red-400 hover:text-red-300 font-bold">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary & Grand Total -->
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <div class="text-slate-400 text-xs">Subtotal: PKR {{ cartSubtotal.toLocaleString() }}</div>
              <div class="text-slate-400 text-xs">Sales Tax (18% HSN Standard): PKR {{ Math.round(cartSubtotal * 0.18).toLocaleString() }}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Grand Total</span>
              <span class="text-lg font-black text-emerald-400 font-mono">PKR {{ cartGrandTotal.toLocaleString() }}</span>
            </div>
          </div>

          <!-- Customer Ledger Reconciliation Card -->
          <div class="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Receipt :size="13" />
                <span>Customer Ledger Balance Reconciliation (Live Calculation)</span>
              </span>
              <span class="text-slate-400 font-mono text-[11px]">Dealer: {{ posForm.customer || 'Select Dealer' }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div class="p-2 bg-slate-950 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Previous Balance</span>
                <span class="text-xs font-bold text-white block mt-0.5">PKR {{ (selectedPosCustomerObj?.balance || 0).toLocaleString() }}</span>
              </div>
              <div class="p-2 bg-slate-950 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-blue-400 block">(+) Current Invoice</span>
                <span class="text-xs font-bold text-blue-300 block mt-0.5">PKR {{ cartGrandTotal.toLocaleString() }}</span>
              </div>
              <div class="p-2 bg-slate-950 rounded border border-slate-800">
                <span class="text-[10px] uppercase font-bold text-emerald-400 block">(-) Payment Received</span>
                <input
                  v-model.number="paymentReceivedAmount"
                  type="number"
                  min="0"
                  class="w-full text-center text-xs font-bold text-emerald-400 bg-slate-900 border border-slate-700 rounded py-0.5 mt-0.5 font-mono"
                />
              </div>
              <div class="p-2 bg-amber-950/60 rounded border border-amber-500/40">
                <span class="text-[10px] uppercase font-bold text-amber-300 block">Total Outstanding</span>
                <span class="text-xs font-black text-amber-400 block mt-0.5">PKR {{ calculatedFinalBalance.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
          <button type="button" @click="uiStore.closeSaleModal" class="btn btn-secondary text-xs font-bold py-2 px-4">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary text-xs font-bold py-2 px-5 flex items-center gap-1.5 shadow-lg">
            <CheckCircle :size="14" />
            <span>Confirm & Dispatch Invoice</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Sub-Modal: Add Customer / Party inline -->
    <div v-if="showAddPartyModal" class="modal-backdrop" style="z-index: 10000;" @click.self="showAddPartyModal = false">
      <div class="modal-content max-w-md p-5 space-y-4 bg-slate-900 border border-slate-700 shadow-2xl">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus :size="16" class="text-sky-400" />
          <span>Add New Customer Party Account</span>
        </h4>
        <div class="space-y-3 text-xs">
          <div>
            <label class="form-label font-bold mb-1 block">Party Name *</label>
            <input v-model="newParty.name" type="text" placeholder="e.g. Star Surgical Complex" class="form-input w-full p-2 border rounded font-bold" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="form-label font-bold mb-1 block">Phone Number</label>
              <input v-model="newParty.phone" type="text" placeholder="+92 300 1234567" class="form-input w-full p-2 border rounded" />
            </div>
            <div>
              <label class="form-label font-bold mb-1 block">City / Branch</label>
              <input v-model="newParty.branch" type="text" :disabled="!authStore.isSuperAdmin" class="form-input w-full p-2 border rounded font-bold" />
            </div>
          </div>
          <div>
            <label class="form-label font-bold mb-1 block">Credit Limit (PKR)</label>
            <input v-model.number="newParty.baseCreditLimit" type="number" min="0" class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-400" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" @click="showAddPartyModal = false" class="btn btn-secondary btn-xs">Cancel</button>
          <button type="button" @click="handleSaveNewParty" class="btn btn-primary btn-xs font-bold">Save Party</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  ShoppingCart,
  Eye,
  EyeOff,
  Plus,
  Search,
  ChevronDown,
  Package,
  Receipt,
  CheckCircle,
  UserPlus
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const isPosCustomerDropdownOpen = ref(false)
const posPartySearchQuery = ref('')
const selectedCartProductId = ref('')
const cartSelectedSerials = ref([])
const posCartItems = ref([])
const paymentReceivedAmount = ref(0)
const showAddPartyModal = ref(false)

const posForm = ref({
  orderType: 'Invoice',
  customer: '',
  branch: authStore.userBranch || 'Lahore',
  deliveryDate: new Date().toISOString().substring(0, 10),
  paymentTerms: 'Cash Payment',
  blNumber: ''
})

const newParty = ref({
  name: '',
  phone: '',
  branch: authStore.userBranch || 'Lahore',
  baseCreditLimit: 2000000
})

watch(() => uiStore.showGlobalSaleModal, (isOpen) => {
  if (isOpen) {
    const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Lahore')
    posForm.value.branch = currentBranch
    posForm.value.deliveryDate = new Date().toISOString().substring(0, 10)
    posForm.value.orderType = 'Invoice'
    posForm.value.customer = (dataStore.customers && dataStore.customers[0]) ? dataStore.customers[0].name : ''
    posForm.value.paymentTerms = 'Cash Payment'
    posForm.value.blNumber = ''
    selectedCartProductId.value = ''
    cartSelectedSerials.value = []
    posCartItems.value = []
    paymentReceivedAmount.value = 0
  }
})

const filteredPosPartyList = computed(() => {
  let list = dataStore.customers || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    list = list.filter(c => (c.branch || '').toLowerCase().includes(userCity))
  }
  if (posPartySearchQuery.value.trim()) {
    const q = posPartySearchQuery.value.toLowerCase().trim()
    list = list.filter(c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)) || (c.branch && c.branch.toLowerCase().includes(q)))
  }
  return list
})

const selectedPosCustomerObj = computed(() => {
  if (!posForm.value.customer) return null
  return (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase()) || {
    name: posForm.value.customer,
    branch: posForm.value.branch,
    category: 'REGULAR',
    balance: 0
  }
})

const branchProducts = computed(() => {
  const branch = (posForm.value.branch || authStore.userBranch || 'Lahore').toLowerCase()
  return (dataStore.products || []).filter(p => {
    const alloc = String(p.allocationCity || '').toLowerCase()
    return alloc.includes(branch) || branch.includes(alloc) || authStore.isSuperAdmin
  })
})

const selectedProductPrice = computed(() => {
  if (!selectedCartProductId.value) return 0
  const prod = (dataStore.products || []).find(p => p.id === selectedCartProductId.value)
  return prod ? (prod.sellingPrice || prod.costPrice || 0) : 0
})

const availableSerialsForProduct = computed(() => {
  if (!selectedCartProductId.value) return []
  const prod = (dataStore.products || []).find(p => p.id === selectedCartProductId.value)
  if (!prod) return []
  const branch = (posForm.value.branch || authStore.userBranch || 'Lahore').toLowerCase()
  return (dataStore.serials || []).filter(s => {
    const isAvail = s.status === 'Available'
    const isProd = s.productId === prod.id || s.sku === prod.sku
    const sCity = String(s.allocationCity || s.branch || '').toLowerCase()
    const isBranch = sCity.includes(branch) || branch.includes(sCity) || authStore.isSuperAdmin
    return isAvail && isProd && isBranch
  })
})

function toggleSerialSelection(serialCode) {
  const idx = cartSelectedSerials.value.indexOf(serialCode)
  if (idx >= 0) {
    cartSelectedSerials.value.splice(idx, 1)
  } else {
    cartSelectedSerials.value.push(serialCode)
  }
}

function addEquipmentToCart() {
  if (!selectedCartProductId.value || cartSelectedSerials.value.length === 0) return
  const prod = (dataStore.products || []).find(p => p.id === selectedCartProductId.value)
  if (!prod) return

  posCartItems.value.push({
    productId: prod.id,
    productName: prod.name,
    sku: prod.sku,
    qty: cartSelectedSerials.value.length,
    serials: [...cartSelectedSerials.value],
    unitPrice: selectedProductPrice.value
  })

  selectedCartProductId.value = ''
  cartSelectedSerials.value = []
}

function selectCustomer(c) {
  posForm.value.customer = c.name
  if (c.branch && authStore.isSuperAdmin) {
    posForm.value.branch = c.branch
  }
  isPosCustomerDropdownOpen.value = false
}

function handleSaveNewParty() {
  if (!newParty.value.name.trim()) return
  const created = {
    id: `cust_${Date.now()}`,
    name: newParty.value.name.trim(),
    phone: newParty.value.phone || '',
    branch: newParty.value.branch || authStore.userBranch || 'Lahore',
    category: 'REGULAR',
    baseCreditLimit: Number(newParty.value.baseCreditLimit || 2000000),
    balance: 0
  }
  dataStore.customers.unshift(created)
  posForm.value.customer = created.name
  showAddPartyModal.value = false
  uiStore.showToast(`Party ${created.name} registered!`, 'success')
}

const cartSubtotal = computed(() => {
  return posCartItems.value.reduce((s, it) => s + (it.qty * it.unitPrice), 0)
})

const cartGrandTotal = computed(() => {
  return Math.round(cartSubtotal.value * 1.18)
})

const calculatedFinalBalance = computed(() => {
  const prev = Number(selectedPosCustomerObj.value?.balance || 0)
  const inv = Number(cartGrandTotal.value || 0)
  const paid = Number(paymentReceivedAmount.value || 0)
  return Math.max(0, prev + inv - paid)
})

function formatPrice(val) {
  return Number(val || 0).toLocaleString()
}

async function handleProcessSale() {
  if (!posForm.value.customer) {
    uiStore.showModal('Validation Error', 'Please select a Customer / Party account.', 'warning')
    return
  }
  if (posCartItems.value.length === 0) {
    uiStore.showModal('Validation Error', 'Please add at least one equipment item to the order.', 'warning')
    return
  }

  const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const allSerialsUsed = posCartItems.value.flatMap(it => it.serials || [])

  // Mark serials as sold in dataStore
  allSerialsUsed.forEach(sn => {
    const sObj = (dataStore.serials || []).find(s => s.serialCode === sn)
    if (sObj) {
      sObj.status = 'Sold'
      sObj.customer = posForm.value.customer
      sObj.invoiceNo = invoiceNo
      sObj.soldDate = posForm.value.deliveryDate
    }
  })

  // Add invoice to salesInvoices
  const newInvoice = {
    invoiceNo,
    customer: posForm.value.customer,
    date: posForm.value.deliveryDate,
    branch: posForm.value.branch,
    salesPerson: authStore.user?.name || 'Executive Officer',
    paymentTerms: posForm.value.paymentTerms,
    blNumber: posForm.value.blNumber || 'Consolidated Depot Stock',
    items: [...posCartItems.value],
    subtotal: cartSubtotal.value,
    tax: Math.round(cartSubtotal.value * 0.18),
    totalAmount: cartGrandTotal.value,
    paidAmount: paymentReceivedAmount.value,
    status: paymentReceivedAmount.value >= cartGrandTotal.value ? 'Paid' : paymentReceivedAmount.value > 0 ? 'Partial' : 'Unpaid'
  }
  dataStore.salesInvoices.unshift(newInvoice)

  // Update customer balance in dataStore
  const cust = (dataStore.customers || []).find(c => c.name.toLowerCase() === posForm.value.customer.toLowerCase())
  if (cust) {
    cust.balance = calculatedFinalBalance.value
  }

  uiStore.showModal(
    'Sales Invoice Created',
    `Invoice ${invoiceNo} generated for ${posForm.value.customer} (PKR ${cartGrandTotal.value.toLocaleString()}) dispatched under ${posForm.value.branch} Depot.`,
    'success'
  )

  uiStore.closeSaleModal()
}
</script>

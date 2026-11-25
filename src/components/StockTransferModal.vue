<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-3xl animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header pb-3 border-b border-slate-700/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-primary shrink-0">
            <ArrowRightLeft :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-main flex items-center gap-2">
              <span>Branch-to-Branch Equipment Transfer</span>
            </h3>
            <p class="text-[11px] text-slate-400">
              Transfer machine stock with Machine Codes, Quantities, Purchase Costs & Sale Prices
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Tab Navigation -->
          <div class="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-700/60 text-xs font-bold">
            <button
              type="button"
              @click="activeTab = 'transfer'"
              :class="['px-3 py-1 rounded-md transition-all', activeTab === 'transfer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
            >
              New Transfer
            </button>
            <button
              type="button"
              @click="activeTab = 'history'"
              :class="['px-3 py-1 rounded-md transition-all flex items-center gap-1.5', activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white']"
            >
              <History :size="13" />
              <span>Transfer Records ({{ dataStore.stockTransfers.length }})</span>
            </button>
          </div>

          <button @click="closeModal" class="btn btn-ghost text-slate-400 hover:text-white text-base">✕</button>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════
           TAB 1: NEW TRANSFER
      ═══════════════════════════════════════════════════════ -->
      <form v-if="activeTab === 'transfer'" @submit.prevent="handleStockTransfer" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="modal-body space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <!-- Branch Routing -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label text-xs font-bold">From Branch *</label>
              <select v-model="transferForm.fromBranch" required class="form-select font-bold text-xs">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label text-xs font-bold">To Branch *</label>
              <select v-model="transferForm.toBranch" required class="form-select font-bold text-xs">
                <option value="Multan">Multan Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>

          <!-- Real-Time Metrics & Value Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available</div>
              <div class="text-base font-black font-mono text-emerald-400 mt-0.5">
                {{ filteredSerialsForTransfer.length }} <span class="text-[10px] font-normal text-slate-400">units</span>
              </div>
            </div>
            <div class="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-800/40 text-center">
              <div class="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Selected</div>
              <div class="text-base font-black font-mono text-indigo-400 mt-0.5">
                {{ transferForm.selectedSerials.length }} <span class="text-[10px] font-normal text-slate-400">units</span>
              </div>
            </div>
            <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Total Purchase Cost</div>
              <div class="text-sm font-black font-mono text-emerald-400 mt-0.5 truncate" :title="'PKR ' + selectedMetrics.totalPurchaseCost.toLocaleString()">
                PKR {{ selectedMetrics.totalPurchaseCost.toLocaleString() }}
              </div>
            </div>
            <div class="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-center">
              <div class="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">Total Sale Value</div>
              <div class="text-sm font-black font-mono text-cyan-400 mt-0.5 truncate" :title="'PKR ' + selectedMetrics.totalSaleValue.toLocaleString()">
                PKR {{ selectedMetrics.totalSaleValue.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Search Product & Product Filter -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60">
            <div>
              <label class="form-label text-xs font-bold mb-1 flex items-center justify-between">
                <span>Search Product / Serial / MC</span>
                <span v-if="productSearch" @click="productSearch = ''" class="text-[10px] text-rose-400 cursor-pointer font-normal hover:underline">Clear</span>
              </label>
              <div class="relative">
                <Search :size="13" class="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  v-model="productSearch"
                  type="text"
                  placeholder="Filter name, SKU, SN, MC..."
                  class="form-input text-xs pl-8 w-full"
                />
              </div>
            </div>

            <div>
              <label class="form-label text-xs font-bold mb-1">Filter by Product</label>
              <select v-model="selectedProductId" class="form-select text-xs font-bold w-full">
                <option value="ALL">All Equipment ({{ availableSerialsForTransfer.length }} in {{ transferForm.fromBranch }})</option>
                <option v-for="p in availableProductsForBranch" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.count }} available)
                </option>
              </select>
            </div>
          </div>

          <!-- Quantity to Transfer Controls (High-Speed Batch Select for 1000s) -->
          <div class="p-3 bg-indigo-950/20 rounded-xl border border-indigo-800/40 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <label class="form-label text-xs font-bold mb-0 text-indigo-300">
                Transfer Quantity
              </label>
              <span class="text-[11px] text-slate-400">
                Available: <strong class="text-emerald-400 font-mono">{{ filteredSerialsForTransfer.length }}</strong> units
              </span>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <div class="relative w-28 shrink-0">
                <input
                  type="number"
                  min="0"
                  :max="filteredSerialsForTransfer.length"
                  v-model.number="transferQty"
                  @input="onTransferQtyChange"
                  class="form-input text-xs font-mono font-bold w-full pl-3 pr-2 py-1.5"
                  placeholder="0"
                />
              </div>

              <!-- Quick Batch Increments for Large Data Transfer -->
              <div class="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[10px] font-bold"
                  @click="adjustTransferQty(1)"
                  :disabled="transferQty >= filteredSerialsForTransfer.length"
                >
                  +1
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[10px] font-bold"
                  @click="adjustTransferQty(10)"
                  :disabled="transferQty >= filteredSerialsForTransfer.length"
                >
                  +10
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[10px] font-bold"
                  @click="adjustTransferQty(50)"
                  :disabled="transferQty >= filteredSerialsForTransfer.length"
                >
                  +50
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[10px] font-bold"
                  @click="adjustTransferQty(100)"
                  :disabled="transferQty >= filteredSerialsForTransfer.length"
                >
                  +100
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[10px] font-bold text-indigo-300"
                  @click="setTransferQty(filteredSerialsForTransfer.length)"
                >
                  Max ({{ filteredSerialsForTransfer.length }})
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-[10px] text-rose-400 hover:text-rose-300"
                  @click="setTransferQty(0)"
                >
                  Reset
                </button>
              </div>

              <span class="text-xs text-subtle font-mono font-bold ml-auto">
                <span class="text-emerald-400">{{ transferForm.selectedSerials.length }}</span> / {{ filteredSerialsForTransfer.length }} selected
              </span>
            </div>
          </div>

          <!-- Specific Serials Transfer List with Details (Machine Code, Purchase Cost, Sale Price) -->
          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label mb-0 text-xs font-bold flex items-center gap-2">
                <span>Select Specific Units to Transfer *</span>
                <span v-if="filteredSerialsForTransfer.length > pageSize" class="text-[10px] text-slate-400 font-normal">
                  (Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredSerialsForTransfer.length) }} of {{ filteredSerialsForTransfer.length }})
                </span>
              </label>

              <div class="flex items-center gap-2">
                <button
                  v-if="filteredSerialsForTransfer.length > 0"
                  type="button"
                  class="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                  @click="toggleSelectAllTransferSerials"
                >
                  {{ transferForm.selectedSerials.length === filteredSerialsForTransfer.length ? 'Deselect All' : 'Select All (' + filteredSerialsForTransfer.length + ')' }}
                </button>
              </div>
            </div>

            <!-- Virtual / Paginated Serial Cards (Butter-Smooth for 1000s of units) -->
            <div class="transfer-serial-picker max-h-64 space-y-1.5 overflow-y-auto pr-1">
              <label
                v-for="s in paginatedSerials"
                :key="s.serialCode"
                :class="['transfer-serial-card transition-colors flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer', isSerialSelected(s.serialCode) ? 'bg-indigo-950/30 border-indigo-500/70' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700']"
              >
                <input
                  type="checkbox"
                  :value="s.serialCode"
                  :checked="isSerialSelected(s.serialCode)"
                  @change="toggleSingleSerial(s.serialCode)"
                  class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <div class="flex items-center gap-2 min-w-0">
                      <!-- Serial Number -->
                      <span class="font-mono font-bold text-main text-xs">{{ (s.serialCode || '').replace(/^SN-/i, '') }}</span>
                      
                      <!-- Machine Code Prominent Display -->
                      <span class="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60">
                        MC: {{ s.machineCode || 'N/A' }}
                      </span>
                    </div>

                    <!-- Purchase & Sale Prices -->
                    <div class="flex items-center gap-2 shrink-0 text-[10px] font-mono">
                      <span class="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-bold" title="Purchase Cost">
                        Cost: PKR {{ getSerialCost(s).toLocaleString() }}
                      </span>
                      <span class="px-1.5 py-0.5 rounded bg-sky-950/60 border border-sky-800/50 text-sky-400 font-bold" title="Sale Price">
                        Sale: PKR {{ getSerialSalePrice(s).toLocaleString() }}
                      </span>
                    </div>
                  </div>

                  <div class="text-subtle text-[11px] truncate mt-1 flex items-center justify-between">
                    <span>{{ getProductNameForSerial(s) }} ({{ s.sku }})</span>
                    <span class="text-slate-400 text-[10px]">Branch: {{ s.allocationCity || transferForm.fromBranch }}</span>
                  </div>
                </div>
              </label>

              <div v-if="filteredSerialsForTransfer.length === 0" class="p-6 text-center text-xs text-subtle italic">
                {{ availableSerialsForTransfer.length === 0 ? `No available machine serial numbers found in ${transferForm.fromBranch} branch.` : 'No units match your product search criteria.' }}
              </div>
            </div>

            <!-- Page Switcher if > 50 units (Ensures instant 1000 item navigation) -->
            <div v-if="totalPages > 1" class="flex items-center justify-between pt-2 text-xs">
              <span class="text-[11px] text-slate-400">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="btn btn-secondary btn-xs text-[10px] px-2 py-0.5"
                >
                  Prev
                </button>
                <button
                  type="button"
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="btn btn-secondary btn-xs text-[10px] px-2 py-0.5"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- Transfer Notes -->
          <div class="form-group">
            <label class="form-label text-xs font-bold">Transfer Notes</label>
            <input v-model="transferForm.notes" type="text" placeholder="e.g. Inter-branch stock allocation..." class="form-input text-sm" />
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary flex items-center gap-1.5">
            <Check :size="16" />
            <span>Confirm Stock Transfer ({{ transferForm.selectedSerials.length }} Units)</span>
          </button>
        </div>
      </form>

      <!-- ═══════════════════════════════════════════════════════
           TAB 2: TRANSFER HISTORY & DETAILS
      ═══════════════════════════════════════════════════════ -->
      <div v-else class="modal-body space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div v-if="dataStore.stockTransfers.length === 0" class="p-8 text-center text-subtle text-xs italic">
          No branch stock transfers recorded yet.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="tr in dataStore.stockTransfers"
            :key="tr.transferNo"
            class="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-2.5"
          >
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-primary text-xs">{{ tr.transferNo }}</span>
                <span class="text-xs font-mono text-slate-400">{{ tr.transferDate }}</span>
                <span class="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-[10px] font-bold">
                  {{ tr.fromBranch }} ➔ {{ tr.toBranch }}
                </span>
              </div>

              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  Qty: {{ tr.totalQuantity || tr.serials?.length || 0 }} units
                </span>
                <button
                  type="button"
                  @click="toggleTransferExpanded(tr.transferNo)"
                  class="text-indigo-400 hover:text-indigo-300 text-xs font-bold underline"
                >
                  {{ expandedTransfers.includes(tr.transferNo) ? 'Hide Units' : 'View Units' }}
                </button>
              </div>
            </div>

            <!-- Total Valuation Badges -->
            <div class="flex items-center gap-3 text-[11px] font-mono flex-wrap bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
              <div>
                <span class="text-slate-400">Total Purchase Cost: </span>
                <strong class="text-emerald-400 font-bold">PKR {{ (tr.totalPurchaseValue || calculateTransferPurchase(tr)).toLocaleString() }}</strong>
              </div>
              <span class="text-slate-600">•</span>
              <div>
                <span class="text-slate-400">Total Sale Value: </span>
                <strong class="text-cyan-400 font-bold">PKR {{ (tr.totalSaleValue || calculateTransferSale(tr)).toLocaleString() }}</strong>
              </div>
              <div v-if="tr.notes" class="w-full text-slate-400 text-[10px] italic">
                Note: {{ tr.notes }}
              </div>
            </div>

            <!-- Expanded Units Details Table -->
            <div v-if="expandedTransfers.includes(tr.transferNo)" class="mt-2 border border-slate-800 rounded-lg overflow-hidden">
              <table class="w-full text-left text-[11px] border-collapse">
                <thead class="bg-slate-950 text-slate-400 font-bold">
                  <tr>
                    <th class="p-2">#</th>
                    <th class="p-2">Serial Number</th>
                    <th class="p-2">Machine Code</th>
                    <th class="p-2">Product Name & SKU</th>
                    <th class="p-2 text-right">Purchase Cost</th>
                    <th class="p-2 text-right">Sale Price</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                  <tr v-for="(u, uIdx) in tr.serials" :key="u.serialCode || uIdx" class="hover:bg-slate-800/30">
                    <td class="p-2 text-slate-500">{{ uIdx + 1 }}</td>
                    <td class="p-2 font-bold text-main">{{ (u.serialCode || '').replace(/^SN-/i, '') }}</td>
                    <td class="p-2 text-purple-400 font-bold">MC: {{ u.machineCode || 'N/A' }}</td>
                    <td class="p-2 font-sans text-slate-300">{{ u.productName || u.sku }}</td>
                    <td class="p-2 text-right text-emerald-400">PKR {{ (Number(u.purchasePrice) || 0).toLocaleString() }}</td>
                    <td class="p-2 text-right text-cyan-400">PKR {{ (Number(u.salePrice) || 0).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
import { ArrowRightLeft, Check, Search, History } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('transfer')
const expandedTransfers = ref([])

const productSearch = ref('')
const selectedProductId = ref('ALL')
const transferQty = ref(0)
const currentPage = ref(1)
const pageSize = ref(50)

const transferForm = ref({
  fromBranch: 'Peshawar',
  toBranch: 'Multan',
  selectedSerials: [],
  notes: ''
})

// O(1) Product lookup map for maximum speed when handling 1000s of units
const productsMap = computed(() => {
  const map = new Map()
  ;(dataStore.products || []).forEach(p => {
    if (p.id) map.set(String(p.id), p)
    if (p._id) map.set(String(p._id), p)
    if (p.sku) map.set(String(p.sku).toUpperCase(), p)
  })
  return map
})

function getProductForSerial(s) {
  if (!s) return null
  if (s.productId && productsMap.value.has(String(s.productId))) {
    return productsMap.value.get(String(s.productId))
  }
  if (s.sku && productsMap.value.has(String(s.sku).toUpperCase())) {
    return productsMap.value.get(String(s.sku).toUpperCase())
  }
  return null
}

function getProductNameForSerial(s) {
  const p = getProductForSerial(s)
  return p ? p.name : (s.sku || 'Equipment')
}

function getSerialCost(s) {
  if (s.purchasePrice !== undefined && s.purchasePrice !== null && s.purchasePrice !== '') {
    return Number(s.purchasePrice) || 0
  }
  if (s.costPrice !== undefined && s.costPrice !== null && s.costPrice !== '') {
    return Number(s.costPrice) || 0
  }
  const p = getProductForSerial(s)
  return Number(p?.purchasePrice || p?.costPrice || 0)
}

function getSerialSalePrice(s) {
  if (s.salePrice !== undefined && s.salePrice !== null && s.salePrice !== '') {
    return Number(s.salePrice) || 0
  }
  const p = getProductForSerial(s)
  return Number(p?.sellingPrice || p?.salePrice || p?.price || 0)
}

const availableSerialsForTransfer = computed(() => {
  return (dataStore.serials || []).filter(s => 
    (s.allocationCity || 'Peshawar') === transferForm.value.fromBranch && 
    s.status === 'Available'
  )
})

const availableProductsForBranch = computed(() => {
  const map = new Map()
  availableSerialsForTransfer.value.forEach(s => {
    const pName = getProductNameForSerial(s)
    const pId = s.productId || s.sku || pName
    if (!map.has(pId)) {
      map.set(pId, { id: pId, name: pName, sku: s.sku, count: 0 })
    }
    map.get(pId).count++
  })
  return Array.from(map.values())
})

const filteredSerialsForTransfer = computed(() => {
  const q = productSearch.value.trim().toLowerCase()
  const selProd = selectedProductId.value

  return availableSerialsForTransfer.value.filter(s => {
    // 1. Filter by product dropdown
    if (selProd !== 'ALL') {
      const pId = s.productId || s.sku || getProductNameForSerial(s)
      if (pId !== selProd && s.productId !== selProd && s.sku !== selProd) {
        return false
      }
    }
    // 2. Filter by search query
    if (q) {
      const pName = getProductNameForSerial(s).toLowerCase()
      const sku = (s.sku || '').toLowerCase()
      const sCode = (s.serialCode || '').toLowerCase()
      const mCode = (s.machineCode || '').toLowerCase()
      if (!pName.includes(q) && !sku.includes(q) && !sCode.includes(q) && !mCode.includes(q)) {
        return false
      }
    }
    return true
  })
})

// O(1) set for selected serials to prevent O(N^2) checks on 1000 items
const selectedSerialsSet = computed(() => new Set(transferForm.value.selectedSerials))

function isSerialSelected(serialCode) {
  return selectedSerialsSet.value.has(serialCode)
}

function toggleSingleSerial(serialCode) {
  const set = new Set(transferForm.value.selectedSerials)
  if (set.has(serialCode)) {
    set.delete(serialCode)
  } else {
    set.add(serialCode)
  }
  transferForm.value.selectedSerials = Array.from(set)
  onCheckboxChange()
}

// Pagination for fast rendering
const totalPages = computed(() => Math.ceil(filteredSerialsForTransfer.value.length / pageSize.value) || 1)

const paginatedSerials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredSerialsForTransfer.value.slice(start, start + pageSize.value)
})

// Selected financial metrics
const selectedMetrics = computed(() => {
  let cost = 0
  let sale = 0
  const set = selectedSerialsSet.value

  availableSerialsForTransfer.value.forEach(s => {
    if (set.has(s.serialCode)) {
      cost += getSerialCost(s)
      sale += getSerialSalePrice(s)
    }
  })

  return {
    totalPurchaseCost: cost,
    totalSaleValue: sale
  }
})

function onTransferQtyChange() {
  const max = filteredSerialsForTransfer.value.length
  let qty = Math.max(0, Math.min(Number(transferQty.value) || 0, max))
  transferQty.value = qty
  
  const targetSerials = filteredSerialsForTransfer.value.slice(0, qty).map(s => s.serialCode)
  const filteredSet = new Set(filteredSerialsForTransfer.value.map(s => s.serialCode))
  const preservedOthers = transferForm.value.selectedSerials.filter(s => !filteredSet.has(s))
  transferForm.value.selectedSerials = [...preservedOthers, ...targetSerials]
}

function adjustTransferQty(delta) {
  const max = filteredSerialsForTransfer.value.length
  let newQty = (transferQty.value || 0) + delta
  newQty = Math.max(0, Math.min(newQty, max))
  transferQty.value = newQty
  onTransferQtyChange()
}

function setTransferQty(qty) {
  transferQty.value = qty
  onTransferQtyChange()
}

function onCheckboxChange() {
  const filteredSet = new Set(filteredSerialsForTransfer.value.map(s => s.serialCode))
  const selectedInFiltered = transferForm.value.selectedSerials.filter(s => filteredSet.has(s))
  transferQty.value = selectedInFiltered.length
}

watch(() => transferForm.value.fromBranch, () => {
  transferForm.value.selectedSerials = []
  transferQty.value = 0
  productSearch.value = ''
  selectedProductId.value = 'ALL'
  currentPage.value = 1
})

watch([productSearch, selectedProductId], () => {
  currentPage.value = 1
  const filteredSet = new Set(filteredSerialsForTransfer.value.map(s => s.serialCode))
  const selectedInFiltered = transferForm.value.selectedSerials.filter(s => filteredSet.has(s))
  transferQty.value = selectedInFiltered.length
})

function toggleSelectAllTransferSerials() {
  const filteredCodes = filteredSerialsForTransfer.value.map(s => s.serialCode)
  const allFilteredSelected = filteredCodes.every(c => selectedSerialsSet.value.has(c))

  if (allFilteredSelected) {
    const filteredSet = new Set(filteredCodes)
    transferForm.value.selectedSerials = transferForm.value.selectedSerials.filter(c => !filteredSet.has(c))
    transferQty.value = 0
  } else {
    const set = new Set([...transferForm.value.selectedSerials, ...filteredCodes])
    transferForm.value.selectedSerials = Array.from(set)
    transferQty.value = filteredCodes.length
  }
}

function toggleTransferExpanded(transferNo) {
  const idx = expandedTransfers.value.indexOf(transferNo)
  if (idx >= 0) {
    expandedTransfers.value.splice(idx, 1)
  } else {
    expandedTransfers.value.push(transferNo)
  }
}

function calculateTransferPurchase(tr) {
  return (tr.serials || []).reduce((acc, u) => acc + (Number(u.purchasePrice) || 0), 0)
}

function calculateTransferSale(tr) {
  return (tr.serials || []).reduce((acc, u) => acc + (Number(u.salePrice) || 0), 0)
}

function closeModal() {
  emit('close')
}

async function handleStockTransfer() {
  if (!transferForm.value.selectedSerials.length) {
    uiStore.showModal('Transfer Error', 'Please select at least 1 machine serial to transfer.', 'warning')
    return
  }
  if (transferForm.value.fromBranch === transferForm.value.toBranch) {
    uiStore.showModal('Transfer Error', 'Destination branch must be different from source branch.', 'warning')
    return
  }

  await dataStore.transferBranchStock(
    {
      selectedSerials: transferForm.value.selectedSerials,
      fromBranch: transferForm.value.fromBranch,
      toBranch: transferForm.value.toBranch,
      notes: transferForm.value.notes
    },
    authStore.user
  )

  uiStore.showModal('Transfer Complete', `Transferred ${transferForm.value.selectedSerials.length} unit(s) from ${transferForm.value.fromBranch} to ${transferForm.value.toBranch}.`, 'success')
  transferForm.value.selectedSerials = []
  transferForm.value.notes = ''
  transferQty.value = 0
  emit('success')
  closeModal()
}
</script>

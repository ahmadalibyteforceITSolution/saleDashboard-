<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-xl animate-scale-up">
      <div class="modal-header">
        <h3 class="text-xl font-bold text-main flex items-center gap-2">
          <ArrowRightLeft :size="20" class="text-primary" />
          <span>Branch-to-Branch Equipment Transfer</span>
        </h3>
        <button @click="closeModal" class="btn btn-ghost text-slate-400">✕</button>
      </div>

      <form @submit.prevent="handleStockTransfer" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">From Branch *</label>
              <select v-model="transferForm.fromBranch" required class="form-select font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">To Branch *</label>
              <select v-model="transferForm.toBranch" required class="form-select font-bold">
                <option value="Multan">Multan Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
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

          <!-- Quantity to Transfer Controls -->
          <div class="p-3 bg-indigo-950/20 rounded-xl border border-indigo-800/40 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <label class="form-label text-xs font-bold mb-0 text-indigo-300">
                Transfer Quantity
              </label>
              <span class="text-[11px] text-slate-400">
                Available to transfer: <strong class="text-emerald-400 font-mono">{{ filteredSerialsForTransfer.length }}</strong> units
              </span>
            </div>

            <div class="flex items-center gap-2">
              <div class="relative w-32 shrink-0">
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

              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[11px] font-bold"
                  @click="adjustTransferQty(1)"
                  :disabled="transferQty >= filteredSerialsForTransfer.length"
                >
                  +1
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[11px] font-bold"
                  @click="adjustTransferQty(-1)"
                  :disabled="transferQty <= 0"
                >
                  -1
                </button>
                <button
                  type="button"
                  class="btn btn-secondary btn-xs text-[11px] font-bold text-indigo-300"
                  @click="setTransferQty(filteredSerialsForTransfer.length)"
                >
                  Max ({{ filteredSerialsForTransfer.length }})
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-[11px] text-rose-400 hover:text-rose-300"
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

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label mb-0 text-xs font-bold">Select Specific Serials to Transfer *</label>
              <div class="flex items-center gap-3">
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
            <div class="transfer-serial-picker max-h-56">
              <label
                v-for="s in filteredSerialsForTransfer"
                :key="s.serialCode"
                :class="['transfer-serial-card', transferForm.selectedSerials.includes(s.serialCode) ? 'selected' : '']"
              >
                <input
                  type="checkbox"
                  :value="s.serialCode"
                  v-model="transferForm.selectedSerials"
                  @change="onCheckboxChange"
                  class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-main text-xs">{{ (s.serialCode || '').replace(/^SN-/i, '') }}</span>
                    <span class="font-mono text-purple-400 font-bold text-xs">({{ s.machineCode }})</span>
                  </div>
                  <div class="text-subtle text-[11px] truncate">{{ getProductNameForSerial(s) }} ({{ s.sku }}) • Branch: {{ s.allocationCity || 'Peshawar' }}</div>
                </div>
              </label>
              <div v-if="filteredSerialsForTransfer.length === 0" class="p-6 text-center text-xs text-subtle italic">
                {{ availableSerialsForTransfer.length === 0 ? `No available machine serial numbers found in ${transferForm.fromBranch} branch.` : 'No units match your product search criteria.' }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label text-xs font-bold">Transfer Notes</label>
            <input v-model="transferForm.notes" type="text" placeholder="e.g. Inter-branch stock allocation..." class="form-input text-sm" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary">
            <Check :size="16" />
            <span>Confirm Stock Transfer</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { ArrowRightLeft, Check, Search } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const productSearch = ref('')
const selectedProductId = ref('ALL')
const transferQty = ref(0)

const transferForm = ref({
  fromBranch: 'Peshawar',
  toBranch: 'Multan',
  selectedSerials: [],
  notes: ''
})

const availableSerialsForTransfer = computed(() => {
  return dataStore.serials.filter(s => 
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
  return availableSerialsForTransfer.value.filter(s => {
    // 1. Filter by product dropdown
    if (selectedProductId.value !== 'ALL') {
      const pId = s.productId || s.sku || getProductNameForSerial(s)
      if (pId !== selectedProductId.value && s.productId !== selectedProductId.value && s.sku !== selectedProductId.value) {
        return false
      }
    }
    // 2. Filter by search query
    if (productSearch.value.trim()) {
      const q = productSearch.value.trim().toLowerCase()
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
})

watch([productSearch, selectedProductId], () => {
  const filteredSet = new Set(filteredSerialsForTransfer.value.map(s => s.serialCode))
  const selectedInFiltered = transferForm.value.selectedSerials.filter(s => filteredSet.has(s))
  transferQty.value = selectedInFiltered.length
})

function toggleSelectAllTransferSerials() {
  const filteredCodes = filteredSerialsForTransfer.value.map(s => s.serialCode)
  const allFilteredSelected = filteredCodes.every(c => transferForm.value.selectedSerials.includes(c))

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

function getProductNameForSerial(s) {
  const p = dataStore.products.find(prod => 
    (prod.id && (prod.id === s.productId || prod.id === String(s.productId))) || 
    (prod._id && (prod._id === s.productId || prod._id === String(s.productId))) || 
    (prod.sku && s.sku && prod.sku.toUpperCase() === s.sku.toUpperCase())
  )
  return p ? p.name : (s.sku || 'Equipment')
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
  emit('success')
  closeModal()
}
</script>

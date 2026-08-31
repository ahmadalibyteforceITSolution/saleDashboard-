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

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label mb-0">Select Available Serials to Transfer *</label>
              <div class="flex items-center gap-3">
                <button
                  v-if="availableSerialsForTransfer.length > 0"
                  type="button"
                  class="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                  @click="toggleSelectAllTransferSerials"
                >
                  {{ transferForm.selectedSerials.length === availableSerialsForTransfer.length ? 'Deselect All' : 'Select All (' + availableSerialsForTransfer.length + ')' }}
                </button>
                <span class="text-xs text-subtle font-mono font-bold">{{ transferForm.selectedSerials.length }} selected</span>
              </div>
            </div>
            <div class="transfer-serial-picker">
              <label
                v-for="s in availableSerialsForTransfer"
                :key="s.serialCode"
                :class="['transfer-serial-card', transferForm.selectedSerials.includes(s.serialCode) ? 'selected' : '']"
              >
                <input
                  type="checkbox"
                  :value="s.serialCode"
                  v-model="transferForm.selectedSerials"
                  class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-main text-xs">{{ s.serialCode }}</span>
                    <span class="font-mono text-purple-400 font-bold text-xs">({{ s.machineCode }})</span>
                  </div>
                  <div class="text-subtle text-[11px] truncate">{{ getProductNameForSerial(s) }} ({{ s.sku }}) • Branch: {{ s.allocationCity || 'Peshawar' }}</div>
                </div>
              </label>
              <div v-if="availableSerialsForTransfer.length === 0" class="p-6 text-center text-xs text-subtle italic">
                No available machine serial numbers found in {{ transferForm.fromBranch }} branch.
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Transfer Notes</label>
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
import { ArrowRightLeft, Check } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

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

watch(() => transferForm.value.fromBranch, () => {
  transferForm.value.selectedSerials = []
})

function toggleSelectAllTransferSerials() {
  const avail = availableSerialsForTransfer.value.map(s => s.serialCode)
  if (transferForm.value.selectedSerials.length === avail.length) {
    transferForm.value.selectedSerials = []
  } else {
    transferForm.value.selectedSerials = [...avail]
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

<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-xl animate-scale-up">
      <div class="modal-header">
        <h3 class="text-lg font-bold text-main flex items-center gap-2">
          <PackagePlus :size="20" class="text-emerald-400" />
          <span>Add New Medical Equipment SKU</span>
        </h3>
        <button @click="closeModal" class="btn-icon text-slate-400 hover:text-white">✕</button>
      </div>

      <form @submit.prevent="handleCreateProduct" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input v-model="newProductForm.name" type="text" required placeholder="e.g. 10 Inch Portable Ultrasound System" class="form-input text-sm font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label">Serial Number *</label>
              <input v-model="newProductForm.sku" type="text" required placeholder="e.g. MED-US-10P" class="form-input text-sm font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="newProductForm.category" required class="form-select text-sm font-bold">
                <option value="Ultrasound Machines">Ultrasound Machines</option>
                <option value="Laser Machines">Laser Machines</option>
                <option value="ECG & Diagnostic Systems">ECG & Diagnostic Systems</option>
                <option value="X-Ray & Radiology Devices">X-Ray & Radiology Devices</option>
                <option value="Surgical Equipment">Surgical Equipment</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">HSN Code *</label>
              <input v-model="newProductForm.hsnCode" type="text" required placeholder="e.g. 9018.1200" class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Cost Price (PKR) *</label>
              <input v-model.number="newProductForm.costPrice" type="number" required min="0" class="form-input text-sm font-mono font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label">Sale Price (PKR) *</label>
              <input v-model.number="newProductForm.salePrice" type="number" required min="0" class="form-input text-sm font-mono font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label">Sales Tax % *</label>
              <input v-model.number="newProductForm.taxRatio" type="number" required min="0" max="100" class="form-input text-sm font-mono font-bold" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Initial Stock Quantity *</label>
              <input
                v-model.number="newProductForm.stockQty"
                type="number"
                required
                min="1"
                class="form-input text-sm font-mono font-bold"
                placeholder="e.g. 10"
              />
              <p class="text-xs text-subtle mt-1">Serial numbers will be auto-generated for each unit.</p>
            </div>

            <div class="form-group">
              <label class="form-label">Primary Branch Allocation *</label>
              <select v-model="newProductForm.allocationCity" required class="form-select text-sm font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>

          <!-- Machine Code Entry -->
          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label mb-0">
                Machine Codes
                <span class="text-xs text-subtle font-normal">(optional — press Enter or comma to add each)</span>
              </label>
              <span
                :class="[
                  'text-xs font-mono font-bold px-2 py-0.5 rounded-full',
                  newMachineList.length > 0 && newMachineList.length === newProductForm.stockQty
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : newMachineList.length > (newProductForm.stockQty || 0)
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-700 text-subtle'
                ]"
              >
                {{ newMachineList.length }} / {{ newProductForm.stockQty || 0 }}
              </span>
            </div>

            <div
              class="chip-input-area"
              @click="focusMachineInput"
            >
              <span
                v-for="(mc, idx) in newMachineList"
                :key="idx"
                class="chip-tag machine"
              >
                {{ mc }}
                <button type="button" @click.stop="removeNewMachineCode(idx)" title="Remove">✕</button>
              </span>
              <input
                ref="machineInputRef"
                v-model="newMachineInput"
                type="text"
                placeholder="e.g. MC-312 then press Enter…"
                @keydown="onNewMachineKeydown"
                @blur="handleMachineInputBlur"
              />
            </div>

            <p
              v-if="newMachineList.length > 0 && newMachineList.length === newProductForm.stockQty"
              class="text-xs text-emerald-400 font-semibold mt-1"
            >
              ✅ {{ newMachineList.length }} machine code(s) matched to quantity — ready to save!
            </p>
            <p
              v-else-if="newMachineList.length > (newProductForm.stockQty || 0)"
              class="text-xs text-red-400 font-semibold mt-1"
            >
              ⚠️ Too many machine codes ({{ newMachineList.length }}) — exceeds qty ({{ newProductForm.stockQty }})
            </p>
            <p v-else class="text-xs text-subtle mt-1">
              If left empty, machine codes are auto-generated. If provided, count must exactly match quantity.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Technical Notes & Specifications</label>
            <input v-model="newProductForm.description" type="text" placeholder="e.g. Dual probe support, 3D Doppler imaging..." class="form-input text-sm" />
          </div>

          <div class="form-group">
            <label class="form-label">Equipment Product Image (Optional)</label>
            <div class="glass-panel p-4 border border-slate-800 rounded-xl">
              <input type="file" ref="addFileInput" accept="image/*" style="display: none;" @change="handleImageUpload" />
              
              <div v-if="newProductForm.image" class="flex items-center gap-4">
                <div class="relative flex-shrink-0">
                  <img :src="newProductForm.image" class="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500/30 shadow-lg" />
                  <button type="button" @click="newProductForm.image = ''" class="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg" title="Remove Image">✕</button>
                </div>
                <div class="space-y-2">
                  <div class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check :size="14" />
                    <span>Local Image Attached</span>
                  </div>
                  <button type="button" @click="$refs.addFileInput.click()" class="btn btn-secondary btn-xs">
                    <Upload :size="12" class="text-indigo-400" />
                    <span>Change Image</span>
                  </button>
                </div>
              </div>

              <div v-else class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border border-dashed border-slate-700/70 rounded-lg bg-slate-900/40">
                <div class="flex items-center gap-3 text-slate-400 text-xs">
                  <ImageIcon :size="20" class="text-indigo-400 flex-shrink-0" />
                  <span>No image selected for this equipment.</span>
                </div>
                <button type="button" @click="$refs.addFileInput.click()" class="btn btn-secondary btn-sm w-full sm:w-auto">
                  <Upload :size="14" class="text-indigo-400" />
                  <span>Upload Local Image File</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-success">
            <Check :size="16" />
            <span>Save Medical Equipment SKU</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { PackagePlus, ImageIcon, Upload, Check } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const newProductForm = ref({
  name: '',
  sku: '',
  category: 'Ultrasound Machines',
  costPrice: 0,
  salePrice: 0,
  hsnCode: '',
  taxRatio: 18,
  minStock: 2,
  stockQty: 0,
  allocationCity: 'Peshawar',
  description: '',
  image: ''
})

const newMachineInput = ref('')
const newMachineList = ref([])
const machineInputRef = ref(null)
const addFileInput = ref(null)

function focusMachineInput() {
  if (machineInputRef.value) {
    machineInputRef.value.focus()
  }
}

function addNewMachineCode() {
  const val = newMachineInput.value.trim().toUpperCase()
  if (!val) return
  if (newMachineList.value.includes(val)) {
    uiStore.showModal('Duplicate Code', `Machine code "${val}" has already been added.`, 'warning')
    return
  }
  newMachineList.value.push(val)
  newMachineInput.value = ''
}

function removeNewMachineCode(idx) {
  newMachineList.value.splice(idx, 1)
}

function onNewMachineKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addNewMachineCode()
  }
}

function handleMachineInputBlur() {
  if (newMachineInput.value.trim()) {
    addNewMachineCode()
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    newProductForm.value.image = e.target.result
  }
  reader.readAsDataURL(file)
}

function closeModal() {
  emit('close')
}

async function handleCreateProduct() {
  if (!newProductForm.value.name || !newProductForm.value.sku) {
    uiStore.showModal('Error', 'Product Name and SKU are required.', 'warning')
    return
  }

  const qty = Number(newProductForm.value.stockQty) || 0

  if (newMachineInput.value.trim()) addNewMachineCode()

  if (qty < 1) {
    uiStore.showModal('Quantity Error', 'Stock Quantity must be at least 1.', 'warning')
    return
  }

  if (newMachineList.value.length > 0 && newMachineList.value.length !== qty) {
    uiStore.showModal(
      'Machine Code Mismatch ⚠️',
      `You entered ${newMachineList.value.length} machine code(s) but the stock quantity is ${qty}.\n\nEither enter exactly ${qty} machine codes (one per unit), or leave the Machine Codes field completely empty.`,
      'warning'
    )
    return
  }

  const newProd = {
    id: `prd_${Date.now()}`,
    name: newProductForm.value.name,
    sku: newProductForm.value.sku.toUpperCase(),
    category: newProductForm.value.category,
    costPrice: Number(newProductForm.value.costPrice),
    salePrice: Number(newProductForm.value.salePrice),
    sellingPrice: Number(newProductForm.value.salePrice),
    hsnCode: newProductForm.value.hsnCode,
    taxRatio: Number(newProductForm.value.taxRatio),
    minStock: Number(newProductForm.value.minStock || 2),
    stockQty: qty,
    allocationCity: newProductForm.value.allocationCity || 'Peshawar',
    allocationCities: [newProductForm.value.allocationCity || 'Peshawar'],
    description: newProductForm.value.description,
    image: newProductForm.value.image || '',
    manualMachineCodes: newMachineList.value.length === qty ? [...newMachineList.value] : []
  }

  await dataStore.addProduct(newProd, authStore.user)

  uiStore.showModal(
    'Success ✅',
    `Created "${newProd.name}" (${newProd.sku}) with ${qty} serial number(s) auto-generated.`,
    'success'
  )

  newProductForm.value = {
    name: '', sku: '', category: 'Ultrasound Machines',
    costPrice: 0, salePrice: 0, hsnCode: '', taxRatio: 18,
    minStock: 2, stockQty: 0, allocationCity: 'Peshawar',
    description: '', image: ''
  }
  newMachineList.value = []
  newMachineInput.value = ''
  
  emit('success')
  closeModal()
}
</script>

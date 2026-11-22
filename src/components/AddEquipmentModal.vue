<template>
  <div v-if="show" class="modal-backdrop z-50 flex items-center justify-center p-0 sm:p-3" @click.self="closeModal">
    <div class="modal-content modal-pos-invoice flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 rounded-none sm:rounded-xl w-full max-w-2xl max-h-[100dvh] sm:max-h-[92vh]">
      
      <!-- Top Header Bar matching GlobalSale & GlobalPurchase -->
      <div class="px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-100 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0">
        <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <span class="text-xs sm:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase flex items-center gap-1.5 shrink-0">
            <PackagePlus :size="18" class="text-emerald-500 shrink-0" />
            <span>Add Medical Equipment</span>
          </span>
          <span class="badge badge-success text-[9px] sm:text-[10px] font-mono py-0.5 px-1.5 sm:px-2 font-bold truncate">
            SKU & CATALOG MASTER
          </span>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <!-- Branch Indicator or Selector -->
          <div class="flex items-center gap-1 bg-slate-200 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-[10px] sm:text-xs">
            <span v-if="!authStore.isSuperAdmin" class="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
            </span>
            <select v-else v-model="newProductForm.allocationCity" class="bg-transparent text-emerald-700 dark:text-emerald-400 font-bold focus:outline-none cursor-pointer">
              <option value="Peshawar" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Peshawar HO</option>
              <option value="Lahore" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Lahore Branch</option>
              <option value="Multan" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Multan Branch</option>
              <option value="Islamabad" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Islamabad Branch</option>
              <option value="Karachi" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Karachi Branch</option>
            </select>
          </div>

          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-base sm:text-lg font-bold cursor-pointer">✕</button>
        </div>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleCreateProduct" class="flex flex-col flex-1 overflow-hidden m-0">
        <div class="p-3 sm:p-5 space-y-3.5 text-xs bg-slate-50/50 dark:bg-transparent flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Equipment Name *</label>
            <input
              v-model="newProductForm.name"
              type="text"
              required
              placeholder="e.g. 10 Inch Portable Ultrasound System / 12D HIFU Machine"
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category *</label>
              <select
                v-model="newProductForm.category"
                required
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="Ultrasound Machines">Ultrasound Machines</option>
                <option value="Laser Machines">Laser Machines</option>
                <option value="ECG & Diagnostic Systems">ECG & Diagnostic Systems</option>
                <option value="X-Ray & Radiology Devices">X-Ray & Radiology Devices</option>
                <option value="Surgical Equipment">Surgical Equipment</option>
              </select>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">HSN / Tariff Code *</label>
              <input
                v-model="newProductForm.hsnCode"
                type="text"
                required
                placeholder="e.g. 9018.1200"
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cost Price (PKR) *</label>
              <input
                v-model.number="newProductForm.costPrice"
                type="number"
                required
                min="0"
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sale Price (PKR) *</label>
              <input
                v-model.number="newProductForm.salePrice"
                type="number"
                required
                min="0"
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Sales Tax % *</label>
              <input
                v-model.number="newProductForm.taxRatio"
                type="number"
                required
                min="0"
                max="100"
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Stock Qty *</label>
              <input
                v-model.number="newProductForm.stockQty"
                type="number"
                required
                min="1"
                placeholder="e.g. 10"
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
              />
              <p class="text-[10px] text-slate-400 mt-1">Serials generated automatically.</p>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Min Stock Alert *</label>
              <input
                v-model.number="newProductForm.minStock"
                type="number"
                required
                min="0"
                placeholder="e.g. 5"
                class="w-full bg-white dark:bg-[#1e293b] border border-amber-300 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500 shadow-sm"
              />
              <p class="text-[10px] text-slate-400 mt-1">Triggers low stock alert when &le; level.</p>
            </div>

            <div>
              <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Branch Allocation *</label>
              <div
                v-if="!authStore.isSuperAdmin"
                class="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between shadow-inner select-none cursor-not-allowed"
              >
                <span>📍 {{ authStore.userBranch || 'Lahore' }}</span>
                <span class="badge badge-success text-[9px] py-0 px-1 font-mono">Locked</span>
              </div>
              <select
                v-else
                v-model="newProductForm.allocationCity"
                required
                class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
              >
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
                <option value="Karachi">Karachi Branch</option>
              </select>
            </div>
          </div>

          <!-- Machine Codes Entry -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                Machine Codes
                <span class="text-[11px] text-slate-400 font-normal">(optional — press Enter or comma to add each)</span>
              </label>
              <span
                :class="[
                  'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full',
                  newMachineList.length > 0 && newMachineList.length === newProductForm.stockQty
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : newMachineList.length > (newProductForm.stockQty || 0)
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                ]"
              >
                {{ newMachineList.length }} / {{ newProductForm.stockQty || 0 }}
              </span>
            </div>

            <div
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg p-2 min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-text"
              @click="focusMachineInput"
            >
              <span
                v-for="(mc, idx) in newMachineList"
                :key="idx"
                class="bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm"
              >
                {{ mc }}
                <button type="button" @click.stop="removeNewMachineCode(idx)" class="text-rose-500 hover:text-rose-700 font-bold text-xs" title="Remove">✕</button>
              </span>
              <input
                ref="machineInputRef"
                v-model="newMachineInput"
                type="text"
                placeholder="e.g. MC-312 then press Enter…"
                class="bg-transparent border-0 outline-none text-slate-900 dark:text-white text-xs flex-1 min-w-[140px]"
                @keydown="onNewMachineKeydown"
                @blur="handleMachineInputBlur"
              />
            </div>

            <p
              v-if="newMachineList.length > 0 && newMachineList.length === newProductForm.stockQty"
              class="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1"
            >
              ✅ {{ newMachineList.length }} machine code(s) matched to quantity — ready to save!
            </p>
            <p
              v-else-if="newMachineList.length > (newProductForm.stockQty || 0)"
              class="text-[11px] text-red-500 font-bold mt-1"
            >
              ⚠️ Too many machine codes ({{ newMachineList.length }}) — exceeds qty ({{ newProductForm.stockQty }})
            </p>
            <p v-else class="text-[10px] text-slate-400 mt-1">
              If left empty, machine codes are auto-generated. If provided, count must match quantity.
            </p>
          </div>

          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Technical Notes & Specifications</label>
            <input
              v-model="newProductForm.description"
              type="text"
              placeholder="e.g. Dual probe support, 3D Doppler imaging, 220V power adapter..."
              class="w-full bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          <!-- Product Image Attachment -->
          <div>
            <label class="font-bold text-slate-700 dark:text-slate-300 block mb-1">Equipment Photo / Catalog Image (Optional)</label>
            <div class="bg-white dark:bg-[#1e293b] p-3 border border-slate-300 dark:border-slate-700 rounded-lg">
              <input type="file" ref="addFileInput" accept="image/*" style="display: none;" @change="handleImageUpload" />
              
              <div v-if="newProductForm.image" class="flex items-center gap-4">
                <div class="relative flex-shrink-0">
                  <img :src="newProductForm.image" class="w-16 h-16 rounded-lg object-cover border-2 border-emerald-500/40 shadow-md" />
                  <button type="button" @click="newProductForm.image = ''" class="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg cursor-pointer" title="Remove Image">✕</button>
                </div>
                <div class="space-y-1">
                  <div class="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check :size="14" />
                    <span>Image Attached</span>
                  </div>
                  <button type="button" @click="$refs.addFileInput.click()" class="btn btn-secondary btn-xs font-bold cursor-pointer">
                    <Upload :size="12" class="text-emerald-500" />
                    <span>Change Image</span>
                  </button>
                </div>
              </div>

              <div v-else class="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 border border-dashed border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900/60">
                <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                  <ImageIcon :size="18" class="text-emerald-500 flex-shrink-0" />
                  <span>No image selected for this equipment.</span>
                </div>
                <button type="button" @click="$refs.addFileInput.click()" class="btn btn-secondary text-xs px-3 py-1 font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload :size="13" class="text-emerald-500" />
                  <span>Upload Local File</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Footer Bar -->
        <div class="px-5 py-3.5 bg-slate-100 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="btn btn-primary bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-2.5 rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Check :size="15" />
            <span>Save & Add to Catalog</span>
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
import { compressAndConvertToBase64 } from '@/utils/imageOptimizer'

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

async function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const base64 = await compressAndConvertToBase64(file, 600, 600, 0.85)
    newProductForm.value.image = base64
  } catch (err) {
    uiStore.showModal('Image File Too Large', err.message || 'Failed to process image file.', 'warning')
  }
}

function closeModal() {
  emit('close')
}

async function handleCreateProduct() {
  if (!newProductForm.value.name?.trim()) {
    uiStore.showModal('Error', 'Product Name is required.', 'warning')
    return
  }

  const cleanName = newProductForm.value.name.trim()
  const generatedSku = cleanName.replace(/[^A-Za-z0-9]/g, '').substring(0, 6).toUpperCase() || 'EQP'
  const finalSku = (newProductForm.value.sku && newProductForm.value.sku.trim())
    ? newProductForm.value.sku.trim().toUpperCase()
    : `${generatedSku}-${Date.now().toString().slice(-4)}`

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
    name: cleanName,
    sku: finalSku,
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

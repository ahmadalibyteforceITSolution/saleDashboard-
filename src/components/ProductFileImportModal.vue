<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-3xl animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="flex items-center gap-2">
          <FileSpreadsheet :size="22" class="text-emerald-400" />
          <h3 class="text-xl font-bold text-main">Import Products from File (Excel / Word / PDF)</h3>
        </div>
        <button @click="closeModal" class="btn-icon text-slate-400 hover:text-white">✕</button>
      </div>

      <div class="modal-body space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        <!-- File Dropzone -->
        <div
          class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer bg-slate-900/50 hover:bg-slate-900/80"
          :class="isDragging ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-700'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="$refs.fileInputRef.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,.xls,.docx,.doc,.pdf,.csv,.txt"
            style="display: none;"
            @change="handleFileInputChange"
          />

          <div class="w-14 h-14 rounded-2xl bg-indigo-950/60 text-indigo-400 mx-auto flex items-center justify-center mb-3 border border-indigo-800/40">
            <Upload :size="26" />
          </div>

          <h4 class="font-bold text-white text-base">
            Click to upload or drag & drop equipment file
          </h4>
          <p class="text-xs text-subtle mt-1 max-w-md mx-auto">
            Supports <strong class="text-emerald-400">Excel (.xlsx, .xls, .csv)</strong>, <strong class="text-blue-400">Word (.docx, .doc)</strong>, and <strong class="text-purple-400">PDF (.pdf)</strong> packing lists or equipment sheets.
          </p>

          <div v-if="selectedFileName" class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-700 text-xs text-emerald-300 font-mono">
            <Check :size="14" />
            <span>Loaded: {{ selectedFileName }}</span>
          </div>
        </div>

        <!-- Parsing Status / Loading -->
        <div v-if="parsing" class="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <div class="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-xs text-slate-300 font-medium">Extracting equipment data from document...</p>
        </div>

        <!-- Parsed Products Preview Table -->
        <div v-if="parsedProducts.length > 0" class="space-y-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="badge badge-success font-mono font-bold">{{ parsedProducts.length }} Products Detected</span>
              <span class="text-xs text-subtle">Review extracted items before importing</span>
            </div>
            <button
              type="button"
              @click="parsedProducts = []"
              class="text-xs text-red-400 hover:underline"
            >
              Clear
            </button>
          </div>

          <div class="table-container max-h-60 overflow-y-auto border border-slate-800 rounded-xl">
            <table class="table-lined text-xs">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Cost (PKR)</th>
                  <th>Sale (PKR)</th>
                  <th>Stock Qty</th>
                  <th>Branch</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in parsedProducts" :key="idx">
                  <td class="font-mono text-slate-400">{{ idx + 1 }}</td>
                  <td>
                    <input v-model="p.name" class="form-input text-xs py-1 px-2 font-bold min-w-[140px]" />
                  </td>
                  <td>
                    <input v-model="p.sku" class="form-input font-mono text-xs py-1 px-2 uppercase min-w-[90px]" />
                  </td>
                  <td>
                    <select v-model="p.category" class="form-select text-xs py-1 px-2">
                      <option value="Ultrasound Machines">Ultrasound</option>
                      <option value="Laser Machines">Laser</option>
                      <option value="ECG & Diagnostic Systems">ECG / Diag</option>
                      <option value="Medical Equipment">General Med</option>
                    </select>
                  </td>
                  <td>
                    <input v-model.number="p.costPrice" type="number" class="form-input font-mono text-xs py-1 px-2 min-w-[80px]" />
                  </td>
                  <td>
                    <input v-model.number="p.sellingPrice" type="number" class="form-input font-mono text-xs py-1 px-2 min-w-[80px] text-emerald-400 font-bold" />
                  </td>
                  <td>
                    <input v-model.number="p.stockQty" type="number" min="1" class="form-input font-mono text-xs py-1 px-2 min-w-[50px] font-bold" />
                  </td>
                  <td>
                    <select v-model="p.allocationCity" class="form-select text-xs py-1 px-2">
                      <option value="Peshawar">Peshawar</option>
                      <option value="Multan">Multan</option>
                      <option value="Lahore">Lahore</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" @click="parsedProducts.splice(idx, 1)" class="text-red-400 hover:text-red-300">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
        <button
          type="button"
          @click="commitImport"
          :disabled="parsedProducts.length === 0"
          class="btn btn-success"
        >
          <Check :size="16" />
          <span>Confirm & Import {{ parsedProducts.length }} Products to Inventory</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { parseProductFile } from '@/utils/productFileParser'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { FileSpreadsheet, Upload, Check } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['close', 'success'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const fileInputRef = ref(null)
const isDragging = ref(false)
const parsing = ref(false)
const selectedFileName = ref('')
const parsedProducts = ref([])

function closeModal() {
  parsedProducts.value = []
  selectedFileName.value = ''
  emit('close')
}

async function handleFileInputChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function handleFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file) processFile(file)
}

async function processFile(file) {
  selectedFileName.value = file.name
  parsing.value = true
  try {
    const results = await parseProductFile(file)
    parsedProducts.value = results
    if (results.length === 0) {
      uiStore.showModal('Empty Results', 'No valid product rows could be detected in this file.', 'warning')
    }
  } catch (err) {
    uiStore.showModal('File Parsing Error', err.message || 'Could not parse the uploaded file.', 'danger')
  } finally {
    parsing.value = false
  }
}

async function commitImport() {
  if (parsedProducts.value.length === 0) return

  await dataStore.bulkImportProducts(parsedProducts.value, authStore.user)

  uiStore.showModal(
    'Import Complete ✅',
    `Successfully imported ${parsedProducts.value.length} equipment products and registered their unit serial numbers into central ERP inventory!`,
    'success'
  )

  emit('success')
  closeModal()
}
</script>

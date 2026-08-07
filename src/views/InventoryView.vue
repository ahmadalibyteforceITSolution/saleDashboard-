<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono">MEDIMAGE CENTRAL INVENTORY</span>
          <span class="badge badge-success font-mono">DATE-WISE STOCK AUDITS</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Medical Equipment Inventory & Transfers</h1>
        <p class="text-slate-300 text-sm mt-1">
          Branch-wise stock (Peshawar HO, Multan, Lahore), internal machine codes, date-wise stock snapshot reports, and branch-to-branch transfers.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <button @click="showTransferModal = true" class="btn btn-primary btn-lg shadow-xl">
          <ArrowRightLeft :size="18" />
          <span>Branch Stock Transfer</span>
        </button>

        <button @click="showAddModal = true" class="btn btn-success btn-lg shadow-xl">
          <PackagePlus :size="18" />
          <span>Add Equipment SKU</span>
        </button>
      </div>
    </div>

    <!-- Mode Switcher Tabs: Current Stock vs Date-Wise Historical Stock Snapshot -->
    <div class="glass-panel p-2 flex flex-wrap gap-2">
      <button
        @click="viewMode = 'current'"
        :class="['btn', viewMode === 'current' ? 'btn-primary' : 'btn-ghost']"
      >
        <Building2 :size="16" />
        <span>Live Branch Stock</span>
      </button>

      <button
        @click="viewMode = 'historical'"
        :class="['btn', viewMode === 'historical' ? 'btn-primary' : 'btn-ghost']"
      >
        <Calendar :size="16" />
        <span>Date-Wise Stock Position Report</span>
      </button>
    </div>

    <!-- Mode 1: Live Branch Inventory -->
    <div v-if="viewMode === 'current'" class="space-y-6">
      <!-- Search & Branch Filter Bar -->
      <div class="glass-panel p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="relative w-full md:w-80">
          <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter product, SKU, serial..."
            class="form-input pl-10 text-sm font-medium"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select v-model="selectedCity" class="form-select text-sm font-bold w-auto">
            <option value="ALL">All Branch Locations</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Multan">Multan Branch</option>
            <option value="Lahore">Lahore Branch</option>
          </select>

          <select v-model="selectedCategory" class="form-select text-sm w-auto">
            <option value="ALL">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Products Grid / Table -->
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Equipment SKU</th>
                <th>Category</th>
                <th>HSN Code</th>
                <th>Branch Allocations</th>
                <th>Cost (PKR)</th>
                <th>Selling Price (PKR)</th>
                <th>Stock Qty</th>
                <th>Available Machines & Serials</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in filteredProducts" :key="prod.id">
                <td>
                  <div class="flex items-center gap-3">
                    <img :src="prod.image" class="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                    <div>
                      <div class="font-bold text-white">{{ prod.name }}</div>
                      <div class="font-mono text-xs text-blue-400 font-bold">{{ prod.sku }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-purple">{{ prod.category }}</span>
                </td>
                <td class="font-mono text-indigo-300 text-xs font-bold">{{ prod.hsnCode || '9018.1200' }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="c in getProductCityList(prod)" :key="c" class="badge badge-neutral">
                      <Building2 :size="10" />
                      {{ c }}
                    </span>
                  </div>
                </td>
                <td class="font-bold text-slate-300">PKR {{ prod.costPrice.toLocaleString() }}</td>
                <td class="font-bold text-emerald-400">PKR {{ prod.sellingPrice.toLocaleString() }}</td>
                <td>
                  <span :class="['badge', prod.stockQty <= prod.minStock ? 'badge-danger' : 'badge-success']">
                    {{ prod.stockQty }} units
                  </span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1.5 max-w-xs max-h-20 overflow-y-auto">
                    <span v-for="s in getAvailableSerials(prod.id)" :key="s.serialCode" class="badge badge-neutral font-mono text-xs">
                      <span class="text-blue-400 font-bold">{{ s.serialCode }}</span>
                      <span v-if="s.machineCode" class="text-purple-400 font-bold">({{ s.machineCode }})</span>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Mode 2: Date-Wise Historical Stock Position Report -->
    <div v-if="viewMode === 'historical'" class="space-y-6">
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <Calendar :size="20" class="text-indigo-400" />
              <span>Historical Stock Position Date Audit</span>
            </h3>
            <p class="text-xs text-subtle mt-0.5">
              Select any past date to compute exact available stock levels on that day.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="form-group mb-0">
              <label class="form-label">Audit Date</label>
              <input v-model="historicalDate" type="date" class="form-input text-sm font-bold" />
            </div>

            <div class="form-group mb-0">
              <label class="form-label">Branch</label>
              <select v-model="historicalBranch" class="form-select text-sm font-bold">
                <option value="ALL">All Branches</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Historical Results Summary -->
        <div class="glass-panel p-4 flex justify-between items-center">
          <div class="text-slate-300 font-semibold text-sm">
            Stock Position as of <span class="font-bold text-white">{{ historicalDate }}</span> (Branch: {{ historicalBranch }}):
          </div>
          <div class="text-2xl font-extrabold text-indigo-400 font-mono">
            {{ historicalReport.totalUnits }} Total Units Available
          </div>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Equipment Product Name</th>
                <th>Category</th>
                <th>Branch Location</th>
                <th>Stock Quantity on {{ historicalDate }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="summary in historicalReport.productsSummary" :key="summary.sku">
                <td class="font-mono font-bold text-blue-400">{{ summary.sku }}</td>
                <td class="font-bold text-white">{{ summary.productName }}</td>
                <td class="text-slate-300">{{ summary.category }}</td>
                <td>
                  <span class="badge badge-purple">
                    <Building2 :size="10" />
                    {{ summary.branch }}
                  </span>
                </td>
                <td class="font-bold text-emerald-400 font-mono">{{ summary.stockQty }} units</td>
              </tr>
              <tr v-if="historicalReport.productsSummary.length === 0">
                <td colspan="5" class="p-6 text-center text-subtle italic">No equipment stock found on {{ historicalDate }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Branch Stock Transfer Modal -->
    <div v-if="showTransferModal" class="modal-backdrop" @click.self="showTransferModal = false">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft :size="20" class="text-indigo-400" />
            <span>Branch-to-Branch Equipment Transfer</span>
          </h3>
          <button @click="showTransferModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleStockTransfer" class="modal-body space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">From Branch *</label>
              <select v-model="transferForm.fromBranch" required class="form-select">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">To Branch *</label>
              <select v-model="transferForm.toBranch" required class="form-select">
                <option value="Multan">Multan Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Select Available Serials to Transfer *</label>
            <div class="max-h-48 overflow-y-auto glass-panel p-3 space-y-2">
              <div v-for="s in availableSerialsForTransfer" :key="s.serialCode" class="flex items-center gap-3 p-2 hover:bg-slate-800 rounded border border-slate-800 text-xs">
                <input type="checkbox" :value="s.serialCode" v-model="transferForm.selectedSerials" class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
                  <span class="font-mono text-purple-400 font-bold ml-2">({{ s.machineCode }})</span>
                  <div class="text-slate-400 text-[11px]">{{ s.sku }} - Current: {{ s.allocationCity }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Transfer Notes</label>
            <input v-model="transferForm.notes" type="text" placeholder="e.g. Inter-branch stock allocation..." class="form-input text-sm" />
          </div>

          <div class="modal-footer">
            <button type="button" @click="showTransferModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>Confirm Stock Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Add New Equipment SKU Modal -->
    <div v-if="showAddModal" class="modal-backdrop">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <PackagePlus :size="20" class="text-emerald-400" />
            <span>Add New Medical Equipment SKU</span>
          </h3>
          <button @click="showAddModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateProduct" class="modal-body space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input v-model="newProductForm.name" type="text" required placeholder="e.g. 10 Inch Portable Ultrasound System" class="form-input text-sm" />
            </div>

            <div class="form-group">
              <label class="form-label">SKU / Model Code *</label>
              <input v-model="newProductForm.sku" type="text" required placeholder="e.g. MED-US-10P" class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="newProductForm.category" required class="form-select text-sm">
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
              <input v-model.number="newProductForm.costPrice" type="number" required min="0" class="form-input text-sm font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label">Sale Price (PKR) *</label>
              <input v-model.number="newProductForm.salePrice" type="number" required min="0" class="form-input text-sm font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label">Sales Tax % *</label>
              <input v-model.number="newProductForm.taxRatio" type="number" required min="0" max="100" class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Technical Notes & Specifications</label>
            <input v-model="newProductForm.description" type="text" placeholder="e.g. Dual probe support, 3D Doppler imaging..." class="form-input text-sm" />
          </div>

          <div class="modal-footer">
            <button type="button" @click="showAddModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-success">
              <Check :size="16" />
              <span>Save Medical Equipment SKU</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Building2,
  Calendar,
  ArrowRightLeft,
  PackagePlus,
  Search,
  Check
} from 'lucide-vue-next'

const dataStore = useDataStore()
const uiStore = useUiStore()

const viewMode = ref('current')
const searchQuery = ref('')
const selectedCity = ref('ALL')
const selectedCategory = ref('ALL')

const historicalDate = ref(new Date().toISOString().split('T')[0])
const historicalBranch = ref('ALL')

const showTransferModal = ref(false)
const showAddModal = ref(false)

const transferForm = ref({
  fromBranch: 'Peshawar',
  toBranch: 'Multan',
  selectedSerials: [],
  notes: ''
})

const newProductForm = ref({
  name: '',
  sku: '',
  category: 'Ultrasound Machines',
  costPrice: 450000,
  salePrice: 650000,
  hsnCode: '9018.1200',
  taxRatio: 18,
  minStock: 2,
  description: ''
})

const categories = computed(() => {
  const set = new Set(dataStore.products.map(p => p.category))
  return Array.from(set)
})

const filteredProducts = computed(() => {
  return dataStore.products.filter(p => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value

    let matchesCity = true
    if (selectedCity.value !== 'ALL') {
      const citySerials = dataStore.serials.filter(s => s.productId === p.id && s.allocationCity === selectedCity.value && s.status === 'Available')
      matchesCity = citySerials.length > 0
    }

    return matchesSearch && matchesCategory && matchesCity
  })
})

function getAvailableSerials(productId) {
  return dataStore.serials.filter(s => s.productId === productId && s.status === 'Available')
}

function getProductCityList(prod) {
  const serialsForProd = dataStore.serials.filter(s => s.productId === prod.id && s.status === 'Available')
  const cities = new Set(serialsForProd.map(s => s.allocationCity || 'Peshawar'))
  if (!cities.size) cities.add('Peshawar')
  return Array.from(cities)
}

const historicalReport = computed(() => {
  return dataStore.getHistoricalStock(historicalDate.value, historicalBranch.value)
})

const availableSerialsForTransfer = computed(() => {
  return dataStore.serials.filter(s => 
    s.allocationCity === transferForm.value.fromBranch && 
    s.status === 'Available'
  )
})

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
    transferForm.value.selectedSerials,
    transferForm.value.fromBranch,
    transferForm.value.toBranch,
    transferForm.value.notes
  )

  uiStore.showModal('Transfer Complete', `Transferred ${transferForm.value.selectedSerials.length} unit(s) from ${transferForm.value.fromBranch} to ${transferForm.value.toBranch}.`, 'success')
  showTransferModal.value = false
  transferForm.value.selectedSerials = []
}

async function handleCreateProduct() {
  if (!newProductForm.value.name || !newProductForm.value.sku) {
    uiStore.showModal('Error', 'Product Name and SKU are required.', 'warning')
    return
  }
  const newProd = {
    id: `prod_${Date.now()}`,
    name: newProductForm.value.name,
    sku: newProductForm.value.sku,
    category: newProductForm.value.category,
    costPrice: Number(newProductForm.value.costPrice),
    salePrice: Number(newProductForm.value.salePrice),
    hsnCode: newProductForm.value.hsnCode,
    taxRatio: Number(newProductForm.value.taxRatio),
    minStock: Number(newProductForm.value.minStock),
    description: newProductForm.value.description
  }
  await dataStore.addProduct(newProd)
  uiStore.showModal('Success', `Created new Medical Equipment SKU: ${newProd.name} (${newProd.sku})`, 'success')
  showAddModal.value = false
  newProductForm.value = {
    name: '',
    sku: '',
    category: 'Ultrasound Machines',
    costPrice: 450000,
    salePrice: 650000,
    hsnCode: '9018.1200',
    taxRatio: 18,
    minStock: 2,
    description: ''
  }
}
</script>

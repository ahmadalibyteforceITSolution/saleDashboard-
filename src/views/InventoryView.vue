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

        <div class="flex items-center gap-3 flex-nowrap">
          <select v-model="selectedCity" class="form-select text-sm font-bold whitespace-nowrap">
            <option value="ALL">All Branch Locations</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Multan">Multan Branch</option>
            <option value="Lahore">Lahore Branch</option>
          </select>

          <select v-model="selectedCategory" class="form-select text-sm font-bold whitespace-nowrap">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in filteredProducts" :key="prod.id">
                <td>
                  <div class="flex items-center gap-3">
                    <img :src="prod.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'" class="w-10 h-10 rounded-lg object-cover border border-slate-700 shadow" />
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
                <td class="font-bold text-slate-300">PKR {{ (prod.costPrice || 0).toLocaleString() }}</td>
                <td class="font-bold text-emerald-400">PKR {{ (prod.sellingPrice || prod.salePrice || 0).toLocaleString() }}</td>
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
                <td>
                  <div class="flex items-center gap-1.5">
                    <button @click="openEditModal(prod)" class="btn btn-sm btn-secondary text-indigo-300 hover:text-white" title="Edit Equipment SKU">
                      <Pencil :size="13" />
                      <span>Edit</span>
                    </button>
                    <button @click="confirmDeleteProduct(prod)" class="btn btn-sm btn-danger" title="Delete Equipment SKU">
                      <Trash2 :size="13" />
                      <span>Delete</span>
                    </button>
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
            Stock Position as of <span class="font-bold text-white">{{ formattedHistoricalDate }}</span> (Branch: {{ historicalBranch }}):
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
                <th>Stock Quantity on {{ formattedHistoricalDate }}</th>
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
                <td colspan="5" class="p-6 text-center text-subtle italic">No equipment stock found on {{ formattedHistoricalDate }}.</td>
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Initial Stock Quantity *</label>
              <input v-model.number="newProductForm.stockQty" type="number" required min="1" class="form-input text-sm font-mono" />
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

          <div class="form-group">
            <label class="form-label">Technical Notes & Specifications</label>
            <input v-model="newProductForm.description" type="text" placeholder="e.g. Dual probe support, 3D Doppler imaging..." class="form-input text-sm" />
          </div>

          <div class="form-group">
            <label class="form-label">Equipment Product Image (Optional)</label>
            <div class="glass-panel p-4 border border-slate-800 rounded-xl">
              <input type="file" ref="addFileInput" accept="image/*" style="display: none;" @change="handleImageUpload($event, newProductForm)" />
              
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

    <!-- Modal 3: Edit Equipment SKU Modal -->
    <div v-if="showEditModal" class="modal-backdrop">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Pencil :size="20" class="text-indigo-400" />
            <span>Edit Medical Equipment SKU</span>
          </h3>
          <button @click="showEditModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleUpdateProduct" class="modal-body space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Product Name *</label>
              <input v-model="editProductForm.name" type="text" required class="form-input text-sm" />
            </div>

            <div class="form-group">
              <label class="form-label">SKU / Model Code *</label>
              <input v-model="editProductForm.sku" type="text" required class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="editProductForm.category" required class="form-select text-sm">
                <option value="Ultrasound Machines">Ultrasound Machines</option>
                <option value="Laser Machines">Laser Machines</option>
                <option value="ECG & Diagnostic Systems">ECG & Diagnostic Systems</option>
                <option value="X-Ray & Radiology Devices">X-Ray & Radiology Devices</option>
                <option value="Surgical Equipment">Surgical Equipment</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">HSN Code *</label>
              <input v-model="editProductForm.hsnCode" type="text" required class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="form-group">
              <label class="form-label">Cost Price (PKR) *</label>
              <input v-model.number="editProductForm.costPrice" type="number" required min="0" class="form-input text-sm font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label">Sale Price (PKR) *</label>
              <input v-model.number="editProductForm.salePrice" type="number" required min="0" class="form-input text-sm font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label">Sales Tax % *</label>
              <input v-model.number="editProductForm.taxRatio" type="number" required min="0" max="100" class="form-input text-sm font-mono" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Technical Notes & Specifications</label>
            <input v-model="editProductForm.description" type="text" placeholder="e.g. Dual probe support, 3D Doppler imaging..." class="form-input text-sm" />
          </div>

          <div class="form-group">
            <label class="form-label">Equipment Product Image (Optional)</label>
            <div class="glass-panel p-4 border border-slate-800 rounded-xl">
              <input type="file" ref="editFileInput" accept="image/*" style="display: none;" @change="handleImageUpload($event, editProductForm)" />
              
              <div v-if="editProductForm.image" class="flex items-center gap-4">
                <div class="relative flex-shrink-0">
                  <img :src="editProductForm.image" class="w-20 h-20 rounded-xl object-cover border-2 border-indigo-500/30 shadow-lg" />
                  <button type="button" @click="editProductForm.image = ''" class="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-lg" title="Remove Image">✕</button>
                </div>
                <div class="space-y-2">
                  <div class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check :size="14" />
                    <span>Local Image Attached</span>
                  </div>
                  <button type="button" @click="$refs.editFileInput.click()" class="btn btn-secondary btn-xs">
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
                <button type="button" @click="$refs.editFileInput.click()" class="btn btn-secondary btn-sm w-full sm:w-auto">
                  <Upload :size="14" class="text-indigo-400" />
                  <span>Upload Local Image File</span>
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showEditModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>Update Equipment SKU</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 4: Delete Equipment SKU Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-content max-w-md">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Trash2 :size="20" class="text-red-400" />
            <span>Confirm Delete Equipment</span>
          </h3>
          <button @click="showDeleteModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="modal-body space-y-3">
          <p class="text-slate-300 text-sm">
            Are you sure you want to delete <strong class="text-white">{{ productToDelete?.name }}</strong> (<span class="font-mono text-indigo-400 font-bold">{{ productToDelete?.sku }}</span>)?
          </p>
          <div class="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-300">
            ⚠️ Warning: Removing this SKU will also remove associated machine serial numbers from available stock.
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
          <button type="button" @click="executeDeleteProduct" class="btn btn-danger">
            <Trash2 :size="16" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import {
  Building2,
  Calendar,
  ArrowRightLeft,
  PackagePlus,
  Search,
  Check,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const viewMode = ref('current')
const searchQuery = ref('')
const selectedCity = ref('ALL')
const selectedCategory = ref('ALL')

const historicalDate = ref(new Date().toISOString().split('T')[0])
const historicalBranch = ref('ALL')

const formattedHistoricalDate = computed(() => {
  if (!historicalDate.value) return ''
  const [year, month, day] = historicalDate.value.split('-')
  if (year && month && day) {
    return `${month}/${day}/${year}`
  }
  return historicalDate.value
})

const presetImages = {
  'Portable Ultrasound': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80',
  '3D Doppler Station': 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80',
  'Diode Laser Device': 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=300&q=80',
  'ECG Diagnostic Monitor': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80'
}

const showTransferModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)

const productToDelete = ref(null)

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
  stockQty: 1,
  allocationCity: 'Peshawar',
  description: '',
  image: ''
})

const editProductForm = ref({
  id: '',
  name: '',
  sku: '',
  category: 'Ultrasound Machines',
  costPrice: 0,
  salePrice: 0,
  hsnCode: '9018.1200',
  taxRatio: 18,
  minStock: 2,
  description: '',
  image: ''
})

function handleImageUpload(event, targetForm) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    targetForm.image = e.target.result
  }
  reader.readAsDataURL(file)
}

function openEditModal(prod) {
  editProductForm.value = {
    id: prod.id || prod._id,
    name: prod.name,
    sku: prod.sku,
    category: prod.category || 'Ultrasound Machines',
    costPrice: prod.costPrice || 0,
    salePrice: prod.sellingPrice || prod.salePrice || 0,
    hsnCode: prod.hsnCode || '9018.1200',
    taxRatio: prod.taxRatio || 18,
    minStock: prod.minStock || 2,
    description: prod.description || '',
    image: prod.image || ''
  }
  showEditModal.value = true
}

async function handleUpdateProduct() {
  if (!editProductForm.value.name || !editProductForm.value.sku) {
    uiStore.showModal('Validation Error', 'Product Name and SKU are required.', 'warning')
    return
  }

  const updatedFields = {
    name: editProductForm.value.name,
    sku: editProductForm.value.sku.toUpperCase(),
    category: editProductForm.value.category,
    costPrice: Number(editProductForm.value.costPrice),
    sellingPrice: Number(editProductForm.value.salePrice),
    salePrice: Number(editProductForm.value.salePrice),
    hsnCode: editProductForm.value.hsnCode,
    taxRatio: Number(editProductForm.value.taxRatio),
    minStock: Number(editProductForm.value.minStock),
    description: editProductForm.value.description,
    image: editProductForm.value.image || ''
  }

  await dataStore.updateProduct(editProductForm.value.id, updatedFields, authStore.user)
  uiStore.showModal('Product Updated', `Successfully updated ${updatedFields.name} (${updatedFields.sku}).`, 'success')
  showEditModal.value = false
}

function confirmDeleteProduct(prod) {
  productToDelete.value = prod
  showDeleteModal.value = true
}

async function executeDeleteProduct() {
  if (!productToDelete.value) return
  const pName = productToDelete.value.name
  const pSku = productToDelete.value.sku
  await dataStore.deleteProduct(productToDelete.value.id, authStore.user)
  uiStore.showModal('Product Deleted', `Removed equipment SKU: ${pName} (${pSku}) from inventory.`, 'success')
  showDeleteModal.value = false
  productToDelete.value = null
}

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
      const isAllocatedInCitiesArr = Array.isArray(p.allocationCities) && p.allocationCities.includes(selectedCity.value)
      const isAllocatedInCityStr = p.allocationCity && p.allocationCity.includes(selectedCity.value)
      matchesCity = citySerials.length > 0 || isAllocatedInCitiesArr || isAllocatedInCityStr
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
  if (prod.allocationCities && Array.isArray(prod.allocationCities)) {
    prod.allocationCities.forEach(c => cities.add(c))
  } else if (prod.allocationCity) {
    prod.allocationCity.split(',').forEach(c => cities.add(c.trim()))
  }
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
    {
      selectedSerials: transferForm.value.selectedSerials,
      fromBranch: transferForm.value.fromBranch,
      toBranch: transferForm.value.toBranch,
      notes: transferForm.value.notes
    },
    authStore.user
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
    sku: newProductForm.value.sku.toUpperCase(),
    category: newProductForm.value.category,
    costPrice: Number(newProductForm.value.costPrice),
    salePrice: Number(newProductForm.value.salePrice),
    sellingPrice: Number(newProductForm.value.salePrice),
    hsnCode: newProductForm.value.hsnCode,
    taxRatio: Number(newProductForm.value.taxRatio),
    minStock: Number(newProductForm.value.minStock || 2),
    stockQty: Number(newProductForm.value.stockQty || 1),
    allocationCity: newProductForm.value.allocationCity || 'Peshawar',
    allocationCities: [newProductForm.value.allocationCity || 'Peshawar'],
    description: newProductForm.value.description,
    image: newProductForm.value.image || ''
  }
  await dataStore.addProduct(newProd, authStore.user)
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
    stockQty: 1,
    allocationCity: 'Peshawar',
    description: '',
    image: ''
  }
}
</script>

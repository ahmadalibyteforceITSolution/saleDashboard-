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

    <!-- Mode Switcher Tabs: Current Stock vs Date-Wise Historical Stock Snapshot vs Transfer Logs -->
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

      <button
        @click="viewMode = 'transfers'"
        :class="['btn', viewMode === 'transfers' ? 'btn-primary' : 'btn-ghost']"
      >
        <ArrowRightLeft :size="16" />
        <span>Branch Stock Transfer History ({{ dataStore.stockTransfers.length }})</span>
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
              <tr
                v-for="prod in filteredProducts"
                :key="prod.id || prod._id || prod.sku"
                class="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                @click="openViewModal(prod)"
              >
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
                    <span v-for="s in getAvailableSerials(prod)" :key="s.serialCode" class="badge badge-neutral font-mono text-xs">
                      <span class="text-blue-400 font-bold">{{ s.serialCode }}</span>
                      <span v-if="s.machineCode" class="text-purple-400 font-bold">({{ s.machineCode }})</span>
                    </span>
                  </div>
                </td>
                <td @click.stop>
                  <div class="flex items-center gap-1.5">
                    <button @click="openViewModal(prod)" class="btn btn-sm btn-secondary text-cyan-400 hover:text-white" title="View Details">
                      <Eye :size="13" />
                      <span>View</span>
                    </button>
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

    <!-- Mode 3: Inter-Branch Stock Transfers History -->
    <div v-if="viewMode === 'transfers'" class="space-y-6">
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft :size="20" class="text-indigo-400" />
              <span>Inter-Branch Stock Transfer Audit Log</span>
            </h3>
            <p class="text-xs text-subtle mt-0.5">
              Complete dispatch and transit log of all machines and serial numbers moved across branches (Peshawar HO, Multan, Lahore).
            </p>
          </div>
          <span class="badge badge-purple font-mono">{{ dataStore.stockTransfers.length }} Transfers Executed</span>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Transfer #</th>
                <th>Date</th>
                <th>From Branch</th>
                <th>To Branch</th>
                <th>Transferred Machine Serials</th>
                <th>Notes / Purpose</th>
                <th>Dispatched By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tr in dataStore.stockTransfers" :key="tr.transferNo">
                <td class="font-mono font-bold text-indigo-400">{{ tr.transferNo }}</td>
                <td class="font-mono text-xs text-subtle">{{ tr.transferDate }}</td>
                <td>
                  <span class="badge badge-neutral">
                    <Building2 :size="10" />
                    {{ tr.fromBranch }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-success">
                    <Building2 :size="10" />
                    {{ tr.toBranch }}
                  </span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1.5 max-w-xs max-h-24 overflow-y-auto">
                    <span v-for="s in tr.serials" :key="s.serialCode" class="badge badge-purple font-mono text-xs">
                      <span class="font-bold">{{ s.machineCode || s.serialCode }}</span>
                      <span v-if="s.productName" class="text-[10px] text-slate-300 ml-1">({{ s.productName }})</span>
                    </span>
                  </div>
                </td>
                <td class="text-xs text-slate-300">{{ tr.notes || 'Inter-branch stock transfer' }}</td>
                <td class="text-xs text-subtle">{{ tr.transferredBy || 'Admin User' }}</td>
              </tr>
              <tr v-if="dataStore.stockTransfers.length === 0">
                <td colspan="7" class="p-8 text-center text-subtle italic">
                  No branch stock transfers recorded yet. Click "Branch Stock Transfer" to move machines between branches.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Branch Stock Transfer Modal -->
    <StockTransferModal :show="showTransferModal" @close="showTransferModal = false" />

    <!-- Modal 1.5: View Product Details Modal -->
    <div v-if="showViewModal && viewProduct" class="modal-backdrop" @click.self="showViewModal = false">
      <div class="modal-content" style="max-width:680px;">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-main flex items-center gap-2">
            <Eye :size="20" class="text-cyan-400" />
            <span>Product Details</span>
            <span class="badge badge-neutral font-mono ml-1">{{ viewProduct.sku }}</span>
          </h3>
          <button @click="showViewModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="modal-body space-y-5">
          <!-- Top: image + key info -->
          <div class="flex gap-4 items-start">
            <img
              :src="viewProduct.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'"
              class="w-24 h-24 rounded-xl object-cover border-2 border-indigo-500/30 shadow-lg flex-shrink-0"
            />
            <div class="flex-1 space-y-2">
              <div class="text-xl font-extrabold text-white leading-tight">{{ viewProduct.name }}</div>
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-purple">{{ viewProduct.category }}</span>
                <span class="badge badge-neutral font-mono text-xs">HSN: {{ viewProduct.hsnCode || '9018.1200' }}</span>
                <span :class="['badge', viewProduct.stockQty <= viewProduct.minStock ? 'badge-danger' : 'badge-success']">
                  {{ viewProduct.stockQty }} Units
                </span>
              </div>
              <p v-if="viewProduct.description" class="text-xs text-subtle italic">{{ viewProduct.description }}</p>
            </div>
          </div>

          <!-- Pricing & Tax grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="glass-panel p-3 rounded-xl text-center">
              <div class="text-xs text-subtle mb-1">Cost Price</div>
              <div class="font-bold text-white text-sm font-mono">PKR {{ (viewProduct.costPrice || 0).toLocaleString() }}</div>
            </div>
            <div class="glass-panel p-3 rounded-xl text-center">
              <div class="text-xs text-subtle mb-1">Selling Price</div>
              <div class="font-bold text-emerald-400 text-sm font-mono">PKR {{ (viewProduct.sellingPrice || viewProduct.salePrice || 0).toLocaleString() }}</div>
            </div>
            <div class="glass-panel p-3 rounded-xl text-center">
              <div class="text-xs text-subtle mb-1">Sales Tax</div>
              <div class="font-bold text-yellow-400 text-sm font-mono">{{ viewProduct.taxRatio || 0 }}%</div>
            </div>
            <div class="glass-panel p-3 rounded-xl text-center">
              <div class="text-xs text-subtle mb-1">Min Stock Alert</div>
              <div class="font-bold text-orange-400 text-sm font-mono">{{ viewProduct.minStock || 0 }} Units</div>
            </div>
          </div>

          <!-- Branch Allocations -->
          <div>
            <div class="text-xs text-subtle font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Building2 :size="12" /> Branch Allocations & Filters
            </div>
            <div class="flex flex-wrap gap-2">
              <!-- ALL Button -->
              <button
                type="button"
                @click="selectedDetailCity = 'ALL'"
                :class="[
                  'badge cursor-pointer transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
                  selectedDetailCity === 'ALL'
                    ? 'bg-indigo-600/35 border-indigo-400 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'badge-neutral hover:bg-slate-700/80 border-slate-700 text-slate-300'
                ]"
              >
                <Building2 :size="10" />
                ALL ({{ viewProductSerials.filter(s => s.status === 'Available').length }} Available)
              </button>

              <!-- City Buttons -->
              <button
                v-for="city in getDetailCityList(viewProduct)"
                :key="city"
                type="button"
                @click="selectedDetailCity = city"
                :class="[
                  'badge cursor-pointer transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full border',
                  selectedDetailCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-indigo-600/35 border-indigo-400 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'badge-neutral hover:bg-slate-700/80 border-slate-700 text-slate-300'
                ]"
              >
                <Building2 :size="10" />
                {{ city.toUpperCase() }} ({{ getCityStockCount(viewProduct, city) }} Available)
              </button>
            </div>
          </div>

          <!-- Serial Numbers & Machine Codes -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <div class="text-xs text-subtle font-semibold uppercase tracking-wider flex items-center gap-1">
                📋 Registered Serials & Machine Codes
              </div>
              <div class="flex gap-2 text-xs">
                <span class="badge badge-success">{{ filteredViewProductSerials.filter(s=>s.status==='Available').length }} Available</span>
                <span class="badge badge-warning">{{ filteredViewProductSerials.filter(s=>s.status==='Sold').length }} Sold</span>
                <span class="badge badge-danger">{{ filteredViewProductSerials.filter(s=>s.status==='Defective').length }} Defective</span>
              </div>
            </div>
            <div v-if="filteredViewProductSerials.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="s in filteredViewProductSerials"
                :key="s.serialCode"
                :class="[
                  'glass-panel rounded-lg p-2.5 flex items-center gap-2 border',
                  s.status === 'Available' ? 'border-emerald-500/20' :
                  s.status === 'Sold' ? 'border-orange-500/20' : 'border-red-500/20'
                ]"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-mono font-bold text-blue-400 text-xs">{{ s.serialCode }}</span>
                    <span v-if="s.machineCode" class="font-mono text-purple-400 text-xs">({{ s.machineCode }})</span>
                  </div>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="text-subtle text-[11px]">{{ s.allocationCity || '—' }}</span>
                    <span v-if="s.customer" class="text-yellow-400 text-[11px]">→ {{ s.customer }}</span>
                    <span v-if="s.invoiceNo" class="text-[11px] text-slate-500 font-mono">{{ s.invoiceNo }}</span>
                  </div>
                </div>
                <span :class="[
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                  s.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                  s.status === 'Sold' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-red-500/20 text-red-400'
                ]">{{ s.status }}</span>
              </div>
            </div>
            <div v-else class="text-center text-xs text-subtle italic py-4">
              No serial numbers registered under the selected filter.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="showViewModal = false" class="btn btn-secondary">Close</button>
          <button type="button" @click="() => { showViewModal = false; openEditModal(viewProduct) }" class="btn btn-secondary text-indigo-300">
            <Pencil :size="14" />
            <span>Edit Product</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Add New Equipment SKU Modal -->
    <AddEquipmentModal :show="showAddModal" @close="showAddModal = false" />

    <!-- Modal 3: Edit Equipment SKU Modal -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-main flex items-center gap-2">
            <Pencil :size="20" class="text-indigo-400" />
            <span>Edit Medical Equipment SKU</span>
          </h3>
          <button @click="showEditModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleUpdateProduct" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="modal-body space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Product Name *</label>
                <input v-model="editProductForm.name" type="text" required class="form-input text-sm font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label">SKU / Model Code *</label>
                <input v-model="editProductForm.sku" type="text" required class="form-input text-sm font-mono font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Category *</label>
                <select v-model="editProductForm.category" required class="form-select text-sm font-bold">
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
                <input v-model.number="editProductForm.costPrice" type="number" required min="0" class="form-input text-sm font-mono font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label">Sale Price (PKR) *</label>
                <input v-model.number="editProductForm.salePrice" type="number" required min="0" class="form-input text-sm font-mono font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label">Sales Tax % *</label>
                <input v-model.number="editProductForm.taxRatio" type="number" required min="0" max="100" class="form-input text-sm font-mono font-bold" />
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
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="showDeleteModal = false">
      <div class="modal-content max-w-md">
        <div class="modal-header">
          <h3 class="text-lg font-bold text-main flex items-center gap-2">
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
import AddEquipmentModal from '@/components/AddEquipmentModal.vue'
import StockTransferModal from '@/components/StockTransferModal.vue'
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
  Eye,
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
const showViewModal = ref(false)

const productToDelete = ref(null)
const viewProduct = ref(null)
const selectedDetailCity = ref('ALL')

const viewProductSerials = computed(() => {
  if (!viewProduct.value) return []
  return dataStore.serials.filter(s =>
    s.productId === (viewProduct.value.id || viewProduct.value._id) ||
    s.sku === viewProduct.value.sku
  )
})

const filteredViewProductSerials = computed(() => {
  if (!viewProduct.value) return []
  const allSerials = viewProductSerials.value
  if (selectedDetailCity.value === 'ALL') {
    return allSerials
  }
  return allSerials.filter(s => (s.allocationCity || 'Peshawar').toLowerCase() === selectedDetailCity.value.toLowerCase())
})

function getDetailCityList(prod) {
  if (!prod) return []
  const standard = ['Lahore', 'Peshawar', 'Multan']
  const cities = new Set(standard)
  getProductCityList(prod).forEach(c => cities.add(c))
  return Array.from(cities)
}

function getCityStockCount(prod, city) {
  if (!prod) return 0
  const pId = prod.id || prod._id
  const pSku = (prod.sku || '').toUpperCase()
  return dataStore.serials.filter(s => 
    ((pId && (s.productId === pId || s.productId === String(pId))) || (pSku && s.sku && s.sku.toUpperCase() === pSku)) &&
    (s.allocationCity || 'Peshawar').toLowerCase() === city.toLowerCase() &&
    s.status === 'Available'
  ).length
}

function openViewModal(prod) {
  viewProduct.value = prod
  selectedDetailCity.value = 'ALL'
  showViewModal.value = true
}



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
    const pId = p.id || p._id
    const pSku = (p.sku || '').toUpperCase()
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value

    let matchesCity = true
    if (selectedCity.value !== 'ALL') {
      const citySerials = dataStore.serials.filter(s => 
        ((pId && (s.productId === pId || s.productId === String(pId))) || (pSku && s.sku && s.sku.toUpperCase() === pSku)) &&
        (s.allocationCity || 'Peshawar') === selectedCity.value &&
        s.status === 'Available'
      )
      const isAllocatedInCitiesArr = Array.isArray(p.allocationCities) && p.allocationCities.includes(selectedCity.value)
      const isAllocatedInCityStr = p.allocationCity && p.allocationCity.includes(selectedCity.value)
      matchesCity = citySerials.length > 0 || isAllocatedInCitiesArr || isAllocatedInCityStr
    }

    return matchesSearch && matchesCategory && matchesCity
  })
})

function getAvailableSerials(prodOrId) {
  const pId = typeof prodOrId === 'object' ? (prodOrId.id || prodOrId._id) : prodOrId
  const pSku = typeof prodOrId === 'object' ? (prodOrId.sku || '').toUpperCase() : null
  return dataStore.serials.filter(s => 
    ((pId && (s.productId === pId || s.productId === String(pId))) || (pSku && s.sku && s.sku.toUpperCase() === pSku)) &&
    s.status === 'Available'
  )
}

function getProductCityList(prod) {
  const pId = prod.id || prod._id
  const pSku = (prod.sku || '').toUpperCase()
  const serialsForProd = dataStore.serials.filter(s => 
    ((pId && (s.productId === pId || s.productId === String(pId))) || (pSku && s.sku && s.sku.toUpperCase() === pSku)) &&
    s.status === 'Available'
  )
  const cities = new Set(serialsForProd.map(s => s.allocationCity || 'Peshawar'))
  if (prod.allocationCities && Array.isArray(prod.allocationCities)) {
    prod.allocationCities.forEach(c => cities.add(c))
  } else if (prod.allocationCity) {
    prod.allocationCity.split(',').forEach(c => cities.add(c.trim()))
  }
  if (!cities.size) cities.add('Peshawar')
  return Array.from(cities)
}

function getProductNameForSerial(s) {
  const p = dataStore.products.find(prod => 
    (prod.id && (prod.id === s.productId || prod.id === String(s.productId))) || 
    (prod._id && (prod._id === s.productId || prod._id === String(s.productId))) || 
    (prod.sku && s.sku && prod.sku.toUpperCase() === s.sku.toUpperCase())
  )
  return p ? p.name : (s.sku || 'Equipment')
}

const historicalReport = computed(() => {
  return dataStore.getHistoricalStock(historicalDate.value, historicalBranch.value)
})


</script>

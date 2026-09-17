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

      <div class="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
        <!-- Add Equipment SKU (Primary Action) -->
        <button
          @click="showAddModal = true"
          class="btn btn-primary h-9 px-3 text-xs font-bold shadow-md flex items-center gap-1.5 whitespace-nowrap"
        >
          <PackagePlus :size="15" />
          <span>Add Equipment SKU</span>
        </button>

        <!-- Branch Stock Transfer -->
        <button
          @click="showTransferModal = true"
          class="btn btn-secondary h-9 px-3 text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <ArrowRightLeft :size="15" class="text-indigo-400" />
          <span>Branch Stock Transfer</span>
        </button>

        <!-- Import Products -->
        <button
          @click="showFileImportModal = true"
          class="btn btn-secondary h-9 px-3 text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap"
        >
          <UploadCloud :size="15" class="text-amber-400" />
          <span>Import Catalog</span>
        </button>

        <!-- Multi-format Export Products Dropdown -->
        <div class="dropdown-wrapper relative z-50">
          <button
            @click="showExportDropdown = !showExportDropdown"
            class="btn btn-secondary h-9 px-3 text-xs font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download :size="15" class="text-emerald-400" />
            <span>Export</span>
            <ChevronDown :size="13" class="text-slate-400" />
          </button>

          <div
            v-if="showExportDropdown"
            @click="showExportDropdown = false"
            class="fixed inset-0 z-40"
          ></div>

          <div
            v-if="showExportDropdown"
            class="absolute right-0 top-full mt-2 w-72 dropdown-menu-panel p-2.5 z-50 space-y-1.5"
          >
            <div class="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
              Select Export Format:
            </div>

            <button
              type="button"
              @click="triggerExportProducts('print')"
              class="dropdown-item-btn"
            >
              <Printer :size="16" class="text-blue-400 shrink-0" />
              <div>
                <div class="item-title">Print Form</div>
                <div class="item-desc">Paper / Hard copy catalog view</div>
              </div>
            </button>

            <button
              type="button"
              @click="triggerExportProducts('xlsx')"
              class="dropdown-item-btn"
            >
              <FileSpreadsheet :size="16" class="text-emerald-400 shrink-0" />
              <div>
                <div class="item-title">Excel Form (.xlsx)</div>
                <div class="item-desc">Native Excel spreadsheet workbook</div>
              </div>
            </button>

            <button
              type="button"
              @click="triggerExportProducts('pdf')"
              class="dropdown-item-btn"
            >
              <FileText :size="16" class="text-red-400 shrink-0" />
              <div>
                <div class="item-title">PDF Document (.pdf)</div>
                <div class="item-desc">High-res print-ready PDF export</div>
              </div>
            </button>

            <button
              type="button"
              @click="triggerExportProducts('word')"
              class="dropdown-item-btn"
            >
              <FileCode :size="16" class="text-indigo-400 shrink-0" />
              <div>
                <div class="item-title">Word Document (.docx)</div>
                <div class="item-desc">Microsoft Word document format</div>
              </div>
            </button>

            <button
              type="button"
              @click="triggerExportProducts('csv')"
              class="dropdown-item-btn"
            >
              <Download :size="16" class="text-amber-400 shrink-0" />
              <div>
                <div class="item-title">CSV Data File (.csv)</div>
                <div class="item-desc">Standard spreadsheet data file</div>
              </div>
            </button>
          </div>
        </div>
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
      <!-- Search, Branch & Sort Filter Bar -->
      <div class="inventory-toolbar glass-panel p-3">
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          
          <!-- Search Box -->
          <div class="relative flex-1 min-w-[200px]">
            <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search equipment, SKU, or serial..."
              class="inv-search-input"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <!-- Controls Row: Branch, Category, Sort, Asc/Desc, Count -->
          <div class="flex flex-wrap items-center gap-2">
            
            <!-- Branch Location Selector -->
            <div class="inv-control-wrapper">
              <Building2 :size="13" class="text-indigo-400 flex-shrink-0" />
              <select v-model="selectedCity" class="inv-select">
                <option value="ALL">All Branches</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>

            <!-- Category Selector -->
            <div class="inv-control-wrapper">
              <span class="text-xs text-emerald-400 flex-shrink-0">🏷️</span>
              <select v-model="selectedCategory" class="inv-select">
                <option value="ALL">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <!-- Sort By Selector -->
            <div class="inv-control-wrapper">
              <ArrowUpDown :size="13" class="text-purple-400 flex-shrink-0" />
              <select v-model="productSortKey" class="inv-select">
                <option value="sellingPrice">Selling Price</option>
                <option value="costPrice">Cost Price</option>
                <option value="stockQty">Stock Qty</option>
                <option value="name">Product Name</option>
                <option value="sku">SKU Code</option>
              </select>
            </div>

            <!-- Ascending / Descending Toggle Group -->
            <div class="inv-toggle-group">
              <button
                type="button"
                :class="['inv-toggle-btn', productSortOrder === 'asc' ? 'active' : '']"
                @click="productSortOrder = 'asc'"
                title="Sort Ascending (Lowest Price / A to Z)"
              >
                <ArrowUp :size="12" />
                <span>Asc</span>
              </button>
              <button
                type="button"
                :class="['inv-toggle-btn', productSortOrder === 'desc' ? 'active' : '']"
                @click="productSortOrder = 'desc'"
                title="Sort Descending (Highest Price / Z to A)"
              >
                <ArrowDown :size="12" />
                <span>Desc</span>
              </button>
            </div>

            <!-- Total Items Badge -->
            <span class="badge badge-neutral text-xs font-mono py-1 px-2.5 h-8 flex items-center whitespace-nowrap">
              {{ filteredProducts.length }} SKUs
            </span>

          </div>
        </div>
      </div>

      <!-- Products Grid / Table -->
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th class="cursor-pointer select-none hover:text-white" @click="handleProductSort('name')">
                  <div class="flex items-center gap-1">
                    <span>Equipment SKU</span>
                    <span v-if="productSortKey === 'name'" class="text-primary font-bold text-xs">{{ productSortOrder === 'asc' ? '▲' : '▼' }}</span>
                    <span v-else class="text-slate-500 opacity-60 text-xs">⇅</span>
                  </div>
                </th>
                <th>Category</th>
                <th>HSN Code</th>
                <th>Branch Allocations</th>
                <th class="cursor-pointer select-none hover:text-white" @click="handleProductSort('costPrice')">
                  <div class="flex items-center gap-1">
                    <span>Cost (PKR)</span>
                    <span v-if="productSortKey === 'costPrice'" class="text-primary font-bold text-xs">{{ productSortOrder === 'asc' ? '▲' : '▼' }}</span>
                    <span v-else class="text-slate-500 opacity-60 text-xs">⇅</span>
                  </div>
                </th>
                <th class="cursor-pointer select-none hover:text-white" @click="handleProductSort('sellingPrice')">
                  <div class="flex items-center gap-1">
                    <span>Selling Price (PKR)</span>
                    <span v-if="productSortKey === 'sellingPrice'" class="text-primary font-bold text-xs">{{ productSortOrder === 'asc' ? '▲' : '▼' }}</span>
                    <span v-else class="text-slate-500 opacity-60 text-xs">⇅</span>
                  </div>
                </th>
                <th class="cursor-pointer select-none hover:text-white" @click="handleProductSort('stockQty')">
                  <div class="flex items-center gap-1">
                    <span>Stock Qty</span>
                    <span v-if="productSortKey === 'stockQty'" class="text-primary font-bold text-xs">{{ productSortOrder === 'asc' ? '▲' : '▼' }}</span>
                    <span v-else class="text-slate-500 opacity-60 text-xs">⇅</span>
                  </div>
                </th>
                <th>Available Machines & Serials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="prod in paginatedProducts"
                :key="prod.id || prod._id || prod.sku"
                class="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                @click="openViewModal(prod)"
              >
                <td>
                  <div class="flex items-center gap-3">
                    <img :src="prod.image || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80'" class="w-10 h-10 rounded-lg object-cover border border-slate-700 shadow" />
                    <div>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <div class="font-bold text-white">{{ prod.name }}</div>
                        <span v-if="prod.addedRole" :class="['badge font-mono text-[9px] px-1 py-0', prod.addedRole === 'superadmin' ? 'badge-purple' : prod.addedRole === 'admin' ? 'badge-info' : prod.addedRole === 'manager' ? 'badge-success' : 'badge-emerald']">
                          {{ prod.addedRole.toUpperCase() }}
                        </span>
                      </div>
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
                      <span class="text-blue-400 font-bold">{{ formatSerial(s.serialCode) }}</span>
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
                    <button
                      v-if="!authStore.isAccountant"
                      @click="confirmDeleteProduct(prod)"
                      class="btn btn-sm btn-danger"
                      title="Delete Equipment SKU"
                    >
                      <Trash2 :size="13" />
                      <span>Delete</span>
                    </button>
                    <span
                      v-else
                      class="badge badge-neutral text-[10px] text-slate-400 flex items-center gap-1"
                      title="Policy: Only SuperAdmin can delete equipment products"
                    >
                      <Lock :size="10" />
                      <span>Delete Locked</span>
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="9" class="p-8 text-center text-slate-400 italic">
                  No equipment products found matching current filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Live Branch Stock Pagination -->
        <PaginationBar
          v-model="productsPage"
          v-model:pageSize="productsPageSize"
          :total-items="filteredProducts.length"
        />
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
              <tr v-for="summary in paginatedHistoricalSummary" :key="summary.sku">
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

        <!-- Historical Stock Date Report Pagination -->
        <PaginationBar
          v-model="historicalPage"
          v-model:pageSize="historicalPageSize"
          :total-items="historicalReport.productsSummary.length"
        />
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
              <tr v-for="tr in paginatedTransfers" :key="tr.transferNo">
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

        <!-- Transfers History Pagination -->
        <PaginationBar
          v-model="transfersPage"
          v-model:pageSize="transfersPageSize"
          :total-items="dataStore.stockTransfers.length"
        />
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

          <!-- Serial Numbers & Machine Codes Header, Status Filters & Sort -->
          <div>
            <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
              <div class="text-xs text-subtle font-semibold uppercase tracking-wider flex items-center gap-1">
                📋 Registered Serials & Machine Codes
              </div>
              <!-- Status filter badges: clickable interactive filters -->
              <div class="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  @click="selectedDetailStatus = 'ALL'"
                  :class="[
                    'badge cursor-pointer transition-all border',
                    selectedDetailStatus === 'ALL'
                      ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold'
                      : 'badge-neutral hover:bg-slate-700/80 border-slate-700 text-slate-300'
                  ]"
                >
                  ALL ({{ viewProductSerials.length }})
                </button>
                <button
                  type="button"
                  @click="selectedDetailStatus = 'Available'"
                  :class="[
                    'badge cursor-pointer transition-all border',
                    selectedDetailStatus === 'Available'
                      ? 'bg-emerald-600/40 border-emerald-400 text-emerald-300 font-bold'
                      : 'badge-success hover:opacity-100 opacity-75'
                  ]"
                >
                  {{ viewProductSerials.filter(s=>s.status==='Available').length }} Available
                </button>
                <button
                  type="button"
                  @click="selectedDetailStatus = 'Sold'"
                  :class="[
                    'badge cursor-pointer transition-all border',
                    selectedDetailStatus === 'Sold'
                      ? 'bg-amber-600/40 border-amber-400 text-amber-300 font-bold'
                      : 'badge-warning hover:opacity-100 opacity-75'
                  ]"
                >
                  {{ viewProductSerials.filter(s=>s.status==='Sold').length }} Sold
                </button>
                <button
                  type="button"
                  @click="selectedDetailStatus = 'Defective'"
                  :class="[
                    'badge cursor-pointer transition-all border',
                    selectedDetailStatus === 'Defective'
                      ? 'bg-red-600/40 border-red-400 text-red-300 font-bold'
                      : 'badge-danger hover:opacity-100 opacity-75'
                  ]"
                >
                  {{ viewProductSerials.filter(s=>s.status==='Defective').length }} Defective
                </button>
              </div>
            </div>

            <!-- Compact Single-Line Search & Sort Bar -->
            <div class="modal-serial-bar">
              <!-- Search Input -->
              <div class="relative flex-1 min-w-[130px]">
                <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  v-model="serialSearchQuery"
                  type="text"
                  placeholder="Search serial or machine code..."
                  class="modal-filter-input"
                />
              </div>

              <!-- Sort Dropdown -->
              <div class="modal-filter-select-wrapper">
                <ArrowUpDown :size="12" class="text-primary flex-shrink-0" />
                <select v-model="serialSortKey" class="modal-filter-select">
                  <option value="serialCode">Serial Code</option>
                  <option value="machineCode">Machine Code</option>
                  <option value="allocationCity">Branch City</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <!-- Asc / Desc Segmented Buttons -->
              <div class="modal-sort-toggle">
                <button
                  type="button"
                  :class="['modal-toggle-btn', serialSortOrder === 'asc' ? 'active' : '']"
                  @click="serialSortOrder = 'asc'"
                  title="Ascending (0→9 / A→Z)"
                >
                  <ArrowUp :size="11" />
                  <span>Asc</span>
                </button>
                <button
                  type="button"
                  :class="['modal-toggle-btn', serialSortOrder === 'desc' ? 'active' : '']"
                  @click="serialSortOrder = 'desc'"
                  title="Descending (9→0 / Z→A)"
                >
                  <ArrowDown :size="11" />
                  <span>Desc</span>
                </button>
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
                    <span class="font-mono font-bold text-blue-400 text-xs">{{ formatSerial(s.serialCode) }}</span>
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
          <div class="modal-body space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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
                  <option value="Hospital Furniture">Hospital Furniture</option>
                  <option value="General Equipment">General Equipment</option>
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

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="form-group">
                <label class="form-label">Current Stock Quantity *</label>
                <input
                  v-model.number="editProductForm.stockQty"
                  type="number"
                  required
                  min="0"
                  class="form-input text-sm font-mono font-bold"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Primary Branch Allocation *</label>
                <select v-model="editProductForm.allocationCity" required class="form-select text-sm font-bold">
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Lahore">Lahore Branch</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Min Stock Alert Units</label>
                <input
                  v-model.number="editProductForm.minStock"
                  type="number"
                  min="0"
                  class="form-input text-sm font-mono font-bold"
                />
              </div>
            </div>

            <!-- Machine Codes List & Chip Editor -->
            <div class="form-group">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label mb-0">
                  Machine Codes
                  <span class="text-xs text-subtle font-normal">(press Enter or comma to add each)</span>
                </label>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-700 text-subtle">
                  {{ editMachineList.length }} codes
                </span>
              </div>

              <div class="chip-input-area" @click="focusEditMachineInput">
                <span
                  v-for="(mc, idx) in editMachineList"
                  :key="idx"
                  class="chip-tag machine"
                >
                  {{ mc }}
                  <button type="button" @click.stop="removeEditMachineCode(idx)" title="Remove">✕</button>
                </span>
                <input
                  ref="editMachineInputRef"
                  v-model="editMachineInput"
                  type="text"
                  placeholder="e.g. MC-101 then press Enter…"
                  @keydown="onEditMachineKeydown"
                  @blur="handleEditMachineInputBlur"
                />
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

    <!-- Modal 5: Bulk Product File Import Modal (Excel, Word, PDF) -->
    <ProductFileImportModal
      :show="showFileImportModal"
      @close="showFileImportModal = false"
      @imported="handleProductsImported"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import AddEquipmentModal from '@/components/AddEquipmentModal.vue'
import StockTransferModal from '@/components/StockTransferModal.vue'
import ProductFileImportModal from '@/components/ProductFileImportModal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import { compressAndConvertToBase64 } from '@/utils/imageOptimizer'
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
  UploadCloud,
  Eye,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  ChevronDown,
  Printer,
  FileSpreadsheet,
  FileCode,
  FileText,
  Lock
} from 'lucide-vue-next'

import { exportReport } from '@/utils/reportExporter'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const showFileImportModal = ref(false)
const showExportDropdown = ref(false)

function handleProductsImported(result) {
  showFileImportModal.value = false
  uiStore.showModal(
    'Products Imported Successfully',
    `Bulk import processed: ${result?.addedCount || 0} equipment products added and ${result?.addedSerialsCount || 0} units registered in inventory.`,
    'success'
  )
}

function triggerExportProducts(format = 'xlsx') {
  const productsList = dataStore.products || []
  
  const reportData = {
    title: 'Medimage Services Medical Equipment Product Catalog',
    dateRange: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    branch: 'All Branches (Peshawar HO, Multan, Lahore)',
    summary: {
      'Total Product SKUs': `${productsList.length} SKUs`,
      'Total Equipment Valuation (Retail)': `PKR ${(dataStore.inventoryValuationRetail || 0).toLocaleString()}`,
      'Total Equipment Valuation (Cost)': `PKR ${(dataStore.inventoryValuationCost || 0).toLocaleString()}`,
      'Total Stock Units Available': `${dataStore.availableSerialsCount} Machines Ready in Stock`
    },
    headers: [
      'SKU',
      'Equipment Product Name',
      'Category',
      'HSN Code',
      'Cost Price (PKR)',
      'Selling Price (PKR)',
      'Sales Tax %',
      'Total Stock Units',
      'Peshawar Depot',
      'Multan Depot',
      'Lahore Depot',
      'Storage Bin',
      'Specifications'
    ],
    rows: productsList.map(p => {
      const getCityQty = (cityName) => {
        if (p.cityQuantities && p.cityQuantities[cityName] !== undefined) {
          return p.cityQuantities[cityName]
        }
        return dataStore.getAvailableSerials ? dataStore.getAvailableSerials(p.id, cityName) : (p.allocationCity === cityName ? p.stockQty : 0)
      }

      return [
        p.sku,
        p.name,
        p.category,
        p.hsnCode || '9018.12.00',
        Number(p.costPrice || 0).toLocaleString(),
        Number(p.sellingPrice || p.salePrice || 0).toLocaleString(),
        `${p.taxRatio || 18}%`,
        p.stockQty,
        getCityQty('Peshawar'),
        getCityQty('Multan'),
        getCityQty('Lahore'),
        p.storageBin || 'N/A',
        p.description || 'Medical diagnostic device'
      ]
    })
  }

  exportReport(format, reportData)
  showExportDropdown.value = false
  uiStore.showToast(`Products exported successfully as ${format.toUpperCase()}`, 'success')
}

const viewMode = ref('current')
const searchQuery = ref('')
const selectedCity = ref('ALL')
const selectedCategory = ref('ALL')

// ── Product Sorting State ─────────────────────────────────────
const productSortKey = ref('sellingPrice')
const productSortOrder = ref('desc') // 'asc' | 'desc'

function handleProductSort(key) {
  if (productSortKey.value === key) {
    productSortOrder.value = productSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    productSortKey.value = key
    productSortOrder.value = 'asc'
  }
}

// ── Detail Modal Serials Filter & Sort State ──────────────────
const selectedDetailStatus = ref('ALL') // 'ALL' | 'Available' | 'Sold' | 'Defective'
const serialSortKey = ref('serialCode')
const serialSortOrder = ref('asc') // 'asc' | 'desc'
const serialSearchQuery = ref('')

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
  let list = [...viewProductSerials.value]

  // City filter
  if (selectedDetailCity.value !== 'ALL') {
    list = list.filter(s => (s.allocationCity || 'Peshawar').toLowerCase() === selectedDetailCity.value.toLowerCase())
  }

  // Status filter (ALL, Available, Sold, Defective)
  if (selectedDetailStatus.value !== 'ALL') {
    list = list.filter(s => (s.status || '').toLowerCase() === selectedDetailStatus.value.toLowerCase())
  }

  // Search filter
  if (serialSearchQuery.value.trim()) {
    const q = serialSearchQuery.value.toLowerCase().trim()
    list = list.filter(s =>
      (s.serialCode || '').toLowerCase().includes(q) ||
      (s.machineCode || '').toLowerCase().includes(q) ||
      (s.customer || '').toLowerCase().includes(q) ||
      (s.invoiceNo || '').toLowerCase().includes(q) ||
      (s.allocationCity || '').toLowerCase().includes(q)
    )
  }

  // Ascending / Descending sorting
  list.sort((a, b) => {
    let aVal = a[serialSortKey.value] || ''
    let bVal = b[serialSortKey.value] || ''
    aVal = String(aVal).toLowerCase()
    bVal = String(bVal).toLowerCase()
    return serialSortOrder.value === 'asc'
      ? aVal.localeCompare(bVal, undefined, { numeric: true })
      : bVal.localeCompare(aVal, undefined, { numeric: true })
  })

  return list
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
  selectedDetailStatus.value = 'ALL'
  serialSearchQuery.value = ''
  serialSortKey.value = 'serialCode'
  serialSortOrder.value = 'asc'
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
  stockQty: 0,
  allocationCity: 'Peshawar',
  minStock: 2,
  description: '',
  image: ''
})

const editMachineList = ref([])
const editMachineInput = ref('')
const editMachineInputRef = ref(null)

function focusEditMachineInput() {
  if (editMachineInputRef.value) editMachineInputRef.value.focus()
}

function removeEditMachineCode(idx) {
  editMachineList.value.splice(idx, 1)
}

function onEditMachineKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addEditMachineCode()
  } else if (e.key === 'Backspace' && !editMachineInput.value && editMachineList.value.length > 0) {
    editMachineList.value.pop()
  }
}

function handleEditMachineInputBlur() {
  if (editMachineInput.value.trim()) {
    addEditMachineCode()
  }
}

function addEditMachineCode() {
  const raw = editMachineInput.value.trim().toUpperCase()
  if (!raw) return
  const parts = raw.split(/[,;\s]+/).map(p => p.trim()).filter(Boolean)
  for (const p of parts) {
    if (!editMachineList.value.includes(p)) {
      editMachineList.value.push(p)
    }
  }
  editMachineInput.value = ''
}

async function handleImageUpload(event, targetForm) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const base64 = await compressAndConvertToBase64(file, 600, 600, 0.85)
    targetForm.image = base64
  } catch (err) {
    uiStore.showModal('Image File Too Large', err.message || 'Failed to process image file.', 'warning')
  }
}

function openEditModal(prod) {
  const prodId = prod.id || prod._id
  editProductForm.value = {
    id: prodId,
    name: prod.name,
    sku: prod.sku,
    category: prod.category || 'Ultrasound Machines',
    costPrice: prod.costPrice || 0,
    salePrice: prod.sellingPrice || prod.salePrice || 0,
    hsnCode: prod.hsnCode || '9018.1200',
    taxRatio: prod.taxRatio || 18,
    stockQty: prod.stockQty || 0,
    allocationCity: prod.allocationCity || (prod.allocationCities && prod.allocationCities[0]) || 'Peshawar',
    minStock: prod.minStock || 2,
    description: prod.description || '',
    image: prod.image || ''
  }

  // Load existing machine codes for this product
  const serials = (dataStore.serials || []).filter(s =>
    (prodId && (s.productId === prodId || s.productId === String(prodId))) ||
    (prod.sku && s.sku && s.sku.toUpperCase() === prod.sku.toUpperCase())
  )
  editMachineList.value = serials.map(s => s.machineCode).filter(Boolean)
  editMachineInput.value = ''

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
    stockQty: Number(editProductForm.value.stockQty || 0),
    allocationCity: editProductForm.value.allocationCity,
    minStock: Number(editProductForm.value.minStock || 2),
    description: editProductForm.value.description,
    image: editProductForm.value.image || '',
    machineCodes: [...editMachineList.value]
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
  const set = new Set((dataStore.visibleProducts || []).map(p => p.category))
  return Array.from(set)
})

const filteredProducts = computed(() => {
  const list = (dataStore.visibleProducts || []).filter(p => {
    const pId = p.id || p._id
    const pSku = (p.sku || '').toUpperCase()
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const matchesCategory = selectedCategory.value === 'ALL' || p.category === selectedCategory.value

    let matchesCity = true
    if (selectedCity.value !== 'ALL') {
      const citySerials = (dataStore.visibleSerials || []).filter(s => 
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

  list.sort((a, b) => {
    let aVal = a[productSortKey.value]
    let bVal = b[productSortKey.value]

    if (productSortKey.value === 'sellingPrice') {
      aVal = Number(a.sellingPrice || a.salePrice || 0)
      bVal = Number(b.sellingPrice || b.salePrice || 0)
    } else if (productSortKey.value === 'costPrice') {
      aVal = Number(a.costPrice || 0)
      bVal = Number(b.costPrice || 0)
    } else if (productSortKey.value === 'stockQty') {
      aVal = Number(a.stockQty || 0)
      bVal = Number(b.stockQty || 0)
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase()
      bVal = (bVal || '').toLowerCase()
      return productSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return productSortOrder.value === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
  })

  return list
})

function formatSerial(code) {
  if (!code) return ''
  return String(code).trim().replace(/^SN-/i, '')
}

function getAvailableSerials(prodOrId) {
  const pId = typeof prodOrId === 'object' ? (prodOrId.id || prodOrId._id) : prodOrId
  const pSku = typeof prodOrId === 'object' ? (prodOrId.sku || '').trim().toUpperCase() : null
  return dataStore.serials.filter(s => {
    if (s.status !== 'Available') return false
    if (pId && s.productId && (String(s.productId) === String(pId))) return true
    if (pSku && s.sku && s.sku.trim().toUpperCase() === pSku) return true
    return false
  })
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

// ── Tab 1: Live Products Pagination ─────────────────────────
const productsPage = ref(1)
const productsPageSize = ref(10)

const paginatedProducts = computed(() => {
  const start = (productsPage.value - 1) * productsPageSize.value
  return filteredProducts.value.slice(start, start + productsPageSize.value)
})

watch([searchQuery, selectedCategory, selectedCity, productSortKey, productSortOrder], () => {
  productsPage.value = 1
})

// ── Tab 2: Historical Date Report Pagination ────────────────
const historicalPage = ref(1)
const historicalPageSize = ref(10)

const paginatedHistoricalSummary = computed(() => {
  const list = historicalReport.value?.productsSummary || []
  const start = (historicalPage.value - 1) * historicalPageSize.value
  return list.slice(start, start + historicalPageSize.value)
})

watch([historicalDate, historicalBranch], () => {
  historicalPage.value = 1
})

// ── Tab 3: Branch Stock Transfers Pagination ────────────────
const transfersPage = ref(1)
const transfersPageSize = ref(10)

const paginatedTransfers = computed(() => {
  const list = dataStore.stockTransfers || []
  const start = (transfersPage.value - 1) * transfersPageSize.value
  return list.slice(start, start + transfersPageSize.value)
})


</script>

<style scoped>
/* ── Live Branch Inventory Toolbar ────────────────────────── */
.inventory-toolbar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.inv-search-input {
  width: 100% !important;
  height: 2.25rem !important;
  min-height: 2.25rem !important;
  padding: 0 2rem 0 2.25rem !important;
  font-size: 0.85rem !important;
  background: var(--bg-input) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-main) !important;
  transition: var(--transition-fast);
}

.inv-search-input:focus {
  border-color: var(--primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px var(--primary-glow) !important;
}

.inv-control-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.25rem;
  padding: 0 0.5rem 0 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.inv-control-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.inv-select {
  width: auto !important;
  height: 100% !important;
  min-height: auto !important;
  padding: 0 1.25rem 0 0 !important;
  border: none !important;
  background: transparent !important;
  font-size: 0.825rem !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}

.inv-select option {
  background-color: #0f172a !important;
  color: #f8fafc !important;
  padding: 8px 12px !important;
}

[data-theme="light"] .inv-select option {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

.inv-toggle-group {
  display: inline-flex;
  align-items: center;
  height: 2.25rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.inv-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.65rem;
  height: calc(2.25rem - 4px);
  border: none;
  background: transparent;
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  transition: var(--transition-fast);
}

.inv-toggle-btn:hover {
  color: var(--text-main);
}

.inv-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* ── Modal Serial Search & Sort Bar ───────────────────────── */
.modal-serial-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-md);
  background: rgba(17, 24, 39, 0.5);
  border: 1px solid var(--border-line);
}

.modal-filter-input {
  width: 100% !important;
  height: 1.85rem !important;
  min-height: 1.85rem !important;
  padding: 0 0.5rem 0 1.75rem !important;
  font-size: 0.75rem !important;
  background: var(--bg-input) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text-main) !important;
}

.modal-filter-input:focus {
  outline: none !important;
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px var(--primary-glow) !important;
}

.modal-filter-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  height: 1.85rem;
  padding: 0 0.5rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.modal-filter-select {
  width: auto !important;
  height: 100% !important;
  min-height: auto !important;
  padding: 0 1rem 0 0 !important;
  border: none !important;
  background: transparent !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}

.modal-sort-toggle {
  display: flex;
  align-items: center;
  height: 1.85rem;
  padding: 1px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.modal-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0 0.45rem;
  height: calc(1.85rem - 4px);
  border: none;
  background: transparent;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: calc(var(--radius-sm) - 1px);
  cursor: pointer;
  transition: var(--transition-fast);
}

.modal-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
}

/* ── Light Mode Specific Styles ───────────────────────────── */
[data-theme="light"] .inventory-toolbar,
[data-theme="light"] .modal-serial-bar {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .inv-search-input,
[data-theme="light"] .inv-control-wrapper,
[data-theme="light"] .inv-toggle-group,
[data-theme="light"] .modal-filter-input,
[data-theme="light"] .modal-filter-select-wrapper,
[data-theme="light"] .modal-sort-toggle {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

[data-theme="light"] .inv-select,
[data-theme="light"] .modal-filter-select {
  color: #0f172a !important;
}

[data-theme="light"] .inv-toggle-btn,
[data-theme="light"] .modal-toggle-btn {
  color: #475569;
}

[data-theme="light"] .inv-toggle-btn.active,
[data-theme="light"] .modal-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
}
</style>

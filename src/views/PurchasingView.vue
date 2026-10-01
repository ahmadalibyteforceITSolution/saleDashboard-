<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono">BILL OF LADING (BL) MANAGEMENT</span>
          <span class="badge badge-success font-mono">IMPORT SHIPMENT CLOSING</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Purchase & Import Management</h1>
        <p class="text-slate-300 text-sm mt-1">
          End-to-end BL tracking, landed cost calculation, machine serial tracing, and automatic 17-column Excel closing reports.
        </p>
      </div>

      <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
        <button @click="openNewBLModal" class="btn btn-secondary font-bold shadow-lg col-span-1 sm:col-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 whitespace-nowrap">
          <Anchor :size="16" class="text-purple-400 shrink-0" />
          <span>Register BL Import</span>
        </button>
        <button @click="openNewPOModal" class="btn btn-primary font-bold shadow-lg col-span-1 sm:col-auto flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-3 whitespace-nowrap">
          <Truck :size="16" class="shrink-0" />
          <span>New Equipment PO</span>
        </button>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Total Import Expenditures</span>
          <span class="badge badge-info font-mono">MEDIMAGE ERP</span>
        </div>
        <div class="kpi-value text-white mt-2">PKR {{ (dataStore.totalPurchasesCost || 0).toLocaleString() }}</div>
        <div class="kpi-subtitle text-subtle">Landed procurement cost for all machines</div>
      </div>

      <div class="kpi-card kpi-purple glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Tracked BL Shipments</span>
          <span class="badge badge-purple font-mono">IMPORT HUBS</span>
        </div>
        <div class="kpi-value text-purple-400 mt-2">{{ dataStore.blList.length }} BL Shipments</div>
        <div class="kpi-subtitle text-subtle">Containers & sea freight shipments logged</div>
      </div>

      <div class="kpi-card kpi-success glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Completed Orders</span>
          <span class="badge badge-success font-mono">FULFILLED</span>
        </div>
        <div class="kpi-value text-emerald-400 mt-2">{{ dataStore.purchaseOrders.length }} Orders</div>
        <div class="kpi-subtitle text-subtle">All serial numbers & machine codes registered</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="glass-panel p-2 flex flex-wrap gap-2">
      <button
        @click="activeTab = 'bl'"
        :class="['btn font-bold', activeTab === 'bl' ? 'btn-primary' : 'btn-ghost text-slate-300']"
      >
        <Anchor :size="16" />
        <span>Bill of Lading (BL) Shipments & Closing ({{ dataStore.blList.length }})</span>
      </button>

      <button
        @click="activeTab = 'po'"
        :class="['btn font-bold', activeTab === 'po' ? 'btn-primary' : 'btn-ghost text-slate-300']"
      >
        <Truck :size="16" />
        <span>Standard Purchase Orders & Machine Generator ({{ dataStore.purchaseOrders.length }})</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: BILL OF LADING SHIPMENTS & CLOSING (REQ 1-4)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'bl'" class="space-y-4">
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <Anchor :size="20" class="text-purple-400" />
              <span>Bill of Lading (BL) Purchase Tracking Matrix</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Every import consignment is mapped to a unique BL Number with landing costs, receiving dates, and equipment history.
            </p>
          </div>

          <div class="relative min-w-[240px]">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="blSearchQuery"
              type="text"
              placeholder="Search BL #, Supplier, Product..."
              class="form-input text-xs pl-9"
            />
          </div>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>BL Number</th>
                <th>BL Date</th>
                <th>Supplier Name</th>
                <th>Shipment / Port</th>
                <th>Product / Machine</th>
                <th>Qty</th>
                <th>Serial Numbers</th>
                <th>Purchase Cost</th>
                <th>Landing Cost</th>
                <th>Receiving Date</th>
                <th>Branch</th>
                <th>BL Status</th>
                <th class="text-right">Closing & Excel</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bl in filteredBLList" :key="bl.blNumber">
                <td class="font-mono font-bold text-blue-400">{{ bl.blNumber }}</td>
                <td class="font-mono text-xs text-slate-400">{{ bl.blDate || bl.arrivalDate }}</td>
                <td class="font-bold text-white text-xs">{{ bl.supplierName || bl.supplier || bl.companyName || 'Consignment Supplier' }}</td>
                <td class="text-xs text-slate-300">{{ bl.shipmentDetails || 'Sea Freight Container' }}</td>
                <td>
                  <div v-if="bl.items && bl.items.length > 0" class="space-y-1">
                    <div v-for="it in bl.items" :key="it.sku || it.name" class="text-xs">
                      <span class="font-bold text-white">{{ it.name }}</span>
                      <span class="font-mono text-[10px] text-purple-300 ml-1">({{ it.sku || it.productCode }})</span>
                    </div>
                  </div>
                  <div v-else class="text-xs">
                    <div class="font-bold text-white">{{ bl.productName || 'Equipment Consignment' }}</div>
                    <div v-if="bl.productCode" class="font-mono text-[10px] text-purple-300">Code: {{ bl.productCode }}</div>
                  </div>
                </td>
                <td class="font-mono text-xs font-bold text-emerald-400">
                  {{ bl.totalUnits || bl.quantity || (bl.items ? bl.items.reduce((s, it) => s + Number(it.quantity || 0), 0) : 0) }} units
                </td>
                <td>
                  <div class="serials-scroll-cell">
                    <span
                      v-for="sn in getBLSerialList(bl)"
                      :key="sn"
                      class="serial-badge-item"
                    >
                      {{ sn }}
                    </span>
                    <span v-if="getBLSerialList(bl).length === 0" class="text-[11px] text-slate-500 italic">No serials indexed</span>
                  </div>
                </td>
                <td class="font-mono text-xs font-bold text-slate-200">
                  PKR {{ (bl.purchaseCost || bl.totalCostValue || getBLCalculatedPurchaseCost(bl) || 0).toLocaleString() }}
                </td>
                <td class="font-mono text-xs text-amber-400">
                  PKR {{ (bl.landingCost || 0).toLocaleString() }}
                </td>
                <td class="font-mono text-xs text-slate-400">{{ bl.receivingDate || bl.arrivalDate }}</td>
                <td>
                  <span class="badge badge-purple text-xs">{{ bl.branch || bl.destinationCity || 'Peshawar' }}</span>
                </td>
                <td>
                  <span :class="['badge font-mono text-[10px] font-bold', getBLBadgeClass(bl.blStatus)]">
                    {{ bl.blStatus }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="printBLReport(bl.blNumber)"
                      class="btn btn-xs btn-secondary font-bold text-sky-400 flex items-center gap-1 shadow-sm"
                      title="Print Official BL Sheet / Save as PDF"
                    >
                      <Printer :size="12" />
                      <span>Print PDF</span>
                    </button>
                    <button
                      @click="downloadBLReport(bl.blNumber)"
                      class="btn btn-xs btn-secondary font-bold text-emerald-400 flex items-center gap-1 shadow-sm"
                      title="Download 17-Column Excel Report"
                    >
                      <FileSpreadsheet :size="12" />
                      <span>Excel</span>
                    </button>
                    <button
                      @click="openBLModal(bl)"
                      :class="['btn btn-xs font-bold', bl.blStatus === 'Closed' ? 'btn-ghost text-slate-400' : 'btn-primary']"
                    >
                      {{ bl.blStatus === 'Closed' ? 'View Details' : 'Close BL' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredBLList.length === 0">
                <td colspan="13" class="p-8 text-center text-slate-500 italic">No Bill of Lading records match search.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 2: STANDARD PURCHASE ORDERS & MACHINE GENERATOR
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'po'" class="space-y-4">
      <!-- Purchase Orders Table -->
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <Truck :size="20" class="text-blue-400" />
              <span>Purchase Orders & Machine Imports</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Manage purchase orders, generate serial codes, and print official procurement vouchers.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div class="relative min-w-[220px]">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                v-model="poSearchQuery"
                type="text"
                placeholder="Search PO #, Supplier, Item..."
                class="form-input text-xs pl-9"
              />
            </div>
            <button
              @click="openNewPOModal"
              class="btn btn-primary font-bold text-xs flex items-center gap-1.5 py-2 px-3 shadow-md"
            >
              <Plus :size="14" />
              <span>New Purchase Order</span>
            </button>
          </div>
        </div>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Branch</th>
                <th>Equipment Items</th>
                <th>Generated Serials & Machine Codes</th>
                <th>Total Cost</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="po in filteredPOList" :key="po.poNumber">
                <td class="font-mono font-bold text-blue-400">{{ po.poNumber }}</td>
                <td class="font-bold text-white">{{ po.supplier }}</td>
                <td class="font-mono text-xs text-slate-400">{{ po.orderDate }}</td>
                <td>
                  <span class="badge badge-purple text-xs">
                    <Building2 :size="10" />
                    {{ po.allocationCity || po.branch || 'Peshawar' }}
                  </span>
                </td>
                <td>
                  <div v-for="item in po.items" :key="item.productName" class="text-xs py-0.5">
                    <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
                  </div>
                </td>
                <td>
                  <div class="serials-scroll-cell">
                    <span
                      v-for="(s, sIdx) in getPOSerialsList(po)"
                      :key="sIdx"
                      class="serial-badge-item"
                    >
                      {{ s }}
                    </span>
                    <span v-if="getPOSerialsList(po).length === 0" class="text-[11px] text-slate-400 italic">No serials logged</span>
                  </div>
                </td>
                <td class="font-bold text-emerald-400 font-mono text-xs">PKR {{ (po.totalAmount || 0).toLocaleString() }}</td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="openViewPOModal(po)"
                      class="btn btn-xs btn-secondary font-bold text-sky-400 flex items-center gap-1 shadow-sm"
                      title="View Full PO Details"
                    >
                      <Eye :size="12" />
                      <span>View</span>
                    </button>
                    <button
                      @click="printPOVoucher(po)"
                      class="btn btn-xs btn-secondary font-bold text-indigo-400 flex items-center gap-1 shadow-sm"
                      title="Print Official PO Voucher / Save PDF"
                    >
                      <Printer :size="12" />
                      <span>Print</span>
                    </button>
                    <button
                      @click="openEditPOModal(po)"
                      class="btn btn-xs btn-secondary font-bold text-amber-400 flex items-center gap-1 shadow-sm"
                      title="Edit Purchase Order Details"
                    >
                      <Edit3 :size="12" />
                      <span>Edit</span>
                    </button>
                    <button
                      @click="confirmDeletePO(po)"
                      class="btn btn-xs btn-secondary font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 shadow-sm"
                      title="Delete Purchase Order"
                    >
                      <Trash2 :size="12" />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPOList.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-500 italic">No purchase orders match your search criteria.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── MODAL: View Purchase Order Details ────────────────────────── -->
    <div v-if="showViewPOModal" class="modal-backdrop" @click.self="showViewPOModal = false">
      <div class="modal-content max-w-2xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2">
            <Truck :size="20" class="text-blue-500" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Purchase Order: {{ selectedPO?.poNumber }}</h3>
          </div>
          <button @click="showViewPOModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <div class="overflow-y-auto space-y-4 text-xs pr-1 flex-1">
          <!-- Summary Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/70 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <span class="text-slate-500 dark:text-slate-400 block">Supplier</span>
              <strong class="text-slate-900 dark:text-white font-bold">{{ selectedPO?.supplier }}</strong>
            </div>
            <div>
              <span class="text-slate-500 dark:text-slate-400 block">Order Date</span>
              <strong class="font-mono text-slate-700 dark:text-slate-300">{{ selectedPO?.orderDate }}</strong>
            </div>
            <div>
              <span class="text-slate-500 dark:text-slate-400 block">Branch Depot</span>
              <span class="badge badge-purple text-[10px] mt-0.5">{{ selectedPO?.allocationCity || selectedPO?.branch || 'Peshawar' }}</span>
            </div>
            <div>
              <span class="text-slate-500 dark:text-slate-400 block">Total Procurement</span>
              <strong class="font-mono text-emerald-600 dark:text-emerald-400 text-sm">PKR {{ (selectedPO?.totalAmount || 0).toLocaleString() }}</strong>
            </div>
          </div>

          <!-- Equipment Items Breakdown -->
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
              <FileText :size="14" class="text-indigo-400" />
              <span>Purchased Equipment Items:</span>
            </h4>
            <table class="w-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-left">
              <thead class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                <tr>
                  <th class="p-2">Item Description</th>
                  <th class="p-2 text-center">Qty</th>
                  <th class="p-2 text-right">Unit Cost</th>
                  <th class="p-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr v-for="(it, idx) in (selectedPO?.items || [])" :key="idx">
                  <td class="p-2 font-bold">{{ it.productName }}</td>
                  <td class="p-2 text-center font-mono">{{ it.qty }}</td>
                  <td class="p-2 text-right font-mono">PKR {{ Number(it.unitCost || 0).toLocaleString() }}</td>
                  <td class="p-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                    PKR {{ ((Number(it.qty || 1) * Number(it.unitCost || 0)) || Number(it.totalCost || 0)).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Generated Serials & Machine Codes -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <QrCode :size="14" class="text-purple-400" />
                <span>Generated Serial Numbers & Machine Codes:</span>
              </h4>
              <span class="badge badge-neutral text-[10px] font-mono">
                {{ getPOSerialsList(selectedPO).length }} Registered Units
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto">
              <span
                v-for="(s, sIdx) in getPOSerialsList(selectedPO)"
                :key="sIdx"
                class="serial-badge-item"
              >
                {{ s }}
              </span>
              <span v-if="getPOSerialsList(selectedPO).length === 0" class="text-slate-400 italic">No serial numbers logged for this purchase order.</span>
            </div>
          </div>
        </div>

        <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <button type="button" @click="showViewPOModal = false" class="btn btn-secondary px-4 py-2">Close</button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="printPOVoucher(selectedPO)"
              class="btn btn-secondary font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 px-4 py-2 shadow-sm"
            >
              <Printer :size="14" />
              <span>Print Official PO Voucher</span>
            </button>
            <button
              type="button"
              @click="openEditPOModal(selectedPO); showViewPOModal = false;"
              class="btn bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 px-4 py-2 rounded shadow-sm"
            >
              <Edit3 :size="14" />
              <span>Edit PO</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Edit Purchase Order ─────────────────────────────────── -->
    <div v-if="showEditPOModal" class="modal-backdrop" @click.self="showEditPOModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2">
            <Edit3 :size="18" class="text-amber-500" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Edit Purchase Order: {{ editPOForm.poNumber }}</h3>
          </div>
          <button @click="showEditPOModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSavePOEdit" class="overflow-y-auto space-y-4 text-xs pr-1 flex-1">
          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Supplier / Vendor Name *</label>
            <input v-model="editPOForm.supplier" type="text" required class="form-input w-full p-2 border rounded font-bold" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Order Date *</label>
              <input v-model="editPOForm.orderDate" type="date" required class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold mb-1 block flex items-center justify-between">
                <span>Receiving Branch *</span>
                <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-400 font-semibold">🔒 Locked</span>
              </label>

              <div
                v-if="!authStore.isSuperAdmin"
                class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 font-bold text-xs flex items-center justify-between select-none cursor-not-allowed"
                title="Branch locked to your assigned territory"
              >
                <span class="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{{ editPOForm.allocationCity || authStore.userBranch || 'Karachi' }} Depot</span>
                </span>
                <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
              </div>

              <select v-else v-model="editPOForm.allocationCity" class="form-select w-full p-2 border rounded font-bold">
                <option value="Karachi">Karachi Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Branch</option>
                <option value="Multan">Multan Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Total Purchase Cost (PKR) *</label>
            <input v-model.number="editPOForm.totalAmount" type="number" min="0" required class="form-input w-full p-2 border rounded font-mono font-bold text-emerald-600 dark:text-emerald-400" />
          </div>

          <div class="form-group">
            <label class="form-label font-bold mb-1 block">Notes / Procurement Remarks</label>
            <textarea v-model="editPOForm.remarks" rows="2" placeholder="Enter supplier terms or receiving remarks..." class="form-textarea w-full p-2 border rounded"></textarea>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0">
            <button type="button" @click="showEditPOModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded shadow-sm flex items-center gap-1.5">
              <Check :size="14" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: BL Closing & Details Preview -->
    <div v-if="showBLDetailModal" class="modal-backdrop" @click.self="showBLDetailModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <Anchor :size="20" class="text-purple-400" />
            <h3 class="text-lg font-bold text-white">Bill of Lading Closing: {{ selectedBL?.blNumber }}</h3>
          </div>
          <button @click="showBLDetailModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-lg">
            <div>
              <span class="text-slate-400 block">Supplier</span>
              <strong class="text-white">{{ selectedBL?.supplier }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Product Code</span>
              <strong class="font-mono text-purple-300">{{ selectedBL?.productCode }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Branch</span>
              <strong class="text-slate-200">{{ selectedBL?.branch }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Status</span>
              <span :class="['badge font-mono text-[10px]', getBLBadgeClass(selectedBL?.blStatus)]">{{ selectedBL?.blStatus }}</span>
            </div>
          </div>

          <!-- Closing Validation Audit -->
          <div class="p-3.5 rounded-lg border" :class="blValidation.canClose ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-amber-950/30 border-amber-800/60'">
            <div class="flex items-center justify-between font-bold mb-2">
              <span :class="blValidation.canClose ? 'text-emerald-400' : 'text-amber-400'">
                {{ blValidation.canClose ? '✓ BL Business Cycle Fully Reconciled' : '⚠️ Pending Reconciliations Before Closing' }}
              </span>
              <span class="font-mono text-white">{{ blValidation.soldCount }} / {{ blValidation.totalCount }} Machines Sold</span>
            </div>
            <ul class="space-y-1 list-disc list-inside text-slate-300">
              <li v-for="(iss, idx) in (blValidation?.issues || [])" :key="idx">{{ iss }}</li>
              <li v-if="!blValidation?.issues || blValidation.issues.length === 0" class="text-emerald-300">All customer invoices and unit payments under this BL are settled.</li>
            </ul>
          </div>

          <!-- 17-Column Excel Structure Notice -->
          <div class="p-3 bg-slate-900/80 rounded border border-slate-800 text-slate-300 space-y-1">
            <div class="font-bold text-white flex items-center gap-1.5">
              <FileSpreadsheet :size="14" class="text-emerald-400" />
              <span>17-Column Comprehensive Closing Excel Export</span>
            </div>
            <p class="text-[10px] text-slate-400">
              Columns include: BL Number, Delivery Date, Customer Name, Invoice #, Product Name, Product Code, Serial #, Sale Amount, Received Amount, Outstanding Balance, Payment Method, Bank Name, Bank Details, Cheque Ref, Payment Date, Branch, and Sales Person.
            </p>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showBLDetailModal = false" class="btn btn-secondary">Close</button>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="printBLReport(selectedBL?.blNumber)"
                class="btn btn-secondary font-bold text-sky-400 flex items-center gap-1.5 shadow-sm"
                title="Print Official Document / Save PDF"
              >
                <Printer :size="14" />
                <span>Print Official Report</span>
              </button>
              <button
                type="button"
                @click="downloadBLReport(selectedBL?.blNumber)"
                class="btn btn-secondary font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm"
                title="Export 17-Column Excel Spreadsheet"
              >
                <Download :size="14" />
                <span>Export 17-Column Excel</span>
              </button>
              <button
                v-if="selectedBL?.blStatus !== 'Closed'"
                type="button"
                @click="finalizeBLClosing(selectedBL?.blNumber)"
                :disabled="!blValidation.canClose"
                class="btn btn-emerald font-bold text-white flex items-center gap-1.5"
              >
                <Check :size="14" />
                <span>Finalize & Close BL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Register New BL Import Consignment -->
    <div v-if="showNewBLModal" class="modal-backdrop" @click.self="showNewBLModal = false">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <Anchor :size="20" class="text-purple-400" />
            <h3 class="text-lg font-bold text-white">Register New Bill of Lading (BL) Import</h3>
          </div>
          <button @click="showNewBLModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleCreateBL" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">BL Number *</label>
              <input v-model="newBLForm.blNumber" type="text" required placeholder="e.g. BL-MED-2026-04" class="form-input font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label">BL Date *</label>
              <input v-model="newBLForm.blDate" type="date" required class="form-input font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Supplier / Exporter *</label>
              <input v-model="newBLForm.supplier" type="text" required placeholder="e.g. Mindray Bio-Medical Inc" class="form-input font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label">Shipment Details / Origin Port *</label>
              <input v-model="newBLForm.shipmentDetails" type="text" required placeholder="e.g. Vessel MAERSK 40ft HQ / Karachi Port" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Select Equipment Product SKU *</label>
            <select v-model="newBLForm.productId" required class="form-select font-bold">
              <option value="" disabled>Choose Product SKU...</option>
              <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                {{ p.name }} ({{ p.sku }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label">Import Qty *</label>
              <input v-model.number="newBLForm.quantity" type="number" min="1" required class="form-input font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label">Purchase Cost (PKR) *</label>
              <input v-model.number="newBLForm.purchaseCost" type="number" required class="form-input font-mono font-bold" />
            </div>
            <div class="form-group">
              <label class="form-label">Landing / Duties (PKR)</label>
              <input v-model.number="newBLForm.landingCost" type="number" class="form-input font-mono text-amber-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label flex items-center justify-between">
                <span>Branch / Warehouse *</span>
                <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-400 font-semibold">🔒 Locked</span>
              </label>
              <div
                v-if="!authStore.isSuperAdmin"
                class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-white font-bold text-xs flex items-center justify-between shadow-inner select-none cursor-not-allowed"
              >
                <span class="flex items-center gap-1.5 text-slate-200">
                  <span>📍</span>
                  <span>{{ authStore.userBranch || 'Lahore' }} Depot</span>
                </span>
                <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
              </div>
              <select v-else v-model="newBLForm.branch" class="form-select font-bold">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
                <option value="Karachi">Karachi Branch</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Receiving Date *</label>
              <input v-model="newBLForm.receivingDate" type="date" class="form-input font-mono" />
            </div>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-800">
            <button type="button" @click="showNewBLModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold">
              Confirm & Register BL Import
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create PO Modal -->
    <div v-if="showPOModal" class="modal-backdrop" @click.self="showPOModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <h3 class="text-xl font-bold text-main flex items-center gap-2">
            <Truck :size="22" class="text-primary" />
            <span>New Bulk Equipment Purchase Entry</span>
          </h3>
          <button @click="showPOModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="submitPO" class="flex flex-col flex-1 overflow-hidden m-0">
          <div class="modal-body space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Supplier Name *</label>
                <input v-model="form.supplier" type="text" required placeholder="e.g. Siemens Healthcare GmbH..." class="form-input font-bold" />
              </div>

              <div class="form-group">
                <label class="form-label flex items-center justify-between">
                  <span>Target Branch *</span>
                  <span v-if="!authStore.isSuperAdmin" class="text-[10px] text-emerald-400 font-semibold">🔒 Locked</span>
                </label>
                <div
                  v-if="!authStore.isSuperAdmin"
                  class="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-lg text-white font-bold text-xs flex items-center justify-between shadow-inner select-none cursor-not-allowed"
                >
                  <span class="flex items-center gap-1.5 text-slate-200">
                    <span>📍</span>
                    <span>{{ form.allocationCity || authStore.userBranch || 'Karachi' }} Depot</span>
                  </span>
                  <span class="badge badge-success text-[10px] py-0 px-1.5 font-mono">Assigned</span>
                </div>
                <select v-else v-model="form.allocationCity" required class="form-select font-bold">
                  <option value="Karachi">Karachi Branch</option>
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Lahore">Lahore Branch</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Islamabad">Islamabad Branch</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Select Equipment Product *</label>
              <select v-model="selectedProductId" required class="form-select font-bold">
                <option value="" disabled>Choose Product SKU...</option>
                <option v-for="p in dataStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (Cost: PKR {{ (p.costPrice || 0).toLocaleString() }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Import Quantity *</label>
                <input v-model.number="itemQty" type="number" min="1" max="1000" required class="form-input font-bold" />
              </div>

              <div class="form-group">
                <div class="flex justify-between items-center mb-1">
                  <label class="form-label mb-0">Starting Machine Code *</label>
                  <span v-if="computedUnitMapping.length > 0" class="text-xs text-indigo-400 font-mono font-bold">
                    Range: {{ computedUnitMapping[0]?.machineCode }} → {{ computedUnitMapping[computedUnitMapping.length - 1]?.machineCode }} ({{ computedUnitMapping.length }} Units)
                  </span>
                </div>
                <input
                  v-model="startingMachineCodeInput"
                  type="text"
                  placeholder="e.g. WD-35 or MC-101"
                  required
                  class="form-input font-mono font-bold uppercase"
                />
                <span class="text-[11px] text-slate-400 mt-1 block">
                  Enter starting code (e.g. <strong>WD-35</strong>). Range automatically maps across {{ itemQty || 0 }} units ({{ computedUnitMapping[0]?.machineCode || 'WD-35' }} to {{ computedUnitMapping[computedUnitMapping.length - 1]?.machineCode || 'WD-44' }}).
                </span>
              </div>
            </div>

            <!-- Serial Entry Mode Toggle -->
            <div class="form-group">
              <label class="form-label">Serial Number Entry Method</label>
              <div class="flex items-center gap-4 text-xs font-semibold">
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input type="radio" value="sequential" v-model="serialInputMode" class="text-indigo-600" />
                  <span>Sequential Prefix / Range (e.g. US10-8801 to US10-9100)</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer text-slate-200">
                  <input type="radio" value="bulkPaste" v-model="serialInputMode" class="text-indigo-600" />
                  <span>Paste Bulk Serial Numbers (Comma / Newline separated)</span>
                </label>
              </div>
            </div>

            <!-- Mode A: Sequential Prefix -->
            <div v-if="serialInputMode === 'sequential'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Serial Prefix</label>
                <input v-model="serialPrefix" type="text" placeholder="e.g. US10- or SN-" class="form-input font-mono uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label">Starting Serial Number #</label>
                <input v-model.number="startSerialNum" type="number" min="1" class="form-input font-mono font-bold" />
              </div>
            </div>

            <!-- Mode B: Bulk Paste -->
            <div v-if="serialInputMode === 'bulkPaste'" class="form-group">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label mb-0">Paste Serial Numbers (one per line or comma separated)</label>
                <span class="text-xs font-mono font-bold" :class="pastedSerialsList.length === itemQty ? 'text-emerald-400' : 'text-amber-400'">
                  {{ pastedSerialsList.length }} / {{ itemQty }} entered
                </span>
              </div>
              <textarea
                v-model="bulkSerialsRawText"
                rows="3"
                placeholder="Paste 300 serial numbers here, e.g.:&#10;US10-9001&#10;US10-9002&#10;US10-9003..."
                class="form-textarea font-mono text-xs"
              ></textarea>
            </div>

            <!-- Machine Code <-> Serial Number Mapping Preview -->
            <div v-if="computedUnitMapping.length > 0" class="glass-panel p-3 text-xs space-y-2 border border-indigo-500/20">
              <div class="flex justify-between items-center font-bold text-slate-300">
                <span>Machine Code ↔ Serial Number Mapping Preview ({{ computedUnitMapping.length }} units):</span>
                <span class="text-indigo-400 font-mono text-[11px]">Branch: {{ form.allocationCity }}</span>
              </div>
              <div class="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono">
                <div
                  v-for="(unit, idx) in computedUnitMapping.slice(0, 15)"
                  :key="idx"
                  class="flex justify-between items-center py-0.5 px-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]"
                >
                  <span class="text-purple-400 font-bold">Code: {{ unit.machineCode }}</span>
                  <span class="text-slate-500">↔</span>
                  <span class="text-blue-300 font-bold">SN: {{ unit.serialCode }}</span>
                </div>
                <div v-if="computedUnitMapping.length > 15" class="text-center text-[10px] text-slate-400 italic py-1">
                  ... and {{ computedUnitMapping.length - 15 }} more units (Codes: {{ computedUnitMapping[0].machineCode }} to {{ computedUnitMapping[computedUnitMapping.length - 1].machineCode }})
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="showPOModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>Confirm Equipment Import ({{ computedUnitMapping.length }} Units)</span>
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
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { exportBLClosingExcel, printBLClosingReport, printPOVoucher } from '@/utils/reportExporter'
import {
  Truck,
  Building2,
  Check,
  Anchor,
  FileSpreadsheet,
  Download,
  Search,
  Printer,
  Plus,
  Eye,
  Edit3,
  Trash2,
  QrCode,
  FileText,
  Tag
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('bl')
const blSearchQuery = ref('')

// ── Tab 1: Bill of Lading (BL) State & Methods ─────────────────
const filteredBLList = computed(() => {
  let list = dataStore.blList || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    list = list.filter(b => {
      const bBranch = (b.branch || b.destinationCity || '').toLowerCase()
      return bBranch.includes(userCity) || userCity.includes(bBranch)
    })
  }
  const q = blSearchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(b =>
      (b.blNumber || '').toLowerCase().includes(q) ||
      (b.supplier || '').toLowerCase().includes(q) ||
      (b.productName || '').toLowerCase().includes(q) ||
      (b.productCode || '').toLowerCase().includes(q) ||
      (b.branch || '').toLowerCase().includes(q) ||
      (b.shipmentDetails || '').toLowerCase().includes(q)
    )
  }
  return list
})

function getBLBadgeClass(status) {
  switch (status) {
    case 'Closed':
      return 'badge-success font-bold'
    case 'Ready to Close':
      return 'badge-warning font-bold'
    case 'In Stock':
      return 'badge-info font-bold'
    default:
      return 'badge-purple font-bold'
  }
}

function getBLSerialList(bl) {
  if (!bl) return []
  if (bl.serialNumbers?.length) return bl.serialNumbers
  if (bl.serials?.length) return bl.serials
  if (bl.items?.length) {
    const fromItems = bl.items.flatMap(it => it.serials || [])
    if (fromItems.length) return fromItems
  }
  return (dataStore.serials || [])
    .filter(s => s.containerNo === bl.blNumber || s.blNumber === bl.blNumber)
    .map(s => s.serialNumber || s.serialCode)
}

function getBLCalculatedPurchaseCost(bl) {
  if (bl.items?.length) {
    return bl.items.reduce((sum, it) => sum + ((Number(it.costPrice) || 0) * (Number(it.quantity) || 1)), 0)
  }
  return 0
}

function getPOSerialsList(po) {
  if (!po) return []
  if (po.generatedSerials?.length) {
    return po.generatedSerials.map(s => typeof s === 'string' ? s : `${s.machineCode ? s.machineCode + ' ' : ''}(${(s.serialCode || s.serialNumber || '').replace(/^SN-/i, '')})`)
  }
  if (po.serials?.length) return po.serials
  if (po.items?.length) return po.items.flatMap(it => it.serials || it.generatedSerials || [])
  return []
}

const showBLDetailModal = ref(false)
const selectedBL = ref(null)

const blValidation = computed(() => {
  if (!selectedBL.value) return { canClose: false, issues: [], uncollectedTotal: 0, soldCount: 0, totalCount: 0, checklist: [] }
  const res = dataStore.validateBLForClosing(selectedBL.value.blNumber) || {}
  const issues = (res.checklist || [])
    .filter(c => !c.passed)
    .map(c => `${c.label}: ${c.details || 'Incomplete'}`)
  
  const linkedSerials = (dataStore.serials || []).filter(s => s.containerNo === selectedBL.value.blNumber || s.blNumber === selectedBL.value.blNumber)
  const soldCount = linkedSerials.filter(s => s.status === 'Sold').length
  const totalCount = linkedSerials.length

  return {
    canClose: Boolean(res.canClose),
    issues,
    checklist: res.checklist || [],
    soldCount,
    totalCount
  }
})

function openBLModal(bl) {
  selectedBL.value = bl
  showBLDetailModal.value = true
}

function printBLReport(blNumber) {
  if (!blNumber) return
  const rows = dataStore.getBLClosingRows(blNumber)
  printBLClosingReport(blNumber, rows, {
    branch: selectedBL.value?.branch || 'Peshawar HO',
    closedBy: authStore.user?.username || 'Executive Officer'
  })
}

function downloadBLReport(blNumber) {
  if (!blNumber) return
  const rows = dataStore.getBLClosingRows(blNumber)
  exportBLClosingExcel(blNumber, rows, {
    branch: selectedBL.value?.branch || 'All',
    closedBy: authStore.user?.username || 'Executive Officer'
  })
  uiStore.showModal(
    'Excel Report Generated',
    `Automatic 17-column BL Closing Sheet downloaded for ${blNumber}.`,
    'success'
  )
}

function finalizeBLClosing(blNumber) {
  if (!blNumber) return
  const res = dataStore.closeBL(blNumber, authStore.user?.username || 'Finance Admin')
  if (res.success) {
    uiStore.showModal('BL Closed Successfully', res.message, 'success')
    showBLDetailModal.value = false
  } else {
    uiStore.showModal('BL Closing Blocked', res.message, 'warning')
  }
}

// ── Register New BL Consignment Modal State ──────────────────
const showNewBLModal = ref(false)
const newBLForm = ref({
  blNumber: '',
  blDate: new Date().toISOString().substring(0, 10),
  supplier: 'Mindray Global Imports',
  shipmentDetails: 'Vessel MAERSK 40ft HQ / Karachi Port',
  productId: '',
  quantity: 10,
  purchaseCost: 4500000,
  landingCost: 350000,
  branch: authStore.userBranch || 'Karachi',
  receivingDate: new Date().toISOString().substring(0, 10)
})

function openNewBLModal() {
  const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
  newBLForm.value = {
    blNumber: `BL-MED-2026-${String((dataStore.blList?.length || 0) + 1).padStart(2, '0')}`,
    blDate: new Date().toISOString().substring(0, 10),
    supplier: 'Mindray Global Imports',
    shipmentDetails: 'Vessel MAERSK 40ft HQ / Karachi Port',
    productId: dataStore.products?.[0]?.id || '',
    quantity: 5,
    purchaseCost: 2250000,
    landingCost: 200000,
    branch: currentBranch,
    receivingDate: new Date().toISOString().substring(0, 10)
  }
  showNewBLModal.value = true
}

async function handleCreateBL() {
  if (!newBLForm.value.blNumber || !newBLForm.value.productId) {
    uiStore.showModal('Validation Error', 'Please specify BL Number and Equipment SKU.', 'warning')
    return
  }

  const prod = dataStore.products.find(p => p.id === newBLForm.value.productId)
  if (!prod) return

  // Register serials under this BL
  const startCode = 400 + (dataStore.serials?.length || 0)
  const newSerials = []
  for (let i = 0; i < newBLForm.value.quantity; i++) {
    newSerials.push({
      serialCode: `${prod.sku}-${startCode + i}`,
      machineCode: `MC-${startCode + i}`,
      productId: prod.id,
      sku: prod.sku,
      status: 'Available',
      allocationCity: newBLForm.value.branch,
      binLocation: 'BIN-MAIN-01',
      registeredDate: newBLForm.value.receivingDate,
      blNumber: newBLForm.value.blNumber
    })
  }

  await dataStore.createPurchaseOrder({
    supplier: newBLForm.value.supplier,
    allocationCity: newBLForm.value.branch,
    blNumber: newBLForm.value.blNumber,
    items: [{
      productId: prod.id,
      productName: prod.name,
      qty: newBLForm.value.quantity,
      unitCost: newBLForm.value.purchaseCost / newBLForm.value.quantity
    }],
    generatedSerials: newSerials,
    totalAmount: newBLForm.value.purchaseCost + (newBLForm.value.landingCost || 0)
  }, authStore.user)

  uiStore.showModal(
    'BL Registered Successfully',
    `Consignment ${newBLForm.value.blNumber} has been logged with ${newBLForm.value.quantity} machine units and mapped to ${newBLForm.value.branch} warehouse.`,
    'success'
  )

  showNewBLModal.value = false
}

// ── Tab 2: Standard PO Generator State & Actions ──────────────
const showPOModal = ref(false)
const selectedProductId = ref('')
const itemQty = ref(10)
const startingMachineCodeInput = ref('WD-35')

const serialInputMode = ref('sequential') // 'sequential' | 'bulkPaste'
const serialPrefix = ref('')
const startSerialNum = ref(1001)
const bulkSerialsRawText = ref('')

const form = ref({
  supplier: 'Mindray Global Imports',
  allocationCity: authStore.userBranch || 'Karachi'
})

function openNewPOModal() {
  const currentBranch = authStore.userBranch || (dataStore.activeBranchFilter && dataStore.activeBranchFilter !== 'All' ? dataStore.activeBranchFilter : 'Karachi')
  form.value = {
    supplier: 'Mindray Global Imports',
    allocationCity: currentBranch
  }
  selectedProductId.value = dataStore.products?.[0]?.id || ''
  itemQty.value = 10
  startingMachineCodeInput.value = 'WD-35'
  serialInputMode.value = 'sequential'
  startSerialNum.value = 1001
  bulkSerialsRawText.value = ''
  showPOModal.value = true
}

function parseMachineCode(input) {
  if (!input || typeof input !== 'string') {
    return { prefix: 'WD-', startNum: 35, padLen: 0 }
  }
  const trimmed = input.trim()
  const match = trimmed.match(/^(.*?)(\d+)$/)
  if (match) {
    const prefix = match[1]
    const numStr = match[2]
    const startNum = parseInt(numStr, 10)
    const padLen = numStr.length
    return { prefix, startNum, padLen }
  }
  return { prefix: trimmed.endsWith('-') ? trimmed : `${trimmed}-`, startNum: 1, padLen: 0 }
}

const pastedSerialsList = computed(() => {
  if (!bulkSerialsRawText.value) return []
  return bulkSerialsRawText.value
    .split(/[\n,]+/)
    .map(s => s.trim().replace(/^SN-/i, ''))
    .filter(Boolean)
})

const computedUnitMapping = computed(() => {
  const prod = dataStore.products.find(p => p.id === selectedProductId.value)
  const defaultSku = prod ? (prod.sku || 'MED').replace(/^SN-/i, '') : 'MED'
  const count = Number(itemQty.value) || 0
  const mapping = []

  const { prefix, startNum, padLen } = parseMachineCode(startingMachineCodeInput.value)

  for (let i = 0; i < count; i++) {
    const currentNum = startNum + i
    const formattedNum = padLen > 1 ? String(currentNum).padStart(padLen, '0') : String(currentNum)
    const mCode = `${prefix}${formattedNum}`
    let sCode = ''

    if (serialInputMode.value === 'bulkPaste') {
      sCode = pastedSerialsList.value[i] || `${defaultSku}-${formattedNum}`
    } else {
      const pfx = serialPrefix.value || `${defaultSku}-`
      sCode = `${pfx}${startSerialNum.value + i}`
    }

    mapping.push({
      machineCode: mCode,
      serialCode: sCode
    })
  }

  return mapping
})

async function submitPO() {
  if (!selectedProductId.value || !form.value.supplier || itemQty.value < 1) {
    uiStore.showModal('Validation Error', 'Please select product, supplier, and quantity.', 'warning')
    return
  }

  const prod = dataStore.products.find(p => p.id === selectedProductId.value)
  if (!prod) return

  const mapping = computedUnitMapping.value
  if (mapping.length === 0) {
    uiStore.showModal('Validation Error', 'No machines to import.', 'warning')
    return
  }

  // Strict Duplicate Validation across entire system
  for (const item of mapping) {
    if (dataStore.checkDuplicateSerial(item.serialCode)) {
      uiStore.showModal(
        'Duplicate Serial Error ⚠️',
        `Serial Number "${item.serialCode}" already exists in the database! Every machine must have a strictly unique Serial Number.`,
        'danger'
      )
      return
    }

    if (dataStore.checkDuplicateMachineCode(item.machineCode)) {
      uiStore.showModal(
        'Duplicate Machine Code Error ⚠️',
        `Internal Machine Code "${item.machineCode}" already exists in the database! Machine codes must be unique.`,
        'danger'
      )
      return
    }
  }

  const serialsToCreate = mapping.map(item => ({
    serialCode: item.serialCode,
    machineCode: item.machineCode,
    productId: prod.id,
    sku: prod.sku,
    status: 'Available',
    allocationCity: form.value.allocationCity,
    binLocation: 'BIN-MAIN-01',
    registeredDate: new Date().toISOString().split('T')[0]
  }))

  await dataStore.createPurchaseOrder({
    supplier: form.value.supplier,
    allocationCity: form.value.allocationCity,
    items: [{ productId: prod.id, productName: prod.name, qty: mapping.length, unitCost: prod.costPrice }],
    generatedSerials: serialsToCreate,
    totalAmount: mapping.length * prod.costPrice
  }, authStore.user)

  uiStore.showModal(
    'Import Created ✅',
    `Successfully imported ${serialsToCreate.length} units of "${prod.name}" under PO with unique Serial Numbers and Machine Codes mapped.`,
    'success'
  )

  showPOModal.value = false
  bulkSerialsRawText.value = ''
}

// ── Tab 2 Search, View, Edit & Delete Methods ─────────────────
const poSearchQuery = ref('')

const filteredPOList = computed(() => {
  let list = dataStore.purchaseOrders || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    list = list.filter(po => {
      const bBranch = (po.allocationCity || po.branch || '').toLowerCase()
      return bBranch.includes(userCity) || userCity.includes(bBranch)
    })
  }
  const q = poSearchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(po =>
      (po.poNumber || '').toLowerCase().includes(q) ||
      (po.supplier || '').toLowerCase().includes(q) ||
      (po.allocationCity || po.branch || '').toLowerCase().includes(q) ||
      (po.items || []).some(it => (it.productName || '').toLowerCase().includes(q)) ||
      getPOSerialsList(po).some(s => String(s).toLowerCase().includes(q))
    )
  }
  return list
})

const showViewPOModal = ref(false)
const selectedPO = ref(null)

function openViewPOModal(po) {
  selectedPO.value = po
  showViewPOModal.value = true
}

const showEditPOModal = ref(false)
const editPOForm = ref({
  poNumber: '',
  supplier: '',
  orderDate: '',
  allocationCity: 'Karachi',
  totalAmount: 0,
  remarks: ''
})

function openEditPOModal(po) {
  if (!po) return
  selectedPO.value = po
  editPOForm.value = {
    poNumber: po.poNumber,
    supplier: po.supplier || '',
    orderDate: po.orderDate || new Date().toISOString().substring(0, 10),
    allocationCity: po.allocationCity || po.branch || 'Karachi',
    totalAmount: Number(po.totalAmount || 0),
    remarks: po.remarks || ''
  }
  showEditPOModal.value = true
}

async function handleSavePOEdit() {
  if (!editPOForm.value.supplier.trim()) {
    uiStore.showModal('Validation Error', 'Supplier name is required.', 'warning')
    return
  }

  const res = await dataStore.updatePurchaseOrder(editPOForm.value.poNumber, {
    supplier: editPOForm.value.supplier.trim(),
    orderDate: editPOForm.value.orderDate,
    allocationCity: editPOForm.value.allocationCity,
    branch: editPOForm.value.allocationCity,
    totalAmount: Number(editPOForm.value.totalAmount || 0),
    remarks: editPOForm.value.remarks
  }, authStore.user)

  if (res.success) {
    uiStore.showToast(`Purchase Order ${editPOForm.value.poNumber} updated successfully!`, 'success')
    showEditPOModal.value = false
    if (selectedPO.value?.poNumber === editPOForm.value.poNumber) {
      selectedPO.value = res.po
    }
  } else {
    uiStore.showModal('Update Failed', res.message, 'warning')
  }
}

function confirmDeletePO(po) {
  if (!po) return
  uiStore.showConfirm({
    title: 'Delete Purchase Order',
    message: `Are you sure you want to delete PO #${po.poNumber} (${po.supplier})? This will remove the purchase order record and its unallocated serials from the database.`,
    type: 'danger',
    confirmText: 'Yes, Delete PO',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const res = await dataStore.deletePurchaseOrder(po.poNumber, authStore.user)
      if (res.success) {
        uiStore.showToast(`Purchase Order #${po.poNumber} deleted successfully.`, 'info')
        if (selectedPO.value?.poNumber === po.poNumber) {
          showViewPOModal.value = false
          selectedPO.value = null
        }
      } else {
        uiStore.showModal('Delete Failed', res.message, 'warning')
      }
    }
  })
}
</script>

<style scoped>
/* ── Compact & Sleek Serial Numbers Scroll Container ── */
.serials-scroll-cell {
  max-width: 190px !important;
  max-height: 56px !important;
  height: 56px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-content: flex-start !important;
  gap: 3px !important;
  padding: 4px 6px !important;
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  scrollbar-width: thin !important;
  scrollbar-color: #6366f1 #e2e8f0 !important;
}

[data-theme="dark"] .serials-scroll-cell,
.dark .serials-scroll-cell {
  background: rgba(15, 23, 42, 0.75) !important;
  border: 1px solid rgba(71, 85, 105, 0.4) !important;
  scrollbar-color: #8b5cf6 rgba(15, 23, 42, 0.9) !important;
}

.serials-scroll-cell::-webkit-scrollbar {
  width: 4px !important;
}

.serials-scroll-cell::-webkit-scrollbar-track {
  background: #e2e8f0 !important;
  border-radius: 4px !important;
}

[data-theme="dark"] .serials-scroll-cell::-webkit-scrollbar-track,
.dark .serials-scroll-cell::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.9) !important;
}

.serials-scroll-cell::-webkit-scrollbar-thumb {
  background: #6366f1 !important;
  border-radius: 4px !important;
}

[data-theme="dark"] .serials-scroll-cell::-webkit-scrollbar-thumb,
.dark .serials-scroll-cell::-webkit-scrollbar-thumb {
  background: #8b5cf6 !important;
}

.serial-badge-item {
  display: inline-block !important;
  white-space: nowrap !important;
  font-family: 'JetBrains Mono', monospace, monospace !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 1px 5px !important;
  border-radius: 3px !important;
  background: #ffffff !important;
  color: #4338ca !important;
  border: 1px solid #c7d2fe !important;
  line-height: 1.3 !important;
}

[data-theme="dark"] .serial-badge-item,
.dark .serial-badge-item {
  background: rgba(30, 41, 59, 0.95) !important;
  color: #e2e8f0 !important;
  border: 1px solid rgba(148, 163, 184, 0.25) !important;
}
</style>

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

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <button @click="uiStore.openPurchaseModal()" class="btn btn-primary font-bold shadow-lg flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 px-4 whitespace-nowrap cursor-pointer">
          <Anchor :size="16" class="text-white shrink-0" />
          <span>Register BL Import</span>
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
        <div class="kpi-value text-white mt-2">PKR {{ totalBLExpenditures.toLocaleString() }}</div>
        <div class="kpi-subtitle text-subtle">Total landed cost for {{ filteredBLList.length }} BL consignments</div>
      </div>

      <div class="kpi-card kpi-purple glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Tracked BL Shipments</span>
          <span class="badge badge-purple font-mono">IMPORT HUBS</span>
        </div>
        <div class="kpi-value text-purple-400 mt-2">{{ filteredBLList.length }} BL Shipments</div>
        <div class="kpi-subtitle text-subtle">Containers & sea freight shipments logged</div>
      </div>

      <div class="kpi-card kpi-success glass-panel p-5">
        <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
          <span>Consignment Machines</span>
          <span class="badge badge-success font-mono">FULFILLED</span>
        </div>
        <div class="kpi-value text-emerald-400 mt-2">{{ totalBLMachinesCount }} Units</div>
        <div class="kpi-subtitle text-subtle">All serial numbers & machine codes indexed</div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB SWITCHER: BILLS vs RETURNS
    ════════════════════════════════════════════ -->
    <div class="flex items-center gap-2 border-b border-slate-700/60 pb-1">
      <button
        @click="setTab('bills')"
        :class="['px-4 py-2.5 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-b-2', activeTab === 'bills' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40']"
      >
        <Anchor :size="16" />
        <span>Purchase Bills & BL Tracking</span>
        <span class="badge badge-info text-[10px] ml-1">{{ filteredBLList.length }}</span>
      </button>

      <button
        @click="setTab('return')"
        :class="['px-4 py-2.5 font-bold text-sm rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-b-2', activeTab === 'return' ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40']"
      >
        <RotateCcw :size="16" />
        <span>Purchase Return / Dr. Note</span>
        <span class="badge badge-warning text-[10px] ml-1">{{ (dataStore.purchaseReturns || []).length }}</span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: BILL OF LADING SHIPMENTS & CLOSING MATRIX
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'bills'" class="space-y-4 animate-fade-in">
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

          <div class="relative min-w-[280px] sm:min-w-[360px]">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="blSearchQuery"
              type="text"
              placeholder="Search any field: BL #, Supplier, Product, SN, Port, Date, Cost, Branch..."
              class="form-input text-xs pl-9 pr-8 w-full"
            />
            <button
              v-if="blSearchQuery"
              @click="blSearchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
              title="Clear search"
            >
              ✕
            </button>
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
                <th>Serial Numbers & Machine Codes</th>
                <th>Qty</th>
                <th>Purchase Cost</th>
                <th>Landing Cost</th>
                <th>Receiving Date</th>
                <th>Branch</th>
                <th>BL Status</th>
                <th class="text-right">Actions & Closing</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="bl in filteredBLList"
                :key="bl.blNumber"
                @click="uiStore.openPurchaseModal(bl)"
                class="cursor-pointer hover:bg-slate-800/60 dark:hover:bg-slate-800/80 transition-colors group"
                title="Click anywhere to open Purchase Consignment Invoice"
              >
                <td class="font-mono font-bold text-blue-400 group-hover:underline">{{ bl.blNumber }}</td>
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
                  <!-- Quick Serials & Machine Codes display in Product cell -->
                  <div v-if="getBLSerialItems(bl).length > 0" class="mt-1 space-y-0.5 text-[10px] font-mono">
                    <div class="text-slate-400">
                      <span class="text-slate-500 font-bold">Serials:</span>
                      <span class="text-sky-300 ml-1 font-semibold">{{ getBLSerialItems(bl).slice(0, 3).map(s => s.serialCode).join(', ') }}</span>
                      <span v-if="getBLSerialItems(bl).length > 3" class="text-slate-500 ml-1">+{{ getBLSerialItems(bl).length - 3 }} more</span>
                    </div>
                    <div class="text-slate-400">
                      <span class="text-purple-400 font-bold">Codes:</span>
                      <span class="text-purple-300 ml-1 font-semibold">{{ getBLSerialItems(bl).slice(0, 3).map(s => s.machineCode).join(', ') }}</span>
                      <span v-if="getBLSerialItems(bl).length > 3" class="text-purple-400 ml-1">+{{ getBLSerialItems(bl).length - 3 }} more</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div v-if="getBLSerialItems(bl).length > 0" class="space-y-1 text-xs">
                    <div class="flex flex-wrap items-center gap-1 max-w-[240px]">
                      <span class="text-[10px] text-slate-400 font-mono font-semibold">SN:</span>
                      <span
                        v-for="(sItem, sIdx) in getBLSerialItems(bl).slice(0, 4)"
                        :key="'bl-sn-' + sIdx"
                        class="badge badge-info font-mono text-[10px] py-0 px-1.5 font-bold"
                        :title="`Serial: ${sItem.serialCode} | Machine Code: ${sItem.machineCode}`"
                      >
                        {{ sItem.serialCode }}
                      </span>
                      <span
                        v-if="getBLSerialItems(bl).length > 4"
                        class="badge badge-neutral font-mono text-[9px] py-0 px-1 text-slate-400 cursor-pointer"
                        @click.stop="uiStore.openPurchaseModal(bl)"
                        title="Click to view all serials"
                      >
                        +{{ getBLSerialItems(bl).length - 4 }} more
                      </span>
                    </div>
                    <div class="flex flex-wrap items-center gap-1 max-w-[240px]">
                      <span class="text-[10px] text-purple-400 font-mono font-semibold">MC:</span>
                      <span
                        v-for="(sItem, sIdx) in getBLSerialItems(bl).slice(0, 4)"
                        :key="'bl-mc-' + sIdx"
                        class="badge badge-purple font-mono text-[10px] py-0 px-1.5 font-bold"
                        :title="`Machine Code: ${sItem.machineCode} | Serial: ${sItem.serialCode}`"
                      >
                        {{ sItem.machineCode || '-' }}
                      </span>
                      <span
                        v-if="getBLSerialItems(bl).length > 4"
                        class="badge badge-neutral font-mono text-[9px] py-0 px-1 text-purple-400 cursor-pointer"
                        @click.stop="uiStore.openPurchaseModal(bl)"
                        title="Click to view all machine codes"
                      >
                        +{{ getBLSerialItems(bl).length - 4 }} more
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-[10px] text-slate-500 font-mono italic">
                    No Serials/Codes
                  </div>
                </td>
                <td class="font-mono text-xs font-bold text-emerald-400">
                  {{ bl.totalUnits || bl.quantity || (bl.items ? bl.items.reduce((s, it) => s + Number(it.quantity || 0), 0) : 0) }} units
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
                <td class="text-right" @click.stop>
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click.stop="printBLConsignmentSlip(bl)"
                      class="btn btn-xs btn-secondary font-bold text-sky-400 flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Print Official BL Consignment Slip / PDF"
                    >
                      <Printer :size="12" />
                      <span>PDF</span>
                    </button>
                    <button
                      @click.stop="downloadBLReport(bl.blNumber)"
                      class="btn btn-xs btn-secondary font-bold text-emerald-400 flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Download 17-Column Excel Report"
                    >
                      <FileSpreadsheet :size="12" />
                      <span>Excel</span>
                    </button>
                    <button
                      @click.stop="uiStore.openPurchaseModal(bl)"
                      class="btn btn-xs btn-secondary font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Edit BL Consignment in Full Purchase Editor"
                    >
                      <Edit3 :size="12" />
                      <span>Edit</span>
                    </button>
                    <button
                      @click.stop="confirmDeleteBL(bl)"
                      class="btn btn-xs btn-secondary font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 shadow-sm"
                      title="Delete BL Record"
                    >
                      <Trash2 :size="12" />
                    </button>
                    <button
                      @click.stop="openBLModal(bl)"
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
      TAB 2: PURCHASE RETURN / DR. NOTE MANAGEMENT
    ════════════════════════════════════════════ -->
    <div v-else-if="activeTab === 'return'" class="space-y-4 animate-fade-in">
      <!-- Return Header & Actions -->
      <div class="glass-panel p-6 shadow-xl space-y-4 border-l-4 border-amber-500">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw :size="20" class="text-amber-400" />
              <span>Purchase Returns & Debit Notes (Dr. Note)</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              Record returns for defective or cancelled units, generate official Debit Notes, and automatically deduct from vendor payable balances.
            </p>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto">
            <div class="relative min-w-[240px] sm:min-w-[280px]">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                v-model="returnSearchQuery"
                type="text"
                placeholder="Search Return #, Dr Note, Supplier, Reason..."
                class="form-input text-xs pl-9 pr-8 w-full"
              />
              <button
                v-if="returnSearchQuery"
                @click="returnSearchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                title="Clear search"
              >
                ✕
              </button>
            </div>

            <button
              @click="openNewReturnModal"
              class="btn btn-warning font-bold text-xs flex items-center gap-1.5 py-2 px-3 whitespace-nowrap shadow-md cursor-pointer"
            >
              <Plus :size="14" />
              <span>Record Purchase Return / Dr. Note</span>
            </button>
          </div>
        </div>

        <!-- Returns KPI Sub-strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Return Notes</span>
              <div class="text-lg font-extrabold text-white mt-0.5 font-mono">{{ (dataStore.purchaseReturns || []).length }}</div>
            </div>
            <RotateCcw :size="20" class="text-amber-400 opacity-60" />
          </div>

          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Debit Note Deductions</span>
              <div class="text-lg font-extrabold text-amber-400 mt-0.5 font-mono">
                PKR {{ totalReturnAmount.toLocaleString() }}
              </div>
            </div>
            <Receipt :size="20" class="text-amber-400 opacity-60" />
          </div>

          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Returned Units Adjusted</span>
              <div class="text-lg font-extrabold text-rose-400 mt-0.5 font-mono">{{ totalReturnedUnitsCount }} Units</div>
            </div>
            <Truck :size="20" class="text-rose-400 opacity-60" />
          </div>
        </div>

        <!-- Returns Table -->
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Debit Note #</th>
                <th>Return Date</th>
                <th>BL / PO Ref</th>
                <th>Supplier Name</th>
                <th>Branch</th>
                <th>Returned Items & Serials</th>
                <th>Return Amount</th>
                <th>Return Reason</th>
                <th>Settlement</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="ret in filteredPurchaseReturns"
                :key="ret.id || ret.returnNo"
                class="hover:bg-slate-800/60 transition-colors"
              >
                <td class="font-mono font-bold text-amber-400 text-xs">{{ ret.returnNo }}</td>
                <td class="font-mono font-bold text-purple-400 text-xs">{{ ret.debitNoteNo || 'N/A' }}</td>
                <td class="font-mono text-xs text-slate-400">{{ ret.returnDate }}</td>
                <td class="font-mono text-xs text-blue-300">{{ ret.blNumber || 'DIRECT-PO' }}</td>
                <td class="font-bold text-white text-xs">{{ ret.supplier || ret.supplierName }}</td>
                <td>
                  <span class="badge badge-purple text-[10px]">{{ ret.branch || 'Peshawar' }}</span>
                </td>
                <td>
                  <div v-if="ret.items && ret.items.length > 0" class="space-y-1">
                    <div v-for="(it, iIdx) in ret.items" :key="iIdx" class="text-xs">
                      <span class="font-bold text-white">{{ it.qty || 1 }}x {{ it.name || it.productName }}</span>
                      <div v-if="it.serials && it.serials.length" class="text-[10px] font-mono text-slate-400">
                        SN: {{ it.serials.join(', ') }}
                      </div>
                    </div>
                  </div>
                  <div v-else-if="ret.returnedSerials && ret.returnedSerials.length" class="text-xs">
                    <div v-for="(s, sIdx) in ret.returnedSerials" :key="sIdx" class="font-mono text-[11px] text-slate-300">
                      {{ s.machineCode || s.serialCode }} ({{ s.productName || s.sku }})
                    </div>
                  </div>
                  <span v-else class="text-xs text-slate-400">Returned Equipment</span>
                </td>
                <td class="font-mono text-xs font-bold text-amber-400">
                  PKR {{ (ret.totalReturnAmount || 0).toLocaleString() }}
                </td>
                <td class="text-xs text-slate-300 max-w-[180px] truncate" :title="ret.reason">
                  {{ ret.reason || 'Damaged / Defective' }}
                </td>
                <td>
                  <span class="badge badge-success text-[10px] font-mono">
                    {{ ret.refundStatus || 'Debit Note Issued' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      @click="printDebitNote(ret)"
                      class="btn btn-xs btn-secondary font-bold text-sky-400 flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Print Official Debit Note Slip"
                    >
                      <Printer :size="12" />
                      <span>Print Slip</span>
                    </button>
                    <button
                      @click="confirmDeletePurchaseReturn(ret)"
                      class="btn btn-xs btn-secondary font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 shadow-sm cursor-pointer"
                      title="Delete Return Record"
                    >
                      <Trash2 :size="12" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredPurchaseReturns.length === 0">
                <td colspan="11" class="p-8 text-center text-slate-500 italic">No purchase returns recorded yet.</td>
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

    <!-- ── MODAL: Edit Bill of Lading (BL) Consignment ───────────────── -->
    <div v-if="showEditBLModal" class="modal-backdrop" @click.self="showEditBLModal = false">
      <div class="modal-content max-w-lg bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2">
            <Anchor :size="18" class="text-purple-500" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Edit BL Consignment: {{ editBLForm.blNumber }}</h3>
          </div>
          <button @click="showEditBLModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSaveEditedBL" class="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">BL Number *</label>
              <input v-model="editBLForm.blNumber" type="text" required class="form-input font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">BL Date *</label>
              <input v-model="editBLForm.blDate" type="date" required class="form-input font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Supplier / Exporter *</label>
              <input v-model="editBLForm.supplier" type="text" required class="form-input font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Shipment Details / Port</label>
              <input v-model="editBLForm.shipmentDetails" type="text" placeholder="e.g. Vessel MAERSK 40ft HQ / Karachi Port" class="form-input bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Purchase Cost (PKR) *</label>
              <input v-model.number="editBLForm.purchaseCost" type="number" required class="form-input font-mono font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Landing Cost / Duties (PKR)</label>
              <input v-model.number="editBLForm.landingCost" type="number" class="form-input font-mono text-amber-600 dark:text-amber-400 font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Branch / Depot *</label>
              <select v-model="editBLForm.branch" class="form-select font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
                <option value="Karachi">Karachi Branch</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">Receiving Date</label>
              <input v-model="editBLForm.receivingDate" type="date" class="form-input font-mono bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
            </div>
            <div class="form-group">
              <label class="form-label text-slate-700 dark:text-slate-300">BL Status</label>
              <select v-model="editBLForm.blStatus" class="form-select font-bold bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                <option value="In Stock">In Stock</option>
                <option value="Ready to Close">Ready to Close</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <button type="button" @click="showEditBLModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn btn-primary font-bold px-4 py-2 flex items-center gap-1.5">
              <Check :size="14" />
              <span>Save Changes</span>
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

    <!-- ── MODAL: Record Purchase Return / Debit Note ──────────────────── -->
    <div v-if="showNewReturnModal" class="modal-backdrop" @click.self="showNewReturnModal = false">
      <div class="modal-content max-w-2xl bg-white dark:bg-[#1e2530] text-slate-800 dark:text-white rounded-xl shadow-2xl p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-2">
            <RotateCcw :size="20" class="text-amber-500" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white">Record Purchase Return / Debit Note (Dr. Note)</h3>
          </div>
          <button @click="showNewReturnModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSavePurchaseReturn" class="overflow-y-auto space-y-4 text-xs pr-1 flex-1">
          <!-- Top Row: Supplier & Associated BL / Consignment -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Supplier / Vendor *</label>
              <select v-model="returnForm.supplier" required class="form-select w-full p-2 border rounded font-bold" @change="onReturnSupplierChange">
                <option value="" disabled>-- Select Supplier --</option>
                <option v-for="sup in supplierOptions" :key="sup" :value="sup">{{ sup }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Original BL / Purchase Bill Ref</label>
              <select v-model="returnForm.blNumber" class="form-select w-full p-2 border rounded font-mono font-bold" @change="onReturnBLChange">
                <option value="">-- Direct PO / Standalone Return --</option>
                <option v-for="bl in availableSupplierBLs" :key="bl.blNumber" :value="bl.blNumber">
                  {{ bl.blNumber }} ({{ bl.blDate || 'N/A' }} - PKR {{ (bl.purchaseCost || 0).toLocaleString() }})
                </option>
              </select>
            </div>
          </div>

          <!-- Second Row: Date & Receiving Branch -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Return Date *</label>
              <input v-model="returnForm.returnDate" type="date" required class="form-input w-full p-2 border rounded font-mono font-bold" />
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Branch Depot *</label>
              <select v-model="returnForm.branch" required class="form-select w-full p-2 border rounded font-bold">
                <option value="Karachi">Karachi Branch</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Lahore">Lahore Branch</option>
                <option value="Islamabad">Islamabad Branch</option>
              </select>
            </div>
          </div>

          <!-- Available Serials / Machines to Return Selection -->
          <div class="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <QrCode :size="14" class="text-indigo-400" />
                <span>Select Machine Serials to Return:</span>
              </label>
              <span class="text-[11px] text-slate-400">
                Selected: <strong class="text-amber-400">{{ returnForm.selectedSerials.length }}</strong> units
              </span>
            </div>

            <div v-if="selectableSerialsForReturn.length > 0" class="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-700/60 rounded p-2 bg-white dark:bg-slate-950">
              <label
                v-for="s in selectableSerialsForReturn"
                :key="s.serialCode || s.machineCode"
                class="flex items-center justify-between p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-xs"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="s"
                    v-model="returnForm.selectedSerials"
                    class="rounded text-amber-500 focus:ring-amber-500"
                    @change="calculateReturnTotal"
                  />
                  <div>
                    <span class="font-bold text-slate-900 dark:text-white font-mono">{{ s.machineCode || s.serialCode }}</span>
                    <span v-if="s.machineCode && s.serialCode && s.machineCode !== s.serialCode" class="text-[10px] text-slate-400 font-mono ml-1.5">
                      (SN: {{ s.serialCode }})
                    </span>
                    <span class="text-slate-500 dark:text-slate-400 ml-2">({{ s.productName || s.sku }})</span>
                  </div>
                </div>
                <div class="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  PKR {{ (s.costPrice || 0).toLocaleString() }}
                </div>
              </label>
            </div>
            <div v-else class="text-xs text-slate-400 italic p-3 text-center bg-white dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800">
              No in-stock serials found for this selection. You can set the return amount manually below.
            </div>
          </div>

          <!-- Return Amount & Settlement -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Total Debit Note Amount (PKR) *</label>
              <input
                v-model.number="returnForm.totalReturnAmount"
                type="number"
                min="0"
                required
                class="form-input w-full p-2 border rounded font-mono font-bold text-amber-500"
              />
              <span class="text-[10px] text-slate-400">Total debit note amount to deduct from supplier payable balance.</span>
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Settlement / Dr. Note Treatment</label>
              <select v-model="returnForm.refundMethod" class="form-select w-full p-2 border rounded font-bold">
                <option value="Debit Note Issued (Supplier Ledger Adjusted)">Debit Note Issued (Deduct from Payable Ledger)</option>
                <option value="Cash / Bank Refund Received">Cash / Bank Refund Received</option>
              </select>
            </div>
          </div>

          <!-- Reason & Notes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Return Reason *</label>
              <select v-model="returnForm.reason" class="form-select w-full p-2 border rounded font-bold">
                <option value="Defective / Damaged on Arrival">Defective / Damaged on Arrival</option>
                <option value="Wrong Specification Shipped">Wrong Specification Shipped</option>
                <option value="Transit Damage / Sea Freight Loss">Transit Damage / Sea Freight Loss</option>
                <option value="Supplier Agreement Recall">Supplier Agreement Recall</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label font-bold mb-1 block">Remarks / Defect Details</label>
              <input
                v-model="returnForm.notes"
                type="text"
                placeholder="e.g. Tube calibration error, chassis damage..."
                class="form-input w-full p-2 border rounded"
              />
            </div>
          </div>

          <div class="modal-footer pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <button type="button" @click="showNewReturnModal = false" class="btn btn-secondary px-4 py-2">Cancel</button>
            <button type="submit" class="btn btn-warning font-bold flex items-center gap-1.5 px-5 py-2 shadow-md">
              <Check :size="16" />
              <span>Confirm & Issue Debit Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  Tag,
  RotateCcw,
  Receipt
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref(route.query.type === 'return' ? 'return' : 'bills')
watch(() => route.query.type, (newType) => {
  activeTab.value = newType === 'return' ? 'return' : 'bills'
})

function setTab(tab) {
  activeTab.value = tab
  if (tab === 'return') {
    router.replace({ query: { ...route.query, type: 'return' } })
  } else {
    const q = { ...route.query }
    delete q.type
    router.replace({ query: q })
  }
}

const blSearchQuery = ref('')

// ── Tab 1: Comprehensive Multi-Field Search Filter for BL Consignments ───────
const filteredBLList = computed(() => {
  let list = dataStore.blList || []
  if (!authStore.isSuperAdmin) {
    const userCity = (authStore.userBranch || 'Lahore').toLowerCase()
    list = list.filter(b => {
      const bBranch = (b.branch || b.destinationCity || '').toLowerCase()
      return bBranch.includes(userCity) || userCity.includes(bBranch)
    })
  }

  const rawQuery = blSearchQuery.value.trim().toLowerCase()
  if (!rawQuery) return list

  const tokens = rawQuery.split(/\s+/).filter(Boolean)

  return list.filter(b => {
    // Aggregate every possible searchable text value across all columns & nested data
    const searchableFields = [
      b.blNumber,
      b.containerNo,
      b.id,
      b.poNumber,
      b.supplier,
      b.supplierName,
      b.companyName,
      b.productName,
      b.productCode,
      b.sku,
      b.branch,
      b.destinationCity,
      b.shipmentDetails,
      b.shippingLine,
      b.vesselName,
      b.portOfOrigin,
      b.destinationPort,
      b.blStatus,
      b.blDate,
      b.arrivalDate,
      b.receivingDate,
      b.notes,
      b.remarks,
      b.clearingAgent,
      b.lcNumber,
      b.gdNumber,
      b.purchaseCost ? String(b.purchaseCost) : '',
      b.landingCost ? String(b.landingCost) : '',
      b.totalCostValue ? String(b.totalCostValue) : ''
    ]

    // Include all items in consignment
    if (Array.isArray(b.items)) {
      b.items.forEach(it => {
        searchableFields.push(
          it.name,
          it.productName,
          it.sku,
          it.productCode,
          it.category,
          it.description,
          String(it.price || ''),
          String(it.costPrice || '')
        )
        if (Array.isArray(it.serials)) searchableFields.push(...it.serials)
        if (Array.isArray(it.serialNumbers)) searchableFields.push(...it.serialNumbers)
      })
    }

    // Include all serials and machine codes
    const serialItems = getBLSerialItems(b)
    serialItems.forEach(si => {
      searchableFields.push(si.machineCode, si.serialCode, si.display)
    })

    if (Array.isArray(b.serialNumbers)) {
      b.serialNumbers.forEach(s => {
        if (typeof s === 'string') searchableFields.push(s)
        else if (s && typeof s === 'object') searchableFields.push(s.machineCode, s.serialCode, s.serialNumber)
      })
    }

    const corpus = searchableFields
      .filter(v => v !== undefined && v !== null)
      .map(v => String(v).toLowerCase())
      .join(' ')

    // True if every search term appears somewhere in this BL record
    return tokens.every(t => corpus.includes(t))
  })
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

function getBLSerialItems(bl) {
  if (!bl) return []

  const blKey = String(bl.blNumber || bl.containerNo || bl.id || '').trim().toLowerCase()

  // 1. Linked serial records from dataStore.serials (highest fidelity with full metadata)
  const linkedSerials = (dataStore.serials || []).filter(s => {
    const sCont = String(s.containerNo || '').trim().toLowerCase()
    const sBL = String(s.blNumber || '').trim().toLowerCase()
    const sPO = String(s.purchaseInvoiceNo || '').trim().toLowerCase()
    return (sCont && sCont === blKey) || (sBL && sBL === blKey) || (sPO && sPO === blKey)
  })

  if (linkedSerials.length > 0) {
    return linkedSerials.map((s, idx) => {
      const sCode = String(s.serialCode || s.serialNumber || s.serial || '').replace(/^SN-/i, '').trim()
      const mCode = String(s.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)).trim()
      const hasBoth = mCode && sCode && mCode !== sCode
      return {
        machineCode: mCode,
        serialCode: sCode || mCode,
        display: hasBoth ? `${mCode} (SN: ${sCode})` : (mCode || sCode || 'Unit'),
        tooltip: `Machine Code: ${mCode || 'N/A'} | Serial Number: ${sCode || 'N/A'}`
      }
    })
  }

  // 2. From items in the BL consignment
  if (bl.items?.length) {
    const fromItems = []
    bl.items.forEach(it => {
      if (Array.isArray(it.serials)) {
        fromItems.push(...it.serials)
      } else if (typeof it.serials === 'string' && it.serials.trim()) {
        fromItems.push(...it.serials.split(',').map(s => s.trim()))
      } else if (Array.isArray(it.serialNumbers)) {
        fromItems.push(...it.serialNumbers)
      } else if (typeof it.serialNumbers === 'string' && it.serialNumbers.trim()) {
        fromItems.push(...it.serialNumbers.split(',').map(s => s.trim()))
      }
    })

    if (fromItems.length > 0) {
      return fromItems.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const sCode = String(item.serialCode || item.serialNumber || '').replace(/^SN-/i, '').trim()
          const mCode = String(item.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)).trim()
          const hasBoth = mCode && sCode && mCode !== sCode
          return {
            machineCode: mCode,
            serialCode: sCode || mCode,
            display: hasBoth ? `${mCode} (SN: ${sCode})` : (mCode || sCode || 'Unit'),
            tooltip: `Machine: ${mCode || 'N/A'} | Serial: ${sCode || 'N/A'}`
          }
        }
        const str = String(item).replace(/^SN-/i, '').trim()
        const match = (dataStore.serials || []).find(s => 
          String(s.serialCode || s.serialNumber || '').trim().toLowerCase() === str.toLowerCase() ||
          String(s.machineCode || '').trim().toLowerCase() === str.toLowerCase()
        )
        if (match) {
          const sCode = (match.serialCode || match.serialNumber || '').replace(/^SN-/i, '').trim()
          const mCode = match.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)
          const hasBoth = mCode && sCode && mCode !== sCode
          return {
            machineCode: mCode,
            serialCode: sCode || mCode,
            display: hasBoth ? `${mCode} (SN: ${sCode})` : (mCode || sCode || str),
            tooltip: `Machine: ${mCode || 'N/A'} | Serial: ${sCode || 'N/A'}`
          }
        }
        const fallbackMC = str.startsWith('WD-') || str.startsWith('MC-') ? str : `MC-${str}`
        return {
          machineCode: fallbackMC,
          serialCode: str,
          display: `${fallbackMC} (SN: ${str})`,
          tooltip: `Machine: ${fallbackMC} | Serial: ${str}`
        }
      })
    }
  }

  // 3. From bl.serials or bl.serialNumbers
  let rawList = []
  if (Array.isArray(bl.serials)) rawList = bl.serials
  else if (typeof bl.serials === 'string' && bl.serials.trim()) rawList = bl.serials.split(',').map(s => s.trim())
  else if (Array.isArray(bl.serialNumbers)) rawList = bl.serialNumbers
  else if (typeof bl.serialNumbers === 'string' && bl.serialNumbers.trim()) rawList = bl.serialNumbers.split(',').map(s => s.trim())

  if (rawList.length > 0) {
    return rawList.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const sCode = String(item.serialCode || item.serialNumber || '').replace(/^SN-/i, '').trim()
        const mCode = String(item.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)).trim()
        const hasBoth = mCode && sCode && mCode !== sCode
        return {
          machineCode: mCode,
          serialCode: sCode || mCode,
          display: hasBoth ? `${mCode} (SN: ${sCode})` : (mCode || sCode || 'Unit'),
          tooltip: `Machine: ${mCode || 'N/A'} | Serial: ${sCode || 'N/A'}`
        }
      }
      const str = String(item).replace(/^SN-/i, '').trim()
      const match = (dataStore.serials || []).find(s => 
        String(s.serialCode || s.serialNumber || '').trim().toLowerCase() === str.toLowerCase() ||
        String(s.machineCode || '').trim().toLowerCase() === str.toLowerCase()
      )
      if (match) {
        const sCode = (match.serialCode || match.serialNumber || '').replace(/^SN-/i, '').trim()
        const mCode = match.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)
        const hasBoth = mCode && sCode && mCode !== sCode
        return {
          machineCode: mCode,
          serialCode: sCode || mCode,
          display: hasBoth ? `${mCode} (SN: ${sCode})` : (mCode || sCode || str),
          tooltip: `Machine: ${mCode || 'N/A'} | Serial: ${sCode || 'N/A'}`
        }
      }
      const fallbackMC = str.startsWith('WD-') || str.startsWith('MC-') ? str : `MC-${str}`
      return {
        machineCode: fallbackMC,
        serialCode: str,
        display: `${fallbackMC} (SN: ${str})`,
        tooltip: `Machine: ${fallbackMC} | Serial: ${str}`
      }
    })
  }

  // 4. Linked Purchase Order generatedSerials
  const po = (dataStore.purchaseOrders || []).find(p => {
    const pBL = String(p.blNumber || '').trim().toLowerCase()
    const pNo = String(p.poNumber || '').trim().toLowerCase()
    return (pBL && pBL === blKey) || (pNo && pNo === blKey)
  })
  if (po && Array.isArray(po.generatedSerials) && po.generatedSerials.length > 0) {
    return po.generatedSerials.map((s, idx) => {
      const sCode = String(s.serialCode || s.serialNumber || '').replace(/^SN-/i, '').trim()
      const mCode = String(s.machineCode || (sCode ? `MC-${sCode}` : `MC-${idx + 1}`)).trim()
      return {
        machineCode: mCode,
        serialCode: sCode || mCode,
        display: `${mCode} (SN: ${sCode})`,
        tooltip: `Machine: ${mCode} | Serial: ${sCode}`
      }
    })
  }

  // 5. Automatic sequence for consignment units so serial numbers are ALWAYS visible
  const qty = Number(bl.totalUnits || bl.quantity || (bl.items ? bl.items.reduce((s, it) => s + Number(it.quantity || 0), 0) : 0))
  if (qty > 0) {
    const sku = bl.productCode || bl.sku || (bl.items?.[0]?.sku) || (bl.items?.[0]?.productCode) || 'MED'
    const cleanSku = String(sku).replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'MED'
    const generated = []
    const limit = Math.min(qty, 20)
    for (let i = 1; i <= limit; i++) {
      const sn = `${cleanSku}-${1000 + i}`
      const mc = `MC-${1000 + i}`
      generated.push({
        machineCode: mc,
        serialCode: sn,
        display: `${mc} (SN: ${sn})`,
        tooltip: `Unit #${i} of ${qty}`
      })
    }
    return generated
  }

  return []
}

function getBLSerialList(bl) {
  return getBLSerialItems(bl).map(it => it.display)
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

const totalBLExpenditures = computed(() => {
  return filteredBLList.value.reduce((sum, b) => {
    const pCost = Number(b.purchaseCost || b.totalCostValue || getBLCalculatedPurchaseCost(b) || 0)
    const lCost = Number(b.landingCost || 0)
    return sum + pCost + lCost
  }, 0)
})

const totalBLMachinesCount = computed(() => {
  return filteredBLList.value.reduce((sum, b) => {
    const q = Number(b.totalUnits || b.quantity || (b.items ? b.items.reduce((s, it) => s + Number(it.quantity || 0), 0) : 0))
    return sum + (q || getBLSerialItems(b).length || 0)
  }, 0)
})

function openBLModal(bl) {
  selectedBL.value = bl
  showBLDetailModal.value = true
}

function printBLConsignmentSlip(bl) {
  if (!bl) return
  const blDoc = typeof bl === 'string' ? (dataStore.blList.find(b => b.blNumber === bl) || { blNumber: bl }) : bl

  const printWindow = window.open('', '_blank', 'width=920,height=980')
  if (!printWindow) {
    uiStore.showToast('Please allow popups to print BL consignment document', 'warning')
    return
  }

  const serials = getBLSerialItems(blDoc)
  const items = blDoc.items && blDoc.items.length > 0 ? blDoc.items : [{
    name: blDoc.productName || 'Medical Imaging Equipment Consignment',
    productName: blDoc.productName || 'Medical Imaging Equipment Consignment',
    sku: blDoc.productCode || blDoc.sku || 'MED-IMPORT',
    quantity: blDoc.totalUnits || blDoc.quantity || (serials.length > 0 ? serials.length : 1),
    costPrice: blDoc.purchaseCost || getBLCalculatedPurchaseCost(blDoc)
  }]

  const pCost = Number(blDoc.purchaseCost || blDoc.totalCostValue || getBLCalculatedPurchaseCost(blDoc) || 0)
  const lCost = Number(blDoc.landingCost || 0)
  const totalLandedCost = pCost + lCost

  const itemsHtml = items.map((it, idx) => `
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">
        <strong style="color: #0f172a; font-size: 13px;">${it.name || it.productName}</strong>
        ${(it.sku || it.productCode) ? `<div style="font-size: 11px; color: #64748b; font-family: monospace;">Model/SKU: ${it.sku || it.productCode}</div>` : ''}
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">
        ${it.quantity || it.qty || blDoc.totalUnits || 1} units
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">
        PKR ${pCost.toLocaleString()}
      </td>
    </tr>
  `).join('')

  const serialsHtml = serials.length > 0 ? `
    <div style="margin-top: 20px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 8px;">
        Registered Machine Codes & Serial Numbers (${serials.length} Units Indexed):
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${serials.map(s => `
          <span style="font-family: monospace; font-size: 11px; background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 4px; color: #1e293b; font-weight: bold;">
            ${s.machineCode ? `<strong style="color: #0f172a;">${s.machineCode}</strong>` : ''}
            ${s.serialCode && s.machineCode !== s.serialCode ? ` <span style="color: #0d9488;">(SN: ${s.serialCode})</span>` : (s.serialCode || s.display)}
          </span>
        `).join('')}
      </div>
    </div>
  ` : ''

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bill of Lading Consignment - ${blDoc.blNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; text-transform: uppercase; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
          th { background: #f1f5f9; padding: 9px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #475569; }
          .totals-table { width: 340px; margin-left: auto; border-collapse: collapse; margin-top: 10px; }
          .totals-table td { padding: 8px 12px; border: 1px solid #cbd5e1; }
          .footer-sigs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 50px; text-align: center; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 11px; font-weight: 600; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 20px; font-weight: 900; color: #0f172a;">MEDIMAGE ERP SOLUTIONS</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Official Bill of Lading (BL) Consignment & Import Slip</div>
            <div style="font-size: 12px; color: #64748b;">Receiving Depot: <strong>${blDoc.branch || blDoc.destinationCity || 'Peshawar'}</strong></div>
          </div>
          <div style="text-align: right;">
            <div class="title">BL CONSIGNMENT</div>
            <div style="font-family: monospace; font-size: 16px; font-weight: 800; color: #2563eb;">${blDoc.blNumber}</div>
            <div style="font-size: 12px; color: #64748b;">BL Date: <strong>${blDoc.blDate || blDoc.arrivalDate || '2026-11-05'}</strong></div>
            <div style="font-size: 12px; color: #64748b;">Receiving Date: <strong>${blDoc.receivingDate || blDoc.arrivalDate || '2026-11-05'}</strong></div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="card">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">SUPPLIER / EXPORTER</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px;">${blDoc.supplierName || blDoc.supplier || blDoc.companyName || 'Consignment Supplier'}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Warehouse Branch: <strong>${blDoc.branch || 'Peshawar'}</strong></div>
          </div>

          <div class="card">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">SHIPMENT & CARRIER DETAILS</div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px;">${blDoc.shipmentDetails || 'Sea Freight Container Consignment'}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">BL Status: <strong style="color: #16a34a;">${blDoc.blStatus || 'In Stock'}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="text-align: left;">Equipment / Machine Description</th>
              <th style="width: 100px; text-align: center;">Total Units</th>
              <th style="width: 160px; text-align: right;">Purchase Cost (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td style="color: #475569; font-weight: 600;">Purchase Procurement Cost:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">PKR ${pCost.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #475569; font-weight: 600;">Customs & Landing Cost:</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold; color: #d97706;">PKR ${lCost.toLocaleString()}</td>
          </tr>
          <tr style="background: #eff6ff;">
            <td style="color: #1e3a8a; font-weight: 800; font-size: 13px;">TOTAL LANDED EXPENDITURE:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 900; font-size: 14px; color: #2563eb;">PKR ${totalLandedCost.toLocaleString()}</td>
          </tr>
        </table>

        ${serialsHtml}

        <div class="footer-sigs">
          <div class="sig-line">Store / Warehouse Officer</div>
          <div class="sig-line">Customs Clearing Agent</div>
          <div class="sig-line">Finance & Accounts Director</div>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}

function printBLReport(blNumber) {
  if (!blNumber) return
  printBLConsignmentSlip(blNumber)
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

// ── Edit BL Consignment Modal State & Handlers ───────────────
const showEditBLModal = ref(false)
const originalBLIdentifier = ref('')
const editBLForm = ref({
  blNumber: '',
  blDate: '',
  supplier: '',
  shipmentDetails: '',
  purchaseCost: 0,
  landingCost: 0,
  branch: 'Peshawar',
  receivingDate: '',
  blStatus: 'In Stock'
})

function openEditBLModal(bl) {
  if (!bl) return
  originalBLIdentifier.value = bl.blNumber || bl.id
  editBLForm.value = {
    blNumber: bl.blNumber || '',
    blDate: bl.blDate || bl.arrivalDate || new Date().toISOString().substring(0, 10),
    supplier: bl.supplierName || bl.supplier || bl.companyName || '',
    shipmentDetails: bl.shipmentDetails || '',
    purchaseCost: Number(bl.purchaseCost || bl.totalCostValue || getBLCalculatedPurchaseCost(bl) || 0),
    landingCost: Number(bl.landingCost || 0),
    branch: bl.branch || bl.destinationCity || 'Peshawar',
    receivingDate: bl.receivingDate || bl.arrivalDate || '',
    blStatus: bl.blStatus || 'In Stock'
  }
  showEditBLModal.value = true
}

async function handleSaveEditedBL() {
  if (!editBLForm.value.blNumber) {
    uiStore.showModal('Validation Error', 'BL Number cannot be empty.', 'warning')
    return
  }
  const res = await dataStore.updateBL(originalBLIdentifier.value, {
    blNumber: editBLForm.value.blNumber,
    blDate: editBLForm.value.blDate,
    supplier: editBLForm.value.supplier,
    supplierName: editBLForm.value.supplier,
    shipmentDetails: editBLForm.value.shipmentDetails,
    purchaseCost: editBLForm.value.purchaseCost,
    landingCost: editBLForm.value.landingCost,
    branch: editBLForm.value.branch,
    destinationCity: editBLForm.value.branch,
    receivingDate: editBLForm.value.receivingDate,
    blStatus: editBLForm.value.blStatus
  }, authStore.user)

  if (res?.success) {
    uiStore.showModal('BL Updated', `Bill of Lading record ${editBLForm.value.blNumber} has been updated successfully.`, 'success')
    showEditBLModal.value = false
  } else {
    uiStore.showModal('Update Failed', res?.message || 'Could not update BL record.', 'warning')
  }
}

async function confirmDeleteBL(bl) {
  if (!bl) return
  const blKey = bl.blNumber || bl.containerNo || bl.id || bl._id
  const confirmed = await uiStore.showConfirm(
    'Delete Bill of Lading Record?',
    `Are you sure you want to permanently delete BL record "${bl.blNumber || bl.containerNo || bl.id}"? This cannot be undone.`
  )
  if (!confirmed) return

  const res = await dataStore.deleteBL(blKey, authStore.user)
  if (res?.success || res === true) {
    uiStore.showModal('Deleted', res?.message || `BL record "${bl.blNumber || bl.containerNo || blKey}" has been removed.`, 'success')
  } else {
    uiStore.showModal('Delete Failed', res?.message || 'Failed to delete BL record.', 'warning')
  }
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

// ── Tab 2: Purchase Return & Debit Note (Dr. Note) Logic ─────────────────
const returnSearchQuery = ref('')
const showNewReturnModal = ref(false)

const returnForm = ref({
  supplier: '',
  blNumber: '',
  returnDate: new Date().toISOString().substring(0, 10),
  branch: 'Peshawar',
  selectedSerials: [],
  totalReturnAmount: 0,
  reason: 'Defective / Damaged on Arrival',
  refundMethod: 'Debit Note Issued (Supplier Ledger Adjusted)',
  notes: ''
})

const isCustomerOrClinic = (name = '') => {
  if (!name) return true
  const n = name.trim().toLowerCase()
  // Check if registered as customer
  const isCust = (dataStore.customers || []).some(c => (c.name || '').trim().toLowerCase() === n && (c.category !== 'SUPPLIER'))
  if (isCust) return true
  // Check if sold to in sales invoices
  const inSales = (dataStore.salesInvoices || []).some(i => (i.customer || '').trim().toLowerCase() === n)
  if (inSales) return true
  // Filter out any medical complexes, hospitals, clinics
  const clientFacilityKeywords = ['teaching hospital', 'medical complex', 'general hospital', 'clinic']
  if (clientFacilityKeywords.some(kw => n.includes(kw))) return true
  return false
}

const supplierOptions = computed(() => {
  const set = new Set()

  // 1. ALL customers / parties from dataStore.customers
  ;(dataStore.customers || []).forEach(c => {
    const name = c.name || c.partyName || c.companyName
    if (name && typeof name === 'string' && name.trim()) {
      set.add(name.trim())
    }
  })

  // 2. ALL vendor/supplier names from BL purchase consignments
  ;(dataStore.blList || []).forEach(b => {
    const name = b.supplierName || b.supplier || b.companyName
    if (name && typeof name === 'string' && name.trim()) {
      set.add(name.trim())
    }
  })

  // Check raw containers collection directly
  ;(dataStore.containers || []).forEach(c => {
    const name = c.supplierName || c.supplier || c.companyName
    if (name && typeof name === 'string' && name.trim()) {
      set.add(name.trim())
    }
  })

  // 3. Purchase orders suppliers
  ;(dataStore.purchaseOrders || []).forEach(po => {
    const name = po.supplier || po.supplierName
    if (name && typeof name === 'string' && name.trim()) {
      set.add(name.trim())
    }
  })

  // 4. Direct suppliers from dataStore.suppliers
  ;(dataStore.suppliers || []).forEach(s => {
    const name = typeof s === 'string' ? s : (s.name || s.companyName)
    if (name && typeof name === 'string' && name.trim()) {
      set.add(name.trim())
    }
  })

  // Default fallback if database empty
  if (set.size === 0) {
    set.add('Waheed and Sons')
  }

  return Array.from(set).sort()
})

const availableSupplierBLs = computed(() => {
  const supLower = (returnForm.value.supplier || '').toLowerCase().trim()
  const map = new Map()

  // 1. From blList
  ;(dataStore.blList || []).forEach(b => {
    const sName = (b.supplierName || b.supplier || b.companyName || '').toLowerCase().trim()
    if (!supLower || sName.includes(supLower) || supLower.includes(sName)) {
      if (b.blNumber && !map.has(b.blNumber)) {
        map.set(b.blNumber, {
          blNumber: b.blNumber,
          blDate: b.blDate || 'N/A',
          purchaseCost: Number(b.purchaseCost || b.landingCost || 0)
        })
      }
    }
  })

  // 2. From salesInvoices (for customer parties)
  ;(dataStore.salesInvoices || []).forEach(inv => {
    const cName = (inv.customer || '').toLowerCase().trim()
    if (cName === supLower || cName.includes(supLower) || supLower.includes(cName)) {
      const blNum = inv.blNumber || 'BL-MED-2026-02'
      if (blNum && !map.has(blNum)) {
        map.set(blNum, {
          blNumber: blNum,
          blDate: inv.saleDate || 'N/A',
          purchaseCost: Number(inv.grandTotal || 0)
        })
      }
    }
  })

  // 3. From serials
  ;(dataStore.serials || []).forEach(s => {
    const cName = (s.customer || '').toLowerCase().trim()
    const sName = (s.supplier || s.supplierName || '').toLowerCase().trim()
    if (cName === supLower || sName === supLower) {
      const blNum = s.blNumber || s.containerNo
      if (blNum && !map.has(blNum)) {
        map.set(blNum, {
          blNumber: blNum,
          blDate: s.registeredDate || s.soldDate || 'N/A',
          purchaseCost: Number(s.costPrice || s.salePrice || 0)
        })
      }
    }
  })

  // Fallback: if none specifically matched for this party, offer all BLs
  if (map.size === 0) {
    ;(dataStore.blList || []).forEach(b => {
      if (b.blNumber && !map.has(b.blNumber)) {
        map.set(b.blNumber, {
          blNumber: b.blNumber,
          blDate: b.blDate || 'N/A',
          purchaseCost: Number(b.purchaseCost || b.landingCost || 0)
        })
      }
    })
  }

  return Array.from(map.values())
})

const selectableSerialsForReturn = computed(() => {
  const map = new Map()
  const supLower = (returnForm.value.supplier || '').toLowerCase().trim()
  const blKey = (returnForm.value.blNumber || '').toLowerCase().trim()

  // 1. From dataStore.serials
  ;(dataStore.serials || []).forEach(s => {
    if (s.status === 'Returned') return
    const sCust = (s.customer || '').toLowerCase().trim()
    const sSupp = (s.supplier || s.supplierName || '').toLowerCase().trim()
    const sBL = (s.blNumber || s.containerNo || s.purchaseInvoiceNo || '').toLowerCase().trim()

    let match = false
    if (blKey) {
      match = sBL === blKey
    } else if (supLower) {
      match = sCust === supLower || sCust.includes(supLower) || supLower.includes(sCust) ||
              sSupp === supLower || sSupp.includes(supLower) || supLower.includes(sSupp)
    } else {
      match = true
    }

    if (match) {
      const code = s.serialCode || s.machineCode
      if (code && !map.has(code)) {
        let cost = Number(s.costPrice || s.purchasePrice || s.salePrice || 0)
        if (!cost) {
          const prod = (dataStore.products || []).find(p => p.id === s.productId || p.sku === s.sku || p.name === s.productName)
          if (prod) cost = Number(prod.costPrice || prod.purchaseCost || prod.purchasePrice || 0)
        }
        map.set(code, {
          serialCode: s.serialCode,
          machineCode: s.machineCode || code,
          productName: s.productName || s.sku || 'Medical Equipment',
          sku: s.sku || '',
          blNumber: s.blNumber || 'N/A',
          costPrice: cost > 0 ? cost : 450000
        })
      }
    }
  })

  // 2. From dataStore.salesInvoices (for customer machines & codes)
  ;(dataStore.salesInvoices || []).forEach(inv => {
    const cName = (inv.customer || '').toLowerCase().trim()
    const invBL = (inv.blNumber || '').toLowerCase().trim()

    let match = false
    if (blKey) {
      match = invBL === blKey
    } else if (supLower) {
      match = cName === supLower || cName.includes(supLower) || supLower.includes(cName)
    }

    if (match) {
      inv.items?.forEach(it => {
        let serialsList = []
        if (Array.isArray(it.serials)) serialsList = it.serials
        else if (typeof it.serials === 'string' && it.serials.trim()) serialsList = it.serials.split(',').map(s => s.trim()).filter(Boolean)

        let machineCodesList = []
        if (Array.isArray(it.machineCodes)) machineCodesList = it.machineCodes
        else if (typeof it.machineCodes === 'string' && it.machineCodes.trim()) machineCodesList = it.machineCodes.split(',').map(m => m.trim()).filter(Boolean)

        const qty = Number(it.qty || 1)
        const unitVal = Number(it.unitPrice || (it.total ? it.total / qty : 0))

        if (serialsList.length > 0) {
          serialsList.forEach((rawSCode, idx) => {
            const sCode = typeof rawSCode === 'object' && rawSCode !== null ? (rawSCode.serialCode || rawSCode.serialNumber || rawSCode.serial) : String(rawSCode || '')
            const mCode = machineCodesList[idx] || (typeof rawSCode === 'object' ? rawSCode.machineCode : '') || it.machineCode || sCode

            if (sCode && !map.has(sCode)) {
              map.set(sCode, {
                serialCode: sCode,
                machineCode: mCode,
                productName: it.productName || it.sku || 'Medical Equipment',
                sku: it.sku || '',
                blNumber: it.blNumber || inv.blNumber || 'BL-MED-2026-02',
                costPrice: unitVal > 0 ? unitVal : 450000
              })
            }
          })
        }
      })
    }
  })

  // Fallback: If no machines found for this party yet, show available warehouse serials
  if (map.size === 0) {
    ;(dataStore.serials || []).filter(s => s.status !== 'Returned').forEach(s => {
      const code = s.serialCode || s.machineCode
      if (code && !map.has(code)) {
        map.set(code, {
          serialCode: s.serialCode,
          machineCode: s.machineCode || code,
          productName: s.productName || s.sku || 'Medical Equipment',
          sku: s.sku || '',
          blNumber: s.blNumber || 'N/A',
          costPrice: Number(s.costPrice || 450000)
        })
      }
    })
  }

  return Array.from(map.values())
})

const totalReturnAmount = computed(() => {
  return (dataStore.purchaseReturns || []).reduce((sum, r) => sum + (Number(r.totalReturnAmount) || 0), 0)
})

const totalReturnedUnitsCount = computed(() => {
  return (dataStore.purchaseReturns || []).reduce((sum, r) => {
    if (r.items && r.items.length) {
      return sum + r.items.reduce((s2, it) => s2 + (Number(it.qty) || 1), 0)
    }
    if (r.returnedSerials && r.returnedSerials.length) {
      return sum + r.returnedSerials.length
    }
    return sum + 1
  }, 0)
})

const filteredPurchaseReturns = computed(() => {
  let list = dataStore.purchaseReturns || []
  const q = returnSearchQuery.value.trim().toLowerCase()
  if (!q) return list

  const tokens = q.split(/\s+/).filter(Boolean)
  return list.filter(r => {
    const fields = [
      r.returnNo,
      r.debitNoteNo,
      r.blNumber,
      r.supplier,
      r.supplierName,
      r.branch,
      r.returnDate,
      r.reason,
      r.status,
      r.refundStatus,
      r.notes,
      r.totalReturnAmount ? String(r.totalReturnAmount) : ''
    ]

    if (Array.isArray(r.items)) {
      r.items.forEach(it => {
        fields.push(it.name, it.productName, it.sku, String(it.qty || ''), String(it.unitCost || ''))
        if (Array.isArray(it.serials)) fields.push(...it.serials)
      })
    }
    if (Array.isArray(r.returnedSerials)) {
      r.returnedSerials.forEach(s => {
        fields.push(s.serialCode, s.machineCode, s.productName, s.sku)
      })
    }

    const corpus = fields.filter(Boolean).map(v => String(v).toLowerCase()).join(' ')
    return tokens.every(t => corpus.includes(t))
  })
})

function openNewReturnModal() {
  returnForm.value = {
    supplier: supplierOptions.value[0] || '',
    blNumber: '',
    returnDate: new Date().toISOString().substring(0, 10),
    branch: authStore.userBranch || 'Peshawar',
    selectedSerials: [],
    totalReturnAmount: 0,
    reason: 'Defective / Damaged on Arrival',
    refundMethod: 'Debit Note Issued (Supplier Ledger Adjusted)',
    notes: ''
  }
  showNewReturnModal.value = true
}

function onReturnSupplierChange() {
  returnForm.value.blNumber = ''
  returnForm.value.selectedSerials = []
  returnForm.value.totalReturnAmount = 0
}

function onReturnBLChange() {
  returnForm.value.selectedSerials = []
  calculateReturnTotal()
}

function calculateReturnTotal() {
  const sum = returnForm.value.selectedSerials.reduce((acc, s) => acc + (Number(s.costPrice) || 0), 0)
  if (sum > 0) {
    returnForm.value.totalReturnAmount = sum
  }
}

async function handleSavePurchaseReturn() {
  if (!returnForm.value.supplier) {
    uiStore.showModal('Validation Error', 'Please select a supplier for the purchase return.', 'warning')
    return
  }

  const totalSerials = returnForm.value.selectedSerials.length
  const totalAmt = Number(returnForm.value.totalReturnAmount || 0)
  const items = returnForm.value.selectedSerials.map(s => {
    let uCost = Number(s.costPrice || 0)
    if (uCost === 0 && totalAmt > 0 && totalSerials > 0) {
      uCost = Math.round(totalAmt / totalSerials)
    }
    return {
      name: s.productName || s.sku || 'Equipment Unit',
      productName: s.productName || s.sku || 'Equipment Unit',
      sku: s.sku || s.productId || 'EQUIP',
      qty: 1,
      unitCost: uCost,
      totalCost: uCost,
      serials: [s.serialCode || s.machineCode],
      machineCodes: [s.machineCode || s.serialCode]
    }
  })

  const res = await dataStore.processPurchaseReturn({
    supplier: returnForm.value.supplier,
    blNumber: returnForm.value.blNumber,
    returnDate: returnForm.value.returnDate,
    branch: returnForm.value.branch,
    serials: returnForm.value.selectedSerials,
    items,
    totalReturnAmount: returnForm.value.totalReturnAmount,
    reason: returnForm.value.reason,
    refundMethod: returnForm.value.refundMethod,
    notes: returnForm.value.notes
  }, authStore.user)

  if (res && (res.success || res.returnRecord || res.returnNo)) {
    uiStore.showToast(`Purchase Return ${res.returnRecord?.returnNo || res.returnNo || ''} recorded & Debit Note issued!`, 'success')
    showNewReturnModal.value = false
  } else {
    uiStore.showModal('Return Failed', res?.message || 'Could not process purchase return.', 'warning')
  }
}

function confirmDeletePurchaseReturn(ret) {
  if (!ret) return
  uiStore.showConfirm({
    title: 'Delete Purchase Return',
    message: `Are you sure you want to delete Return #${ret.returnNo} (${ret.supplier})? This will revert the Debit Note from the supplier ledger.`,
    type: 'danger',
    confirmText: 'Yes, Delete Return',
    cancelText: 'Cancel',
    onConfirm: async () => {
      const res = await dataStore.deletePurchaseReturn(ret.id || ret.returnNo, authStore.user)
      if (res.success) {
        uiStore.showToast(`Purchase Return #${ret.returnNo} deleted successfully.`, 'info')
      } else {
        uiStore.showModal('Delete Failed', res.message, 'warning')
      }
    }
  })
}

function printDebitNote(ret) {
  if (!ret) return
  const printWindow = window.open('', '_blank', 'width=850,height=950')
  if (!printWindow) {
    uiStore.showToast('Please enable popups to print Debit Note slip', 'warning')
    return
  }

  const totalUnits = (ret.items || []).reduce((acc, it) => acc + (Number(it.qty) || 1), 0) || 1
  const fallbackUnitCost = (Number(ret.totalReturnAmount || 0) > 0) ? Math.round(Number(ret.totalReturnAmount) / totalUnits) : 0

  const itemsHtml = (ret.items && ret.items.length > 0) ? ret.items.map((it, idx) => {
    const uCost = Number(it.unitCost || 0) > 0 ? Number(it.unitCost) : fallbackUnitCost
    const tCost = Number(it.totalCost || 0) > 0 ? Number(it.totalCost) : (uCost * (Number(it.qty) || 1))
    return `
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">
        <strong style="color: #0f172a;">${it.productName || it.name || 'Equipment Unit'}</strong>
        ${it.sku ? `<div style="font-size: 11px; color: #64748b;">Code/SKU: ${it.sku}</div>` : ''}
        ${it.serials?.length ? `<div style="font-size: 11px; color: #4338ca; font-family: monospace; font-weight: 600;">Serials: ${it.serials.join(', ')}</div>` : ''}
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${it.qty || 1}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">PKR ${uCost.toLocaleString()}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">PKR ${tCost.toLocaleString()}</td>
    </tr>
  `}).join('') : (ret.returnedSerials && ret.returnedSerials.length > 0) ? ret.returnedSerials.map((s, idx) => {
    const sCost = Number(s.unitCost || 0) > 0 ? Number(s.unitCost) : fallbackUnitCost
    return `
    <tr>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1;">
        <strong style="color: #0f172a;">${s.productName || s.sku || 'Equipment Machine'}</strong>
        <div style="font-size: 11px; color: #4338ca; font-family: monospace; font-weight: 600;">Machine: ${s.machineCode || 'N/A'} | SN: ${s.serialCode || 'N/A'}</div>
      </td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">1</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">PKR ${sCost.toLocaleString()}</td>
      <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; font-weight: bold;">PKR ${sCost.toLocaleString()}</td>
    </tr>
  `}).join('') : `
    <tr>
      <td colspan="5" style="padding: 14px; border: 1px solid #cbd5e1; text-align: center; color: #475569;">Returned Medical Equipment Consignment: PKR ${(Number(ret.totalReturnAmount || 0)).toLocaleString()}</td>
    </tr>
  `

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Debit Note - ${ret.debitNoteNo || ret.returnNo}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 13px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d97706; padding-bottom: 16px; margin-bottom: 24px; }
          .company-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .dr-title { font-size: 26px; font-weight: 900; color: #d97706; text-align: right; letter-spacing: 0.5px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; font-weight: 800; color: #475569; }
          tfoot td { background: #fffbeb; font-size: 14px; font-weight: bold; }
          .footer-signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin-top: 60px; text-align: center; }
          .sig-box { border-top: 1px solid #94a3b8; padding-top: 6px; font-size: 12px; font-weight: 600; color: #475569; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-title">MEDIMAGE ERP SOLUTIONS</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Official Purchase Debit Note & Return Voucher</div>
            <div style="font-size: 12px; color: #64748b;">Depot / Branch: <strong>${ret.branch || 'Peshawar'}</strong></div>
          </div>
          <div>
            <div class="dr-title">DEBIT NOTE</div>
            <div style="font-family: monospace; font-size: 15px; font-weight: 800; color: #4338ca; text-align: right;">${ret.debitNoteNo || 'DRN-2026-001'}</div>
            <div style="font-size: 12px; color: #64748b; text-align: right;">Return #: <strong>${ret.returnNo}</strong></div>
            <div style="font-size: 12px; color: #64748b; text-align: right;">Date: <strong>${ret.returnDate}</strong></div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="card">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">DEBIT TO SUPPLIER / VENDOR</div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">${ret.supplier || ret.supplierName}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Original BL Reference: <strong>${ret.blNumber || 'DIRECT-PO'}</strong></div>
          </div>

          <div class="card">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">RETURN DETAILS & REASON</div>
            <div style="font-size: 13px; font-weight: 700; color: #b45309; margin-top: 4px;">${ret.reason || 'Defective / Damaged Item'}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Settlement: <strong>${ret.refundStatus || 'Payable Ledger Adjusted'}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="text-align: left;">Item Description & Serials</th>
              <th style="width: 60px; text-align: center;">Qty</th>
              <th style="width: 130px; text-align: right;">Unit Cost</th>
              <th style="width: 140px; text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="padding: 12px; text-align: right; border: 1px solid #cbd5e1; color: #0f172a;">TOTAL DEBIT NOTE AMOUNT:</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #cbd5e1; color: #d97706; font-family: monospace;">PKR ${(Number(ret.totalReturnAmount || 0)).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        ${ret.notes ? `<div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-size: 12px; margin-bottom: 24px;"><strong>Remarks / Technical Audit:</strong> ${ret.notes}</div>` : ''}

        <div style="font-size: 11px; color: #64748b; margin-top: 10px; font-style: italic;">
          * Note: This official debit note reduces our account payable to the vendor by the specified amount above.
        </div>

        <div class="footer-signatures">
          <div class="sig-box">Prepared By (Logistics / Stores)</div>
          <div class="sig-box">Audited By (Finance & Accounts)</div>
          <div class="sig-box">Supplier Representative / Carrier</div>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 250)
}
</script>

<style scoped>
/* ── Compact & Sleek Serial Numbers Scroll Container ── */
.serials-scroll-cell {
  min-width: 150px !important;
  max-width: 240px !important;
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

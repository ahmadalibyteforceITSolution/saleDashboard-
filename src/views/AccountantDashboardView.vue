<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      ACCOUNTANT HEADER & SUPERADMIN GOVERNANCE BANNER
    ════════════════════════════════════════════ -->
    <div class="glass-panel p-5 border-l-4 border-emerald-500 relative overflow-hidden">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <Calculator :size="22" />
            </div>
            <h1 class="text-xl md:text-2xl font-black text-white tracking-tight">
              Accountant Container Logistics & Sales Command Center
            </h1>
            <span class="badge badge-emerald font-mono">ACCOUNTANT ROLE</span>
            <span class="badge badge-purple font-mono">SUPERADMIN SUPERVISED</span>
          </div>
          <p class="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
            Manage inbound shipping containers (e.g. <strong class="text-amber-300">SENDNB2606060</strong> — <strong class="text-emerald-300">Ahmad Son</strong> with <strong class="text-purple-300 font-mono">AN-</strong> prefix), register product quantities with barcode scanning, dispatch serials to multi-city hubs, and submit cross-checked 35M+ sales forms.
          </p>
        </div>

        <div class="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <!-- Add New Container Button (Primary Action) -->
          <button
            @click="showAddContainerModal = true"
            class="btn btn-primary font-bold flex items-center gap-2 shadow-sm text-xs whitespace-nowrap"
          >
            <Container :size="15" />
            <span>New Container Consignment</span>
          </button>

          <!-- Optical Barcode Scanner Button -->
          <button
            @click="showBarcodeModal = true"
            class="btn btn-secondary font-bold flex items-center gap-2 shadow-sm text-xs whitespace-nowrap"
          >
            <ScanBarcode :size="15" class="text-emerald-400" />
            <span>Scan Barcode</span>
          </button>

          <!-- Balance Privacy Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center gap-1.5 shadow-sm text-xs whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide Balances' : 'Verify & View Balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="14" />
            <Eye v-else :size="14" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>
        </div>
      </div>

      <!-- Permission Notice Alert Box -->
      <div class="mt-4 p-3 bg-slate-900/80 border border-slate-700/60 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs">
        <div class="flex items-center gap-2 text-slate-300">
          <ShieldAlert :size="16" class="text-amber-400 flex-shrink-0" />
          <span>
            <strong class="text-amber-400">Strict Deletion Protocol:</strong>
            Accountants have full creation and dispatch rights. Product & container deletions are locked to <strong>SuperAdmin</strong> for cross-check integrity. If you enter an incorrect product, use the <strong>"Report Entry Error"</strong> action.
          </span>
        </div>
        <span class="text-slate-400 font-mono text-[11px]">Audit Engine: Active v4.5</span>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      ACCOUNTANT STATS KPI GRID (IN ROW)
    ════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div class="glass-card kpi-card border-t-2 border-emerald-500">
        <div class="flex-between mb-1">
          <span class="kpi-title">Active Containers</span>
          <span class="badge badge-emerald font-mono">{{ dataStore.visibleContainers.length }} SHIPMENTS</span>
        </div>
        <div class="kpi-value font-mono text-emerald-400">{{ dataStore.visibleContainers.length }}</div>
        <div class="kpi-subtitle">
          <span>Leading: <strong>SENDNB2606060</strong> (Ahmad Son)</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-primary">
        <div class="flex-between mb-1">
          <span class="kpi-title">Container Inventory Value</span>
          <span class="badge badge-info">RETAIL VALUE</span>
        </div>
        <div class="kpi-value font-mono text-white">{{ formatBalance(containerTotalValuation) }}</div>
        <div class="kpi-subtitle">
          <span>Cost: {{ formatBalance(containerTotalCost) }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-purple">
        <div class="flex-between mb-1">
          <span class="kpi-title">35M Sales Milestone</span>
          <span class="badge badge-purple font-mono">{{ dataStore.super35mMetrics.progressPercent }}% GOAL</span>
        </div>
        <div class="kpi-value font-mono text-purple-400">{{ formatBalance(dataStore.super35mMetrics.totalFormAmount) }}</div>
        <div class="kpi-subtitle">
          <span>Target: {{ formatBalance(dataStore.super35mMetrics.targetGoal) }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-warning">
        <div class="flex-between mb-1">
          <span class="kpi-title">Processed Returns</span>
          <span class="badge badge-warning font-mono">{{ dataStore.salesReturns.length }} INVOICES</span>
        </div>
        <div class="kpi-value font-mono text-amber-400">{{ dataStore.salesReturns.length }}</div>
        <div class="kpi-subtitle">
          <span>Restocked equipment units ready</span>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      ACCOUNTANT MODULE NAVIGATION TABS
    ════════════════════════════════════════════ -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap',
          activeTab === tab.id
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
            : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <component :is="tab.icon" :size="16" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge" class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30">
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: CONTAINER HUB (SENDNB2606060 / AHMAD SON)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'containers'" class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Container :size="20" class="text-emerald-400" />
            <span>Shipping Containers & Import Consignments</span>
          </h2>
          <p class="text-xs text-slate-400">
            Each container assigns company-specific abbreviations (e.g. Ahmad Son → <strong class="text-purple-300">AN-</strong> prefix) to warmers, lights, beds, and stools with respective prices and quantities.
          </p>
        </div>

        <button
          @click="showAddContainerModal = true"
          class="btn btn-emerald text-xs font-bold flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto"
          style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
        >
          <Plus :size="16" />
          <span>Add New Container Consignment</span>
        </button>
      </div>

      <!-- Container Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div
          v-for="cnt in dataStore.visibleContainers"
          :key="cnt.id"
          class="glass-panel p-4 sm:p-5 border border-slate-700/60 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
        >
          <div>
            <!-- Container Header (Mobile Responsive) -->
            <div class="container-card-header mb-3 border-b border-slate-800 pb-3">
              <div class="container-identity">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-mono text-base font-black text-emerald-400">{{ cnt.containerNo }}</span>
                  <span class="badge badge-purple font-mono font-bold text-xs">{{ cnt.codePrefix }} PREFIX</span>
                  <span :class="['badge text-xs', cnt.status === 'Arrived' ? 'badge-success' : 'badge-warning']">
                    {{ cnt.status }}
                  </span>
                </div>
                <div class="text-xs sm:text-sm font-bold text-white mt-1 flex items-center gap-1.5">
                  <Building2 :size="14" class="text-primary shrink-0" />
                  <span class="truncate">{{ cnt.companyName }}</span>
                </div>
              </div>

              <div class="container-meta-box">
                <div class="meta-item">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Arrival Date</span>
                  <span class="text-xs text-slate-200 font-bold font-mono">{{ cnt.arrivalDate }}</span>
                </div>
                <div class="meta-item text-right sm:text-right">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider block sm:hidden">Destination</span>
                  <span class="text-xs sm:text-[11px] text-primary font-bold font-mono">Dest: {{ cnt.destinationCity }}</span>
                </div>
              </div>
            </div>

            <!-- Products List Inside This Container -->
            <div class="mb-4">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                <span>Products in Consignment</span>
                <span class="text-slate-300 font-mono text-[11px]">{{ cnt.items?.length || 0 }} Categories</span>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(item, idx) in cnt.items"
                  :key="idx"
                  class="consignment-item-row p-2.5 sm:p-3 rounded-lg bg-slate-900/70 border border-slate-800"
                >
                  <div class="item-info-col">
                    <div class="font-bold text-white text-xs flex items-baseline gap-1.5 flex-wrap">
                      <span class="break-words">{{ item.name }}</span>
                      <span class="font-mono text-purple-400 font-bold text-[11px] shrink-0">({{ item.sku }})</span>
                    </div>
                    <div class="text-slate-400 text-[11px] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span class="whitespace-nowrap">Qty: <strong class="text-emerald-400 font-mono font-bold">{{ item.quantity }} units</strong></span>
                      <span class="whitespace-nowrap">Cost: <strong class="text-slate-300 font-mono">PKR {{ (item.costPrice || 0).toLocaleString() }}</strong></span>
                      <span class="whitespace-nowrap">Sell: <strong class="text-emerald-300 font-mono">PKR {{ (item.sellingPrice || 0).toLocaleString() }}</strong></span>
                    </div>
                  </div>

                  <div class="item-action-col">
                    <button
                      @click="inspectContainerSerials(cnt, item)"
                      class="btn btn-sm btn-ghost text-xs text-primary font-bold hover:bg-slate-800 px-2.5 py-1 w-full sm:w-auto flex items-center justify-center"
                      title="View Generated Serial Numbers"
                    >
                      <QrCode :size="12" class="mr-1.5 shrink-0" />
                      <span class="whitespace-nowrap">{{ item.serials?.length || item.quantity }} Serials</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Container Footer Summary & Actions (Properly Aligned) -->
          <div class="container-footer-row border-t border-slate-800 pt-3">
            <div class="total-val-box">
              <span class="total-val-label">Total Value:</span>
              <span class="total-val-amount font-mono">
                {{ formatBalance(cnt.totalRetailValue || 0) }}
              </span>
            </div>

            <!-- Notice: Delete is SuperAdmin only -->
            <div class="footer-btns-box">
              <button
                v-if="authStore.isSuperAdmin"
                @click="confirmDeleteContainer(cnt)"
                class="btn btn-sm btn-danger footer-action-btn"
                title="SuperAdmin Authorization: Delete Entire Container Consignment"
              >
                <Trash2 :size="13" />
                <span class="whitespace-nowrap">Delete Container</span>
              </button>
              <span v-else class="badge badge-neutral text-[10px] text-slate-400 flex items-center gap-1">
                <Lock :size="10" />
                <span>SuperAdmin Delete Only</span>
              </span>
              <button
                @click="openAddProductToContainer(cnt)"
                class="btn btn-sm btn-primary footer-action-btn"
              >
                <Plus :size="13" />
                <span class="whitespace-nowrap">Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 2: PRODUCT ENTRY & INVENTORY (BARCODE READY)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'products'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Package :size="20" class="text-emerald-400" />
            <span>Product Master Catalog & Barcode Registry</span>
          </h2>
          <p class="text-xs text-slate-400">
            Add new equipment with barcode scanning. <strong class="text-amber-400">Note:</strong> Accountants cannot delete products; deletions must be performed by SuperAdmin.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            @click="showBarcodeModal = true"
            class="btn btn-emerald text-xs font-bold flex items-center justify-center gap-1.5 shadow-md flex-1 sm:flex-initial"
            style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
          >
            <ScanBarcode :size="16" />
            <span>Optical Barcode Scan</span>
          </button>

          <button
            @click="showAddProductModal = true"
            class="btn btn-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-md flex-1 sm:flex-initial"
          >
            <Plus :size="16" />
            <span>Add Equipment Product</span>
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div class="glass-panel p-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Product Name / SKU</th>
                <th>Container & Company</th>
                <th>Category</th>
                <th>Unit Cost / Retail</th>
                <th>Stock Units</th>
                <th>Barcode</th>
                <th>Destination Hub</th>
                <th>Accountant Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in dataStore.visibleProducts" :key="prod.id || prod.sku">
                <td>
                  <div class="flex items-center gap-2.5">
                    <img :src="prod.image" alt="Product" class="w-10 h-10 object-cover rounded-md border border-slate-700 flex-shrink-0" />
                    <div>
                      <div class="font-bold text-white text-xs">{{ prod.name }}</div>
                      <div class="font-mono text-purple-400 text-[11px] font-semibold">{{ prod.sku }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div v-if="prod.containerNo">
                    <span class="badge badge-purple font-mono font-bold text-[11px]">{{ prod.containerNo }}</span>
                    <div class="text-[11px] text-slate-300 font-semibold mt-0.5">{{ prod.companyName || 'Ahmad Son company' }}</div>
                  </div>
                  <span v-else class="text-slate-500 text-xs italic">Direct Stock</span>
                </td>
                <td>
                  <span class="badge badge-neutral text-xs">{{ prod.category }}</span>
                </td>
                <td class="font-mono text-xs">
                  <div class="text-slate-400">Cost: PKR {{ (prod.costPrice || 0).toLocaleString() }}</div>
                  <div class="text-emerald-400 font-bold">Sell: PKR {{ (prod.sellingPrice || prod.salePrice || 0).toLocaleString() }}</div>
                </td>
                <td class="font-mono font-bold text-xs text-white">
                  {{ prod.stockQty }} units
                </td>
                <td>
                  <span v-if="prod.barcode" class="badge badge-emerald font-mono text-[11px] flex items-center gap-1">
                    <Barcode :size="12" />
                    {{ prod.barcode }}
                  </span>
                  <span v-else class="text-slate-500 text-xs italic font-mono">{{ prod.sku }}</span>
                </td>
                <td class="text-xs font-semibold text-slate-300">
                  {{ prod.allocationCity || 'Peshawar' }}
                </td>
                <td>
                  <!-- NO delete option for accountant; only Report Error or View Serials -->
                  <div class="flex items-center gap-1.5">
                    <button
                      v-if="!prod.errorFlagged"
                      @click="flagProductForSuperAdmin(prod)"
                      class="btn btn-sm btn-ghost text-amber-400 hover:bg-amber-950/40 text-xs font-semibold px-2 py-1"
                      title="Flag entry error to SuperAdmin for deletion"
                    >
                      <AlertTriangle :size="12" class="mr-1" />
                      <span>Report Error</span>
                    </button>
                    <span v-else class="badge badge-warning font-mono text-[10px]">
                      FLAGGED FOR SUPERADMIN
                    </span>

                    <span class="badge badge-neutral text-[10px] text-slate-400 flex items-center gap-1" title="Delete is restricted to SuperAdmin">
                      <Lock :size="10" />
                      <span>No Delete</span>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 3: SALES DISPATCH & MULTI-CITY INVOICING
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'sales'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart :size="20" class="text-emerald-400" />
            <span>Sales Dispatch & Container Serial Invoices</span>
          </h2>
          <p class="text-xs text-slate-400">
            Create sales invoices with container-coded serial numbers (<strong class="text-purple-300">AN-...</strong>) dispatched to different cities (Lahore, Multan, Peshawar, Karachi, Islamabad).
          </p>
        </div>

        <button
          @click="showSalesModal = true"
          class="btn btn-emerald text-xs font-bold flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
          style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
        >
          <Plus :size="16" />
          <span>New Multi-City Sales Invoice</span>
        </button>
      </div>

      <!-- Sales Invoices Table -->
      <div class="glass-panel p-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Sale Date</th>
                <th>Customer / Hospital</th>
                <th>Destination City</th>
                <th>Container & Serials Dispatched</th>
                <th>Total Invoiced</th>
                <th>Payment Mode</th>
                <th>Seller / Accountant</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in dataStore.visibleSalesInvoices" :key="inv.invoiceNo">
                <td class="font-mono font-bold text-xs text-primary">{{ inv.invoiceNo }}</td>
                <td class="font-mono text-xs text-slate-300">{{ inv.saleDate }}</td>
                <td>
                  <div class="font-bold text-white text-xs">{{ inv.customer }}</div>
                  <div class="text-[11px] text-slate-400">{{ inv.division || 'Medimage Services' }}</div>
                </td>
                <td>
                  <span class="badge badge-info text-xs font-bold">{{ inv.branch || 'Peshawar' }}</span>
                </td>
                <td>
                  <div class="space-y-1">
                    <div v-for="(it, i) in inv.items" :key="i" class="text-xs">
                      <span class="font-bold text-slate-200">{{ it.productName }} (x{{ it.qty }})</span>
                      <div v-if="it.serials && it.serials.length > 0" class="flex flex-wrap gap-1 mt-0.5">
                        <span
                          v-for="s in it.serials"
                          :key="s"
                          class="px-1.5 py-0.5 rounded bg-slate-900 border border-purple-500/40 font-mono text-[10px] text-purple-300 font-bold"
                        >
                          {{ s }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="font-mono font-bold text-xs text-emerald-400">
                  {{ formatBalance(inv.grandTotal) }}
                </td>
                <td>
                  <span class="badge badge-success text-[11px]">{{ inv.paymentMethod }}</span>
                </td>
                <td class="text-xs text-slate-300">{{ inv.sellerName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 4: SALES RETURNS & INVOICE RESTOCK
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'returns'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <RotateCcw :size="20" class="text-amber-400" />
            <span>Product Return Management & Credit Invoices</span>
          </h2>
          <p class="text-xs text-slate-400">
            Process returned medical devices with invoice linkage, restock inventory units, and issue proper return vouchers.
          </p>
        </div>

        <button
          @click="showReturnModal = true"
          class="btn btn-warning text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
          style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white;"
        >
          <RotateCcw :size="16" />
          <span>Process Return Against Invoice</span>
        </button>
      </div>

      <!-- Return Records Table -->
      <div class="glass-panel p-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Return #</th>
                <th>Original Invoice</th>
                <th>Return Date</th>
                <th>Customer</th>
                <th>Returned Machine Serials</th>
                <th>Refund Amount</th>
                <th>Restock Status</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="dataStore.salesReturns.length === 0">
                <td colspan="8" class="text-center py-6 text-slate-400 italic text-xs">
                  No product returns recorded. Click "Process Return Against Invoice" to record a customer return.
                </td>
              </tr>
              <tr v-for="ret in dataStore.salesReturns" :key="ret.returnNo">
                <td class="font-mono font-bold text-xs text-amber-400">{{ ret.returnNo }}</td>
                <td class="font-mono text-xs text-primary font-bold">{{ ret.invoiceNo }}</td>
                <td class="font-mono text-xs text-slate-300">{{ ret.returnDate }}</td>
                <td class="font-bold text-white text-xs">{{ ret.customer }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="s in (ret.returnedSerials || [])"
                      :key="s.serialCode || s"
                      class="px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500/40 font-mono text-[10px] text-amber-300 font-bold"
                    >
                      {{ s.serialCode || s }}
                    </span>
                  </div>
                </td>
                <td class="font-mono font-bold text-xs text-emerald-400">
                  {{ formatBalance(ret.totalRefundAmount) }}
                </td>
                <td>
                  <span class="badge badge-success font-mono text-[10px]">RESTOCKED TO AVAILABLE</span>
                </td>
                <td class="text-xs text-slate-300">{{ ret.processedBy }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 5: DAILY FINANCIAL FORM & 35M CROSS-CHECK ENTRY
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'reconciliation'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet :size="20" class="text-emerald-400" />
            <span>Daily Accountant Form Entries & 35 Million Reconciliation</span>
          </h2>
          <p class="text-xs text-slate-400">
            Submit daily sales form amounts against product outflows so SuperAdmin can seamlessly cross-check multi-million sales records.
          </p>
        </div>

        <button
          @click="showReconcileEntryModal = true"
          class="btn btn-emerald text-xs font-bold flex items-center justify-center gap-1.5 shadow-md w-full sm:w-auto"
          style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
        >
          <Plus :size="16" />
          <span>Submit Daily Sales Amount Form</span>
        </button>
      </div>

      <!-- 35M Summary Progress Banner -->
      <div class="glass-card p-4 border border-purple-500/30">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
          <div>
            <span class="text-xs font-bold text-purple-300">SUPER 35 MILLION SALES TARGET VERIFICATION:</span>
            <div class="text-lg font-mono font-black text-white">
              {{ formatBalance(dataStore.super35mMetrics.totalFormAmount) }}
              <span class="text-slate-400 text-xs font-normal">/ {{ formatBalance(dataStore.super35mMetrics.targetGoal) }} Goal</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-success font-mono">{{ dataStore.super35mMetrics.verifiedCount }} ENTRIES VERIFIED</span>
            <span v-if="dataStore.super35mMetrics.pendingCount > 0" class="badge badge-warning font-mono">
              {{ dataStore.super35mMetrics.pendingCount }} PENDING SUPERADMIN AUDIT
            </span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            class="bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            :style="{ width: `${dataStore.super35mMetrics.progressPercent}%` }"
          ></div>
        </div>
      </div>

      <!-- Reconciliation Records Table -->
      <div class="glass-panel p-4">
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Entry #</th>
                <th>Date</th>
                <th>Accountant</th>
                <th>Container No</th>
                <th>Form Amount Entered</th>
                <th>Product Value Sold Out</th>
                <th>Variance</th>
                <th>City Destination</th>
                <th>SuperAdmin Audit Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in dataStore.visibleReconciliationRecords" :key="rec.id || rec.entryNo">
                <td class="font-mono font-bold text-xs text-primary">{{ rec.entryNo }}</td>
                <td class="font-mono text-xs text-slate-300">{{ rec.date }}</td>
                <td class="text-xs font-bold text-white">{{ rec.accountantName }}</td>
                <td>
                  <span class="badge badge-purple font-mono font-bold text-[11px]">{{ rec.containerNo }}</span>
                  <div class="text-[10px] text-slate-400 mt-0.5">{{ rec.companyName }}</div>
                </td>
                <td class="font-mono font-bold text-xs text-emerald-400">
                  {{ formatBalance(rec.formAmount) }}
                </td>
                <td class="font-mono font-bold text-xs text-slate-200">
                  {{ formatBalance(rec.productSoldValue) }}
                </td>
                <td>
                  <span
                    :class="[
                      'badge font-mono text-[11px] font-bold',
                      rec.variance === 0 ? 'badge-success' : 'badge-danger'
                    ]"
                  >
                    {{ rec.variance === 0 ? 'ZERO VARIANCE' : `DIFF: ${formatBalance(rec.variance)}` }}
                  </span>
                </td>
                <td class="text-xs text-slate-300 font-semibold">{{ rec.destinationCity }}</td>
                <td>
                  <span
                    :class="[
                      'badge font-mono text-[11px]',
                      rec.status === 'Verified' ? 'badge-success' : rec.status === 'Voided' ? 'badge-danger' : 'badge-warning'
                    ]"
                  >
                    {{ rec.status }}
                  </span>
                  <div v-if="rec.verifiedBy" class="text-[10px] text-slate-400 mt-0.5 font-mono">
                    By: {{ rec.verifiedBy.split(' ')[0] }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 1: ADD NEW CONTAINER CONSIGNMENT
    ════════════════════════════════════════════ -->
    <div v-if="showAddContainerModal" class="modal-backdrop" @click.self="showAddContainerModal = false">
      <div class="modal-content max-w-2xl animate-scale-up">
        <div class="modal-header">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Container :size="20" class="text-emerald-400" />
            <span>Register Inbound Container Consignment</span>
          </h3>
          <button @click="showAddContainerModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSaveNewContainer" class="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="form-group">
              <label class="form-label text-xs">Container ID *</label>
              <input
                v-model="newContainerForm.containerNo"
                type="text"
                required
                placeholder="e.g. SENDNB2606060"
                class="form-input text-xs font-mono font-bold uppercase"
              />
            </div>

            <div class="form-group">
              <label class="form-label text-xs">Company Name *</label>
              <input
                v-model="newContainerForm.companyName"
                type="text"
                required
                placeholder="e.g. Ahmad Son company"
                class="form-input text-xs font-bold"
              />
            </div>

            <div class="form-group">
              <label class="form-label text-xs">Code Prefix *</label>
              <input
                v-model="newContainerForm.codePrefix"
                type="text"
                required
                placeholder="e.g. AN-"
                class="form-input text-xs font-mono font-bold uppercase"
              />
              <p class="text-[10px] text-slate-400 mt-1">Used for serials like AN-WRM-0001</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-xs">Arrival Date *</label>
              <input v-model="newContainerForm.arrivalDate" type="date" required class="form-input text-xs font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label text-xs">Destination City Hub *</label>
              <select v-model="newContainerForm.destinationCity" class="form-select text-xs font-bold" required>
                <option value="Peshawar">Peshawar Central Depot</option>
                <option value="Lahore">Lahore Hub</option>
                <option value="Multan">Multan Branch</option>
                <option value="Karachi">Karachi Port Depot</option>
                <option value="Islamabad">Islamabad Medical Depot</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Products Inside Container -->
          <div class="border-t border-slate-800 pt-3">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <Package :size="14" class="text-emerald-400" />
                <span>Products in this Container (Warmers, Lights, Beds, Stools):</span>
              </span>
              <button
                type="button"
                @click="addContainerProductRow"
                class="btn btn-sm btn-ghost text-xs text-primary font-bold hover:bg-slate-800"
              >
                + Add Product Row
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(item, idx) in newContainerForm.items"
                :key="idx"
                class="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2"
              >
                <div class="flex justify-between items-center">
                  <span class="text-[11px] font-bold text-emerald-400 font-mono">Product #{{ idx + 1 }}</span>
                  <button
                    v-if="newContainerForm.items.length > 1"
                    type="button"
                    @click="removeContainerProductRow(idx)"
                    class="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    v-model="item.name"
                    placeholder="Product Name (e.g. Infant Radiant Warmer)"
                    required
                    class="form-input text-xs font-bold"
                  />
                  <input
                    v-model="item.sku"
                    placeholder="Product SKU (e.g. AN-WRM-01)"
                    required
                    class="form-input text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="text-[10px] text-slate-400">Quantity</label>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      class="form-input text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label class="text-[10px] text-slate-400">Unit Cost (PKR)</label>
                    <input
                      v-model.number="item.costPrice"
                      type="number"
                      min="0"
                      required
                      placeholder="Cost"
                      class="form-input text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label class="text-[10px] text-slate-400">Retail Price (PKR)</label>
                    <input
                      v-model.number="item.sellingPrice"
                      type="number"
                      min="0"
                      required
                      placeholder="Selling"
                      class="form-input text-xs font-mono text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showAddContainerModal = false" class="btn btn-secondary text-xs">Cancel</button>
            <button
              type="submit"
              class="btn btn-emerald text-xs font-bold flex items-center gap-1.5"
              style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
            >
              <Check :size="16" />
              <span>Register Container & Generate Serials</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 2: INSPECT CONTAINER SERIALS
    ════════════════════════════════════════════ -->
    <div v-if="selectedContainerModal" class="modal-backdrop" @click.self="selectedContainerModal = null">
      <div class="modal-content max-w-lg animate-scale-up">
        <div class="modal-header">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <QrCode :size="18" class="text-emerald-400" />
              <span>Container Serial Registry: {{ selectedContainerModal.item.name }}</span>
            </h3>
            <p class="text-xs text-slate-400 font-mono">
              Container: {{ selectedContainerModal.container.containerNo }} • Prefix: {{ selectedContainerModal.container.codePrefix }}
            </p>
          </div>
          <button @click="selectedContainerModal = null" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div class="text-xs text-slate-300 flex justify-between">
            <span>Generated Serials for Dispatched Hub:</span>
            <span class="font-mono text-emerald-400 font-bold">{{ selectedContainerModal.item.serials?.length || 0 }} Units</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="sCode in selectedContainerModal.item.serials"
              :key="sCode"
              class="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <span class="text-purple-300 font-bold">{{ sCode }}</span>
              <span class="badge badge-success text-[10px]">AVAILABLE</span>
            </div>
          </div>
        </div>

        <div class="modal-footer border-t border-slate-800">
          <button @click="selectedContainerModal = null" class="btn btn-secondary text-xs">Close</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 3: SUBMIT DAILY SALES RECONCILIATION FORM
    ════════════════════════════════════════════ -->
    <div v-if="showReconcileEntryModal" class="modal-backdrop" @click.self="showReconcileEntryModal = false">
      <div class="modal-content max-w-lg animate-scale-up">
        <div class="modal-header">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet :size="18" class="text-emerald-400" />
            <span>Submit Daily Sales Form (Super 35M+ Cross-Check)</span>
          </h3>
          <button @click="showReconcileEntryModal = false" class="btn-icon text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleSaveReconcileEntry" class="p-4 space-y-3">
          <div class="form-group">
            <label class="form-label text-xs">Associated Container Shipment *</label>
            <select v-model="reconcileForm.containerNo" class="form-select text-xs font-bold" required>
              <option v-for="c in dataStore.visibleContainers" :key="c.containerNo" :value="c.containerNo">
                {{ c.containerNo }} — {{ c.companyName }} ({{ c.codePrefix }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-xs">Transaction Date *</label>
              <input v-model="reconcileForm.date" type="date" required class="form-input text-xs font-mono" />
            </div>

            <div class="form-group">
              <label class="form-label text-xs">Destination City Hub *</label>
              <select v-model="reconcileForm.destinationCity" class="form-select text-xs font-bold" required>
                <option value="Lahore Hub">Lahore Hub</option>
                <option value="Multan Complex">Multan Complex</option>
                <option value="Peshawar Central HO">Peshawar Central HO</option>
                <option value="Islamabad Medical City">Islamabad Medical City</option>
                <option value="Karachi Depot">Karachi Depot</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="form-group">
              <label class="form-label text-xs">Amount In Form (PKR) *</label>
              <input
                v-model.number="reconcileForm.formAmount"
                type="number"
                min="1"
                required
                class="form-input text-xs font-mono font-bold text-emerald-400"
                placeholder="e.g. 5000000"
              />
              <p class="text-[10px] text-slate-400 mt-1">Amount entered in accountant register</p>
            </div>

            <div class="form-group">
              <label class="form-label text-xs">Product Sold Value (PKR) *</label>
              <input
                v-model.number="reconcileForm.productSoldValue"
                type="number"
                min="1"
                required
                class="form-input text-xs font-mono font-bold text-slate-200"
                placeholder="e.g. 5000000"
              />
              <p class="text-[10px] text-slate-400 mt-1">Value of devices dispatched from stock</p>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label text-xs">Dispatch Description / Invoiced Units *</label>
            <textarea
              v-model="reconcileForm.description"
              required
              rows="2"
              placeholder="e.g. Dispatched 15x Ahmad Son Warmers & 20x OT Lights to Multan health institutions"
              class="form-input text-xs"
            ></textarea>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showReconcileEntryModal = false" class="btn btn-secondary text-xs">Cancel</button>
            <button
              type="submit"
              class="btn btn-emerald text-xs font-bold flex items-center gap-1.5"
              style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;"
            >
              <Check :size="16" />
              <span>Submit Record for SuperAdmin Audit</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      BARCODE SCANNER MODAL COMPONENT
    ════════════════════════════════════════════ -->
    <BarcodeScannerModal
      :show="showBarcodeModal"
      @close="showBarcodeModal = false"
      @scan="handleBarcodeScanned"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import BarcodeScannerModal from '@/components/BarcodeScannerModal.vue'

import {
  Calculator,
  Container,
  Package,
  ShoppingCart,
  RotateCcw,
  FileSpreadsheet,
  ScanBarcode,
  Eye,
  EyeOff,
  ShieldAlert,
  Building2,
  QrCode,
  Lock,
  Plus,
  Check,
  Barcode,
  AlertTriangle,
  Trash2
} from 'lucide-vue-next'

const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('containers')

const tabs = computed(() => [
  { id: 'containers', label: '1. Container Hub', icon: Container, badge: `${dataStore.visibleContainers?.length || 0}` },
  { id: 'products', label: '2. Product Entry & Barcodes', icon: Package, badge: `${dataStore.visibleProducts?.length || 0}` },
  { id: 'sales', label: '3. Multi-City Sales Invoices', icon: ShoppingCart, badge: `${dataStore.visibleSalesInvoices?.length || 0}` },
  { id: 'returns', label: '4. Return Invoices', icon: RotateCcw, badge: `${dataStore.salesReturns?.length || 0}` },
  { id: 'reconciliation', label: '5. 35M Daily Form Cross-Check', icon: FileSpreadsheet, badge: `${dataStore.visibleReconciliationRecords?.length || 0}` }
])

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

const containerTotalCost = computed(() => {
  return (dataStore.visibleContainers || []).reduce((sum, c) => sum + (Number(c.totalCostValue) || 0), 0)
})

const containerTotalValuation = computed(() => {
  return (dataStore.visibleContainers || []).reduce((sum, c) => sum + (Number(c.totalRetailValue) || 0), 0)
})

// Modals State
const showBarcodeModal = ref(false)
const showAddContainerModal = ref(false)
const showAddProductModal = ref(false)
const showSalesModal = ref(false)
const showReturnModal = ref(false)
const showReconcileEntryModal = ref(false)
const selectedContainerModal = ref(null)

// Add Container Form
const newContainerForm = ref({
  containerNo: '',
  companyName: 'Ahmad Son company',
  codePrefix: 'AN-',
  arrivalDate: new Date().toISOString().substring(0, 10),
  destinationCity: 'Peshawar',
  items: [
    { name: 'Infant Radiant Warmer', sku: 'AN-WRM-02', quantity: 30, costPrice: 120000, sellingPrice: 185000 },
    { name: 'Surgical Shadowless OT Light', sku: 'AN-LGT-02', quantity: 40, costPrice: 85000, sellingPrice: 140000 },
    { name: 'Electric ICU Patient Bed', sku: 'AN-BED-02', quantity: 20, costPrice: 220000, sellingPrice: 320000 },
    { name: 'Hydraulic Doctor Stools', sku: 'AN-STL-02', quantity: 50, costPrice: 25000, sellingPrice: 42000 }
  ]
})

function addContainerProductRow() {
  newContainerForm.value.items.push({
    name: '',
    sku: `${newContainerForm.value.codePrefix}ITEM-${newContainerForm.value.items.length + 1}`,
    quantity: 10,
    costPrice: 50000,
    sellingPrice: 80000
  })
}

function removeContainerProductRow(idx) {
  if (newContainerForm.value.items.length > 1) {
    newContainerForm.value.items.splice(idx, 1)
  }
}

async function handleSaveNewContainer() {
  try {
    const created = await dataStore.addContainer(newContainerForm.value, authStore.user)
    uiStore.showModal(
      'Container Consignment Registered',
      `Registered container ${created.containerNo} for ${created.companyName}. Serial numbers generated with prefix ${created.codePrefix}.`,
      'success'
    )
    showAddContainerModal.value = false
  } catch (err) {
    uiStore.showModal('Error', err.message || 'Could not register container', 'danger')
  }
}

function inspectContainerSerials(cnt, item) {
  selectedContainerModal.value = {
    container: cnt,
    item: item
  }
}

function openAddProductToContainer(cnt) {
  newContainerForm.value.containerNo = cnt.containerNo
  newContainerForm.value.companyName = cnt.companyName
  newContainerForm.value.codePrefix = cnt.codePrefix
  showAddContainerModal.value = true
}

// SuperAdmin Delete Container Action
function confirmDeleteContainer(cnt) {
  uiStore.showConfirm({
    title: 'Delete Container Consignment',
    message: `Are you sure you want to permanently delete container "${cnt.containerNo}" (${cnt.companyName})? All associated records will be purged.`,
    type: 'danger',
    confirmText: 'Yes, Delete Container',
    onConfirm: async () => {
      try {
        await dataStore.deleteContainer(cnt.id || cnt._id, authStore.user)
        uiStore.showModal('Container Deleted', `Container ${cnt.containerNo} has been deleted by SuperAdmin.`, 'success')
      } catch (e) {
        uiStore.showModal('Deletion Error', e.message || 'Failed to delete container', 'danger')
      }
    }
  })
}

// Flag Product Error (Accountant cannot delete, sends request to SuperAdmin)
function flagProductForSuperAdmin(prod) {
  uiStore.showPrompt({
    title: 'Report Product Error to SuperAdmin',
    message: `Enter reason for reporting data entry error on ${prod.name} (${prod.sku}) to SuperAdmin:`,
    placeholder: 'Explain mistake (e.g. wrong quantity/cost entered)...',
    type: 'warning',
    confirmText: 'Submit Report',
    onConfirm: async (reason) => {
      if (!reason || !reason.trim()) return
      try {
        await dataStore.flagProductError(prod.id || prod._id, reason.trim(), authStore.user)
        uiStore.showModal(
          'Entry Error Flagged for SuperAdmin',
          `Notification dispatched to SuperAdmin. Product ${prod.name} is marked for review/deletion by SuperAdmin.`,
          'warning'
        )
      } catch (e) {
        uiStore.showModal('Error', e.message || 'Failed to submit report', 'danger')
      }
    }
  })
}

// 35M Daily Reconcile Form
const reconcileForm = ref({
  containerNo: 'SENDNB2606060',
  companyName: 'Ahmad Son company',
  date: new Date().toISOString().substring(0, 10),
  destinationCity: 'Lahore Hub',
  formAmount: 4500000,
  productSoldValue: 4500000,
  description: 'Container SENDNB2606060 batch delivery to regional health complexes'
})

async function handleSaveReconcileEntry() {
  try {
    const matchCnt = dataStore.containers.find(c => c.containerNo === reconcileForm.value.containerNo)
    if (matchCnt) {
      reconcileForm.value.companyName = matchCnt.companyName
    }
    await dataStore.addReconciliationEntry(reconcileForm.value, authStore.user)
    uiStore.showModal(
      'Form Record Submitted',
      `Submitted PKR ${(reconcileForm.value.formAmount || 0).toLocaleString()} record for SuperAdmin 35M cross-check audit.`,
      'success'
    )
    showReconcileEntryModal.value = false
  } catch (e) {
    uiStore.showModal('Error', e.message, 'danger')
  }
}

// Barcode Scan Handler
function handleBarcodeScanned(payload) {
  uiStore.showModal(
    'Barcode Scanned Successfully',
    `Decoded Code: ${payload.code}. Product: ${payload.matchedProduct ? payload.matchedProduct.name : 'Unknown code'}.`,
    'success'
  )
}
</script>

<style scoped>
.page-wrapper {
  padding-bottom: 3rem;
}

/* ── Container Card Responsive Styles ── */
.container-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

@media (max-width: 640px) {
  .container-card-header {
    flex-direction: column;
    align-items: stretch;
  }
}

.container-identity {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  flex: 1;
}

.container-meta-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .container-meta-box {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    background: rgba(15, 23, 42, 0.55);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    margin-top: 0.5rem;
  }
}

[data-theme="light"] .container-meta-box {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

[data-theme="light"] .container-meta-box span {
  color: #334155 !important;
}

[data-theme="light"] .container-meta-box .text-slate-400 {
  color: #64748b !important;
}

[data-theme="light"] .container-meta-box .text-slate-200 {
  color: #0f172a !important;
}

/* ── Consignment Product Row ── */
.consignment-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

[data-theme="light"] .consignment-item-row {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

[data-theme="light"] .consignment-item-row .text-white {
  color: #0f172a !important;
}

[data-theme="light"] .consignment-item-row .text-slate-400 {
  color: #64748b !important;
}

[data-theme="light"] .consignment-item-row .text-slate-300 {
  color: #334155 !important;
}

@media (max-width: 640px) {
  .consignment-item-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.6rem;
  }
}

.item-info-col {
  flex: 1;
  min-width: 0;
}

.item-action-col {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .item-action-col {
    width: 100%;
    padding-top: 0.45rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }
}

/* ── Container Footer (Proper Vertical Alignment & Breathing Room) ── */
.container-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  min-height: 40px;
  padding-top: 0.85rem;
  padding-bottom: 0.35rem;
}

@media (max-width: 640px) {
  .container-footer-row {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    padding-top: 0.85rem;
    padding-bottom: 0.45rem;
  }
}

.total-val-box {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  line-height: 1;
}

.total-val-label {
  color: var(--text-subtle, #94a3b8);
  font-size: 0.785rem;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.total-val-amount {
  color: #10b981;
  font-weight: 800;
  font-size: 0.875rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

[data-theme="light"] .total-val-label {
  color: #475569;
}

[data-theme="light"] .total-val-amount {
  color: #059669;
}

.footer-btns-box {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .footer-btns-box {
    width: 100%;
  }
}

.footer-action-btn {
  height: 32px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.35rem !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.85rem !important;
  border-radius: 6px !important;
  line-height: 1 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

@media (max-width: 640px) {
  .footer-action-btn {
    flex: 1 !important;
  }
}
</style>

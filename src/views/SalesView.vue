<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      1. PAGE HEADER — Multi-Branch & Outbound Sales Command
    ════════════════════════════════════════════ -->
    <div class="glass-panel p-5 border-l-4 border-emerald-500 relative overflow-hidden">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <ShoppingCart :size="24" />
            </div>
            <h1 class="text-xl md:text-2xl font-black text-white tracking-tight">
              Sales Management & Outbound POS Hub
            </h1>
            <span class="badge badge-emerald font-mono">ERP WORKFLOW INTEGRATED</span>
            <span class="badge badge-info font-mono">{{ activeBranchFilter }}</span>
          </div>
          <p class="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl">
            Bill of Lading (BL) linked sales dispatch, customer category-based credit limits with automatic ledger lock, 30-day payment recovery reminders, and machine-by-machine paid/unpaid reconciliation.
          </p>
        </div>

        <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
          <!-- Multi-Branch Selector: Full width 2-cols on mobile -->
          <div class="col-span-2 sm:col-auto flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3.5 py-2 shadow-inner min-h-[42px] sm:min-w-[170px]">
            <div class="flex items-center gap-2 shrink-0">
              <Building2 :size="16" class="text-purple-400 shrink-0" />
              <span class="text-xs text-slate-300 font-semibold">Branch:</span>
            </div>
            <select
              v-model="activeBranchFilter"
              class="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer text-right sm:text-left flex-1 min-w-0"
            >
              <option v-for="b in dataStore.branches" :key="b" :value="b" class="bg-slate-900 text-white">
                {{ b }}
              </option>
            </select>
          </div>

          <!-- View / Hide Balance Security Toggle: Col 1 of Row 2 -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-1.5 h-10 px-2.5 text-xs shadow-lg transition-all col-span-1 whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard password required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="15" class="shrink-0" />
            <Eye v-else :size="15" class="shrink-0" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>

          <!-- Export Sales Excel / PDF: Col 2 of Row 2 -->
          <button
            @click="exportCurrentSalesReport('xlsx')"
            class="btn btn-secondary h-10 px-2.5 text-xs font-bold flex items-center justify-center gap-1.5 col-span-1 whitespace-nowrap"
            title="Export Sales Registry to Excel"
          >
            <FileSpreadsheet :size="15" class="text-emerald-400 shrink-0" />
            <span>Export Excel</span>
          </button>

          <!-- Process Product Return: Col 1 of Row 3 -->
          <button
            @click="openReturnModal()"
            class="btn btn-warning h-10 px-2.5 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg col-span-1 whitespace-nowrap"
          >
            <RotateCcw :size="15" class="shrink-0" />
            <span>Product Return</span>
          </button>

          <!-- New Sales POS Checkout: Col 2 of Row 3 -->
          <button
            @click="openNewPOS()"
            class="btn btn-primary h-10 px-3 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/30 col-span-1 whitespace-nowrap"
          >
            <Plus :size="16" class="shrink-0" />
            <span>New Sale POS</span>
          </button>
        </div>
      </div>

      <!-- Quick Status Strip -->
      <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-slate-300">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>Active Credit Control: <strong class="text-white font-mono">75% / 90% / 100% Lock</strong></span>
          </span>
          <span class="text-slate-600 hidden sm:inline">•</span>
          <span class="flex items-center gap-1.5">
            <Clock :size="13" class="text-amber-400 shrink-0" />
            <span>30-Day Reminders: <strong class="text-white font-mono">{{ dataStore.overdueInvoices.length }} Overdue Accounts</strong></span>
          </span>
        </div>
        <span class="text-[11px] font-mono text-slate-400">
          Branch View: <strong class="text-white">{{ activeBranchFilter }}</strong>
        </span>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      2. SALES KPI METRICS GRID (IN ROW)
    ════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div class="glass-card kpi-card border-t-2 border-emerald-500">
        <div class="flex justify-between items-center mb-1">
          <span class="kpi-title">Gross Invoiced Revenue</span>
          <span class="badge badge-emerald font-mono">{{ filteredInvoices.length }} INVOICES</span>
        </div>
        <div class="kpi-value font-mono text-emerald-400">{{ formatBalance(salesKpis.revenue) }}</div>
        <div class="kpi-subtitle flex items-center justify-between text-xs">
          <span>COGS Cost: {{ formatBalance(salesKpis.cost) }}</span>
          <span class="text-emerald-400 font-bold font-mono">{{ salesKpis.margin }}% Margin</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-primary">
        <div class="flex justify-between items-center mb-1">
          <span class="kpi-title">Payments Collected</span>
          <span class="badge badge-info font-mono">RECOVERED</span>
        </div>
        <div class="kpi-value font-mono text-white">{{ formatBalance(salesKpis.paid) }}</div>
        <div class="kpi-subtitle flex items-center justify-between text-xs">
          <span>Full & Partial Inflow</span>
          <span class="text-blue-400 font-bold font-mono">{{ salesKpis.recoveryRate }}% Rate</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-amber-500">
        <div class="flex justify-between items-center mb-1">
          <span class="kpi-title">Receivables Outstanding</span>
          <span class="badge badge-warning font-mono">{{ dataStore.overdueInvoices.length }} OVERDUE</span>
        </div>
        <div class="kpi-value font-mono text-amber-400">{{ formatBalance(salesKpis.outstanding) }}</div>
        <div class="kpi-subtitle text-xs text-amber-300/80 flex items-center gap-1">
          <AlertTriangle :size="12" />
          <span>30+ Days Overdue: {{ formatBalance(salesKpis.overdueTotal) }}</span>
        </div>
      </div>

      <div class="glass-card kpi-card border-t-2 border-purple-500">
        <div class="flex justify-between items-center mb-1">
          <span class="kpi-title">Credit Control & Locks</span>
          <span class="badge badge-purple font-mono">{{ lockedCustomersCount }} LOCKED</span>
        </div>
        <div class="kpi-value font-mono text-purple-400">{{ lockedCustomersCount }} Accounts</div>
        <div class="kpi-subtitle text-xs flex items-center justify-between">
          <span class="text-slate-300">Management Overrides: {{ managementOverridesCount }}</span>
          <button @click="activeTab = 'credit'" class="text-purple-300 hover:underline font-bold">Manage</button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      3. MODULE NAVIGATION TABS (5 DEDICATED SECTIONS)
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
        <span v-if="tab.badge" :class="['px-1.5 py-0.5 rounded text-[10px] font-mono', tab.badgeColor || 'bg-black/30']">
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: SALES INVOICES & ORDERS
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'invoices'" class="space-y-4 animate-fade-in">
      <div class="glass-panel p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <!-- Title & Counter -->
        <div class="flex items-center gap-3 w-full md:w-auto min-w-0">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <FileText :size="20" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-bold text-main">Sales Invoices & Outflow</h3>
              <span class="badge badge-neutral font-mono text-xs">{{ filteredInvoices.length }} Records</span>
            </div>
            <p class="text-xs text-subtle">Multi-city billing, serial tracking & payment verification</p>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          <!-- Search Bar with Responsive Width -->
          <div class="relative w-full sm:w-64">
            <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search invoice, customer, serial, BL#..."
              class="form-input text-xs h-9 pl-9 pr-7 w-full"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle hover:text-main text-xs"
            >✕</button>
          </div>

          <!-- Status Dropdown with Responsive Width -->
          <select v-model="statusFilter" class="form-select text-xs h-9 font-semibold w-full sm:w-48">
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid Only</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Unpaid">Unpaid Only</option>
          </select>
        </div>
      </div>

      <!-- Tab 1 Sales Date Filter Bar -->
      <DateFilterBar v-model="salesDateFilter" />

      <div class="table-container glass-panel shadow-xl">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Order / Delivery Date</th>
              <th>Customer & Category</th>
              <th>Branch</th>
              <th>Inbound BL Reference</th>
              <th>Equipment Sold & Serials</th>
              <th>Grand Total</th>
              <th>Paid / Balance</th>
              <th>Payment Status</th>
              <th>30-Day Reminder</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in paginatedInvoices" :key="inv.invoiceNo">
              <td class="font-mono font-bold text-blue-400">
                <div>{{ inv.invoiceNo }}</div>
                <div class="text-[10px] text-slate-500 font-normal">{{ inv.quotationNo || 'Direct Sale' }}</div>
              </td>
              <td class="font-mono text-xs">
                <div class="text-white">{{ inv.saleDate }}</div>
                <div class="text-[10px] text-slate-400">Deliv: {{ inv.deliveryDate || inv.saleDate }}</div>
              </td>
              <td>
                <div class="font-bold text-white text-xs">{{ inv.customer }}</div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span :class="['badge text-[10px] py-0 px-1.5 font-mono', getCustomerCategoryBadge(inv.customer)]">
                    {{ getCustomerCategoryCode(inv.customer) }}
                  </span>
                  <span v-if="isCustomerLocked(inv.customer)" class="badge badge-danger text-[9px] py-0 px-1 font-mono">
                    LOCKED
                  </span>
                </div>
              </td>
              <td>
                <span class="badge badge-purple text-xs">
                  <Building2 :size="10" />
                  {{ inv.branch || 'Peshawar' }}
                </span>
              </td>
              <td class="font-mono text-xs text-amber-300 font-bold">
                {{ inv.blNumber || 'SENDNB2606060' }}
              </td>
              <td>
                <div v-for="item in inv.items" :key="item.productName" class="text-xs py-0.5">
                  <span class="font-bold text-white">{{ item.qty }}x</span> {{ item.productName }}
                  <div class="text-[10px] text-slate-400 font-mono">
                    Serials: <span class="text-slate-300">{{ item.serials?.join(', ') || 'N/A' }}</span>
                    <span v-if="item.machineCodes?.length" class="text-purple-400"> ({{ item.machineCodes.join(', ') }})</span>
                  </div>
                </div>
              </td>
              <td class="font-mono font-bold text-emerald-400 text-xs">
                {{ formatBalance(inv.grandTotal) }}
                <div class="text-[10px] text-slate-500 font-normal">Tax: {{ inv.taxRatio || 18 }}%</div>
              </td>
              <td class="font-mono text-xs">
                <div class="text-emerald-300">Paid: {{ formatBalance(inv.paidAmount || 0) }}</div>
                <div :class="['font-bold', (inv.outstandingBalance || 0) > 0 ? 'text-red-400' : 'text-slate-500']">
                  Bal: {{ formatBalance(inv.outstandingBalance || 0) }}
                </div>
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', getPaymentStatusBadge(inv)]">
                  {{ inv.paymentStatus || (inv.paymentMethod === 'Cash Payment' ? 'Paid' : 'Unpaid') }}
                </span>
              </td>
              <td>
                <div v-if="getInvoiceOverdueDays(inv) >= 30" class="flex flex-col gap-0.5">
                  <span class="badge badge-danger text-[10px] font-mono animate-pulse">
                    {{ getInvoiceOverdueDays(inv) }}d Overdue
                  </span>
                  <button
                    @click="openPaymentReminderModal(inv)"
                    class="text-[10px] text-amber-300 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Send :size="10" />
                    <span>Send Reminder</span>
                  </button>
                </div>
                <span v-else class="text-[11px] text-slate-500 font-mono">
                  {{ getInvoiceOverdueDays(inv) }}d (Current)
                </span>
              </td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="viewInvoiceDetails(inv)"
                    class="btn btn-xs btn-secondary"
                    title="View Invoice Details"
                  >
                    <FileText :size="12" />
                  </button>
                  <button
                    @click="printInvoice(inv)"
                    class="btn btn-xs btn-outline border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    title="Print Commercial Invoice (With Ledger Reconciliation)"
                  >
                    <Printer :size="12" />
                  </button>
                  <button
                    @click="openReturnModal(inv)"
                    class="btn btn-xs btn-outline border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                    title="Process Sales Return"
                  >
                    <RotateCcw :size="12" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredInvoices.length === 0">
              <td colspan="11" class="p-8 text-center text-slate-500 italic">
                No matching sales invoices found for selected branch or filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab 1 Invoices Pagination -->
      <PaginationBar
        v-model="invoicesPage"
        v-model:pageSize="invoicesPageSize"
        :total-items="filteredInvoices.length"
      />
    </div>

    <!-- ════════════════════════════════════════════
      TAB 2: PRODUCT-WISE PAID & UNPAID TRACKING (REQUIREMENT 20)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'product_wise'" class="space-y-4 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Layers :size="20" class="text-purple-400" />
            <h3 class="text-lg font-bold text-white">Individual Machine Paid & Unpaid Tracking</h3>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Individual serial-by-serial financial recovery status, outstanding balance, and last payment date for every sold equipment unit.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="productWiseSearch"
            type="text"
            placeholder="Filter machine serial, model, customer..."
            class="form-input text-xs h-9 w-64"
          />
          <button @click="exportProductWiseExcel()" class="btn btn-secondary text-xs h-9 flex items-center gap-1">
            <FileSpreadsheet :size="14" class="text-emerald-400" />
            <span>Excel Sheet</span>
          </button>
        </div>
      </div>

      <div class="table-container glass-panel shadow-xl">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Internal Machine Code</th>
              <th>Equipment Name & SKU</th>
              <th>Customer Name</th>
              <th>Invoice #</th>
              <th>BL Origin</th>
              <th>Sale Amount</th>
              <th>Received Amount</th>
              <th>Balance Outstanding</th>
              <th>Payment Status</th>
              <th>Last Payment Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedProductWiseList" :key="row.serialCode">
              <td class="font-mono font-bold text-white text-xs">{{ row.serialCode }}</td>
              <td class="font-mono font-bold text-purple-400 text-xs">{{ row.machineCode }}</td>
              <td class="text-xs">
                <div class="font-bold text-slate-200">{{ row.productName }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ row.productCode }}</div>
              </td>
              <td class="font-bold text-slate-300 text-xs">{{ row.customer }}</td>
              <td class="font-mono text-blue-400 text-xs">{{ row.invoiceNo }}</td>
              <td class="font-mono text-amber-300 text-xs font-bold">{{ row.blNumber }}</td>
              <td class="font-mono text-xs font-bold text-white">{{ formatBalance(row.saleAmount) }}</td>
              <td class="font-mono text-xs font-bold text-emerald-400">{{ formatBalance(row.receivedAmount) }}</td>
              <td :class="['font-mono text-xs font-bold', row.balance > 0 ? 'text-red-400' : 'text-slate-500']">
                {{ formatBalance(row.balance) }}
              </td>
              <td>
                <span :class="[
                  'badge text-[10px] font-mono',
                  row.paymentStatus === 'Paid' ? 'badge-success' : row.paymentStatus === 'Partially Paid' ? 'badge-warning' : 'badge-danger'
                ]">
                  {{ row.paymentStatus }}
                </span>
              </td>
              <td class="font-mono text-[11px] text-slate-400">{{ row.lastPaymentDate }}</td>
            </tr>
            <tr v-if="filteredProductWiseList.length === 0">
              <td colspan="11" class="p-8 text-center text-slate-500 italic">
                No equipment records found matching filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab 2 Product-Wise Pagination -->
      <PaginationBar
        v-model="productWisePage"
        v-model:pageSize="productWisePageSize"
        :total-items="filteredProductWiseList.length"
      />
    </div>

    <!-- ════════════════════════════════════════════
      TAB 3: 30-DAY AUTOMATED PAYMENT REMINDERS & AGING (REQUIREMENTS 21-23)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'reminders'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-amber-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Clock :size="20" class="text-amber-400" />
            <h3 class="text-base font-bold text-white">30-Day Automatic Payment Reminder & Overdue Tracking</h3>
          </div>
          <p class="text-xs text-slate-300 mt-1">
            Calculated automatically from equipment delivery date. Invoices with remaining unpaid balance past 30 days trigger active follow-up protocols across WhatsApp, SMS, and Email.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="badge badge-danger font-mono text-xs px-3 py-1">
            {{ dataStore.overdueInvoices.length }} ACTIVE OVERDUE CASES
          </span>
        </div>
      </div>

      <!-- Overdue Aging Cards Grid (IN ROW) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div class="glass-card p-4 border border-amber-500/30">
          <div class="flex justify-between items-center text-xs text-slate-400">
            <span>30 - 44 Days</span>
            <span class="badge badge-warning font-mono">{{ getOverdueBracketCount(30, 44) }} INVOICES</span>
          </div>
          <div class="text-lg font-black font-mono text-amber-400 mt-2">
            {{ formatBalance(getOverdueBracketAmount(30, 44)) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Initial follow-up reminder stage</p>
        </div>

        <div class="glass-card p-4 border border-orange-500/40">
          <div class="flex justify-between items-center text-xs text-slate-400">
            <span>45 - 59 Days</span>
            <span class="badge badge-warning font-mono">{{ getOverdueBracketCount(45, 59) }} INVOICES</span>
          </div>
          <div class="text-lg font-black font-mono text-orange-400 mt-2">
            {{ formatBalance(getOverdueBracketAmount(45, 59)) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Formal notice & statement dispatch</p>
        </div>

        <div class="glass-card p-4 border border-red-500/40">
          <div class="flex justify-between items-center text-xs text-slate-400">
            <span>60 - 89 Days</span>
            <span class="badge badge-danger font-mono">{{ getOverdueBracketCount(60, 89) }} INVOICES</span>
          </div>
          <div class="text-lg font-black font-mono text-red-400 mt-2">
            {{ formatBalance(getOverdueBracketAmount(60, 89)) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Critical escalation / partial lock</p>
        </div>

        <div class="glass-card p-4 border border-purple-500/40">
          <div class="flex justify-between items-center text-xs text-slate-400">
            <span>90+ Days Critical</span>
            <span class="badge badge-danger font-mono">{{ getOverdueBracketCount(90, 9999) }} INVOICES</span>
          </div>
          <div class="text-lg font-black font-mono text-purple-400 mt-2">
            {{ formatBalance(getOverdueBracketAmount(90, 9999)) }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Automatic customer credit lock applied</p>
        </div>
      </div>

      <!-- Overdue Action Table -->
      <div class="glass-panel p-5 space-y-4">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <AlertCircle :size="16" class="text-amber-400" />
          <span>Active Overdue Invoices Requiring Follow-Up</span>
        </h4>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer Name</th>
                <th>Branch</th>
                <th>Delivery Date</th>
                <th>Days Elapsed</th>
                <th>Invoice Total</th>
                <th>Paid Amount</th>
                <th>Outstanding Balance</th>
                <th>Overdue Tier</th>
                <th class="text-right">Follow-Up Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in paginatedOverdueInvoices" :key="inv.invoiceNo">
                <td class="font-mono font-bold text-blue-400">{{ inv.invoiceNo }}</td>
                <td class="font-bold text-white text-xs">{{ inv.customer }}</td>
                <td>
                  <span class="badge badge-purple text-xs">{{ inv.branch }}</span>
                </td>
                <td class="font-mono text-xs text-slate-400">{{ inv.deliveryDate }}</td>
                <td class="font-mono text-xs font-bold text-red-400">{{ inv.daysSinceDelivery }} Days</td>
                <td class="font-mono text-xs text-slate-300">{{ formatBalance(inv.grandTotal) }}</td>
                <td class="font-mono text-xs text-emerald-400">{{ formatBalance(inv.paidAmount) }}</td>
                <td class="font-mono text-xs font-bold text-red-400">{{ formatBalance(inv.balance) }}</td>
                <td>
                  <span class="badge badge-danger font-mono text-[10px]">{{ inv.bracket }}</span>
                </td>
                <td class="text-right">
                  <button
                    @click="openPaymentReminderModal(inv)"
                    class="btn btn-xs btn-warning font-bold flex items-center gap-1 ml-auto"
                  >
                    <Send :size="11" />
                    <span>Send Reminder</span>
                  </button>
                </td>
              </tr>
              <tr v-if="dataStore.overdueInvoices.length === 0">
                <td colspan="10" class="p-8 text-center text-slate-500 italic">
                  No accounts are currently 30+ days overdue. All deliveries are within allowed credit terms.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Overdue Invoices Pagination -->
        <PaginationBar
          v-model="overduePage"
          v-model:pageSize="overduePageSize"
          :total-items="dataStore.overdueInvoices.length"
        />
      </div>

      <!-- Follow-Up Communications Log -->
      <div class="glass-panel p-5 space-y-3">
        <h4 class="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare :size="16" class="text-blue-400" />
          <span>Automated & Dispatched Payment Follow-Up Audit Log</span>
        </h4>

        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Recipient Contact</th>
                <th>Reminder Message / Log</th>
                <th>Sent By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fol in paginatedFollowUps" :key="fol.id">
                <td class="font-mono text-xs text-slate-400">{{ fol.date }}</td>
                <td class="font-mono font-bold text-blue-400 text-xs">{{ fol.invoiceNo }}</td>
                <td class="font-bold text-white text-xs">{{ fol.customer }}</td>
                <td>
                  <span class="badge badge-info text-xs">{{ fol.channel }}</span>
                </td>
                <td class="font-mono text-xs text-slate-300">{{ fol.recipient }}</td>
                <td class="text-xs text-slate-300 max-w-xs truncate" :title="fol.message">{{ fol.message }}</td>
                <td class="text-xs text-slate-400">{{ fol.sentBy }}</td>
                <td>
                  <span class="badge badge-success text-[10px] font-mono">{{ fol.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Follow-Up Audit Log Pagination -->
        <PaginationBar
          v-model="followUpPage"
          v-model:pageSize="followUpPageSize"
          :total-items="dataStore.paymentFollowUps.length"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 4: CUSTOMER CREDIT LIMIT & LOCK CENTER (REQUIREMENTS 10-16)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'credit'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-purple-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <ShieldAlert :size="20" class="text-purple-400" />
            <h3 class="text-base font-bold text-white">Customer Category & Credit Limit Governance</h3>
          </div>
          <p class="text-xs text-slate-300 mt-1">
            Strict policy enforcement: Customers reaching 75% receive warnings; 90% triggers critical alerts; 100% or overdue accounts are automatically locked from new credit sales.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button @click="showCategoryManagerModal = true" class="btn btn-secondary text-xs font-bold">
            <Tag :size="14" class="text-purple-400" />
            <span>Category Rules</span>
          </button>
        </div>
      </div>

      <!-- Customer Credit Matrix Table -->
      <div class="table-container glass-panel shadow-xl">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Category</th>
              <th>Branch</th>
              <th>Credit Limit</th>
              <th>Current Outstanding</th>
              <th>Credit Exposure %</th>
              <th>Allowed Days</th>
              <th>Lock Status</th>
              <th class="text-right">Management Override</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cust in paginatedCustomers" :key="cust.id">
              <td class="font-bold text-white text-xs">
                <div>{{ cust.name }}</div>
                <div class="text-[10px] text-slate-400">{{ cust.phone || cust.email }}</div>
              </td>
              <td>
                <span :class="['badge font-mono text-[10px]', getCustomerCategoryBadge(cust.name)]">
                  {{ cust.category }}
                </span>
              </td>
              <td>
                <span class="badge badge-purple text-xs">{{ cust.branch }}</span>
              </td>
              <td class="font-mono text-xs font-bold text-emerald-400">
                {{ formatBalance(getCustomerCreditData(cust.name).creditLimit) }}
                <div v-if="getCustomerCreditData(cust.name).overridesTotal > 0" class="text-[10px] text-purple-300">
                  +{{ formatBalance(getCustomerCreditData(cust.name).overridesTotal) }} Override
                </div>
              </td>
              <td class="font-mono text-xs font-bold text-white">
                {{ formatBalance(getCustomerCreditData(cust.name).outstanding) }}
              </td>
              <td class="w-48">
                <div class="space-y-1">
                  <div class="flex justify-between text-[10px] font-mono">
                    <span :class="getExposureColorClass(getCustomerCreditData(cust.name).utilizationPercent)">
                      {{ getCustomerCreditData(cust.name).utilizationPercent }}% Used
                    </span>
                    <span class="text-slate-500">
                      Rem: {{ formatBalance(getCustomerCreditData(cust.name).remainingCredit) }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      :class="['h-full transition-all', getExposureBarClass(getCustomerCreditData(cust.name).utilizationPercent)]"
                      :style="{ width: `${Math.min(100, getCustomerCreditData(cust.name).utilizationPercent)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="font-mono text-xs text-slate-300">{{ cust.paymentDays }} Days</td>
              <td>
                <div v-if="getCustomerCreditData(cust.name).status === 'locked'" class="flex items-center gap-1">
                  <span class="badge badge-danger text-[10px] font-mono">LOCKED</span>
                </div>
                <div v-else-if="getCustomerCreditData(cust.name).status === 'critical_90'">
                  <span class="badge badge-warning text-[10px] font-mono">90% CRITICAL</span>
                </div>
                <div v-else-if="getCustomerCreditData(cust.name).status === 'warning_75'">
                  <span class="badge badge-warning text-[10px] font-mono">75% WARNING</span>
                </div>
                <div v-else>
                  <span class="badge badge-success text-[10px] font-mono">ACTIVE / OK</span>
                </div>
              </td>
              <td class="text-right">
                <button
                  @click="openCreditOverrideModal(cust)"
                  class="btn btn-xs btn-primary font-bold flex items-center gap-1 ml-auto"
                >
                  <ShieldCheck :size="12" />
                  <span>Override / Unlock</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tab 4 Customer Matrix Pagination -->
      <PaginationBar
        v-model="customersPage"
        v-model:pageSize="customersPageSize"
        :total-items="filteredCustomersList.length"
      />
    </div>

    <!-- ════════════════════════════════════════════
      TAB 5: BILL OF LADING (BL) SALES LINK & CLOSING (REQUIREMENTS 1-3)
    ════════════════════════════════════════════ -->
    <div v-if="activeTab === 'bl_closing'" class="space-y-6 animate-fade-in">
      <div class="glass-panel p-4 border-l-4 border-blue-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Truck :size="20" class="text-blue-400" />
            <h3 class="text-base font-bold text-white">Bill of Lading (BL) Sales Link & Automatic Excel Closing</h3>
          </div>
          <p class="text-xs text-slate-300 mt-1">
            Every product sale is matched to its originating Bill of Lading. Once the business cycle completes, validate and close the BL to automatically generate the complete 17-column closing report.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="badge badge-info font-mono text-xs px-3 py-1">
            {{ dataStore.blList.length }} BL SHIPMENTS TRACKED
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="bl in paginatedBLList"
          :key="bl.blNumber"
          class="glass-panel p-5 space-y-4 border border-slate-700/80 hover:border-blue-500/50 transition-all flex flex-col justify-between"
        >
          <div class="space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Bill of Lading</span>
                <h4 class="text-lg font-black text-white font-mono">{{ bl.blNumber }}</h4>
              </div>
              <span :class="['badge font-mono text-xs', getBLStatusBadge(bl.blStatus)]">
                {{ bl.blStatus }}
              </span>
            </div>

            <div class="text-xs text-slate-300">
              <div>Supplier: <strong class="text-white">{{ bl.supplierName }}</strong></div>
              <div>Destination Branch: <strong class="text-purple-300">{{ bl.branch }}</strong></div>
              <div>Receiving Date: <span class="font-mono text-slate-400">{{ bl.receivingDate }}</span></div>
            </div>

            <div class="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-slate-900/80 p-2 rounded">
                <div class="text-[10px] text-slate-400">Total Units</div>
                <div class="font-mono font-bold text-white">{{ bl.totalUnits }}</div>
              </div>
              <div class="bg-slate-900/80 p-2 rounded">
                <div class="text-[10px] text-slate-400">Invoiced</div>
                <div class="font-mono font-bold text-emerald-400">{{ bl.soldUnits }}</div>
              </div>
              <div class="bg-slate-900/80 p-2 rounded">
                <div class="text-[10px] text-slate-400">Paid</div>
                <div class="font-mono font-bold text-blue-400">{{ bl.paidUnits }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-800">
            <button
              @click="openBLClosingModal(bl)"
              class="btn btn-primary w-full text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet :size="14" />
              <span>{{ bl.blStatus === 'Closed' ? 'Export Closed BL Excel' : 'Review & Close BL' }}</span>
            </button>
            <button
              v-if="bl.blStatus === 'Closed' && authStore.canSeeAdmin"
              @click="handleReopenBL(bl)"
              class="btn btn-ghost w-full text-xs text-amber-400 hover:text-amber-300"
            >
              <span>Reopen BL (Management Approval)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab 5 BL Hub Pagination -->
      <PaginationBar
        v-model="blPage"
        v-model:pageSize="blPageSize"
        :total-items="dataStore.blList.length"
      />
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 1: NEW SALES POS & QUOTATION CHECKOUT
    ════════════════════════════════════════════ -->
    <div v-if="showPOSModal" class="modal-backdrop" @click.self="showPOSModal = false">
      <div class="modal-content max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <ShoppingCart :size="22" class="text-emerald-400" />
            <h3 class="text-xl font-bold text-white">Outbound Equipment Sales POS</h3>
          </div>
          <button @click="showPOSModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleProcessSale" class="p-5 space-y-4">
          <!-- Order Type Selector -->
          <div class="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-lg border border-slate-800 w-fit">
            <button
              type="button"
              @click="posForm.orderType = 'Invoice'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'Invoice' ? 'bg-emerald-600 text-white' : 'text-slate-400']"
            >
              Sales Invoice
            </button>
            <button
              type="button"
              @click="posForm.orderType = 'Quotation'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'Quotation' ? 'bg-blue-600 text-white' : 'text-slate-400']"
            >
              Quotation / Proforma
            </button>
            <button
              type="button"
              @click="posForm.orderType = 'SalesOrder'"
              :class="['px-3 py-1.5 rounded text-xs font-bold transition-all', posForm.orderType === 'SalesOrder' ? 'bg-purple-600 text-white' : 'text-slate-400']"
            >
              Sales Order
            </button>
          </div>

          <!-- Customer & Branch Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="form-label text-xs">Customer Account *</label>
              <select
                v-model="posForm.customer"
                @change="onCustomerSelected"
                required
                class="form-select font-bold text-xs"
              >
                <option value="" disabled>Select Customer Account...</option>
                <option v-for="c in dataStore.customers" :key="c.id" :value="c.name">
                  {{ c.name }} ({{ c.category }})
                </option>
              </select>
            </div>

            <div>
              <label class="form-label text-xs">Sales Branch *</label>
              <select v-model="posForm.branch" required class="form-select text-xs font-bold">
                <option value="Peshawar">Peshawar (Head Office)</option>
                <option value="Multan">Multan</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Karachi">Karachi</option>
              </select>
            </div>
          </div>

          <!-- Live Customer Credit Status Banner -->
          <div v-if="posCustomerCredit" class="p-3 rounded-lg border text-xs" :class="getCreditBannerClass(posCustomerCredit.status)">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">Credit Status:</span>
                  <span :class="['badge font-mono text-[10px]', getCustomerCategoryBadge(posCustomerCredit.customerName)]">
                    {{ posCustomerCredit.category }} ({{ posCustomerCredit.categoryCode }})
                  </span>
                  <span v-if="posCustomerCredit.status === 'locked'" class="badge badge-danger font-mono text-[10px]">
                    LOCKED
                  </span>
                </div>
                <div class="text-slate-300">
                  Limit: <strong>{{ formatBalance(posCustomerCredit.creditLimit) }}</strong> |
                  Current Outstanding: <strong>{{ formatBalance(posCustomerCredit.outstanding) }}</strong> |
                  Cart Exposure: <strong class="text-amber-300">{{ formatBalance(posCustomerCredit.exposure) }}</strong>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  v-if="posCustomerCredit.status === 'locked' && authStore.canSeeAdmin"
                  type="button"
                  @click="openCreditOverrideModal(dataStore.customers.find(c => c.name === posForm.customer))"
                  class="btn btn-xs btn-primary font-bold shadow"
                >
                  Grant Management Override
                </button>
              </div>
            </div>

            <!-- Lock Reason Message -->
            <div v-if="posCustomerCredit.status === 'locked'" class="mt-2 text-red-300 font-semibold flex items-center gap-1.5">
              <AlertCircle :size="14" />
              <span>{{ posCustomerCredit.lockReason }}</span>
            </div>
          </div>

          <!-- Dates & BL Row -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="form-label text-xs">Delivery Date (Starts 30-Day Reminder) *</label>
              <input v-model="posForm.deliveryDate" type="date" required class="form-input font-bold text-xs" />
            </div>

            <div>
              <label class="form-label text-xs">Payment Terms *</label>
              <select v-model="posForm.paymentMethod" required class="form-select font-bold text-xs">
                <option value="Cash Payment">Cash Payment (Immediate Full Recovery)</option>
                <option value="Bank Transfer (Meezan Bank)">Bank Transfer (Meezan Bank)</option>
                <option value="Bank Transfer (HBL)">Bank Transfer (HBL)</option>
                <option value="Credit Terms">Credit Terms (Machine-Wise Payment)</option>
              </select>
            </div>

            <div>
              <label class="form-label text-xs">Bill of Lading (BL) Origin</label>
              <select v-model="posForm.blNumber" class="form-select font-bold text-xs text-amber-300">
                <option v-for="bl in dataStore.blList" :key="bl.blNumber" :value="bl.blNumber">
                  {{ bl.blNumber }} ({{ bl.supplierName }})
                </option>
              </select>
            </div>
          </div>

          <!-- Product Picker, Dealer Price Auto-Suggestion & Serial Selection (Requirement 46) -->
          <div class="glass-panel p-4 space-y-3 border border-slate-700/80">
            <div class="flex justify-between items-center text-xs font-bold text-white">
              <span>Select Equipment Product & Machine Serials</span>
              <span class="text-slate-400">Unique Serials & Auto Price History</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Equipment Product Selector -->
              <div>
                <label class="form-label text-xs">Select Equipment SKU *</label>
                <select
                  v-model="selectedCartProductId"
                  @change="cartSelectedSerials = []"
                  class="form-select text-xs font-bold"
                >
                  <option value="" disabled>Choose Equipment...</option>
                  <option v-for="p in availableProducts" :key="p.id" :value="p.id">
                    {{ p.name }} (Stock: {{ p.stockQty }}) - PKR {{ (p.sellingPrice || 0).toLocaleString() }}
                  </option>
                </select>
              </div>

              <!-- Requirement 46: Dealer-Wise Previous Sale Price Auto Suggestion & Editable Price Field -->
              <div v-if="selectedCartProductId">
                <div class="flex justify-between items-center">
                  <label class="form-label text-xs">Unit Sale Price (PKR) *</label>
                  <div class="flex items-center gap-1.5" v-if="priceSuggestionInfo">
                    <button
                      v-if="priceSuggestionInfo.hasHistory"
                      type="button"
                      @click="setPriceToDealerHistory"
                      class="text-[10px] text-emerald-400 hover:underline font-mono"
                      title="Reset to dealer history price"
                    >
                      History Price
                    </button>
                    <button
                      type="button"
                      @click="setPriceToCatalog"
                      class="text-[10px] text-indigo-400 hover:underline font-mono"
                      title="Reset to master catalog price"
                    >
                      Catalog Default
                    </button>
                  </div>
                </div>

                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 font-bold">PKR</span>
                  <input
                    v-model.number="cartItemPrice"
                    type="number"
                    min="0"
                    step="1000"
                    required
                    class="form-input text-xs font-mono font-bold pl-12"
                    placeholder="Enter unit selling price..."
                  />
                </div>

                <!-- Price Suggestion Feedback Badge -->
                <div v-if="priceSuggestionInfo" class="mt-1.5 text-[11px] leading-tight">
                  <div v-if="priceSuggestionInfo.hasHistory" class="flex items-start gap-1 text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30">
                    <Sparkles :size="13" class="flex-shrink-0 mt-0.5 text-emerald-400" />
                    <span>
                      <strong>Dealer Previous Sale Price Auto-Suggested:</strong> PKR {{ priceSuggestionInfo.price.toLocaleString() }}
                      <span class="text-slate-400 block text-[10px]">
                        Last billed in {{ priceSuggestionInfo.branch }} on {{ priceSuggestionInfo.saleDate }} (Inv #{{ priceSuggestionInfo.invoiceNo }}). Editable as needed.
                      </span>
                    </span>
                  </div>
                  <div v-else class="flex items-center gap-1 text-blue-300 bg-blue-950/30 p-1.5 rounded border border-blue-500/30">
                    <span class="text-xs">📋</span>
                    <span>
                      <strong>Catalog Default Price:</strong> PKR {{ priceSuggestionInfo.price.toLocaleString() }} (No prior sale history for this dealer).
                    </span>
                  </div>
                </div>
              </div>

              <!-- Available Serials -->
              <div v-if="selectedCartProductId" class="md:col-span-2">
                <label class="form-label text-xs">Available Machine Serials in Branch (Select Units)</label>
                <div class="max-h-32 overflow-y-auto glass-panel p-2 space-y-1">
                  <div v-for="s in availableSerialsForSelectedProduct" :key="s.serialCode" class="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      :value="s.serialCode"
                      v-model="cartSelectedSerials"
                      class="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
                    <span class="font-mono text-purple-400 font-bold">({{ s.machineCode }})</span>
                  </div>
                  <div v-if="availableSerialsForSelectedProduct.length === 0" class="text-xs text-slate-500 italic">
                    No available serials in stock for this branch.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addCartItem"
              :disabled="!selectedCartProductId || cartSelectedSerials.length === 0 || !cartItemPrice"
              class="btn btn-primary btn-sm w-full font-bold"
            >
              + Add Selected Machines to Order ({{ cartSelectedSerials.length }} units @ PKR {{ Number(cartItemPrice || 0).toLocaleString() }})
            </button>
          </div>

          <!-- Cart Items Table -->
          <div v-if="cartItems.length > 0" class="table-container">
            <table class="table-lined text-xs">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Machine Serials</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in cartItems" :key="item.productId">
                  <td class="font-bold text-white">{{ item.productName }}</td>
                  <td class="font-mono">{{ item.qty }}</td>
                  <td class="font-mono text-purple-300 font-bold">{{ item.serials.join(', ') }}</td>
                  <td class="font-mono">
                    <div class="flex items-center gap-1">
                      <span class="text-slate-400 font-mono text-[10px]">PKR</span>
                      <input
                        type="number"
                        v-model.number="item.sellingPrice"
                        min="0"
                        class="form-input text-xs font-mono font-bold w-28 py-0.5 px-1.5"
                        title="Adjust unit price"
                      />
                    </div>
                  </td>
                  <td class="font-mono font-bold text-emerald-400">{{ formatBalance(item.qty * item.sellingPrice) }}</td>
                  <td>
                    <button type="button" @click="cartItems.splice(idx, 1)" class="btn btn-xs btn-ghost text-red-400">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grand Total & Summary -->
          <div class="glass-panel p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="text-xs text-slate-300">
              <div>Subtotal: <strong>{{ formatBalance(cartSubtotal) }}</strong></div>
              <div>Sales Tax (18% HSN Standard): <strong>{{ formatBalance(cartTax) }}</strong></div>
            </div>

            <div class="text-right">
              <div class="text-xs text-slate-400">Grand Total</div>
              <div class="text-2xl font-black font-mono text-emerald-400">{{ formatBalance(cartGrandTotal) }}</div>
            </div>
          </div>

          <!-- Requirement 47: Customer Ledger Balance Impact Summary -->
          <div class="glass-panel p-4 border border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 rounded-lg">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>💳 Customer Ledger Balance Reconciliation</span>
                <span class="badge badge-emerald text-[10px] font-mono">LIVE CALCULATION</span>
              </span>
              <span class="text-[11px] text-slate-400">Dealer: <strong class="text-white">{{ posForm.customer || 'Select Dealer' }}</strong></span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block mb-0.5">Previous Balance</span>
                <strong class="font-mono text-sm text-slate-200">{{ formatBalance(posCustomerPreviousBalance) }}</strong>
                <span class="text-[10px] text-slate-500 block">Existing ledger balance</span>
              </div>

              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block mb-0.5">Current Invoice</span>
                <strong class="font-mono text-sm text-indigo-400">(+) {{ formatBalance(cartGrandTotal) }}</strong>
                <span class="text-[10px] text-slate-500 block">This invoice total</span>
              </div>

              <div class="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                <span class="text-slate-400 block mb-0.5">Payment Received</span>
                <strong class="font-mono text-sm text-emerald-400">(-) {{ formatBalance(posPaymentReceived) }}</strong>
                <span class="text-[10px] text-slate-500 block">{{ posForm.paymentMethod === 'Cash Payment' ? 'Full Cash Paid' : (posForm.downPayment ? 'Down Payment' : 'No Immediate Payment') }}</span>
              </div>

              <div class="bg-emerald-950/40 p-2.5 rounded border border-emerald-500/50">
                <span class="text-emerald-300 block mb-0.5 font-bold">Total Outstanding Balance</span>
                <strong class="font-mono text-base text-emerald-300">{{ formatBalance(posFinalOutstandingBalance) }}</strong>
                <span class="text-[10px] text-emerald-400 block">New ledger balance</span>
              </div>
            </div>
          </div>

          <!-- Checkout Action Buttons -->
          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showPOSModal = false" class="btn btn-secondary text-xs">Cancel</button>
            <button
              type="submit"
              :disabled="cartItems.length === 0 || (posCustomerCredit && posCustomerCredit.status === 'locked' && posForm.paymentMethod !== 'Cash Payment')"
              class="btn btn-emerald text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Check :size="16" />
              <span>Complete & Dispatch Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 2: MANAGEMENT CREDIT OVERRIDE MODAL (REQUIREMENT 16)
    ════════════════════════════════════════════ -->
    <div v-if="showCreditOverrideModal" class="modal-backdrop" @click.self="showCreditOverrideModal = false">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <ShieldCheck :size="20" class="text-purple-400" />
            <h3 class="text-lg font-bold text-white">Authorized Credit Limit Override</h3>
          </div>
          <button @click="showCreditOverrideModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSaveCreditOverride" class="p-5 space-y-4 text-xs">
          <div class="p-3 bg-purple-950/40 border border-purple-800/60 rounded-lg space-y-1">
            <div class="font-bold text-white">Customer: {{ selectedCustomerToOverride?.name }}</div>
            <div class="text-slate-300">
              Assigned Base Limit: {{ formatBalance(selectedCustomerToOverride?.baseCreditLimit) }} |
              Category: {{ selectedCustomerToOverride?.category }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Additional Approved Credit Limit (PKR) *</label>
            <input
              v-model.number="overrideForm.additionalLimit"
              type="number"
              min="10000"
              step="10000"
              required
              class="form-input font-bold font-mono text-emerald-400"
              placeholder="e.g. 1000000"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Approval Justification / Reason *</label>
            <select v-model="overrideForm.reason" required class="form-select font-bold">
              <option value="Institutional Healthcare Tender Contract">Institutional Healthcare Tender Contract</option>
              <option value="Management Approved Advance Dispatch">Management Approved Advance Dispatch</option>
              <option value="Reputed Long-Term Client Clearance">Reputed Long-Term Client Clearance</option>
              <option value="Special Board Resolution">Special Board Resolution</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Management Approval Remarks *</label>
            <textarea
              v-model="overrideForm.remarks"
              required
              rows="2"
              class="form-input"
              placeholder="Enter management authorization comments for permanent audit trail..."
            ></textarea>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showCreditOverrideModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-purple font-bold flex items-center gap-1.5">
              <ShieldCheck :size="16" />
              <span>Authorize & Unlock Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 3: PAYMENT REMINDER DISPATCH MODAL (REQUIREMENTS 21-23)
    ════════════════════════════════════════════ -->
    <div v-if="showReminderModal" class="modal-backdrop" @click.self="showReminderModal = false">
      <div class="modal-content max-w-lg">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <Send :size="18" class="text-amber-400" />
            <h3 class="text-base font-bold text-white">Dispatch Payment Overdue Reminder</h3>
          </div>
          <button @click="showReminderModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleSendReminder" class="p-5 space-y-4 text-xs">
          <div class="p-3 bg-slate-900 border border-slate-700/80 rounded-lg space-y-1">
            <div class="font-bold text-white">Invoice: {{ selectedReminderInvoice?.invoiceNo }}</div>
            <div class="text-slate-300">Customer: {{ selectedReminderInvoice?.customer }}</div>
            <div class="text-red-400 font-bold font-mono">
              Outstanding Balance: {{ formatBalance(selectedReminderInvoice?.balance || selectedReminderInvoice?.outstandingBalance) }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Communication Channel *</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                type="button"
                @click="reminderForm.channel = 'WhatsApp'"
                :class="['btn btn-xs', reminderForm.channel === 'WhatsApp' ? 'btn-success text-white' : 'btn-secondary']"
              >
                WhatsApp
              </button>
              <button
                type="button"
                @click="reminderForm.channel = 'SMS'"
                :class="['btn btn-xs', reminderForm.channel === 'SMS' ? 'btn-primary text-white' : 'btn-secondary']"
              >
                SMS
              </button>
              <button
                type="button"
                @click="reminderForm.channel = 'Email'"
                :class="['btn btn-xs', reminderForm.channel === 'Email' ? 'btn-info text-white' : 'btn-secondary']"
              >
                Email
              </button>
              <button
                type="button"
                @click="reminderForm.channel = 'System'"
                :class="['btn btn-xs', reminderForm.channel === 'System' ? 'btn-warning text-white' : 'btn-secondary']"
              >
                System
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Reminder Message Content</label>
            <textarea
              v-model="reminderForm.message"
              rows="4"
              required
              class="form-input font-mono text-xs"
            ></textarea>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showReminderModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-warning font-bold text-white flex items-center gap-1.5">
              <Send :size="14" />
              <span>Dispatch Reminder & Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 4: BL CLOSING & 17-COLUMN EXCEL EXPORT (REQUIREMENTS 1-3)
    ════════════════════════════════════════════ -->
    <div v-if="showBLModal" class="modal-backdrop" @click.self="showBLModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <FileSpreadsheet :size="20" class="text-emerald-400" />
            <h3 class="text-lg font-bold text-white">Bill of Lading (BL) Closing & Excel Generation</h3>
          </div>
          <button @click="showBLModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="p-3 bg-slate-900 border border-slate-700/80 rounded-lg flex justify-between items-center">
            <div>
              <div class="text-[10px] text-slate-400">Bill of Lading Number</div>
              <div class="text-base font-black font-mono text-amber-300">{{ selectedBLForClosing?.blNumber }}</div>
              <div class="text-slate-300">{{ selectedBLForClosing?.supplierName }}</div>
            </div>
            <span :class="['badge font-mono text-xs', getBLStatusBadge(selectedBLForClosing?.blStatus)]">
              {{ selectedBLForClosing?.blStatus }}
            </span>
          </div>

          <!-- Closing Verification Checklist -->
          <div class="space-y-2">
            <div class="font-bold text-white flex items-center justify-between">
              <span>Pre-Closing System Validation Checklist:</span>
              <span class="font-mono text-emerald-400">{{ blValidation?.passedCount }}/{{ blValidation?.totalChecks }} Passed</span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="(item, idx) in blValidation?.checklist"
                :key="idx"
                class="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-start gap-2.5"
              >
                <CheckCircle2 v-if="item.passed" :size="16" class="text-emerald-400 shrink-0 mt-0.5" />
                <AlertCircle v-else :size="16" class="text-amber-400 shrink-0 mt-0.5" />
                <div class="flex-1">
                  <div class="font-bold text-slate-200">{{ item.label }}</div>
                  <div class="text-[10px] text-slate-400">{{ item.details }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 17-Column Excel Preview Info -->
          <div class="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-emerald-300 space-y-1">
            <div class="font-bold flex items-center gap-1.5">
              <FileSpreadsheet :size="14" />
              <span>Automatic Excel Closing Sheet Structure (17 Fields):</span>
            </div>
            <p class="text-[10px] text-slate-300">
              BL Number, Delivery Date, Customer Name, Invoice #, Product Name, Product Code, Serial #, Sale Amount, Received Amount, Outstanding Amount, Mode of Payment, Bank Name, Bank Details, Cheque/RTGS Ref, Payment Date, Branch, Sales Person.
            </p>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button type="button" @click="showBLModal = false" class="btn btn-secondary">Close</button>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="downloadBLClosingExcel(selectedBLForClosing?.blNumber)"
                class="btn btn-secondary font-bold flex items-center gap-1.5 text-emerald-400"
              >
                <Download :size="14" />
                <span>Export 17-Column Excel</span>
              </button>
              <button
                v-if="selectedBLForClosing?.blStatus !== 'Closed'"
                type="button"
                @click="handleFinalizeBLClosing(selectedBLForClosing?.blNumber)"
                :disabled="!blValidation?.canClose"
                class="btn btn-emerald font-bold flex items-center gap-1.5 text-white"
              >
                <Check :size="14" />
                <span>Finalize & Close BL</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 5: INVOICE DETAILS MODAL
    ════════════════════════════════════════════ -->
    <div v-if="showInvoiceDetailModal" class="modal-backdrop" @click.self="showInvoiceDetailModal = false">
      <div class="modal-content max-w-2xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <FileText :size="20" class="text-blue-400" />
            <h3 class="text-lg font-bold text-white">Invoice Details: {{ selectedInvoiceDetail?.invoiceNo }}</h3>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="printInvoice(selectedInvoiceDetail)"
              class="btn btn-sm btn-primary text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Printer :size="13" />
              <span>Print Official Invoice</span>
            </button>
            <button @click="showInvoiceDetailModal = false" class="btn btn-ghost text-slate-400">✕</button>
          </div>
        </div>

        <div class="p-5 space-y-4 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-lg">
            <div>
              <span class="text-slate-400 block">Customer</span>
              <strong class="text-white">{{ selectedInvoiceDetail?.customer }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Sale Date</span>
              <strong class="font-mono text-slate-200">{{ selectedInvoiceDetail?.saleDate }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Delivery Date</span>
              <strong class="font-mono text-emerald-400">{{ selectedInvoiceDetail?.deliveryDate || selectedInvoiceDetail?.saleDate }}</strong>
            </div>
            <div>
              <span class="text-slate-400 block">Branch</span>
              <strong class="text-purple-300">{{ selectedInvoiceDetail?.branch }}</strong>
            </div>
          </div>

          <div class="table-container">
            <table class="table-lined">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Serials / Machine Codes</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in selectedInvoiceDetail?.items" :key="it.productName">
                  <td class="font-bold text-white">{{ it.productName }}</td>
                  <td class="font-mono text-purple-300 font-bold">
                    {{ it.serials?.join(', ') || 'N/A' }}
                  </td>
                  <td class="font-mono">{{ formatBalance(it.unitPrice) }}</td>
                  <td class="font-mono">{{ it.qty }}</td>
                  <td class="font-mono font-bold text-emerald-400">{{ formatBalance(it.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-800">
            <div class="text-slate-400">
              Payment Method: <strong class="text-white">{{ selectedInvoiceDetail?.paymentMethod }}</strong>
            </div>
            <div class="text-right">
              <span class="text-slate-400">Grand Total: </span>
              <strong class="text-base font-mono text-emerald-400">{{ formatBalance(selectedInvoiceDetail?.grandTotal) }}</strong>
            </div>
          </div>

          <!-- Requirement 47: Customer Ledger Reconciliation Card -->
          <div class="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-xs">
            <div class="font-bold text-emerald-400 mb-2 flex items-center justify-between">
              <span>💳 Customer Ledger Balance Reconciliation</span>
              <span class="text-[10px] font-mono text-slate-400">Account: {{ selectedInvoiceDetail?.customer }}</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Previous Balance</span>
                <strong class="font-mono text-slate-200">
                  {{ formatBalance(selectedInvoiceDetail?.previousBalance ?? dataStore.getCustomerLedgerBalance(selectedInvoiceDetail?.customer, selectedInvoiceDetail?.invoiceNo)) }}
                </strong>
                <span class="text-[9px] text-slate-500 block">Before this invoice</span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Current Invoice</span>
                <strong class="font-mono text-indigo-400">
                  (+) {{ formatBalance(selectedInvoiceDetail?.grandTotal) }}
                </strong>
                <span class="text-[9px] text-slate-500 block">Invoice Grand Total</span>
              </div>
              <div class="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span class="text-slate-400 block text-[10px]">Payment Received</span>
                <strong class="font-mono text-emerald-400">
                  (-) {{ formatBalance(selectedInvoiceDetail?.paidAmount ?? (selectedInvoiceDetail?.paymentMethod === 'Cash Payment' ? selectedInvoiceDetail?.grandTotal : 0)) }}
                </strong>
                <span class="text-[9px] text-slate-500 block">At issuance</span>
              </div>
              <div class="bg-emerald-950/50 p-2 rounded border border-emerald-500/50">
                <span class="text-emerald-300 block text-[10px] font-bold">Total Outstanding Balance</span>
                <strong class="font-mono text-emerald-300 text-sm">
                  {{ formatBalance(selectedInvoiceDetail?.finalOutstandingBalance ?? Math.max(0, (selectedInvoiceDetail?.previousBalance ?? dataStore.getCustomerLedgerBalance(selectedInvoiceDetail?.customer, selectedInvoiceDetail?.invoiceNo)) + Number(selectedInvoiceDetail?.grandTotal || 0) - Number(selectedInvoiceDetail?.paidAmount || (selectedInvoiceDetail?.paymentMethod === 'Cash Payment' ? selectedInvoiceDetail?.grandTotal : 0)))) }}
                </strong>
                <span class="text-[9px] text-emerald-400 block">Current total due</span>
              </div>
            </div>
          </div>

          <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
            <button
              type="button"
              @click="printInvoice(selectedInvoiceDetail)"
              class="btn btn-sm btn-primary font-bold flex items-center gap-1.5 shadow"
            >
              <Printer :size="14" />
              <span>Print Official Invoice</span>
            </button>
            <button type="button" @click="showInvoiceDetailModal = false" class="btn btn-secondary text-xs">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      MODAL 6: SALES RETURN MODAL
    ════════════════════════════════════════════ -->
    <div v-if="showReturnModal" class="modal-backdrop" @click.self="showReturnModal = false">
      <div class="modal-content max-w-xl">
        <div class="modal-header">
          <div class="flex items-center gap-2">
            <RotateCcw :size="20" class="text-warning" />
            <h3 class="text-lg font-bold text-white">Sales Return & Restock</h3>
          </div>
          <button @click="showReturnModal = false" class="btn btn-ghost text-slate-400">✕</button>
        </div>

        <form @submit.prevent="handleProcessReturn" class="modal-body space-y-4">
          <!-- Select Origin Invoice -->
          <FormField label="Origin Sales Invoice" input-id="retInvoice">
            <select id="retInvoice" v-model="returnForm.invoiceNo" @change="onReturnInvoiceSelect" class="form-select font-bold">
              <option value="">Direct Return (No Specific Invoice)</option>
              <option v-for="inv in dataStore.salesInvoices" :key="inv.invoiceNo" :value="inv.invoiceNo">
                {{ inv.invoiceNo }} — {{ inv.customer }} (PKR {{ (inv.grandTotal || 0).toLocaleString() }})
              </option>
            </select>
          </FormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Customer Name" input-id="retCustomer" :required="true">
              <input id="retCustomer" v-model="returnForm.customer" type="text" class="form-input font-bold" required />
            </FormField>

            <FormField label="Branch" input-id="retBranch" :required="true">
              <SelectInput id="retBranch" v-model="returnForm.branch" :options="['Peshawar', 'Multan', 'Lahore']" class="font-bold" />
            </FormField>
          </div>

          <!-- Serials / Machines to Return -->
          <GlassPanel extra-class="p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-white">Select Machines to Return</span>
              <span class="text-xs text-amber-400 font-medium">Restocks to Available</span>
            </div>

            <div v-if="eligibleReturnSerials.length > 0" class="max-h-40 overflow-y-auto space-y-1.5">
              <label
                v-for="s in eligibleReturnSerials"
                :key="s.serialCode"
                class="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-700/50 hover:border-amber-500/50 cursor-pointer text-xs"
              >
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="s.serialCode"
                    v-model="returnForm.selectedSerials"
                    @change="calculateReturnRefund"
                    class="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span class="font-mono font-bold text-white">{{ s.serialCode }}</span>
                  <span class="font-mono text-purple-400">({{ s.machineCode }})</span>
                  <span class="text-slate-300">{{ s.productName || s.sku }}</span>
                </div>
                <span class="font-mono text-emerald-400 font-bold">PKR {{ (s.salePrice || 0).toLocaleString() }}</span>
              </label>
            </div>
            <div v-else class="text-xs text-subtle italic p-2">
              No sold machine units found for this customer/invoice. Enter manual serial if needed below.
            </div>

            <div v-if="eligibleReturnSerials.length === 0" class="mt-2">
              <label class="text-xs text-slate-400 block mb-1">Manual Serial Code (Optional)</label>
              <input v-model="returnForm.manualSerial" placeholder="e.g. US10-8803" class="form-input text-xs" />
            </div>
          </GlassPanel>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Refund Amount (PKR)" input-id="retRefund">
              <input id="retRefund" v-model.number="returnForm.refundAmount" type="number" class="form-input font-bold text-emerald-400" />
            </FormField>

            <FormField label="Return Reason" input-id="retReason">
              <input id="retReason" v-model="returnForm.reason" placeholder="e.g. Clinical exchange / Customer cancellation" class="form-input" />
            </FormField>
          </div>

          <!-- Refund Payout Option -->
          <GlassPanel extra-class="p-3 flex items-center justify-between">
            <div>
              <div class="text-sm font-bold text-white">Disburse Refund Voucher (Payment Out)</div>
              <div class="text-xs text-subtle">Immediately records an outflow voucher in Payment Out / Cash Flow</div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="returnForm.payoutRefund" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </GlassPanel>

          <FormField v-if="returnForm.payoutRefund" label="Refund Payment Method" input-id="retPayMethod">
            <SelectInput id="retPayMethod" v-model="returnForm.paymentMethod" :options="['Cash Payment', 'Bank Transfer (HBL)', 'Bank Transfer (Meezan Bank)']" class="font-bold" />
          </FormField>

          <div class="modal-footer">
            <button type="button" @click="showReturnModal = false" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-warning text-white font-bold flex items-center gap-1.5">
              <RotateCcw :size="16" />
              <span>Confirm Return & Restock Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
// ──────────────────────────────────────────────────────────────
//  SalesView — Comprehensive Sales Dashboard & ERP Hub
//  Covers Requirements 1-17:
//   - Bill of Lading (BL) links & 17-Column Excel Closing
//   - Customer Categories & Credit Limit Auto-Lock (75% / 90% / 100%)
//   - 30-Day Payment Overdue Reminders & Multi-channel Dispatch
//   - Product-Wise Paid & Unpaid Equipment Tracking
//   - Multi-Branch Active Filtering & POS Checkout
// ──────────────────────────────────────────────────────────────
import { ref, computed, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { exportBLClosingExcel, exportXLSX, exportInvoicePrint } from '@/utils/reportExporter'

// Reusable UI components
import PageHeader   from '@/components/ui/PageHeader.vue'
import KpiCard      from '@/components/ui/KpiCard.vue'
import GlassPanel   from '@/components/ui/GlassPanel.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import StatBadge    from '@/components/ui/StatBadge.vue'
import DataTable    from '@/components/ui/DataTable.vue'
import DateFilterBar from '@/components/ui/DateFilterBar.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'

// Reusable form components
import FormField    from '@/components/forms/FormField.vue'
import SelectInput  from '@/components/forms/SelectInput.vue'
import SearchInput  from '@/components/forms/SearchInput.vue'

// Lucide icons
import {
  ShoppingCart,
  FileText,
  Building2,
  Plus,
  Check,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  Download,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Printer,
  Sparkles,
  Tag,
  Send,
  RefreshCw,
  Search
} from 'lucide-vue-next'

// ── Stores ────────────────────────────────────────────────────
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore   = useUiStore()

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

// ── Navigation & Filter State ─────────────────────────────────
const activeTab = ref('invoices')
const activeBranchFilter = ref(dataStore.activeBranchFilter || 'All')
const searchQuery = ref('')
const statusFilter = ref('All')
const productWiseSearch = ref('')
const productWiseStatusFilter = ref('All')
const selectedBL = ref('')
const categoryFilter = ref('All')
const creditStatusFilter = ref('All')

// Navigation tabs definition
const tabs = computed(() => [
  { id: 'invoices', label: 'Sales Invoices', icon: FileText, badge: (filteredInvoices.value || []).length },
  { id: 'product_wise', label: 'Machine Paid / Unpaid', icon: Layers, badge: (filteredProductWiseList.value || []).length },
  { id: 'reminders', label: '30-Day Reminders', icon: Clock, badge: (dataStore.overdueInvoices || []).length, badgeColor: (dataStore.overdueInvoices || []).length ? 'bg-amber-500/20 text-amber-300' : '' },
  { id: 'credit', label: 'Credit Control & Locks', icon: ShieldAlert, badge: lockedCustomersCount.value, badgeColor: lockedCustomersCount.value ? 'bg-red-500/20 text-red-300' : '' },
  { id: 'bl_closing', label: 'BL Closing (17-Col)', icon: FileSpreadsheet }
])

watch(activeBranchFilter, (newBranch) => {
  dataStore.setActiveBranch(newBranch)
})

// ── Sales Date Filter State & Dynamic Metrics ─────────────────
const salesDateFilter = ref({
  preset: 'All Time',
  startDate: null,
  endDate: null
})

const salesMetrics = computed(() => {
  if (salesDateFilter.value.preset === 'All Time') {
    return {
      revenue: dataStore.totalRevenue,
      profit: dataStore.grossProfit,
      marginPercent: dataStore.profitMarginPercent,
      count: dataStore.salesInvoices.length
    }
  }
  return dataStore.getSalesMetrics(salesDateFilter.value.startDate, salesDateFilter.value.endDate)
})

const salesFilterLabel = computed(() => {
  const { preset, startDate, endDate } = salesDateFilter.value
  if (preset === 'All Time') return 'All Time'
  if (startDate && endDate) {
    return startDate === endDate ? `${preset}: ${startDate}` : `${startDate} ~ ${endDate}`
  }
  return preset
})

// ── Invoices Sorting & Columns ────────────────────────────────
const invoiceSortKey = ref('saleDate')
const invoiceSortOrder = ref('desc') // 'asc' | 'desc'

const invoiceTableColumns = [
  { label: 'Invoice #', key: 'invoiceNo', sortable: true },
  { label: 'Date', key: 'saleDate', sortable: true },
  { label: 'Customer', key: 'customer', sortable: true },
  { label: 'Branch', key: 'branch', sortable: true },
  { label: 'Equipment & Serial / Machine Codes', key: 'items', sortable: false },
  { label: 'Grand Total', key: 'grandTotal', sortable: true },
  { label: 'Paid / Status', key: 'paymentStatus', sortable: true },
  { label: 'Action', key: 'action', sortable: false }
]

function handleInvoiceSort(key) {
  if (invoiceSortKey.value === key) {
    invoiceSortOrder.value = invoiceSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    invoiceSortKey.value = key
    invoiceSortOrder.value = 'asc'
  }
}

// ── Filtered Invoices ─────────────────────────────────────────
const filteredInvoices = computed(() => {
  let list = dataStore.salesInvoices || []

  // Branch filter
  const isBranchFiltered = activeBranchFilter.value &&
    activeBranchFilter.value !== 'All' &&
    !activeBranchFilter.value.includes('All Branches')
  if (isBranchFiltered) {
    list = list.filter(i => i.branch === activeBranchFilter.value)
  }

  // Payment status filter
  if (statusFilter.value !== 'All') {
    list = list.filter(i => i.paymentStatus === statusFilter.value)
  }

  // Date range filter
  if (salesDateFilter.value.preset !== 'All Time') {
    const sDate = salesDateFilter.value.startDate
    const eDate = salesDateFilter.value.endDate
    if (sDate && eDate) {
      list = list.filter(i => {
        const d = (i.saleDate || '').substring(0, 10)
        return d >= sDate && d <= eDate
      })
    } else if (sDate) {
      list = list.filter(i => (i.saleDate || '').substring(0, 10) >= sDate)
    } else if (eDate) {
      list = list.filter(i => (i.saleDate || '').substring(0, 10) <= eDate)
    }
  }

  // Search query filter
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    list = list.filter(i =>
      (i.invoiceNo || '').toLowerCase().includes(q) ||
      (i.customer || '').toLowerCase().includes(q) ||
      (i.branch || '').toLowerCase().includes(q) ||
      (i.blNumber || '').toLowerCase().includes(q) ||
      (i.salesPerson || '').toLowerCase().includes(q)
    )
  }

  // Ascending / Descending sorting
  list = [...list].sort((a, b) => {
    let aVal = a[invoiceSortKey.value]
    let bVal = b[invoiceSortKey.value]

    if (invoiceSortKey.value === 'grandTotal' || invoiceSortKey.value === 'paidAmount' || invoiceSortKey.value === 'outstandingBalance') {
      aVal = Number(a[invoiceSortKey.value] || 0)
      bVal = Number(b[invoiceSortKey.value] || 0)
      return invoiceSortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    } else if (invoiceSortKey.value === 'saleDate') {
      aVal = a.saleDate || ''
      bVal = b.saleDate || ''
      return invoiceSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    } else if (typeof aVal === 'string') {
      aVal = (aVal || '').toLowerCase()
      bVal = (bVal || '').toLowerCase()
      return invoiceSortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    return invoiceSortOrder.value === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0)
  })

  return list
})

// ── Tab 1 Pagination ──────────────────────────────────────────
const invoicesPage = ref(1)
const invoicesPageSize = ref(10)
const paginatedInvoices = computed(() => {
  const start = (invoicesPage.value - 1) * invoicesPageSize.value
  return filteredInvoices.value.slice(start, start + invoicesPageSize.value)
})

// Watch filters to reset page to 1
watch([activeBranchFilter, statusFilter, searchQuery, salesDateFilter], () => {
  invoicesPage.value = 1
})

function exportCurrentSalesReport(format = 'xlsx') {
  const rows = filteredInvoices.value.map(inv => ({
    'Invoice #': inv.invoiceNo,
    'Sale Date': inv.saleDate,
    'Customer': inv.customer,
    'Branch': inv.branch,
    'BL Reference': inv.blNumber || 'N/A',
    'Grand Total (PKR)': inv.grandTotal,
    'Paid Amount (PKR)': inv.paidAmount,
    'Outstanding Balance (PKR)': inv.outstandingBalance,
    'Payment Status': inv.paymentStatus,
    'Sales Person': inv.salesPerson || 'N/A'
  }))

  exportXLSX(
    'Sales Invoices Registry',
    { Branch: activeBranchFilter.value, 'Generated Date': new Date().toLocaleDateString() },
    [
      { label: 'Invoice #', key: 'Invoice #' },
      { label: 'Sale Date', key: 'Sale Date' },
      { label: 'Customer', key: 'Customer' },
      { label: 'Branch', key: 'Branch' },
      { label: 'BL Reference', key: 'BL Reference' },
      { label: 'Grand Total (PKR)', key: 'Grand Total (PKR)' },
      { label: 'Paid Amount (PKR)', key: 'Paid Amount (PKR)' },
      { label: 'Outstanding Balance (PKR)', key: 'Outstanding Balance (PKR)' },
      { label: 'Payment Status', key: 'Payment Status' },
      { label: 'Sales Person', key: 'Sales Person' }
    ],
    rows,
    `Sales_Registry_${activeBranchFilter.value}_${new Date().toISOString().substring(0, 10)}.xlsx`
  )
  uiStore.showToast('Sales Registry exported to Excel successfully', 'success')
}

// ── Sales KPIs ────────────────────────────────────────────────
const salesKpis = computed(() => {
  const invs = filteredInvoices.value
  const totalSalesVolume = invs.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0)
  const totalCollectedCash = invs.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0)
  const totalReceivables = invs.reduce((sum, i) => sum + (Number(i.outstandingBalance) || 0), 0)
  const overdue30DaysTotal = dataStore.overdueInvoices.reduce((sum, i) => sum + (Number(i.balance) || 0), 0)
  const overdueCount = dataStore.overdueInvoices.length
  return {
    totalSalesVolume,
    totalCollectedCash,
    totalReceivables,
    overdue30DaysTotal,
    overdueCount
  }
})

const lockedCustomersCount = computed(() => (dataStore.customers || []).filter(c => c.creditLock).length)
const managementOverridesCount = computed(() => {
  return (dataStore.customers || []).reduce((acc, c) => acc + (c.overrideHistory?.length || 0), 0)
})

// ── Tab 2: Product-Wise Tracking ──────────────────────────────
const filteredProductWiseList = computed(() => {
  let list = dataStore.productWisePayments || []

  const isBranchFiltered = activeBranchFilter.value &&
    activeBranchFilter.value !== 'All' &&
    !activeBranchFilter.value.includes('All Branches')
  if (isBranchFiltered) {
    list = list.filter(item => item.branch === activeBranchFilter.value)
  }
  if (productWiseStatusFilter.value !== 'All') {
    list = list.filter(item => item.paymentStatus === productWiseStatusFilter.value)
  }
  if (selectedBL.value) {
    list = list.filter(item => item.blNumber === selectedBL.value)
  }

  const q = productWiseSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(item =>
      (item.productName || '').toLowerCase().includes(q) ||
      (item.productCode || '').toLowerCase().includes(q) ||
      (item.serialNumber || '').toLowerCase().includes(q) ||
      (item.customerName || '').toLowerCase().includes(q) ||
      (item.invoiceNo || '').toLowerCase().includes(q) ||
      (item.blNumber || '').toLowerCase().includes(q)
    )
  }

  return list
})

// ── Tab 2 Pagination ──────────────────────────────────────────
const productWisePage = ref(1)
const productWisePageSize = ref(10)
const paginatedProductWiseList = computed(() => {
  const start = (productWisePage.value - 1) * productWisePageSize.value
  return filteredProductWiseList.value.slice(start, start + productWisePageSize.value)
})

watch([productWiseSearch, productWiseStatusFilter, selectedBL, activeBranchFilter], () => {
  productWisePage.value = 1
})

function exportProductWiseExcel() {
  const rows = filteredProductWiseList.value.map(item => ({
    'Invoice #': item.invoiceNo,
    'BL Number': item.blNumber || 'N/A',
    'Customer': item.customerName,
    'Branch': item.branch,
    'Product Code': item.productCode,
    'Product Name': item.productName,
    'Serial #': item.serialNumber,
    'Delivery Date': item.deliveryDate,
    'Unit Sale Price (PKR)': item.unitSalePrice,
    'Allocated Paid (PKR)': item.paidPortion,
    'Outstanding Balance (PKR)': item.outstandingPortion,
    'Payment Status': item.paymentStatus
  }))

  exportXLSX(rows, `Product_Wise_Payment_Report_${new Date().toISOString().substring(0, 10)}.xlsx`)
}

// ── Tab 3: 30-Day Payment Reminders & Aging ───────────────────
function getInvoiceOverdueDays(inv) {
  const refDateStr = inv.deliveryDate || inv.saleDate || new Date().toISOString()
  const refDate = new Date(refDateStr)
  const now = new Date()
  const diffDays = Math.floor((now - refDate) / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

function getOverdueBracketCount(minDays, maxDays) {
  return dataStore.overdueInvoices.filter(i => i.daysSinceDelivery >= minDays && i.daysSinceDelivery <= maxDays).length
}

function getOverdueBracketAmount(minDays, maxDays) {
  return dataStore.overdueInvoices
    .filter(i => i.daysSinceDelivery >= minDays && i.daysSinceDelivery <= maxDays)
    .reduce((sum, i) => sum + (Number(i.balance) || 0), 0)
}

const showReminderModal = ref(false)
const reminderForm = ref({
  invoiceNo: '',
  customer: '',
  balance: 0,
  daysOverdue: 0,
  channel: 'WhatsApp',
  recipient: '+92 300 1234567',
  message: ''
})

function openPaymentReminderModal(inv) {
  reminderForm.value = {
    invoiceNo: inv.invoiceNo,
    customer: inv.customer,
    balance: inv.balance,
    daysOverdue: inv.daysSinceDelivery,
    channel: 'WhatsApp',
    recipient: '+92 300 1234567',
    message: `Respected ${inv.customer}, this is a formal reminder regarding outstanding balance of PKR ${Number(inv.balance).toLocaleString()} on Invoice ${inv.invoiceNo}. Delivered ${inv.daysSinceDelivery} days ago. Kindly expedite payment.`
  }
  showReminderModal.value = true
}

function handleSendReminder() {
  dataStore.sendPaymentReminder(
    reminderForm.value.invoiceNo,
    reminderForm.value.channel,
    reminderForm.value.message,
    authStore.user?.username || 'Finance Admin'
  )
  uiStore.showModal(
    'Reminder Dispatched',
    `Payment notice sent via ${reminderForm.value.channel} to ${reminderForm.value.customer} for Invoice ${reminderForm.value.invoiceNo}.`,
    'success'
  )
  showReminderModal.value = false
}

// ── Tab 3 Pagination ──────────────────────────────────────────
const overduePage = ref(1)
const overduePageSize = ref(5)
const paginatedOverdueInvoices = computed(() => {
  const start = (overduePage.value - 1) * overduePageSize.value
  return (dataStore.overdueInvoices || []).slice(start, start + overduePageSize.value)
})

const followUpPage = ref(1)
const followUpPageSize = ref(5)
const paginatedFollowUps = computed(() => {
  const start = (followUpPage.value - 1) * followUpPageSize.value
  return (dataStore.paymentFollowUps || []).slice(start, start + followUpPageSize.value)
})

// ── Tab 4: Customer Categories & Credit Governance ────────────
function getCustomerCreditData(customerName) {
  return dataStore.getCustomerCreditStatus(customerName, 0)
}

function getCustomerCategoryBadge(catCode) {
  const map = {
    'A': 'badge-purple font-bold',
    'B': 'badge-info font-bold',
    'C': 'badge-warning font-bold',
    'D': 'badge-danger font-bold'
  }
  return map[catCode] || 'badge-secondary'
}

function getCustomerCategoryCode(customerName) {
  const cust = (dataStore.customers || []).find(c => c.name.toLowerCase() === (customerName || '').toLowerCase())
  return cust?.categoryCode || 'C'
}

function isCustomerLocked(customerName) {
  const cust = (dataStore.customers || []).find(c => c.name.toLowerCase() === (customerName || '').toLowerCase())
  return !!cust?.creditLock
}

function getExposureColorClass(pct) {
  if (pct >= 100) return 'text-red-400 font-bold'
  if (pct >= 90)  return 'text-amber-400 font-bold'
  if (pct >= 75)  return 'text-yellow-300 font-semibold'
  return 'text-emerald-400 font-semibold'
}

function getExposureBarClass(pct) {
  if (pct >= 100) return 'bg-red-500'
  if (pct >= 90)  return 'bg-amber-500'
  if (pct >= 75)  return 'bg-yellow-400'
  return 'bg-emerald-500'
}

function getCreditBannerClass(status) {
  switch (status) {
    case 'Locked':
      return 'bg-red-950/60 border-red-500 text-red-200'
    case 'Critical':
      return 'bg-amber-950/60 border-amber-500 text-amber-200'
    case 'Warning':
      return 'bg-yellow-950/50 border-yellow-500 text-yellow-200'
    default:
      return 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
  }
}

function toggleCustomerLock(cust) {
  const userName = authStore.user?.username || 'Finance Admin'
  if (cust.creditLock) {
    dataStore.unlockCustomer(cust.name, 'Admin unlocked from Credit Matrix', userName)
    uiStore.showModal('Customer Unlocked', `${cust.name} has been unblocked for new credit sales.`, 'success')
  } else {
    dataStore.lockCustomer(cust.name, 'Manual credit lock triggered from Sales Governance', userName)
    uiStore.showModal('Customer Locked', `${cust.name} has been restricted from credit sales.`, 'warning')
  }
}

const showCreditOverrideModal = ref(false)
const overrideForm = ref({
  customerName: '',
  currentBalance: 0,
  currentLimit: 0,
  additionalLimit: 200000,
  reason: 'Director Special Approval',
  remarks: ''
})

function openCreditOverrideModal(cust) {
  overrideForm.value = {
    customerName: cust.name,
    currentBalance: cust.currentBalance || 0,
    currentLimit: cust.creditLimit || 0,
    additionalLimit: 250000,
    reason: 'Director Special Approval',
    remarks: 'Approved for urgent clinic ultrasound delivery.'
  }
  showCreditOverrideModal.value = true
}

function handleSaveCreditOverride() {
  const res = dataStore.overrideCustomerCredit(
    overrideForm.value.customerName,
    overrideForm.value.additionalLimit,
    overrideForm.value.reason,
    overrideForm.value.remarks,
    authStore.user?.username || 'Superadmin'
  )
  if (res.success) {
    uiStore.showModal('Credit Limit Overridden', res.message, 'success')
    showCreditOverrideModal.value = false
  } else {
    uiStore.showModal('Override Failed', res.message, 'danger')
  }
}

// ── Tab 4 Pagination ──────────────────────────────────────────
const customersPage = ref(1)
const customersPageSize = ref(10)
const filteredCustomersList = computed(() => {
  let list = dataStore.customers || []
  if (categoryFilter.value !== 'All') {
    list = list.filter(c => c.categoryCode === categoryFilter.value)
  }
  if (creditStatusFilter.value !== 'All') {
    list = list.filter(c => {
      const exposure = dataStore.getCustomerCreditStatus(c.name, 0)
      return exposure.status === creditStatusFilter.value
    })
  }
  return list
})

const paginatedCustomers = computed(() => {
  const start = (customersPage.value - 1) * customersPageSize.value
  return filteredCustomersList.value.slice(start, start + customersPageSize.value)
})

watch([categoryFilter, creditStatusFilter], () => {
  customersPage.value = 1
})

// ── Tab 5 Pagination ──────────────────────────────────────────
const blPage = ref(1)
const blPageSize = ref(5)
const paginatedBLList = computed(() => {
  const start = (blPage.value - 1) * blPageSize.value
  return (dataStore.blList || []).slice(start, start + blPageSize.value)
})

// ── Tab 5: BL Closing & Excel Hub ─────────────────────────────
function getBLStatusBadge(status) {
  switch (status) {
    case 'Closed':
      return 'badge-success'
    case 'Ready to Close':
      return 'badge-warning font-bold'
    case 'In Stock':
      return 'badge-info'
    default:
      return 'badge-purple'
  }
}

function getPaymentStatusBadge(status) {
  switch (status) {
    case 'Fully Paid':
      return 'badge-success'
    case 'Partial Paid':
      return 'badge-warning'
    case 'Unpaid / On Credit':
      return 'badge-danger font-bold'
    default:
      return 'badge-secondary'
  }
}

const showBLModal = ref(false)
const selectedBLForClosing = ref(null)

const blValidation = computed(() => {
  if (!selectedBLForClosing.value) {
    return { canClose: false, issues: [], uncollectedTotal: 0, soldCount: 0, totalCount: 0 }
  }
  return dataStore.validateBLForClosing(selectedBLForClosing.value.blNumber)
})

const blClosingRows = computed(() => {
  if (!selectedBLForClosing.value) return []
  return dataStore.getBLClosingRows(selectedBLForClosing.value.blNumber)
})

function openBLDetailModal(bl) {
  selectedBLForClosing.value = bl
  showBLModal.value = true
}

function openBLClosingModal(bl) {
  openBLDetailModal(bl)
}

function downloadBLClosingExcel(blNumber) {
  if (!blNumber) return
  const rows = dataStore.getBLClosingRows(blNumber)
  const meta = {
    branch: activeBranchFilter.value,
    closedBy: authStore.user?.username || 'Executive Officer'
  }
  exportBLClosingExcel(blNumber, rows, meta)
  uiStore.showModal(
    'Excel Report Generated',
    `Automatic 17-column BL Closing Sheet downloaded for ${blNumber}.`,
    'success'
  )
}

function handleFinalizeBLClosing(blNumber) {
  if (!blNumber) return
  const res = dataStore.closeBL(blNumber, authStore.user?.username || 'Finance Admin')
  if (res.success) {
    uiStore.showModal('BL Closed Successfully', res.message, 'success')
    showBLModal.value = false
  } else {
    uiStore.showModal('BL Closing Blocked', res.message, 'warning')
  }
}

function handleReopenBL(blNumber) {
  if (!blNumber) return
  const res = dataStore.reopenBL(blNumber, authStore.user?.username || 'Superadmin')
  uiStore.showModal('BL Status Updated', res.message, 'info')
}

// ── Modal: Invoice Details ────────────────────────────────────
const showInvoiceDetailModal = ref(false)
const selectedInvoiceDetail = ref(null)

function openInvoiceDetailModal(inv) {
  selectedInvoiceDetail.value = inv
  showInvoiceDetailModal.value = true
}

function viewInvoiceDetails(inv) {
  openInvoiceDetailModal(inv)
}

// ── POS Checkout State & Actions ──────────────────────────────
const showPOSModal = ref(false)

function openNewPOS() {
  showPOSModal.value = true
}

const selectedCartProductId = ref('')
const cartSelectedSerials = ref([])
const cartItems = ref([])

// Requirement 46: Auto Suggestion of Dealer Previous Sale Price
const cartItemPrice = ref(0)
const priceSuggestionInfo = ref(null)

const posForm = ref({
  customer: '',
  branch: 'Peshawar',
  paymentMethod: 'Cash Payment',
  taxRatio: 18,
  deliveryDate: new Date().toISOString().substring(0, 10),
  blNumber: 'SENDNB2606060',
  salesPerson: 'Ahmad Khan',
  downPayment: 0,
  bankName: 'Meezan Bank Ltd',
  bankDetails: 'IBAN: PK88MEZN0001099238',
  chequeRef: ''
})

const availableProducts = computed(() => (dataStore.products || []).filter(p => p.stockQty > 0))

const availableSerialsForSelectedProduct = computed(() => {
  if (!selectedCartProductId.value) return []
  return (dataStore.serials || []).filter(s => s.productId === selectedCartProductId.value && s.status === 'Available')
})

const cartSubtotal = computed(() => cartItems.value.reduce((acc, i) => acc + (i.qty * i.sellingPrice), 0))
const cartTax = computed(() => cartSubtotal.value * ((posForm.value.taxRatio || 0) / 100))
const cartGrandTotal = computed(() => cartSubtotal.value + cartTax.value)

// Requirement 47: Customer Ledger Balance Impact Summary Computations
const posCustomerPreviousBalance = computed(() => {
  if (!posForm.value.customer) return 0
  return dataStore.getCustomerLedgerBalance(posForm.value.customer)
})

const posPaymentReceived = computed(() => {
  if (posForm.value.paymentMethod === 'Cash Payment') {
    return cartGrandTotal.value
  }
  return Number(posForm.value.downPayment || 0)
})

const posFinalOutstandingBalance = computed(() => {
  return Math.max(0, posCustomerPreviousBalance.value + cartGrandTotal.value - posPaymentReceived.value)
})

const creditWarningNotice = computed(() => {
  if (!posForm.value.customer) return null
  return dataStore.getCustomerCreditStatus(posForm.value.customer, cartGrandTotal.value)
})

// Requirement 46: Check Dealer Previous Sale History
function updateSuggestedPrice() {
  if (!selectedCartProductId.value) {
    priceSuggestionInfo.value = null
    cartItemPrice.value = 0
    return
  }
  const prod = dataStore.products.find(p => p.id === selectedCartProductId.value || p._id === selectedCartProductId.value)
  if (!prod) return

  const customerName = posForm.value.customer
  const suggestion = dataStore.getDealerPreviousSalePrice(customerName, selectedCartProductId.value)
  if (suggestion) {
    priceSuggestionInfo.value = suggestion
    cartItemPrice.value = suggestion.price
  } else {
    const defaultPrice = Number(prod.sellingPrice || prod.salePrice || 0)
    priceSuggestionInfo.value = {
      hasHistory: false,
      price: defaultPrice,
      catalogPrice: defaultPrice,
      source: 'Product Master Default Sale Price'
    }
    cartItemPrice.value = defaultPrice
  }
}

watch([selectedCartProductId, () => posForm.value.customer], () => {
  updateSuggestedPrice()
})

function setPriceToCatalog() {
  if (priceSuggestionInfo.value) {
    cartItemPrice.value = priceSuggestionInfo.value.catalogPrice
  }
}

function setPriceToDealerHistory() {
  if (priceSuggestionInfo.value && priceSuggestionInfo.value.hasHistory) {
    cartItemPrice.value = priceSuggestionInfo.value.price
  }
}

function printInvoice(inv) {
  if (!inv) return
  const prevBal = inv.previousBalance !== undefined 
    ? inv.previousBalance 
    : dataStore.getCustomerLedgerBalance(inv.customer, inv.invoiceNo)
  const currInv = Number(inv.grandTotal || 0)
  const paid = Number(inv.paidAmount ?? (inv.paymentMethod === 'Cash Payment' ? currInv : 0))
  const finalBal = inv.finalOutstandingBalance !== undefined 
    ? inv.finalOutstandingBalance 
    : Math.max(0, prevBal + currInv - paid)

  exportInvoicePrint(inv, {
    previousBalance: prevBal,
    currentInvoiceAmount: currInv,
    paymentReceived: paid,
    finalOutstandingBalance: finalBal
  })
}

function addCartItem() {
  if (!selectedCartProductId.value) {
    uiStore.showModal('Selection Required', 'Please select an Equipment Product SKU first.', 'warning')
    return
  }
  if (cartSelectedSerials.value.length === 0) {
    const avail = availableSerialsForSelectedProduct.value
    if (avail.length > 0) {
      cartSelectedSerials.value = [avail[0].serialCode]
    } else {
      uiStore.showModal('Selection Required', 'No available machine serial numbers found in stock.', 'warning')
      return
    }
  }
  const prod = dataStore.products.find(p => p.id === selectedCartProductId.value)
  if (!prod) return
  const machineCodes = cartSelectedSerials.value.map(sCode => {
    const s = dataStore.serials.find(x => x.serialCode === sCode)
    return s ? s.machineCode : ''
  })

  const unitSellingPrice = Number(cartItemPrice.value) || Number(prod.sellingPrice || prod.salePrice || 0)

  cartItems.value.push({
    productId:    prod.id,
    productName:  prod.name,
    sku:          prod.sku,
    costPrice:    prod.costPrice || 0,
    sellingPrice: unitSellingPrice,
    qty:          cartSelectedSerials.value.length,
    serials:      [...cartSelectedSerials.value],
    machineCodes
  })
  selectedCartProductId.value = ''
  cartSelectedSerials.value   = []
  cartItemPrice.value         = 0
  priceSuggestionInfo.value   = null
}

async function handleProcessSale() {
  if (cartItems.value.length === 0 && selectedCartProductId.value) addCartItem()

  if (!posForm.value.customer) {
    uiStore.showModal('Checkout Error', 'Please enter Customer / Hospital Name.', 'warning')
    return
  }
  if (cartItems.value.length === 0) {
    uiStore.showModal('Checkout Error', 'Please select an equipment product and machine serial.', 'warning')
    return
  }

  // Pre-check customer credit lock
  const creditStatus = dataStore.getCustomerCreditStatus(posForm.value.customer, cartGrandTotal.value)
  if (creditStatus.isLocked) {
    uiStore.showModal(
      'Sale Blocked by Credit Policy',
      `Customer ${posForm.value.customer} is locked (${creditStatus.reason}). Override from Management is required before completing transaction.`,
      'danger'
    )
    return
  }

  const invoiceData = {
    customer: posForm.value.customer,
    branch: posForm.value.branch,
    deliveryDate: posForm.value.deliveryDate || new Date().toISOString().substring(0, 10),
    blNumber: posForm.value.blNumber || 'SENDNB2606060',
    salesPerson: posForm.value.salesPerson || 'Ahmad Khan',
    paymentMethod: posForm.value.paymentMethod,
    paidAmount: posPaymentReceived.value,
    previousBalance: posCustomerPreviousBalance.value,
    currentInvoiceAmount: cartGrandTotal.value,
    finalOutstandingBalance: posFinalOutstandingBalance.value,
    bankName: posForm.value.bankName,
    bankDetails: posForm.value.bankDetails,
    chequeRef: posForm.value.chequeRef,
    taxRatio: posForm.value.taxRatio,
    subtotal: cartSubtotal.value,
    taxAmount: cartTax.value,
    grandTotal: cartGrandTotal.value,
    items: cartItems.value
  }

  const res = await dataStore.processSaleInvoice(invoiceData, authStore.user)
  if (res.error) {
    uiStore.showModal('Sale Blocked', res.error, 'danger')
    return
  }

  uiStore.showModal(
    'Invoice Issued & Warranty Activated',
    `Successfully created Sales Invoice ${res.invoiceNo} for ${posForm.value.customer}. Equipment serial numbers assigned and warranty activated.`,
    'success'
  )

  // Reset form and cart
  showPOSModal.value = false
  cartItems.value    = []
  posForm.value      = {
    customer: '',
    branch: 'Peshawar',
    paymentMethod: 'Cash Payment',
    taxRatio: 18,
    deliveryDate: new Date().toISOString().substring(0, 10),
    blNumber: 'SENDNB2606060',
    salesPerson: 'Ahmad Khan',
    downPayment: 0,
    bankName: 'Meezan Bank Ltd',
    bankDetails: 'IBAN: PK88MEZN0001099238',
    chequeRef: ''
  }
}

// ── Modal: Sales Return & Restock ─────────────────────────────
const showReturnModal = ref(false)
const returnForm = ref({
  invoiceNo: '',
  customer: '',
  branch: 'Peshawar',
  selectedSerials: [],
  manualSerial: '',
  refundAmount: 0,
  payoutRefund: true,
  paymentMethod: 'Cash Payment',
  reason: 'Customer Equipment Return'
})

const eligibleReturnSerials = computed(() => {
  const cName = returnForm.value.customer?.trim().toLowerCase()
  const invNo = returnForm.value.invoiceNo?.trim()

  return (dataStore.serials || []).filter(s => {
    if (s.status !== 'Sold') return false
    if (invNo && s.invoiceNo === invNo) return true
    if (cName && s.customer && s.customer.trim().toLowerCase() === cName) return true
    return false
  })
})

function openReturnModal(inv = null) {
  if (inv) {
    returnForm.value.invoiceNo = inv.invoiceNo
    returnForm.value.customer = inv.customer
    returnForm.value.branch = inv.branch || 'Peshawar'
    const invSerials = []
    inv.items?.forEach(it => {
      if (it.serials) invSerials.push(...it.serials)
    })
    returnForm.value.selectedSerials = invSerials
    returnForm.value.refundAmount = inv.grandTotal || 0
  } else {
    returnForm.value.invoiceNo = ''
    returnForm.value.customer = ''
    returnForm.value.branch = 'Peshawar'
    returnForm.value.selectedSerials = []
    returnForm.value.refundAmount = 0
  }
  returnForm.value.payoutRefund = true
  returnForm.value.reason = 'Customer Equipment Return'
  showReturnModal.value = true
}

function onReturnInvoiceSelect() {
  const inv = dataStore.salesInvoices.find(i => i.invoiceNo === returnForm.value.invoiceNo)
  if (inv) {
    returnForm.value.customer = inv.customer
    returnForm.value.branch = inv.branch || 'Peshawar'
    const invSerials = []
    inv.items?.forEach(it => {
      if (it.serials) invSerials.push(...it.serials)
    })
    returnForm.value.selectedSerials = invSerials
    returnForm.value.refundAmount = inv.grandTotal || 0
  } else {
    returnForm.value.selectedSerials = []
    returnForm.value.refundAmount = 0
  }
}

function calculateReturnRefund() {
  let total = 0
  returnForm.value.selectedSerials.forEach(sCode => {
    const s = dataStore.serials.find(x => x.serialCode === sCode)
    if (s) total += Number(s.salePrice || 0)
  })
  if (total > 0) returnForm.value.refundAmount = total
}

async function handleProcessReturn() {
  if (!returnForm.value.customer) {
    uiStore.showModal('Validation Error', 'Please specify a customer name.', 'warning')
    return
  }

  const serialsToReturn = [...returnForm.value.selectedSerials]
  if (serialsToReturn.length === 0 && returnForm.value.manualSerial) {
    serialsToReturn.push(returnForm.value.manualSerial.trim())
  }

  if (serialsToReturn.length === 0) {
    uiStore.showModal('Validation Error', 'Please select or enter at least one machine serial to return.', 'warning')
    return
  }

  const resReturn = await dataStore.processSalesReturn({
    invoiceNo: returnForm.value.invoiceNo || 'DIRECT-RET',
    customer: returnForm.value.customer,
    branch: returnForm.value.branch,
    serials: serialsToReturn.map(s => ({
      serialCode: s,
      refundAmount: returnForm.value.refundAmount / serialsToReturn.length
    })),
    totalRefundAmount: returnForm.value.refundAmount,
    reason: returnForm.value.reason,
    payoutRefund: returnForm.value.payoutRefund,
    paymentMethod: returnForm.value.paymentMethod
  }, authStore.user)

  uiStore.showModal(
    'Return Processed Successfully',
    `Return Invoice ${resReturn.returnNo} has been generated. ${serialsToReturn.length} machine unit(s) restocked to Available status in inventory.`,
    'success'
  )

  showReturnModal.value = false
}
</script>

<style scoped>
.sales-sort-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.15rem;
  padding: 0 0.5rem 0 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.sales-sort-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.sales-select {
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

.sales-toggle-group {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.sales-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.6rem;
  height: calc(2.15rem - 4px);
  border: none;
  background: transparent;
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  transition: var(--transition-fast);
}

.sales-toggle-btn:hover {
  color: var(--text-main);
}

.sales-toggle-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .sales-sort-wrapper,
[data-theme="light"] .sales-toggle-group {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
}

[data-theme="light"] .sales-select {
  color: #0f172a !important;
}

[data-theme="light"] .sales-toggle-btn {
  color: #475569;
}

[data-theme="light"] .sales-toggle-btn.active {
  background: #4f46e5;
  color: #ffffff;
}
</style>

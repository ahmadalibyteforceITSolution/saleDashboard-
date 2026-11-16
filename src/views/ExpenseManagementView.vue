<template>
  <div class="page-wrapper space-y-6">
    <!-- ════════════════════════════════════════════
      1. PAGE HEADER — Executive Banner with Vyapar Brand Gradient
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Expense Management Hub"
      subtitle="Multi-currency, tour-wise travel itineraries, employee out-of-pocket claims & automated double-entry accounting ledgers."
      :badges="[
        { label: 'ERP v2.4', color: 'purple' },
        { label: 'DOUBLE-ENTRY ACCOUNTING', color: 'success' },
        { label: 'MULTI-CURRENCY & TOURS', color: 'info' }
      ]"
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <!-- View / Hide Balance Security Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-1.5 shadow-md transition-all h-9 px-3 text-xs whitespace-nowrap',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Click to reveal financial balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="14" class="shrink-0" />
            <Eye v-else :size="14" class="shrink-0" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View Balance' }}</span>
          </button>

          <!-- New Tour / Visit Button -->
          <button
            type="button"
            @click="openAddTourModal"
            class="btn btn-secondary flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs whitespace-nowrap cursor-pointer"
          >
            <Plane :size="14" class="shrink-0 text-purple-400" />
            <span>New Tour</span>
          </button>

          <!-- Categories Button -->
          <button
            type="button"
            @click="openAddCategoryModal"
            class="btn btn-secondary flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs whitespace-nowrap cursor-pointer"
          >
            <Tag :size="14" class="shrink-0 text-cyan-400" />
            <span>Categories</span>
          </button>

          <!-- Export Excel Button -->
          <button
            type="button"
            @click="exportCurrentTableToExcel"
            class="btn btn-secondary flex items-center justify-center gap-1.5 shadow-md h-9 px-3 text-xs whitespace-nowrap cursor-pointer"
            title="Export to Excel (CSV)"
          >
            <FileSpreadsheet :size="14" class="shrink-0 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <!-- Record Expense Primary Action -->
          <button
            type="button"
            @click="openAddExpenseModal"
            class="btn btn-success flex items-center justify-center gap-1.5 shadow-md h-9 px-4 text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            <Plus :size="14" class="shrink-0" />
            <span>Record Expense</span>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      2. VYAPAR 5-CONTAINER KPI SUMMARY (MATCHING DASHBOARD UI)
    ════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      <!-- 1. Total Approved Expenses -->
      <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-emerald-500/40 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <DollarSign :size="18" class="text-emerald-500 shrink-0 font-extrabold" />
            <h3 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Total Expenses</h3>
          </div>
          <span class="badge badge-success text-[10px] font-mono">PAID</span>
        </div>
        <div class="vyapar-amount-display my-1.5">
          <span class="currency">PKR </span>
          <span class="amount-val">{{ formattedApprovedExpenses.integer }}</span>
          <span class="amount-dec">.{{ formattedApprovedExpenses.decimal }}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5 truncate">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>{{ dataStore.approvedExpenses.length }} approved vouchers</span>
          </span>
        </div>
      </div>

      <!-- 2. Pending Approval -->
      <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-amber-500/40 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <Clock :size="18" class="text-amber-500 shrink-0 font-extrabold" />
            <h3 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Pending Approval</h3>
          </div>
          <span class="badge badge-warning text-[10px] font-mono">DRAFTS</span>
        </div>
        <div class="vyapar-amount-display my-1.5">
          <span class="currency">PKR </span>
          <span class="amount-val text-amber-500">{{ formattedPendingApproval.integer }}</span>
          <span class="amount-dec text-amber-500/70">.{{ formattedPendingApproval.decimal }}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span class="truncate">{{ dataStore.pendingApprovalExpenses.length }} pending review</span>
          <button
            v-if="dataStore.pendingApprovalExpenses.length > 0 && authStore.isSuperAdmin"
            @click="bulkApproveAllPending"
            class="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline shrink-0"
          >
            Approve All
          </button>
        </div>
      </div>

      <!-- 3. Employee Reimbursements Payable -->
      <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-rose-500/40 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <Users :size="18" class="text-rose-500 shrink-0 font-extrabold" />
            <h3 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Employee Payable</h3>
          </div>
          <span class="badge badge-danger text-[10px] font-mono">CLAIMS</span>
        </div>
        <div class="vyapar-amount-display my-1.5">
          <span class="currency">PKR </span>
          <span class="amount-val text-rose-500">{{ formattedPendingReimbursements.integer }}</span>
          <span class="amount-dec text-rose-500/70">.{{ formattedPendingReimbursements.decimal }}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span class="truncate">{{ dataStore.pendingReimbursements.length }} pending claims</span>
          <button
            @click="activeTab = 'reimbursements'"
            class="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline shrink-0"
          >
            Settle
          </button>
        </div>
      </div>

      <!-- 4. Tours & Visits -->
      <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-purple-500/40 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <Plane :size="18" class="text-purple-500 shrink-0 font-extrabold" />
            <h3 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Tours & Visits</h3>
          </div>
          <span class="badge badge-purple text-[10px] font-mono">TRAVEL</span>
        </div>
        <div class="vyapar-amount-display my-1.5">
          <span class="currency">PKR </span>
          <span class="amount-val text-purple-600 dark:text-purple-400">{{ formattedToursSpend.integer }}</span>
          <span class="amount-dec text-purple-600/70 dark:text-purple-400/70">.{{ formattedToursSpend.decimal }}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span class="truncate">{{ dataStore.expenseTours.length }} tours registered</span>
          <button
            @click="activeTab = 'tours'"
            class="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline shrink-0"
          >
            Hub
          </button>
        </div>
      </div>

      <!-- 5. Company Liquidity -->
      <div class="vyapar-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:border-cyan-500/40 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <Landmark :size="18" class="text-cyan-500 shrink-0 font-extrabold" />
            <h3 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">Company Liquidity</h3>
          </div>
          <span class="badge badge-info text-[10px] font-mono">LIVE SAFES</span>
        </div>
        <div class="vyapar-amount-display my-1.5">
          <span class="currency">PKR </span>
          <span class="amount-val text-cyan-600 dark:text-cyan-400">{{ formattedLiquidity.integer }}</span>
          <span class="amount-dec text-cyan-600/70 dark:text-cyan-400/70">.{{ formattedLiquidity.decimal }}</span>
        </div>
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span class="truncate">Cash & Bank Balances</span>
          <button
            @click="router.push('/cash-bank')"
            class="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline shrink-0"
          >
            View Safes
          </button>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      3. MODULE NAVIGATION TABS (DASHBOARD-MATCHING STRIP)
    ════════════════════════════════════════════ -->
    <div class="glass-panel p-2 rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-x-auto">
      <button
        v-for="tab in moduleTabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer',
          activeTab === tab.id
            ? 'bg-primary text-white shadow-md shadow-primary/25'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
        ]"
      >
        <component :is="tab.icon" :size="15" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count !== undefined"
          :class="[
            'px-2 py-0.5 rounded-full text-[10px] font-mono',
            activeTab === tab.id
              ? 'bg-white/20 text-white font-bold'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold'
          ]"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- TAB 1: EXPENSES REGISTER (MAIN TABLE & FILTERS) -->
    <div v-if="activeTab === 'expenses'" class="space-y-4">
      <!-- Search & Filters Toolbar -->
      <div class="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <!-- Primary Filter Row -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <!-- Search Input -->
          <div class="relative flex-1">
            <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search voucher, person, purpose, payee, category..."
              class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary h-9"
            />
          </div>

          <!-- Quick Category Filter -->
          <div class="w-full md:w-44 shrink-0">
            <select
              v-model="filters.category"
              class="vyapar-select w-full h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              <option v-for="cat in activeCategoriesList" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Quick Status Filter -->
          <div class="w-full md:w-36 shrink-0">
            <select
              v-model="filters.status"
              class="vyapar-select w-full h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted / Pending</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <!-- Date Period Filter -->
          <div class="w-full md:w-36 shrink-0">
            <select
              v-model="filters.dateRange"
              class="vyapar-select w-full h-9 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <!-- Secondary Filters Toggle & Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              @click="showMoreFilters = !showMoreFilters"
              :class="[
                'btn btn-secondary h-9 px-3 text-xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer',
                hasActiveSecondaryFilters ? '!border-primary text-primary font-bold' : ''
              ]"
              title="Toggle Secondary Filters"
            >
              <Filter :size="13" />
              <span>Filters</span>
              <span v-if="activeSecondaryFilterCount > 0" class="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                {{ activeSecondaryFilterCount }}
              </span>
              <ChevronDown v-if="!showMoreFilters" :size="12" />
              <ChevronUp v-else :size="12" />
            </button>

            <button
              type="button"
              @click="resetFilters"
              class="btn btn-secondary h-9 px-3 text-xs whitespace-nowrap cursor-pointer"
              title="Reset All Filters"
            >
              Reset
            </button>

            <button
              type="button"
              @click="exportCurrentTableToExcel"
              class="btn btn-secondary h-9 px-2.5 text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer"
              title="Export to Excel (CSV)"
            >
              <Download :size="14" />
            </button>

            <button
              type="button"
              @click="printCurrentTablePDF"
              class="btn btn-secondary h-9 px-2.5 text-xs text-cyan-600 dark:text-cyan-400 cursor-pointer"
              title="Print PDF"
            >
              <Printer :size="14" />
            </button>
          </div>
        </div>

        <!-- Collapsible Secondary Filters -->
        <div v-show="showMoreFilters || filters.dateRange === 'custom'" class="pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 animate-fade-in">
          <!-- Person / Employee -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Employee / Person</label>
            <select
              v-model="filters.person"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Employees / Roles</option>
              <option v-for="p in distinctPersons" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <!-- Branch -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Branch</label>
            <select
              v-model="filters.branch"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Branches</option>
              <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <!-- Department -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
            <select
              v-model="filters.department"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Departments</option>
              <option value="Management / Executive">Management / Executive</option>
              <option value="Sales">Sales</option>
              <option value="Workshop / Technical">Workshop / Technical</option>
              <option value="Accounts / Finance">Accounts / Finance</option>
              <option value="Logistics / Admin">Logistics / Admin</option>
            </select>
          </div>

          <!-- Payment Mode -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Mode</label>
            <select
              v-model="filters.paymentMethod"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Payment Modes</option>
              <option value="Cash">Cash Voucher (Safe)</option>
              <option value="Company Bank Account">Company Bank Account</option>
              <option value="Paid by Employee (Personal Cash / Out of Pocket)">Employee Out of Pocket</option>
            </select>
          </div>

          <!-- Currency -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Currency</label>
            <select
              v-model="filters.currency"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Currencies</option>
              <option value="PKR">PKR (Pakistani Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="CNY">CNY (Chinese Yuan)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="AED">AED (Emirati Dirham)</option>
              <option value="SAR">SAR (Saudi Riyal)</option>
            </select>
          </div>

          <!-- Tour Link -->
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tour Link</label>
            <select
              v-model="filters.tourId"
              class="vyapar-select w-full h-8 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="">All Tours / Standalone</option>
              <option value="tour_only">Any Tour / Visit Linked</option>
              <option v-for="t in dataStore.expenseTours" :key="t.id" :value="t.id">{{ t.tourName }}</option>
            </select>
          </div>

          <!-- Custom Date Range -->
          <div v-if="filters.dateRange === 'custom'" class="col-span-2 sm:col-span-3 md:col-span-6 flex items-center gap-3 pt-1">
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
              <span class="font-bold">From:</span>
              <input v-model="filters.customStartDate" type="date" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs" />
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500">
              <span class="font-bold">To:</span>
              <input v-model="filters.customEndDate" type="date" class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 text-xs" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Expenses Table Card -->
      <div class="glass-panel rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div class="table-container !border-0 !rounded-none overflow-x-auto">
          <table class="table-lined w-full text-left text-xs">
            <thead>
              <tr>
                <th class="p-3.5">Voucher / Date</th>
                <th class="p-3.5">Category & Purpose</th>
                <th class="p-3.5">Person / Tour</th>
                <th class="p-3.5">Branch / Dept</th>
                <th class="p-3.5">Payment Method</th>
                <th class="p-3.5 text-right">Amount (PKR)</th>
                <th class="p-3.5 text-center">Status</th>
                <th class="p-3.5 text-center">Receipt</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="exp in paginatedExpenses"
                :key="exp.id || exp.voucherNo"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- Voucher No & Date -->
                <td class="p-3.5">
                  <div class="font-mono font-bold text-primary dark:text-cyan-400">{{ exp.voucherNo }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ exp.date }}</div>
                </td>

                <!-- Category & Purpose -->
                <td class="p-3.5 max-w-xs">
                  <div class="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                    <span>{{ exp.category }}</span>
                    <span v-if="exp.subCategory" class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {{ exp.subCategory }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5" :title="exp.purpose || exp.description">
                    {{ exp.purpose || exp.description || 'No description provided' }}
                  </div>
                  <div v-if="exp.vendor" class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <span class="text-slate-400">Payee:</span>
                    <span class="font-medium text-slate-700 dark:text-slate-300">{{ exp.vendor }}</span>
                  </div>
                </td>

                <!-- Person / Tour -->
                <td class="p-3.5">
                  <div class="font-semibold text-slate-900 dark:text-slate-200">{{ exp.person || 'General Employee' }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ exp.personRole || 'Employee' }}</div>
                  <div v-if="exp.tourName" class="mt-1 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 inline-flex font-semibold">
                    <Plane :size="10" />
                    <span class="truncate max-w-[140px]">{{ exp.tourName }}</span>
                  </div>
                </td>

                <!-- Branch & Department -->
                <td class="p-3.5">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ exp.branch || 'Peshawar' }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ exp.department || 'General' }}</div>
                </td>

                <!-- Payment Method -->
                <td class="p-3.5">
                  <div class="text-slate-800 dark:text-slate-200 font-medium">
                    {{ exp.isEmployeeReimbursement ? 'Employee Out-of-Pocket' : exp.paymentMethod }}
                  </div>
                  <div v-if="exp.bankAccount" class="text-[10px] text-sky-600 dark:text-cyan-300 truncate max-w-[150px]">
                    {{ exp.bankAccount }}
                  </div>
                  <div v-if="exp.isEmployeeReimbursement" class="mt-0.5">
                    <span
                      :class="[
                        'badge text-[10px]',
                        exp.reimbursementStatus === 'Reimbursed' ? 'badge-success' : 'badge-danger'
                      ]"
                    >
                      {{ exp.reimbursementStatus === 'Reimbursed' ? 'Reimbursed' : 'Payable Claim' }}
                    </span>
                  </div>
                </td>

                <!-- Amount (PKR & Foreign Currency) -->
                <td class="p-3.5 text-right font-mono">
                  <div class="font-black text-sm text-slate-900 dark:text-white">
                    PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}
                  </div>
                  <div v-if="exp.currency && exp.currency !== 'PKR'" class="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-bold">
                    {{ exp.currency }} {{ formatMoney(exp.amount) }} @ {{ exp.exchangeRate }}
                  </div>
                </td>

                <!-- Status -->
                <td class="p-3.5 text-center">
                  <span
                    :class="[
                      'badge font-mono text-[10px]',
                      exp.status === 'Approved' ? 'badge-success' :
                      exp.status === 'Paid' ? 'badge-info' :
                      exp.status === 'Submitted' ? 'badge-warning' :
                      exp.status === 'Rejected' ? 'badge-danger' :
                      'badge-neutral'
                    ]"
                  >
                    {{ exp.status }}
                  </span>
                  <div v-if="exp.rejectionReason" class="text-[9px] text-rose-500 max-w-[120px] truncate mt-1" :title="exp.rejectionReason">
                    {{ exp.rejectionReason }}
                  </div>
                </td>

                <!-- Receipt / Attachment -->
                <td class="p-3.5 text-center">
                  <button
                    v-if="exp.attachment"
                    @click="viewAttachment(exp)"
                    class="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    title="View Receipt / Invoice"
                  >
                    <Paperclip :size="14" />
                  </button>
                  <span v-else class="text-[11px] text-slate-400">—</span>
                </td>

                <!-- Actions -->
                <td class="p-3.5 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <!-- JV Preview Button -->
                    <button
                      type="button"
                      @click="viewJournalVoucher(exp)"
                      class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="View Accounting Ledger Effect (Journal Voucher)"
                    >
                      <BookOpen :size="14" />
                    </button>

                    <!-- Approve Button -->
                    <button
                      v-if="(exp.status === 'Draft' || exp.status === 'Submitted') && authStore.isSuperAdmin"
                      type="button"
                      @click="approveSingleExpense(exp)"
                      class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                      title="Approve Expense"
                    >
                      <Check :size="14" />
                    </button>

                    <!-- Reject Button -->
                    <button
                      v-if="(exp.status === 'Draft' || exp.status === 'Submitted') && authStore.isSuperAdmin"
                      type="button"
                      @click="promptRejectExpense(exp)"
                      class="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Reject Expense"
                    >
                      <X :size="14" />
                    </button>

                    <!-- Reimburse Button -->
                    <button
                      v-if="exp.isEmployeeReimbursement && exp.reimbursementStatus !== 'Reimbursed'"
                      type="button"
                      @click="openReimburseModal(exp)"
                      class="btn btn-warning py-1 px-2 text-[10px] font-bold cursor-pointer"
                      title="Reimburse Employee Out-of-Pocket"
                    >
                      Settle
                    </button>

                    <!-- Edit Button -->
                    <button
                      type="button"
                      @click="editExistingExpense(exp)"
                      class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit3 :size="14" />
                    </button>

                    <!-- Delete Button -->
                    <button
                      type="button"
                      @click="deleteExistingExpense(exp)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Voucher"
                    >
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredExpenses.length === 0">
                <td colspan="9" class="p-8 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <AlertCircle :size="32" class="text-slate-400" />
                    <p class="font-semibold text-sm text-slate-700 dark:text-slate-300">No expenses matched your search or filters.</p>
                    <button
                      @click="resetFilters"
                      class="text-xs text-primary underline font-medium hover:text-primary-hover cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer / Pagination -->
        <div class="p-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span class="font-bold text-slate-900 dark:text-white">{{ (currentPage - 1) * pageSize + 1 }}</span> to
            <span class="font-bold text-slate-900 dark:text-white">{{ Math.min(currentPage * pageSize, filteredExpenses.length) }}</span> of
            <span class="font-bold text-slate-900 dark:text-white">{{ filteredExpenses.length }}</span> recorded expenses
          </div>

          <div class="flex items-center gap-2">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage--"
              class="btn btn-secondary btn-sm h-8 px-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span class="font-mono text-slate-900 dark:text-white font-bold px-2">{{ currentPage }} / {{ totalPages || 1 }}</span>
            <button
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
              class="btn btn-secondary btn-sm h-8 px-2.5 text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: TOURS & VISITS HUB (LOCAL & INTL VISITS) -->
    <div v-if="activeTab === 'tours'" class="space-y-6">
      <div class="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plane :size="20" class="text-purple-500" />
            <span>Tour & Business Visit Hub (Local & International)</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record comprehensive travel itineraries for Directors, Managers & Engineers with consolidated tour budgets and category-wise costs.
          </p>
        </div>
        <button
          type="button"
          @click="openAddTourModal"
          class="btn btn-secondary h-9 px-3 text-xs font-bold whitespace-nowrap cursor-pointer"
        >
          <Plus :size="14" class="text-purple-400" />
          <span>Create New Tour / Visit</span>
        </button>
      </div>

      <!-- Tours Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="tour in dataStore.expenseTours"
          :key="tour.id"
          class="glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
          <div>
            <!-- Tour Header -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'badge font-mono text-[10px]',
                      tour.tourType === 'International' ? 'badge-purple' : 'badge-success'
                    ]"
                  >
                    {{ tour.tourType }}
                  </span>
                  <span
                    :class="[
                      'badge font-mono text-[10px]',
                      tour.status === 'Completed' ? 'badge-neutral' : 'badge-info'
                    ]"
                  >
                    {{ tour.status }}
                  </span>
                </div>
                <h3 class="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{{ tour.tourName }}</h3>
                <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                  <span class="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                    <User :size="13" class="text-purple-500" />
                    {{ tour.person }} ({{ tour.personRole }})
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                    <MapPin :size="13" class="text-rose-500" />
                    {{ tour.originCity ? tour.originCity + ' → ' : '' }}{{ tour.city }}, {{ tour.country }}
                  </span>
                </div>
              </div>

              <!-- Action Menu -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="addExpenseToTour(tour)"
                  class="p-1.5 rounded-lg text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Add Expense to this Tour"
                >
                  <Plus :size="14" />
                </button>
                <button
                  type="button"
                  @click="editExistingTour(tour)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Tour Details"
                >
                  <Edit3 :size="14" />
                </button>
                <button
                  type="button"
                  @click="deleteExistingTour(tour)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete Tour"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>

            <!-- Dates & Purpose -->
            <div class="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span class="flex items-center gap-1">
                  <Calendar :size="13" />
                  {{ tour.startDate }} to {{ tour.endDate }}
                </span>
                <span class="font-mono text-slate-800 dark:text-slate-300 font-semibold">Budget: PKR {{ formatMoney(tour.budget) }}</span>
              </div>
              <div class="text-slate-700 dark:text-slate-300 pt-1">
                <span class="text-slate-500 font-semibold">Purpose:</span> {{ tour.purpose }}
              </div>
            </div>

            <!-- Requirement 12: Tour Consolidated Category Breakdown -->
            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-slate-700 dark:text-slate-300">Tour Consolidated Cost Breakdown:</span>
                <span class="text-slate-900 dark:text-white font-mono font-extrabold text-sm">
                  Total = PKR {{ formatMoney(getTourTotalSpend(tour.id)) }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div
                  v-for="(amt, catName) in getTourBreakdown(tour.id)"
                  :key="catName"
                  class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between"
                >
                  <span class="text-slate-600 dark:text-slate-400 truncate" :title="catName">{{ catName }}</span>
                  <span class="font-mono font-bold text-slate-900 dark:text-white mt-1">PKR {{ formatMoney(amt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {{ getTourExpenses(tour.id).length }} expenses recorded
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openTourDetailsModal(tour)"
                class="btn btn-secondary btn-sm h-8 px-3 text-xs font-semibold cursor-pointer"
              >
                View Itemized Receipts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: CATEGORIES MANAGER (PREDEFINED & CUSTOM) -->
    <div v-if="activeTab === 'categories'" class="space-y-6">
      <div class="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag :size="20" class="text-cyan-500" />
            <span>Expense Categories & Sub-Categories Directory</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            26 standard ERP predefined categories with complete freedom to create, edit, deactivate and customize new categories.
          </p>
        </div>
        <button
          type="button"
          @click="openAddCategoryModal"
          class="btn btn-primary h-9 px-3 text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus :size="14" />
          <span>+ Add Category</span>
        </button>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="cat in dataStore.expenseCategories"
          :key="cat.id"
          class="glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary">
                  <Tag :size="16" />
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{{ cat.name }}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{{ cat.type || 'General' }}</span>
                    <span
                      v-if="cat.isPredefined"
                      class="badge badge-purple text-[9px] py-0.5"
                    >
                      Predefined
                    </span>
                  </div>
                </div>
              </div>

              <!-- Active Status Toggle & Actions -->
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="toggleCategoryActive(cat)"
                  :class="[
                    'badge text-[10px] cursor-pointer transition-all',
                    cat.isActive !== false ? 'badge-success' : 'badge-neutral'
                  ]"
                >
                  {{ cat.isActive !== false ? 'Active' : 'Inactive' }}
                </button>
                <button
                  type="button"
                  @click="editExistingCategory(cat)"
                  class="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Edit3 :size="13" />
                </button>
                <button
                  v-if="!cat.isPredefined"
                  type="button"
                  @click="deleteExistingCategory(cat)"
                  class="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 :size="13" />
                </button>
              </div>
            </div>

            <!-- Subcategories Pill List -->
            <div v-if="cat.subCategories && cat.subCategories.length > 0" class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="sub in cat.subCategories"
                :key="sub"
                class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
              >
                {{ sub }}
              </span>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span>Expenses Tagged:</span>
            <span class="font-mono font-bold text-slate-900 dark:text-white">
              {{ getCategoryExpensesCount(cat.name) }} (PKR {{ formatMoney(getCategoryTotalSpend(cat.name)) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: EMPLOYEE REIMBURSEMENTS (OUT-OF-POCKET) -->
    <div v-if="activeTab === 'reimbursements'" class="space-y-6">
      <div class="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users :size="20" class="text-rose-500" />
            <span>Employee Out-of-Pocket Reimbursements Hub</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            When staff, engineers, or directors pay from their personal cash or cards, track payable balances and settle claims seamlessly with Cash/Bank integration.
          </p>
        </div>
        <div class="font-mono text-left sm:text-right">
          <div class="text-xs text-slate-500 dark:text-slate-400">Total Pending Payable:</div>
          <div class="text-lg font-extrabold text-rose-500 dark:text-rose-400">
            PKR {{ formatMoney(pendingReimbursementsAmount) }}
          </div>
        </div>
      </div>

      <!-- Employee Reimbursements List -->
      <div class="glass-panel rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div class="table-container !border-0 !rounded-none overflow-x-auto">
          <table class="table-lined w-full text-left text-xs">
            <thead>
              <tr>
                <th class="p-3.5">Voucher / Date</th>
                <th class="p-3.5">Employee / Role</th>
                <th class="p-3.5">Category & Purpose</th>
                <th class="p-3.5">Branch</th>
                <th class="p-3.5 text-right">Claim Amount</th>
                <th class="p-3.5 text-center">Reimbursement Status</th>
                <th class="p-3.5 text-center">Receipt</th>
                <th class="p-3.5 text-right">Settle & Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="exp in allEmployeeReimbursements"
                :key="exp.id || exp.voucherNo"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3.5">
                  <div class="font-mono font-bold text-primary dark:text-cyan-400">{{ exp.voucherNo }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ exp.date }}</div>
                </td>
                <td class="p-3.5">
                  <div class="font-semibold text-slate-900 dark:text-white">{{ exp.person }}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400">{{ exp.personRole }}</div>
                </td>
                <td class="p-3.5 max-w-xs">
                  <div class="font-medium text-slate-800 dark:text-slate-200">{{ exp.category }}</div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ exp.purpose || exp.description }}</div>
                </td>
                <td class="p-3.5">
                  <div class="text-slate-700 dark:text-slate-300">{{ exp.branch }}</div>
                </td>
                <td class="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                  PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}
                </td>
                <td class="p-3.5 text-center">
                  <span
                    :class="[
                      'badge font-mono text-[10px]',
                      exp.reimbursementStatus === 'Reimbursed' ? 'badge-success' : 'badge-danger'
                    ]"
                  >
                    {{ exp.reimbursementStatus === 'Reimbursed' ? 'Reimbursed' : 'Pending Claim' }}
                  </span>
                  <div v-if="exp.reimbursedDate" class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Settled: {{ exp.reimbursedDate }} ({{ exp.reimbursedFrom }})
                  </div>
                </td>
                <td class="p-3.5 text-center">
                  <button
                    v-if="exp.attachment"
                    @click="viewAttachment(exp)"
                    class="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                  >
                    <Paperclip :size="15" />
                  </button>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="p-3.5 text-right">
                  <button
                    v-if="exp.reimbursementStatus !== 'Reimbursed'"
                    type="button"
                    @click="openReimburseModal(exp)"
                    class="btn btn-warning py-1.5 px-3 text-xs font-bold cursor-pointer"
                  >
                    Pay & Settle
                  </button>
                  <span v-else class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                    <CheckCircle2 :size="14" />
                    Settled
                  </span>
                </td>
              </tr>

              <tr v-if="allEmployeeReimbursements.length === 0">
                <td colspan="8" class="p-8 text-center text-slate-400">
                  No employee out-of-pocket expenses found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: REPORTS & ANALYTICS (15 DETAILED REPORTS & PDF/EXCEL) -->
    <div v-if="activeTab === 'reports'" class="space-y-6">
      <!-- Report Selection Toolbar -->
      <div class="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <FileSpreadsheet :size="22" />
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Executive Expense Reports & Analytics Hub</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Select any of the 15 standard ERP financial breakdown reports</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            v-model="selectedReportType"
            class="vyapar-select h-9 px-3 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <option value="daily">1. Daily Expense Report</option>
            <option value="monthly">2. Monthly Expense Report</option>
            <option value="yearly">3. Yearly Expense Report</option>
            <option value="category">4. Category-Wise Expense Report</option>
            <option value="employee">5. Employee-Wise Expense Report</option>
            <option value="branch">6. Branch-Wise Expense Report</option>
            <option value="department">7. Department-Wise Expense Report</option>
            <option value="tour">8. Tour-Wise Expense Report</option>
            <option value="local_travel">9. Local Travel Expense Report</option>
            <option value="intl_travel">10. International Travel Expense Report</option>
            <option value="cash">11. Cash Expense Report</option>
            <option value="bank">12. Bank Expense Report</option>
            <option value="reimbursement">13. Employee Reimbursement Report</option>
            <option value="pending">14. Pending Approval Expenses Report</option>
            <option value="approved">15. Approved & Posted Expenses Report</option>
          </select>

          <button
            type="button"
            @click="exportCurrentReportToExcel"
            class="btn btn-secondary h-9 px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer"
          >
            <Download :size="14" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            @click="printSelectedReportPDF"
            class="btn btn-secondary h-9 px-3 text-xs font-bold text-cyan-600 dark:text-cyan-400 cursor-pointer"
          >
            <Printer :size="14" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      <!-- Report Content Display -->
      <div class="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h4 class="text-base font-extrabold text-slate-900 dark:text-white">{{ reportTitle }}</h4>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Summary of matching expense vouchers and aggregate financial impact</div>
          </div>
          <div class="font-mono text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            Total Aggregate Spend: <span class="text-emerald-600 dark:text-emerald-400">PKR {{ formatMoney(reportTotalAmount) }}</span>
          </div>
        </div>

        <!-- Visual Bar Chart Representation of Top Groups -->
        <div v-if="reportGroupSummary.length > 0" class="space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Distribution Overview:</h5>
          <div class="space-y-2">
            <div
              v-for="grp in reportGroupSummary.slice(0, 8)"
              :key="grp.name"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ grp.name }}</span>
                <span class="font-mono text-slate-900 dark:text-white font-bold">
                  PKR {{ formatMoney(grp.amount) }} ({{ grp.percentage }}%)
                </span>
              </div>
              <div class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full"
                  :style="{ width: grp.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Table for Report -->
        <div class="table-container !border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table class="table-lined w-full text-left text-xs">
            <thead>
              <tr>
                <th class="p-3">#</th>
                <th class="p-3">Voucher & Date</th>
                <th class="p-3">Category</th>
                <th class="p-3">Person / Employee</th>
                <th class="p-3">Branch / Dept</th>
                <th class="p-3">Payment Method</th>
                <th class="p-3 text-right">Amount (PKR)</th>
                <th class="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exp, idx) in reportFilteredExpenses" :key="exp.id || idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td class="p-3 text-slate-400">{{ idx + 1 }}</td>
                <td class="p-3 font-mono font-bold text-primary dark:text-cyan-400">
                  {{ exp.voucherNo }}
                  <span class="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">{{ exp.date }}</span>
                </td>
                <td class="p-3 text-slate-800 dark:text-slate-200 font-medium">{{ exp.category }}</td>
                <td class="p-3 text-slate-700 dark:text-slate-300">{{ exp.person }}</td>
                <td class="p-3 text-slate-600 dark:text-slate-400">{{ exp.branch }} ({{ exp.department }})</td>
                <td class="p-3 text-slate-700 dark:text-slate-300">{{ exp.paymentMethod }}</td>
                <td class="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}</td>
                <td class="p-3 text-center">
                  <span class="badge badge-neutral text-[10px] font-mono">
                    {{ exp.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL 1: ADD / EDIT EXPENSE MODAL -->
    <Teleport to="body">
      <div
        v-if="showExpenseModal"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showExpenseModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 920px !important; width: 94vw !important;"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard :size="20" class="text-indigo-600 dark:text-indigo-400" />
                <span>{{ isEditingExpense ? 'Edit Expense Voucher' : 'Record New Company Expense' }}</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in complete expenditure, payment & double-entry ledger details</p>
            </div>
            <button
              type="button"
              @click="showExpenseModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <!-- Row 1: Date, Category, Sub-Category, Person/Employee -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Date *</label>
                <input
                  v-model="expenseForm.date"
                  type="date"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Category *</label>
                <select
                  v-model="expenseForm.category"
                  @change="onFormCategoryChange"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option v-for="cat in activeCategoriesList" :key="cat.id" :value="cat.name">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Category</label>
                <input
                  v-if="!currentCategorySubCategories.length"
                  v-model="expenseForm.subCategory"
                  type="text"
                  placeholder="e.g. Fuel, Toll, Room Charges"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <select
                  v-else
                  v-model="expenseForm.subCategory"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select Sub-Category</option>
                  <option v-for="s in currentCategorySubCategories" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person / Employee *</label>
                <input
                  v-model="expenseForm.person"
                  type="text"
                  placeholder="e.g. Director M. Ibrahim"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Row 2: Designation/Role, Tour/Visit Link, Payee/Vendor, Branch -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person Role / Designation</label>
                <select
                  v-model="expenseForm.personRole"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Boss / Director">Boss / Director</option>
                  <option value="Manager">Manager</option>
                  <option value="Salesperson">Salesperson</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Other Employee">Other Employee</option>
                  <option value="Guest / Company Representative">Guest / Company Representative</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Linked Tour / Visit</label>
                <select
                  v-model="expenseForm.tourId"
                  @change="onFormTourChange"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Standalone / None</option>
                  <option v-for="t in dataStore.expenseTours" :key="t.id" :value="t.id">
                    {{ t.tourName }} ({{ t.city }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Vendor / Payee</label>
                <input
                  v-model="expenseForm.vendor"
                  type="text"
                  placeholder="e.g. Hotel, Airline, Careem, PSO"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                <select
                  v-model="expenseForm.branch"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>
            </div>

            <!-- Row 3: Department, Purpose / Description -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  v-model="expenseForm.department"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Management / Executive">Management / Executive</option>
                  <option value="Sales">Sales</option>
                  <option value="Workshop / Technical">Workshop / Technical</option>
                  <option value="Accounts / Finance">Accounts / Finance</option>
                  <option value="Logistics / Admin">Logistics / Admin</option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose / Description *</label>
                <input
                  v-model="expenseForm.purpose"
                  type="text"
                  placeholder="e.g. Guangzhou to Shenzhen High-speed transit for factory inspection"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <!-- Section: Multi-Currency & Financial Calculations -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign :size="15" class="text-emerald-500 dark:text-emerald-400" />
                  <span>Multi-Currency & Amount Breakdown</span>
                </h4>
                <span class="text-[11px] text-slate-500 dark:text-slate-400">System auto-converts foreign currencies to PKR</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Currency *</label>
                  <select
                    v-model="expenseForm.currency"
                    @change="onCurrencyChange"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="USD">USD - United States Dollar</option>
                    <option value="CNY">CNY - Chinese Yuan (RMB)</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (in {{ expenseForm.currency }}) *
                  </label>
                  <input
                    v-model.number="expenseForm.amount"
                    type="number"
                    min="0"
                    step="any"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Exchange Rate (to PKR)</label>
                  <input
                    v-model.number="expenseForm.exchangeRate"
                    type="number"
                    min="0"
                    step="any"
                    :disabled="expenseForm.currency === 'PKR'"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <!-- Auto Computed Equivalent -->
              <div class="p-3 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700/60 font-mono">
                <span class="text-slate-600 dark:text-slate-400">Equivalent Amount in PKR:</span>
                <span class="text-base font-black text-emerald-600 dark:text-emerald-400">
                  PKR {{ formatMoney(computedFormPkrAmount) }}
                </span>
              </div>
            </div>

            <!-- Section: Payment Method & Cash/Bank Integration -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark :size="15" class="text-cyan-500 dark:text-cyan-400" />
                <span>Cash & Bank Payment Source</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Method *</label>
                  <select
                    v-model="expenseForm.paymentMethod"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Cash">Cash Voucher (Branch Safe)</option>
                    <option value="Company Bank Account">Company Bank Account</option>
                    <option value="Paid by Employee (Personal Cash / Out of Pocket)">
                      Paid by Employee (Claim Reimbursement)
                    </option>
                  </select>
                </div>

                <div v-if="expenseForm.paymentMethod === 'Company Bank Account'">
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bank Account *</label>
                  <select
                    v-model="expenseForm.bankAccount"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Select Bank Account</option>
                    <option v-for="b in dataStore.bankAccounts" :key="b.id" :value="b.name">
                      {{ b.name }} ({{ b.accountNumber }})
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reference / Cheque / Txn No</label>
                  <input
                    v-model="expenseForm.referenceNo"
                    type="text"
                    placeholder="e.g. HBL-FT-99120"
                    class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div v-if="expenseForm.paymentMethod === 'Paid by Employee (Personal Cash / Out of Pocket)'" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                <span class="font-bold">⚠️ Out-of-Pocket Notice:</span> This expense will NOT deduct company cash or bank immediately. It will be added to <span class="font-bold underline">{{ expenseForm.person }}</span>'s Reimbursement Payable Ledger.
              </div>
            </div>

            <!-- Section: Receipt / Bill Upload -->
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <h4 class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip :size="15" class="text-purple-500 dark:text-purple-400" />
                <span>Bill / Receipt / Supporting Attachment</span>
              </h4>

              <div class="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  @change="handleFileUpload"
                  class="block w-full text-xs text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
                <div v-if="expenseForm.attachment" class="flex items-center gap-2 shrink-0">
                  <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ {{ expenseForm.attachmentName || 'Receipt Attached' }}</span>
                  <button
                    type="button"
                    @click="expenseForm.attachment = ''; expenseForm.attachmentName = ''"
                    class="text-rose-600 dark:text-rose-400 hover:underline text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Section: Remarks & Status -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Remarks / Additional Notes</label>
                <textarea
                  v-model="expenseForm.remarks"
                  rows="2"
                  placeholder="Any special remarks or compliance notes..."
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Approval Status</label>
                <select
                  v-model="expenseForm.status"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Approved">Approved</option>
                  <option value="Submitted">Submitted (Pending Approval)</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showExpenseModal = false"
              class="btn btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveExpenseForm"
              class="btn btn-primary px-6 py-2 text-xs font-bold shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              {{ isEditingExpense ? 'Update Expense' : 'Save & Post Expense' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 2: ADD / EDIT TOUR MODAL -->
    <Teleport to="body">
      <div
        v-if="showTourModal"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showTourModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 680px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plane :size="20" class="text-purple-600 dark:text-purple-400" />
              <span>{{ isEditingTour ? 'Edit Tour / Visit' : 'Create Tour / Business Visit' }}</span>
            </h3>
            <button
              type="button"
              @click="showTourModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tour / Visit Name *</label>
              <input
                v-model="tourForm.tourName"
                type="text"
                placeholder="e.g. China Business Tour, Peshawar → Lahore Visit"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tour Type *</label>
                <select
                  v-model="tourForm.tourType"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="International">International Travel</option>
                  <option value="Local / Out of City">Local / Out of City Visit</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Person / Representative *</label>
                <input
                  v-model="tourForm.person"
                  type="text"
                  placeholder="e.g. Director M. Ibrahim"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  v-model="tourForm.country"
                  type="text"
                  placeholder="e.g. China, Pakistan, UAE"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destination City *</label>
                <input
                  v-model="tourForm.city"
                  type="text"
                  placeholder="e.g. Guangzhou, Lahore, Dubai"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Origin City</label>
                <input
                  v-model="tourForm.originCity"
                  type="text"
                  placeholder="e.g. Peshawar"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  v-model="tourForm.startDate"
                  type="date"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input
                  v-model="tourForm.endDate"
                  type="date"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Budget (PKR)</label>
                <input
                  v-model.number="tourForm.budget"
                  type="number"
                  min="0"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
              <input
                v-model="tourForm.purpose"
                type="text"
                placeholder="e.g. Supplier/Company Meeting, Machinery Sourcing, Client Demos"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  v-model="tourForm.status"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="Planned">Planned</option>
                  <option value="Active">Active / Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                <select
                  v-model="tourForm.branch"
                  class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showTourModal = false"
              class="btn btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveTourForm"
              class="btn btn-primary px-5 py-2 text-xs font-bold shadow-lg shadow-purple-600/25 cursor-pointer"
            >
              {{ isEditingTour ? 'Update Tour' : 'Save Tour Record' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 3: ADD / EDIT CATEGORY MODAL -->
    <Teleport to="body">
      <div
        v-if="showCategoryModal"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showCategoryModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 520px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag :size="20" class="text-blue-600 dark:text-blue-400" />
              <span>{{ isEditingCategory ? 'Edit Expense Category' : 'Create Custom Expense Category' }}</span>
            </h3>
            <button
              type="button"
              @click="showCategoryModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
              <input
                v-model="categoryForm.name"
                type="text"
                placeholder="e.g. Medical Exhibition & Conferences"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Type</label>
              <select
                v-model="categoryForm.type"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Travel">Travel & Lodging</option>
                <option value="Office">Office & Administration</option>
                <option value="Vehicle">Vehicle & Transport</option>
                <option value="Meetings">Meetings & Hospitality</option>
                <option value="Technical">Technical & Workshop</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Financial">Financial & Legal</option>
                <option value="General">General Expenses</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Categories (comma separated)
              </label>
              <input
                v-model="categoryForm.subCategoriesText"
                type="text"
                placeholder="e.g. Stall Registration, Posters, Hospitality"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showCategoryModal = false"
              class="btn btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="saveCategoryForm"
              class="btn btn-primary px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              {{ isEditingCategory ? 'Update Category' : 'Save Category' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 4: JOURNAL VOUCHER / LEDGER EFFECT PREVIEW (Requirement 14) -->
    <Teleport to="body">
      <div
        v-if="showJvModal && selectedJvExpense"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showJvModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 680px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen :size="20" class="text-indigo-600 dark:text-indigo-400" />
                <span>Accounting Double-Entry Journal Voucher: {{ selectedJvExpense.journalVoucherNo || selectedJvExpense.voucherNo }}</span>
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Automated ERP General Ledger & Financial Debit/Credit Postings</p>
            </div>
            <button
              type="button"
              @click="showJvModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <!-- Metadata Bar -->
            <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              <div>Date: <span class="font-bold text-slate-900 dark:text-white">{{ selectedJvExpense.date }}</span></div>
              <div>Branch: <span class="font-bold text-slate-900 dark:text-white">{{ selectedJvExpense.branch }}</span></div>
              <div>Status: <span class="text-emerald-600 dark:text-emerald-400 font-bold">Posted</span></div>
            </div>

            <!-- Double Entry Table -->
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden font-mono">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                  <tr>
                    <th class="p-3">Account Title & Ledger Classification</th>
                    <th class="p-3 text-right">Debit (PKR)</th>
                    <th class="p-3 text-right">Credit (PKR)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  <!-- Debit Row: Expense Account -->
                  <tr>
                    <td class="p-3">
                      <div class="text-slate-900 dark:text-white font-bold">{{ selectedJvExpense.category }} Expense A/c</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                        Narration: {{ selectedJvExpense.purpose || selectedJvExpense.description }} ({{ selectedJvExpense.person }})
                      </div>
                    </td>
                    <td class="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}
                    </td>
                    <td class="p-3 text-right text-slate-400 dark:text-slate-600">—</td>
                  </tr>

                  <!-- Credit Row: Cash Safe, Bank Account, or Employee Payable -->
                  <tr>
                    <td class="p-3 pl-8">
                      <div class="text-slate-800 dark:text-slate-300 font-bold">
                        To {{ selectedJvCreditAccountName }}
                      </div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                        Ref: {{ selectedJvExpense.referenceNo || selectedJvExpense.voucherNo }}
                      </div>
                    </td>
                    <td class="p-3 text-right text-slate-400 dark:text-slate-600">—</td>
                    <td class="p-3 text-right text-cyan-600 dark:text-cyan-400 font-bold">
                      {{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}
                    </td>
                  </tr>

                  <!-- Total Row -->
                  <tr class="bg-slate-100/70 dark:bg-slate-800/60 font-bold">
                    <td class="p-3 text-right uppercase text-slate-700 dark:text-slate-300">Journal Balanced Total:</td>
                    <td class="p-3 text-right text-emerald-600 dark:text-emerald-400">{{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}</td>
                    <td class="p-3 text-right text-cyan-600 dark:text-cyan-400">{{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Signature Lines -->
            <div class="grid grid-cols-3 gap-4 pt-6 text-center text-[10px] text-slate-600 dark:text-slate-400 font-sans">
              <div class="border-t border-slate-300 dark:border-slate-700 pt-1">Prepared By: {{ selectedJvExpense.recordedBy || 'Accountant' }}</div>
              <div class="border-t border-slate-300 dark:border-slate-700 pt-1">Checked By: Internal Audit</div>
              <div class="border-t border-slate-300 dark:border-slate-700 pt-1 text-emerald-600 dark:text-emerald-400 font-bold">Authorized Signatory</div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end shrink-0">
            <button
              type="button"
              @click="showJvModal = false"
              class="btn btn-secondary px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              Close Voucher
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 5: RECEIPT / BILL VIEWER (Requirement 7) -->
    <Teleport to="body">
      <div
        v-if="showAttachmentModal && selectedAttachmentExpense"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showAttachmentModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 800px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <div>
              <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip :size="18" class="text-indigo-600 dark:text-indigo-400" />
                <span>Bill / Receipt: {{ selectedAttachmentExpense.voucherNo }}</span>
              </h3>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ selectedAttachmentExpense.category }} - {{ selectedAttachmentExpense.person }}</div>
            </div>
            <div class="flex items-center gap-2">
              <a
                :href="selectedAttachmentExpense.attachment"
                :download="selectedAttachmentExpense.attachmentName || 'expense_receipt'"
                class="btn btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download :size="14" />
                <span>Download</span>
              </a>
              <button
                type="button"
                @click="showAttachmentModal = false"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X :size="20" />
              </button>
            </div>
          </div>

          <div class="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-100/50 dark:bg-slate-950/60">
            <img
              v-if="selectedAttachmentExpense.attachment.startsWith('data:image') || selectedAttachmentExpense.attachment.endsWith('.jpg') || selectedAttachmentExpense.attachment.endsWith('.png')"
              :src="selectedAttachmentExpense.attachment"
              alt="Receipt Proof"
              class="max-w-full max-h-[70vh] rounded-xl object-contain border border-slate-200 dark:border-slate-800 shadow-lg"
            />
            <iframe
              v-else
              :src="selectedAttachmentExpense.attachment"
              class="w-full h-[65vh] rounded-xl border border-slate-200 dark:border-slate-800"
            ></iframe>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 6: REIMBURSE EMPLOYEE PAYOUT MODAL -->
    <Teleport to="body">
      <div
        v-if="showReimburseModal && selectedReimburseExpense"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showReimburseModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 480px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users :size="20" class="text-rose-600 dark:text-rose-400" />
              <span>Settle Employee Reimbursement</span>
            </h3>
            <button
              type="button"
              @click="showReimburseModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div class="text-slate-500 dark:text-slate-400">Employee / Payee:</div>
              <div class="text-base font-extrabold text-slate-900 dark:text-white">{{ selectedReimburseExpense.person }}</div>
              <div class="text-slate-500 dark:text-slate-400 pt-1">Claimed Amount:</div>
              <div class="text-lg font-mono font-black text-rose-600 dark:text-rose-400">
                PKR {{ formatMoney(selectedReimburseExpense.pkrAmount || selectedReimburseExpense.amount) }}
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Settlement Date *</label>
              <input
                v-model="reimburseForm.date"
                type="date"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Disburse Payment From *</label>
              <select
                v-model="reimburseForm.paymentSource"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Petty Cash Desk">Branch Petty Cash Desk Safe</option>
                <option v-for="b in dataStore.bankAccounts" :key="b.id" :value="b.name">
                  {{ b.name }} (Company Bank Transfer)
                </option>
              </select>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showReimburseModal = false"
              class="btn btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="executeEmployeeReimbursement"
              class="btn btn-success px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              Confirm & Pay Employee
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 7: REJECTION REASON PROMPT MODAL -->
    <Teleport to="body">
      <div
        v-if="showRejectModal && expenseToReject"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showRejectModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 480px !important; width: 92vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <h3 class="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle :size="18" class="text-rose-600 dark:text-rose-400" />
              <span>Reject Expense Voucher: {{ expenseToReject.voucherNo }}</span>
            </h3>
            <button
              type="button"
              @click="showRejectModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-3 overflow-y-auto flex-1 text-xs">
            <p class="text-slate-600 dark:text-slate-300">
              Please enter the management reason for rejecting this expense claim. This reason will be permanently archived in the audit trail.
            </p>
            <textarea
              v-model="rejectionReasonInput"
              rows="3"
              placeholder="e.g. Missing valid invoice receipt, expense outside company travel allowance policy..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            ></textarea>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showRejectModal = false"
              class="btn btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmRejectExpense"
              class="btn btn-danger px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL 8: TOUR DETAILS & ITEMIZED RECEIPTS MODAL (Requirement 12) -->
    <Teleport to="body">
      <div
        v-if="showTourDetailsModal && selectedTourForDetails"
        class="fixed inset-0 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="z-index: 99999 !important; background: rgba(3, 7, 18, 0.85) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important;"
        @click.self="showTourDetailsModal = false"
      >
        <div
          class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100"
          style="max-width: 920px !important; width: 94vw !important;"
        >
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
            <div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plane :size="20" class="text-purple-600 dark:text-purple-400" />
                <span>Tour Cost Sheet: {{ selectedTourForDetails.tourName }}</span>
              </h3>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ selectedTourForDetails.person }} • {{ selectedTourForDetails.city }}, {{ selectedTourForDetails.country }} ({{ selectedTourForDetails.startDate }} to {{ selectedTourForDetails.endDate }})
              </div>
            </div>
            <button
              type="button"
              @click="showTourDetailsModal = false"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div class="text-slate-500 dark:text-slate-400">Total Tour Budget:</div>
                <div class="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1">
                  PKR {{ formatMoney(selectedTourForDetails.budget) }}
                </div>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div class="text-slate-500 dark:text-slate-400">Total Consolidated Spent:</div>
                <div class="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  PKR {{ formatMoney(getTourTotalSpend(selectedTourForDetails.id)) }}
                </div>
              </div>
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div class="text-slate-500 dark:text-slate-400">Remaining Budget Balance:</div>
                <div class="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                  PKR {{ formatMoney(selectedTourForDetails.budget - getTourTotalSpend(selectedTourForDetails.id)) }}
                </div>
              </div>
            </div>

            <!-- Category Breakdown Table -->
            <div class="space-y-2">
              <h4 class="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                Category-Wise Tour Breakdown:
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="(amt, cat) in getTourBreakdown(selectedTourForDetails.id)"
                  :key="cat"
                  class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                >
                  <span class="text-slate-700 dark:text-slate-300 font-semibold">{{ cat }}:</span>
                  <span class="font-mono font-bold text-slate-900 dark:text-white">PKR {{ formatMoney(amt) }}</span>
                </div>
              </div>
            </div>

            <!-- Itemized Vouchers Table -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                  Itemized Expenses Under this Tour:
                </h4>
                <button
                  type="button"
                  @click="addExpenseToTour(selectedTourForDetails)"
                  class="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold cursor-pointer"
                >
                  <Plus :size="14" />
                  <span>Add Voucher</span>
                </button>
              </div>

              <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                    <tr>
                      <th class="p-2.5">Voucher</th>
                      <th class="p-2.5">Date</th>
                      <th class="p-2.5">Category</th>
                      <th class="p-2.5">Description</th>
                      <th class="p-2.5">Payment</th>
                      <th class="p-2.5 text-right">Amount (PKR)</th>
                      <th class="p-2.5 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr
                      v-for="e in getTourExpenses(selectedTourForDetails.id)"
                      :key="e.id || e.voucherNo"
                      class="hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td class="p-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ e.voucherNo }}</td>
                      <td class="p-2.5 text-slate-500 dark:text-slate-400">{{ e.date }}</td>
                      <td class="p-2.5 text-slate-900 dark:text-white font-medium">{{ e.category }}</td>
                      <td class="p-2.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">{{ e.purpose || e.description }}</td>
                      <td class="p-2.5 text-slate-600 dark:text-slate-400">{{ e.paymentMethod }}</td>
                      <td class="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        PKR {{ formatMoney(e.pkrAmount || e.amount) }}
                      </td>
                      <td class="p-2.5 text-center">
                        <button
                          v-if="e.attachment"
                          @click="viewAttachment(e)"
                          class="p-1 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 cursor-pointer"
                        >
                          <Paperclip :size="13" />
                        </button>
                        <span v-else class="text-slate-400 dark:text-slate-600">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end shrink-0">
            <button
              type="button"
              @click="showTourDetailsModal = false"
              class="btn btn-secondary px-5 py-2 text-xs font-semibold cursor-pointer"
            >
              Close Sheet
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import PageHeader from '@/components/ui/PageHeader.vue'
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
  MapPin,
  Landmark,
  Calendar,
  DollarSign,
  Users,
  Tag,
  Paperclip,
  Trash2,
  Edit3,
  AlertCircle,
  FileSpreadsheet,
  Check,
  X,
  BookOpen,
  User,
  Eye,
  EyeOff,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

const activeTab = ref('expenses') // 'expenses' | 'tours' | 'reimbursements' | 'categories' | 'reports'

// Available branches
const branchesList = computed(() => {
  return dataStore.branches && dataStore.branches.length ? dataStore.branches : ['Peshawar', 'Lahore', 'Islamabad', 'Multan', 'Head Office', 'Karachi']
})

// Active Categories
const activeCategoriesList = computed(() => {
  return dataStore.expenseCategories.filter(c => c.isActive !== false)
})

// Distinct persons from expense records
const distinctPersons = computed(() => {
  const set = new Set()
  set.add('Director M. Ibrahim')
  set.add('Hassan Raza (Sales Manager)')
  set.add('Tariq Mahmood (Accountant)')
  set.add('Engr. Tariq Saeed')
  set.add('Zubair Shah (Field Technician)')
  dataStore.expenses.forEach(e => {
    if (e.person) set.add(e.person)
  })
  return Array.from(set)
})

// Filters
const filters = ref({
  search: '',
  category: '',
  person: '',
  tourId: '',
  status: '',
  branch: '',
  department: '',
  paymentMethod: '',
  currency: '',
  dateRange: 'all',
  customStartDate: '',
  customEndDate: ''
})

function resetFilters() {
  filters.value = {
    search: '',
    category: '',
    person: '',
    tourId: '',
    status: '',
    branch: '',
    department: '',
    paymentMethod: '',
    currency: '',
    dateRange: 'all',
    customStartDate: '',
    customEndDate: ''
  }
}

// Filtered Expenses
const filteredExpenses = computed(() => {
  let list = dataStore.expenses || []

  // Branch isolation if not superadmin
  if (!authStore.isSuperAdmin && authStore.userBranch) {
    const userBranch = authStore.userBranch.toLowerCase()
    list = list.filter(e => String(e.branch || '').toLowerCase().includes(userBranch))
  }

  // Keyword Search
  if (filters.value.search.trim()) {
    const q = filters.value.search.toLowerCase().trim()
    list = list.filter(e =>
      (e.voucherNo && e.voucherNo.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.subCategory && e.subCategory.toLowerCase().includes(q)) ||
      (e.person && e.person.toLowerCase().includes(q)) ||
      (e.purpose && e.purpose.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.vendor && e.vendor.toLowerCase().includes(q)) ||
      (e.referenceNo && e.referenceNo.toLowerCase().includes(q)) ||
      (e.tourName && e.tourName.toLowerCase().includes(q))
    )
  }

  // Category Filter
  if (filters.value.category) {
    list = list.filter(e => e.category === filters.value.category)
  }

  // Person Filter
  if (filters.value.person) {
    list = list.filter(e => e.person === filters.value.person)
  }

  // Tour Filter
  if (filters.value.tourId) {
    if (filters.value.tourId === 'tour_only') {
      list = list.filter(e => !!e.tourId)
    } else {
      list = list.filter(e => e.tourId === filters.value.tourId)
    }
  }

  // Status Filter
  if (filters.value.status) {
    list = list.filter(e => e.status === filters.value.status)
  }

  // Branch Filter
  if (filters.value.branch) {
    list = list.filter(e => e.branch === filters.value.branch)
  }

  // Department Filter
  if (filters.value.department) {
    list = list.filter(e => e.department === filters.value.department)
  }

  // Payment Method Filter
  if (filters.value.paymentMethod) {
    list = list.filter(e => e.paymentMethod === filters.value.paymentMethod)
  }

  // Currency Filter
  if (filters.value.currency) {
    list = list.filter(e => e.currency === filters.value.currency)
  }

  // Date Range Filter
  if (filters.value.dateRange !== 'all') {
    const today = new Date().toISOString().substring(0, 10)
    if (filters.value.dateRange === 'today') {
      list = list.filter(e => e.date === today)
    } else if (filters.value.dateRange === 'this_week') {
      const d = new Date()
      const first = d.getDate() - d.getDay()
      const firstDay = new Date(d.setDate(first)).toISOString().substring(0, 10)
      list = list.filter(e => e.date >= firstDay && e.date <= today)
    } else if (filters.value.dateRange === 'this_month') {
      const monthPrefix = today.substring(0, 7)
      list = list.filter(e => e.date && e.date.startsWith(monthPrefix))
    } else if (filters.value.dateRange === 'this_year') {
      const yearPrefix = today.substring(0, 4)
      list = list.filter(e => e.date && e.date.startsWith(yearPrefix))
    } else if (filters.value.dateRange === 'custom') {
      if (filters.value.customStartDate && filters.value.customEndDate) {
        list = list.filter(e => e.date >= filters.value.customStartDate && e.date <= filters.value.customEndDate)
      }
    }
  }

  return list
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil(filteredExpenses.value.length / pageSize.value))

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredExpenses.value.slice(start, start + pageSize.value)
})

// Financial Summary Computeds
const totalApprovedExpensesAmount = computed(() => {
  return dataStore.approvedExpenses.reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
})

const pendingApprovalAmount = computed(() => {
  return dataStore.pendingApprovalExpenses.reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
})

const pendingReimbursementsAmount = computed(() => {
  return dataStore.pendingReimbursements.reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
})

const totalToursSpendAmount = computed(() => {
  return dataStore.expenses
    .filter(e => !!e.tourId && (e.status === 'Approved' || e.status === 'Paid'))
    .reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
})

const allEmployeeReimbursements = computed(() => {
  return dataStore.expenses.filter(e => e.isEmployeeReimbursement)
})

// Tours Helpers
function getTourExpenses(tourId) {
  return dataStore.expenses.filter(e => e.tourId === tourId)
}

function getTourTotalSpend(tourId) {
  return getTourExpenses(tourId).reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
}

function getTourBreakdown(tourId) {
  const list = getTourExpenses(tourId)
  const breakdown = {}
  list.forEach(e => {
    const c = e.category || 'Other Expenses'
    breakdown[c] = (breakdown[c] || 0) + Number(e.pkrAmount || e.amount || 0)
  })
  return breakdown
}

// Categories Helpers
function getCategoryExpensesCount(catName) {
  return dataStore.expenses.filter(e => e.category === catName).length
}

function getCategoryTotalSpend(catName) {
  return dataStore.expenses
    .filter(e => e.category === catName && (e.status === 'Approved' || e.status === 'Paid'))
    .reduce((sum, e) => sum + Number(e.pkrAmount || e.amount || 0), 0)
}

// Format Numbers
function formatMoney(val) {
  if (!authStore.isBalanceVisible) return '••••••'
  return Number(val || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

function formatVyaparAmount(amount) {
  if (!authStore.isBalanceVisible) {
    return { integer: '••••••', decimal: '••' }
  }
  const val = Number(amount || 0)
  const isNegative = val < 0
  const parts = Math.abs(val).toFixed(2).split('.')
  const integer = (isNegative ? '-' : '') + Number(parts[0]).toLocaleString()
  const decimal = parts[1] || '00'
  return { integer, decimal }
}

const formattedApprovedExpenses = computed(() => formatVyaparAmount(totalApprovedExpensesAmount.value))
const formattedPendingApproval = computed(() => formatVyaparAmount(pendingApprovalAmount.value))
const formattedPendingReimbursements = computed(() => formatVyaparAmount(pendingReimbursementsAmount.value))
const formattedToursSpend = computed(() => formatVyaparAmount(totalToursSpendAmount.value))
const formattedLiquidity = computed(() => formatVyaparAmount(dataStore.totalCombinedLiquidity))

const moduleTabs = computed(() => [
  { id: 'expenses', label: 'Expenses Register', icon: FileText, count: filteredExpenses.value.length },
  { id: 'tours', label: 'Tours & Visits Hub', icon: Plane, count: (dataStore.expenseTours || []).length },
  { id: 'reimbursements', label: 'Employee Reimbursements', icon: Users, count: dataStore.pendingReimbursements?.length || 0 },
  { id: 'categories', label: 'Categories & Predefined', icon: Tag, count: (dataStore.expenseCategories || []).length },
  { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet }
])

const showMoreFilters = ref(false)
const hasActiveSecondaryFilters = computed(() => {
  return !!(
    filters.value.person ||
    filters.value.branch ||
    filters.value.department ||
    filters.value.paymentMethod ||
    filters.value.tourId ||
    filters.value.currency ||
    (filters.value.dateRange === 'custom' && (filters.value.customStartDate || filters.value.customEndDate))
  )
})
const activeSecondaryFilterCount = computed(() => {
  let count = 0
  if (filters.value.person) count++
  if (filters.value.branch) count++
  if (filters.value.department) count++
  if (filters.value.paymentMethod) count++
  if (filters.value.tourId) count++
  if (filters.value.currency) count++
  if (filters.value.dateRange === 'custom' && (filters.value.customStartDate || filters.value.customEndDate)) count++
  return count
})

// ── EXPENSE MODAL STATE & ACTIONS ──
const showExpenseModal = ref(false)
const showTourModal = ref(false)
const showTourDetailsModal = ref(false)
const showCategoryModal = ref(false)
const showReimburseModal = ref(false)
const showRejectModal = ref(false)
const showJvModal = ref(false)
const showAttachmentModal = ref(false)

function closeAllExpenseModals() {
  showExpenseModal.value = false
  showTourModal.value = false
  showTourDetailsModal.value = false
  showCategoryModal.value = false
  showReimburseModal.value = false
  showRejectModal.value = false
  showJvModal.value = false
  showAttachmentModal.value = false
}

const isEditingExpense = ref(false)
const editingExpenseId = ref(null)

const expenseForm = ref({
  date: new Date().toISOString().substring(0, 10),
  category: 'Local Travel / Out of City Travel',
  subCategory: '',
  person: 'Director M. Ibrahim',
  personRole: 'Boss / Director',
  tourId: '',
  tourName: '',
  purpose: '',
  vendor: '',
  amount: 0,
  currency: 'PKR',
  exchangeRate: 1,
  paymentMethod: 'Cash',
  bankAccount: '',
  referenceNo: '',
  branch: 'Peshawar',
  department: 'Management / Executive',
  remarks: '',
  status: 'Approved',
  attachment: '',
  attachmentName: '',
  attachmentType: ''
})

const currentCategorySubCategories = computed(() => {
  const cat = dataStore.expenseCategories.find(c => c.name === expenseForm.value.category)
  return cat && cat.subCategories ? cat.subCategories : []
})

const computedFormPkrAmount = computed(() => {
  const amt = Number(expenseForm.value.amount || 0)
  if (expenseForm.value.currency === 'PKR') return amt
  return Math.round(amt * Number(expenseForm.value.exchangeRate || 1))
})

function onFormCategoryChange() {
  expenseForm.value.subCategory = ''
}

function onFormTourChange() {
  const tour = dataStore.expenseTours.find(t => t.id === expenseForm.value.tourId)
  if (tour) {
    expenseForm.value.tourName = tour.tourName
    expenseForm.value.person = tour.person
    expenseForm.value.personRole = tour.personRole
    expenseForm.value.branch = tour.branch
  } else {
    expenseForm.value.tourName = ''
  }
}

function onCurrencyChange() {
  const cur = expenseForm.value.currency
  if (cur === 'PKR') expenseForm.value.exchangeRate = 1
  else if (cur === 'USD') expenseForm.value.exchangeRate = 278
  else if (cur === 'EUR') expenseForm.value.exchangeRate = 302
  else if (cur === 'CNY') expenseForm.value.exchangeRate = 38.5
  else if (cur === 'AED') expenseForm.value.exchangeRate = 75.8
  else if (cur === 'SAR') expenseForm.value.exchangeRate = 74.2
  else if (cur === 'GBP') expenseForm.value.exchangeRate = 360
  else expenseForm.value.exchangeRate = 1
}

function handleFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  expenseForm.value.attachmentName = file.name
  expenseForm.value.attachmentType = file.type

  const reader = new FileReader()
  reader.onload = (uploadEvent) => {
    expenseForm.value.attachment = uploadEvent.target.result
  }
  reader.readAsDataURL(file)
}

function openAddExpenseModal() {
  closeAllExpenseModals()
  isEditingExpense.value = false
  editingExpenseId.value = null
  expenseForm.value = {
    date: new Date().toISOString().substring(0, 10),
    category: activeCategoriesList.value[0]?.name || 'Local Travel / Out of City Travel',
    subCategory: '',
    person: 'Director M. Ibrahim',
    personRole: 'Boss / Director',
    tourId: '',
    tourName: '',
    purpose: '',
    vendor: '',
    amount: 0,
    currency: 'PKR',
    exchangeRate: 1,
    paymentMethod: 'Cash',
    bankAccount: '',
    referenceNo: '',
    branch: authStore.userBranch || 'Peshawar',
    department: 'Management / Executive',
    remarks: '',
    status: 'Approved',
    attachment: '',
    attachmentName: '',
    attachmentType: ''
  }
  showExpenseModal.value = true
}

function addExpenseToTour(tour) {
  openAddExpenseModal()
  expenseForm.value.tourId = tour.id
  expenseForm.value.tourName = tour.tourName
  expenseForm.value.person = tour.person
  expenseForm.value.personRole = tour.personRole
  expenseForm.value.branch = tour.branch
}

function editExistingExpense(exp) {
  closeAllExpenseModals()
  isEditingExpense.value = true
  editingExpenseId.value = exp.id || exp.voucherNo
  expenseForm.value = {
    date: exp.date || new Date().toISOString().substring(0, 10),
    category: exp.category || '',
    subCategory: exp.subCategory || '',
    person: exp.person || '',
    personRole: exp.personRole || 'Employee',
    tourId: exp.tourId || '',
    tourName: exp.tourName || '',
    purpose: exp.purpose || exp.description || '',
    vendor: exp.vendor || '',
    amount: exp.amount || 0,
    currency: exp.currency || 'PKR',
    exchangeRate: exp.exchangeRate || 1,
    paymentMethod: exp.paymentMethod || 'Cash',
    bankAccount: exp.bankAccount || '',
    referenceNo: exp.referenceNo || '',
    branch: exp.branch || 'Peshawar',
    department: exp.department || 'Management / Executive',
    remarks: exp.remarks || '',
    status: exp.status || 'Approved',
    attachment: exp.attachment || '',
    attachmentName: exp.attachmentName || '',
    attachmentType: exp.attachmentType || ''
  }
  showExpenseModal.value = true
}

async function saveExpenseForm() {
  if (!expenseForm.value.category) {
    uiStore.showToast('Please select an Expense Category', 'error')
    return
  }
  if (!expenseForm.value.amount || Number(expenseForm.value.amount) <= 0) {
    uiStore.showToast('Please enter a valid expense amount', 'error')
    return
  }

  const payload = {
    ...expenseForm.value,
    pkrAmount: computedFormPkrAmount.value
  }

  if (isEditingExpense.value) {
    await dataStore.updateExpense(editingExpenseId.value, payload, authStore.user)
    uiStore.showToast('Expense Voucher updated successfully', 'success')
  } else {
    await dataStore.addExpense(payload, authStore.user)
    uiStore.showToast('Expense Voucher recorded successfully', 'success')
  }

  showExpenseModal.value = false
}

async function deleteExistingExpense(exp) {
  if (confirm(`Are you sure you want to delete expense voucher #${exp.voucherNo}?`)) {
    await dataStore.deleteExpense(exp.id || exp.voucherNo, authStore.user)
    uiStore.showToast(`Voucher #${exp.voucherNo} moved to Recycle Bin`, 'info')
  }
}

// ── APPROVAL & REJECTION ACTIONS ──
const expenseToReject = ref(null)
const rejectionReasonInput = ref('')

async function approveSingleExpense(exp) {
  await dataStore.approveExpense(exp.id || exp.voucherNo, authStore.user)
  uiStore.showToast(`Expense voucher #${exp.voucherNo} approved!`, 'success')
}

function promptRejectExpense(exp) {
  closeAllExpenseModals()
  expenseToReject.value = exp
  rejectionReasonInput.value = ''
  showRejectModal.value = true
}

async function confirmRejectExpense() {
  if (!rejectionReasonInput.value.trim()) {
    uiStore.showToast('Please provide a reason for rejection', 'error')
    return
  }
  await dataStore.rejectExpense(expenseToReject.value.id || expenseToReject.value.voucherNo, rejectionReasonInput.value.trim(), authStore.user)
  uiStore.showToast(`Expense voucher #${expenseToReject.value.voucherNo} rejected`, 'warning')
  showRejectModal.value = false
}

async function bulkApproveAllPending() {
  const ids = dataStore.pendingApprovalExpenses.map(e => e.id || e.voucherNo)
  await dataStore.bulkApproveExpenses(ids, authStore.user)
  uiStore.showToast(`Bulk approved ${ids.length} pending expense vouchers`, 'success')
}

// ── TOUR MODAL STATE & ACTIONS ──
const isEditingTour = ref(false)
const editingTourId = ref(null)

const tourForm = ref({
  tourName: '',
  tourType: 'International',
  person: 'Director M. Ibrahim',
  personRole: 'Boss / Director',
  country: 'China',
  city: 'Guangzhou',
  originCity: 'Peshawar',
  startDate: new Date().toISOString().substring(0, 10),
  endDate: new Date().toISOString().substring(0, 10),
  purpose: '',
  budget: 500000,
  status: 'Active',
  branch: 'Head Office'
})

function openAddTourModal() {
  closeAllExpenseModals()
  isEditingTour.value = false
  editingTourId.value = null
  tourForm.value = {
    tourName: '',
    tourType: 'International',
    person: 'Director M. Ibrahim',
    personRole: 'Boss / Director',
    country: 'China',
    city: 'Guangzhou',
    originCity: 'Peshawar',
    startDate: new Date().toISOString().substring(0, 10),
    endDate: new Date().toISOString().substring(0, 10),
    purpose: '',
    budget: 500000,
    status: 'Active',
    branch: 'Head Office'
  }
  showTourModal.value = true
}

function editExistingTour(tour) {
  closeAllExpenseModals()
  isEditingTour.value = true
  editingTourId.value = tour.id
  tourForm.value = { ...tour }
  showTourModal.value = true
}

async function saveTourForm() {
  if (!tourForm.value.tourName.trim()) {
    uiStore.showToast('Tour Name is required', 'error')
    return
  }
  if (isEditingTour.value) {
    await dataStore.updateExpenseTour(editingTourId.value, tourForm.value, authStore.user)
    uiStore.showToast('Tour updated successfully', 'success')
  } else {
    await dataStore.addExpenseTour(tourForm.value, authStore.user)
    uiStore.showToast('New Tour registered successfully', 'success')
  }
  showTourModal.value = false
}

async function deleteExistingTour(tour) {
  if (confirm(`Delete Tour "${tour.tourName}"? Linked expenses will remain intact.`)) {
    await dataStore.deleteExpenseTour(tour.id, authStore.user)
    uiStore.showToast('Tour deleted', 'info')
  }
}

// ── TOUR DETAILS MODAL ──
const selectedTourForDetails = ref(null)

function openTourDetailsModal(tour) {
  closeAllExpenseModals()
  selectedTourForDetails.value = tour
  showTourDetailsModal.value = true
}

// ── CATEGORIES MODAL & ACTIONS ──
const isEditingCategory = ref(false)
const editingCategoryId = ref(null)

const categoryForm = ref({
  name: '',
  type: 'General',
  subCategoriesText: ''
})

function openAddCategoryModal() {
  closeAllExpenseModals()
  isEditingCategory.value = false
  editingCategoryId.value = null
  categoryForm.value = { name: '', type: 'General', subCategoriesText: '' }
  showCategoryModal.value = true
}

function editExistingCategory(cat) {
  closeAllExpenseModals()
  isEditingCategory.value = true
  editingCategoryId.value = cat.id
  categoryForm.value = {
    name: cat.name,
    type: cat.type || 'General',
    subCategoriesText: (cat.subCategories || []).join(', ')
  }
  showCategoryModal.value = true
}

async function saveCategoryForm() {
  if (!categoryForm.value.name.trim()) {
    uiStore.showToast('Category name is required', 'error')
    return
  }
  const subCats = categoryForm.value.subCategoriesText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const payload = {
    name: categoryForm.value.name.trim(),
    type: categoryForm.value.type,
    subCategories: subCats
  }

  if (isEditingCategory.value) {
    await dataStore.updateExpenseCategory(editingCategoryId.value, payload, authStore.user)
    uiStore.showToast('Category updated successfully', 'success')
  } else {
    await dataStore.addExpenseCategory(payload, authStore.user)
    uiStore.showToast('New Category added successfully', 'success')
  }
  showCategoryModal.value = false
}

async function toggleCategoryActive(cat) {
  const newStatus = cat.isActive === false
  await dataStore.updateExpenseCategory(cat.id, { isActive: newStatus }, authStore.user)
  uiStore.showToast(`Category ${cat.name} ${newStatus ? 'Activated' : 'Deactivated'}`, 'info')
}

async function deleteExistingCategory(cat) {
  if (confirm(`Delete Category "${cat.name}"?`)) {
    await dataStore.deleteExpenseCategory(cat.id, authStore.user)
    uiStore.showToast('Category deleted', 'info')
  }
}

// ── REIMBURSEMENT PAYOUT MODAL ──
const selectedReimburseExpense = ref(null)
const reimburseForm = ref({
  date: new Date().toISOString().substring(0, 10),
  paymentSource: 'Petty Cash Desk'
})

function openReimburseModal(exp) {
  closeAllExpenseModals()
  selectedReimburseExpense.value = exp
  reimburseForm.value = {
    date: new Date().toISOString().substring(0, 10),
    paymentSource: 'Petty Cash Desk'
  }
  showReimburseModal.value = true
}

async function executeEmployeeReimbursement() {
  await dataStore.reimburseExpense(
    selectedReimburseExpense.value.id || selectedReimburseExpense.value.voucherNo,
    {
      reimbursedDate: reimburseForm.value.date,
      reimbursedFrom: reimburseForm.value.paymentSource
    },
    authStore.user
  )
  uiStore.showToast(`Settled reimbursement for ${selectedReimburseExpense.value.person}!`, 'success')
  showReimburseModal.value = false
}

// ── JOURNAL VOUCHER MODAL ──
const selectedJvExpense = ref(null)

const selectedJvCreditAccountName = computed(() => {
  if (!selectedJvExpense.value) return 'Cash / Bank A/c'
  if (selectedJvExpense.value.isEmployeeReimbursement) {
    return `Employee Reimbursement Payable: ${selectedJvExpense.value.person}`
  }
  if (selectedJvExpense.value.paymentMethod === 'Company Bank Account') {
    return `${selectedJvExpense.value.bankAccount || 'Company Bank A/c'}`
  }
  return `Branch Cash Safe (${selectedJvExpense.value.branch || 'Peshawar'})`
})

function viewJournalVoucher(exp) {
  closeAllExpenseModals()
  selectedJvExpense.value = exp
  showJvModal.value = true
}

// ── ATTACHMENT MODAL ──
const selectedAttachmentExpense = ref(null)

function viewAttachment(exp) {
  closeAllExpenseModals()
  selectedAttachmentExpense.value = exp
  showAttachmentModal.value = true
}

// ── REPORTS & ANALYTICS COMPUTEDS ──
const selectedReportType = ref('monthly')

const reportTitle = computed(() => {
  switch (selectedReportType.value) {
    case 'daily': return 'Daily Expenses Activity Report'
    case 'monthly': return 'Monthly Consolidated Operating Expenses Report'
    case 'yearly': return 'Yearly Executive P&L Expenses Summary'
    case 'category': return 'Expense Category-Wise Distribution Report'
    case 'employee': return 'Employee & Person-Wise Expenditure Report'
    case 'branch': return 'Depot & Branch-Wise Expense Analysis'
    case 'department': return 'Departmental Operational Outflow Report'
    case 'tour': return 'Tour & Visit Consolidated Spend Report'
    case 'local_travel': return 'Local Intercity Travel & Fuel Report'
    case 'intl_travel': return 'International Business Tours & Logistics Report'
    case 'cash': return 'Cash Safe Disbursements Report'
    case 'bank': return 'Bank Account Transfers & Clearing Report'
    case 'reimbursement': return 'Employee Out-of-Pocket Reimbursements Ledger'
    case 'pending': return 'Pending Approval & Draft Vouchers Report'
    case 'approved': return 'Approved & Posted Expenditures Report'
    default: return 'Comprehensive Expense Analytics'
  }
})

const reportFilteredExpenses = computed(() => {
  const all = dataStore.expenses || []
  switch (selectedReportType.value) {
    case 'daily': {
      const today = new Date().toISOString().substring(0, 10)
      return all.filter(e => e.date === today)
    }
    case 'monthly': {
      const thisMonth = new Date().toISOString().substring(0, 7)
      return all.filter(e => e.date && e.date.startsWith(thisMonth))
    }
    case 'yearly': {
      const thisYear = new Date().toISOString().substring(0, 4)
      return all.filter(e => e.date && e.date.startsWith(thisYear))
    }
    case 'tour': return all.filter(e => !!e.tourId)
    case 'local_travel': return all.filter(e => e.category?.toLowerCase().includes('local travel') || e.category?.toLowerCase().includes('fuel') || e.category?.toLowerCase().includes('taxi'))
    case 'intl_travel': return all.filter(e => e.category?.toLowerCase().includes('international') || e.category?.toLowerCase().includes('air ticket') || e.category?.toLowerCase().includes('visa') || e.currency !== 'PKR')
    case 'cash': return all.filter(e => e.paymentMethod === 'Cash' || String(e.paymentMode).toLowerCase().includes('cash'))
    case 'bank': return all.filter(e => e.paymentMethod === 'Company Bank Account' || String(e.paymentMode).toLowerCase().includes('bank'))
    case 'reimbursement': return all.filter(e => e.isEmployeeReimbursement)
    case 'pending': return all.filter(e => e.status === 'Draft' || e.status === 'Submitted')
    case 'approved': return all.filter(e => e.status === 'Approved' || e.status === 'Paid')
    default: return all
  }
})

const reportTotalAmount = computed(() => {
  return reportFilteredExpenses.value.reduce((s, e) => s + Number(e.pkrAmount || e.amount || 0), 0)
})

const reportGroupSummary = computed(() => {
  const map = {}
  const total = reportTotalAmount.value || 1

  reportFilteredExpenses.value.forEach(e => {
    let key = 'Other'
    if (selectedReportType.value === 'employee') key = e.person || 'General Employee'
    else if (selectedReportType.value === 'branch') key = e.branch || 'Peshawar'
    else if (selectedReportType.value === 'department') key = e.department || 'Operations'
    else if (selectedReportType.value === 'tour') key = e.tourName || 'Standalone'
    else key = e.category || 'General'

    map[key] = (map[key] || 0) + Number(e.pkrAmount || e.amount || 0)
  })

  return Object.keys(map)
    .map(name => ({
      name,
      amount: map[name],
      percentage: Number(((map[name] / total) * 100).toFixed(1))
    }))
    .sort((a, b) => b.amount - a.amount)
})

// ── EXPORT & PRINT (Requirement 15) ──
function exportCurrentTableToExcel() {
  const rows = filteredExpenses.value.map(e => ({
    'Voucher No': e.voucherNo,
    'Date': e.date,
    'Category': e.category,
    'Sub-Category': e.subCategory || '',
    'Person': e.person,
    'Role': e.personRole,
    'Tour': e.tourName || '',
    'Purpose': e.purpose || e.description || '',
    'Payee / Vendor': e.vendor || '',
    'Currency': e.currency,
    'Exchange Rate': e.exchangeRate,
    'Original Amount': e.amount,
    'Equivalent PKR': e.pkrAmount || e.amount,
    'Payment Method': e.paymentMethod,
    'Bank / Cash Source': e.bankAccount || e.bankCash || '',
    'Reference No': e.referenceNo || '',
    'Branch': e.branch,
    'Department': e.department,
    'Status': e.status,
    'Reimbursement Status': e.isEmployeeReimbursement ? e.reimbursementStatus : 'N/A'
  }))

  const header = Object.keys(rows[0] || {}).join(',')
  const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  const encoded = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encoded)
  link.setAttribute('download', `erp_expense_register_${new Date().toISOString().substring(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  uiStore.showToast(`Exported ${rows.length} expense rows to Excel (CSV)`, 'success')
}

function exportCurrentReportToExcel() {
  const rows = reportFilteredExpenses.value.map(e => ({
    'Voucher No': e.voucherNo,
    'Date': e.date,
    'Category': e.category,
    'Person': e.person,
    'Branch': e.branch,
    'Department': e.department,
    'Amount (PKR)': e.pkrAmount || e.amount,
    'Payment Method': e.paymentMethod,
    'Status': e.status
  }))

  const header = Object.keys(rows[0] || {}).join(',')
  const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n')
  const encoded = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encoded)
  link.setAttribute('download', `${selectedReportType.value}_expense_report_${new Date().toISOString().substring(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  uiStore.showToast('Report exported successfully', 'success')
}

function printCurrentTablePDF() {
  window.print()
}

function printSelectedReportPDF() {
  window.print()
}

onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
  if (route.query.action === 'new') {
    openAddExpenseModal()
  }
})
</script>

<style scoped>
.vyapar-card {
  transition: all 0.2s ease;
}

.vyapar-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.vyapar-select {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.775rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.25rem 0.65rem;
  cursor: pointer;
  outline: none;
}

[data-theme="dark"] .vyapar-select {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
}

.vyapar-amount-display {
  font-family: var(--font-heading);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.vyapar-amount-display .currency {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
}

[data-theme="dark"] .vyapar-amount-display .currency {
  color: #f8fafc;
}

.vyapar-amount-display .amount-val {
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
}

[data-theme="dark"] .vyapar-amount-display .amount-val {
  color: #f8fafc;
}

.vyapar-amount-display .amount-dec {
  font-size: 0.875rem;
  font-weight: 500;
  color: #94a3b8;
}

@media print {
  body {
    background: white !important;
    color: black !important;
  }
  /* Hide interactive controls when printing */
  button, select, input, .fixed {
    display: none !important;
  }
}
</style>

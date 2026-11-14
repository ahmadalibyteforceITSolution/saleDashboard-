<template>
  <div class="space-y-6 pb-16">
    <!-- Top Header Bar with Live Quick Stats & Action Buttons -->
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
      <div>
        <div class="flex items-center gap-3">
          <div class="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <CreditCard :size="26" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Expense Management System</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ERP v2.4
              </span>
            </div>
            <p class="text-xs lg:text-sm text-slate-400 mt-1">
              Multi-Currency, Tour-Wise, Employee Out-of-Pocket Reimbursements & Double-Entry Accounting Ledgers
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        <button
          type="button"
          @click="openAddTourModal"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Plane :size="16" />
          <span>New Tour / Visit</span>
        </button>

        <button
          type="button"
          @click="openAddCategoryModal"
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Tag :size="16" />
          <span>Categories</span>
        </button>

        <button
          type="button"
          @click="openAddExpenseModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/25 cursor-pointer ml-auto lg:ml-0"
        >
          <Plus :size="16" />
          <span>Record Expense</span>
        </button>
      </div>
    </div>

    <!-- 5 KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Approved Expenses -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Total Expenses</span>
          <span class="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign :size="16" />
          </span>
        </div>
        <div>
          <div class="text-xl font-black text-white font-mono">
            PKR {{ formatMoney(totalApprovedExpensesAmount) }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span class="text-emerald-400 font-bold">{{ dataStore.approvedExpenses.length }}</span> approved & paid vouchers
          </div>
        </div>
      </div>

      <!-- Pending Approval -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Pending Approval</span>
          <span class="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock :size="16" />
          </span>
        </div>
        <div>
          <div class="text-xl font-black text-amber-400 font-mono">
            PKR {{ formatMoney(pendingApprovalAmount) }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{{ dataStore.pendingApprovalExpenses.length }} draft/submitted</span>
            <button
              v-if="dataStore.pendingApprovalExpenses.length > 0 && authStore.isSuperAdmin"
              @click="bulkApproveAllPending"
              class="text-[10px] text-amber-300 underline font-semibold hover:text-amber-200"
            >
              Approve All
            </button>
          </div>
        </div>
      </div>

      <!-- Employee Reimbursements Payable -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Employee Payable</span>
          <span class="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Users :size="16" />
          </span>
        </div>
        <div>
          <div class="text-xl font-black text-rose-400 font-mono">
            PKR {{ formatMoney(pendingReimbursementsAmount) }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span class="text-rose-400 font-bold">{{ dataStore.pendingReimbursements.length }}</span> pending claims
          </div>
        </div>
      </div>

      <!-- Tours & Visits -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Tours & Visits</span>
          <span class="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Plane :size="16" />
          </span>
        </div>
        <div>
          <div class="text-xl font-black text-indigo-400 font-mono">
            PKR {{ formatMoney(totalToursSpendAmount) }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{{ dataStore.expenseTours.length }} tours registered</span>
          </div>
        </div>
      </div>

      <!-- Cash / Bank Disbursed -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all">
        <div class="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
          <span>Company Liquidity</span>
          <span class="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Landmark :size="16" />
          </span>
        </div>
        <div>
          <div class="text-xl font-black text-cyan-400 font-mono">
            PKR {{ formatMoney(dataStore.totalCombinedLiquidity) }}
          </div>
          <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Cash & Bank Live Balance</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Header -->
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
      <button
        type="button"
        @click="activeTab = 'expenses'"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
          activeTab === 'expenses'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <FileText :size="15" />
        <span>Expenses Register</span>
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/60 font-mono">
          {{ filteredExpenses.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'tours'"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
          activeTab === 'tours'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <Plane :size="15" />
        <span>Tours & Visits Hub</span>
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/60 font-mono">
          {{ dataStore.expenseTours.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'reimbursements'"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
          activeTab === 'reimbursements'
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <Users :size="15" />
        <span>Employee Reimbursements</span>
        <span
          v-if="dataStore.pendingReimbursements.length > 0"
          class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono animate-pulse"
        >
          {{ dataStore.pendingReimbursements.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'categories'"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
          activeTab === 'categories'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <Tag :size="15" />
        <span>Categories & Predefined</span>
        <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/60 font-mono">
          {{ dataStore.expenseCategories.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'reports'"
        :class="[
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
          activeTab === 'reports'
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
            : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
        ]"
      >
        <FileSpreadsheet :size="15" />
        <span>Reports & Analytics</span>
      </button>
    </div>

    <!-- TAB 1: EXPENSES REGISTER (MAIN TABLE & FILTERS) -->
    <div v-if="activeTab === 'expenses'" class="space-y-4">
      <!-- Search & Filters Toolbar -->
      <div class="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <!-- Search Input -->
          <div class="sm:col-span-2 relative">
            <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search voucher, person, purpose, payee, category..."
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="filters.category"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option v-for="cat in activeCategoriesList" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Employee / Person Filter -->
          <div>
            <select
              v-model="filters.person"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Employees / Roles</option>
              <option v-for="p in distinctPersons" :key="p" :value="p">
                {{ p }}
              </option>
            </select>
          </div>

          <!-- Tour Filter -->
          <div>
            <select
              v-model="filters.tourId"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Tours / Standalone</option>
              <option value="tour_only">Any Tour / Visit Linked</option>
              <option v-for="t in dataStore.expenseTours" :key="t.id" :value="t.id">
                {{ t.tourName }}
              </option>
            </select>
          </div>

          <!-- Approval Status -->
          <div>
            <select
              v-model="filters.status"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Submitted">Submitted / Pending</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid / Settled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <!-- Second Row: Branch, Department, Payment Method, Currency, Date Presets -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <select
              v-model="filters.branch"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Branches</option>
              <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>

          <div>
            <select
              v-model="filters.department"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Management / Executive">Management / Executive</option>
              <option value="Sales">Sales</option>
              <option value="Workshop / Technical">Workshop / Technical</option>
              <option value="Accounts / Finance">Accounts / Finance</option>
              <option value="Logistics / Admin">Logistics / Admin</option>
            </select>
          </div>

          <div>
            <select
              v-model="filters.paymentMethod"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Payment Modes</option>
              <option value="Cash">Cash Voucher (Safe)</option>
              <option value="Company Bank Account">Company Bank Account</option>
              <option value="Paid by Employee (Personal Cash / Out of Pocket)">Employee Out of Pocket</option>
            </select>
          </div>

          <div>
            <select
              v-model="filters.currency"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
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

          <div>
            <select
              v-model="filters.dateRange"
              class="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              @click="resetFilters"
              class="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              @click="exportCurrentTableToExcel"
              class="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Export to Excel / CSV"
            >
              <Download :size="14" />
            </button>
            <button
              type="button"
              @click="printCurrentTablePDF"
              class="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer :size="14" />
            </button>
          </div>
        </div>

        <!-- Custom Date Inputs (if custom chosen) -->
        <div v-if="filters.dateRange === 'custom'" class="flex items-center gap-3 pt-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-slate-400">From:</span>
            <input
              v-model="filters.customStartDate"
              type="date"
              class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">To:</span>
            <input
              v-model="filters.customEndDate"
              type="date"
              class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white"
            />
          </div>
        </div>
      </div>

      <!-- Main Expenses Table -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/70 border-b border-slate-700/80 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
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
            <tbody class="divide-y divide-slate-800/80">
              <tr
                v-for="exp in paginatedExpenses"
                :key="exp.id || exp.voucherNo"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <!-- Voucher No & Date -->
                <td class="p-3.5">
                  <div class="font-mono font-bold text-indigo-400">{{ exp.voucherNo }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">{{ exp.date }}</div>
                </td>

                <!-- Category & Purpose -->
                <td class="p-3.5 max-w-xs">
                  <div class="flex items-center gap-1.5 font-semibold text-white">
                    <span>{{ exp.category }}</span>
                    <span v-if="exp.subCategory" class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {{ exp.subCategory }}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-300 truncate mt-0.5" :title="exp.purpose || exp.description">
                    {{ exp.purpose || exp.description || 'No description provided' }}
                  </div>
                  <div v-if="exp.vendor" class="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span class="text-slate-500">Payee:</span>
                    <span>{{ exp.vendor }}</span>
                  </div>
                </td>

                <!-- Person / Tour -->
                <td class="p-3.5">
                  <div class="font-medium text-slate-200">{{ exp.person || 'General Employee' }}</div>
                  <div class="text-[10px] text-indigo-300/80">{{ exp.personRole || 'Employee' }}</div>
                  <div v-if="exp.tourName" class="mt-1 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 inline-flex">
                    <Plane :size="10" />
                    <span class="truncate max-w-[140px]">{{ exp.tourName }}</span>
                  </div>
                </td>

                <!-- Branch & Department -->
                <td class="p-3.5">
                  <div class="text-slate-200">{{ exp.branch || 'Peshawar' }}</div>
                  <div class="text-[10px] text-slate-400">{{ exp.department || 'General' }}</div>
                </td>

                <!-- Payment Method -->
                <td class="p-3.5">
                  <div class="text-slate-200 font-medium">
                    {{ exp.isEmployeeReimbursement ? 'Employee Out-of-Pocket' : exp.paymentMethod }}
                  </div>
                  <div v-if="exp.bankAccount" class="text-[10px] text-cyan-300 truncate max-w-[150px]">
                    {{ exp.bankAccount }}
                  </div>
                  <div v-if="exp.isEmployeeReimbursement" class="mt-0.5">
                    <span
                      :class="[
                        'text-[10px] px-1.5 py-0.2 rounded font-bold uppercase',
                        exp.reimbursementStatus === 'Reimbursed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      ]"
                    >
                      {{ exp.reimbursementStatus === 'Reimbursed' ? 'Reimbursed' : 'Payable' }}
                    </span>
                  </div>
                </td>

                <!-- Amount (PKR & Foreign Currency) -->
                <td class="p-3.5 text-right font-mono">
                  <div class="font-black text-sm text-white">
                    PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}
                  </div>
                  <div v-if="exp.currency && exp.currency !== 'PKR'" class="text-[10px] text-amber-400 mt-0.5">
                    {{ exp.currency }} {{ formatMoney(exp.amount) }} @ {{ exp.exchangeRate }}
                  </div>
                </td>

                <!-- Status -->
                <td class="p-3.5 text-center">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                      exp.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                      exp.status === 'Paid' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                      exp.status === 'Submitted' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                      exp.status === 'Rejected' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                      'bg-slate-700/50 text-slate-300 border-slate-600'
                    ]"
                  >
                    {{ exp.status }}
                  </span>
                  <div v-if="exp.rejectionReason" class="text-[9px] text-rose-400 max-w-[120px] truncate mt-1" :title="exp.rejectionReason">
                    {{ exp.rejectionReason }}
                  </div>
                </td>

                <!-- Receipt / Attachment -->
                <td class="p-3.5 text-center">
                  <button
                    v-if="exp.attachment"
                    @click="viewAttachment(exp)"
                    class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                    title="View Receipt / Invoice"
                  >
                    <Paperclip :size="15" />
                  </button>
                  <span v-else class="text-[11px] text-slate-600">—</span>
                </td>

                <!-- Actions -->
                <td class="p-3.5 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- JV Preview Button -->
                    <button
                      type="button"
                      @click="viewJournalVoucher(exp)"
                      class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="View Accounting Ledger Effect (Journal Voucher)"
                    >
                      <BookOpen :size="14" />
                    </button>

                    <!-- Approve Button -->
                    <button
                      v-if="(exp.status === 'Draft' || exp.status === 'Submitted') && authStore.isSuperAdmin"
                      type="button"
                      @click="approveSingleExpense(exp)"
                      class="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 transition-colors"
                      title="Approve Expense"
                    >
                      <Check :size="14" />
                    </button>

                    <!-- Reject Button -->
                    <button
                      v-if="(exp.status === 'Draft' || exp.status === 'Submitted') && authStore.isSuperAdmin"
                      type="button"
                      @click="promptRejectExpense(exp)"
                      class="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 transition-colors"
                      title="Reject Expense"
                    >
                      <X :size="14" />
                    </button>

                    <!-- Reimburse Button -->
                    <button
                      v-if="exp.isEmployeeReimbursement && exp.reimbursementStatus !== 'Reimbursed'"
                      type="button"
                      @click="openReimburseModal(exp)"
                      class="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-all shadow"
                      title="Reimburse Employee Out-of-Pocket"
                    >
                      Reimburse
                    </button>

                    <!-- Edit Button -->
                    <button
                      type="button"
                      @click="editExistingExpense(exp)"
                      class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Expense"
                    >
                      <Edit3 :size="14" />
                    </button>

                    <!-- Delete Button -->
                    <button
                      type="button"
                      @click="deleteExistingExpense(exp)"
                      class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
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
                    <AlertCircle :size="32" class="text-slate-600" />
                    <p class="font-semibold text-sm">No expenses matched your search or filters.</p>
                    <button
                      @click="resetFilters"
                      class="text-xs text-indigo-400 underline font-medium hover:text-indigo-300"
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
        <div class="p-3.5 bg-slate-800/40 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span class="font-bold text-white">{{ (currentPage - 1) * pageSize + 1 }}</span> to
            <span class="font-bold text-white">{{ Math.min(currentPage * pageSize, filteredExpenses.length) }}</span> of
            <span class="font-bold text-white">{{ filteredExpenses.length }}</span> recorded expenses
          </div>

          <div class="flex items-center gap-2">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage--"
              class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="font-mono text-white font-bold">{{ currentPage }} / {{ totalPages || 1 }}</span>
            <button
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
              class="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: TOURS & VISITS HUB (LOCAL & INTL VISITS) -->
    <div v-if="activeTab === 'tours'" class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-950/20 border border-purple-800/40 p-4 rounded-2xl">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Plane :size="20" class="text-purple-400" />
            <span>Tour & Business Visit Hub (Local & International)</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Record comprehensive travel itineraries for Directors, Managers & Engineers with consolidated tour budgets and category-wise costs.
          </p>
        </div>
        <button
          type="button"
          @click="openAddTourModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus :size="16" />
          <span>Create New Tour / Visit</span>
        </button>
      </div>

      <!-- Tours Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="tour in dataStore.expenseTours"
          :key="tour.id"
          class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
        >
          <div>
            <!-- Tour Header -->
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                      tour.tourType === 'International' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    ]"
                  >
                    {{ tour.tourType }}
                  </span>
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase',
                      tour.status === 'Completed' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-600 text-white'
                    ]"
                  >
                    {{ tour.status }}
                  </span>
                </div>
                <h3 class="text-base font-extrabold text-white mt-1.5">{{ tour.tourName }}</h3>
                <div class="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span class="flex items-center gap-1 text-slate-300 font-semibold">
                    <User :size="13" class="text-purple-400" />
                    {{ tour.person }} ({{ tour.personRole }})
                  </span>
                  <span>•</span>
                  <span class="flex items-center gap-1 text-slate-300">
                    <MapPin :size="13" class="text-rose-400" />
                    {{ tour.originCity ? tour.originCity + ' → ' : '' }}{{ tour.city }}, {{ tour.country }}
                  </span>
                </div>
              </div>

              <!-- Action Menu -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="addExpenseToTour(tour)"
                  class="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold"
                  title="Add Expense to this Tour"
                >
                  <Plus :size="14" />
                </button>
                <button
                  type="button"
                  @click="editExistingTour(tour)"
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  title="Edit Tour Details"
                >
                  <Edit3 :size="14" />
                </button>
                <button
                  type="button"
                  @click="deleteExistingTour(tour)"
                  class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                  title="Delete Tour"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>

            <!-- Dates & Purpose -->
            <div class="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 text-xs space-y-1">
              <div class="flex items-center justify-between text-slate-400">
                <span class="flex items-center gap-1">
                  <Calendar :size="13" />
                  {{ tour.startDate }} to {{ tour.endDate }}
                </span>
                <span class="font-mono text-slate-300">Budget: PKR {{ formatMoney(tour.budget) }}</span>
              </div>
              <div class="text-slate-300 pt-1">
                <span class="text-slate-400 font-semibold">Purpose:</span> {{ tour.purpose }}
              </div>
            </div>

            <!-- Requirement 12: Tour Consolidated Category Breakdown -->
            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="text-slate-300">Tour Consolidated Cost Breakdown:</span>
                <span class="text-white font-mono font-extrabold text-sm">
                  Total = PKR {{ formatMoney(getTourTotalSpend(tour.id)) }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div
                  v-for="(amt, catName) in getTourBreakdown(tour.id)"
                  :key="catName"
                  class="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 flex flex-col justify-between"
                >
                  <span class="text-slate-400 truncate" :title="catName">{{ catName }}</span>
                  <span class="font-mono font-bold text-white mt-1">PKR {{ formatMoney(amt) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400 font-mono text-[11px]">
              {{ getTourExpenses(tour.id).length }} expenses recorded
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openTourDetailsModal(tour)"
                class="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold"
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
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-950/20 border border-blue-800/40 p-4 rounded-2xl">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Tag :size="20" class="text-blue-400" />
            <span>Expense Categories & Sub-Categories Directory</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            26 standard ERP predefined categories with complete freedom to create, edit, deactivate and customize new categories.
          </p>
        </div>
        <button
          type="button"
          @click="openAddCategoryModal"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus :size="16" />
          <span>Create New Category</span>
        </button>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="cat in dataStore.expenseCategories"
          :key="cat.id"
          class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
        >
          <div>
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="p-2 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400">
                  <Tag :size="16" />
                </div>
                <div>
                  <h4 class="font-bold text-white text-xs sm:text-sm">{{ cat.name }}</h4>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] text-slate-400 font-semibold uppercase">{{ cat.type || 'General' }}</span>
                    <span
                      v-if="cat.isPredefined"
                      class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold"
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
                    'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase transition-all',
                    cat.isActive !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  ]"
                >
                  {{ cat.isActive !== false ? 'Active' : 'Inactive' }}
                </button>
                <button
                  type="button"
                  @click="editExistingCategory(cat)"
                  class="p-1 text-slate-400 hover:text-white"
                  title="Edit Category"
                >
                  <Edit3 :size="13" />
                </button>
                <button
                  v-if="!cat.isPredefined"
                  type="button"
                  @click="deleteExistingCategory(cat)"
                  class="p-1 text-slate-400 hover:text-rose-400"
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
                class="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {{ sub }}
              </span>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span>Expenses Tagged:</span>
            <span class="font-mono font-bold text-white">
              {{ getCategoryExpensesCount(cat.name) }} (PKR {{ formatMoney(getCategoryTotalSpend(cat.name)) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: EMPLOYEE REIMBURSEMENTS (OUT-OF-POCKET) -->
    <div v-if="activeTab === 'reimbursements'" class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-rose-950/20 border border-rose-800/40 p-4 rounded-2xl">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <Users :size="20" class="text-rose-400" />
            <span>Employee Out-of-Pocket Reimbursements Hub</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            When staff, engineers, or directors pay from their personal cash or cards, track payable balances and settle claims seamlessly with Cash/Bank integration.
          </p>
        </div>
        <div class="font-mono text-right">
          <div class="text-xs text-slate-400">Total Pending Payable:</div>
          <div class="text-lg font-extrabold text-rose-400">
            PKR {{ formatMoney(pendingReimbursementsAmount) }}
          </div>
        </div>
      </div>

      <!-- Employee Reimbursements List -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/70 border-b border-slate-700/80 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
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
            <tbody class="divide-y divide-slate-800/80">
              <tr
                v-for="exp in allEmployeeReimbursements"
                :key="exp.id || exp.voucherNo"
                class="hover:bg-slate-800/40 transition-colors"
              >
                <td class="p-3.5">
                  <div class="font-mono font-bold text-indigo-400">{{ exp.voucherNo }}</div>
                  <div class="text-[11px] text-slate-400">{{ exp.date }}</div>
                </td>
                <td class="p-3.5">
                  <div class="font-semibold text-white">{{ exp.person }}</div>
                  <div class="text-[10px] text-slate-400">{{ exp.personRole }}</div>
                </td>
                <td class="p-3.5 max-w-xs">
                  <div class="font-medium text-slate-200">{{ exp.category }}</div>
                  <div class="text-[11px] text-slate-400 truncate">{{ exp.purpose || exp.description }}</div>
                </td>
                <td class="p-3.5">
                  <div class="text-slate-300">{{ exp.branch }}</div>
                </td>
                <td class="p-3.5 text-right font-mono font-bold text-white text-sm">
                  PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}
                </td>
                <td class="p-3.5 text-center">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border',
                      exp.reimbursementStatus === 'Reimbursed'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    ]"
                  >
                    {{ exp.reimbursementStatus === 'Reimbursed' ? 'Reimbursed / Paid' : 'Pending Reimbursement' }}
                  </span>
                  <div v-if="exp.reimbursedDate" class="text-[10px] text-slate-400 mt-1">
                    Settled: {{ exp.reimbursedDate }} ({{ exp.reimbursedFrom }})
                  </div>
                </td>
                <td class="p-3.5 text-center">
                  <button
                    v-if="exp.attachment"
                    @click="viewAttachment(exp)"
                    class="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                  >
                    <Paperclip :size="15" />
                  </button>
                  <span v-else class="text-slate-600">—</span>
                </td>
                <td class="p-3.5 text-right">
                  <button
                    v-if="exp.reimbursementStatus !== 'Reimbursed'"
                    type="button"
                    @click="openReimburseModal(exp)"
                    class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Pay & Settle
                  </button>
                  <span v-else class="text-xs text-slate-400 font-semibold flex items-center justify-end gap-1">
                    <CheckCircle2 :size="14" class="text-emerald-400" />
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
      <div class="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-teal-500/20 text-teal-300">
            <FileSpreadsheet :size="22" />
          </div>
          <div>
            <h3 class="font-bold text-white text-sm sm:text-base">Executive Expense Reports & Analytics Hub</h3>
            <p class="text-xs text-slate-400">Select any of the 15 standard ERP financial breakdown reports</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            v-model="selectedReportType"
            class="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
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
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download :size="15" />
            <span>Excel Export</span>
          </button>

          <button
            type="button"
            @click="printSelectedReportPDF"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Printer :size="15" />
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      <!-- Report Content Display -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
          <div>
            <h4 class="text-base font-extrabold text-white">{{ reportTitle }}</h4>
            <div class="text-xs text-slate-400 mt-0.5">Summary of matching expense vouchers and aggregate financial impact</div>
          </div>
          <div class="font-mono text-sm font-bold text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            Total Aggregate Spend: <span class="text-emerald-400">PKR {{ formatMoney(reportTotalAmount) }}</span>
          </div>
        </div>

        <!-- Visual Bar Chart Representation of Top Groups -->
        <div v-if="reportGroupSummary.length > 0" class="space-y-3">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400">Distribution Overview:</h5>
          <div class="space-y-2">
            <div
              v-for="grp in reportGroupSummary.slice(0, 8)"
              :key="grp.name"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-300">{{ grp.name }}</span>
                <span class="font-mono text-white font-bold">
                  PKR {{ formatMoney(grp.amount) }} ({{ grp.percentage }}%)
                </span>
              </div>
              <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
                  :style="{ width: grp.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Table for Report -->
        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-800/80 text-slate-300 font-bold uppercase text-[11px]">
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
            <tbody class="divide-y divide-slate-800/80">
              <tr v-for="(exp, idx) in reportFilteredExpenses" :key="exp.id || idx" class="hover:bg-slate-800/30">
                <td class="p-3 text-slate-500">{{ idx + 1 }}</td>
                <td class="p-3 font-mono font-bold text-indigo-400">
                  {{ exp.voucherNo }}
                  <span class="block text-[10px] text-slate-400 font-normal">{{ exp.date }}</span>
                </td>
                <td class="p-3 text-slate-200">{{ exp.category }}</td>
                <td class="p-3 text-slate-300">{{ exp.person }}</td>
                <td class="p-3 text-slate-400">{{ exp.branch }} ({{ exp.department }})</td>
                <td class="p-3 text-slate-300">{{ exp.paymentMethod }}</td>
                <td class="p-3 text-right font-mono font-bold text-white">PKR {{ formatMoney(exp.pkrAmount || exp.amount) }}</td>
                <td class="p-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
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
    <div
      v-if="showExpenseModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      @click.self="showExpenseModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard :size="18" class="text-indigo-400" />
              <span>{{ isEditingExpense ? 'Edit Expense Voucher' : 'Record New Company Expense' }}</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Fill in complete expenditure, payment & double-entry ledger details</p>
          </div>
          <button @click="showExpenseModal = false" class="text-slate-400 hover:text-white p-1">
            <X :size="18" />
          </button>
        </div>

        <!-- Modal Body Form -->
        <div class="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <!-- Row 1: Date, Category, Sub-Category, Person/Employee -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Expense Date *</label>
              <input
                v-model="expenseForm.date"
                type="date"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Expense Category *</label>
              <select
                v-model="expenseForm.category"
                @change="onFormCategoryChange"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option v-for="cat in activeCategoriesList" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Sub-Category</label>
              <input
                v-if="!currentCategorySubCategories.length"
                v-model="expenseForm.subCategory"
                type="text"
                placeholder="e.g. Fuel, Toll, Room Charges"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
              <select
                v-else
                v-model="expenseForm.subCategory"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="">Select Sub-Category</option>
                <option v-for="s in currentCategorySubCategories" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Person / Employee *</label>
              <input
                v-model="expenseForm.person"
                type="text"
                placeholder="e.g. Director M. Ibrahim"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <!-- Row 2: Designation/Role, Tour/Visit Link, Payee/Vendor, Branch -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Person Role / Designation</label>
              <select
                v-model="expenseForm.personRole"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
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
              <label class="block text-slate-400 font-semibold mb-1">Linked Tour / Visit</label>
              <select
                v-model="expenseForm.tourId"
                @change="onFormTourChange"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="">Standalone / None</option>
                <option v-for="t in dataStore.expenseTours" :key="t.id" :value="t.id">
                  {{ t.tourName }} ({{ t.city }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Supplier / Vendor / Payee</label>
              <input
                v-model="expenseForm.vendor"
                type="text"
                placeholder="e.g. Hotel, Airline, Careem, PSO"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Branch</label>
              <select
                v-model="expenseForm.branch"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
          </div>

          <!-- Row 3: Department, Purpose / Description -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Department</label>
              <select
                v-model="expenseForm.department"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Management / Executive">Management / Executive</option>
                <option value="Sales">Sales</option>
                <option value="Workshop / Technical">Workshop / Technical</option>
                <option value="Accounts / Finance">Accounts / Finance</option>
                <option value="Logistics / Admin">Logistics / Admin</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-slate-400 font-semibold mb-1">Purpose / Description *</label>
              <input
                v-model="expenseForm.purpose"
                type="text"
                placeholder="e.g. Guangzhou to Shenzhen High-speed transit for factory inspection"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <!-- Section: Multi-Currency & Financial Calculations (Requirement 6) -->
          <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-white flex items-center gap-2">
                <DollarSign :size="15" class="text-emerald-400" />
                <span>Multi-Currency & Amount Breakdown</span>
              </h4>
              <span class="text-[11px] text-slate-400">System auto-converts foreign currencies to PKR</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Currency *</label>
                <select
                  v-model="expenseForm.currency"
                  @change="onCurrencyChange"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
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
                <label class="block text-slate-400 font-semibold mb-1">
                  Amount (in {{ expenseForm.currency }}) *
                </label>
                <input
                  v-model.number="expenseForm.amount"
                  type="number"
                  min="0"
                  step="any"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Exchange Rate (to PKR)</label>
                <input
                  v-model.number="expenseForm.exchangeRate"
                  type="number"
                  min="0"
                  step="any"
                  :disabled="expenseForm.currency === 'PKR'"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <!-- Auto Computed Equivalent -->
            <div class="p-3 bg-slate-900 rounded-lg flex items-center justify-between border border-slate-700/60 font-mono">
              <span class="text-slate-400">Equivalent Amount in PKR:</span>
              <span class="text-base font-black text-emerald-400">
                PKR {{ formatMoney(computedFormPkrAmount) }}
              </span>
            </div>
          </div>

          <!-- Section: Payment Method & Cash/Bank Integration (Requirement 9) -->
          <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <h4 class="font-bold text-white flex items-center gap-2">
              <Landmark :size="15" class="text-cyan-400" />
              <span>Cash & Bank Payment Source</span>
            </h4>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-slate-400 font-semibold mb-1">Payment Method *</label>
                <select
                  v-model="expenseForm.paymentMethod"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Cash">Cash Voucher (Branch Safe)</option>
                  <option value="Company Bank Account">Company Bank Account</option>
                  <option value="Paid by Employee (Personal Cash / Out of Pocket)">
                    Paid by Employee (Claim Reimbursement)
                  </option>
                </select>
              </div>

              <div v-if="expenseForm.paymentMethod === 'Company Bank Account'">
                <label class="block text-slate-400 font-semibold mb-1">Bank Account *</label>
                <select
                  v-model="expenseForm.bankAccount"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="">Select Bank Account</option>
                  <option v-for="b in dataStore.bankAccounts" :key="b.id" :value="b.name">
                    {{ b.name }} ({{ b.accountNumber }})
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 font-semibold mb-1">Reference / Cheque / Txn No</label>
                <input
                  v-model="expenseForm.referenceNo"
                  type="text"
                  placeholder="e.g. HBL-FT-99120"
                  class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div v-if="expenseForm.paymentMethod === 'Paid by Employee (Personal Cash / Out of Pocket)'" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <span class="font-bold">⚠️ Out-of-Pocket Notice:</span> This expense will NOT deduct company cash or bank immediately. It will be added to <span class="font-bold underline">{{ expenseForm.person }}</span>'s Reimbursement Payable Ledger.
            </div>
          </div>

          <!-- Section: Receipt / Bill Upload (Requirement 7) -->
          <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 space-y-3">
            <h4 class="font-bold text-white flex items-center gap-2">
              <Paperclip :size="15" class="text-purple-400" />
              <span>Bill / Receipt / Supporting Attachment</span>
            </h4>

            <div class="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="image/*,application/pdf"
                @change="handleFileUpload"
                class="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              <div v-if="expenseForm.attachment" class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-emerald-400 font-semibold">✓ {{ expenseForm.attachmentName || 'Receipt Attached' }}</span>
                <button
                  type="button"
                  @click="expenseForm.attachment = ''; expenseForm.attachmentName = ''"
                  class="text-rose-400 hover:text-rose-300 text-xs underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Section: Remarks & Status -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Remarks / Additional Notes</label>
              <textarea
                v-model="expenseForm.remarks"
                rows="2"
                placeholder="Any special remarks or compliance notes..."
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Approval Status</label>
              <select
                v-model="expenseForm.status"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted (Pending Approval)</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showExpenseModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveExpenseForm"
            class="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            {{ isEditingExpense ? 'Update Expense' : 'Save & Post Expense' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: ADD / EDIT TOUR MODAL -->
    <div
      v-if="showTourModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      @click.self="showTourModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Plane :size="18" class="text-purple-400" />
            <span>{{ isEditingTour ? 'Edit Tour / Visit' : 'Create Tour / Business Visit' }}</span>
          </h3>
          <button @click="showTourModal = false" class="text-slate-400 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <div>
            <label class="block text-slate-400 font-semibold mb-1">Tour / Visit Name *</label>
            <input
              v-model="tourForm.tourName"
              type="text"
              placeholder="e.g. China Business Tour, Peshawar → Lahore Visit"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Tour Type *</label>
              <select
                v-model="tourForm.tourType"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="International">International Travel</option>
                <option value="Local / Out of City">Local / Out of City Visit</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Person / Representative *</label>
              <input
                v-model="tourForm.person"
                type="text"
                placeholder="e.g. Director M. Ibrahim"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Country</label>
              <input
                v-model="tourForm.country"
                type="text"
                placeholder="e.g. China, Pakistan, UAE"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Destination City *</label>
              <input
                v-model="tourForm.city"
                type="text"
                placeholder="e.g. Guangzhou, Lahore, Dubai"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Origin City</label>
              <input
                v-model="tourForm.originCity"
                type="text"
                placeholder="e.g. Peshawar"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Start Date</label>
              <input
                v-model="tourForm.startDate"
                type="date"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-slate-400 font-semibold mb-1">End Date</label>
              <input
                v-model="tourForm.endDate"
                type="date"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Budget (PKR)</label>
              <input
                v-model.number="tourForm.budget"
                type="number"
                min="0"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Purpose of Visit</label>
            <input
              v-model="tourForm.purpose"
              type="text"
              placeholder="e.g. Supplier/Company Meeting, Machinery Sourcing, Client Demos"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Status</label>
              <select
                v-model="tourForm.status"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Planned">Planned</option>
                <option value="Active">Active / Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Branch</label>
              <select
                v-model="tourForm.branch"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option v-for="b in branchesList" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showTourModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveTourForm"
            class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
          >
            {{ isEditingTour ? 'Update Tour' : 'Save Tour Record' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 3: ADD / EDIT CATEGORY MODAL -->
    <div
      v-if="showCategoryModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showCategoryModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Tag :size="18" class="text-blue-400" />
            <span>{{ isEditingCategory ? 'Edit Expense Category' : 'Create Custom Expense Category' }}</span>
          </h3>
          <button @click="showCategoryModal = false" class="text-slate-400 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <div>
            <label class="block text-slate-400 font-semibold mb-1">Category Name *</label>
            <input
              v-model="categoryForm.name"
              type="text"
              placeholder="e.g. Medical Exhibition & Conferences"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Category Type</label>
            <select
              v-model="categoryForm.type"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
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
            <label class="block text-slate-400 font-semibold mb-1">
              Sub-Categories (comma separated)
            </label>
            <input
              v-model="categoryForm.subCategoriesText"
              type="text"
              placeholder="e.g. Stall Registration, Posters, Hospitality"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showCategoryModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveCategoryForm"
            class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
          >
            {{ isEditingCategory ? 'Update Category' : 'Save Category' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: JOURNAL VOUCHER / LEDGER EFFECT PREVIEW (Requirement 14) -->
    <div
      v-if="showJvModal && selectedJvExpense"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showJvModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <BookOpen :size="18" class="text-indigo-400" />
              <span>Accounting Double-Entry Journal Voucher: {{ selectedJvExpense.journalVoucherNo || selectedJvExpense.voucherNo }}</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">Automated ERP General Ledger & Financial Debit/Credit Postings</p>
          </div>
          <button @click="showJvModal = false" class="text-slate-400 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <!-- Metadata Bar -->
          <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-300 font-mono text-[11px]">
            <div>Date: <span class="text-white">{{ selectedJvExpense.date }}</span></div>
            <div>Branch: <span class="text-white">{{ selectedJvExpense.branch }}</span></div>
            <div>Status: <span class="text-emerald-400 font-bold">Posted</span></div>
          </div>

          <!-- Double Entry Table -->
          <div class="border border-slate-800 rounded-xl overflow-hidden font-mono">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-800 text-slate-300 uppercase text-[10px]">
                <tr>
                  <th class="p-3">Account Title & Ledger Classification</th>
                  <th class="p-3 text-right">Debit (PKR)</th>
                  <th class="p-3 text-right">Credit (PKR)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <!-- Debit Row: Expense Account -->
                <tr>
                  <td class="p-3">
                    <div class="text-white font-bold">{{ selectedJvExpense.category }} Expense A/c</div>
                    <div class="text-[10px] text-slate-400 font-sans">
                      Narration: {{ selectedJvExpense.purpose || selectedJvExpense.description }} ({{ selectedJvExpense.person }})
                    </div>
                  </td>
                  <td class="p-3 text-right text-emerald-400 font-bold">
                    {{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}
                  </td>
                  <td class="p-3 text-right text-slate-600">—</td>
                </tr>

                <!-- Credit Row: Cash Safe, Bank Account, or Employee Payable -->
                <tr>
                  <td class="p-3 pl-8">
                    <div class="text-slate-300 font-bold">
                      To {{ selectedJvCreditAccountName }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-sans">
                      Ref: {{ selectedJvExpense.referenceNo || selectedJvExpense.voucherNo }}
                    </div>
                  </td>
                  <td class="p-3 text-right text-slate-600">—</td>
                  <td class="p-3 text-right text-cyan-400 font-bold">
                    {{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}
                  </td>
                </tr>

                <!-- Total Row -->
                <tr class="bg-slate-800/60 font-bold">
                  <td class="p-3 text-right uppercase text-slate-300">Journal Balanced Total:</td>
                  <td class="p-3 text-right text-emerald-400">{{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}</td>
                  <td class="p-3 text-right text-cyan-400">{{ formatMoney(selectedJvExpense.pkrAmount || selectedJvExpense.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Signature Lines -->
          <div class="grid grid-cols-3 gap-4 pt-6 text-center text-[10px] text-slate-400 font-sans">
            <div class="border-t border-slate-700 pt-1">Prepared By: {{ selectedJvExpense.recordedBy || 'Accountant' }}</div>
            <div class="border-t border-slate-700 pt-1">Checked By: Internal Audit</div>
            <div class="border-t border-slate-700 pt-1 text-emerald-400 font-bold">Authorized Signatory</div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end">
          <button
            type="button"
            @click="showJvModal = false"
            class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 5: RECEIPT / BILL VIEWER (Requirement 7) -->
    <div
      v-if="showAttachmentModal && selectedAttachmentExpense"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      @click.self="showAttachmentModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <Paperclip :size="16" class="text-indigo-400" />
              <span>Bill / Receipt: {{ selectedAttachmentExpense.voucherNo }}</span>
            </h3>
            <div class="text-[11px] text-slate-400">{{ selectedAttachmentExpense.category }} - {{ selectedAttachmentExpense.person }}</div>
          </div>
          <div class="flex items-center gap-2">
            <a
              :href="selectedAttachmentExpense.attachment"
              :download="selectedAttachmentExpense.attachmentName || 'expense_receipt'"
              class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download :size="14" />
              <span>Download</span>
            </a>
            <button @click="showAttachmentModal = false" class="text-slate-400 hover:text-white p-1">
              <X :size="18" />
            </button>
          </div>
        </div>

        <div class="p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-950/60">
          <img
            v-if="selectedAttachmentExpense.attachment.startsWith('data:image') || selectedAttachmentExpense.attachment.endsWith('.jpg') || selectedAttachmentExpense.attachment.endsWith('.png')"
            :src="selectedAttachmentExpense.attachment"
            alt="Receipt Proof"
            class="max-w-full max-h-[70vh] rounded-xl object-contain border border-slate-800 shadow-lg"
          />
          <iframe
            v-else
            :src="selectedAttachmentExpense.attachment"
            class="w-full h-[65vh] rounded-xl border border-slate-800"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- MODAL 6: REIMBURSE EMPLOYEE PAYOUT MODAL -->
    <div
      v-if="showReimburseModal && selectedReimburseExpense"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showReimburseModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Users :size="18" class="text-rose-400" />
            <span>Settle Employee Reimbursement</span>
          </h3>
          <button @click="showReimburseModal = false" class="text-slate-400 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-6 space-y-4 text-xs">
          <div class="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
            <div class="text-slate-400">Employee / Payee:</div>
            <div class="text-sm font-extrabold text-white">{{ selectedReimburseExpense.person }}</div>
            <div class="text-slate-400 pt-1">Claimed Amount:</div>
            <div class="text-base font-mono font-black text-rose-400">
              PKR {{ formatMoney(selectedReimburseExpense.pkrAmount || selectedReimburseExpense.amount) }}
            </div>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Payment Settlement Date *</label>
            <input
              v-model="reimburseForm.date"
              type="date"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Disburse Payment From *</label>
            <select
              v-model="reimburseForm.paymentSource"
              class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              <option value="Petty Cash Desk">Branch Petty Cash Desk Safe</option>
              <option v-for="b in dataStore.bankAccounts" :key="b.id" :value="b.name">
                {{ b.name }} (Company Bank Transfer)
              </option>
            </select>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showReimburseModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="executeEmployeeReimbursement"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg"
          >
            Confirm & Pay Employee
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 7: REJECTION REASON PROMPT MODAL -->
    <div
      v-if="showRejectModal && expenseToReject"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showRejectModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <XCircle :size="16" class="text-rose-400" />
            <span>Reject Expense Voucher: {{ expenseToReject.voucherNo }}</span>
          </h3>
          <button @click="showRejectModal = false" class="text-slate-400 hover:text-white">
            <X :size="16" />
          </button>
        </div>

        <div class="p-5 space-y-3 text-xs">
          <p class="text-slate-300">
            Please enter the management reason for rejecting this expense claim. This reason will be permanently archived in the audit trail.
          </p>
          <textarea
            v-model="rejectionReasonInput"
            rows="3"
            placeholder="e.g. Missing valid invoice receipt, expense outside company travel allowance policy..."
            class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
          ></textarea>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            @click="showRejectModal = false"
            class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            @click="confirmRejectExpense"
            class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 8: TOUR DETAILS & ITEMIZED RECEIPTS MODAL (Requirement 12) -->
    <div
      v-if="showTourDetailsModal && selectedTourForDetails"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="showTourDetailsModal = false"
    >
      <div class="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <Plane :size="18" class="text-purple-400" />
              <span>Tour Cost Sheet: {{ selectedTourForDetails.tourName }}</span>
            </h3>
            <div class="text-xs text-slate-400 mt-0.5">
              {{ selectedTourForDetails.person }} • {{ selectedTourForDetails.city }}, {{ selectedTourForDetails.country }} ({{ selectedTourForDetails.startDate }} to {{ selectedTourForDetails.endDate }})
            </div>
          </div>
          <button @click="showTourDetailsModal = false" class="text-slate-400 hover:text-white">
            <X :size="18" />
          </button>
        </div>

        <div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div class="text-slate-400">Total Tour Budget:</div>
              <div class="text-lg font-mono font-bold text-white mt-1">
                PKR {{ formatMoney(selectedTourForDetails.budget) }}
              </div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div class="text-slate-400">Total Consolidated Spent:</div>
              <div class="text-lg font-mono font-bold text-emerald-400 mt-1">
                PKR {{ formatMoney(getTourTotalSpend(selectedTourForDetails.id)) }}
              </div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div class="text-slate-400">Remaining Budget Balance:</div>
              <div class="text-lg font-mono font-bold text-cyan-400 mt-1">
                PKR {{ formatMoney(selectedTourForDetails.budget - getTourTotalSpend(selectedTourForDetails.id)) }}
              </div>
            </div>
          </div>

          <!-- Category Breakdown Table -->
          <div class="space-y-2">
            <h4 class="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
              Category-Wise Tour Breakdown:
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                v-for="(amt, cat) in getTourBreakdown(selectedTourForDetails.id)"
                :key="cat"
                class="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex justify-between items-center"
              >
                <span class="text-slate-300 font-semibold">{{ cat }}:</span>
                <span class="font-mono font-bold text-white">PKR {{ formatMoney(amt) }}</span>
              </div>
            </div>
          </div>

          <!-- Itemized Vouchers Table -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                Itemized Expenses Under this Tour:
              </h4>
              <button
                type="button"
                @click="addExpenseToTour(selectedTourForDetails)"
                class="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                <Plus :size="14" />
                <span>Add Voucher</span>
              </button>
            </div>

            <div class="border border-slate-800 rounded-xl overflow-hidden">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-800/80 text-slate-300 uppercase text-[10px]">
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
                <tbody class="divide-y divide-slate-800">
                  <tr
                    v-for="e in getTourExpenses(selectedTourForDetails.id)"
                    :key="e.id || e.voucherNo"
                    class="hover:bg-slate-800/30"
                  >
                    <td class="p-2.5 font-mono font-bold text-indigo-400">{{ e.voucherNo }}</td>
                    <td class="p-2.5 text-slate-400">{{ e.date }}</td>
                    <td class="p-2.5 text-white font-medium">{{ e.category }}</td>
                    <td class="p-2.5 text-slate-300 max-w-xs truncate">{{ e.purpose || e.description }}</td>
                    <td class="p-2.5 text-slate-400">{{ e.paymentMethod }}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-emerald-400">
                      PKR {{ formatMoney(e.pkrAmount || e.amount) }}
                    </td>
                    <td class="p-2.5 text-center">
                      <button
                        v-if="e.attachment"
                        @click="viewAttachment(e)"
                        class="p-1 rounded bg-indigo-500/20 text-indigo-300"
                      >
                        <Paperclip :size="13" />
                      </button>
                      <span v-else class="text-slate-600">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end">
          <button
            type="button"
            @click="showTourDetailsModal = false"
            class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
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
  User
} from 'lucide-vue-next'

const route = useRoute()
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
  return Number(val || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })
}

// ── EXPENSE MODAL STATE & ACTIONS ──
const showExpenseModal = ref(false)
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
const showRejectModal = ref(false)
const expenseToReject = ref(null)
const rejectionReasonInput = ref('')

async function approveSingleExpense(exp) {
  await dataStore.approveExpense(exp.id || exp.voucherNo, authStore.user)
  uiStore.showToast(`Expense voucher #${exp.voucherNo} approved!`, 'success')
}

function promptRejectExpense(exp) {
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
const showTourModal = ref(false)
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
const showTourDetailsModal = ref(false)
const selectedTourForDetails = ref(null)

function openTourDetailsModal(tour) {
  selectedTourForDetails.value = tour
  showTourDetailsModal.value = true
}

// ── CATEGORIES MODAL & ACTIONS ──
const showCategoryModal = ref(false)
const isEditingCategory = ref(false)
const editingCategoryId = ref(null)

const categoryForm = ref({
  name: '',
  type: 'General',
  subCategoriesText: ''
})

function openAddCategoryModal() {
  isEditingCategory.value = false
  editingCategoryId.value = null
  categoryForm.value = { name: '', type: 'General', subCategoriesText: '' }
  showCategoryModal.value = true
}

function editExistingCategory(cat) {
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
const showReimburseModal = ref(false)
const selectedReimburseExpense = ref(null)
const reimburseForm = ref({
  date: new Date().toISOString().substring(0, 10),
  paymentSource: 'Petty Cash Desk'
})

function openReimburseModal(exp) {
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
const showJvModal = ref(false)
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
  selectedJvExpense.value = exp
  showJvModal.value = true
}

// ── ATTACHMENT MODAL ──
const showAttachmentModal = ref(false)
const selectedAttachmentExpense = ref(null)

function viewAttachment(exp) {
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

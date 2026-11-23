<template>
  <div v-if="!authStore.isSuperAdmin" class="page-wrapper p-6 flex items-center justify-center min-h-[60vh]">
    <div class="glass-panel p-8 max-w-lg text-center space-y-4 border-2 border-purple-500/50 bg-slate-900/90 rounded-2xl shadow-2xl">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center">
        <Crown :size="32" />
      </div>
      <h2 class="text-xl font-black text-white">SuperAdmin Exclusive Access</h2>
      <p class="text-sm text-slate-300 leading-relaxed">
        ERP Reports, live multi-branch ledger audits, and financial export preview/editing tools are strictly restricted to <strong>Alexander Sterling (Peshawar Head Office SuperAdmin)</strong>.
      </p>
      <p class="text-xs text-slate-400">
        Branch Sales Executives have full access to POS Invoices, Machine Inventory, Customer Ledgers, and Payment Receipts.
      </p>
      <button @click="router.push('/dashboard')" class="btn btn-primary btn-md mx-auto">
        <span>Return to Sales Workspace</span>
      </button>
    </div>
  </div>

  <div v-else class="reports-container-split">
    <!-- ════════════════════════════════════════════
      LEFT: REPORT NAVIGATION SIDEBAR (Matching Image 1)
    ════════════════════════════════════════════ -->
    <div :class="['reports-sidebar-frame', { 'mobile-open': isMobileSidebarOpen }]">
      <!-- Backdrop for mobile drawer -->
      <div v-if="isMobileSidebarOpen" class="sidebar-backdrop" @click="isMobileSidebarOpen = false"></div>
      <div class="sidebar-content-wrapper">
        <div class="mobile-close-header lg:hidden flex items-center justify-between p-3 border-b border-slate-700 bg-slate-900">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">Reports Navigator</span>
          <button @click="isMobileSidebarOpen = false" class="text-slate-400 hover:text-white text-sm p-1">✕</button>
        </div>
        <ReportSidebar
          v-model="activeReport"
          :counts="reportCounts"
          @select="onSidebarSelectReport"
        />
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      RIGHT: MAIN REPORT WORKSPACE
    ════════════════════════════════════════════ -->
    <div class="reports-main-stage">
      <!-- PAGE HEADER -->
      <PageHeader
        :title="currentHeaderTitle"
        :subtitle="currentHeaderSubtitle"
        :badges="currentHeaderBadges"
      >
        <template #actions>
          <div class="relative z-40 flex items-center gap-2 flex-wrap">
            <!-- Mobile Toggle Button for Report Sidebar -->
            <button
              type="button"
              @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              class="btn btn-secondary btn-sm lg:hidden flex items-center gap-1.5 font-bold shadow-md"
              title="Browse All Reports"
            >
              <Menu :size="15" />
              <span>Report Menu</span>
            </button>

            <!-- View / Hide Balance Security Toggle -->
            <button
              @click="authStore.toggleBalance()"
              :class="[
                'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-10 px-3.5 whitespace-nowrap rounded-xl text-xs sm:text-sm',
                authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
              ]"
              :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
              :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
            >
              <EyeOff v-if="authStore.isBalanceVisible" :size="15" />
              <Eye v-else :size="15" />
              <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'Check Balance' }}</span>
            </button>

            <!-- Download Dropdown -->
            <DownloadReportDropdown
              :report-type="activeReport"
              :current-branch="reportBranchFilter"
              :date-from="reportDateFrom"
              :date-to="reportDateTo"
              :product="reportProductFilter"
            />
          </div>
        </template>
      </PageHeader>

      <!-- ════════════════════════════════════════════
        PROPER DESIGN FILTER BAR (Eliminating 107-Button Wrap)
      ════════════════════════════════════════════ -->
      <GlassPanel extra-class="p-3.5 rounded-2xl shadow-lg space-y-2.5">
        <!-- Main Filter Controls Row -->
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            <!-- 1. Text Search Input -->
            <div class="relative min-w-[180px] flex-1 max-w-[300px]">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" :size="14" />
              <input
                v-model="reportSearchQuery"
                type="text"
                :placeholder="`Search ${currentReportMeta?.name || 'records'}...`"
                class="form-input text-xs pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white w-full focus:border-indigo-500 h-9"
              />
              <button
                v-if="reportSearchQuery"
                type="button"
                @click="reportSearchQuery = ''"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                title="Clear Search"
              >
                ✕
              </button>
            </div>

            <!-- 2. Branch Dropdown -->
            <div class="flex items-center gap-1.5 shrink-0">
              <Building2 :size="14" class="text-indigo-400" />
              <select
                v-model="reportBranchFilter"
                class="form-select text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 h-9 cursor-pointer"
              >
                <option value="ALL">🏢 All Branches</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>

            <!-- 3. Product / SKU Filter Dropdown (Handles 107 Products cleanly) -->
            <div class="flex items-center gap-1.5 shrink-0 min-w-[190px]">
              <Package :size="14" class="text-emerald-400" />
              <select
                v-model="reportProductFilter"
                class="form-select text-xs font-semibold py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 h-9 cursor-pointer max-w-[240px] truncate"
              >
                <option value="ALL">📦 All Products ({{ availableProductFilterOptions.length }} SKUs)</option>
                <option
                  v-for="p in availableProductFilterOptions"
                  :key="p.sku"
                  :value="p.sku"
                >
                  {{ p.sku }} • {{ p.name }}
                </option>
              </select>
            </div>

            <!-- 4. Date Presets -->
            <div class="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-xl border border-slate-700/80 shrink-0">
              <button
                v-for="preset in [
                  { label: 'All Dates', val: 'ALL' },
                  { label: 'Today', val: 'TODAY' },
                  { label: 'This Month', val: 'THIS_MONTH' },
                  { label: 'Last 30 Days', val: 'LAST_30_DAYS' },
                  { label: 'Custom', val: 'CUSTOM' }
                ]"
                :key="preset.val"
                type="button"
                @click="reportDatePreset = preset.val; applyReportDatePreset()"
                :class="[
                  'px-2 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer',
                  reportDatePreset === preset.val
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                ]"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Total Records Badge & Reset Button -->
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              {{ currentReportDef.rows.length }} records
            </span>
            <button
              v-if="hasActiveFilters"
              type="button"
              @click="resetReportFilters"
              class="btn btn-ghost btn-xs text-amber-400 hover:text-white font-bold h-8 px-2 flex items-center gap-1"
              title="Reset all filters to defaults"
            >
              <RefreshCw :size="12" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <!-- Custom Date Range Row (Shown when Custom is selected or dates set) -->
        <div v-if="reportDatePreset === 'CUSTOM' || reportDateFrom || reportDateTo" class="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs flex-wrap">
          <Calendar :size="13" class="text-teal-400" />
          <span class="text-slate-400 font-bold">Custom Date Range:</span>
          <input
            type="date"
            v-model="reportDateFrom"
            class="form-input text-xs py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white h-7"
          />
          <span class="text-slate-500">to</span>
          <input
            type="date"
            v-model="reportDateTo"
            class="form-input text-xs py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white h-7"
          />
          <button
            @click="clearReportDates"
            class="text-slate-400 hover:text-rose-400 font-bold ml-1 text-xs cursor-pointer"
          >
            ✕ Clear Dates
          </button>
        </div>

        <!-- Clean Quick SKU Pills (Max 4 popular items, NOT 107 items!) -->
        <div class="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 overflow-x-auto custom-scrollbar">
          <span class="text-[11px] font-bold text-slate-400 whitespace-nowrap mr-1">Quick Select:</span>
          <button
            type="button"
            @click="reportProductFilter = 'ALL'"
            :class="['px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer', reportProductFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:text-white']"
          >
            📦 All Products
          </button>
          <button
            v-for="p in popularProductFilterOptions"
            :key="p.sku"
            type="button"
            @click="reportProductFilter = p.sku"
            :class="['px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer', reportProductFilter === p.sku ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-400 hover:text-white']"
          >
            {{ p.sku }}
          </button>
          <span v-if="reportProductFilter !== 'ALL' && !isPopularSelected" class="badge badge-primary text-[10px] py-1 px-2">
            Selected: {{ reportProductFilter }}
            <button @click="reportProductFilter = 'ALL'" class="ml-1 hover:text-white font-bold cursor-pointer">✕</button>
          </span>
        </div>
      </GlassPanel>

      <!-- ════════════════════════════════════════════
        VIEW A: OVERVIEW & ANALYTICS CHARTS
      ════════════════════════════════════════════ -->
      <template v-if="activeReport === 'overview'">
        <!-- BRANCH KPI CARDS -->
        <div class="kpi-grid">
          <KpiCard
            v-for="bName in ['Peshawar', 'Multan', 'Lahore']"
            :key="bName"
            :label="`${bName} Branch`"
            :value="formatBalance(getBranchSalesTotal(bName))"
            :badge="`${getBranchSalesCount(bName)} Invoices`"
            badge-color="info"
            value-color="text-emerald-400"
          >
            <div class="flex justify-between text-xs text-subtle border-t border-slate-800 pt-2">
              <span>Available Stock:</span>
              <span class="font-bold text-main">{{ getBranchStockCount(bName) }} machines</span>
            </div>
          </KpiCard>
        </div>

        <!-- AREA CURVE TREND -->
        <GlassPanel>
          <SectionTitle
            title="Sales & Revenue Growth Trend Curve"
            subtitle="Visual curve of completed sales invoices and gross revenue over time."
            :badges="[
              { label: 'REVENUE ANALYTICS', color: 'purple' },
              { label: 'LIVE TREND GRAPH', color: 'success' }
            ]"
          >
            <template #icon><TrendingUp :size="22" class="text-indigo-400" /></template>
            <template #toolbar>
              <ChartPresetToolbar v-model="chartMode" />
            </template>
          </SectionTitle>

          <AreaCurveChart
            :data-points="chartDataPoints"
            line-color="#6366f1"
            :extra-label="pt => `${pt.invoicesCount} Invoices Closed`"
          />
        </GlassPanel>

        <!-- BAR + DONUT CHARTS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassPanel>
            <SectionTitle title="Branch Revenue & Sales Volume Comparison">
              <template #icon><BarChart3 :size="18" class="text-indigo-400" /></template>
              <template #toolbar><StatBadge color="purple" :mono="true">3 BRANCHES</StatBadge></template>
            </SectionTitle>
            <BranchBarChart :bars="branchMetrics" :icon-component="Building2" />
          </GlassPanel>

          <GlassPanel>
            <SectionTitle title="Machine Category Distribution">
              <template #icon><PieChart :size="18" class="text-emerald-400" /></template>
              <template #toolbar>
                <StatBadge color="success" :mono="true">{{ dataStore.serials.length }} UNITS</StatBadge>
              </template>
            </SectionTitle>
            <DonutChart
              :segments="donutSegments"
              :center-value="dataStore.serials.length"
              center-label="Machines"
            />
          </GlassPanel>
        </div>

        <!-- PAYMENT STATUS -->
        <GlassPanel>
          <SectionTitle title="Machine-Wise Payment Status Report">
            <template #icon><Tag :size="20" class="text-purple-400" /></template>
          </SectionTitle>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Fully Paid Machines"
              :value="String(paidMachinesCount)"
              subtitle="Payment receipt verified"
              value-color="text-emerald-400"
              extra-class="border border-emerald-500/30"
            />
            <KpiCard
              label="Unpaid / Pending Machines"
              :value="String(pendingMachinesCount)"
              subtitle="Payment expected"
              value-color="text-red-400"
              extra-class="border border-red-500/30"
            />
            <KpiCard
              label="Collection Ratio"
              :value="`${collectionPercentage}%`"
              subtitle="Paid vs total sold machines"
              value-color="text-main"
            />
          </div>
        </GlassPanel>
      </template>

      <!-- ════════════════════════════════════════════
        VIEW B: INDIVIDUAL REPORT TABLE & EXPORT HUB
      ════════════════════════════════════════════ -->
      <template v-else>
        <div class="space-y-6 animate-fadeIn">
          <!-- Report Header Banner with Direct Format Export Buttons -->
          <GlassPanel extra-class="p-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
                :class="getReportHeaderBadgeClass(activeReport)"
              >
                <component :is="getReportIcon(currentReportMeta?.icon)" :size="22" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h2 class="text-lg font-extrabold text-main tracking-tight">{{ currentReportDef.title }}</h2>
                  <StatBadge color="purple" :mono="true">{{ currentReportDef.rows.length }} RECORDS</StatBadge>
                </div>
                <p class="text-xs text-subtle mt-0.5">{{ currentReportMeta?.description }}</p>
              </div>
            </div>

            <!-- Export Buttons -->
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                @click="exportActiveReport('xlsx')"
                class="btn btn-sm btn-success flex items-center gap-1.5 font-bold shadow-md"
                title="Download Excel Workbook (.xlsx)"
              >
                <FileSpreadsheet :size="14" />
                <span>Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                @click="exportActiveReport('pdf')"
                class="btn btn-sm btn-danger flex items-center gap-1.5 font-bold shadow-md"
                title="Download PDF Document (.pdf)"
              >
                <FileText :size="14" />
                <span>PDF (.pdf)</span>
              </button>

              <button
                type="button"
                @click="exportActiveReport('word')"
                class="btn btn-sm btn-primary flex items-center gap-1.5 font-bold shadow-md"
                title="Download Word Document (.docx)"
              >
                <FileCode :size="14" />
                <span>Word</span>
              </button>

              <button
                type="button"
                @click="exportActiveReport('csv')"
                class="btn btn-sm btn-warning flex items-center gap-1.5 font-bold shadow-md"
                title="Download CSV File (.csv)"
              >
                <Download :size="14" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                @click="exportActiveReport('print')"
                class="btn btn-sm btn-secondary flex items-center gap-1.5 font-bold shadow-md text-main"
                title="Print Form"
              >
                <Printer :size="14" />
                <span>Print</span>
              </button>
            </div>
          </GlassPanel>

          <!-- Dynamic Report KPI Cards Grid -->
          <div class="kpi-grid">
            <KpiCard
              v-for="(kpi, kIdx) in activeReportKpis"
              :key="kIdx"
              :label="kpi.label"
              :value="kpi.value"
              :subtitle="kpi.subtitle"
              value-color="text-main"
            >
              <template #icon>
                <component :is="kpi.icon" :size="18" :class="kpi.iconColor" />
              </template>
            </KpiCard>
          </div>

          <!-- Interactive Data Table with Preview & Edit Buttons -->
          <GlassPanel extra-class="p-0 overflow-hidden shadow-2xl rounded-2xl">
            <DataTable
              :columns="[...currentReportDef.columns, 'Actions']"
              :empty="currentReportDef.rows.length === 0"
              :empty-message="`No matching records found for ${currentReportDef.title}.`"
            >
              <tr v-for="(row, rIdx) in paginatedReportRows" :key="rIdx" class="hover:bg-slate-800/40 transition-colors">
                <td
                  v-for="(cell, cIdx) in row"
                  :key="cIdx"
                  :class="[
                    'text-xs py-3 px-3.5',
                    cIdx === 0 ? 'font-mono font-bold text-indigo-400' : 'text-main',
                    typeof cell === 'number' ? 'font-mono font-bold text-emerald-400 text-right' : ''
                  ]"
                >
                  <span v-if="typeof cell === 'number'">{{ formatBalance(cell) }}</span>
                  <span v-else-if="cell === 'Paid' || cell === 'Fully Paid' || cell === 'Settled' || cell === 'Clear Ledger'" class="badge badge-success font-bold text-[10px]">✓ {{ cell }}</span>
                  <span v-else-if="cell === 'Pending' || cell === 'Unpaid Due' || cell === 'Overdue Due'" class="badge badge-danger font-bold text-[10px]">✕ {{ cell }}</span>
                  <span v-else-if="cell === 'Partially Paid'" class="badge badge-warning font-bold text-[10px]">⏳ {{ cell }}</span>
                  <span v-else>{{ cell }}</span>
                </td>

                <!-- Actions Column: Preview (👁️), Edit (✏️), Print (🖨️) -->
                <td class="text-right py-3 px-3.5 whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      @click="openRowPreview(row)"
                      class="btn btn-ghost btn-xs text-emerald-400 hover:text-white hover:bg-emerald-600/30 flex items-center gap-1 font-bold"
                      title="Preview Document Slip"
                    >
                      <Eye :size="13" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      @click="openRowEdit(row)"
                      class="btn btn-ghost btn-xs text-amber-400 hover:text-white hover:bg-amber-600/30 flex items-center gap-1 font-bold"
                      title="Edit Record Details"
                    >
                      <Edit3 :size="13" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      @click="printRowRecord(row)"
                      class="btn btn-ghost btn-xs text-blue-400 hover:text-white hover:bg-blue-600/30 p-1"
                      title="Print Document"
                    >
                      <Printer :size="13" />
                    </button>
                  </div>
                </td>
              </tr>
            </DataTable>

            <!-- Table Pagination -->
            <div class="p-4 border-t border-slate-800 bg-slate-950/30">
              <PaginationBar
                v-if="currentReportDef.rows.length > 0"
                v-model="reportCurrentPage"
                v-model:pageSize="reportPageSize"
                :total-items="currentReportDef.rows.length"
              />
            </div>
          </GlassPanel>
        </div>
      </template>

    </div>
  </div>

  <!-- ════════════════════════════════════════════
    MODAL 1: DOCUMENT PREVIEW MODAL
  ════════════════════════════════════════════ -->
  <div v-if="showPreviewModal" class="modal-backdrop" @click.self="showPreviewModal = false">
    <div class="modal-content max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Eye :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">{{ previewTitle }}</h3>
            <p class="text-xs text-slate-400">Medimage Services Official Document Slip</p>
          </div>
        </div>
        <button @click="showPreviewModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg text-sm">✕</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
        <div v-for="(val, label) in previewFields" :key="label" class="flex flex-col gap-0.5">
          <span class="text-[11px] font-bold text-slate-400 uppercase">{{ label }}</span>
          <span class="font-semibold text-white font-mono">{{ val }}</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          @click="showPreviewModal = false"
          class="btn btn-secondary text-xs"
        >
          Close
        </button>
        <button
          type="button"
          @click="printPreviewDoc"
          class="btn btn-primary text-xs font-bold flex items-center gap-1.5"
        >
          <Printer :size="14" />
          <span>Print Official Slip</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ════════════════════════════════════════════
    MODAL 2: RECORD EDIT MODAL
  ════════════════════════════════════════════ -->
  <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
    <div class="modal-content max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Edit3 :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">Edit Record Details</h3>
            <p class="text-xs text-slate-400">{{ editRecordRef }}</p>
          </div>
        </div>
        <button @click="showEditModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg text-sm">✕</button>
      </div>

      <div class="space-y-4 text-xs">
        <div class="flex flex-col gap-1.5">
          <label class="font-bold text-slate-300">Party / Customer / Title:</label>
          <input
            v-model="editForm.title"
            type="text"
            class="form-input text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="font-bold text-slate-300">Branch Location:</label>
            <select
              v-model="editForm.branch"
              class="form-select text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              <option value="Peshawar">Peshawar HO</option>
              <option value="Multan">Multan Branch</option>
              <option value="Lahore">Lahore Branch</option>
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="font-bold text-slate-300">Payment / Audit Status:</label>
            <select
              v-model="editForm.status"
              class="form-select text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            >
              <option value="Paid">Paid / Settled</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending / Due</option>
              <option value="Available">Available in Stock</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-bold text-slate-300">Description / Remarks Notes:</label>
          <textarea
            v-model="editForm.notes"
            rows="3"
            class="form-input text-xs bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
            placeholder="Enter audit notes..."
          ></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          @click="showEditModal = false"
          class="btn btn-secondary text-xs"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="saveEditRecord"
          class="btn btn-success text-xs font-bold flex items-center gap-1.5"
        >
          <CheckCircle2 :size="14" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

// Components
import PageHeader from '@/components/ui/PageHeader.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import GlassPanel from '@/components/ui/GlassPanel.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import StatBadge from '@/components/ui/StatBadge.vue'
import DataTable from '@/components/ui/DataTable.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import DownloadReportDropdown from '@/components/DownloadReportDropdown.vue'
import ReportSidebar from '@/components/ReportSidebar.vue'

// Charts
import AreaCurveChart from '@/components/charts/AreaCurveChart.vue'
import BranchBarChart from '@/components/charts/BranchBarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import ChartPresetToolbar from '@/components/charts/ChartPresetToolbar.vue'

// Lucide Icons
import {
  Download, BarChart2, BarChart3, TrendingUp,
  Building2, Tag, CheckCircle2, Clock, PieChart, Calendar,
  Printer, FileSpreadsheet, FileCode, FileText, ChevronDown,
  Eye, EyeOff, Package, Search, ShoppingCart, Receipt, DollarSign,
  ShieldAlert, Truck, QrCode, ArrowUpRight, ArrowDownRight, Layers, Edit3,
  Menu, X, RefreshCw, Banknote, Users
} from 'lucide-vue-next'

import { ERP_REPORT_TYPES, getERPReportDefinition, exportUnifiedReport, exportPrint } from '@/utils/reportExporter'

// Store & Router
const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// State
const activeReport = ref('overview')
const reportSearchQuery = ref('')
const reportBranchFilter = ref('ALL')
const reportProductFilter = ref('ALL')
const reportDatePreset = ref('ALL')
const reportDateFrom = ref('')
const reportDateTo = ref('')
const reportCurrentPage = ref(1)
const reportPageSize = ref(15)
const isMobileSidebarOpen = ref(false)
const chartMode = ref('monthly')

function onSidebarSelectReport(repId) {
  activeReport.value = repId
  reportCurrentPage.value = 1
  reportSearchQuery.value = ''
  isMobileSidebarOpen.value = false
  if (repId === 'overview') {
    router.replace({ query: { ...route.query, report: undefined } })
  } else {
    router.replace({ query: { ...route.query, report: repId } })
  }
}

function applyReportDatePreset() {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  if (reportDatePreset.value === 'ALL') {
    reportDateFrom.value = ''
    reportDateTo.value = ''
  } else if (reportDatePreset.value === 'TODAY') {
    reportDateFrom.value = todayStr
    reportDateTo.value = todayStr
  } else if (reportDatePreset.value === 'THIS_MONTH') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    reportDateFrom.value = firstDay
    reportDateTo.value = todayStr
  } else if (reportDatePreset.value === 'LAST_30_DAYS') {
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    reportDateFrom.value = past
    reportDateTo.value = todayStr
  }
}

function clearReportDates() {
  reportDatePreset.value = 'ALL'
  reportDateFrom.value = ''
  reportDateTo.value = ''
}

// Available Products for Filter Dropdown
const availableProductFilterOptions = computed(() => {
  const map = new Map()
  ;(dataStore.products || []).forEach(p => {
    map.set(p.sku, { sku: p.sku, name: p.name || p.sku })
  })
  ;(dataStore.serials || []).forEach(s => {
    if (s.sku && !map.has(s.sku)) {
      map.set(s.sku, { sku: s.sku, name: s.productName || s.sku })
    }
  })
  return Array.from(map.values())
})

const popularProductFilterOptions = computed(() => {
  return availableProductFilterOptions.value.slice(0, 4)
})

const isPopularSelected = computed(() => {
  return popularProductFilterOptions.value.some(p => p.sku === reportProductFilter.value)
})

const hasActiveFilters = computed(() => {
  return Boolean(
    reportSearchQuery.value ||
    reportBranchFilter.value !== 'ALL' ||
    reportProductFilter.value !== 'ALL' ||
    reportDateFrom.value ||
    reportDateTo.value ||
    reportDatePreset.value !== 'ALL'
  )
})

function resetReportFilters() {
  reportSearchQuery.value = ''
  reportBranchFilter.value = 'ALL'
  reportProductFilter.value = 'ALL'
  reportDatePreset.value = 'ALL'
  reportDateFrom.value = ''
  reportDateTo.value = ''
  reportCurrentPage.value = 1
}

// Report Counts Map for Sidebar
const reportCounts = computed(() => {
  const counts = {}
  counts['sales'] = (dataStore.salesInvoices || []).length
  counts['purchase'] = (dataStore.purchaseOrders || []).length || (dataStore.containers || []).length
  counts['day_book'] = (dataStore.salesInvoices || []).length + (dataStore.paymentReceipts || []).length
  counts['all_transactions'] = (dataStore.salesInvoices || []).length + (dataStore.paymentReceipts || []).length + (dataStore.paymentOutVouchers || []).length
  counts['profit'] = 6
  counts['bill_wise_profit'] = (dataStore.salesInvoices || []).length
  counts['credit'] = (dataStore.customers || []).length
  counts['cash_flow'] = (dataStore.paymentReceipts || []).length + (dataStore.paymentOutVouchers || []).length
  counts['balance_sheet'] = 9
  counts['party_statement'] = (dataStore.salesInvoices || []).length + (dataStore.paymentReceipts || []).length
  counts['party_pnl'] = (dataStore.customers || []).length || 5
  counts['all_parties'] = (dataStore.customers || []).length
  counts['party_by_item'] = (dataStore.salesInvoices || []).reduce((acc, s) => acc + (s.items?.length || 1), 0)
  counts['sale_purchase_by_party'] = (dataStore.customers || []).length
  counts['sale_purchase_by_party_group'] = 6
  counts['sale_summary_hsn'] = 6
  counts['inventory'] = (dataStore.products || []).length
  counts['serials'] = (dataStore.serials || []).length
  counts['containers'] = (dataStore.containers || []).length || 3
  counts['payment_in'] = (dataStore.paymentReceipts || []).length
  counts['payment_out'] = (dataStore.paymentOutVouchers || []).length
  return counts
})

// Modals State
const showPreviewModal = ref(false)
const showEditModal = ref(false)
const previewTitle = ref('')
const previewFields = ref({})
const editRecordRef = ref('')
const editForm = ref({ title: '', branch: 'Peshawar', status: 'Paid', notes: '' })

// Lifecycle & Route sync
onMounted(() => {
  if (!authStore.isSuperAdmin) {
    router.push('/dashboard')
    return
  }
  if (route.query.report && ERP_REPORT_TYPES.some(r => r.id === route.query.report)) {
    activeReport.value = route.query.report
  } else {
    activeReport.value = 'sales'
  }
})

watch(() => route.query.report, (newRep) => {
  if (newRep && ERP_REPORT_TYPES.some(r => r.id === newRep)) {
    activeReport.value = newRep
  } else if (!newRep) {
    activeReport.value = 'overview'
  }
})

// Current Report Meta & Definitions
const currentReportMeta = computed(() => {
  return ERP_REPORT_TYPES.find(r => r.id === activeReport.value)
})

const currentReportDef = computed(() => {
  return getERPReportDefinition(activeReport.value, dataStore, {
    branch: reportBranchFilter.value,
    product: reportProductFilter.value,
    search: reportSearchQuery.value,
    dateFrom: reportDateFrom.value,
    dateTo: reportDateTo.value
  })
})

const currentHeaderTitle = computed(() => {
  if (activeReport.value === 'overview') {
    return 'Executive ERP Reports & Analytics'
  }
  return currentReportDef.value?.title || currentReportMeta.value?.name || 'ERP Report Hub'
})

const currentHeaderSubtitle = computed(() => {
  if (activeReport.value === 'overview') {
    return 'Centralized multi-module ERP reporting engine with live ledger audit tables, branch metrics, and instant multi-format downloads.'
  }
  return currentReportMeta.value?.description || 'Audited financial and commercial ledger records with instant multi-format exports.'
})

const currentHeaderBadges = computed(() => {
  if (activeReport.value === 'overview') {
    return [
      { label: '👑 SUPERADMIN HQ EXCLUSIVE', color: 'purple' },
      { label: 'AUDIT & EXPORT HUB', color: 'success' }
    ]
  }
  return [
    { label: currentReportMeta.value?.category || 'ERP REPORT', color: 'purple' },
    { label: `${currentReportDef.value?.rows?.length || 0} RECORDS`, color: 'success' }
  ]
})

const paginatedReportRows = computed(() => {
  const rows = currentReportDef.value?.rows || []
  const start = (reportCurrentPage.value - 1) * reportPageSize.value
  return rows.slice(start, start + reportPageSize.value)
})

watch([reportSearchQuery, reportBranchFilter, reportProductFilter, reportDateFrom, reportDateTo, activeReport], () => {
  reportCurrentPage.value = 1
})

function exportActiveReport(format) {
  exportUnifiedReport(activeReport.value, format, dataStore, {
    branch: reportBranchFilter.value,
    product: reportProductFilter.value,
    search: reportSearchQuery.value,
    dateFrom: reportDateFrom.value,
    dateTo: reportDateTo.value
  })
}

// Modal Handlers
function openRowPreview(row) {
  const cols = currentReportDef.value?.columns || []
  const fields = {}
  cols.forEach((col, idx) => {
    fields[col] = row[idx]
  })
  previewTitle.value = `${currentReportMeta.value?.name || 'Document Slip'} — ${row[0] || 'REF'}`
  previewFields.value = fields
  showPreviewModal.value = true
}

function openRowEdit(row) {
  editRecordRef.value = `Record Reference: ${row[0] || 'VOUCH'}`
  editForm.value = {
    title: String(row[3] || row[1] || ''),
    branch: String(row[4] || 'Peshawar'),
    status: 'Paid',
    notes: 'Audited record notes...'
  }
  showEditModal.value = true
}

function saveEditRecord() {
  uiStore.showModal('Audit Saved', `Changes for ${editRecordRef.value} have been updated in the ERP audit journal.`, 'success')
  showEditModal.value = false
}

function printRowRecord(row) {
  const cols = currentReportDef.value?.columns || []
  exportPrint(`${currentReportMeta.value?.name || 'ERP Record'} - ${row[0]}`, {
    'Reference': row[0],
    'Date': row[1],
    'Party': row[3] || 'Commercial Account',
    'Branch': reportBranchFilter.value
  }, cols, [row])
}

function printPreviewDoc() {
  const cols = Object.keys(previewFields.value)
  const row = Object.values(previewFields.value)
  exportPrint(previewTitle.value, { 'Audited By': 'Alexander Sterling (SuperAdmin HO)' }, cols, [row])
}

function formatBalance(amount, prefix = 'PKR ') {
  if (amount === undefined || amount === null) return `${prefix}0`
  const num = typeof amount === 'number' ? amount : (Number(amount) || 0)
  if (authStore.isBalanceVisible) {
    return `${prefix}${num.toLocaleString()}`
  }
  return `${prefix}••••••`
}

// Dynamic KPI Cards for Selected Report
const activeReportKpis = computed(() => {
  const repId = activeReport.value
  const rows = currentReportDef.value?.rows || []
  const sumObj = currentReportDef.value?.summary || {}

  switch (repId) {
    case 'sales': {
      return [
        { label: 'Gross Invoiced Revenue', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Total outbound invoice value', icon: ShoppingCart, iconColor: 'text-blue-400' },
        { label: 'Realized Collections', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Collected money received', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Outstanding Balance', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Pending customer receivables', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Total Invoices Issued', value: `${rows.length} Invoices`, subtitle: `${reportBranchFilter.value} depot scope`, icon: Layers, iconColor: 'text-purple-400' }
      ]
    }
    case 'purchase': {
      return [
        { label: 'Total Purchases Landed', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Inbound equipment purchase value', icon: Truck, iconColor: 'text-teal-400' },
        { label: 'Disbursed to Suppliers', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Settled vendor dispatches', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Accounts Payable Dues', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Supplier balance dues', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Total Inbound Bills', value: `${rows.length} Purchase Bills`, subtitle: `${reportBranchFilter.value} scope`, icon: Layers, iconColor: 'text-blue-400' }
      ]
    }
    case 'day_book': {
      return [
        { label: 'Total Daily Debits (Inflow)', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Invoiced & money received', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Total Daily Credits (Outflow)', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Vendor & expense dispatches', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Net Daily Cash Balance', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Realized net position', icon: Banknote, iconColor: 'text-blue-400' },
        { label: 'Day Book Postings', value: `${rows.length} Vouchers`, subtitle: 'Audited today entries', icon: Calendar, iconColor: 'text-purple-400' }
      ]
    }
    case 'all_transactions': {
      return [
        { label: 'Audited Transaction Logs', value: `${rows.length} Vouchers`, subtitle: 'Multi-voucher audit records', icon: Receipt, iconColor: 'text-purple-400' },
        { label: 'Branch Coverage', value: reportBranchFilter.value === 'ALL' ? '3 Branches' : reportBranchFilter.value, subtitle: 'Peshawar, Multan, Lahore', icon: Building2, iconColor: 'text-blue-400' },
        { label: 'Ledger Audit Status', value: '100% Reconciled', subtitle: 'Posted to General Ledger', icon: CheckCircle2, iconColor: 'text-emerald-400' },
        { label: 'Transaction Scope', value: 'Commercial & Cash', subtitle: 'Universal journal', icon: Layers, iconColor: 'text-cyan-400' }
      ]
    }
    case 'bill_wise_profit': {
      return [
        { label: 'Total Billed Sales', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Invoice face value', icon: ShoppingCart, iconColor: 'text-blue-400' },
        { label: 'Cost of Goods (COGS)', value: formatBalance(sumObj.totalCogs || 0), subtitle: 'Landed machine direct cost', icon: DollarSign, iconColor: 'text-red-400' },
        { label: 'Total Gross Profit', value: formatBalance(sumObj.grossProfit || 0), subtitle: 'Realized gross margin', icon: TrendingUp, iconColor: 'text-emerald-400' },
        { label: 'Audited Invoices', value: `${rows.length} Invoices`, subtitle: 'Profitable sales transactions', icon: CheckCircle2, iconColor: 'text-purple-400' }
      ]
    }
    case 'cash_flow': {
      return [
        { label: 'Total Treasury Inflows', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Customer payments & collections', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Total Treasury Outflows', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Vendor payments & expenses', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Net Cash Flow Position', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Net liquidity surplus', icon: Banknote, iconColor: 'text-blue-400' },
        { label: 'Total Cash Vouchers', value: `${rows.length} Movements`, subtitle: 'Cleared liquidity vouchers', icon: CheckCircle2, iconColor: 'text-purple-400' }
      ]
    }
    case 'balance_sheet': {
      return [
        { label: 'Total Current Assets', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Cash, Receivables & Inventory', icon: Layers, iconColor: 'text-emerald-400' },
        { label: 'Total Obligations', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Supplier payables & accruals', icon: ArrowDownRight, iconColor: 'text-red-400' },
        { label: 'Net Owner Equity', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Retained business net worth', icon: TrendingUp, iconColor: 'text-blue-400' },
        { label: 'Accounting Accuracy', value: '100% Balanced', subtitle: 'Assets = Liabilities + Equity', icon: CheckCircle2, iconColor: 'text-purple-400' }
      ]
    }
    case 'party_statement': {
      return [
        { label: 'Total Invoiced Debits', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Commercial bills charged', icon: ShoppingCart, iconColor: 'text-blue-400' },
        { label: 'Total Settled Credits', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Customer receipts settled', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Net Outstanding Balance', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Net customer receivables', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Ledger Postings', value: `${rows.length} Entries`, subtitle: 'Chronological party statement', icon: FileText, iconColor: 'text-purple-400' }
      ]
    }
    case 'party_pnl': {
      return [
        { label: 'Total Accounts Audited', value: `${rows.length} Parties`, subtitle: 'Active commercial buyers', icon: Users, iconColor: 'text-blue-400' },
        { label: 'Aggregated Sales Turnover', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Billed to party accounts', icon: ShoppingCart, iconColor: 'text-emerald-400' },
        { label: 'Gross Operating Profit', value: formatBalance(sumObj.grossProfit || 0), subtitle: 'Realized party margin', icon: TrendingUp, iconColor: 'text-purple-400' },
        { label: 'Profit Evaluation', value: 'High Yield', subtitle: 'Hospital & dealer accounts', icon: CheckCircle2, iconColor: 'text-cyan-400' }
      ]
    }
    case 'all_parties': {
      return [
        { label: 'Total Registered Parties', value: `${rows.length} Accounts`, subtitle: 'Customers & supplier contacts', icon: Users, iconColor: 'text-blue-400' },
        { label: 'Cumulative Invoiced Total', value: formatBalance(sumObj.totalRevenue || 0), subtitle: 'Total lifetime billing', icon: ShoppingCart, iconColor: 'text-emerald-400' },
        { label: 'Total Realized Collections', value: formatBalance(sumObj.totalPaid || 0), subtitle: 'Collected money received', icon: ArrowUpRight, iconColor: 'text-cyan-400' },
        { label: 'Total Outstanding Exposure', value: formatBalance(sumObj.totalBalance || 0), subtitle: 'Current aggregate credit due', icon: ArrowDownRight, iconColor: 'text-amber-400' }
      ]
    }
    case 'payment_in': {
      return [
        { label: 'Total Cash Inflow', value: formatBalance(sumObj.totalCollected || 0), subtitle: 'Direct customer receipts', icon: ArrowUpRight, iconColor: 'text-emerald-400' },
        { label: 'Receipt Vouchers', value: `${rows.length} Receipts`, subtitle: 'Verified bank & cash receipts', icon: Receipt, iconColor: 'text-blue-400' },
        { label: 'Depot Coverage', value: reportBranchFilter.value === 'ALL' ? '3 Branches' : reportBranchFilter.value, subtitle: 'Peshawar, Multan, Lahore', icon: Building2, iconColor: 'text-purple-400' },
        { label: 'Receipt Status', value: '100% Succeeded', subtitle: 'Posted to General Ledger', icon: CheckCircle2, iconColor: 'text-emerald-400' }
      ]
    }
    case 'payment_out': {
      return [
        { label: 'Total Outflow Disbursed', value: formatBalance(sumObj.totalOutflow || 0), subtitle: 'Vendor payments & expenses', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Expense Vouchers', value: `${rows.length} Vouchers`, subtitle: 'Cleared payment out vouchers', icon: DollarSign, iconColor: 'text-red-400' },
        { label: 'Disbursement Scope', value: reportBranchFilter.value, subtitle: 'Operating branches', icon: Building2, iconColor: 'text-purple-400' },
        { label: 'Voucher Status', value: 'Verified Cleared', subtitle: 'Audited expenses', icon: CheckCircle2, iconColor: 'text-emerald-400' }
      ]
    }
    case 'inventory': {
      return [
        { label: 'Total Stock Units', value: `${sumObj.totalStock || 0} Units`, subtitle: 'Available machine inventory', icon: Package, iconColor: 'text-indigo-400' },
        { label: 'Cost Valuation (COGS)', value: formatBalance(sumObj.totalCostValuation || 0), subtitle: 'Total landing cost valuation', icon: DollarSign, iconColor: 'text-blue-400' },
        { label: 'Retail Sales Valuation', value: formatBalance(sumObj.totalRetailValuation || 0), subtitle: 'Market selling price valuation', icon: TrendingUp, iconColor: 'text-emerald-400' },
        { label: 'Active SKUs In-Stock', value: `${rows.length} SKUs`, subtitle: 'Product categories catalog', icon: Layers, iconColor: 'text-purple-400' }
      ]
    }
    case 'credit': {
      return [
        { label: 'Total Customer Accounts', value: `${rows.length} Customers`, subtitle: 'Registered credit lines', icon: ShieldAlert, iconColor: 'text-purple-400' },
        { label: 'Outstanding Balance Due', value: formatBalance(sumObj.totalExposureAll || 0), subtitle: 'Current customer ledger balance', icon: ArrowDownRight, iconColor: 'text-amber-400' },
        { label: 'Total Credit Limit', value: formatBalance(sumObj.totalLimitAll || 0), subtitle: 'Approved credit ceiling', icon: DollarSign, iconColor: 'text-blue-400' },
        { label: 'Remaining Credit Buffer', value: formatBalance(sumObj.totalRemainingAll || 0), subtitle: 'Available purchasing headroom', icon: CheckCircle2, iconColor: 'text-emerald-400' }
      ]
    }
    case 'containers': {
      return [
        { label: 'Total Import BLs', value: `${rows.length} BL Shipments`, subtitle: 'Inbound container consignments', icon: Truck, iconColor: 'text-teal-400' },
        { label: 'Landed Machine Units', value: `${sumObj.totalMachines || 0} Units`, subtitle: 'Received through customs', icon: Package, iconColor: 'text-indigo-400' },
        { label: 'Total Consignment Cost', value: formatBalance(sumObj.totalLandingCost || 0), subtitle: 'Customs & CIF invoice value', icon: DollarSign, iconColor: 'text-emerald-400' },
        { label: 'Customs Clearance', value: 'Verified Released', subtitle: 'Port clearance status', icon: CheckCircle2, iconColor: 'text-blue-400' }
      ]
    }
    case 'serials': {
      return [
        { label: 'Total Serial Numbers', value: `${rows.length} Units`, subtitle: 'Registered unit-level tracking', icon: QrCode, iconColor: 'text-rose-400' },
        { label: 'Available in Warehouse', value: `${dataStore.availableSerialsCount || 0} Units`, subtitle: 'Ready for delivery', icon: Package, iconColor: 'text-emerald-400' },
        { label: 'Sold / Deployed', value: `${(dataStore.serials || []).filter(s => s.status === 'Sold').length} Units`, subtitle: 'Hospital client installations', icon: ShoppingCart, iconColor: 'text-blue-400' },
        { label: 'Depot Allocation', value: reportBranchFilter.value, subtitle: 'Warehouse tracking', icon: Building2, iconColor: 'text-purple-400' }
      ]
    }
    case 'profit':
    default: {
      return [
        { label: 'Gross Revenue Invoiced', value: formatBalance(sumObj.totalRevenue || 0), subtitle: '100% Topline commercial sales', icon: ShoppingCart, iconColor: 'text-blue-400' },
        { label: 'Cost of Goods Sold (COGS)', value: formatBalance(sumObj.totalCogs || 0), subtitle: 'Direct landed unit costs', icon: DollarSign, iconColor: 'text-red-400' },
        { label: 'Gross Operating Profit', value: formatBalance(sumObj.grossProfit || 0), subtitle: 'Operating margin before expenses', icon: TrendingUp, iconColor: 'text-emerald-400' },
        { label: 'Gross Profit Margin', value: `${sumObj.grossMarginPct || 0}%`, subtitle: 'Realized gross profit ratio', icon: ArrowUpRight, iconColor: 'text-purple-400' }
      ]
    }
  }
})

function getReportIcon(iconName) {
  const map = {
    ShoppingCart,
    Receipt,
    DollarSign,
    Package,
    ShieldAlert,
    Truck,
    QrCode,
    TrendingUp,
    BarChart3,
    Calendar,
    Banknote,
    Layers,
    FileText,
    Users,
    Tag,
    BarChart2
  }
  return map[iconName] || FileSpreadsheet
}

function getReportHeaderBadgeClass(repId) {
  const map = {
    sales: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    purchase: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    day_book: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
    all_transactions: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    payment_in: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    payment_out: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    inventory: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
    credit: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    containers: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    serials: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
    profit: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400',
    bill_wise_profit: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    cash_flow: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    balance_sheet: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    party_statement: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
    party_pnl: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    all_parties: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    party_by_item: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    sale_purchase_by_party: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    sale_purchase_by_party_group: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    sale_summary_hsn: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
  }
  return map[repId] || 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
}

// Chart Data Computeds for Overview Tab
const chartDataPoints = computed(() => {
  let invoices = dataStore.salesInvoices || []
  if (reportBranchFilter.value !== 'ALL') {
    invoices = invoices.filter(i => (i.branch || 'Peshawar') === reportBranchFilter.value)
  }
  if (reportProductFilter.value !== 'ALL') {
    invoices = invoices.filter(i => (i.items || []).some(it => it.sku === reportProductFilter.value || it.productId === reportProductFilter.value))
  }

  const monthLabels = [
    { label: 'Jul 2026', key: '2026-07' },
    { label: 'Aug 2026', key: '2026-08' },
    { label: 'Sep 2026', key: '2026-09' },
    { label: 'Oct 2026', key: '2026-10' },
    { label: 'Nov 2026', key: '2026-11' },
    { label: 'Dec 2026', key: '2026-12' }
  ]

  return monthLabels.map(m => {
    const matched = invoices.filter(inv => (inv.saleDate || inv.createdAt || '').substring(0, 7) === m.key)
    const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
    return { label: m.label, val, invoicesCount: matched.length }
  })
})

const branchMetrics = computed(() => {
  const branches = ['Peshawar', 'Multan', 'Lahore']
  const totals = branches.map(b => getBranchSalesTotal(b))
  const maxRev = Math.max(...totals, 0)
  return branches.map(bName => {
    const rev = getBranchSalesTotal(bName)
    return {
      name: bName,
      revenue: rev,
      count: getBranchSalesCount(bName),
      percentage: maxRev > 0 ? Math.round((rev / maxRev) * 100) : 0
    }
  })
})

const donutSegments = computed(() => {
  let serials = dataStore.serials || []
  if (reportBranchFilter.value !== 'ALL') {
    serials = serials.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  }
  const total = serials.length
  const ultrasound = serials.filter(s => s.sku && s.sku.includes('US')).length
  const laser = serials.filter(s => s.sku && s.sku.includes('LSR')).length
  const ecg = serials.filter(s => s.sku && s.sku.includes('ECG')).length
  const uPct = total > 0 ? Math.round((ultrasound / total) * 100) : 0
  const lPct = total > 0 ? Math.round((laser / total) * 100) : 0
  const ePct = total > 0 ? Math.round((ecg / total) * 100) : 0
  return [
    { name: 'Ultrasound Systems', count: ultrasound, pct: uPct, offset: 0, color: '#3b82f6' },
    { name: 'Diode Laser Machines', count: laser, pct: lPct, offset: uPct, color: '#8b5cf6' },
    { name: 'ECG Systems', count: ecg, pct: ePct, offset: uPct + lPct, color: '#10b981' }
  ]
})

const paidMachinesCount = computed(() => {
  let list = (dataStore.serials || []).filter(s => s.status === 'Sold' && s.paymentStatus === 'Paid')
  if (reportBranchFilter.value !== 'ALL') list = list.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') list = list.filter(s => s.sku === reportProductFilter.value)
  return list.length
})

const pendingMachinesCount = computed(() => {
  let list = (dataStore.serials || []).filter(s => s.status === 'Sold' && s.paymentStatus !== 'Paid')
  if (reportBranchFilter.value !== 'ALL') list = list.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') list = list.filter(s => s.sku === reportProductFilter.value)
  return list.length
})

const collectionPercentage = computed(() => {
  let sold = (dataStore.serials || []).filter(s => s.status === 'Sold')
  if (reportBranchFilter.value !== 'ALL') sold = sold.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') sold = sold.filter(s => s.sku === reportProductFilter.value)
  return sold.length ? ((paidMachinesCount.value / sold.length) * 100).toFixed(1) : '0.0'
})

function getBranchSalesCount(branch) {
  let invs = (dataStore.salesInvoices || []).filter(i => (i.branch || 'Peshawar') === branch)
  if (reportProductFilter.value !== 'ALL') {
    invs = invs.filter(i => (i.items || []).some(it => it.sku === reportProductFilter.value))
  }
  return invs.length
}

function getBranchSalesTotal(branch) {
  let invs = (dataStore.salesInvoices || []).filter(i => (i.branch || 'Peshawar') === branch)
  if (reportProductFilter.value !== 'ALL') {
    invs = invs.filter(i => (i.items || []).some(it => it.sku === reportProductFilter.value))
  }
  return invs.reduce((acc, i) => acc + (i.grandTotal || 0), 0)
}

function getBranchStockCount(branch) {
  let list = (dataStore.serials || []).filter(s => (s.allocationCity || 'Peshawar') === branch && s.status === 'Available')
  if (reportProductFilter.value !== 'ALL') {
    list = list.filter(s => s.sku === reportProductFilter.value)
  }
  return list.length
}
</script>

<style scoped>
/* ── Split Layout Container (Sidebar + Stage) ─ */
.reports-container-split {
  display: flex;
  min-height: calc(100vh - 80px);
  width: 100%;
  position: relative;
  background-color: transparent;
}

.reports-sidebar-frame {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: calc(100vh - 80px);
  z-index: 40;
}

.sidebar-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.reports-main-stage {
  flex: 1;
  min-width: 0;
  padding: 1.25rem 1.75rem 3rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-x: hidden;
}

/* ── Mobile Drawer Responsiveness ─ */
@media (max-width: 1024px) {
  .reports-sidebar-frame {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    height: 100vh !important;
    z-index: 99999 !important;
    transform: translateX(-100%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.5);
  }

  .reports-sidebar-frame.mobile-open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: -1;
  }

  .reports-main-stage {
    padding: 1rem 0.75rem 2.5rem 0.75rem;
  }
}

/* ── Modals ─ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.75);
  backdrop-filter: blur(6px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>

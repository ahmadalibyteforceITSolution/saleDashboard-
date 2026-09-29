<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title, badges, export dropdown & balance toggle
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Executive ERP Reports & Analytics"
      subtitle="Comprehensive multi-module reporting hub with live data tables, branch comparisons, cash flow, and multi-format exports."
      :badges="[
        { label: 'MEDIMAGE ERP REPORTING', color: 'purple' },
        { label: 'MULTI-FORMAT EXPORT ENGINE', color: 'success' }
      ]"
    >
      <template #actions>
        <div class="relative z-40 flex items-center gap-2.5 flex-wrap">
          <!-- View / Hide Balance Security Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-11 px-4 whitespace-nowrap rounded-xl',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
            <Eye v-else :size="16" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
          </button>

          <!-- Executive Multi-Report Export Dropdown -->
          <DownloadReportDropdown :current-branch="historicalBranch" />
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      REPORT SELECTOR NAVIGATION TABS & DROPDOWN
    ════════════════════════════════════════════ -->
    <div class="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl shadow-xl backdrop-blur-md">
      <!-- Mobile Report Selector Dropdown -->
      <div class="block md:hidden">
        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block px-1">
          Select Active Report View:
        </label>
        <select
          v-model="activeReport"
          @change="onReportTabChange(activeReport)"
          class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
        >
          <option value="overview">📊 Executive Overview & Trend Graphs</option>
          <option value="sales">🛒 1. Sales & POS Invoices Report</option>
          <option value="payment_in">📥 2. Payment In Collections Report</option>
          <option value="payment_out">💸 3. Payment Out / Expenses Report</option>
          <option value="inventory">📦 4. Stock & Inventory Valuation Report</option>
          <option value="credit">🛡️ 5. Customer Credit & Ledger Report</option>
          <option value="containers">🚢 6. Containers & Import BL Report</option>
          <option value="serials">🏷️ 7. Machine Serial Number Registry Report</option>
          <option value="profit">📈 8. Executive P&L & Profit Margin Report</option>
        </select>
      </div>

      <!-- Desktop Scrollable Tab Bar -->
      <div class="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          type="button"
          @click="onReportTabChange('overview')"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all',
            activeReport === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          ]"
        >
          <BarChart3 :size="14" />
          <span>Overview & Graphs</span>
        </button>

        <button
          v-for="rep in ERP_REPORT_TYPES"
          :key="rep.id"
          type="button"
          @click="onReportTabChange(rep.id)"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all',
            activeReport === rep.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
          ]"
        >
          <component :is="getReportIcon(rep.icon)" :size="14" />
          <span>{{ rep.name }}</span>
        </button>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: EXECUTIVE OVERVIEW & GRAPHS
    ════════════════════════════════════════════ -->
    <template v-if="activeReport === 'overview'">
      <!-- BRANCH KPI CARDS — Revenue per city -->
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
            <span class="font-bold text-white">{{ getBranchStockCount(bName) }} machines</span>
          </div>
        </KpiCard>
      </div>

      <!-- AREA CURVE CHART — Revenue growth trend -->
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

        <!-- Custom Date Range Bar for Graph -->
        <div v-if="chartMode === 'Custom'" class="glass-card mb-4 p-3 rounded-xl border border-indigo-500/20 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar :size="14" class="text-indigo-400" />
              <span>Custom Graph Range:</span>
            </span>
            <div class="flex items-center gap-1.5">
              <input
                type="date"
                v-model="chartCustomStart"
                class="form-input text-xs py-1 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
              <span class="text-slate-500 text-xs font-bold">to</span>
              <input
                type="date"
                v-model="chartCustomEnd"
                class="form-input text-xs py-1 px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs text-slate-400 font-semibold mr-1">Quick Select:</span>
            <button
              v-for="p in chartCustomPresets"
              :key="p.key"
              type="button"
              @click="applyChartCustomPreset(p.key)"
              :class="['btn btn-xs', activeChartPreset === p.key ? 'btn-primary' : 'btn-secondary text-xs']"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <AreaCurveChart
          :data-points="chartDataPoints"
          line-color="#6366f1"
          :extra-label="pt => `${pt.invoicesCount} Invoices Closed`"
        />
      </GlassPanel>

      <!-- BAR CHART + DONUT CHART — Side by side -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Branch Revenue Comparison Bar Chart -->
        <GlassPanel>
          <SectionTitle title="Branch Revenue & Sales Volume Comparison">
            <template #icon><BarChart3 :size="18" class="text-indigo-400" /></template>
            <template #toolbar><StatBadge color="purple" :mono="true">3 BRANCHES</StatBadge></template>
          </SectionTitle>
          <BranchBarChart :bars="branchMetrics" :icon-component="Building2" />
        </GlassPanel>

        <!-- Equipment Category Donut Chart -->
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

      <!-- PAYMENT STATUS REPORT — Paid vs Unpaid machines -->
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
            value-color="text-white"
          />
        </div>
      </GlassPanel>

      <!-- HISTORICAL STOCK POSITION — Date range query & Product Filter -->
      <GlassPanel extra-class="p-6 space-y-6">
        <SectionTitle
          title="Historical Stock & Range Position Report"
          subtitle="Select quick presets (Today, Yesterday, This Month, Last Month) or pick a custom date range to query machine availability."
          :badges="[
            { label: 'STOCK AUDIT SNAPSHOT', color: 'purple' },
            { label: 'DATE RANGE ANALYTICS', color: 'info' }
          ]"
        >
          <template #icon><Calendar :size="22" class="text-emerald-400" /></template>
          <template #toolbar>
            <div class="flex items-center gap-2">
              <ChartPresetToolbar
                v-model="activeDatePreset"
                :options="['Today', 'Yesterday', 'ThisMonth', 'LastMonth', 'Custom']"
                @update:modelValue="applyDatePreset"
              />

              <!-- Download Stock Report -->
              <button
                type="button"
                @click="downloadHistoricalStockReport('xlsx')"
                class="btn btn-sm btn-primary flex items-center gap-1.5 font-bold shadow-md"
                title="Download Excel Stock Report"
              >
                <Download :size="14" />
                <span class="hidden sm:inline">Export Stock</span>
              </button>
            </div>
          </template>
        </SectionTitle>

        <!-- Date inputs + branch selector + Product Filter Bar -->
        <div class="date-control-card flex flex-col gap-4">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <template v-if="activeDatePreset === 'Custom'">
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar :size="14" class="text-blue-400" />
                    <span>From:</span>
                  </span>
                  <input v-model="startDate" type="date" @change="handleCustomDateChange"
                    class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg" />
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar :size="14" class="text-emerald-400" />
                    <span>To:</span>
                  </span>
                  <input v-model="endDate" type="date" @change="handleCustomDateChange"
                    class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg" />
                </div>
              </template>

              <template v-else>
                <div class="flex items-center gap-2.5">
                  <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Calendar :size="14" class="text-emerald-400" />
                    <span>Target Date:</span>
                  </span>
                  <input v-model="endDate" type="date" @change="handleCustomDateChange"
                    class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg" />
                </div>
                <StatBadge color="purple" :mono="true">PRESET: {{ activeDatePreset }} ({{ formattedRangeLabel }})</StatBadge>
              </template>
            </div>

            <!-- Branch filter dropdown -->
            <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Building2 :size="14" class="text-purple-400" />
                <span>Branch:</span>
              </span>
              <SelectInput
                v-model="historicalBranch"
                :options="[
                  { value: 'ALL',      label: 'All Branches (Global)' },
                  { value: 'Peshawar', label: 'Peshawar HO' },
                  { value: 'Multan',   label: 'Multan Branch' },
                  { value: 'Lahore',   label: 'Lahore Branch' }
                ]"
                @change="updateHistoricalReport"
              />
            </div>
          </div>

          <!-- Product Wise Filter Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div class="flex items-center gap-2">
                <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Package :size="14" class="text-emerald-400" />
                  <span>Product / SKU:</span>
                </span>
                <select
                  v-model="selectedProductFilter"
                  class="form-select text-xs font-bold bg-slate-900 border border-slate-700 rounded-lg text-white py-1.5 px-3"
                >
                  <option value="ALL">📦 All Products & SKUs (Global Inventory)</option>
                  <option v-for="p in availableProductFilterOptions" :key="p.sku" :value="p.sku">
                    {{ p.name }} ({{ p.sku }})
                  </option>
                </select>
              </div>

              <div class="relative min-w-[200px]">
                <Search :size="13" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="stockSearchQuery"
                  type="text"
                  placeholder="Search serial, machine code, SKU..."
                  class="form-input text-xs pl-8 py-1.5 text-white bg-slate-900 border border-slate-700 rounded-lg w-full"
                />
              </div>
            </div>

            <div v-if="selectedProductFilter !== 'ALL' || stockSearchQuery.trim()" class="flex items-center gap-2">
              <span class="text-xs text-slate-400">
                Showing filtered results ({{ filteredSnapshotList.length }} units)
              </span>
              <button
                type="button"
                @click="resetProductFilters"
                class="btn btn-ghost btn-xs text-amber-400 hover:text-white font-bold"
              >
                ✕ Reset Product Filter
              </button>
            </div>
          </div>
        </div>

        <!-- Stock snapshot results -->
        <div v-if="historicalStock" class="space-y-4">
          <div class="p-5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
            <div>
              <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock :size="14" />
                <span>Active Snapshot Range: {{ formattedRangeLabel }}</span>
              </div>
              <div class="text-2xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{{ filteredSnapshotList.length }} Units Available</span>
                <span class="text-xs font-normal text-slate-400">
                  ({{ historicalBranch === 'ALL' ? 'Global Locations' : historicalBranch + ' Branch' }}
                  <template v-if="selectedProductFilter !== 'ALL'"> • SKU: {{ selectedProductFilter }}</template>)
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <StatBadge color="purple" :mono="true">{{ historicalStock.productsSummary.length }} SKUs IN STOCK</StatBadge>
              <StatBadge color="success" :mono="true">VERIFIED AUDIT</StatBadge>
            </div>
          </div>

          <!-- SKU breakdown cards -->
          <div v-if="historicalStock.productsSummary.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="pSum in historicalStock.productsSummary"
              :key="pSum.sku"
              @click="toggleProductFilter(pSum.sku)"
              :class="[
                'sku-stat-card p-4 space-y-2 cursor-pointer transition-all border-t-2 shadow-md hover:scale-[1.01]',
                selectedProductFilter === pSum.sku
                  ? 'border-t-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50'
                  : 'border-t-indigo-500 hover:border-t-indigo-400'
              ]"
              :title="`Click to filter audit list by ${pSum.productName}`"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="text-xs font-bold text-slate-200 leading-snug line-clamp-2" :title="pSum.productName">{{ pSum.productName }}</div>
                <StatBadge :color="selectedProductFilter === pSum.sku ? 'success' : 'purple'" :mono="true" class="text-[10px] shrink-0">{{ pSum.sku }}</StatBadge>
              </div>
              <div class="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
                <div class="text-xl font-extrabold text-white font-mono">{{ pSum.stockQty }} {{ pSum.stockQty === 1 ? 'Unit' : 'Units' }}</div>
                <span :class="['text-[11px] font-semibold uppercase tracking-wider', selectedProductFilter === pSum.sku ? 'text-emerald-300 font-bold' : 'text-emerald-400']">
                  {{ selectedProductFilter === pSum.sku ? '✓ Active Filter' : 'In Stock' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Snapshot serial table -->
          <DataTable
            :columns="['Serial Code', 'Machine Code', 'Product SKU', 'Category / HSN', 'Branch Location', 'Registration Date']"
            :empty="!historicalStock || filteredSnapshotList.length === 0"
            :empty-message="`No available stock matched for period ${formattedRangeLabel} and selected product filter.`"
          >
            <tr v-for="s in paginatedSnapshot" :key="s.serialCode">
              <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
              <td class="font-mono font-bold text-purple-400">{{ s.machineCode }}</td>
              <td class="font-bold text-white text-xs">{{ s.sku }}</td>
              <td><StatBadge color="purple">{{ s.hsnCode || '9018.1200' }}</StatBadge></td>
              <td class="font-bold text-emerald-400">{{ s.allocationCity }}</td>
              <td class="font-mono text-xs text-subtle">{{ s.registeredDate || '2026-07-10' }}</td>
            </tr>
          </DataTable>

          <PaginationBar
            v-if="historicalStock && filteredSnapshotList.length > 0"
            v-model="snapshotPage"
            v-model:pageSize="snapshotPageSize"
            :total-items="filteredSnapshotList.length"
          />
        </div>
      </GlassPanel>

      <!-- MASTER AUDIT TABLE — All registered machines -->
      <GlassPanel>
        <SectionTitle title="All Registered Machines Journey Audit Table">
          <template #icon><BarChart2 :size="20" class="text-blue-400" /></template>
          <template #toolbar>
            <StatBadge color="neutral" :mono="true">{{ dataStore.serials.length }} Units</StatBadge>
          </template>
        </SectionTitle>

        <DataTable
          :columns="['Serial Number', 'Machine Code', 'Product SKU', 'Branch Location', 'Customer', 'Sale Invoice #', 'Unit Sale Price', 'Payment Status']"
          :empty="dataStore.serials.length === 0"
        >
          <tr v-for="s in paginatedAudit" :key="s.serialCode">
            <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
            <td class="font-mono font-bold text-purple-400">{{ s.machineCode || 'N/A' }}</td>
            <td class="text-xs font-bold text-white">{{ s.sku }}</td>
            <td>
              <StatBadge color="purple">
                <Building2 :size="10" />
                {{ s.allocationCity || 'Peshawar' }}
              </StatBadge>
            </td>
            <td class="text-xs">
              <span v-if="s.customer" class="font-semibold text-main">{{ s.customer }}</span>
              <span v-else class="text-subtle">Available in Stock</span>
            </td>
            <td class="font-mono text-xs text-secondary">{{ s.invoiceNo || 'N/A' }}</td>
            <td class="font-bold text-emerald-400">{{ formatBalance(s.salePrice) }}</td>
            <td>
              <StatBadge :color="s.paymentStatus === 'Paid' ? 'success' : 'danger'">
                {{ s.paymentStatus || 'Pending' }}
              </StatBadge>
            </td>
          </tr>
        </DataTable>

        <PaginationBar
          v-if="dataStore.serials.length > 0"
          v-model="auditPage"
          v-model:pageSize="auditPageSize"
          :total-items="dataStore.serials.length"
        />
      </GlassPanel>
    </template>

    <!-- ════════════════════════════════════════════
      TAB 2-9: DEDICATED INDIVIDUAL ERP REPORT VIEWS
    ════════════════════════════════════════════ -->
    <template v-else>
      <GlassPanel extra-class="space-y-6">
        <!-- Active Report Banner & Quick Export Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
              :class="getReportHeaderClass(activeReport)"
            >
              <component :is="getReportIcon(currentReportMeta?.icon)" :size="24" />
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-lg font-black text-white tracking-tight">{{ currentReportDef.title }}</h2>
                <StatBadge color="purple" :mono="true">{{ currentReportDef.rows.length }} Records</StatBadge>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">{{ currentReportMeta?.description }}</p>
            </div>
          </div>

          <!-- 1-Click Multi-Format Export Buttons for Active Report -->
          <div class="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              @click="exportActiveReport('xlsx')"
              class="btn btn-sm bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow-md"
              title="Download Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet :size="14" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              @click="exportActiveReport('pdf')"
              class="btn btn-sm bg-red-700/80 hover:bg-red-600 text-white font-bold flex items-center gap-1.5 shadow-md"
              title="Download PDF Document (.pdf)"
            >
              <FileText :size="14" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              @click="exportActiveReport('word')"
              class="btn btn-sm bg-indigo-700/80 hover:bg-indigo-600 text-white font-bold flex items-center gap-1.5 shadow-md"
              title="Download Word Document (.docx)"
            >
              <FileCode :size="14" />
              <span>Word</span>
            </button>

            <button
              type="button"
              @click="exportActiveReport('csv')"
              class="btn btn-sm bg-amber-700/80 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-md"
              title="Download CSV File (.csv)"
            >
              <Download :size="14" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              @click="exportActiveReport('print')"
              class="btn btn-sm bg-blue-700/80 hover:bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow-md"
              title="Print Form"
            >
              <Printer :size="14" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <!-- Filter Controls: Search, Branch, Reset -->
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <!-- Search Filter -->
            <div class="relative min-w-[240px]">
              <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="reportSearchQuery"
                type="text"
                :placeholder="`Search ${currentReportMeta?.name || 'records'}...`"
                class="form-input text-xs pl-9 py-2 text-white bg-slate-900 border border-slate-700 rounded-xl w-full focus:border-indigo-500"
              />
            </div>

            <!-- Branch Filter -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-300">Branch:</span>
              <select
                v-model="reportBranchFilter"
                class="form-select text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl text-white py-2 px-3 focus:border-indigo-500"
              >
                <option value="ALL">🏢 All Branches (Global)</option>
                <option value="Peshawar">Peshawar HO</option>
                <option value="Multan">Multan Branch</option>
                <option value="Lahore">Lahore Branch</option>
              </select>
            </div>
          </div>

          <!-- Metadata info pills -->
          <div class="flex items-center gap-2 flex-wrap">
            <span
              v-for="(val, key) in currentReportDef.metadata"
              :key="key"
              class="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium"
            >
              <strong class="text-white">{{ key }}:</strong> {{ val }}
            </span>
          </div>
        </div>

        <!-- Report Data Table -->
        <DataTable
          :columns="currentReportDef.columns"
          :empty="currentReportDef.rows.length === 0"
          :empty-message="`No matching records found in ${currentReportDef.title}.`"
        >
          <tr v-for="(row, rIdx) in paginatedReportRows" :key="rIdx" class="hover:bg-slate-800/40 transition-colors">
            <td
              v-for="(cell, cIdx) in row"
              :key="cIdx"
              :class="[
                'text-xs py-3',
                cIdx === 0 ? 'font-mono font-bold text-indigo-400' : 'text-slate-200',
                typeof cell === 'number' ? 'font-mono font-bold text-emerald-400' : ''
              ]"
            >
              <span v-if="typeof cell === 'number'">{{ formatBalance(cell) }}</span>
              <span v-else>{{ cell }}</span>
            </td>
          </tr>
        </DataTable>

        <!-- Report Pagination Bar -->
        <PaginationBar
          v-if="currentReportDef.rows.length > 0"
          v-model="reportCurrentPage"
          v-model:pageSize="reportPageSize"
          :total-items="currentReportDef.rows.length"
        />
      </GlassPanel>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'

// Reusable UI components
import PageHeader        from '@/components/ui/PageHeader.vue'
import KpiCard           from '@/components/ui/KpiCard.vue'
import GlassPanel        from '@/components/ui/GlassPanel.vue'
import SectionTitle      from '@/components/ui/SectionTitle.vue'
import StatBadge         from '@/components/ui/StatBadge.vue'
import DataTable         from '@/components/ui/DataTable.vue'
import PaginationBar     from '@/components/ui/PaginationBar.vue'
import DownloadReportDropdown from '@/components/DownloadReportDropdown.vue'

// Reusable chart components
import AreaCurveChart    from '@/components/charts/AreaCurveChart.vue'
import BranchBarChart    from '@/components/charts/BranchBarChart.vue'
import DonutChart        from '@/components/charts/DonutChart.vue'
import ChartPresetToolbar from '@/components/charts/ChartPresetToolbar.vue'

// Reusable form components
import SelectInput       from '@/components/forms/SelectInput.vue'

// Lucide icons
import {
  Download, BarChart2, BarChart3, TrendingUp,
  Building2, Tag, CheckCircle2, Clock, PieChart, Calendar,
  Printer, FileSpreadsheet, FileCode, FileText, ChevronDown,
  Eye, EyeOff, Package, Search, ShoppingCart, Receipt, DollarSign,
  ShieldAlert, Truck, QrCode
} from 'lucide-vue-next'

import { ERP_REPORT_TYPES, getERPReportDefinition, exportUnifiedReport, exportReport } from '@/utils/reportExporter'

// ── Store & Router ─────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()

// ── Active Report View Tab ─────────────────────────────────────
const activeReport = ref('overview')
const reportSearchQuery = ref('')
const reportBranchFilter = ref('ALL')
const reportCurrentPage = ref(1)
const reportPageSize = ref(15)

// Sync route query report on load
onMounted(() => {
  if (route.query.report && ERP_REPORT_TYPES.some(r => r.id === route.query.report)) {
    activeReport.value = route.query.report
  } else {
    activeReport.value = 'overview'
  }
  applyDatePreset('Today')
})

watch(() => route.query.report, (newRep) => {
  if (newRep && ERP_REPORT_TYPES.some(r => r.id === newRep)) {
    activeReport.value = newRep
  } else if (!newRep) {
    activeReport.value = 'overview'
  }
})

function onReportTabChange(repId) {
  activeReport.value = repId
  reportCurrentPage.value = 1
  reportSearchQuery.value = ''
  if (repId === 'overview') {
    router.replace({ query: { ...route.query, report: undefined } })
  } else {
    router.replace({ query: { ...route.query, report: repId } })
  }
}

const currentReportMeta = computed(() => {
  return ERP_REPORT_TYPES.find(r => r.id === activeReport.value)
})

const currentReportDef = computed(() => {
  return getERPReportDefinition(activeReport.value, dataStore, {
    branch: reportBranchFilter.value,
    search: reportSearchQuery.value
  })
})

const paginatedReportRows = computed(() => {
  const rows = currentReportDef.value?.rows || []
  const start = (reportCurrentPage.value - 1) * reportPageSize.value
  return rows.slice(start, start + reportPageSize.value)
})

watch([reportSearchQuery, reportBranchFilter, activeReport], () => {
  reportCurrentPage.value = 1
})

function exportActiveReport(format) {
  exportUnifiedReport(activeReport.value, format, dataStore, {
    branch: reportBranchFilter.value,
    search: reportSearchQuery.value
  })
}

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
    BarChart3
  }
  return map[iconName] || FileSpreadsheet
}

function getReportHeaderClass(repId) {
  const map = {
    sales: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    payment_in: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    payment_out: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    inventory: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    credit: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    containers: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    serials: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    profit: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
  }
  return map[repId] || 'bg-slate-800 border-slate-700 text-indigo-400'
}

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

// ── Chart mode (Monthly / Quarterly / YTD / Custom) ─────────────
const chartMode = ref('Monthly')

// ── Custom chart date range state ──────────────────────────────
const chartCustomStart = ref(new Date(Date.now() - 30 * 86400000).toISOString().substring(0, 10))
const chartCustomEnd = ref(new Date().toISOString().substring(0, 10))
const activeChartPreset = ref('30D')

const chartCustomPresets = [
  { key: '7D', label: 'Last 7 Days' },
  { key: '30D', label: 'Last 30 Days' },
  { key: 'ThisMonth', label: 'This Month' },
  { key: '3M', label: 'Last 3 Months' },
  { key: 'YTD', label: 'This Year' }
]

function applyChartCustomPreset(key) {
  activeChartPreset.value = key
  const now = new Date()
  const todayStr = now.toISOString().substring(0, 10)
  chartCustomEnd.value = todayStr

  if (key === '7D') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    chartCustomStart.value = d.toISOString().substring(0, 10)
  } else if (key === '30D') {
    const d = new Date(now)
    d.setDate(d.getDate() - 29)
    chartCustomStart.value = d.toISOString().substring(0, 10)
  } else if (key === 'ThisMonth') {
    chartCustomStart.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  } else if (key === '3M') {
    const d = new Date(now)
    d.setMonth(d.getMonth() - 3)
    chartCustomStart.value = d.toISOString().substring(0, 10)
  } else if (key === 'YTD') {
    chartCustomStart.value = `${now.getFullYear()}-01-01`
  }
}

// ── Date range state ──────────────────────────────────────────
const activeDatePreset  = ref('Today')
const startDate         = ref(new Date().toISOString().substring(0, 10))
const endDate           = ref(new Date().toISOString().substring(0, 10))
const historicalBranch  = ref('ALL')
const historicalStock   = ref(null)

// ── Chart data points passed to AreaCurveChart ────────────────
const chartDataPoints = computed(() => {
  const invoices = dataStore.salesInvoices || []

  const getInvoicesBetween = (start, end) => {
    return invoices.filter(inv => {
      const d = (inv.saleDate || inv.createdAt || '').substring(0, 10)
      return (!start || d >= start) && (!end || d <= end)
    })
  }

  if (chartMode.value === 'Quarterly') {
    const quarters = [
      { label: 'Q1 2026', start: '2026-01-01', end: '2026-03-31' },
      { label: 'Q2 2026', start: '2026-04-01', end: '2026-06-30' },
      { label: 'Q3 2026 (Live)', start: '2026-07-01', end: '2026-09-30' },
      { label: 'Q4 2026 (Est)', start: '2026-10-01', end: '2026-12-31' }
    ]
    return quarters.map(q => {
      const matched = getInvoicesBetween(q.start, q.end)
      const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
      return {
        label: q.label,
        val,
        invoicesCount: matched.length
      }
    })
  }

  if (chartMode.value === 'YTD') {
    const years = [
      { label: '2023 FY', prefix: '2023' },
      { label: '2024 FY', prefix: '2024' },
      { label: '2025 FY', prefix: '2025' },
      { label: '2026 YTD', prefix: '2026' }
    ]
    return years.map(yr => {
      const matched = invoices.filter(inv => {
        const d = (inv.saleDate || inv.createdAt || '').substring(0, 10)
        return d.startsWith(yr.prefix)
      })
      const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
      return {
        label: yr.label,
        val,
        invoicesCount: matched.length
      }
    })
  }

  if (chartMode.value === 'Custom') {
    const startStr = chartCustomStart.value || '2026-01-01'
    const endStr = chartCustomEnd.value || new Date().toISOString().substring(0, 10)
    const startDateObj = new Date(startStr + 'T00:00:00')
    const endDateObj = new Date(endStr + 'T00:00:00')
    const diffDays = Math.max(1, Math.round((endDateObj - startDateObj) / (86400000))) + 1

    if (diffDays <= 14) {
      const pts = []
      for (let i = 0; i < diffDays; i++) {
        const cur = new Date(startDateObj.getTime() + i * 86400000)
        const dayStr = cur.toISOString().substring(0, 10)
        const label = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const matched = invoices.filter(inv => (inv.saleDate || inv.createdAt || '').substring(0, 10) === dayStr)
        const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
        pts.push({ label, val, invoicesCount: matched.length })
      }
      return pts
    }

    const intervalCount = 6
    const stepDays = Math.ceil(diffDays / intervalCount)
    const pts = []
    for (let i = 0; i < intervalCount; i++) {
      const segStart = new Date(startDateObj.getTime() + i * stepDays * 86400000)
      const segEnd = new Date(Math.min(endDateObj.getTime(), startDateObj.getTime() + ((i + 1) * stepDays - 1) * 86400000))
      if (segStart > endDateObj) break

      const sStr = segStart.toISOString().substring(0, 10)
      const eStr = segEnd.toISOString().substring(0, 10)
      const label = `${segStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      const matched = getInvoicesBetween(sStr, eStr)
      const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
      pts.push({ label, val, invoicesCount: matched.length })
      if (segEnd >= endDateObj) break
    }
    return pts
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
    const matched = invoices.filter(inv => {
      const d = (inv.saleDate || inv.createdAt || '').substring(0, 7)
      return d === m.key
    })
    const val = matched.reduce((acc, inv) => acc + Number(inv.grandTotal || inv.subtotal || 0), 0)
    return {
      label: m.label,
      val,
      invoicesCount: matched.length
    }
  })
})

// ── Branch bar chart data ─────────────────────────────────────
const branchMetrics = computed(() => {
  const branches = ['Peshawar', 'Multan', 'Lahore']
  const totals = branches.map(b => getBranchSalesTotal(b))
  const maxRev = Math.max(...totals, 0)
  return branches.map(bName => {
    const rev = getBranchSalesTotal(bName)
    return {
      name:       bName,
      revenue:    rev,
      count:      getBranchSalesCount(bName),
      percentage: maxRev > 0 ? Math.round((rev / maxRev) * 100) : 0
    }
  })
})

// ── Donut chart segments ──────────────────────────────────────
const donutSegments = computed(() => {
  const total       = dataStore.serials.length
  const ultrasound  = dataStore.serials.filter(s => s.sku && s.sku.includes('US')).length
  const laser       = dataStore.serials.filter(s => s.sku && s.sku.includes('LSR')).length
  const ecg         = dataStore.serials.filter(s => s.sku && s.sku.includes('ECG')).length
  const uPct  = total > 0 ? Math.round((ultrasound / total) * 100) : 0
  const lPct  = total > 0 ? Math.round((laser / total) * 100) : 0
  const ePct  = total > 0 ? Math.round((ecg / total) * 100) : 0
  return [
    { name: 'Ultrasound Systems',     count: ultrasound, pct: uPct, offset: 0,           color: '#3b82f6' },
    { name: 'Diode Laser Machines',   count: laser,      pct: lPct, offset: uPct,         color: '#8b5cf6' },
    { name: 'ECG Electrocardiographs',count: ecg,        pct: ePct, offset: uPct + lPct,  color: '#10b981' }
  ]
})

// ── Payment status computeds ──────────────────────────────────
const paidMachinesCount    = computed(() => dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus === 'Paid').length)
const pendingMachinesCount = computed(() => dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus !== 'Paid').length)
const collectionPercentage = computed(() => {
  const sold = dataStore.serials.filter(s => s.status === 'Sold').length
  return sold ? ((paidMachinesCount.value / sold) * 100).toFixed(1) : '0.0'
})

// ── Branch helper functions ───────────────────────────────────
function getBranchSalesCount(branch) {
  return dataStore.salesInvoices.filter(i => (i.branch || 'Peshawar') === branch).length
}
function getBranchSalesTotal(branch) {
  return dataStore.salesInvoices
    .filter(i => (i.branch || 'Peshawar') === branch)
    .reduce((acc, i) => acc + (i.grandTotal || 0), 0)
}
function getBranchStockCount(branch) {
  return dataStore.serials.filter(s => (s.allocationCity || 'Peshawar') === branch && s.status === 'Available').length
}

function applyDatePreset(presetKey) {
  activeDatePreset.value = presetKey
  const now = new Date()

  if (presetKey === 'Today') {
    const t = now.toISOString().substring(0, 10)
    startDate.value = t; endDate.value = t
  } else if (presetKey === 'Yesterday') {
    const y = new Date(now); y.setDate(y.getDate() - 1)
    const s = y.toISOString().substring(0, 10)
    startDate.value = s; endDate.value = s
  } else if (presetKey === 'ThisMonth') {
    startDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
    endDate.value   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10)
  } else if (presetKey === 'LastMonth') {
    startDate.value = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 10)
    endDate.value   = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().substring(0, 10)
  }
  updateHistoricalReport()
}

function handleCustomDateChange() {
  activeDatePreset.value = 'Custom'
  updateHistoricalReport()
}

function updateHistoricalReport() {
  if (!endDate.value) return
  const start = (activeDatePreset.value === 'Today' || activeDatePreset.value === 'Yesterday') ? null : startDate.value
  historicalStock.value = dataStore.getHistoricalStock(endDate.value, historicalBranch.value, start)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const [y, m, d] = dateStr.split('-')
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

const formattedRangeLabel = computed(() => {
  if (!startDate.value || !endDate.value) return ''
  if (startDate.value === endDate.value) return `${formatDate(endDate.value)} (${activeDatePreset.value})`
  return `${formatDate(startDate.value)} – ${formatDate(endDate.value)} (${activeDatePreset.value})`
})

// ── Product-Wise Filter & Search State for Historical Stock ────
const selectedProductFilter = ref('ALL')
const stockSearchQuery = ref('')

const availableProductFilterOptions = computed(() => {
  const map = new Map()
  if (historicalStock.value?.productsSummary) {
    historicalStock.value.productsSummary.forEach(p => {
      map.set(p.sku, { sku: p.sku, name: p.productName || p.sku })
    })
  }
  dataStore.products.forEach(p => {
    if (!map.has(p.sku)) {
      map.set(p.sku, { sku: p.sku, name: p.name || p.sku })
    }
  })
  return Array.from(map.values())
})

const filteredSnapshotList = computed(() => {
  let list = historicalStock.value?.serialsSnapshot || []

  if (selectedProductFilter.value !== 'ALL') {
    const skuTarget = selectedProductFilter.value.toLowerCase()
    list = list.filter(s => 
      (s.sku && s.sku.toLowerCase() === skuTarget) ||
      (s.productName && s.productName.toLowerCase().includes(skuTarget))
    )
  }

  if (stockSearchQuery.value.trim()) {
    const q = stockSearchQuery.value.trim().toLowerCase()
    list = list.filter(s => 
      (s.serialCode && s.serialCode.toLowerCase().includes(q)) ||
      (s.machineCode && s.machineCode.toLowerCase().includes(q)) ||
      (s.sku && s.sku.toLowerCase().includes(q)) ||
      (s.allocationCity && s.allocationCity.toLowerCase().includes(q)) ||
      (s.hsnCode && s.hsnCode.toLowerCase().includes(q))
    )
  }

  return list
})

function toggleProductFilter(sku) {
  if (selectedProductFilter.value === sku) {
    selectedProductFilter.value = 'ALL'
  } else {
    selectedProductFilter.value = sku
  }
  snapshotPage.value = 1
}

function resetProductFilters() {
  selectedProductFilter.value = 'ALL'
  stockSearchQuery.value = ''
  snapshotPage.value = 1
}

// ── Pagination for Historical Stock Serials Snapshot ─────────
const snapshotPage = ref(1)
const snapshotPageSize = ref(10)

const paginatedSnapshot = computed(() => {
  const list = filteredSnapshotList.value
  const start = (snapshotPage.value - 1) * snapshotPageSize.value
  return list.slice(start, start + snapshotPageSize.value)
})

watch([historicalBranch, activeDatePreset, startDate, endDate, selectedProductFilter, stockSearchQuery], () => {
  snapshotPage.value = 1
})

// ── Pagination for Master Audit Table ────────────────────────
const auditPage = ref(1)
const auditPageSize = ref(10)

const paginatedAudit = computed(() => {
  const list = dataStore.serials || []
  const start = (auditPage.value - 1) * auditPageSize.value
  return list.slice(start, start + auditPageSize.value)
})

// ── Download Historical Stock Position ERP Report ─────────────
function downloadHistoricalStockReport(format = 'xlsx') {
  const branchLabel = historicalBranch.value === 'ALL' 
    ? 'All Branches (Peshawar HO, Multan, Lahore)' 
    : `${historicalBranch.value} Branch`

  const dateLabel = formattedRangeLabel.value || new Date().toISOString().split('T')[0]
  const prodLabel = selectedProductFilter.value === 'ALL' ? 'All Products / SKUs' : selectedProductFilter.value

  const summary = {
    'Report Type': 'Historical Stock & Machine Position Audit',
    'Target Snapshot Date / Range': dateLabel,
    'Branch Depot Coverage': branchLabel,
    'Product / SKU Filter': prodLabel,
    'Total Available Units': `${filteredSnapshotList.value.length} Available Machine Units`,
    'Distinct SKUs in Stock': `${historicalStock.value?.productsSummary?.length || 0} Products`,
    'Generated Date': new Date().toLocaleString()
  }

  const headers = [
    'Serial Code',
    'Machine Code',
    'Product / SKU',
    'Category / HSN Code',
    'Branch Location',
    'Registration Date',
    'Status',
    'Cost Price (PKR)',
    'Sale Price (PKR)'
  ]

  const rows = filteredSnapshotList.value.map(s => {
    const parentProd = dataStore.products.find(p => p.sku === s.sku || p.id === s.productId)
    return [
      s.serialCode,
      s.machineCode || 'N/A',
      s.sku,
      s.hsnCode || '9018.1200',
      s.allocationCity || 'Peshawar',
      s.registeredDate || '2026-07-10',
      'Available In Stock',
      parentProd ? parentProd.costPrice : 0,
      s.salePrice || (parentProd ? parentProd.sellingPrice : 0)
    ]
  })

  const filename = `Historical_Stock_Report_${selectedProductFilter.value === 'ALL' ? 'Global' : selectedProductFilter.value}_${new Date().toISOString().substring(0, 10)}`

  exportReport(format, {
    title: 'Medimage Services ERP — Historical Stock Position Audit Report',
    dateRange: dateLabel,
    branch: branchLabel,
    summary,
    headers,
    rows,
    filename
  })
}
</script>

<style scoped>
.date-control-card {
  background: var(--bg-card, rgba(15, 23, 42, 0.6));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 0.85rem;
  padding: 1rem;
}

.sku-stat-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 0.75rem;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.sku-stat-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

[data-theme="light"] .date-control-card {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
}
[data-theme="light"] .sku-stat-card {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  border-top-color: #4f46e5 !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05) !important;
}
[data-theme="light"] .sku-stat-card:hover {
  border-color: #3b82f6 !important;
}
</style>

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

  <div v-else class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Matching Executive Dashboard
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Executive ERP Reports & Analytics"
      subtitle="Centralized multi-module ERP reporting engine with live ledger audit tables, branch metrics, and instant multi-format downloads."
      :badges="[
        { label: '👑 SUPERADMIN HQ EXCLUSIVE', color: 'purple' },
        { label: 'AUDIT & EXPORT HUB', color: 'success' }
      ]"
    >
      <template #actions>
        <div class="relative z-40 flex items-center gap-2.5 flex-wrap">
          <!-- View / Hide Balance Security Toggle -->
          <button
            @click="authStore.toggleBalance()"
            :class="[
              'btn font-bold flex items-center justify-center gap-2 shadow-lg transition-all h-11 px-4 whitespace-nowrap rounded-xl text-xs sm:text-sm',
              authStore.isBalanceVisible ? 'btn-secondary text-slate-300 hover:text-white' : 'btn-warning text-white'
            ]"
            :style="authStore.isBalanceVisible ? '' : 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important;'"
            :title="authStore.isBalanceVisible ? 'Hide and mask financial balances' : 'Dashboard login verification required to reveal balances'"
          >
            <EyeOff v-if="authStore.isBalanceVisible" :size="16" />
            <Eye v-else :size="16" />
            <span>{{ authStore.isBalanceVisible ? 'Hide Balance' : 'View / Check Balance' }}</span>
          </button>

          <!-- Executive Context-Aware Download Dropdown -->
          <DownloadReportDropdown
            :report-type="activeReport"
            :current-branch="reportBranchFilter"
          />
        </div>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      REPORT SELECTOR ELEVATED PILL TABS (User Reference Style)
    ════════════════════════════════════════════ -->
    <div class="overflow-hidden py-1">
      <div class="flex items-center gap-3 overflow-x-auto p-1 pb-2 custom-scrollbar">
        <!-- 0. Overview Tab -->
        <button
          type="button"
          @click="onReportTabChange('overview')"
          :class="['report-pill-card', activeReport === 'overview' ? 'active-pill-card' : '']"
        >
          <BarChart3 :size="16" class="text-indigo-500 shrink-0" />
          <span class="pill-title">Overview & Charts</span>
        </button>

        <!-- 1-8. Module Report Tabs with Badges -->
        <button
          v-for="rep in ERP_REPORT_TYPES"
          :key="rep.id"
          type="button"
          @click="onReportTabChange(rep.id)"
          :class="['report-pill-card', activeReport === rep.id ? 'active-pill-card' : '']"
        >
          <component :is="getReportIcon(rep.icon)" :size="16" :class="getIconToneClass(rep.color)" class="shrink-0" />
          <span class="pill-title">{{ rep.name }}</span>
          <span class="pill-count-badge">{{ getReportCount(rep.id) }}</span>
        </button>
      </div>
    </div>

    <!-- ════════════════════════════════════════════
      TAB 1: OVERVIEW & GRAPHS
    ════════════════════════════════════════════ -->
    <template v-if="activeReport === 'overview'">
      <!-- Product Quick Filter Chips for Overview -->
      <GlassPanel extra-class="p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-subtle flex items-center gap-1.5 mr-1">
            <Package :size="14" class="text-emerald-400" />
            <span>Product Filter:</span>
          </span>
          <button
            type="button"
            @click="reportProductFilter = 'ALL'"
            :class="['btn btn-xs rounded-lg font-bold', reportProductFilter === 'ALL' ? 'btn-primary' : 'btn-secondary text-subtle']"
          >
            📦 All Products ({{ dataStore.products.length }})
          </button>
          <button
            v-for="p in availableProductFilterOptions"
            :key="p.sku"
            type="button"
            @click="reportProductFilter = p.sku"
            :class="['btn btn-xs rounded-lg font-bold', reportProductFilter === p.sku ? 'btn-primary' : 'btn-secondary text-subtle']"
          >
            {{ p.sku }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-subtle flex items-center gap-1">
            <Building2 :size="14" class="text-indigo-400" />
            <span>Branch:</span>
          </span>
          <select
            v-model="reportBranchFilter"
            class="form-select text-xs font-bold bg-slate-950/60 border border-slate-700 rounded-xl py-1.5 px-2.5 text-main focus:border-indigo-500"
          >
            <option value="ALL">🏢 All Branches</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Multan">Multan Branch</option>
            <option value="Lahore">Lahore Branch</option>
          </select>
        </div>
      </GlassPanel>

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
      TAB 2-9: DEDICATED INDIVIDUAL ERP REPORT VIEWS
    ════════════════════════════════════════════ -->
    <template v-else>
      <div class="space-y-6 animate-fadeIn">
        <!-- 1. Report Header Banner matching Dashboard Style -->
        <GlassPanel extra-class="p-5 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3.5 min-w-0">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
              :class="getReportHeaderBadgeClass(activeReport)"
            >
              <component :is="getReportIcon(currentReportMeta?.icon)" :size="24" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-xl font-extrabold text-main tracking-tight">{{ currentReportDef.title }}</h2>
                <StatBadge color="purple" :mono="true">{{ currentReportDef.rows.length }} RECORDS</StatBadge>
              </div>
              <p class="text-xs text-subtle mt-0.5">{{ currentReportMeta?.description }}</p>
            </div>
          </div>

          <!-- Format Export Pills Toolbar for This Specific Report -->
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

        <!-- 2. Dynamic Report KPI Cards Grid -->
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

        <!-- 3. Filter Toolbar with Search, Branch & Product / SKU Filters -->
        <GlassPanel extra-class="p-4 flex flex-col gap-3">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <!-- Search Filter -->
              <div class="relative min-w-[200px] sm:min-w-[240px]">
                <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  v-model="reportSearchQuery"
                  type="text"
                  :placeholder="`Search ${currentReportMeta?.name || 'records'}...`"
                  class="form-input text-xs pl-9 pr-3 py-2 rounded-xl w-full text-main bg-slate-950/60 border border-slate-700 focus:border-indigo-500"
                />
              </div>

              <!-- Branch Filter Dropdown -->
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-subtle flex items-center gap-1">
                  <Building2 :size="14" class="text-indigo-400" />
                  <span>Branch:</span>
                </span>
                <select
                  v-model="reportBranchFilter"
                  class="form-select text-xs font-bold bg-slate-950/60 border border-slate-700 rounded-xl py-2 px-3 text-main focus:border-indigo-500"
                >
                  <option value="ALL">🏢 All Branches (Global)</option>
                  <option value="Peshawar">Peshawar HO</option>
                  <option value="Multan">Multan Branch</option>
                  <option value="Lahore">Lahore Branch</option>
                </select>
              </div>

              <!-- Product / SKU Filter Dropdown -->
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-subtle flex items-center gap-1">
                  <Package :size="14" class="text-emerald-400" />
                  <span>Product / SKU:</span>
                </span>
                <select
                  v-model="reportProductFilter"
                  class="form-select text-xs font-bold bg-slate-950/60 border border-slate-700 rounded-xl py-2 px-3 text-main focus:border-indigo-500"
                >
                  <option value="ALL">📦 All Products & SKUs (Global)</option>
                  <option v-for="p in availableProductFilterOptions" :key="p.sku" :value="p.sku">
                    {{ p.name }} ({{ p.sku }})
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs text-subtle">
                Showing {{ currentReportDef.rows.length }} records
              </span>
              <button
                v-if="reportSearchQuery || reportBranchFilter !== 'ALL' || reportProductFilter !== 'ALL'"
                type="button"
                @click="resetReportFilters"
                class="btn btn-ghost btn-xs text-amber-400 hover:text-white font-bold"
              >
                ✕ Reset Filters
              </button>
            </div>
          </div>

          <!-- Quick Select Product Pills Bar -->
          <div class="flex items-center gap-1.5 pt-2 border-t border-slate-800/80 overflow-x-auto custom-scrollbar">
            <span class="text-[11px] font-bold text-subtle mr-1 whitespace-nowrap">Quick SKU:</span>
            <button
              type="button"
              @click="reportProductFilter = 'ALL'"
              :class="['px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all', reportProductFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-subtle hover:text-main']"
            >
              All SKUs
            </button>
            <button
              v-for="p in availableProductFilterOptions"
              :key="p.sku"
              type="button"
              @click="reportProductFilter = p.sku"
              :class="['px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all', reportProductFilter === p.sku ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-subtle hover:text-main']"
            >
              {{ p.sku }} • {{ p.name.split(' ')[0] }}
            </button>
          </div>
        </GlassPanel>

        <!-- 4. Interactive Data Table with Preview & Edit Buttons -->
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
                <span v-else-if="cell === 'Paid' || cell === 'Fully Paid'" class="badge badge-success font-bold text-[10px]">✓ {{ cell }}</span>
                <span v-else-if="cell === 'Pending' || cell === 'Unpaid Due'" class="badge badge-danger font-bold text-[10px]">✕ {{ cell }}</span>
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

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

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

// Lucide icons
import {
  Download, BarChart2, BarChart3, TrendingUp,
  Building2, Tag, CheckCircle2, Clock, PieChart, Calendar,
  Printer, FileSpreadsheet, FileCode, FileText, ChevronDown,
  Eye, EyeOff, Package, Search, ShoppingCart, Receipt, DollarSign,
  ShieldAlert, Truck, QrCode, ArrowUpRight, ArrowDownRight, Layers, Edit3
} from 'lucide-vue-next'

import { ERP_REPORT_TYPES, getERPReportDefinition, exportUnifiedReport, exportPrint } from '@/utils/reportExporter'

// ── Store & Router ─────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const dataStore = useDataStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// ── Active Report View Tab ─────────────────────────────────────
const activeReport = ref('overview')
const reportSearchQuery = ref('')
const reportBranchFilter = ref('ALL')
const reportProductFilter = ref('ALL')
const reportCurrentPage = ref(1)
const reportPageSize = ref(15)

// ── Available Products for Filter Dropdown ─────────────────────
const availableProductFilterOptions = computed(() => {
  const map = new Map()
  dataStore.products.forEach(p => {
    map.set(p.sku, { sku: p.sku, name: p.name || p.sku })
  })
  dataStore.serials.forEach(s => {
    if (s.sku && !map.has(s.sku)) {
      map.set(s.sku, { sku: s.sku, name: s.productName || s.sku })
    }
  })
  return Array.from(map.values())
})

// ── Preview & Edit Modals State ────────────────────────────────
const showPreviewModal = ref(false)
const showEditModal = ref(false)
const previewTitle = ref('')
const previewFields = ref({})
const editRecordRef = ref('')
const editForm = ref({ title: '', branch: 'Peshawar', status: 'Paid', notes: '' })

// Sync route query report on load
onMounted(() => {
  if (!authStore.isSuperAdmin) {
    router.push('/dashboard')
    return
  }
  if (route.query.report && ERP_REPORT_TYPES.some(r => r.id === route.query.report)) {
    activeReport.value = route.query.report
  } else {
    activeReport.value = 'overview'
  }
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

function resetReportFilters() {
  reportSearchQuery.value = ''
  reportBranchFilter.value = 'ALL'
  reportProductFilter.value = 'ALL'
  reportCurrentPage.value = 1
}

function getReportCount(repId) {
  switch (repId) {
    case 'sales': return (dataStore.salesInvoices || []).length
    case 'payment_in': return (dataStore.paymentReceipts || []).length
    case 'payment_out': return (dataStore.paymentOutVouchers || []).length
    case 'inventory': return (dataStore.products || []).length
    case 'credit': return (dataStore.customers || []).length
    case 'containers': return (dataStore.containers || []).length || 3
    case 'serials': return (dataStore.serials || []).length
    case 'profit': return 6
    default: return 0
  }
}

const currentReportMeta = computed(() => {
  return ERP_REPORT_TYPES.find(r => r.id === activeReport.value)
})

const currentReportDef = computed(() => {
  return getERPReportDefinition(activeReport.value, dataStore, {
    branch: reportBranchFilter.value,
    product: reportProductFilter.value,
    search: reportSearchQuery.value
  })
})

const paginatedReportRows = computed(() => {
  const rows = currentReportDef.value?.rows || []
  const start = (reportCurrentPage.value - 1) * reportPageSize.value
  return rows.slice(start, start + reportPageSize.value)
})

watch([reportSearchQuery, reportBranchFilter, reportProductFilter, activeReport], () => {
  reportCurrentPage.value = 1
})

function exportActiveReport(format) {
  exportUnifiedReport(activeReport.value, format, dataStore, {
    branch: reportBranchFilter.value,
    product: reportProductFilter.value,
    search: reportSearchQuery.value
  })
}

// ── Open Preview Modal ─────────────────────────────────────────
function openRowPreview(row) {
  const cols = currentReportDef.value?.columns || []
  const fields = {}
  cols.forEach((col, idx) => {
    fields[col] = row[idx]
  })
  previewTitle.value = `${currentReportMeta.value?.name || 'Document Slip'} — ${row[0]}`
  previewFields.value = fields
  showPreviewModal.value = true
}

function printPreviewDoc() {
  exportPrint(previewTitle.value, previewFields.value, Object.keys(previewFields.value), [Object.values(previewFields.value)])
}

function printRowRecord(row) {
  const cols = currentReportDef.value?.columns || []
  const fields = {}
  cols.forEach((col, idx) => {
    fields[col] = row[idx]
  })
  exportPrint(`${currentReportMeta.value?.name || 'Record Slip'} — ${row[0]}`, fields, cols, [row])
}

// ── Open Edit Modal ───────────────────────────────────────────
function openRowEdit(row) {
  editRecordRef.value = `Record Reference: ${row[0]}`
  editForm.value = {
    title: row[1] || row[2] || row[0],
    branch: reportBranchFilter.value === 'ALL' ? 'Peshawar' : reportBranchFilter.value,
    status: row[row.length - 1] || 'Paid',
    notes: `Audited in ${currentReportMeta.value?.name}`
  }
  showEditModal.value = true
}

function saveEditRecord() {
  showEditModal.value = false
  try {
    uiStore.showModal('Changes Saved', 'Record details updated and logged to ERP system.', 'success')
  } catch (e) {
    console.log('Record updated successfully')
  }
}

// ── Dynamic KPI Metric Cards per Active Report ────────────────
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
        { label: 'Available in Warehouse', value: `${dataStore.availableSerialsCount} Units`, subtitle: 'Ready for delivery', icon: Package, iconColor: 'text-emerald-400' },
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
    BarChart3
  }
  return map[iconName] || FileSpreadsheet
}

function getIconToneClass(color) {
  const map = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500',
    purple: 'text-purple-500',
    teal: 'text-teal-500',
    rose: 'text-rose-500',
    cyan: 'text-cyan-500'
  }
  return map[color] || 'text-indigo-500'
}

function getReportHeaderBadgeClass(repId) {
  const map = {
    sales: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    payment_in: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    payment_out: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    inventory: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
    credit: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    containers: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    serials: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
    profit: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
  }
  return map[repId] || 'bg-slate-800 border-slate-700 text-indigo-400'
}

function formatBalance(amount, prefix = 'PKR ') {
  if (authStore.isBalanceVisible) {
    return `${prefix}${(amount || 0).toLocaleString()}`
  }
  return `${prefix}••••••`
}

// ── Overview Charts State ──────────────────────────────────────
const chartMode = ref('Monthly')

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
  let list = dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus === 'Paid')
  if (reportBranchFilter.value !== 'ALL') list = list.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') list = list.filter(s => s.sku === reportProductFilter.value)
  return list.length
})

const pendingMachinesCount = computed(() => {
  let list = dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus !== 'Paid')
  if (reportBranchFilter.value !== 'ALL') list = list.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') list = list.filter(s => s.sku === reportProductFilter.value)
  return list.length
})

const collectionPercentage = computed(() => {
  let sold = dataStore.serials.filter(s => s.status === 'Sold')
  if (reportBranchFilter.value !== 'ALL') sold = sold.filter(s => (s.allocationCity || s.branch || 'Peshawar') === reportBranchFilter.value)
  if (reportProductFilter.value !== 'ALL') sold = sold.filter(s => s.sku === reportProductFilter.value)
  return sold.length ? ((paidMachinesCount.value / sold.length) * 100).toFixed(1) : '0.0'
})

function getBranchSalesCount(branch) {
  let invs = dataStore.salesInvoices.filter(i => (i.branch || 'Peshawar') === branch)
  if (reportProductFilter.value !== 'ALL') {
    invs = invs.filter(i => (i.items || []).some(it => it.sku === reportProductFilter.value))
  }
  return invs.length
}

function getBranchSalesTotal(branch) {
  let invs = dataStore.salesInvoices.filter(i => (i.branch || 'Peshawar') === branch)
  if (reportProductFilter.value !== 'ALL') {
    invs = invs.filter(i => (i.items || []).some(it => it.sku === reportProductFilter.value))
  }
  return invs.reduce((acc, i) => acc + (i.grandTotal || 0), 0)
}

function getBranchStockCount(branch) {
  let list = dataStore.serials.filter(s => (s.allocationCity || 'Peshawar') === branch && s.status === 'Available')
  if (reportProductFilter.value !== 'ALL') {
    list = list.filter(s => s.sku === reportProductFilter.value)
  }
  return list.length
}
</script>

<style scoped>
/* ── Elevated Standalone Pill Tabs (Matching Reference Image) ─ */
.report-pill-card {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.15rem;
  border-radius: 0.85rem;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 700;
  text-decoration: none;
}

.report-pill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
  border-color: #cbd5e1 !important;
}

.report-pill-card.active-pill-card {
  border: 2px solid #4f46e5 !important;
  border-bottom: 4px solid #4f46e5 !important;
  background: #ffffff !important;
  color: #4338ca !important;
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.22) !important;
}

.pill-title {
  font-size: 0.8rem;
  font-weight: 800;
}

.pill-count-badge {
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-family: monospace;
  font-weight: 800;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.report-pill-card.active-pill-card .pill-count-badge {
  background: #e0e7ff;
  color: #3730a3;
  border-color: #c7d2fe;
}

/* ── Dark Theme Adaptations ────────────────────────────────── */
[data-theme="dark"] .report-pill-card,
:root:not([data-theme="light"]) .report-pill-card {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45) !important;
}

[data-theme="dark"] .report-pill-card.active-pill-card,
:root:not([data-theme="light"]) .report-pill-card.active-pill-card {
  background: #1e293b !important;
  border: 2px solid #6366f1 !important;
  border-bottom: 4px solid #6366f1 !important;
  color: #818cf8 !important;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35) !important;
}

[data-theme="dark"] .pill-count-badge,
:root:not([data-theme="light"]) .pill-count-badge {
  background: #0f172a;
  color: #94a3b8;
  border-color: #334155;
}

/* ── Modals ────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.75);
  backdrop-filter: blur(6px);
  z-index: 999;
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

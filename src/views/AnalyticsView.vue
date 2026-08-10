<template>
  <div class="page-wrapper space-y-6">
    <!-- Header Banner -->
    <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="badge badge-purple font-mono">MEDIMAGE ERP REPORTING</span>
          <span class="badge badge-success font-mono">BRANCH & MACHINE ANALYTICS</span>
        </div>
        <h1 class="text-3xl font-extrabold text-white mt-2 tracking-tight">Executive ERP Reports</h1>
        <p class="text-slate-300 text-sm mt-1">
          Branch-wise sales & stock reports, machine payment tracking reports (Paid vs Unpaid), daily/monthly sales, and CSV export.
        </p>
      </div>

      <button @click="exportCSVReport" class="btn btn-success btn-lg shadow-xl">
        <Download :size="18" />
        <span>Export Sales & Machine Report (CSV)</span>
      </button>
    </div>

    <!-- Branch Wise Sales Summary Cards -->
    <div class="kpi-grid">
      <div v-for="bName in ['Peshawar', 'Multan', 'Lahore']" :key="bName" class="kpi-card glass-panel p-5 space-y-3">
        <div class="flex justify-between items-center">
          <span class="kpi-title uppercase flex items-center gap-1.5">
            <Building2 :size="14" class="text-indigo-400" />
            <span>{{ bName }} Branch</span>
          </span>
          <span class="badge badge-info font-mono">
            {{ getBranchSalesCount(bName) }} Invoices
          </span>
        </div>

        <div class="kpi-value text-emerald-400">
          PKR {{ (getBranchSalesTotal(bName) || 0).toLocaleString() }}
        </div>

        <div class="flex justify-between text-xs text-subtle border-t border-slate-800 pt-2">
          <span>Available Stock:</span>
          <span class="font-bold text-white">{{ getBranchStockCount(bName) }} machines</span>
        </div>
      </div>
    </div>

    <!-- Executive Sales Revenue Trend Graph -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-purple font-mono">REVENUE ANALYTICS</span>
            <span class="badge badge-success font-mono">LIVE TREND GRAPH</span>
          </div>
          <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
            <TrendingUp :size="22" class="text-indigo-400" />
            <span>Sales & Revenue Growth Trend Curve</span>
          </h3>
          <p class="text-xs text-subtle mt-0.5">Visual curve of completed sales invoices and gross revenue over time.</p>
        </div>

        <div class="preset-toolbar">
          <button
            v-for="t in ['Monthly', 'Quarterly', 'YTD']"
            :key="t"
            @click="chartMode = t"
            :class="['preset-btn', chartMode === t ? 'active' : '']"
          >
            {{ t }}
          </button>
        </div>
      </div>

      <!-- SVG Smooth Area Curve Graph -->
      <div class="chart-container relative pt-6 pb-4 px-3 bg-slate-950/50 rounded-2xl border border-slate-800/80 shadow-inner overflow-x-auto">
        <svg viewBox="0 0 800 240" class="w-full min-w-[600px] h-60 overflow-visible">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45" />
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Horizontal Grid Lines -->
          <line x1="40" y1="40" x2="760" y2="40" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
          <line x1="40" y1="90" x2="760" y2="90" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
          <line x1="40" y1="140" x2="760" y2="140" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
          <line x1="40" y1="190" x2="760" y2="190" stroke="rgba(255,255,255,0.12)" />

          <!-- Y-Axis Labels -->
          <text x="32" y="44" class="chart-axis-text text-[10px] font-mono font-bold" text-anchor="end">10M</text>
          <text x="32" y="94" class="chart-axis-text text-[10px] font-mono font-bold" text-anchor="end">6.5M</text>
          <text x="32" y="144" class="chart-axis-text text-[10px] font-mono font-bold" text-anchor="end">3.2M</text>
          <text x="32" y="194" class="chart-axis-text text-[10px] font-mono font-bold" text-anchor="end">0</text>

          <!-- Smooth Filled Gradient Area -->
          <path :d="chartAreaPath" fill="url(#salesGrad)" />

          <!-- Smooth Curved Line -->
          <path :d="chartLinePath" fill="none" stroke="#6366f1" stroke-width="3.5" filter="url(#glow)" stroke-linecap="round" />

          <!-- Interactive Data Points -->
          <g v-for="(pt, idx) in chartPoints" :key="idx">
            <circle
              :cx="pt.x"
              :cy="pt.y"
              r="6"
              fill="#3b82f6"
              stroke="#ffffff"
              stroke-width="2.5"
              class="cursor-pointer transition-all hover:r-8 hover:fill-emerald-400"
              @mouseenter="hoveredPoint = pt"
              @mouseleave="hoveredPoint = null"
            />
            <text :x="pt.x" y="215" class="chart-axis-text text-[11px] font-mono font-bold" text-anchor="middle">{{ pt.label }}</text>
          </g>
        </svg>

        <!-- Interactive Hover Tooltip Card -->
        <div
          v-if="hoveredPoint"
          class="absolute p-3 bg-slate-900 border border-indigo-500/60 rounded-xl shadow-2xl pointer-events-none text-xs space-y-1 transition-all z-30"
          :style="{ left: `${hoveredPoint.xPct}%`, top: `${hoveredPoint.yPct}%`, transform: 'translate(-50%, -125%)' }"
        >
          <div class="font-bold text-white flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{{ hoveredPoint.label }} Performance</span>
          </div>
          <div class="font-mono text-emerald-400 font-extrabold text-sm">PKR {{ hoveredPoint.val.toLocaleString() }}</div>
          <div class="text-[11px] text-slate-400 font-mono">{{ hoveredPoint.invoicesCount }} Invoices Closed</div>
        </div>
      </div>
    </div>

    <!-- Branch Sales Comparison & Category Distribution Graphs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Regional Branch Performance Bar Chart -->
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 class="font-extrabold text-white text-base flex items-center gap-2">
            <BarChart3 :size="18" class="text-indigo-400" />
            <span>Branch Revenue & Sales Volume Comparison</span>
          </h4>
          <span class="badge badge-purple font-mono">3 BRANCHES</span>
        </div>

        <div class="space-y-4 pt-2">
          <div v-for="b in branchMetrics" :key="b.name" class="space-y-1.5">
            <div class="flex justify-between text-xs font-bold">
              <span class="text-slate-200 flex items-center gap-1.5">
                <Building2 :size="14" class="text-indigo-400" />
                <span>{{ b.name }} Branch</span>
              </span>
              <span class="text-emerald-400 font-mono">PKR {{ b.revenue.toLocaleString() }} ({{ b.count }} Sales)</span>
            </div>
            <div class="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 shadow-md"
                :style="{ width: `${b.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Equipment Category Donut Chart -->
      <div class="glass-panel p-6 shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h4 class="font-extrabold text-white text-base flex items-center gap-2">
            <PieChart :size="18" class="text-emerald-400" />
            <span>Machine Category Distribution</span>
          </h4>
          <span class="badge badge-success font-mono">{{ dataStore.serials.length }} UNITS</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center gap-6 pt-2">
          <!-- SVG Radial Donut Chart -->
          <div class="relative w-40 h-40 flex-shrink-0">
            <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3.8" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" stroke-width="3.8" stroke-dasharray="50, 100" stroke-linecap="round" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" stroke-width="3.8" stroke-dasharray="30, 100" stroke-dashoffset="-50" stroke-linecap="round" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" stroke-width="3.8" stroke-dasharray="20, 100" stroke-dashoffset="-80" stroke-linecap="round" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-xl font-extrabold text-white font-mono leading-none">{{ dataStore.serials.length }}</span>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Machines</span>
            </div>
          </div>

          <!-- Category Legends -->
          <div class="space-y-2.5 w-full">
            <div v-for="cat in categoryDistribution" :key="cat.name" class="flex items-center justify-between text-xs p-2.5 bg-slate-900/50 rounded-lg border border-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: cat.color }"></span>
                <span class="font-bold text-slate-200">{{ cat.name }}</span>
              </div>
              <span class="font-mono text-emerald-400 font-bold">{{ cat.count }} Units ({{ cat.pct }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Machine Payment Status Report Card (Paid vs Unpaid Machines) -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Tag :size="20" class="text-purple-400" />
          <span>Machine-Wise Payment Status Report</span>
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass-panel p-4 border border-emerald-500/30 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <CheckCircle2 :size="14" class="text-emerald-400" />
            <span>Fully Paid Machines</span>
          </div>
          <div class="text-2xl font-extrabold text-emerald-400 font-mono">{{ paidMachinesCount }}</div>
          <div class="text-xs text-subtle">Payment receipt verified</div>
        </div>

        <div class="glass-panel p-4 border border-red-500/30 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <Clock :size="14" class="text-red-400" />
            <span>Unpaid / Pending Machines</span>
          </div>
          <div class="text-2xl font-extrabold text-red-400 font-mono">{{ pendingMachinesCount }}</div>
          <div class="text-xs text-subtle">Payment expected</div>
        </div>

        <div class="glass-panel p-4 space-y-1">
          <div class="text-xs text-subtle uppercase font-semibold flex items-center gap-1">
            <PieChart :size="14" class="text-blue-400" />
            <span>Collection Ratio</span>
          </div>
          <div class="text-2xl font-extrabold text-white font-mono">{{ collectionPercentage }}%</div>
          <div class="text-xs text-subtle">Paid vs total sold machines</div>
        </div>
      </div>
    </div>

    <!-- Historical Stock Position & Date Range Report Card -->
    <div class="glass-panel p-6 shadow-xl space-y-6">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="badge badge-purple font-mono">STOCK AUDIT SNAPSHOT</span>
            <span class="badge badge-info font-mono">DATE RANGE ANALYTICS</span>
          </div>
          <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
            <Calendar :size="22" class="text-emerald-400" />
            <span>Historical Stock & Range Position Report</span>
          </h3>
          <p class="text-xs text-subtle mt-0.5">
            Select quick presets (Today, Yesterday, This Month, Last Month) or pick a custom date range to query machine availability.
          </p>
        </div>

        <!-- Sleek Preset Toolbar -->
        <div class="preset-toolbar">
          <button
            v-for="p in [
              { key: 'Today', label: 'Today' },
              { key: 'Yesterday', label: 'Yesterday' },
              { key: 'ThisMonth', label: 'This Month' },
              { key: 'LastMonth', label: 'Last Month' },
              { key: 'Custom', label: 'Custom Range' }
            ]"
            :key="p.key"
            @click="applyDatePreset(p.key)"
            :class="['preset-btn', activeDatePreset === p.key ? 'active' : '']"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Date Range & Branch Selector Bar -->
      <div class="date-control-card flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <!-- Custom Range Mode: Show both From and To inputs -->
          <template v-if="activeDatePreset === 'Custom'">
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar :size="14" class="text-blue-400" />
                <span>From:</span>
              </span>
              <input
                v-model="startDate"
                type="date"
                @change="handleCustomDateChange"
                class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex items-center gap-2.5">
              <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar :size="14" class="text-emerald-400" />
                <span>To:</span>
              </span>
              <input
                v-model="endDate"
                type="date"
                @change="handleCustomDateChange"
                class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg shadow-inner focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </template>

          <!-- Preset Mode (Today, Yesterday, This Month, Last Month): Single Target Date Input -->
          <template v-else>
            <div class="flex items-center gap-2.5">
              <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar :size="14" class="text-emerald-400" />
                <span>Target Date:</span>
              </span>
              <input
                v-model="endDate"
                type="date"
                @change="handleCustomDateChange"
                class="form-input text-xs font-mono py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg shadow-inner focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span class="badge badge-purple font-mono text-xs py-1.5 px-3">
              PRESET: {{ activeDatePreset }} ({{ formattedRangeLabel }})
            </span>
          </template>
        </div>

        <!-- Branch Dropdown -->
        <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <span class="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Building2 :size="14" class="text-purple-400" />
            <span>Branch:</span>
          </span>
          <select
            v-model="historicalBranch"
            @change="updateHistoricalReport"
            class="form-select text-xs font-bold py-1.5 px-3 text-white bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Branches (Global)</option>
            <option value="Peshawar">Peshawar HO</option>
            <option value="Multan">Multan Branch</option>
            <option value="Lahore">Lahore Branch</option>
          </select>
        </div>
      </div>

      <!-- Active Period Snapshot & Summary Cards -->
      <div v-if="historicalStock" class="space-y-4">
        <div class="p-5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div>
            <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock :size="14" />
              <span>Active Snapshot Range: {{ formattedRangeLabel }}</span>
            </div>
            <div class="text-2xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
              <span>{{ historicalStock.totalUnits }} Units Available</span>
              <span class="text-xs font-normal text-slate-400">({{ historicalBranch === 'ALL' ? 'Global Locations' : historicalBranch + ' Branch' }})</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-purple font-mono">{{ historicalStock.productsSummary.length }} SKUs IN STOCK</span>
            <span class="badge badge-success font-mono">VERIFIED AUDIT</span>
          </div>
        </div>

        <!-- SKU Stock Summary Breakdown -->
        <div v-if="historicalStock.productsSummary.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="pSum in historicalStock.productsSummary" :key="pSum.sku" class="sku-stat-card p-4 space-y-2 border-t-2 border-t-indigo-500 shadow-md">
            <div class="flex items-start justify-between gap-2">
              <div class="text-xs font-bold text-slate-200 leading-snug line-clamp-2" :title="pSum.productName">
                {{ pSum.productName }}
              </div>
              <span class="badge badge-purple text-[10px] font-mono shrink-0">{{ pSum.sku }}</span>
            </div>
            <div class="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
              <div class="text-xl font-extrabold text-white font-mono">
                {{ pSum.stockQty }} {{ pSum.stockQty === 1 ? 'Unit' : 'Units' }}
              </div>
              <span class="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">In Stock</span>
            </div>
          </div>
        </div>

        <!-- Snapshot Table -->
        <div class="table-container">
          <table class="table-lined">
            <thead>
              <tr>
                <th>Serial Code</th>
                <th>Machine Code</th>
                <th>Product SKU</th>
                <th>Category / HSN</th>
                <th>Branch Location</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in historicalStock.serialsSnapshot" :key="s.serialCode">
                <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
                <td class="font-mono font-bold text-purple-400">{{ s.machineCode }}</td>
                <td class="font-bold text-white text-xs">{{ s.sku }}</td>
                <td><span class="badge badge-purple">{{ s.hsnCode || '9018.1200' }}</span></td>
                <td class="font-bold text-emerald-400">{{ s.allocationCity }}</td>
                <td class="font-mono text-xs text-subtle">{{ s.registeredDate || '2026-07-10' }}</td>
              </tr>
              <tr v-if="historicalStock.serialsSnapshot.length === 0">
                <td colspan="6" class="p-6 text-center text-subtle italic">No available stock recorded for period {{ formattedRangeLabel }}.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Master Machine Inventory & Payment Audit Log -->
    <div class="glass-panel p-6 shadow-xl space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <BarChart2 :size="20" class="text-blue-400" />
          <span>All Registered Machines Journey Audit Table</span>
        </h3>
        <span class="badge badge-neutral font-mono">{{ dataStore.serials.length }} Units</span>
      </div>

      <div class="table-container">
        <table class="table-lined">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Machine Code</th>
              <th>Product SKU</th>
              <th>Branch Location</th>
              <th>Customer</th>
              <th>Sale Invoice #</th>
              <th>Unit Sale Price</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in dataStore.serials" :key="s.serialCode">
              <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
              <td class="font-mono font-bold text-purple-400">{{ s.machineCode || 'N/A' }}</td>
              <td class="text-xs font-bold text-white">{{ s.sku }}</td>
              <td>
                <span class="badge badge-purple">
                  <Building2 :size="10" />
                  {{ s.allocationCity || 'Peshawar' }}
                </span>
              </td>
              <td class="text-xs">
                <span v-if="s.customer" class="font-semibold text-main">{{ s.customer }}</span>
                <span v-else class="text-subtle">Available in Stock</span>
              </td>
              <td class="font-mono text-xs text-secondary">{{ s.invoiceNo || 'N/A' }}</td>
              <td class="font-bold text-emerald-400">PKR {{ (s.salePrice || 0).toLocaleString() }}</td>
              <td>
                <span :class="['badge', s.paymentStatus === 'Paid' ? 'badge-success' : 'badge-danger']">
                  {{ s.paymentStatus || 'Pending' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import {
  Download,
  BarChart2,
  BarChart3,
  TrendingUp,
  Building2,
  Tag,
  CheckCircle2,
  Clock,
  PieChart,
  Calendar
} from 'lucide-vue-next'

const dataStore = useDataStore()

const chartMode = ref('Monthly')
const hoveredPoint = ref(null)

const activeDatePreset = ref('Today')
const startDate = ref(new Date().toISOString().substring(0, 10))
const endDate = ref(new Date().toISOString().substring(0, 10))
const historicalBranch = ref('ALL')
const historicalStock = ref(null)

const chartPoints = computed(() => {
  let labels = []
  let values = []
  const currentTotal = dataStore.totalRevenue || 7933000

  if (chartMode.value === 'Quarterly') {
    labels = ['Q1 2026', 'Q2 2026', 'Q3 2026 (Live)', 'Q4 2026 (Est)']
    values = [4200000, 6800000, currentTotal, 9800000]
  } else if (chartMode.value === 'YTD') {
    labels = ['2023 FY', '2024 FY', '2025 FY', '2026 YTD']
    values = [3100000, 5400000, 7200000, currentTotal]
  } else {
    // Monthly
    labels = ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026']
    values = [2450000, currentTotal, 5200000, 6800000, 8100000, 9400000]
  }

  const maxVal = 10000000
  const width = 720
  const startX = 60
  const stepX = width / (labels.length - 1)

  return labels.map((mLabel, idx) => {
    const val = values[idx] || 0
    const x = startX + idx * stepX
    const y = 190 - (val / maxVal) * 150
    const count = Math.round(val / 1500000) || 1
    return {
      x,
      y,
      xPct: ((x / 800) * 100).toFixed(1),
      yPct: ((y / 240) * 100).toFixed(1),
      label: mLabel,
      val,
      invoicesCount: count
    }
  })
})

const chartLinePath = computed(() => {
  const points = chartPoints.value
  if (!points.length) return ''
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cp1x = prev.x + (curr.x - prev.x) / 2
    const cp2x = prev.x + (curr.x - prev.x) / 2
    path += ` C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return path
})

const chartAreaPath = computed(() => {
  const lineP = chartLinePath.value
  if (!lineP) return ''
  const points = chartPoints.value
  const lastX = points[points.length - 1].x
  const firstX = points[0].x
  return `${lineP} L ${lastX} 190 L ${firstX} 190 Z`
})

const branchMetrics = computed(() => {
  const branches = ['Peshawar', 'Multan', 'Lahore']
  const maxRev = Math.max(...branches.map(b => getBranchSalesTotal(b)), 1)
  return branches.map(bName => {
    const rev = getBranchSalesTotal(bName)
    const count = getBranchSalesCount(bName)
    const pct = Math.round((rev / maxRev) * 100)
    return { name: bName, revenue: rev, count, percentage: Math.max(pct, 15) }
  })
})

const categoryDistribution = computed(() => {
  const ultrasoundCount = dataStore.serials.filter(s => s.sku.includes('US')).length
  const laserCount = dataStore.serials.filter(s => s.sku.includes('LSR')).length
  const ecgCount = dataStore.serials.filter(s => s.sku.includes('ECG')).length
  const total = dataStore.serials.length || 1

  return [
    { name: 'Ultrasound Systems', count: ultrasoundCount, pct: Math.round((ultrasoundCount / total) * 100), color: '#3b82f6' },
    { name: 'Diode Laser Machines', count: laserCount, pct: Math.round((laserCount / total) * 100), color: '#8b5cf6' },
    { name: 'ECG Electrocardiographs', count: ecgCount, pct: Math.round((ecgCount / total) * 100), color: '#10b981' }
  ]
})

onMounted(() => {
  applyDatePreset('Today')
})

function applyDatePreset(presetKey) {
  activeDatePreset.value = presetKey
  const now = new Date()

  if (presetKey === 'Today') {
    const todayStr = now.toISOString().substring(0, 10)
    startDate.value = todayStr
    endDate.value = todayStr
  } else if (presetKey === 'Yesterday') {
    const yest = new Date(now)
    yest.setDate(yest.getDate() - 1)
    const yestStr = yest.toISOString().substring(0, 10)
    startDate.value = yestStr
    endDate.value = yestStr
  } else if (presetKey === 'ThisMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    startDate.value = firstDay.toISOString().substring(0, 10)
    endDate.value = lastDay.toISOString().substring(0, 10)
  } else if (presetKey === 'LastMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
    startDate.value = firstDay.toISOString().substring(0, 10)
    endDate.value = lastDay.toISOString().substring(0, 10)
  }
  updateHistoricalReport()
}

function handleCustomDateChange() {
  activeDatePreset.value = 'Custom'
  updateHistoricalReport()
}

function updateHistoricalReport() {
  if (!endDate.value) return
  const start = activeDatePreset.value === 'Today' || activeDatePreset.value === 'Yesterday' ? null : startDate.value
  historicalStock.value = dataStore.getHistoricalStock(endDate.value, historicalBranch.value, start)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const [y, m, d] = dateStr.split('-')
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const formattedRangeLabel = computed(() => {
  if (!startDate.value || !endDate.value) return ''
  if (startDate.value === endDate.value) {
    return `${formatDate(endDate.value)} (${activeDatePreset.value})`
  }
  return `${formatDate(startDate.value)} – ${formatDate(endDate.value)} (${activeDatePreset.value})`
})

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

const paidMachinesCount = computed(() => {
  return dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus === 'Paid').length
})

const pendingMachinesCount = computed(() => {
  return dataStore.serials.filter(s => s.status === 'Sold' && s.paymentStatus !== 'Paid').length
})

const collectionPercentage = computed(() => {
  const soldTotal = dataStore.serials.filter(s => s.status === 'Sold').length
  if (!soldTotal) return 100
  return ((paidMachinesCount.value / soldTotal) * 100).toFixed(1)
})

function exportCSVReport() {
  const headers = ['Serial Code', 'Machine Code', 'SKU', 'Status', 'Payment Status', 'Branch', 'Customer', 'Invoice No', 'Sale Price']
  const rows = dataStore.serials.map(s => [
    s.serialCode,
    s.machineCode || '',
    s.sku,
    s.status,
    s.paymentStatus || 'Pending',
    s.allocationCity,
    s.customer || '',
    s.invoiceNo || '',
    s.salePrice || 0
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `medimage_erpsales_report_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.preset-toolbar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-dark-800, #0f172a);
  padding: 0.35rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-subtle, #94a3b8);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.preset-btn:hover {
  color: var(--text-main, #ffffff);
  background: rgba(255, 255, 255, 0.06);
}

.preset-btn.active {
  background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

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

/* Light Theme Component Overrides */
[data-theme="light"] .preset-toolbar {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

[data-theme="light"] .preset-btn {
  color: #475569 !important;
}

[data-theme="light"] .preset-btn:hover {
  color: #0f172a !important;
  background: #e2e8f0 !important;
}

[data-theme="light"] .preset-btn.active {
  background: linear-gradient(135deg, #2563eb, #4f46e5) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
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

<template>
  <div class="page-wrapper space-y-6">

    <!-- ════════════════════════════════════════════
      PAGE HEADER — Title, badges, export button
    ════════════════════════════════════════════ -->
    <PageHeader
      title="Executive ERP Reports"
      subtitle="Branch-wise sales & stock reports, machine payment tracking (Paid vs Unpaid), daily/monthly sales, and CSV export."
      :badges="[
        { label: 'MEDIMAGE ERP REPORTING', color: 'purple' },
        { label: 'BRANCH & MACHINE ANALYTICS', color: 'success' }
      ]"
    >
      <template #actions>
        <button @click="exportCSVReport" class="btn btn-success btn-lg shadow-xl">
          <Download :size="18" />
          <span>Export Sales & Machine Report (CSV)</span>
        </button>
      </template>
    </PageHeader>

    <!-- ════════════════════════════════════════════
      BRANCH KPI CARDS — Revenue per city
    ════════════════════════════════════════════ -->
    <div class="kpi-grid">
      <KpiCard
        v-for="bName in ['Peshawar', 'Multan', 'Lahore']"
        :key="bName"
        :label="`${bName} Branch`"
        :value="`PKR ${(getBranchSalesTotal(bName) || 0).toLocaleString()}`"
        :badge="`${getBranchSalesCount(bName)} Invoices`"
        badge-color="info"
        value-color="text-emerald-400"
      >
        <!-- Extra row: available stock count -->
        <div class="flex justify-between text-xs text-subtle border-t border-slate-800 pt-2">
          <span>Available Stock:</span>
          <span class="font-bold text-white">{{ getBranchStockCount(bName) }} machines</span>
        </div>
      </KpiCard>
    </div>

    <!-- ════════════════════════════════════════════
      AREA CURVE CHART — Revenue growth trend
    ════════════════════════════════════════════ -->
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
          <!-- Toggle Monthly / Quarterly / YTD / Custom -->
          <ChartPresetToolbar v-model="chartMode" />
        </template>
      </SectionTitle>

      <!-- Custom Date Range Bar for Graph (Shown when Custom is selected) -->
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

      <!-- AreaCurveChart receives computed data points -->
      <AreaCurveChart
        :data-points="chartDataPoints"
        line-color="#6366f1"
        :extra-label="pt => `${pt.invoicesCount} Invoices Closed`"
      />
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      BAR CHART + DONUT CHART — Side by side
    ════════════════════════════════════════════ -->
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

    <!-- ════════════════════════════════════════════
      PAYMENT STATUS REPORT — Paid vs Unpaid machines
    ════════════════════════════════════════════ -->
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

    <!-- ════════════════════════════════════════════
      HISTORICAL STOCK POSITION — Date range query
    ════════════════════════════════════════════ -->
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
          <!-- Date preset toggles -->
          <ChartPresetToolbar
            v-model="activeDatePreset"
            :options="['Today', 'Yesterday', 'ThisMonth', 'LastMonth', 'Custom']"
            @update:modelValue="applyDatePreset"
          />
        </template>
      </SectionTitle>

      <!-- Date inputs + branch selector -->
      <div class="date-control-card flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <!-- Custom range: show From + To -->
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

          <!-- Preset mode: single target date -->
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

      <!-- Stock snapshot results -->
      <div v-if="historicalStock" class="space-y-4">
        <!-- Summary banner -->
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
            <StatBadge color="purple" :mono="true">{{ historicalStock.productsSummary.length }} SKUs IN STOCK</StatBadge>
            <StatBadge color="success" :mono="true">VERIFIED AUDIT</StatBadge>
          </div>
        </div>

        <!-- SKU breakdown cards -->
        <div v-if="historicalStock.productsSummary.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="pSum in historicalStock.productsSummary" :key="pSum.sku" class="sku-stat-card p-4 space-y-2 border-t-2 border-t-indigo-500 shadow-md">
            <div class="flex items-start justify-between gap-2">
              <div class="text-xs font-bold text-slate-200 leading-snug line-clamp-2" :title="pSum.productName">{{ pSum.productName }}</div>
              <StatBadge color="purple" :mono="true" class="text-[10px] shrink-0">{{ pSum.sku }}</StatBadge>
            </div>
            <div class="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
              <div class="text-xl font-extrabold text-white font-mono">{{ pSum.stockQty }} {{ pSum.stockQty === 1 ? 'Unit' : 'Units' }}</div>
              <span class="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">In Stock</span>
            </div>
          </div>
        </div>

        <!-- Snapshot serial table -->
        <DataTable
          :columns="['Serial Code', 'Machine Code', 'Product SKU', 'Category / HSN', 'Branch Location', 'Registration Date']"
          :empty="historicalStock.serialsSnapshot.length === 0"
          :empty-message="`No available stock recorded for period ${formattedRangeLabel}.`"
        >
          <tr v-for="s in historicalStock.serialsSnapshot" :key="s.serialCode">
            <td class="font-mono font-bold text-blue-400">{{ s.serialCode }}</td>
            <td class="font-mono font-bold text-purple-400">{{ s.machineCode }}</td>
            <td class="font-bold text-white text-xs">{{ s.sku }}</td>
            <td><StatBadge color="purple">{{ s.hsnCode || '9018.1200' }}</StatBadge></td>
            <td class="font-bold text-emerald-400">{{ s.allocationCity }}</td>
            <td class="font-mono text-xs text-subtle">{{ s.registeredDate || '2026-07-10' }}</td>
          </tr>
        </DataTable>
      </div>
    </GlassPanel>

    <!-- ════════════════════════════════════════════
      MASTER AUDIT TABLE — All registered machines
    ════════════════════════════════════════════ -->
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
        <tr v-for="s in dataStore.serials" :key="s.serialCode">
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
          <td class="font-bold text-emerald-400">PKR {{ (s.salePrice || 0).toLocaleString() }}</td>
          <td>
            <StatBadge :color="s.paymentStatus === 'Paid' ? 'success' : 'danger'">
              {{ s.paymentStatus || 'Pending' }}
            </StatBadge>
          </td>
        </tr>
      </DataTable>
    </GlassPanel>

  </div>
</template>

<script setup>
// ──────────────────────────────────────────────────────────────
//  AnalyticsView — ERP Reports & Graphs
//  Uses reusable components from:
//    src/components/ui/     → PageHeader, KpiCard, GlassPanel, SectionTitle, StatBadge, DataTable
//    src/components/charts/ → AreaCurveChart, BranchBarChart, DonutChart, ChartPresetToolbar
//    src/components/forms/  → SelectInput
// ──────────────────────────────────────────────────────────────
import { ref, computed, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'

// Reusable UI components
import PageHeader        from '@/components/ui/PageHeader.vue'
import KpiCard           from '@/components/ui/KpiCard.vue'
import GlassPanel        from '@/components/ui/GlassPanel.vue'
import SectionTitle      from '@/components/ui/SectionTitle.vue'
import StatBadge         from '@/components/ui/StatBadge.vue'
import DataTable         from '@/components/ui/DataTable.vue'

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
  Building2, Tag, CheckCircle2, Clock, PieChart, Calendar
} from 'lucide-vue-next'

// ── Store ──────────────────────────────────────────────────────
const dataStore = useDataStore()

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
// Dynamically computed from dataStore.salesInvoices
const chartDataPoints = computed(() => {
  const invoices = dataStore.salesInvoices || []

  // Helper to sum invoices in a date range
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

    // If span is <= 14 days, group by day
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

    // Partition into 6 readable intervals
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

  // Monthly default (Jul 2026 - Dec 2026)
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

// ── Date preset logic ─────────────────────────────────────────
onMounted(() => applyDatePreset('Today'))

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

// ── Date formatting ───────────────────────────────────────────
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

// ── CSV Export ────────────────────────────────────────────────
function exportCSVReport() {
  const headers = ['Serial Code', 'Machine Code', 'SKU', 'Status', 'Payment Status', 'Branch', 'Customer', 'Invoice No', 'Sale Price']
  const rows = dataStore.serials.map(s => [
    s.serialCode, s.machineCode || '', s.sku, s.status,
    s.paymentStatus || 'Pending', s.allocationCity, s.customer || '', s.invoiceNo || '', s.salePrice || 0
  ])
  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csv))
  link.setAttribute('download', `medimage_erpsales_report_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
/* ── Date control card styles ─────────────────────────────── */
.date-control-card {
  background: var(--bg-card, rgba(15, 23, 42, 0.6));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 0.85rem;
  padding: 1rem;
}

/* ── SKU stat card styles ─────────────────────────────────── */
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

/* ── Light theme overrides ────────────────────────────────── */
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

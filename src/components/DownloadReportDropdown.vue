<template>
  <div class="relative dropdown-wrapper inline-block text-left z-50" ref="dropdownRef">
    <!-- Main Dropdown Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'btn flex items-center justify-center gap-2 font-extrabold shadow-lg transition-all h-11 px-4 text-xs sm:text-sm rounded-xl whitespace-nowrap cursor-pointer',
        btnClass
      ]"
      style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%) !important; color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;"
      :title="'Download and Export ERP Reports'"
    >
      <Download :size="16" class="shrink-0 text-white" />
      <span class="text-white font-bold">{{ computedButtonLabel }}</span>
      <ChevronDown :size="15" :class="['transition-transform duration-200 shrink-0 text-white', { 'rotate-180': isOpen }]" />
    </button>

    <!-- Backdrop to close on outside click -->
    <div v-if="isOpen" class="fixed inset-0 z-[9990]" @click="isOpen = false"></div>

    <!-- Case A: SPECIFIC ACTIVE REPORT (Direct 5 Format Options) -->
    <div
      v-if="isOpen && isSpecificReport"
      class="dropdown-solid-menu absolute right-0 top-full mt-2 w-80 rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
    >
      <!-- Dropdown Header for Specific Report -->
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
            <component :is="getIconComponent(activeReportMeta?.icon)" :size="16" class="text-emerald-500" />
            <span class="truncate">{{ activeReportMeta?.name || 'Report' }}</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Select download export format:</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1 rounded-lg font-bold"
        >
          ✕
        </button>
      </div>

      <!-- 5 Clean Format Options for the Specific Active Report -->
      <div class="space-y-2 pt-1">
        <!-- Excel .xlsx -->
        <button
          type="button"
          @click="handleExport(reportType, 'xlsx')"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-slate-50 hover:bg-emerald-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer shadow-sm group"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <FileSpreadsheet :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Excel Workbook (.xlsx)</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">Native Excel spreadsheet audit</div>
          </div>
        </button>

        <!-- PDF -->
        <button
          type="button"
          @click="handleExport(reportType, 'pdf')"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-slate-50 hover:bg-rose-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 cursor-pointer shadow-sm group"
        >
          <div class="w-8 h-8 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
            <FileText :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">PDF Document (.pdf)</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">High-res print-ready PDF export</div>
          </div>
        </button>

        <!-- Word .docx -->
        <button
          type="button"
          @click="handleExport(reportType, 'word')"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-slate-50 hover:bg-indigo-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer shadow-sm group"
        >
          <div class="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <FileCode :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Word Document (.docx)</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">Microsoft Word document</div>
          </div>
        </button>

        <!-- CSV -->
        <button
          type="button"
          @click="handleExport(reportType, 'csv')"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-slate-50 hover:bg-amber-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer shadow-sm group"
        >
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Download :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">CSV Data File (.csv)</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">Standard spreadsheet data file</div>
          </div>
        </button>

        <!-- Print -->
        <button
          type="button"
          @click="handleExport(reportType, 'print')"
          class="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all bg-slate-50 hover:bg-blue-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer shadow-sm group"
        >
          <div class="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Printer :size="16" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Print Form</div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400">Paper hard copy print layout</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Case B: GLOBAL OVERVIEW (Shows All Module Reports) -->
    <div
      v-else-if="isOpen"
      class="dropdown-solid-menu absolute right-0 top-full mt-2 w-[340px] sm:w-[480px] rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
    >
      <!-- Dropdown Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
            <FileSpreadsheet :size="16" class="text-emerald-500" />
            <span>ERP Reporting & Export Hub</span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Select any module report and choose your export format</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1 rounded-lg font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter report type (e.g. sales, cash, stock, credit)..."
          class="w-full rounded-xl pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <!-- Reports List -->
      <div class="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div
          v-for="rep in filteredReports"
          :key="rep.id"
          class="p-3 rounded-xl space-y-2.5 transition-all bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                :class="getIconColorClass(rep.color)"
              >
                <component :is="getIconComponent(rep.icon)" :size="15" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ rep.name }}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ rep.description }}</div>
              </div>
            </div>

            <button
              type="button"
              @click="goToReport(rep.id)"
              class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 whitespace-nowrap pt-1"
            >
              View Live ↗
            </button>
          </div>

          <!-- Format Export Pills -->
          <div class="flex items-center gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700 flex-wrap">
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Export:</span>

            <button
              type="button"
              @click="handleExport(rep.id, 'xlsx')"
              class="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Download Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet :size="11" />
              <span>XLSX</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'pdf')"
              class="px-2 py-0.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Export Formatted PDF Document"
            >
              <FileText :size="11" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'word')"
              class="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Download Word Document (.docx)"
            >
              <FileCode :size="11" />
              <span>Word</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'csv')"
              class="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Download CSV Data File"
            >
              <Download :size="11" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'print')"
              class="px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Print Direct Formatted Layout"
            >
              <Printer :size="11" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Download, FileSpreadsheet, FileText, FileCode, Printer,
  ChevronDown, Search, Receipt, DollarSign, Package, ShieldAlert,
  Users, BarChart3, TrendingUp, Layers, HelpCircle
} from 'lucide-vue-next'

import { ERP_REPORT_TYPES, exportUnifiedReport, getERPReportDefinition } from '@/utils/reportExporter'

const props = defineProps({
  reportType: {
    type: String,
    default: 'overview'
  },
  currentBranch: {
    type: String,
    default: 'ALL'
  },
  dateFrom: {
    type: String,
    default: ''
  },
  dateTo: {
    type: String,
    default: ''
  },
  product: {
    type: String,
    default: 'ALL'
  },
  btnClass: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref(null)

const isSpecificReport = computed(() => {
  return props.reportType && props.reportType !== 'overview' && ERP_REPORT_TYPES[props.reportType]
})

const activeReportMeta = computed(() => {
  if (isSpecificReport.value) {
    return ERP_REPORT_TYPES[props.reportType]
  }
  return null
})

const computedButtonLabel = computed(() => {
  if (isSpecificReport.value && activeReportMeta.value) {
    return `Download ${activeReportMeta.value.name}`
  }
  return 'Export ERP Reports'
})

const availableReports = computed(() => {
  return Object.values(ERP_REPORT_TYPES)
})

const filteredReports = computed(() => {
  if (!searchQuery.value) return availableReports.value
  const q = searchQuery.value.toLowerCase().trim()
  return availableReports.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.id.toLowerCase().includes(q)
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function getIconComponent(iconName) {
  switch (iconName) {
    case 'Receipt': return Receipt
    case 'DollarSign': return DollarSign
    case 'Package': return Package
    case 'ShieldAlert': return ShieldAlert
    case 'Users': return Users
    case 'FileText': return FileText
    case 'TrendingUp': return TrendingUp
    case 'Layers': return Layers
    case 'BarChart3': return BarChart3
    case 'FileSpreadsheet': return FileSpreadsheet
    default: return FileSpreadsheet
  }
}

function getIconColorClass(color) {
  switch (color) {
    case 'blue': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
    case 'emerald': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
    case 'purple': return 'bg-purple-500/20 text-purple-500 border-purple-500/30'
    case 'amber': return 'bg-amber-500/20 text-amber-500 border-amber-500/30'
    case 'rose': return 'bg-rose-500/20 text-rose-500 border-rose-500/30'
    case 'cyan': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30'
    case 'indigo': return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30'
    default: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
  }
}

async function handleExport(reportId, format) {
  await exportUnifiedReport(reportId, format, {
    branch: props.currentBranch,
    product: props.product,
    dateFrom: props.dateFrom,
    dateTo: props.dateTo
  })
  isOpen.value = false
}

function goToReport(reportId) {
  isOpen.value = false
  router.push(`/analytics?report=${reportId}`)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.05);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.35);
  border-radius: 8px;
}
</style>

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
      class="dropdown-solid-menu absolute right-0 top-full mt-2 w-80 rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn"
    >
      <!-- Dropdown Header for Specific Report -->
      <div class="flex items-center justify-between pb-2.5 border-b dropdown-header-border">
        <div>
          <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2 dropdown-heading">
            <component :is="getIconComponent(activeReportMeta?.icon)" :size="16" class="text-emerald-500" />
            <span class="truncate">{{ activeReportMeta?.name || 'Report' }}</span>
          </div>
          <p class="text-[11px] dropdown-subheading mt-0.5">Select download export format:</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="dropdown-close-btn text-xs p-1 rounded-lg font-bold"
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
          class="dropdown-row-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <FileSpreadsheet :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold dropdown-item-title">Excel Workbook (.xlsx)</div>
            <div class="text-[10px] dropdown-item-sub">Native Excel spreadsheet audit</div>
          </div>
        </button>

        <!-- PDF -->
        <button
          type="button"
          @click="handleExport(reportType, 'pdf')"
          class="dropdown-row-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30">
            <FileText :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold dropdown-item-title">PDF Document (.pdf)</div>
            <div class="text-[10px] dropdown-item-sub">High-res print-ready PDF export</div>
          </div>
        </button>

        <!-- Word .docx -->
        <button
          type="button"
          @click="handleExport(reportType, 'word')"
          class="dropdown-row-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <FileCode :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold dropdown-item-title">Word Document (.docx)</div>
            <div class="text-[10px] dropdown-item-sub">Microsoft Word document</div>
          </div>
        </button>

        <!-- CSV -->
        <button
          type="button"
          @click="handleExport(reportType, 'csv')"
          class="dropdown-row-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Download :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold dropdown-item-title">CSV Data File (.csv)</div>
            <div class="text-[10px] dropdown-item-sub">Standard spreadsheet data file</div>
          </div>
        </button>

        <!-- Print -->
        <button
          type="button"
          @click="handleExport(reportType, 'print')"
          class="dropdown-row-btn w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
        >
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/30">
            <Printer :size="16" />
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold dropdown-item-title">Print Form</div>
            <div class="text-[10px] dropdown-item-sub">Paper hard copy print layout</div>
          </div>
        </button>
      </div>
    </div>

    <!-- Case B: GLOBAL OVERVIEW (Shows All 8 Module Reports) -->
    <div
      v-else-if="isOpen"
      class="dropdown-solid-menu absolute right-0 top-full mt-2 w-[340px] sm:w-[480px] rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn"
    >
      <!-- Dropdown Header -->
      <div class="flex items-center justify-between pb-3 border-b dropdown-header-border">
        <div>
          <div class="text-xs font-black uppercase tracking-wider flex items-center gap-2 dropdown-heading">
            <FileSpreadsheet :size="16" class="text-emerald-500" />
            <span>ERP Reporting & Export Hub</span>
          </div>
          <p class="text-[11px] dropdown-subheading mt-0.5">Select any module report and choose your export format</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="dropdown-close-btn text-xs p-1 rounded-lg font-bold"
        >
          ✕
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 dropdown-subheading" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter report type (e.g. sales, cash, stock, credit)..."
          class="dropdown-search-input w-full rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none"
        />
      </div>

      <!-- Reports List -->
      <div class="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div
          v-for="rep in filteredReports"
          :key="rep.id"
          class="dropdown-report-card p-3 rounded-xl space-y-2.5 transition-all"
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
                <div class="font-bold text-xs dropdown-item-title truncate">{{ rep.name }}</div>
                <div class="text-[10px] dropdown-item-sub truncate">{{ rep.description }}</div>
              </div>
            </div>

            <button
              type="button"
              @click="goToReport(rep.id)"
              class="text-[10px] font-bold text-emerald-500 hover:underline shrink-0 whitespace-nowrap pt-1"
            >
              View Live ↗
            </button>
          </div>

          <!-- Format Export Pills -->
          <div class="flex items-center gap-1.5 pt-1.5 border-t dropdown-header-border flex-wrap">
            <span class="text-[10px] font-semibold dropdown-subheading mr-1">Export:</span>

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
import { useDataStore } from '@/stores/dataStore'
import { ERP_REPORT_TYPES, exportUnifiedReport } from '@/utils/reportExporter'
import {
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  Search,
  ShoppingCart,
  Receipt,
  DollarSign,
  Package,
  ShieldAlert,
  Truck,
  QrCode,
  TrendingUp
} from 'lucide-vue-next'

const props = defineProps({
  label: { type: String, default: '' },
  btnClass: { type: String, default: '' },
  currentBranch: { type: String, default: 'ALL' },
  reportType: { type: String, default: 'all' }
})

const router = useRouter()
const dataStore = useDataStore()

const isOpen = ref(false)
const searchQuery = ref('')

const isSpecificReport = computed(() => {
  return props.reportType && props.reportType !== 'all' && props.reportType !== 'overview'
})

const activeReportMeta = computed(() => {
  return ERP_REPORT_TYPES.find(r => r.id === props.reportType)
})

const computedButtonLabel = computed(() => {
  if (props.label) return props.label
  if (isSpecificReport.value && activeReportMeta.value) {
    return `Download ${activeReportMeta.value.name}`
  }
  return 'Download ERP Report'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

const filteredReports = computed(() => {
  if (!searchQuery.value.trim()) return ERP_REPORT_TYPES
  const q = searchQuery.value.toLowerCase().trim()
  return ERP_REPORT_TYPES.filter(r => 
    r.name.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.id.toLowerCase().includes(q)
  )
})

function getIconComponent(name) {
  const map = {
    ShoppingCart,
    Receipt,
    DollarSign,
    Package,
    ShieldAlert,
    Truck,
    QrCode,
    TrendingUp
  }
  return map[name] || FileSpreadsheet
}

function getIconColorClass(color) {
  const map = {
    blue: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    amber: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    indigo: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400',
    purple: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    teal: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
    rose: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
  }
  return map[color] || 'bg-slate-800 text-slate-300'
}

function handleExport(reportId, format) {
  exportUnifiedReport(reportId, format, dataStore, { branch: props.currentBranch })
  isOpen.value = false
}

function goToReport(reportId) {
  isOpen.value = false
  router.push(`/analytics?report=${reportId}`)
}
</script>

<style scoped>
/* ── Solid 100% Opaque Dropdown Panel (Dark Theme Default) ─── */
.dropdown-solid-menu {
  background-color: #0f172a !important;
  background: #0f172a !important;
  border: 1px solid #334155 !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
  opacity: 1 !important;
}

.dropdown-header-border {
  border-color: #334155 !important;
}

.dropdown-heading {
  color: #ffffff !important;
}

.dropdown-subheading {
  color: #94a3b8 !important;
}

.dropdown-close-btn {
  color: #94a3b8 !important;
}
.dropdown-close-btn:hover {
  color: #ffffff !important;
  background-color: #1e293b !important;
}

.dropdown-row-btn {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
  cursor: pointer;
}
.dropdown-row-btn:hover {
  background-color: #334155 !important;
  border-color: #10b981 !important;
}

.dropdown-item-title {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.dropdown-item-sub {
  color: #94a3b8 !important;
}

.dropdown-search-input {
  background-color: #020617 !important;
  border: 1px solid #334155 !important;
  color: #ffffff !important;
}
.dropdown-search-input:focus {
  border-color: #10b981 !important;
}

.dropdown-report-card {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
}

/* ── Light Mode Explicit 100% Solid Pure White Dropdown ─────── */
[data-theme="light"] .dropdown-solid-menu {
  background-color: #ffffff !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 25px 60px -5px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
  opacity: 1 !important;
}

[data-theme="light"] .dropdown-header-border {
  border-color: #e2e8f0 !important;
}

[data-theme="light"] .dropdown-heading {
  color: #0f172a !important;
}

[data-theme="light"] .dropdown-subheading {
  color: #64748b !important;
}

[data-theme="light"] .dropdown-close-btn {
  color: #64748b !important;
}
[data-theme="light"] .dropdown-close-btn:hover {
  color: #0f172a !important;
  background-color: #f1f5f9 !important;
}

[data-theme="light"] .dropdown-row-btn {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}
[data-theme="light"] .dropdown-row-btn:hover {
  background-color: #f1f5f9 !important;
  border-color: #10b981 !important;
}

[data-theme="light"] .dropdown-item-title {
  color: #0f172a !important;
}

[data-theme="light"] .dropdown-item-sub {
  color: #64748b !important;
}

[data-theme="light"] .dropdown-search-input {
  background-color: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}

[data-theme="light"] .dropdown-report-card {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.1);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 8px;
}
</style>

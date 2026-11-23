<template>
  <div class="relative dropdown-wrapper inline-block text-left z-50" ref="dropdownRef">
    <!-- Main Dropdown Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'download-trigger-btn flex items-center justify-center gap-2 font-extrabold shadow-lg transition-all h-11 px-4 text-xs sm:text-sm rounded-xl whitespace-nowrap cursor-pointer',
        btnClass
      ]"
      :title="'Download and Export ERP Reports'"
    >
      <Download :size="16" class="shrink-0 trigger-icon" />
      <span class="trigger-label">{{ computedButtonLabel }}</span>
      <ChevronDown :size="15" :class="['transition-transform duration-200 shrink-0 trigger-chevron', { 'rotate-180': isOpen }]" />
    </button>

    <!-- Backdrop to close on outside click -->
    <div v-if="isOpen" class="fixed inset-0 z-[9990]" @click="isOpen = false"></div>

    <!-- Case A: SPECIFIC ACTIVE REPORT (Direct 5 Format Options) -->
    <div
      v-if="isOpen && isSpecificReport"
      class="dropdown-solid-menu specific-report-menu absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn"
    >
      <!-- Dropdown Header for Specific Report -->
      <div class="flex items-center justify-between pb-2.5 border-b dropdown-header-line">
        <div class="min-w-0 pr-2">
          <div class="dropdown-heading text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <component :is="getIconComponent(activeReportMeta?.icon)" :size="16" class="text-emerald-500 shrink-0" />
            <span class="truncate">{{ activeReportMeta?.name || 'Report' }}</span>
          </div>
          <p class="dropdown-subheading text-[11px] mt-0.5">Select download export format:</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="dropdown-close-btn text-xs p-1.5 rounded-lg font-bold"
          title="Close menu"
        >
          ✕
        </button>
      </div>

      <!-- 5 Clean Format Options for the Specific Active Report -->
      <div class="space-y-2 pt-1">
        <!-- Excel .xlsx -->
        <button
          type="button"
          @click="handleExport(resolvedReportId, 'xlsx')"
          class="dropdown-row-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
        >
          <div class="format-badge-icon icon-excel w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <FileSpreadsheet :size="17" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="dropdown-item-title text-xs font-bold">Excel Workbook (.xlsx)</div>
            <div class="dropdown-item-sub text-[10px]">Native Excel spreadsheet audit</div>
          </div>
          <span class="pill-badge pill-excel text-[10px] font-mono font-black px-2 py-0.5 rounded-md">XLSX</span>
        </button>

        <!-- PDF -->
        <button
          type="button"
          @click="handleExport(resolvedReportId, 'pdf')"
          class="dropdown-row-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
        >
          <div class="format-badge-icon icon-pdf w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <FileText :size="17" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="dropdown-item-title text-xs font-bold">PDF Document (.pdf)</div>
            <div class="dropdown-item-sub text-[10px]">High-res print-ready PDF export</div>
          </div>
          <span class="pill-badge pill-pdf text-[10px] font-mono font-black px-2 py-0.5 rounded-md">PDF</span>
        </button>

        <!-- Word .docx -->
        <button
          type="button"
          @click="handleExport(resolvedReportId, 'word')"
          class="dropdown-row-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
        >
          <div class="format-badge-icon icon-word w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <FileCode :size="17" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="dropdown-item-title text-xs font-bold">Word Document (.docx)</div>
            <div class="dropdown-item-sub text-[10px]">Microsoft Word formatted report</div>
          </div>
          <span class="pill-badge pill-word text-[10px] font-mono font-black px-2 py-0.5 rounded-md">DOCX</span>
        </button>

        <!-- CSV -->
        <button
          type="button"
          @click="handleExport(resolvedReportId, 'csv')"
          class="dropdown-row-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
        >
          <div class="format-badge-icon icon-csv w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <Download :size="17" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="dropdown-item-title text-xs font-bold">CSV Data File (.csv)</div>
            <div class="dropdown-item-sub text-[10px]">Standard tabular spreadsheet dataset</div>
          </div>
          <span class="pill-badge pill-csv text-[10px] font-mono font-black px-2 py-0.5 rounded-md">CSV</span>
        </button>

        <!-- Print -->
        <button
          type="button"
          @click="handleExport(resolvedReportId, 'print')"
          class="dropdown-row-card w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group"
        >
          <div class="format-badge-icon icon-print w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <Printer :size="17" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="dropdown-item-title text-xs font-bold">Print Form</div>
            <div class="dropdown-item-sub text-[10px]">Paper hard copy print layout</div>
          </div>
          <span class="pill-badge pill-print text-[10px] font-mono font-black px-2 py-0.5 rounded-md">PRINT</span>
        </button>
      </div>
    </div>

    <!-- Case B: GLOBAL OVERVIEW (Shows All Module Reports with Live Search) -->
    <div
      v-else-if="isOpen"
      class="dropdown-solid-menu global-hub-menu absolute right-0 top-full mt-2 w-[340px] sm:w-[500px] rounded-2xl p-4 space-y-3 z-[9999] animate-fadeIn"
    >
      <!-- Dropdown Header -->
      <div class="flex items-center justify-between pb-3 border-b dropdown-header-line">
        <div>
          <div class="dropdown-heading text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet :size="16" class="text-emerald-500 shrink-0" />
            <span>ERP Reporting & Export Hub</span>
          </div>
          <p class="dropdown-subheading text-[11px] mt-0.5">Select any module report and choose your export format</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="dropdown-close-btn text-xs p-1.5 rounded-lg font-bold"
          title="Close menu"
        >
          ✕
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 dropdown-search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter report type (e.g. sales, cash, stock, credit)..."
          class="dropdown-search-input w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
        />
      </div>

      <!-- Reports List -->
      <div class="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
        <div
          v-for="rep in filteredReports"
          :key="rep.id"
          class="dropdown-hub-card p-3 rounded-xl space-y-2.5 transition-all"
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
                <div class="dropdown-item-title font-bold text-xs truncate">{{ rep.name }}</div>
                <div class="dropdown-item-sub text-[10px] truncate">{{ rep.description }}</div>
              </div>
            </div>

            <button
              type="button"
              @click="goToReport(rep.id)"
              class="dropdown-view-live-btn text-[11px] font-bold shrink-0 whitespace-nowrap pt-0.5"
            >
              View Live ↗
            </button>
          </div>

          <!-- Format Export Pills -->
          <div class="flex items-center gap-1.5 pt-2 border-t dropdown-card-divider flex-wrap">
            <span class="dropdown-export-label text-[10px] font-bold mr-1">Export:</span>

            <button
              type="button"
              @click="handleExport(rep.id, 'xlsx')"
              class="pill-badge pill-excel text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-sm"
              title="Download Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet :size="11" />
              <span>XLSX</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'pdf')"
              class="pill-badge pill-pdf text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-sm"
              title="Export Formatted PDF Document"
            >
              <FileText :size="11" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'word')"
              class="pill-badge pill-word text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-sm"
              title="Download Word Document (.docx)"
            >
              <FileCode :size="11" />
              <span>Word</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'csv')"
              class="pill-badge pill-csv text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-sm"
              title="Download CSV Data File"
            >
              <Download :size="11" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              @click="handleExport(rep.id, 'print')"
              class="pill-badge pill-print text-[10px] font-mono font-bold flex items-center gap-1 px-2.5 py-1 rounded-md transition-all active:scale-95 shadow-sm"
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
  Users, BarChart3, TrendingUp, Layers, HelpCircle, ShoppingCart, Truck, Calendar, Banknote, Tag, QrCode
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

// Normalize report identifier (e.g., singular 'sale' -> 'sales')
const resolvedReportId = computed(() => {
  if (!props.reportType) return 'overview'
  if (props.reportType === 'sale') return 'sales'
  return props.reportType
})

// Lookup active report metadata from ERP_REPORT_TYPES array
const activeReportMeta = computed(() => {
  if (!resolvedReportId.value || resolvedReportId.value === 'overview') return null
  const target = resolvedReportId.value
  const found = ERP_REPORT_TYPES.find(r => r.id === target || r.id === props.reportType)
  if (found) return found

  try {
    const def = getERPReportDefinition(target, null, {})
    if (def && def.title) {
      return { id: target, name: def.title, icon: 'FileSpreadsheet' }
    }
  } catch (e) {}

  return {
    id: target,
    name: target.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: 'FileSpreadsheet'
  }
})

// Whether the dropdown is anchored to a specific active report vs global overview
const isSpecificReport = computed(() => {
  return Boolean(resolvedReportId.value && resolvedReportId.value !== 'overview' && activeReportMeta.value)
})

// Button label reflects the active report name
const computedButtonLabel = computed(() => {
  if (isSpecificReport.value && activeReportMeta.value) {
    return `Download ${activeReportMeta.value.name}`
  }
  return 'Export ERP Reports'
})

const availableReports = computed(() => {
  return Array.isArray(ERP_REPORT_TYPES) ? ERP_REPORT_TYPES : Object.values(ERP_REPORT_TYPES)
})

const filteredReports = computed(() => {
  if (!searchQuery.value) return availableReports.value
  const q = searchQuery.value.toLowerCase().trim()
  return availableReports.value.filter(r =>
    (r.name && r.name.toLowerCase().includes(q)) ||
    (r.description && r.description.toLowerCase().includes(q)) ||
    (r.category && r.category.toLowerCase().includes(q)) ||
    (r.id && r.id.toLowerCase().includes(q))
  )
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function getIconComponent(iconName) {
  switch (iconName) {
    case 'ShoppingCart': return ShoppingCart
    case 'Truck': return Truck
    case 'Calendar': return Calendar
    case 'Receipt': return Receipt
    case 'DollarSign': return DollarSign
    case 'Package': return Package
    case 'ShieldAlert': return ShieldAlert
    case 'Users': return Users
    case 'FileText': return FileText
    case 'TrendingUp': return TrendingUp
    case 'Layers': return Layers
    case 'BarChart3':
    case 'BarChart2': return BarChart3
    case 'Banknote': return Banknote
    case 'Tag': return Tag
    case 'QrCode': return QrCode
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
    case 'teal': return 'bg-teal-500/20 text-teal-500 border-teal-500/30'
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
/* ── Main Trigger Button Styling ───────────────────────────── */
.download-trigger-btn {
  background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.28) !important;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35) !important;
}
.download-trigger-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45) !important;
}
.download-trigger-btn .trigger-icon,
.download-trigger-btn .trigger-label,
.download-trigger-btn .trigger-chevron {
  color: #ffffff !important;
}

/* ── Base Solid Dropdown Container (Dark Mode Default) ─────── */
.dropdown-solid-menu {
  background: #0f172a !important;
  background-color: #0f172a !important;
  border: 1px solid #334155 !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
  color: #f8fafc !important;
  border-radius: 16px !important;
}

.dropdown-header-line {
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
  background: transparent !important;
  border: none !important;
  cursor: pointer;
}
.dropdown-close-btn:hover {
  color: #ffffff !important;
  background-color: #1e293b !important;
}

/* ── Search Input (Hub) ────────────────────────────────────── */
.dropdown-search-icon {
  color: #94a3b8 !important;
}
.dropdown-search-input {
  background-color: #020617 !important;
  border: 1px solid #334155 !important;
  color: #ffffff !important;
}
.dropdown-search-input::placeholder {
  color: #64748b !important;
}
.dropdown-search-input:focus {
  border-color: #10b981 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
}

/* ── Interactive Row Cards (Case A Specific) ───────────────── */
.dropdown-row-card {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
  cursor: pointer !important;
}
.dropdown-row-card:hover {
  background-color: #273549 !important;
  border-color: #10b981 !important;
  transform: translateY(-1px);
}
.dropdown-item-title {
  color: #ffffff !important;
}
.dropdown-item-sub {
  color: #94a3b8 !important;
}

/* ── Interactive Hub Cards (Case B Overview) ───────────────── */
.dropdown-hub-card {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
}
.dropdown-card-divider {
  border-color: #334155 !important;
}
.dropdown-export-label {
  color: #94a3b8 !important;
}
.dropdown-view-live-btn {
  color: #34d399 !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
}
.dropdown-view-live-btn:hover {
  text-decoration: underline;
  color: #10b981 !important;
}

/* ── Format Badges & Colored Pills (Always Solid & Vivid) ──── */
.format-badge-icon.icon-excel {
  background: rgba(16, 185, 129, 0.16) !important;
  color: #10b981 !important;
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
}
.format-badge-icon.icon-pdf {
  background: rgba(239, 68, 68, 0.16) !important;
  color: #ef4444 !important;
  border: 1px solid rgba(239, 68, 68, 0.3) !important;
}
.format-badge-icon.icon-word {
  background: rgba(99, 102, 241, 0.16) !important;
  color: #818cf8 !important;
  border: 1px solid rgba(99, 102, 241, 0.3) !important;
}
.format-badge-icon.icon-csv {
  background: rgba(245, 158, 11, 0.16) !important;
  color: #fbbf24 !important;
  border: 1px solid rgba(245, 158, 11, 0.3) !important;
}
.format-badge-icon.icon-print {
  background: rgba(59, 130, 246, 0.16) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

.pill-badge {
  color: #ffffff !important;
  border: none !important;
  cursor: pointer !important;
}
.pill-badge * {
  color: #ffffff !important;
}
.pill-excel {
  background: #059669 !important;
  background-color: #059669 !important;
}
.pill-excel:hover {
  background: #10b981 !important;
}
.pill-pdf {
  background: #dc2626 !important;
  background-color: #dc2626 !important;
}
.pill-pdf:hover {
  background: #ef4444 !important;
}
.pill-word {
  background: #4f46e5 !important;
  background-color: #4f46e5 !important;
}
.pill-word:hover {
  background: #6366f1 !important;
}
.pill-csv {
  background: #d97706 !important;
  background-color: #d97706 !important;
}
.pill-csv:hover {
  background: #f59e0b !important;
}
.pill-print {
  background: #2563eb !important;
  background-color: #2563eb !important;
}
.pill-print:hover {
  background: #3b82f6 !important;
}

/* ══════════════════════════════════════════════════════════════
   LIGHT MODE PERFECTION — Vyapar ERP Enterprise Theme
   ══════════════════════════════════════════════════════════════ */
[data-theme="light"] .dropdown-solid-menu {
  background: #ffffff !important;
  background-color: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
  color: #0f172a !important;
}

[data-theme="light"] .dropdown-header-line {
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

[data-theme="light"] .dropdown-search-icon {
  color: #64748b !important;
}
[data-theme="light"] .dropdown-search-input {
  background-color: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #0f172a !important;
}
[data-theme="light"] .dropdown-search-input::placeholder {
  color: #94a3b8 !important;
}
[data-theme="light"] .dropdown-search-input:focus {
  border-color: #10b981 !important;
  background-color: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
}

[data-theme="light"] .dropdown-row-card {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}
[data-theme="light"] .dropdown-row-card:hover {
  background-color: #f0fdf4 !important;
  border-color: #10b981 !important;
}
[data-theme="light"] .dropdown-item-title {
  color: #0f172a !important;
}
[data-theme="light"] .dropdown-item-sub {
  color: #64748b !important;
}

[data-theme="light"] .dropdown-hub-card {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}
[data-theme="light"] .dropdown-card-divider {
  border-color: #e2e8f0 !important;
}
[data-theme="light"] .dropdown-export-label {
  color: #64748b !important;
}
[data-theme="light"] .dropdown-view-live-btn {
  color: #059669 !important;
}
[data-theme="light"] .dropdown-view-live-btn:hover {
  color: #047857 !important;
}

[data-theme="light"] .format-badge-icon.icon-excel {
  background: rgba(16, 185, 129, 0.14) !important;
  color: #059669 !important;
  border-color: rgba(16, 185, 129, 0.28) !important;
}
[data-theme="light"] .format-badge-icon.icon-pdf {
  background: rgba(239, 68, 68, 0.14) !important;
  color: #dc2626 !important;
  border-color: rgba(239, 68, 68, 0.28) !important;
}
[data-theme="light"] .format-badge-icon.icon-word {
  background: rgba(99, 102, 241, 0.14) !important;
  color: #4f46e5 !important;
  border-color: rgba(99, 102, 241, 0.28) !important;
}
[data-theme="light"] .format-badge-icon.icon-csv {
  background: rgba(245, 158, 11, 0.14) !important;
  color: #d97706 !important;
  border-color: rgba(245, 158, 11, 0.28) !important;
}
[data-theme="light"] .format-badge-icon.icon-print {
  background: rgba(59, 130, 246, 0.14) !important;
  color: #2563eb !important;
  border-color: rgba(59, 130, 246, 0.28) !important;
}

/* Scrollbar */
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

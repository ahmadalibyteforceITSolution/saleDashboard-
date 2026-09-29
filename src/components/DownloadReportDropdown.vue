<template>
  <div class="relative dropdown-wrapper inline-block text-left" ref="dropdownRef">
    <!-- Main Dropdown Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'btn flex items-center justify-center gap-2 font-extrabold shadow-lg transition-all h-11 px-4 text-xs sm:text-sm rounded-xl whitespace-nowrap cursor-pointer',
        btnClass || 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
      ]"
      :title="'Download and Export ERP Reports'"
    >
      <Download :size="16" class="shrink-0" />
      <span>{{ label || 'Download ERP Report' }}</span>
      <ChevronDown :size="15" :class="['transition-transform duration-200 shrink-0', { 'rotate-180': isOpen }]" />
    </button>

    <!-- Backdrop on mobile/desktop to close on click outside -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>

    <!-- Dropdown Content Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-[340px] sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-fadeIn text-slate-200"
    >
      <!-- Dropdown Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet :size="16" class="text-emerald-400" />
            <span>ERP Reporting & Export Hub</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5">Select any module report and choose your export format</p>
        </div>
        <button
          type="button"
          @click="isOpen = false"
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Quick Search / Filter for Reports -->
      <div class="relative">
        <Search :size="13" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter report type (e.g. sales, cash, stock, credit)..."
          class="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <!-- Reports List with Quick Format Triggers -->
      <div class="max-h-[360px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <div
          v-for="rep in filteredReports"
          :key="rep.id"
          class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
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
                <div class="font-bold text-xs text-white truncate">{{ rep.name }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ rep.description }}</div>
              </div>
            </div>

            <!-- View In App Link -->
            <button
              type="button"
              @click="goToReport(rep.id)"
              class="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0 whitespace-nowrap pt-1"
            >
              View Live ↗
            </button>
          </div>

          <!-- Format Export Pills Toolbar -->
          <div class="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/60 flex-wrap">
            <span class="text-[10px] font-semibold text-slate-400 mr-1">Export:</span>

            <!-- Excel .xlsx -->
            <button
              type="button"
              @click="handleExport(rep.id, 'xlsx')"
              class="px-2 py-0.5 rounded-md bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Download Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet :size="11" />
              <span>XLSX</span>
            </button>

            <!-- PDF Document -->
            <button
              type="button"
              @click="handleExport(rep.id, 'pdf')"
              class="px-2 py-0.5 rounded-md bg-red-950/70 hover:bg-red-900/90 border border-red-500/40 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Export Formatted PDF Document"
            >
              <FileText :size="11" />
              <span>PDF</span>
            </button>

            <!-- Word .docx -->
            <button
              type="button"
              @click="handleExport(rep.id, 'word')"
              class="px-2 py-0.5 rounded-md bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Download Word Document (.docx)"
            >
              <FileCode :size="11" />
              <span>Word</span>
            </button>

            <!-- CSV Data -->
            <button
              type="button"
              @click="handleExport(rep.id, 'csv')"
              class="px-2 py-0.5 rounded-md bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Download CSV Data File"
            >
              <Download :size="11" />
              <span>CSV</span>
            </button>

            <!-- Print Direct -->
            <button
              type="button"
              @click="handleExport(rep.id, 'print')"
              class="px-2 py-0.5 rounded-md bg-blue-950/70 hover:bg-blue-900/90 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95"
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
  label: { type: String, default: 'Download ERP Report' },
  btnClass: { type: String, default: '' },
  currentBranch: { type: String, default: 'ALL' }
})

const router = useRouter()
const dataStore = useDataStore()

const isOpen = ref(false)
const searchQuery = ref('')

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
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}
</style>

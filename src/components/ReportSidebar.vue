<template>
  <aside class="report-sidebar-panel">
    <!-- Top Search Header -->
    <div class="search-header">
      <div class="search-box">
        <Search :size="15" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Transactions"
          class="search-input"
          autocomplete="off"
          spellcheck="false"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="clear-btn"
          title="Clear search"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Scrollable Report Groups -->
    <div class="report-list-container custom-scrollbar">
      <!-- 1. Transaction Report Group -->
      <div v-if="filteredTransactionReports.length > 0" class="report-group">
        <div class="group-title">Transaction report</div>
        <div class="group-items">
          <button
            v-for="rep in filteredTransactionReports"
            :key="rep.id"
            type="button"
            @click="selectReport(rep.id)"
            :class="['report-nav-item', modelValue === rep.id ? 'active' : '']"
          >
            <span class="report-item-name">{{ rep.name }}</span>
            <span v-if="getBadgeCount(rep.id) !== null" class="report-item-badge">
              {{ getBadgeCount(rep.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- 2. Party Report Group -->
      <div v-if="filteredPartyReports.length > 0" class="report-group">
        <div class="group-title">Party report</div>
        <div class="group-items">
          <button
            v-for="rep in filteredPartyReports"
            :key="rep.id"
            type="button"
            @click="selectReport(rep.id)"
            :class="['report-nav-item', modelValue === rep.id ? 'active' : '']"
          >
            <span class="report-item-name">{{ rep.name }}</span>
            <span v-if="getBadgeCount(rep.id) !== null" class="report-item-badge">
              {{ getBadgeCount(rep.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- 3. Item / Stock Report Group -->
      <div v-if="filteredStockReports.length > 0" class="report-group">
        <div class="group-title">Item / Stock report</div>
        <div class="group-items">
          <!-- Overview & Analytics Charts -->
          <button
            v-if="matchesSearch('Overview & Charts')"
            type="button"
            @click="selectReport('overview')"
            :class="['report-nav-item', modelValue === 'overview' ? 'active' : '']"
          >
            <span class="report-item-name">Overview & Charts</span>
            <span class="report-item-badge highlight">KPIs</span>
          </button>

          <button
            v-for="rep in filteredStockReports"
            :key="rep.id"
            type="button"
            @click="selectReport(rep.id)"
            :class="['report-nav-item', modelValue === rep.id ? 'active' : '']"
          >
            <span class="report-item-name">{{ rep.name }}</span>
            <span v-if="getBadgeCount(rep.id) !== null" class="report-item-badge">
              {{ getBadgeCount(rep.id) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Empty Search State -->
      <div v-if="noMatches" class="empty-search">
        <FileQuestion :size="24" class="text-slate-400 mx-auto mb-1.5 opacity-60" />
        <p class="text-xs font-semibold text-slate-500">No reports matching</p>
        <p class="text-[11px] font-mono text-slate-400">"{{ searchQuery }}"</p>
        <button
          type="button"
          @click="searchQuery = ''"
          class="btn-clear-search"
        >
          Reset Search
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, FileQuestion } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'sales'
  },
  counts: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const searchQuery = ref('')

// Ordered lists directly matching the user's reference screenshot
const TRANSACTION_REPORTS = [
  { id: 'sales', name: 'Sale' },
  { id: 'purchase', name: 'Purchase' },
  { id: 'day_book', name: 'Day book' },
  { id: 'all_transactions', name: 'All Transactions' },
  { id: 'profit', name: 'Profit And Loss' },
  { id: 'bill_wise_profit', name: 'Bill Wise Profit' },
  { id: 'credit', name: 'Sale Aging' },
  { id: 'cash_flow', name: 'Cash flow' },
  { id: 'balance_sheet', name: 'Balance Sheet' }
]

const PARTY_REPORTS = [
  { id: 'party_statement', name: 'Party Statement' },
  { id: 'party_pnl', name: 'Party wise Profit & Loss' },
  { id: 'all_parties', name: 'All parties' },
  { id: 'party_by_item', name: 'Party Report By Item' },
  { id: 'sale_purchase_by_party', name: 'Sale Purchase By Party' },
  { id: 'sale_purchase_by_party_group', name: 'Sale Purchase By Party Group' },
  { id: 'sale_summary_hsn', name: 'Sale Summary By HSN' }
]

const STOCK_REPORTS = [
  { id: 'inventory', name: 'Stock & Inventory Valuation' },
  { id: 'serials', name: 'Machine Serial Registry' },
  { id: 'containers', name: 'Containers & Import BLs' }
]

function matchesSearch(text) {
  if (!searchQuery.value) return true
  const q = searchQuery.value.toLowerCase().trim()
  return text.toLowerCase().includes(q)
}

const filteredTransactionReports = computed(() => {
  return TRANSACTION_REPORTS.filter(r => matchesSearch(r.name) || matchesSearch('transaction'))
})

const filteredPartyReports = computed(() => {
  return PARTY_REPORTS.filter(r => matchesSearch(r.name) || matchesSearch('party'))
})

const filteredStockReports = computed(() => {
  return STOCK_REPORTS.filter(r => matchesSearch(r.name) || matchesSearch('stock') || matchesSearch('inventory'))
})

const noMatches = computed(() => {
  return (
    filteredTransactionReports.value.length === 0 &&
    filteredPartyReports.value.length === 0 &&
    filteredStockReports.value.length === 0 &&
    !matchesSearch('Overview & Charts')
  )
})

function getBadgeCount(id) {
  if (props.counts && props.counts[id] !== undefined) {
    return props.counts[id]
  }
  return null
}

function selectReport(id) {
  emit('update:modelValue', id)
  emit('select', id)
}
</script>

<style scoped>
.report-sidebar-panel {
  width: 250px;
  min-width: 250px;
  max-width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  user-select: none;
}

[data-theme="dark"] .report-sidebar-panel {
  background-color: #0c1220;
  border-right-color: #1e293b;
}

/* Sticky Search Header */
.search-header {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
  flex-shrink: 0;
}

[data-theme="dark"] .search-header {
  background-color: #0f172a;
  border-bottom-color: #1e293b;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #64748b;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 28px 7px 32px;
  font-size: 13px;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
}

[data-theme="dark"] .search-input {
  background-color: #1e293b;
  color: #f8fafc;
  border-color: #334155;
}

.search-input:focus {
  background-color: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

[data-theme="dark"] .search-input:focus {
  background-color: #090d16;
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.clear-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
}

.clear-btn:hover {
  color: #0f172a;
}

[data-theme="dark"] .clear-btn:hover {
  color: #ffffff;
}

/* Scrollable Container */
.report-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 24px 0;
}

/* Custom Scrollbar exactly like reference photo */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

[data-theme="dark"] .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* Group Headers */
.report-group {
  margin-bottom: 12px;
}

.group-title {
  padding: 8px 16px 4px 16px;
  font-size: 11.5px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.2px;
}

[data-theme="dark"] .group-title {
  color: #94a3b8;
}

/* Report Navigation Items */
.group-items {
  display: flex;
  flex-direction: column;
}

.report-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.12s ease;
  position: relative;
}

[data-theme="dark"] .report-nav-item {
  color: #cbd5e1;
}

.report-nav-item:hover {
  background-color: #e2e8f0;
  color: #0f172a;
}

[data-theme="dark"] .report-nav-item:hover {
  background-color: #1e293b;
  color: #ffffff;
}

/* Active State matching professional accounting ERP */
.report-nav-item.active {
  background-color: #e2e8f0;
  color: #1e293b;
  font-weight: 600;
}

[data-theme="dark"] .report-nav-item.active {
  background-color: #1e293b;
  color: #38bdf8;
  font-weight: 600;
}

.report-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5px;
  background-color: #475569;
}

[data-theme="dark"] .report-nav-item.active::before {
  background-color: #38bdf8;
}

.report-item-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Count Badge */
.report-item-badge {
  font-size: 10px;
  font-family: monospace;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: #e2e8f0;
  color: #64748b;
  margin-left: 8px;
  flex-shrink: 0;
}

[data-theme="dark"] .report-item-badge {
  background-color: #0f172a;
  color: #94a3b8;
}

.report-item-badge.highlight {
  background-color: rgba(99, 102, 241, 0.15);
  color: #6366f1;
}

/* Empty Search */
.empty-search {
  padding: 24px 16px;
  text-align: center;
}

.btn-clear-search {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
</style>

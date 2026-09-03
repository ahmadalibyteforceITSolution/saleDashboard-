<template>
  <div class="date-filter-bar">
    
    <!-- Left: Icon & Title -->
    <div class="filter-header">
      <div class="filter-icon-box">
        <Calendar :size="15" class="text-primary" />
      </div>
      <span class="filter-title">{{ title }}</span>
    </div>

    <!-- Center: Presets & Date Pickers -->
    <div class="filter-controls">
      
      <!-- Quick Preset Dropdown -->
      <div class="filter-select-wrapper">
        <select v-model="currentPreset" @change="onDropdownSelect" class="filter-dropdown">
          <option value="All Time">All Time (All Invoices)</option>
          <option value="Today">Today</option>
          <option value="Yesterday">Yesterday</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
          <option value="Last Month">Last Month</option>
          <option value="This Year">This Year</option>
          <option value="Custom Range">Custom Date Range</option>
        </select>
      </div>

      <!-- Quick Shortcut Segmented Buttons -->
      <div class="quick-pills">
        <button
          type="button"
          :class="['quick-pill-btn', currentPreset === 'All Time' ? 'active' : '']"
          @click="selectPreset('All Time')"
        >
          All Time
        </button>
        <button
          type="button"
          :class="['quick-pill-btn', currentPreset === 'Today' ? 'active' : '']"
          @click="selectPreset('Today')"
        >
          Today
        </button>
        <button
          type="button"
          :class="['quick-pill-btn', currentPreset === 'This Month' ? 'active' : '']"
          @click="selectPreset('This Month')"
        >
          This Month
        </button>
      </div>

      <!-- Inline Date Range Pickers -->
      <div class="date-inputs-wrapper">
        <span class="date-label">From:</span>
        <input
          v-model="internalStartDate"
          type="date"
          class="date-input"
          @change="onManualDateChange"
        />
        <span class="date-separator">→</span>
        <span class="date-label">To:</span>
        <input
          v-model="internalEndDate"
          type="date"
          class="date-input"
          @change="onManualDateChange"
        />
      </div>

    </div>

    <!-- Right: Active Status Badge & Reset -->
    <div class="filter-meta">
      <span :class="['status-badge', currentPreset === 'All Time' ? 'neutral' : 'active']">
        <Clock :size="12" />
        <span>{{ displayLabel }}</span>
      </span>

      <button
        v-if="currentPreset !== 'All Time'"
        type="button"
        @click="resetToAllTime"
        class="reset-btn"
        title="Reset filter to All Time"
      >
        <RotateCcw :size="12" />
        <span>Reset</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar, Clock, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      preset: 'All Time',
      startDate: null,
      endDate: null
    })
  },
  title: {
    type: String,
    default: 'Sale Date Filter:'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentPreset = ref(props.modelValue?.preset || 'All Time')
const internalStartDate = ref(props.modelValue?.startDate || '')
const internalEndDate = ref(props.modelValue?.endDate || '')

// Format ISO date string (YYYY-MM-DD) safely
function formatDateStr(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function onDropdownSelect() {
  selectPreset(currentPreset.value)
}

function selectPreset(preset) {
  currentPreset.value = preset
  const now = new Date()

  if (preset === 'All Time') {
    internalStartDate.value = ''
    internalEndDate.value = ''
  } else if (preset === 'Today') {
    const todayStr = formatDateStr(now)
    internalStartDate.value = todayStr
    internalEndDate.value = todayStr
  } else if (preset === 'Yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    const yStr = formatDateStr(y)
    internalStartDate.value = yStr
    internalEndDate.value = yStr
  } else if (preset === 'This Week') {
    const start = new Date(now)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    start.setDate(diff)
    internalStartDate.value = formatDateStr(start)
    internalEndDate.value = formatDateStr(now)
  } else if (preset === 'This Month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    internalStartDate.value = formatDateStr(start)
    internalEndDate.value = formatDateStr(now)
  } else if (preset === 'Last Month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    internalStartDate.value = formatDateStr(start)
    internalEndDate.value = formatDateStr(end)
  } else if (preset === 'This Year') {
    const start = new Date(now.getFullYear(), 0, 1)
    internalStartDate.value = formatDateStr(start)
    internalEndDate.value = formatDateStr(now)
  } else if (preset === 'Custom Range') {
    if (!internalStartDate.value) internalStartDate.value = formatDateStr(now)
    if (!internalEndDate.value) internalEndDate.value = formatDateStr(now)
  }

  emitUpdate()
}

function onManualDateChange() {
  currentPreset.value = 'Custom Range'
  emitUpdate()
}

function resetToAllTime() {
  selectPreset('All Time')
}

function emitUpdate() {
  const result = {
    preset: currentPreset.value,
    startDate: internalStartDate.value || null,
    endDate: internalEndDate.value || null
  }
  emit('update:modelValue', result)
  emit('change', result)
}

const displayLabel = computed(() => {
  if (currentPreset.value === 'All Time') {
    return 'All-Time Cumulative'
  }
  if (internalStartDate.value && internalEndDate.value) {
    if (internalStartDate.value === internalEndDate.value) {
      return `${currentPreset.value}: ${internalStartDate.value}`
    }
    return `${internalStartDate.value} ~ ${internalEndDate.value}`
  }
  return currentPreset.value
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (newVal.preset !== undefined && newVal.preset !== currentPreset.value) {
      currentPreset.value = newVal.preset
    }
    if (newVal.startDate !== undefined) internalStartDate.value = newVal.startDate || ''
    if (newVal.endDate !== undefined) internalEndDate.value = newVal.endDate || ''
  }
}, { deep: true })
</script>

<style scoped>
/* ── Container Bar ────────────────────────────────────────── */
.date-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.85rem;
  margin-bottom: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* ── Header ──────────────────────────────────────────────── */
.filter-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.filter-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  background: rgba(99, 102, 241, 0.12);
  border-radius: var(--radius-sm);
}

.filter-title {
  font-size: 0.775rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-main);
}

/* ── Controls Row ─────────────────────────────────────────── */
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-select-wrapper {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 0 0.5rem 0 0.65rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.filter-select-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
}

.filter-dropdown {
  width: auto !important;
  height: 100% !important;
  min-height: auto !important;
  padding: 0 1.25rem 0 0 !important;
  border: none !important;
  background: transparent !important;
  font-size: 0.825rem !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
  cursor: pointer !important;
  outline: none !important;
  box-shadow: none !important;
}

/* ── Quick Shortcut Pills ─────────────────────────────────── */
.quick-pills {
  display: inline-flex;
  align-items: center;
  height: 2.15rem;
  padding: 2px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  gap: 2px;
}

.quick-pill-btn {
  padding: 0 0.65rem;
  height: calc(2.15rem - 4px);
  border: none;
  background: transparent;
  border-radius: calc(var(--radius-md) - 2px);
  font-size: 0.775rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
}

.quick-pill-btn:hover {
  color: var(--text-main);
}

.quick-pill-btn.active {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* ── Inline Date Range Pickers ────────────────────────────── */
.date-inputs-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.15rem;
  padding: 0 0.5rem;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.date-label {
  font-size: 0.725rem;
  font-weight: 600;
  color: var(--text-subtle);
}

.date-separator {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.date-input {
  width: 7.75rem !important;
  height: 1.65rem !important;
  min-height: auto !important;
  padding: 0 0.35rem !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--radius-sm) !important;
  background: var(--bg-card) !important;
  font-size: 0.75rem !important;
  font-family: var(--font-mono) !important;
  font-weight: 600 !important;
  color: var(--text-main) !important;
}

.date-input:focus {
  border-color: var(--primary) !important;
  outline: none !important;
}

/* ── Meta Section (Badge + Reset) ─────────────────────────── */
.filter-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.725rem;
  font-family: var(--font-mono);
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.neutral {
  background: rgba(100, 116, 139, 0.15);
  color: var(--text-subtle);
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.55rem;
  height: 1.75rem;
  font-size: 0.725rem;
  font-weight: 600;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ── Light Mode Specific Overrides ────────────────────────── */
[data-theme="light"] .date-filter-bar {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .filter-icon-box {
  background: rgba(79, 70, 229, 0.08);
}

[data-theme="light"] .filter-select-wrapper,
[data-theme="light"] .date-inputs-wrapper,
[data-theme="light"] .quick-pills {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.15);
}

[data-theme="light"] .filter-dropdown {
  color: #0f172a !important;
}

[data-theme="light"] .date-input {
  background: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.18) !important;
  color: #0f172a !important;
}

[data-theme="light"] .quick-pill-btn {
  color: #475569;
}

[data-theme="light"] .quick-pill-btn.active {
  background: #4f46e5;
  color: #ffffff;
}

[data-theme="light"] .status-badge.neutral {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

[data-theme="light"] .status-badge.active {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}
</style>

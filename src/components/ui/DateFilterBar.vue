<template>
  <div class="date-filter-wrapper glass-panel p-3.5 mb-4">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
      
      <!-- Left side: Filter Title & Preset Buttons -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-main mr-1">
          <Calendar :size="15" class="text-primary" />
          <span>{{ title }}</span>
        </div>

        <div class="preset-btn-group flex flex-wrap gap-1">
          <button
            v-for="preset in presets"
            :key="preset"
            type="button"
            :class="[
              'btn btn-xs rounded-full transition-all font-medium',
              currentPreset === preset
                ? 'btn-primary font-bold shadow-sm'
                : 'btn-ghost text-muted hover:text-main'
            ]"
            @click="selectPreset(preset)"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Right side: Date pickers (Custom or manual override) + Active badge + Reset -->
      <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
        <!-- Date Inputs (visible when not 'All Time' or when in 'Custom Range') -->
        <div v-if="currentPreset !== 'All Time'" class="date-picker-box flex items-center gap-1.5 text-xs p-1.5 rounded-lg border">
          <label class="text-subtle font-semibold flex items-center gap-1 text-[11px]">
            From:
          </label>
          <input
            v-model="internalStartDate"
            type="date"
            class="form-input text-xs py-1 px-2 h-7 font-mono font-bold w-32"
            @change="onManualDateChange"
          />

          <span class="text-subtle text-xs">to</span>

          <label class="text-subtle font-semibold flex items-center gap-1 text-[11px]">
            To:
          </label>
          <input
            v-model="internalEndDate"
            type="date"
            class="form-input text-xs py-1 px-2 h-7 font-mono font-bold w-32"
            @change="onManualDateChange"
          />
        </div>

        <!-- Active Filter Badge -->
        <span
          :class="[
            'badge text-xs font-mono py-1 px-2.5 rounded-full flex items-center gap-1.5',
            currentPreset === 'All Time' ? 'badge-neutral' : 'badge-success shadow-sm'
          ]"
        >
          <Clock :size="12" />
          <span>{{ displayLabel }}</span>
        </span>

        <!-- Reset Button -->
        <button
          v-if="currentPreset !== 'All Time'"
          type="button"
          @click="resetToAllTime"
          class="btn btn-xs btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1"
          title="Reset filter to All Time"
        >
          <RotateCcw :size="12" />
          <span>Reset</span>
        </button>
      </div>

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
  },
  presets: {
    type: Array,
    default: () => ['All Time', 'Today', 'Yesterday', 'This Week', 'This Month', 'Last Month', 'This Year', 'Custom Range']
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentPreset = ref(props.modelValue?.preset || 'All Time')
const internalStartDate = ref(props.modelValue?.startDate || '')
const internalEndDate = ref(props.modelValue?.endDate || '')

// Helper to format ISO date string (YYYY-MM-DD) safely
function formatDateStr(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
      return `${currentPreset.value} (${internalStartDate.value})`
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
.date-filter-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.preset-btn-group {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 4px;
  border-radius: 9999px;
  border: 1px solid var(--border-line);
}

.date-picker-box {
  background: rgba(17, 24, 39, 0.6);
  border-color: var(--border-line);
}

[data-theme="light"] .date-picker-box {
  background: #f1f5f9;
  border-color: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .preset-btn-group {
  background: rgba(15, 23, 42, 0.05);
}

[data-theme="light"] .date-filter-wrapper {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
}
</style>

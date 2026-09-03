<template>
  <!-- ============================================================
    DataTable — A scrollable table with standard ERP styling.
    Pass column headers via the `columns` prop.
    Pass rows via the default slot (use <tr> elements).
    ============================================================ -->
  <div class="table-container">
    <table class="table-lined">
      <!-- Table header — renders column names from props -->
      <thead>
        <tr>
          <th
            v-for="col in normalizedColumns"
            :key="col.key || col.label"
            :class="[col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : '']"
            @click="col.sortable && $emit('sort', col.key)"
          >
            <div class="flex items-center gap-1.5 inline-flex">
              <span>{{ col.label }}</span>
              <span v-if="col.sortable" class="text-xs font-mono">
                <span v-if="sortKey === col.key" class="text-primary font-bold">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
                <span v-else class="text-slate-500 opacity-60">⇅</span>
              </span>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table body — use the slot to pass <tr> elements -->
      <tbody>
        <slot />
      </tbody>
    </table>

    <!-- Empty state shown when no rows are provided -->
    <div v-if="empty" class="py-12 text-center text-slate-400 text-sm">
      <slot name="empty">
        {{ emptyMessage }}
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc' // 'asc' | 'desc'
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No records found.'
  }
})

defineEmits(['sort'])

const normalizedColumns = computed(() => {
  return props.columns.map(col => {
    if (typeof col === 'string') {
      return { label: col, key: col, sortable: false }
    }
    return {
      label: col.label || '',
      key: col.key || col.label || '',
      sortable: !!col.sortable
    }
  })
})
</script>

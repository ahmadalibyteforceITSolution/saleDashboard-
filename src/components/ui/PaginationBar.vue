<template>
  <div class="pagination-bar flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t text-xs select-none">
    <!-- Left: Item counts & page size selector -->
    <div class="flex items-center gap-3">
      <span class="text-slate-400 font-medium">
        Showing <strong class="text-white font-mono">{{ startItem }}</strong> – <strong class="text-white font-mono">{{ endItem }}</strong> of <strong class="text-white font-mono">{{ totalItems }}</strong> entries
      </span>

      <div class="flex items-center gap-1.5 ml-2">
        <span class="text-slate-500 text-[11px]">Show:</span>
        <select
          :value="pageSize"
          @change="$emit('update:pageSize', Number($event.target.value))"
          class="page-size-select form-select text-xs py-0.5 px-2 h-7 font-bold rounded"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }} / page
          </option>
        </select>
      </div>
    </div>

    <!-- Right: Page Controls -->
    <div class="flex items-center gap-1">
      <!-- First Page -->
      <button
        type="button"
        @click="goToPage(1)"
        :disabled="currentPage <= 1"
        class="page-nav-btn"
        title="First Page"
      >
        «
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="page-nav-btn"
        title="Previous Page"
      >
        ‹
      </button>

      <!-- Page Number Buttons -->
      <div class="flex items-center gap-1 mx-1">
        <button
          v-for="p in visiblePages"
          :key="p"
          type="button"
          @click="typeof p === 'number' && goToPage(p)"
          :class="[
            'page-num-btn',
            p === currentPage ? 'active' : '',
            typeof p !== 'number' ? 'cursor-default opacity-50' : ''
          ]"
        >
          {{ p }}
        </button>
      </div>

      <!-- Next Page -->
      <button
        type="button"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="page-nav-btn"
        title="Next Page"
      >
        ›
      </button>

      <!-- Last Page -->
      <button
        type="button"
        @click="goToPage(totalPages)"
        :disabled="currentPage >= totalPages"
        class="page-nav-btn"
        title="Last Page"
      >
        »
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 10
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50]
  }
})

const emit = defineEmits(['update:modelValue', 'update:pageSize', 'change'])

const currentPage = computed(() => Math.max(1, props.modelValue))

const totalPages = computed(() => {
  return Math.max(1, Math.ceil((props.totalItems || 0) / (props.pageSize || 10)))
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (currentPage.value - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * props.pageSize, props.totalItems)
})

function goToPage(p) {
  if (p >= 1 && p <= totalPages.value && p !== currentPage.value) {
    emit('update:modelValue', p)
    emit('change', p)
  }
}

// Generate smart visible page range e.g. [1, 2, 3, '...', 10]
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total]
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>

<style scoped>
.pagination-bar {
  background: rgba(15, 23, 42, 0.45);
  border-color: rgba(255, 255, 255, 0.08);
}

.page-size-select {
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-main);
}

.page-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition-fast);
}

.page-nav-btn:hover:not(:disabled) {
  color: #ffffff;
  border-color: var(--primary);
  background: var(--primary-glow);
}

.page-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-num-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.85rem;
  height: 1.85rem;
  padding: 0 0.4rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.page-num-btn:hover:not(.active):not(:disabled) {
  color: #ffffff;
  border-color: var(--border-color);
  background: var(--bg-input);
}

.page-num-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.4);
}

/* Light Theme Overrides */
[data-theme="light"] .pagination-bar {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
}

[data-theme="light"] .pagination-bar strong {
  color: #0f172a !important;
}

[data-theme="light"] .page-size-select {
  background-color: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.15) !important;
  color: #0f172a !important;
}

[data-theme="light"] .page-nav-btn {
  background: #ffffff !important;
  border-color: rgba(15, 23, 42, 0.12) !important;
  color: #334155 !important;
}

[data-theme="light"] .page-nav-btn:hover:not(:disabled) {
  background: #eef2ff !important;
  color: #4f46e5 !important;
  border-color: #6366f1 !important;
}

[data-theme="light"] .page-num-btn {
  color: #475569 !important;
}

[data-theme="light"] .page-num-btn:hover:not(.active) {
  background: #f1f5f9 !important;
  color: #0f172a !important;
}

[data-theme="light"] .page-num-btn.active {
  background: #4f46e5 !important;
  color: #ffffff !important;
}
</style>

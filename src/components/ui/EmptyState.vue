<template>
  <!-- ============================================================
    EmptyState — Shown when a list/table has no data to display.
    Shows an icon, a message, and an optional action button slot.
    ============================================================ -->
  <div class="flex flex-col items-center justify-center py-16 text-center gap-3">
    <!-- Icon area -->
    <div class="w-14 h-14 rounded-full bg-slate-800/70 flex items-center justify-center mb-2">
      <slot name="icon">
        <!-- Default icon fallback -->
        <svg class="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      </slot>
    </div>

    <!-- Message -->
    <p class="text-slate-400 font-semibold text-sm">{{ message }}</p>
    <p v-if="hint" class="text-slate-500 text-xs">{{ hint }}</p>

    <!-- Optional action button -->
    <div v-if="$slots.action" class="mt-3">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup>
/**
 * EmptyState
 *
 * Displayed when a list, table, or search result returns no data.
 *
 * Props:
 *  - message (String) — Primary message, e.g. "No invoices found"
 *  - hint    (String) — Secondary hint, e.g. "Try adjusting your filters"
 *
 * Slots:
 *  - icon   — Custom icon (defaults to a box icon)
 *  - action — Optional action button below the message
 *
 * Usage:
 *   <EmptyState message="No sales found" hint="Try changing the date range">
 *     <template #icon><Search :size="28" class="text-slate-500" /></template>
 *     <template #action>
 *       <button class="btn btn-primary" @click="clearFilters">Clear Filters</button>
 *     </template>
 *   </EmptyState>
 */
defineProps({
  message: {
    type: String,
    default: 'No data found'
  },
  hint: {
    type: String,
    default: ''
  }
})
</script>

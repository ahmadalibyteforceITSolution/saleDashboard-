<template>
  <!-- ============================================================
    SearchInput — A search box with a magnifying glass icon.
    v-model compatible. Used in table filter bars.
    ============================================================ -->
  <div class="relative" :class="widthClass">
    <!-- Search icon -->
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      :style="{ width: '16px', height: '16px' }"
      fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="8" />
      <path stroke-linecap="round" d="M21 21l-4.35-4.35" />
    </svg>

    <!-- Text input -->
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="form-input pl-10 text-sm"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script setup>
/**
 * SearchInput
 *
 * A styled search input with an icon, for filtering tables.
 * Fully v-model compatible.
 *
 * Props:
 *  - modelValue  (String) — Bound search string (v-model)
 *  - placeholder (String) — Input placeholder text
 *  - widthClass  (String) — Tailwind width class. Default: 'w-full sm:w-72'
 *
 * Events:
 *  - update:modelValue — Emitted on every keystroke
 *
 * Usage:
 *   <SearchInput v-model="searchQuery" placeholder="Search by customer, invoice..." />
 */
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  },
  widthClass: {
    type: String,
    default: 'w-full sm:w-72'
  }
})

defineEmits(['update:modelValue'])
</script>

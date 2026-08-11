<template>
  <!-- ============================================================
    ChartPresetToolbar
    A row of toggle buttons for switching chart time periods.
    Emits 'update:modelValue' when a button is clicked (v-model compatible).
    ============================================================ -->
  <div class="preset-toolbar">
    <button
      v-for="option in options"
      :key="option"
      :class="['preset-btn', modelValue === option ? 'active' : '']"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup>
/**
 * ChartPresetToolbar
 *
 * A toggle button row for switching chart time period presets.
 * Fully v-model compatible.
 *
 * Props:
 *  - modelValue (String, required) — The currently active preset (v-model)
 *  - options    (Array)            — Array of option strings to display as buttons
 *                                    Defaults to ['Monthly', 'Quarterly', 'YTD']
 *
 * Events:
 *  - update:modelValue — Emitted with the new option string when clicked
 *
 * Usage:
 *   <ChartPresetToolbar v-model="chartMode" />
 *
 *   <!-- Custom options -->
 *   <ChartPresetToolbar v-model="period" :options="['Today', 'This Week', 'This Month']" />
 */
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    default: () => ['Monthly', 'Quarterly', 'YTD']
  }
})

defineEmits(['update:modelValue'])
</script>

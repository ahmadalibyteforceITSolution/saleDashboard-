<template>
  <!-- ============================================================
    StatBadge — A small colored badge/pill used for status labels.
    Maps the `color` prop to the CSS class `badge-{color}`.
    ============================================================ -->
  <span :class="['badge', `badge-${color}`, { 'font-mono': mono }]">
    <slot />
  </span>
</template>

<script setup>
/**
 * StatBadge
 *
 * A tiny reusable badge pill component.
 *
 * Props:
 *  - color (String)  — Badge color variant: 'purple' | 'success' | 'info' | 'danger' | 'warning'
 *  - mono  (Boolean) — If true, applies font-mono class (for codes/numbers)
 *
 * Usage:
 *   <StatBadge color="success" :mono="true">PAID</StatBadge>
 *   <StatBadge color="danger">UNPAID</StatBadge>
 *   <StatBadge color="purple">3 BRANCHES</StatBadge>
 */
defineProps({
  color: {
    type: String,
    default: 'purple'
  },
  mono: {
    type: Boolean,
    default: false
  }
})
</script>

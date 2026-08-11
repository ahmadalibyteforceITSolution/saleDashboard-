<template>
  <!-- ============================================================
    KpiCard — A single KPI metric card used across all dashboards.
    Shows: label, value, optional subtitle, optional badge, optional icon.
    ============================================================ -->
  <div :class="['kpi-card', accentClass, 'glass-panel p-5 space-y-2']">
    <!-- Top row: label + optional badge -->
    <div class="flex justify-between items-center text-xs text-subtle font-semibold uppercase">
      <span>{{ label }}</span>
      <span v-if="badge" :class="['badge', `badge-${badgeColor}`, 'font-mono']">{{ badge }}</span>
    </div>

    <!-- Main value -->
    <div :class="['kpi-value', valueColor, 'mt-1']">
      {{ value }}
    </div>

    <!-- Optional subtitle -->
    <div v-if="subtitle" class="kpi-subtitle text-subtle text-xs">
      {{ subtitle }}
    </div>

    <!-- Optional extra slot for custom content -->
    <slot />
  </div>
</template>

<script setup>
/**
 * KpiCard
 *
 * A reusable metric stat card used throughout the ERP dashboards.
 *
 * Props:
 *  - label       (String, required) — Small uppercase label at top
 *  - value       (String, required) — Large main value (e.g. "PKR 7,933,000")
 *  - subtitle    (String)           — Small description below the value
 *  - badge       (String)           — Optional pill text in top-right corner
 *  - badgeColor  (String)           — Badge color: 'success' | 'purple' | 'info' | 'danger'
 *  - accentClass (String)           — Extra CSS class on the card: 'kpi-success' | 'kpi-purple' | ''
 *  - valueColor  (String)           — Tailwind color class for the value text
 *
 * Usage:
 *   <KpiCard
 *     label="Gross Revenue"
 *     value="PKR 7,933,000"
 *     subtitle="From 42 invoices"
 *     badge="TOTAL SALES"
 *     badge-color="success"
 *     accent-class="kpi-success"
 *     value-color="text-emerald-400"
 *   />
 */
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  badgeColor: {
    type: String,
    default: 'purple'
  },
  accentClass: {
    type: String,
    default: ''
  },
  valueColor: {
    type: String,
    default: 'text-white'
  }
})
</script>

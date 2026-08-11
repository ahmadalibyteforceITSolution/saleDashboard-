<template>
  <!-- ============================================================
    SectionTitle — A section heading row with title, subtitle,
    optional badge pills, icon slot, and a right-side toolbar slot.
    Used inside GlassPanel cards to label each data section.
    ============================================================ -->
  <div class="border-b border-slate-800/80 pb-4 mb-2">
    <!-- Optional badge pills row -->
    <div v-if="badges.length" class="flex items-center gap-2 mb-1">
      <span
        v-for="badge in badges"
        :key="badge.label"
        :class="['badge', `badge-${badge.color || 'purple'}`, 'font-mono']"
      >{{ badge.label }}</span>
    </div>

    <!-- Title row: icon + title on left, toolbar on right -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div>
        <h3 class="text-xl font-extrabold text-white flex items-center gap-2">
          <!-- Icon slot — place a lucide icon here -->
          <slot name="icon" />
          <span>{{ title }}</span>
        </h3>
        <p v-if="subtitle" class="text-xs text-subtle mt-0.5">{{ subtitle }}</p>
      </div>

      <!-- Right slot — place preset buttons or actions here -->
      <div v-if="$slots.toolbar">
        <slot name="toolbar" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * SectionTitle
 *
 * A section header used inside GlassPanel cards.
 *
 * Props:
 *  - title    (String, required) — Section heading text
 *  - subtitle (String)           — Small description below title
 *  - badges   (Array)            — Array of { label, color } badge pills
 *                                  e.g. [{ label: 'LIVE', color: 'success' }]
 *
 * Slots:
 *  - icon    — Place a Lucide icon component here
 *  - toolbar — Place preset buttons or action controls here (right side)
 *
 * Usage:
 *   <SectionTitle
 *     title="Revenue Trend"
 *     subtitle="Sales growth over time"
 *     :badges="[{ label: 'LIVE TREND', color: 'success' }]"
 *   >
 *     <template #icon><TrendingUp :size="22" class="text-indigo-400" /></template>
 *     <template #toolbar><ChartPresetToolbar v-model="mode" /></template>
 *   </SectionTitle>
 */
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  badges: {
    type: Array,
    default: () => []
  }
})
</script>

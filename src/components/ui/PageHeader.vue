<template>
  <!-- ============================================================
    PageHeader — Standard page top banner used on every view.
    Shows: badge row, h1 title, subtitle, and right-side action slot.
    ============================================================ -->
  <div class="header-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <!-- Left: title block -->
    <div>
      <!-- Optional badge pills above the title -->
      <div v-if="badges.length" class="flex items-center gap-2 mb-1">
        <span
          v-for="badge in badges"
          :key="badge.label"
          :class="['badge', `badge-${badge.color || 'purple'}`, 'font-mono']"
        >
          {{ badge.label }}
        </span>
      </div>

      <!-- Page title -->
      <h1 class="text-3xl font-extrabold text-white mt-1 tracking-tight">{{ title }}</h1>

      <!-- Optional subtitle -->
      <p v-if="subtitle" class="text-slate-300 text-sm mt-1">{{ subtitle }}</p>
    </div>

    <!-- Right: action buttons slot -->
    <div v-if="$slots.actions" class="flex-shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
/**
 * PageHeader
 *
 * Props:
 *  - title    (String, required) — The main h1 page title
 *  - subtitle (String)           — Small description line below title
 *  - badges   (Array)            — Array of { label, color } for badge pills
 *                                  color maps to badge-{color} CSS class
 *                                  e.g. [{ label: 'LIVE', color: 'success' }]
 *
 * Slots:
 *  - actions  — Place action buttons here (right side)
 *
 * Usage:
 *   <PageHeader
 *     title="Executive Dashboard"
 *     subtitle="Monitor branch sales and stock."
 *     :badges="[{ label: 'LIVE', color: 'success' }]"
 *   >
 *     <template #actions>
 *       <button class="btn btn-primary">New Sale</button>
 *     </template>
 *   </PageHeader>
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

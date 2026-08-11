<template>
  <!-- ============================================================
    BranchBarChart
    A horizontal progress-bar chart comparing revenue/volume
    across multiple branches. No SVG needed — pure CSS bars.
    ============================================================ -->
  <div class="space-y-4 pt-2">
    <div v-for="bar in bars" :key="bar.name" class="space-y-1.5">
      <!-- Label row: branch name on left, value on right -->
      <div class="flex justify-between text-xs font-bold">
        <span class="text-slate-200 flex items-center gap-1.5">
          <!-- Optional icon slot rendered per bar -->
          <component :is="iconComponent" v-if="iconComponent" :size="14" class="text-indigo-400" />
          <span>{{ bar.name }} Branch</span>
        </span>
        <span class="text-emerald-400 font-mono">
          PKR {{ bar.revenue.toLocaleString() }} ({{ bar.count }} Sales)
        </span>
      </div>

      <!-- Progress bar track -->
      <div class="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          class="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 shadow-md"
          :style="{ width: `${bar.percentage}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * BranchBarChart
 *
 * A horizontal bar chart comparing branch revenue with animated CSS bars.
 *
 * Props:
 *  - bars          (Array, required) — Array of branch objects:
 *                                      { name: String, revenue: Number, count: Number, percentage: Number }
 *                                      percentage = 0-100 width of the bar
 *  - iconComponent (Object)          — Optional Vue component to show next to branch name
 *                                      e.g. import { Building2 } from 'lucide-vue-next'
 *
 * Usage:
 *   <BranchBarChart :bars="branchMetrics" :icon-component="Building2" />
 *
 *   // branchMetrics example:
 *   [
 *     { name: 'Peshawar', revenue: 5200000, count: 18, percentage: 100 },
 *     { name: 'Multan',   revenue: 3100000, count: 12, percentage: 60 },
 *     { name: 'Lahore',   revenue: 1800000, count: 7,  percentage: 35 }
 *   ]
 */
defineProps({
  bars: {
    type: Array,
    required: true
  },
  iconComponent: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <!-- ============================================================
    DonutChart
    A small SVG radial donut chart + legend list.
    Shows category distribution with colored arcs and a center label.
    ============================================================ -->
  <div class="flex flex-col sm:flex-row items-center gap-6 pt-2">
    <!-- SVG Donut Ring -->
    <div class="relative w-40 h-40 flex-shrink-0">
      <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
        <!-- Background track ring -->
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="3.8"
        />

        <!-- One arc per segment -->
        <path
          v-for="(seg, idx) in segments"
          :key="idx"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          :stroke="seg.color"
          stroke-width="3.8"
          :stroke-dasharray="`${seg.pct}, 100`"
          :stroke-dashoffset="`-${seg.offset}`"
          stroke-linecap="round"
        />
      </svg>

      <!-- Center label -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-xl font-extrabold text-white font-mono leading-none">{{ centerValue }}</span>
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{{ centerLabel }}</span>
      </div>
    </div>

    <!-- Legend list -->
    <div class="space-y-2.5 w-full">
      <div
        v-for="seg in segments"
        :key="seg.name"
        class="flex items-center justify-between text-xs p-2.5 bg-slate-900/50 rounded-lg border border-slate-800"
      >
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
          <span class="font-bold text-slate-200">{{ seg.name }}</span>
        </div>
        <span class="font-mono text-emerald-400 font-bold">{{ seg.count }} Units ({{ seg.pct }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * DonutChart
 *
 * An SVG radial donut chart with category legend.
 *
 * Props:
 *  - segments    (Array, required) — Array of segment objects:
 *                  { name: String, count: Number, pct: Number, color: String, offset: Number }
 *                  pct    = percentage of the circle this arc covers (0-100)
 *                  offset = cumulative percentage offset where this arc starts
 *                  color  = CSS color string e.g. '#3b82f6'
 *  - centerValue (String | Number) — Large text in the center of the donut
 *  - centerLabel (String)          — Small label below center value
 *
 * Usage:
 *   <DonutChart
 *     :segments="categoryDistribution"
 *     :center-value="totalUnits"
 *     center-label="Machines"
 *   />
 *
 *   // segments example:
 *   [
 *     { name: 'Ultrasound', count: 25, pct: 50, offset: 0,  color: '#3b82f6' },
 *     { name: 'Laser',      count: 15, pct: 30, offset: 50, color: '#8b5cf6' },
 *     { name: 'ECG',        count: 10, pct: 20, offset: 80, color: '#10b981' }
 *   ]
 */
defineProps({
  segments: {
    type: Array,
    required: true
  },
  centerValue: {
    type: [String, Number],
    required: true
  },
  centerLabel: {
    type: String,
    default: 'Units'
  }
})
</script>

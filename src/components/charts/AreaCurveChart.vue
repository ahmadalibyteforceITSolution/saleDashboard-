<template>
  <!-- ============================================================
    AreaCurveChart
    A responsive SVG area chart with a smooth cubic bezier curve,
    gradient fill, horizontal grid lines, Y-axis labels, X-axis
    month labels, interactive hover dots, and a tooltip card.
    ============================================================ -->
  <div class="chart-container relative pt-6 pb-4 px-3 bg-slate-950/50 rounded-2xl border border-slate-800/80 shadow-inner">
    <svg :viewBox="`0 0 ${SVG_W} ${SVG_H}`" class="w-full h-auto block overflow-visible">
      <defs>
        <!-- Gradient fill under the curve line -->
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="lineColor" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="lineColor" stop-opacity="0.0" />
        </linearGradient>

        <!-- Glow filter for the curve line -->
        <filter :id="glowId" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Horizontal grid lines -->
      <line :x1="AXIS_X" :y1="40"  :x2="GRID_END_X" :y2="40"  stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
      <line :x1="AXIS_X" :y1="90"  :x2="GRID_END_X" :y2="90"  stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
      <line :x1="AXIS_X" :y1="140" :x2="GRID_END_X" :y2="140" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
      <line :x1="AXIS_X" :y1="190" :x2="GRID_END_X" :y2="190" stroke="rgba(255,255,255,0.12)" />

      <!-- Y-axis labels -->
      <text :x="LABEL_X" y="44"  class="chart-axis-text" style="font-size:11px;font-family:monospace;font-weight:700" text-anchor="end">{{ yLabels[0] }}</text>
      <text :x="LABEL_X" y="94"  class="chart-axis-text" style="font-size:11px;font-family:monospace;font-weight:700" text-anchor="end">{{ yLabels[1] }}</text>
      <text :x="LABEL_X" y="144" class="chart-axis-text" style="font-size:11px;font-family:monospace;font-weight:700" text-anchor="end">{{ yLabels[2] }}</text>
      <text :x="LABEL_X" y="194" class="chart-axis-text" style="font-size:11px;font-family:monospace;font-weight:700" text-anchor="end">{{ yLabels[3] }}</text>

      <!-- Gradient area fill -->
      <path :d="areaPath" :fill="`url(#${gradId})`" />

      <!-- Smooth curve line -->
      <path :d="linePath" fill="none" :stroke="lineColor" stroke-width="3.5" :filter="`url(#${glowId})`" stroke-linecap="round" />

      <!-- Data points + X-axis labels -->
      <g v-for="(pt, idx) in points" :key="idx">
        <circle
          :cx="pt.x" :cy="pt.y"
          r="6"
          :fill="lineColor"
          stroke="#ffffff"
          stroke-width="2.5"
          class="cursor-pointer"
          @mouseenter="hoveredPoint = pt"
          @mouseleave="hoveredPoint = null"
        />
        <text :x="pt.x" y="218" class="chart-axis-text" style="font-size:10px;font-family:monospace;font-weight:700" text-anchor="middle">{{ pt.label }}</text>
      </g>
    </svg>

    <!-- Hover tooltip card -->
    <div
      v-if="hoveredPoint"
      class="absolute pointer-events-none z-10 bg-slate-900/95 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-left min-w-[160px]"
      :style="{ left: hoveredPoint.xPct + '%', top: hoveredPoint.yPct + '%', transform: 'translate(-50%, -110%)' }"
    >
      <div class="text-xs text-slate-400 font-semibold mb-1">{{ hoveredPoint.label }}</div>
      <div class="font-mono text-emerald-400 font-extrabold text-sm">PKR {{ hoveredPoint.val.toLocaleString() }}</div>
      <div v-if="hoveredPoint.extra" class="text-[11px] text-slate-400 font-mono">{{ hoveredPoint.extra }}</div>
    </div>
  </div>
</template>

<script setup>
/**
 * AreaCurveChart
 *
 * A fully self-contained responsive SVG area curve chart.
 *
 * Props:
 *  - dataPoints (Array, required) — Array of { label, val } objects
 *                                   label = X-axis text (e.g. "Jul 2026")
 *                                   val   = Numeric value (e.g. 7500000)
 *  - maxVal     (Number)          — Y-axis maximum value. Default: 10000000
 *  - lineColor  (String)          — Curve + gradient color. Default: '#6366f1'
 *  - yLabels    (Array)           — 4 Y-axis label strings from top to bottom
 *                                   Default: ['10M', '6.5M', '3.2M', '0']
 *  - extraLabel (Function)        — Optional fn(pt) => string for tooltip extra line
 *
 * Usage:
 *   <AreaCurveChart
 *     :data-points="chartPoints"
 *     :max-val="10000000"
 *     line-color="#8b5cf6"
 *     :y-labels="['10M', '6.5M', '3.2M', '0']"
 *   />
 */
import { computed, ref } from 'vue'

// Unique IDs so multiple charts on the same page don't conflict
const uid = Math.random().toString(36).slice(2, 7)
const gradId = `areaGrad_${uid}`
const glowId = `areaGlow_${uid}`

// SVG coordinate constants
const SVG_W     = 920  // Total SVG width
const SVG_H     = 250  // Total SVG height
const LABEL_X   = 65   // X position of Y-axis text labels
const AXIS_X    = 75   // X start of horizontal grid lines
const GRID_END_X = 845 // X end of horizontal grid lines
const START_X   = 90   // X position of first data point
const CHART_W   = 740  // Total width available for data points
const BASE_Y    = 190  // Y position of baseline (0 value)
const TOP_Y     = 40   // Y position of max value

const props = defineProps({
  dataPoints: {
    type: Array,
    required: true
  },
  maxVal: {
    type: Number,
    default: 10000000
  },
  lineColor: {
    type: String,
    default: '#6366f1'
  },
  yLabels: {
    type: Array,
    default: () => ['10M', '6.5M', '3.2M', '0']
  },
  extraLabel: {
    type: Function,
    default: null
  }
})

const hoveredPoint = ref(null)

// Convert raw dataPoints into SVG coordinate objects
const points = computed(() => {
  const pts = props.dataPoints
  if (!pts.length) return []
  const step = CHART_W / Math.max(pts.length - 1, 1)

  return pts.map((dp, idx) => {
    const x = START_X + idx * step
    const y = BASE_Y - (dp.val / props.maxVal) * (BASE_Y - TOP_Y)
    return {
      x,
      y,
      // Percentage positions used for tooltip placement
      xPct: ((x / SVG_W) * 100).toFixed(1),
      yPct: ((y / SVG_H) * 100).toFixed(1),
      label: dp.label,
      val: dp.val,
      extra: props.extraLabel ? props.extraLabel(dp) : null
    }
  })
})

// Build the smooth cubic bezier curve path (line only)
const linePath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpX = prev.x + (curr.x - prev.x) / 2
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
})

// Build the closed area path (line + bottom closing)
const areaPath = computed(() => {
  const line = linePath.value
  if (!line) return ''
  const pts = points.value
  return `${line} L ${pts[pts.length - 1].x} ${BASE_Y} L ${pts[0].x} ${BASE_Y} Z`
})
</script>

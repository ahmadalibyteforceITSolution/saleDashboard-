<template>
  <Teleport to="body">
    <Transition name="api-loader-fade">
      <div
        v-if="uiStore.isGlobalLoading"
        class="fixed inset-0 z-[999999] flex items-center justify-center p-4 select-none"
        style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); background: rgba(3, 7, 18, 0.72);"
        role="status"
        aria-live="polite"
      >
        <!-- Top Laser Shimmer Progress Line across viewport -->
        <div class="fixed top-0 left-0 right-0 h-1 z-[1000000] overflow-hidden bg-slate-900">
          <div class="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 via-cyan-400 to-emerald-500 animate-shimmer-fast"></div>
        </div>

        <!-- Premium Glassmorphism Floating Card -->
        <div
          class="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white/95 dark:bg-[#0c1322]/95 border border-slate-200/90 dark:border-cyan-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_35px_rgba(6,182,212,0.2)] p-6 sm:p-7 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        >
          <!-- Top Accent Light Bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

          <!-- Ambient Glow Blobs inside Card -->
          <div class="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <!-- ── MULTI-TIER HOLOGRAPHIC SPINNER CORE ── -->
          <div class="relative w-24 h-24 my-2 flex items-center justify-center">
            <!-- Glow Halo behind spinner -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 to-cyan-500/30 blur-xl animate-pulse"></div>

            <!-- Outer Smooth Rotating Conic Ring -->
            <div class="absolute inset-0 rounded-full loader-outer-conic-ring"></div>

            <!-- Middle Counter-Rotating Orbital Ring with Glowing Satellite -->
            <div class="absolute inset-2 rounded-full border border-dashed border-teal-400/50 dark:border-cyan-400/50 loader-middle-counter-ring">
              <!-- Orbiting Particle Dot -->
              <span class="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
            </div>

            <!-- Inner Pulsing Glass Core -->
            <div class="absolute inset-4 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 shadow-inner flex items-center justify-center">
              <div class="text-emerald-500 dark:text-cyan-400 animate-pulse">
                <Database v-if="currentIcon === 'database'" :size="24" />
                <Server v-else-if="currentIcon === 'server'" :size="24" />
                <Zap v-else-if="currentIcon === 'zap'" :size="24" />
                <RefreshCw v-else :size="24" class="animate-spin-slow" />
              </div>
            </div>
          </div>

          <!-- ── LIVE STATUS BADGE ── -->
          <div class="mt-3 mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 shadow-2xs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE DATABASE SYNC</span>
          </div>

          <!-- ── HEADLINE TITLE ── -->
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide leading-snug">
            {{ uiStore.globalLoadingTitle || 'Processing Transaction...' }}
          </h3>

          <!-- ── SUBTITLE / EXPLANATION ── -->
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed">
            {{ uiStore.globalLoadingSubtitle || 'Securely validating and recording database entries...' }}
          </p>

          <!-- ── FLUID INDETERMINATE PROGRESS BEAM ── -->
          <div class="w-full mt-4 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden relative shadow-inner">
            <div class="absolute inset-y-0 h-full w-2/5 bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 rounded-full loader-laser-beam"></div>
          </div>

          <!-- ── FOOTER SECURITY STAMP ── -->
          <div class="mt-4 pt-3 w-full border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <div class="flex items-center gap-1">
              <ShieldCheck :size="12" class="text-emerald-500" />
              <span>256-BIT ENCRYPTION</span>
            </div>
            <span class="font-bold text-teal-600 dark:text-teal-400">ACTIVE SESSION</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import {
  Database,
  Server,
  Zap,
  RefreshCw,
  ShieldCheck
} from 'lucide-vue-next'

const uiStore = useUiStore()

const currentIcon = computed(() => {
  const title = (uiStore.globalLoadingTitle || '').toLowerCase()
  if (title.includes('sale') || title.includes('purchase') || title.includes('payment')) return 'zap'
  if (title.includes('product') || title.includes('equipment') || title.includes('inventory')) return 'database'
  if (title.includes('server') || title.includes('system') || title.includes('party')) return 'server'
  return 'sync'
})
</script>

<style scoped>
/* Conic rotating gradient ring */
.loader-outer-conic-ring {
  background: conic-gradient(from 0deg, #10b981, #06b6d4, #3b82f6, transparent 65%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3.5px), #000 calc(100% - 3px));
  animation: loader-spin-clockwise 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Middle counter-rotating ring */
.loader-middle-counter-ring {
  animation: loader-spin-counter 2.5s linear infinite;
}

/* Slow icon rotate for refresh icon */
.animate-spin-slow {
  animation: loader-spin-clockwise 3s linear infinite;
}

/* Laser sliding beam */
.loader-laser-beam {
  animation: loader-laser-slide 1.4s ease-in-out infinite;
}

/* Fast Shimmer for top viewport line */
.animate-shimmer-fast {
  animation: loader-shimmer 1.8s linear infinite;
  background-size: 200% 100%;
}

@keyframes loader-spin-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes loader-spin-counter {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes loader-laser-slide {
  0% {
    left: -40%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes loader-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Smooth Fade and Scale Transitions */
.api-loader-fade-enter-active,
.api-loader-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.api-loader-fade-enter-from,
.api-loader-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>

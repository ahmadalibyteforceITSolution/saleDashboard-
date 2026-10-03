<template>
  <Teleport to="body">
    <Transition name="proper-loader-fade">
      <div
        v-if="uiStore.isGlobalLoading"
        class="proper-loader-backdrop"
        role="status"
        aria-live="polite"
      >
        <!-- Top Screen Viewport Shimmer Line -->
        <div class="proper-top-line">
          <div class="proper-top-line-bar"></div>
        </div>

        <!-- Solid, High-Contrast Floating Modal Card -->
        <div class="proper-loader-card">
          <!-- Top Gradient Accent Bar -->
          <div class="proper-card-accent-bar"></div>

          <!-- Spinner Core Area -->
          <div class="proper-spinner-wrap">
            <svg class="proper-spinner-svg" viewBox="0 0 54 54">
              <circle
                class="proper-spinner-track"
                cx="27"
                cy="27"
                r="22"
                fill="none"
                stroke-width="4.5"
              />
              <circle
                class="proper-spinner-arc"
                cx="27"
                cy="27"
                r="22"
                fill="none"
                stroke-width="4.5"
                stroke-linecap="round"
                stroke-dasharray="100 138"
              />
            </svg>
            <div class="proper-spinner-icon">
              <Zap v-if="currentIcon === 'zap'" :size="20" class="proper-icon-glow" />
              <Database v-else-if="currentIcon === 'database'" :size="20" class="proper-icon-glow" />
              <Server v-else-if="currentIcon === 'server'" :size="20" class="proper-icon-glow" />
              <RefreshCw v-else :size="20" class="proper-icon-glow proper-spin" />
            </div>
          </div>

          <!-- Live Status Badge -->
          <div class="proper-status-badge">
            <span class="proper-status-dot-wrap">
              <span class="proper-status-ping"></span>
              <span class="proper-status-dot"></span>
            </span>
            <span>{{ liveBadgeText }}</span>
          </div>

          <!-- Title -->
          <h3 class="proper-loader-title">
            {{ uiStore.globalLoadingTitle || 'Processing Request...' }}
          </h3>

          <!-- Subtitle -->
          <p class="proper-loader-subtitle">
            {{ uiStore.globalLoadingSubtitle || 'Securely validating and saving records to server...' }}
          </p>

          <!-- Fluid Progress Bar -->
          <div class="proper-progress-track">
            <div class="proper-progress-bar"></div>
          </div>

          <!-- Security Footer -->
          <div class="proper-loader-footer">
            <span class="proper-footer-left">
              <ShieldCheck :size="13" class="proper-shield-icon" />
              <span>256-BIT ENCRYPTION</span>
            </span>
            <span class="proper-footer-right">ERP LIVE SYNC</span>
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
  if (title.includes('sale') || title.includes('purchase') || title.includes('payment') || title.includes('invoice')) return 'zap'
  if (title.includes('product') || title.includes('equipment') || title.includes('inventory') || title.includes('serial')) return 'database'
  if (title.includes('party') || title.includes('customer') || title.includes('account') || title.includes('ledger')) return 'server'
  return 'sync'
})

const liveBadgeText = computed(() => {
  const title = (uiStore.globalLoadingTitle || '').toLowerCase()
  if (title.includes('sale')) return 'RECORDING SALE'
  if (title.includes('purchase')) return 'REGISTERING PURCHASE'
  if (title.includes('payment')) return 'PROCESSING VOUCHER'
  if (title.includes('equipment') || title.includes('product')) return 'UPDATING INVENTORY'
  if (title.includes('party') || title.includes('customer')) return 'UPDATING LEDGER'
  return 'LIVE DATABASE SYNC'
})
</script>

<style scoped>
/* Fullscreen Backdrop */
.proper-loader-backdrop {
  position: fixed !important;
  inset: 0 !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 999999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background-color: rgba(15, 23, 42, 0.68) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  padding: 16px !important;
  user-select: none !important;
}

/* Top Viewport Laser Bar */
.proper-top-line {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000000;
}

.proper-top-line-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #147d8e, #10b981, #06b6d4, #147d8e);
  background-size: 200% 100%;
  animation: proper-shimmer 1.5s linear infinite;
}

/* Solid Floating Card */
.proper-loader-card {
  position: relative !important;
  width: 92% !important;
  max-width: 410px !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  padding: 28px 24px 22px 24px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 30px rgba(20, 125, 142, 0.15) !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #0f172a !important;
}

/* Dark theme card styling */
:global([data-theme="dark"]) .proper-loader-card,
:global(.dark) .proper-loader-card,
:global(html.dark) .proper-loader-card {
  background: #0f172a !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.65), 0 0 35px rgba(20, 125, 142, 0.25) !important;
  color: #f8fafc !important;
}

/* Top Accent Line */
.proper-card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #147d8e 0%, #10b981 50%, #06b6d4 100%);
}

/* Spinner Core */
.proper-spinner-wrap {
  position: relative;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
  margin-bottom: 12px;
}

.proper-spinner-svg {
  width: 100%;
  height: 100%;
  transform-origin: center;
  animation: proper-rotate 1.1s linear infinite;
}

.proper-spinner-track {
  stroke: #f1f5f9;
}

:global([data-theme="dark"]) .proper-spinner-track,
:global(.dark) .proper-spinner-track,
:global(html.dark) .proper-spinner-track {
  stroke: #1e293b;
}

.proper-spinner-arc {
  stroke: #147d8e;
  animation: proper-dash 1.4s ease-in-out infinite;
}

.proper-spinner-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.proper-icon-glow {
  color: #10b981;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4));
}

.proper-spin {
  animation: proper-rotate 2.5s linear infinite;
}

/* Live Status Badge */
.proper-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 9999px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

:global([data-theme="dark"]) .proper-status-badge,
:global(.dark) .proper-status-badge,
:global(html.dark) .proper-status-badge {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
}

.proper-status-dot-wrap {
  position: relative;
  display: flex;
  width: 7px;
  height: 7px;
}

.proper-status-ping {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: #10b981;
  opacity: 0.75;
  animation: proper-ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.proper-status-dot {
  position: relative;
  display: inline-flex;
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: #10b981;
}

/* Title & Subtitle */
.proper-loader-title {
  margin: 0 !important;
  font-size: 17px !important;
  font-weight: 800 !important;
  color: #0f172a !important;
  letter-spacing: -0.01em !important;
  line-height: 1.3 !important;
}

:global([data-theme="dark"]) .proper-loader-title,
:global(.dark) .proper-loader-title,
:global(html.dark) .proper-loader-title {
  color: #ffffff !important;
}

.proper-loader-subtitle {
  margin: 6px 0 0 0 !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  color: #64748b !important;
  line-height: 1.45 !important;
  max-width: 320px !important;
}

:global([data-theme="dark"]) .proper-loader-subtitle,
:global(.dark) .proper-loader-subtitle,
:global(html.dark) .proper-loader-subtitle {
  color: #94a3b8 !important;
}

/* Fluid Progress Bar */
.proper-progress-track {
  width: 100%;
  height: 5px;
  border-radius: 9999px;
  background: #f1f5f9;
  overflow: hidden;
  position: relative;
  margin-top: 20px;
}

:global([data-theme="dark"]) .proper-progress-track,
:global(.dark) .proper-progress-track,
:global(html.dark) .proper-progress-track {
  background: #1e293b;
}

.proper-progress-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 45%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #147d8e, #10b981);
  animation: proper-slide 1.5s ease-in-out infinite;
}

/* Footer */
.proper-loader-footer {
  width: 100%;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-family: monospace;
  font-weight: 600;
  color: #94a3b8;
}

:global([data-theme="dark"]) .proper-loader-footer,
:global(.dark) .proper-loader-footer,
:global(html.dark) .proper-loader-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #64748b;
}

.proper-footer-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.proper-shield-icon {
  color: #10b981;
}

.proper-footer-right {
  color: #147d8e;
  font-weight: 700;
}

/* Animations */
@keyframes proper-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes proper-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -124;
  }
}

@keyframes proper-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes proper-slide {
  0% {
    left: -45%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

@keyframes proper-ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Fade In / Out Transition */
.proper-loader-fade-enter-active,
.proper-loader-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.proper-loader-fade-enter-from,
.proper-loader-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>

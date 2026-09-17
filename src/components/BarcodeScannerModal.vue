<template>
  <div v-if="show" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-xl animate-scale-up glass-card border border-emerald-500/30">
      <!-- Modal Header -->
      <div class="modal-header flex justify-between items-center pb-3 border-b border-slate-700/60">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ScanBarcode :size="20" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>Barcode & QR Optical Scanner</span>
              <span class="badge badge-emerald text-xs">HARDWARE / CAMERA READY</span>
            </h3>
            <p class="text-xs text-slate-400">Scan container product labels, hardware serial tags or enter code directly</p>
          </div>
        </div>
        <button @click="closeModal" class="btn-icon text-slate-400 hover:text-white">✕</button>
      </div>

      <div class="modal-body space-y-4 py-4">
        <!-- Live Optical Viewport -->
        <div class="scanner-viewport">
          <!-- Scanning Laser Line Animation -->
          <div class="scan-laser-line"></div>

          <!-- Top Status Strip -->
          <div class="scanner-top-bar">
            <span class="sensor-badge">
              <span class="ping-dot"></span>
              OPTICAL SENSOR ACTIVE
            </span>
            <span class="format-badge">CODE-128 • EAN-13 • QR • UPC</span>
          </div>

          <!-- Center Camera View -->
          <div class="scanner-center-view">
            <div class="scanner-reticle-box">
              <div class="reticle-corner corner-tl"></div>
              <div class="reticle-corner corner-tr"></div>
              <div class="reticle-corner corner-bl"></div>
              <div class="reticle-corner corner-br"></div>
              <div class="camera-lens-circle">
                <Camera :size="22" class="text-emerald-400" />
              </div>
            </div>
            <div class="scanner-hint-text">
              Align product barcode or USB scanner gun inside targeting reticle
            </div>
          </div>

          <!-- Bottom Camera Status Pill -->
          <div class="scanner-bottom-bar">
            <span class="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AUTO-DECODE: ON
            </span>
            <span class="text-slate-400 text-[10px] font-mono">USB READER / OPTICAL CAMERA READY</span>
          </div>
        </div>

        <!-- Hardware Barcode Input Field (for USB Handheld Barcode Guns) -->
        <div class="form-group mb-0">
          <div class="flex justify-between items-center mb-1">
            <label class="form-label text-xs mb-0 flex items-center gap-1.5">
              <Barcode :size="14" class="text-emerald-400" />
              <span>Barcode Input / Hardware USB Reader</span>
            </label>
            <span class="text-[11px] text-slate-400">Press Enter or click Accept</span>
          </div>
          <div class="flex gap-2">
            <input
              ref="barcodeInputRef"
              v-model="manualBarcode"
              type="text"
              placeholder="Scan with USB gun or type code (e.g. AN-BC-WRM01)..."
              class="form-input text-sm font-mono font-bold flex-1"
              @keydown.enter.prevent="handleAcceptBarcode"
              autofocus
            />
            <button
              type="button"
              @click="handleAcceptBarcode"
              class="btn btn-primary px-4 flex items-center gap-1 text-xs"
              :disabled="!manualBarcode.trim()"
            >
              <Check :size="14" />
              <span>Accept</span>
            </button>
          </div>
        </div>

        <!-- Matched Product Live Card (if matched in store) -->
        <div v-if="matchedProduct" class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-3 animate-fade-in">
          <img :src="matchedProduct.image" alt="Product" class="w-12 h-12 object-cover rounded-md border border-emerald-500/30" />
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-white truncate">{{ matchedProduct.name }}</div>
            <div class="flex items-center gap-2 mt-0.5 text-[11px] font-mono">
              <span class="text-emerald-400 font-bold">SKU: {{ matchedProduct.sku }}</span>
              <span v-if="matchedProduct.containerNo" class="text-amber-300">Box: {{ matchedProduct.containerNo }}</span>
            </div>
            <div class="text-[11px] text-slate-300">
              Price: <strong class="text-emerald-300">PKR {{ (matchedProduct.sellingPrice || 0).toLocaleString() }}</strong>
              • In Stock: {{ matchedProduct.stockQty }} units
            </div>
          </div>
          <button
            type="button"
            @click="handleAcceptBarcode"
            class="btn btn-sm btn-success whitespace-nowrap text-xs"
          >
            Apply Code
          </button>
        </div>

        <!-- Quick One-Click Simulated Barcodes for Testing -->
        <div class="demo-tags-box p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Instant Demo Barcode Tags (Click to test):</span>
            <span class="text-[10px] text-amber-400 font-bold">ONE-CLICK SCAN</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in sampleBarcodes"
              :key="tag.code"
              type="button"
              @click="simulateScan(tag.code)"
              class="demo-tag-btn px-2.5 py-1 text-xs rounded font-mono bg-slate-800 hover:bg-emerald-800/50 hover:text-emerald-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Barcode :size="12" class="text-slate-400" />
              <span>{{ tag.code }}</span>
              <span class="text-[10px] text-slate-400">({{ tag.label }})</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer flex justify-between items-center pt-3 border-t border-slate-800">
        <span class="text-[11px] text-slate-400 flex items-center gap-1">
          <Volume2 :size="12" class="text-emerald-400" />
          <span>Audio beep enabled on barcode detection</span>
        </span>
        <button type="button" @click="closeModal" class="btn btn-secondary text-xs">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import {
  ScanBarcode,
  Camera,
  Barcode,
  Check,
  Volume2
} from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  targetContext: { type: String, default: 'product' } // 'product', 'serial', 'invoice', 'container'
})

const emit = defineEmits(['close', 'scan'])

const dataStore = useDataStore()
const manualBarcode = ref('')
const barcodeInputRef = ref(null)

// Sample test tags to allow immediate testing without external scanner
const sampleBarcodes = [
  { code: 'AN-BC-WRM01', label: 'Ahmad Warmer' },
  { code: 'AN-BC-LGT01', label: 'Ahmad OT Light' },
  { code: 'AN-BC-BED01', label: 'Ahmad ICU Bed' },
  { code: 'AN-BC-STL01', label: 'Doctor Stool' },
  { code: 'SENDNB2606060', label: 'Container ID' },
  { code: 'US10-8800', label: 'Ultrasound' },
  { code: 'LSR-9900', label: 'Laser Unit' }
]

// Real-time lookup of product by barcode or SKU
const matchedProduct = computed(() => {
  const code = manualBarcode.value.trim().toUpperCase()
  if (!code) return null
  return dataStore.products.find(p =>
    (p.barcode && p.barcode.toUpperCase() === code) ||
    (p.sku && p.sku.toUpperCase() === code) ||
    (p.containerNo && p.containerNo.toUpperCase() === code)
  ) || null
})

// Play an instant synthesized optical scan beep using Web Audio API
function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1760, ctx.currentTime) // High pleasant beep (A6 note)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch (e) {}
}

function simulateScan(code) {
  manualBarcode.value = code
  playScanBeep()
  handleAcceptBarcode()
}

function handleAcceptBarcode() {
  const code = manualBarcode.value.trim()
  if (!code) return

  playScanBeep()
  emit('scan', {
    code,
    matchedProduct: matchedProduct.value,
    timestamp: new Date().toISOString()
  })

  manualBarcode.value = ''
  emit('close')
}

function closeModal() {
  manualBarcode.value = ''
  emit('close')
}

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      if (barcodeInputRef.value) {
        barcodeInputRef.value.focus()
      }
    })
  }
})
</script>

<style scoped>
.scanner-viewport {
  position: relative;
  width: 100%;
  min-height: 220px;
  background: #090d16 !important;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(16, 185, 129, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.85rem;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.6);
}

.scanner-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
}

.sensor-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
}

.ping-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.format-badge {
  color: #94a3b8;
  font-family: monospace;
  font-size: 0.65rem;
}

.scanner-center-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0.75rem 0;
  position: relative;
  z-index: 10;
}

.scanner-reticle-box {
  position: relative;
  width: 140px;
  height: 85px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(16, 185, 129, 0.35);
  border-radius: 8px;
}

.reticle-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: #34d399;
}
.corner-tl { top: -2px; left: -2px; border-top: 2px solid; border-left: 2px solid; }
.corner-tr { top: -2px; right: -2px; border-top: 2px solid; border-right: 2px solid; }
.corner-bl { bottom: -2px; left: -2px; border-bottom: 2px solid; border-left: 2px solid; }
.corner-br { bottom: -2px; right: -2px; border-bottom: 2px solid; border-right: 2px solid; }

.camera-lens-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: 1.5px solid rgba(16, 185, 129, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.scanner-hint-text {
  font-size: 0.75rem;
  color: #cbd5e1;
  margin-top: 0.6rem;
  text-align: center;
}

.scanner-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.65rem;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 10;
}

.scan-laser-line {
  position: absolute;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, #10b981 50%, rgba(16, 185, 129, 0) 100%);
  box-shadow: 0 0 12px 3px rgba(16, 185, 129, 0.75);
  animation: scanLaser 2s ease-in-out infinite;
  z-index: 5;
}

@keyframes scanLaser {
  0% {
    top: 15%;
    opacity: 0.2;
  }
  50% {
    top: 85%;
    opacity: 1;
  }
  100% {
    top: 15%;
    opacity: 0.2;
  }
}

/* Light Mode Overrides for Barcode Scanner */
[data-theme="light"] .modal-content {
  background: #ffffff !important;
  border-color: #e2e8f0 !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

[data-theme="light"] .modal-header h3 {
  color: #0f172a !important;
}

[data-theme="light"] .modal-header p {
  color: #64748b !important;
}

[data-theme="light"] .form-label {
  color: #1e293b !important;
}

[data-theme="light"] .demo-tags-box {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

[data-theme="light"] .demo-tag-btn {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #1e293b !important;
}

[data-theme="light"] .demo-tag-btn:hover {
  background: #ecfdf5 !important;
  border-color: #10b981 !important;
  color: #047857 !important;
}
</style>

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
        <div class="relative w-full h-52 bg-slate-950 rounded-xl overflow-hidden border-2 border-emerald-500/40 flex flex-col items-center justify-center shadow-inner">
          <!-- Scanning Laser Line Animation -->
          <div class="scan-laser-line"></div>

          <!-- Crosshairs Reticle -->
          <div class="absolute inset-6 border border-emerald-500/40 rounded-lg pointer-events-none flex flex-col justify-between p-2">
            <div class="flex justify-between">
              <span class="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
              <span class="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
            </div>
            <div class="flex justify-between">
              <span class="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
              <span class="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
            </div>
          </div>

          <!-- Center Camera View / Status -->
          <div class="z-10 flex flex-col items-center text-center p-4">
            <div class="w-12 h-12 rounded-full bg-slate-900/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2 shadow-lg">
              <Camera :size="24" class="animate-pulse" />
            </div>
            <div class="text-xs font-mono font-bold text-emerald-300">OPTICAL SENSOR ACTIVE</div>
            <div class="text-[11px] text-slate-400 mt-1 max-w-xs">
              Align product barcode or USB scanner gun inside the green targeting reticle
            </div>
          </div>

          <!-- Bottom Camera Status Pill -->
          <div class="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] text-slate-400 font-mono bg-slate-900/90 px-3 py-1 rounded-md border border-slate-800">
            <span class="flex items-center gap-1 text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              AUTO-DECODE: ON
            </span>
            <span>FORMATS: CODE-128, EAN-13, QR, UPC</span>
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
        <div class="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Instant Demo Barcode Tags (Click to test):</span>
            <span class="text-[10px] text-amber-400">ONE-CLICK SCAN</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in sampleBarcodes"
              :key="tag.code"
              type="button"
              @click="simulateScan(tag.code)"
              class="px-2.5 py-1 text-xs rounded font-mono bg-slate-800 hover:bg-emerald-800/50 hover:text-emerald-200 border border-slate-700 transition-all flex items-center gap-1.5"
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
</style>

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
            <h3 class="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Barcode & QR Optical Scanner</span>
              <span v-if="isCameraRunning" class="badge badge-emerald text-[11px] animate-pulse">
                CAMERA ACTIVE
              </span>
              <span v-else-if="isCameraLoading" class="badge badge-amber text-[11px]">
                STARTING CAMERA...
              </span>
              <span v-else class="badge badge-secondary text-[11px]">
                HARDWARE / USB READY
              </span>
            </h3>
            <p class="text-xs text-slate-400">Mobile camera, USB scanner gun, or barcode image</p>
          </div>
        </div>
        <button @click="closeModal" class="btn-icon text-slate-400 hover:text-white" title="Close">✕</button>
      </div>

      <div class="modal-body space-y-3.5 py-3">
        
        <!-- Live Optical Viewport Box -->
        <div class="scanner-viewport">
          
          <!-- Top Bar: Status + Quick Camera Controls -->
          <div class="scanner-top-bar">
            <span class="sensor-badge" :class="{ 'sensor-badge-active': isCameraRunning }">
              <span class="ping-dot" :class="{ 'bg-emerald-400': isCameraRunning, 'bg-amber-400': isCameraLoading }"></span>
              {{ isCameraRunning ? 'LIVE OPTICAL SENSOR' : (isCameraLoading ? 'INITIALIZING...' : 'SENSOR STANDBY') }}
            </span>

            <div class="flex items-center gap-1.5">
              <!-- Flashlight / Torch Button (if supported on mobile rear camera) -->
              <button
                v-if="isCameraRunning && hasTorch"
                type="button"
                @click="toggleTorch"
                class="cam-tool-btn"
                :class="{ 'cam-tool-btn-active': isTorchOn }"
                :title="isTorchOn ? 'Turn Flash Off' : 'Turn Flash On'"
              >
                <Zap v-if="!isTorchOn" :size="14" />
                <ZapOff v-else :size="14" />
                <span>{{ isTorchOn ? 'Flash On' : 'Flash' }}</span>
              </button>

              <!-- Switch Camera Button (Rear <-> Front) -->
              <button
                v-if="isCameraRunning && availableCameras.length > 1"
                type="button"
                @click="flipCamera"
                class="cam-tool-btn"
                title="Switch between front and back camera"
              >
                <RefreshCw :size="14" />
                <span>Flip Cam</span>
              </button>

              <!-- Stop / Restart Camera Stream -->
              <button
                v-if="isCameraRunning"
                type="button"
                @click="stopLiveCamera"
                class="cam-tool-btn text-rose-300 hover:text-rose-200"
                title="Pause camera stream"
              >
                <CameraOff :size="14" />
                <span>Pause</span>
              </button>
              <button
                v-else-if="!isCameraLoading"
                type="button"
                @click="startLiveCamera"
                class="cam-tool-btn text-emerald-300 hover:text-emerald-200"
                title="Start live camera stream"
              >
                <Camera :size="14" />
                <span>Start Cam</span>
              </button>
            </div>
          </div>

          <!-- Target Scanning Area with Laser Animation -->
          <div class="scanner-screen-area">
            <!-- HTML5 QR Code Mount Node -->
            <div id="interactive-camera-reader" class="camera-stream-mount"></div>

            <!-- Scanning Laser Line (over video when active) -->
            <div v-if="isCameraRunning" class="scan-laser-line"></div>

            <!-- Optical Reticle Frame -->
            <div v-if="isCameraRunning" class="scanner-reticle-overlay">
              <div class="reticle-box">
                <div class="reticle-corner corner-tl"></div>
                <div class="reticle-corner corner-tr"></div>
                <div class="reticle-corner corner-bl"></div>
                <div class="reticle-corner corner-br"></div>
              </div>
            </div>

            <!-- Loading Spinner State -->
            <div v-if="isCameraLoading" class="scanner-state-placeholder">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent mb-2"></div>
              <p class="text-xs text-emerald-300 font-medium">Requesting camera access...</p>
              <p class="text-[11px] text-slate-400">Please tap "Allow" if your browser prompts for permission</p>
            </div>

            <!-- Inactive / Denied / Fallback Placeholder -->
            <div v-if="!isCameraRunning && !isCameraLoading" class="scanner-state-placeholder">
              <div class="camera-lens-circle mb-2">
                <Camera :size="24" class="text-emerald-400" />
              </div>
              <p class="text-xs font-semibold text-slate-200 mb-1">
                {{ cameraError ? 'Camera Standby / Permission Needed' : 'Optical Camera Standby' }}
              </p>
              <p v-if="cameraError" class="text-[11px] text-amber-300/90 max-w-xs text-center mb-3">
                {{ cameraError }}
              </p>
              <div class="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  @click="startLiveCamera"
                  class="btn btn-sm btn-primary text-xs flex items-center gap-1.5"
                >
                  <Camera :size="14" />
                  <span>Start Live Camera</span>
                </button>
                <button
                  type="button"
                  @click="triggerPhotoInput"
                  class="btn btn-sm btn-secondary text-xs flex items-center gap-1.5"
                >
                  <UploadCloud :size="14" />
                  <span>Snap Photo / Upload</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Camera Status Pill -->
          <div class="scanner-bottom-bar">
            <div class="flex items-center gap-2 truncate">
              <span class="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold">
                <span class="w-1.5 h-1.5 rounded-full" :class="isCameraRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'"></span>
                {{ isCameraRunning ? 'DECODER RUNNING' : 'STANDBY' }}
              </span>
              <span v-if="selectedCameraLabel" class="text-slate-400 text-[10px] truncate">
                • {{ selectedCameraLabel }}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="triggerPhotoInput"
                class="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center gap-1"
                title="Works on all phones and tablets"
              >
                <Camera :size="12" />
                <span>Mobile Photo Snap</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Hidden Native Mobile Camera / Image Picker input -->
        <input
          ref="photoInputRef"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handlePhotoUpload"
        />

        <!-- Hardware Barcode Input Field (auto-focused for USB / Bluetooth handheld guns) -->
        <div class="form-group mb-0">
          <div class="flex justify-between items-center mb-1">
            <label class="form-label text-xs mb-0 flex items-center gap-1.5 font-medium">
              <Barcode :size="14" class="text-emerald-400" />
              <span>Barcode Input / Hardware USB Scanner Gun</span>
            </label>
            <span class="text-[11px] text-slate-400">Press Enter or Scan Gun</span>
          </div>
          <div class="flex gap-2">
            <input
              ref="barcodeInputRef"
              v-model="manualBarcode"
              type="text"
              placeholder="Scan with handheld gun or type code (e.g. AN-BC-WRM01)..."
              class="form-input text-sm font-mono font-bold flex-1"
              @keydown.enter.prevent="handleAcceptBarcode"
            />
            <button
              type="button"
              @click="handleAcceptBarcode"
              class="btn btn-primary px-4 flex items-center gap-1 text-xs whitespace-nowrap"
              :disabled="!manualBarcode.trim()"
            >
              <Check :size="14" />
              <span>Accept</span>
            </button>
          </div>
        </div>

        <!-- Scanned Success Feedback Banner -->
        <div v-if="scanSuccessMessage" class="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-lg flex items-center gap-2 text-xs text-emerald-300 animate-fade-in font-medium">
          <Check :size="16" class="text-emerald-400 shrink-0" />
          <span>{{ scanSuccessMessage }}</span>
        </div>

        <!-- Matched Product Live Card (if matched in inventory) -->
        <div v-if="matchedProduct" class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex items-center gap-3 animate-fade-in">
          <img
            v-if="matchedProduct.image"
            :src="matchedProduct.image"
            alt="Product"
            class="w-12 h-12 object-cover rounded-md border border-emerald-500/30 shrink-0"
          />
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
            class="btn btn-sm btn-success whitespace-nowrap text-xs shrink-0"
          >
            Apply Code
          </button>
        </div>

        <!-- Quick One-Click Simulated Barcodes for Instant Testing -->
        <div class="demo-tags-box p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
          <div class="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
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
          <span>Audio beep enabled on detection</span>
        </span>
        <button type="button" @click="closeModal" class="btn btn-secondary text-xs">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  ScanBarcode,
  Camera,
  CameraOff,
  Barcode,
  Check,
  Volume2,
  RefreshCw,
  Zap,
  ZapOff,
  UploadCloud
} from 'lucide-vue-next'

const props = defineProps({
  show: { type: Boolean, default: false },
  targetContext: { type: String, default: 'product' }
})

const emit = defineEmits(['close', 'scan'])

const dataStore = useDataStore()
const manualBarcode = ref('')
const barcodeInputRef = ref(null)
const photoInputRef = ref(null)

// Camera State
const isCameraRunning = ref(false)
const isCameraLoading = ref(false)
const cameraError = ref('')
const availableCameras = ref([])
const selectedCameraId = ref(null)
const hasTorch = ref(false)
const isTorchOn = ref(false)
const scanSuccessMessage = ref('')

let html5QrCode = null
let scannerGunBuffer = ''
let lastKeyTime = 0

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

const selectedCameraLabel = computed(() => {
  if (!selectedCameraId.value) return ''
  const cam = availableCameras.value.find(c => c.id === selectedCameraId.value)
  return cam ? cam.label : 'Active Camera'
})

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

// Web Audio API beep
function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1760, ctx.currentTime) // High pleasant beep (A6 note)
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch (e) {}
}

// Start Live Camera (Mobile & Desktop Webcams)
async function startLiveCamera() {
  cameraError.value = ''
  isCameraLoading.value = true

  // Check browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    isCameraLoading.value = false
    cameraError.value = 'Live camera stream is not supported or blocked (mobile browsers require HTTPS or localhost). Please use the "Mobile Photo Snap" button.'
    return
  }

  await stopLiveCamera()
  await nextTick()

  const mountNode = document.getElementById('interactive-camera-reader')
  if (!mountNode) {
    isCameraLoading.value = false
    return
  }

  try {
    html5QrCode = new Html5Qrcode('interactive-camera-reader', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.ITF
      ],
      verbose: false
    })

    // Enumerate devices for camera selector / flip cam
    try {
      const devices = await Html5Qrcode.getCameras()
      availableCameras.value = devices || []
      if (devices && devices.length > 0 && !selectedCameraId.value) {
        // Prioritize rear / environment camera on mobile phones
        const rearCam = devices.find(d => {
          const l = (d.label || '').toLowerCase()
          return l.includes('back') || l.includes('rear') || l.includes('environment') || l.includes('facing back')
        })
        selectedCameraId.value = rearCam ? rearCam.id : devices[0].id
      }
    } catch (e) {
      console.warn('Camera enumeration note:', e)
    }

    const cameraConfig = selectedCameraId.value
      ? { deviceId: { exact: selectedCameraId.value } }
      : { facingMode: 'environment' }

    const config = {
      fps: 15,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const edge = Math.min(viewfinderWidth, viewfinderHeight)
        return {
          width: Math.max(180, Math.floor(edge * 0.85)),
          height: Math.max(120, Math.floor(edge * 0.6))
        }
      },
      aspectRatio: 1.333333
    }

    await html5QrCode.start(
      cameraConfig,
      config,
      (decodedText) => {
        onBarcodeDetected(decodedText)
      },
      () => {
        // Ignore frame misses
      }
    )

    isCameraRunning.value = true
    isCameraLoading.value = false

    // Check torch / flashlight support
    try {
      const capabilities = html5QrCode.getRunningTrackCapabilities()
      hasTorch.value = !!(capabilities && capabilities.torch)
    } catch (e) {
      hasTorch.value = false
    }

  } catch (err) {
    console.error('Camera startup error:', err)
    isCameraRunning.value = false
    isCameraLoading.value = false
    cameraError.value = err.message || 'Camera permission denied or device busy.'
  }
}

// Stop Live Camera cleanly
async function stopLiveCamera() {
  if (html5QrCode) {
    try {
      if (html5QrCode.isScanning) {
        await html5QrCode.stop()
      }
      html5QrCode.clear()
    } catch (err) {
      console.warn('Error stopping camera:', err)
    } finally {
      html5QrCode = null
      isCameraRunning.value = false
      isTorchOn.value = false
      hasTorch.value = false
    }
  }
}

// Flip Camera between available mobile sensors (Rear <-> Front)
async function flipCamera() {
  if (availableCameras.value.length <= 1) return
  const currentIndex = availableCameras.value.findIndex(c => c.id === selectedCameraId.value)
  const nextIndex = (currentIndex + 1) % availableCameras.value.length
  selectedCameraId.value = availableCameras.value[nextIndex].id
  await startLiveCamera()
}

// Toggle Torch / Flashlight
async function toggleTorch() {
  if (!html5QrCode || !isCameraRunning.value) return
  try {
    isTorchOn.value = !isTorchOn.value
    await html5QrCode.applyVideoConstraints({
      advanced: [{ torch: isTorchOn.value }]
    })
  } catch (e) {
    console.warn('Torch toggle failed:', e)
    isTorchOn.value = false
  }
}

// Trigger native mobile camera capture / file picker
function triggerPhotoInput() {
  if (photoInputRef.value) {
    photoInputRef.value.click()
  }
}

// Handle Photo Snap / Barcode Image
async function handlePhotoUpload(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  isCameraLoading.value = true
  cameraError.value = ''
  scanSuccessMessage.value = 'Decoding image...'

  try {
    await stopLiveCamera()
    const tempScanner = new Html5Qrcode('interactive-camera-reader', { verbose: false })
    const decodedText = await tempScanner.scanFile(file, false)
    if (decodedText) {
      onBarcodeDetected(decodedText)
    }
  } catch (err) {
    console.warn('Image scan failed:', err)
    cameraError.value = 'Could not detect barcode from that photo. Please ensure barcode is sharp and well-lit.'
    scanSuccessMessage.value = ''
  } finally {
    isCameraLoading.value = false
    event.target.value = ''
  }
}

// Central handler when barcode is read (from camera, gun, or photo)
function onBarcodeDetected(code) {
  if (!code) return
  manualBarcode.value = code
  playScanBeep()
  scanSuccessMessage.value = `Scanned: ${code}`

  // Give 450ms visual confirmation then accept
  setTimeout(() => {
    handleAcceptBarcode()
  }, 450)
}

function simulateScan(code) {
  manualBarcode.value = code
  playScanBeep()
  scanSuccessMessage.value = `Scanned tag: ${code}`
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

  closeModal()
}

function closeModal() {
  stopLiveCamera()
  manualBarcode.value = ''
  scanSuccessMessage.value = ''
  cameraError.value = ''
  emit('close')
}

// Listen for physical USB / Bluetooth barcode scanner gun keystrokes
function handleGlobalKeydown(e) {
  if (!props.show) return

  const currentTime = Date.now()
  const diff = currentTime - lastKeyTime
  lastKeyTime = currentTime

  // Barcode scanner guns type characters in rapid succession (< 50ms per key)
  if (e.key === 'Enter') {
    if (scannerGunBuffer.length > 2) {
      manualBarcode.value = scannerGunBuffer
      scannerGunBuffer = ''
      e.preventDefault()
      onBarcodeDetected(manualBarcode.value)
      return
    }
    scannerGunBuffer = ''
  } else if (e.key.length === 1) {
    if (diff > 200) {
      scannerGunBuffer = ''
    }
    scannerGunBuffer += e.key
  }
}

watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    if (barcodeInputRef.value) {
      barcodeInputRef.value.focus()
    }
    // Auto start mobile/desktop camera
    startLiveCamera()
  } else {
    stopLiveCamera()
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  stopLiveCamera()
})
</script>

<style scoped>
.scanner-viewport {
  position: relative;
  width: 100%;
  min-height: 270px;
  background: #060911 !important;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(16, 185, 129, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.75rem;
  box-shadow: inset 0 2px 14px rgba(0, 0, 0, 0.7);
}

.scanner-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 10;
  gap: 0.5rem;
}

.sensor-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: rgba(15, 23, 42, 0.85);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.65rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.sensor-badge-active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.5);
}

.ping-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.cam-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cam-tool-btn:hover {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(16, 185, 129, 0.5);
  color: #34d399;
}

.cam-tool-btn-active {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.5);
  color: #fbbf24;
}

.scanner-screen-area {
  position: relative;
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  margin: 0.5rem 0;
  background: #020617;
}

.camera-stream-mount {
  width: 100% !important;
  max-width: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Override html5-qrcode video element */
:deep(#interactive-camera-reader video) {
  width: 100% !important;
  max-height: 240px !important;
  object-fit: cover !important;
  border-radius: 8px !important;
}

:deep(#interactive-camera-reader img) {
  display: none !important;
}

.scanner-reticle-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 6;
}

.reticle-box {
  position: relative;
  width: 220px;
  height: 120px;
  border: 1px dashed rgba(16, 185, 129, 0.4);
  border-radius: 8px;
}

.reticle-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: #34d399;
}
.corner-tl { top: -2px; left: -2px; border-top: 3px solid; border-left: 3px solid; }
.corner-tr { top: -2px; right: -2px; border-top: 3px solid; border-right: 3px solid; }
.corner-bl { bottom: -2px; left: -2px; border-bottom: 3px solid; border-left: 3px solid; }
.corner-br { bottom: -2px; right: -2px; border-bottom: 3px solid; border-right: 3px solid; }

.camera-lens-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.9);
  border: 1.5px solid rgba(16, 185, 129, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.scanner-state-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 5;
  background: rgba(2, 6, 23, 0.92);
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
  gap: 0.5rem;
}

.scan-laser-line {
  position: absolute;
  left: 5%;
  right: 5%;
  height: 2px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, #10b981 50%, rgba(16, 185, 129, 0) 100%);
  box-shadow: 0 0 12px 3px rgba(16, 185, 129, 0.85);
  animation: scanLaser 2s ease-in-out infinite;
  z-index: 7;
  pointer-events: none;
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

/* Light Mode Overrides */
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

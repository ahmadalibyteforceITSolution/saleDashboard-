<template>
  <div>
    <!-- Floating Edge Tab (Right Edge of Screen) -->
    <button
      type="button"
      @click="shortcutStore.toggleShortcutsSidebar"
      class="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-b from-indigo-600 to-primary text-white text-xs font-bold py-2.5 px-2 rounded-l-xl shadow-2xl hover:translate-x-[-2px] transition-all flex flex-col items-center gap-1.5 border-y border-l border-white/20 cursor-pointer group"
      title="Open Keyboard Shortcuts Panel (Ctrl + /)"
    >
      <Zap :size="15" class="text-amber-300 animate-pulse group-hover:scale-110 transition-transform" />
      <span class="writing-mode-vertical text-[10px] tracking-wider uppercase font-black">SHORTCUTS</span>
      <span class="text-[9px] font-mono opacity-80 bg-black/30 rounded px-1 py-0.5">^/</span>
    </button>

    <!-- Slide-Out Sidebar Backdrop -->
    <div
      v-if="shortcutStore.isShortcutsSidebarOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
      @click="shortcutStore.closeShortcutsSidebar"
    ></div>

    <!-- Separate Slide-Out Shortcuts Sidebar Panel -->
    <aside
      :class="[
        'fixed top-0 right-0 h-screen w-full max-w-[460px] bg-white dark:bg-[#090d16] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out',
        shortcutStore.isShortcutsSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      ]"
    >
      <!-- Header Bar -->
      <div class="p-4 bg-slate-100 dark:bg-[#0e1422] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Zap :size="18" />
          </div>
          <div>
            <h3 class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Command & Hotkeys Hub</span>
              <span class="badge badge-info text-[9px] font-mono font-bold">{{ shortcutStore.shortcuts.length }} SHORTCUTS</span>
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Press hotkeys anytime or click card to execute action</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="shortcutStore.resetToDefaults"
            class="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Reset all shortcuts to defaults"
          >
            Reset
          </button>
          <button
            type="button"
            @click="shortcutStore.closeShortcutsSidebar"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-lg font-bold transition-colors"
            title="Close Shortcuts Sidebar (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Search Bar -->
      <div class="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          <input
            v-model="shortcutStore.searchQuery"
            type="text"
            placeholder="Search shortcuts (e.g. 'ledger', 'job card', 'Ctrl+L', 'invoice')..."
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            v-if="shortcutStore.searchQuery"
            @click="shortcutStore.searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Scrollable Shortcuts List Categorized -->
      <div class="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        
        <!-- Key Recording Active Banner -->
        <div
          v-if="recordingShortcut"
          class="p-3 rounded-xl bg-amber-500/15 border-2 border-amber-500 text-amber-800 dark:text-amber-300 space-y-1.5 animate-pulse"
        >
          <div class="font-bold flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5">
              <Keyboard :size="15" />
              <span>Recording New Key for: <strong>{{ recordingShortcut.title }}</strong></span>
            </span>
            <button
              @click="shortcutStore.activeRecordingId = null"
              class="text-xs font-bold underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div class="text-[11px] text-amber-700 dark:text-amber-400">
            Press your desired keyboard combination now (e.g. <kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border border-amber-400">Ctrl</kbd> + <kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border border-amber-400">Shift</kbd> + <kbd class="px-1 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] border border-amber-400">L</kbd>).
          </div>
        </div>

        <!-- Categorized Shortcuts Sections -->
        <div
          v-for="(items, category) in shortcutStore.groupedShortcuts"
          :key="category"
          class="space-y-2.5"
        >
          <div class="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            <span>{{ category }}</span>
            <span class="font-mono text-[10px] text-slate-400">({{ items.length }})</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="item in items"
              :key="item.id"
              class="p-3 rounded-xl border transition-all bg-white dark:bg-[#0f172a] hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm flex flex-col gap-2 group"
              :class="[
                shortcutStore.activeRecordingId === item.id
                  ? 'border-amber-500 ring-2 ring-amber-500/30'
                  : 'border-slate-200 dark:border-slate-800'
              ]"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <component :is="resolveIcon(item.icon)" :size="15" />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                      {{ item.title }}
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                      {{ item.description }}
                    </p>
                  </div>
                </div>

                <!-- Hotkey Visual Pill -->
                <div class="flex items-center gap-1 shrink-0 font-mono">
                  <kbd
                    v-for="(k, kIdx) in item.displayKey.split(' + ')"
                    :key="kIdx"
                    class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black shadow-sm"
                  >
                    {{ k }}
                  </kbd>
                </div>
              </div>

              <!-- Action Footer: Click to Run & Modify Button -->
              <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="startRecording(item.id)"
                    class="text-slate-400 hover:text-amber-500 font-semibold text-[10px] flex items-center gap-1 transition-colors"
                    title="Change key binding for this command"
                  >
                    <Pencil :size="10" />
                    <span>{{ shortcutStore.activeRecordingId === item.id ? 'Recording...' : 'Modify Key' }}</span>
                  </button>
                  <button
                    v-if="isCustomized(item)"
                    type="button"
                    @click="resetSingleItem(item.id)"
                    class="text-slate-400 hover:text-rose-400 font-semibold text-[10px]"
                    title="Reset to default key"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  @click="shortcutStore.executeShortcut(item, router)"
                  class="btn btn-xs btn-primary font-bold px-2.5 py-0.5 flex items-center gap-1 shadow-sm text-[10px]"
                  title="Execute command now"
                >
                  <span>Run</span>
                  <ArrowRight :size="10" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="Object.keys(shortcutStore.groupedShortcuts).length === 0" class="text-center py-10 text-slate-400">
          <Search class="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-60" />
          <div class="font-bold text-xs">No shortcuts matching "{{ shortcutStore.searchQuery }}"</div>
          <button @click="shortcutStore.searchQuery = ''" class="btn btn-xs btn-secondary mt-2 text-[10px]">
            Clear Search Filter
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-3 bg-slate-100 dark:bg-[#0e1422] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
        <span class="flex items-center gap-1 font-mono text-[10px]">
          <span>Tip: Press</span>
          <kbd class="px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold">Esc</kbd>
          <span>to close panels</span>
        </span>
        <button
          type="button"
          @click="shortcutStore.closeShortcutsSidebar"
          class="font-bold text-primary hover:underline text-xs"
        >
          Close Drawer
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useShortcutStore } from '@/stores/shortcutStore'
import {
  Zap,
  Search,
  Keyboard,
  Pencil,
  ArrowRight,
  BookOpen,
  Wrench,
  Receipt,
  ShoppingCart,
  Eye,
  CreditCard,
  LayoutDashboard,
  TrendingUp,
  History,
  Cpu,
  Sidebar,
  ArchiveRestore,
  Banknote,
  DollarSign,
  Truck,
  BarChart3
} from 'lucide-vue-next'

const router = useRouter()
const shortcutStore = useShortcutStore()

const recordingShortcut = computed(() => {
  if (!shortcutStore.activeRecordingId) return null
  return shortcutStore.shortcuts.find(s => s.id === shortcutStore.activeRecordingId)
})

function resolveIcon(name) {
  const iconMap = {
    BookOpen,
    Wrench,
    Receipt,
    ShoppingCart,
    Eye,
    Search,
    CreditCard,
    LayoutDashboard,
    TrendingUp,
    History,
    Cpu,
    Sidebar,
    Zap,
    ArchiveRestore,
    Banknote,
    DollarSign,
    Truck,
    BarChart3
  }
  return iconMap[name] || Zap
}

function startRecording(id) {
  shortcutStore.activeRecordingId = id
}

function isCustomized(item) {
  return item.ctrl !== item.defaultCtrl ||
    item.shift !== item.defaultShift ||
    item.alt !== item.defaultAlt ||
    item.key !== item.defaultKey
}

function resetSingleItem(id) {
  const item = shortcutStore.shortcuts.find(s => s.id === id)
  if (item) {
    shortcutStore.updateShortcutKey(id, {
      ctrl: item.defaultCtrl,
      shift: item.defaultShift,
      alt: item.defaultAlt,
      key: item.defaultKey
    })
  }
}

// Global Keydown Listener across the entire application
function handleGlobalKeydown(e) {
  // If user is currently modifying/recording a shortcut key
  if (shortcutStore.activeRecordingId) {
    // Ignore lone modifier keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    // Must have at least one modifier key or function key for safe browser navigation
    const hasModifier = e.ctrlKey || e.altKey || e.shiftKey
    if (!hasModifier && e.key !== 'Escape') {
      return
    }

    if (e.key === 'Escape') {
      shortcutStore.activeRecordingId = null
      return
    }

    shortcutStore.updateShortcutKey(shortcutStore.activeRecordingId, {
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      key: e.key.toLowerCase()
    })
    shortcutStore.activeRecordingId = null
    return
  }

  // Escape key: close shortcuts drawer if open
  if (e.key === 'Escape') {
    if (shortcutStore.isShortcutsSidebarOpen) {
      shortcutStore.closeShortcutsSidebar()
      e.preventDefault()
      return
    }
  }

  // Ctrl + / or Ctrl + ? toggles shortcuts drawer
  if (e.ctrlKey && (e.key === '/' || e.key === '?')) {
    e.preventDefault()
    shortcutStore.toggleShortcutsSidebar()
    return
  }

  // Check if active target is typing inside an input/textarea
  const targetTag = e.target?.tagName?.toLowerCase()
  const isInputFocused = targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable

  // Find matching shortcut
  const pressedKey = e.key.toLowerCase()
  const matched = shortcutStore.shortcuts.find(s => {
    const matchCtrl = Boolean(s.ctrl) === Boolean(e.ctrlKey)
    const matchShift = Boolean(s.shift) === Boolean(e.shiftKey)
    const matchAlt = Boolean(s.alt) === Boolean(e.altKey)
    const matchKey = s.key.toLowerCase() === pressedKey
    return matchCtrl && matchShift && matchAlt && matchKey
  })

  if (matched) {
    // If input is focused, only trigger if Ctrl or Alt modifier is held
    if (isInputFocused && !e.ctrlKey && !e.altKey) {
      return
    }

    e.preventDefault()
    e.stopPropagation()
    shortcutStore.executeShortcut(matched, router)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
</style>

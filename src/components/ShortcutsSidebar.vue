<template>
  <Teleport to="body">
    <!-- Floating Edge Tab (Right Edge of Screen) -->
    <button
      type="button"
      @click="shortcutStore.toggleShortcutsSidebar"
      class="shortcuts-floating-trigger"
      title="Open Keyboard Shortcuts Panel (Ctrl + /)"
    >
      <Zap :size="15" class="floating-icon" />
      <span class="floating-text">SHORTCUTS</span>
      <span class="floating-badge">^/</span>
    </button>

    <!-- Slide-Out Sidebar Backdrop -->
    <transition name="fade">
      <div
        v-if="shortcutStore.isShortcutsSidebarOpen"
        class="shortcuts-backdrop"
        @click="shortcutStore.closeShortcutsSidebar"
      ></div>
    </transition>

    <!-- Separate Slide-Out Shortcuts Sidebar Panel -->
    <aside
      class="shortcuts-drawer"
      :class="{ 'open': shortcutStore.isShortcutsSidebarOpen }"
      aria-label="Keyboard Shortcuts & Command Hub"
    >
      <!-- Header Bar -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="header-icon-box">
            <Zap :size="18" />
          </div>
          <div>
            <div class="header-title-row">
              <h3 class="header-title">Command & Hotkeys Hub</h3>
              <span class="badge badge-info text-[9px] font-mono">{{ shortcutStore.shortcuts.length }} SHORTCUTS</span>
            </div>
            <p class="header-subtitle">Press hotkeys anytime or click Run to trigger</p>
          </div>
        </div>

        <div class="header-actions">
          <button
            type="button"
            @click="shortcutStore.resetToDefaults"
            class="btn-reset"
            title="Reset all shortcuts to factory defaults"
          >
            Reset
          </button>
          <button
            type="button"
            @click="shortcutStore.closeShortcutsSidebar"
            class="btn-close"
            title="Close Shortcuts Sidebar (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Quick Search Bar -->
      <div class="drawer-search">
        <div class="search-input-wrap">
          <Search class="search-icon" :size="14" />
          <input
            v-model="shortcutStore.searchQuery"
            type="text"
            placeholder="Search shortcuts (e.g. 'ledger', 'job card', 'Ctrl+L')..."
            class="search-input"
          />
          <button
            v-if="shortcutStore.searchQuery"
            @click="shortcutStore.searchQuery = ''"
            class="search-clear-btn"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Scrollable Shortcuts List Categorized -->
      <div class="drawer-body">
        <!-- Key Recording Active Banner -->
        <div v-if="recordingShortcut" class="recording-banner">
          <div class="recording-banner-top">
            <span class="recording-label">
              <Keyboard :size="15" />
              <span>Recording New Key for: <strong>{{ recordingShortcut.title }}</strong></span>
            </span>
            <button
              type="button"
              @click="shortcutStore.activeRecordingId = null"
              class="recording-cancel-btn"
            >
              Cancel
            </button>
          </div>
          <div class="recording-hint">
            Press your desired keyboard combo now (e.g. <kbd class="kbd-pill">Ctrl</kbd> + <kbd class="kbd-pill">Shift</kbd> + <kbd class="kbd-pill">L</kbd>).
          </div>
        </div>

        <!-- Categorized Shortcuts Sections -->
        <div
          v-for="(items, category) in shortcutStore.groupedShortcuts"
          :key="category"
          class="category-group"
        >
          <div class="category-header">
            <span class="category-title">{{ category }}</span>
            <span class="category-count">({{ items.length }})</span>
          </div>

          <div class="cards-list">
            <div
              v-for="item in items"
              :key="item.id"
              class="shortcut-card"
              :class="{ 'recording': shortcutStore.activeRecordingId === item.id }"
            >
              <div class="card-main">
                <div class="card-left">
                  <div class="card-icon-wrap">
                    <component :is="resolveIcon(item.icon)" :size="15" />
                  </div>
                  <div class="card-text">
                    <h4 class="card-title">{{ item.title }}</h4>
                    <p class="card-desc">{{ item.description }}</p>
                  </div>
                </div>

                <!-- Hotkey Visual Pill -->
                <div class="card-keys">
                  <kbd
                    v-for="(k, kIdx) in item.displayKey.split(' + ')"
                    :key="kIdx"
                    class="key-pill"
                  >
                    {{ k }}
                  </kbd>
                </div>
              </div>

              <!-- Action Footer: Click to Run & Modify Button -->
              <div class="card-footer">
                <div class="footer-left">
                  <button
                    type="button"
                    @click="startRecording(item.id)"
                    class="btn-modify"
                    title="Change key binding for this command"
                  >
                    <Pencil :size="10" />
                    <span>{{ shortcutStore.activeRecordingId === item.id ? 'Recording...' : 'Modify Key' }}</span>
                  </button>
                  <button
                    v-if="isCustomized(item)"
                    type="button"
                    @click="resetSingleItem(item.id)"
                    class="btn-single-reset"
                    title="Reset to default key"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  @click="shortcutStore.executeShortcut(item, router)"
                  class="btn-run"
                  title="Execute command immediately"
                >
                  <span>Run</span>
                  <ArrowRight :size="10" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="Object.keys(shortcutStore.groupedShortcuts).length === 0" class="empty-state">
          <Search class="empty-icon" :size="32" />
          <div class="empty-title">No shortcuts matching "{{ shortcutStore.searchQuery }}"</div>
          <button @click="shortcutStore.searchQuery = ''" class="btn btn-secondary text-xs mt-2">
            Clear Search
          </button>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="drawer-footer">
        <span class="footer-tip">
          <span>Tip: Press</span>
          <kbd class="key-pill">Esc</kbd>
          <span>to close panels</span>
        </span>
        <button
          type="button"
          @click="shortcutStore.closeShortcutsSidebar"
          class="btn-close-drawer"
        >
          Close Drawer
        </button>
      </div>
    </aside>
  </Teleport>
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
/* Floating Right Edge Tab */
.shortcuts-floating-trigger {
  position: fixed !important;
  right: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  z-index: 99990 !important;
  background: linear-gradient(135deg, #147d8e, #0284c7) !important;
  color: #ffffff !important;
  padding: 10px 7px !important;
  border-top-left-radius: 12px !important;
  border-bottom-left-radius: 12px !important;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.35) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-right: none !important;
  transition: transform 0.15s ease, background 0.2s ease !important;
}

.shortcuts-floating-trigger:hover {
  transform: translateY(-50%) translateX(-3px) !important;
  background: linear-gradient(135deg, #0f6674, #0369a1) !important;
}

.floating-icon {
  color: #fbbf24;
}

.floating-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 900;
  text-transform: uppercase;
}

.floating-badge {
  font-family: var(--font-mono, monospace);
  font-size: 9px;
  background: rgba(0, 0, 0, 0.35);
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: bold;
}

/* Backdrop */
.shortcuts-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(11, 15, 25, 0.65) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  z-index: 99998 !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-Out Drawer Panel */
.shortcuts-drawer {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 440px !important;
  max-width: 92vw !important;
  height: 100vh !important;
  background: #111827 !important;
  color: #f8fafc !important;
  z-index: 99999 !important;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.5) !important;
  transform: translateX(100%) !important;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  border-left: 1px solid rgba(255, 255, 255, 0.1) !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

[data-theme="light"] .shortcuts-drawer {
  background: #ffffff !important;
  color: #0f172a !important;
  border-left-color: rgba(15, 23, 42, 0.12) !important;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.15) !important;
}

.shortcuts-drawer.open {
  transform: translateX(0) !important;
  visibility: visible !important;
  pointer-events: auto !important;
}

/* Drawer Header */
.drawer-header {
  padding: 16px !important;
  background: #0b0f19 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
}

[data-theme="light"] .drawer-header {
  background: #f8fafc !important;
  border-bottom-color: rgba(15, 23, 42, 0.08) !important;
}

.header-left {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.header-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(20, 125, 142, 0.2);
  color: #147d8e;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(20, 125, 142, 0.35);
}

.header-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 14px;
  font-weight: 800;
  margin: 0;
  color: inherit;
}

.header-subtitle {
  font-size: 11px;
  margin: 2px 0 0 0;
  opacity: 0.65;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-reset {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.15s, background 0.15s;
}

[data-theme="light"] .btn-reset {
  border-color: rgba(15, 23, 42, 0.15);
}

.btn-reset:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  padding: 4px 6px;
  border-radius: 6px;
  transition: opacity 0.15s;
}

.btn-close:hover {
  opacity: 1;
}

/* Search Bar */
.drawer-search {
  padding: 10px 16px !important;
  background: #0e1422 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  flex-shrink: 0 !important;
}

[data-theme="light"] .drawer-search {
  background: #f1f5f9 !important;
  border-bottom-color: rgba(15, 23, 42, 0.08) !important;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 28px 7px 32px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: #090d16;
  color: #ffffff;
  outline: none;
  transition: border-color 0.2s;
}

[data-theme="light"] .search-input {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.15);
}

.search-input:focus {
  border-color: #147d8e;
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 12px;
}

/* Scrollable Body */
.drawer-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 16px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 20px !important;
}

/* Recording Banner */
.recording-banner {
  padding: 12px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.12);
  border: 2px solid #f59e0b;
  color: #fbbf24;
}

.recording-banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: bold;
}

.recording-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.recording-cancel-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 11px;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

.recording-hint {
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.9;
}

/* Category Sections */
.category-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.65;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 4px;
}

[data-theme="light"] .category-header {
  border-bottom-color: rgba(15, 23, 42, 0.08);
}

.category-count {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Shortcut Card */
.shortcut-card {
  padding: 12px !important;
  border-radius: 10px !important;
  background: #162032 !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  transition: border-color 0.15s ease, background 0.15s ease !important;
}

[data-theme="light"] .shortcut-card {
  background: #f8fafc !important;
  border-color: rgba(15, 23, 42, 0.08) !important;
}

.shortcut-card:hover {
  border-color: rgba(20, 125, 142, 0.5) !important;
}

.shortcut-card.recording {
  border-color: #f59e0b !important;
  background: rgba(245, 158, 11, 0.08) !important;
}

.card-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.card-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(20, 125, 142, 0.15);
  color: #147d8e;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.card-text {
  min-width: 0;
}

.card-title {
  font-size: 12px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: inherit;
}

.card-desc {
  font-size: 11px;
  margin: 2px 0 0 0;
  opacity: 0.65;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.card-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.key-pill {
  display: inline-block;
  padding: 3px 6px;
  font-size: 10px;
  font-weight: 800;
  font-family: var(--font-mono, monospace);
  background: #0b0f19;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .key-pill {
  background: #ffffff;
  color: #0f172a;
  border-color: rgba(15, 23, 42, 0.18);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

[data-theme="light"] .card-footer {
  border-top-color: rgba(15, 23, 42, 0.06);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-modify {
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.15s;
}

.btn-modify:hover {
  color: #f59e0b;
}

.btn-single-reset {
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 600;
  color: #f87171;
  cursor: pointer;
}

.btn-run {
  background: #147d8e;
  color: #ffffff;
  border: none;
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background 0.15s ease;
}

.btn-run:hover {
  background: #0f6674;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 10px;
  opacity: 0.65;
}

.empty-icon {
  margin: 0 auto 10px auto;
  display: block;
}

.empty-title {
  font-size: 12px;
  font-weight: bold;
}

/* Drawer Footer */
.drawer-footer {
  padding: 12px 16px !important;
  background: #0b0f19 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  flex-shrink: 0 !important;
  font-size: 11px !important;
}

[data-theme="light"] .drawer-footer {
  background: #f8fafc !important;
  border-top-color: rgba(15, 23, 42, 0.08) !important;
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.7;
}

.btn-close-drawer {
  background: transparent;
  border: none;
  color: #147d8e;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.btn-close-drawer:hover {
  text-decoration: underline;
}
</style>

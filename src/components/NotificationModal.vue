<template>
  <Teleport to="body">
    <!-- Global Modal Popup Dialog -->
    <div
      v-if="uiStore.modal.show"
      class="fixed inset-0 z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-150"
      style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 999999 !important; background-color: rgba(15, 23, 42, 0.7) !important; backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important; display: flex !important; align-items: center !important; justify-content: center !important;"
      @click.self="uiStore.closeModal"
    >
      <div
        class="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150 relative"
        style="width: 92% !important; max-width: 460px !important; margin: auto !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;"
      >
        <!-- Modal Header -->
        <div class="px-5 py-4 bg-slate-50 dark:bg-[#090d16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <ShieldAlert v-if="uiStore.modal.type === 'danger'" :size="20" class="text-rose-500 shrink-0" />
            <AlertTriangle v-else-if="uiStore.modal.type === 'warning'" :size="20" class="text-amber-500 shrink-0" />
            <CheckCircle2 v-else-if="uiStore.modal.type === 'success'" :size="20" class="text-emerald-500 shrink-0" />
            <Info v-else :size="20" class="text-sky-500 shrink-0" />
            <h3 class="font-bold text-base text-slate-900 dark:text-white leading-tight">{{ uiStore.modal.title }}</h3>
          </div>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg p-1 transition-colors" @click="uiStore.closeModal">&times;</button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm leading-relaxed space-y-3">
          <p class="text-slate-800 dark:text-slate-200">{{ uiStore.modal.message }}</p>

          <!-- Input field for prompt dialogs -->
          <div v-if="uiStore.modal.isPrompt" class="mt-3">
            <input
              v-model="uiStore.modal.promptValue"
              type="text"
              class="w-full rounded-lg px-3.5 py-2.5 bg-slate-50 dark:bg-[#1e293b] text-slate-900 dark:text-white font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              :placeholder="uiStore.modal.promptPlaceholder || 'Type here...'"
              autofocus
              @keydown.enter.prevent="uiStore.handleModalConfirm"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-3.5 bg-slate-50 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            v-if="uiStore.modal.isPrompt || uiStore.modal.isConfirm"
            type="button"
            class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors"
            @click="uiStore.handleModalCancel"
          >
            {{ uiStore.modal.cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            :class="[
              'px-5 py-2 rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer',
              uiStore.modal.type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : uiStore.modal.type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            ]"
            @click="uiStore.modal.isPrompt || uiStore.modal.isConfirm ? uiStore.handleModalConfirm() : uiStore.closeModal()"
          >
            {{ uiStore.modal.confirmText || 'Understand' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Toast Notification -->
    <div
      v-if="uiStore.toast.show"
      :class="['toast-notification', `toast-${uiStore.toast.type}`, 'glass-panel']"
      style="z-index: 999999 !important;"
    >
      <CheckCircle2 v-if="uiStore.toast.type === 'success'" :size="18" class="text-success" />
      <AlertTriangle v-else-if="uiStore.toast.type === 'warning'" :size="18" class="text-warning" />
      <Info v-else :size="18" class="text-info" />
      <span class="font-semibold text-sm">{{ uiStore.toast.message }}</span>
    </div>
  </Teleport>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
import { ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<style scoped>
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 999999 !important;
  animation: toastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>

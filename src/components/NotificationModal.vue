<template>
  <div>
    <!-- Global Modal Popup Dialog -->
    <div v-if="uiStore.modal.show" class="modal-backdrop" @click.self="uiStore.closeModal">
      <div class="modal-content notification-modal-box">
        <div class="modal-header">
          <div class="flex-align gap-2">
            <ShieldAlert v-if="uiStore.modal.type === 'danger'" :size="22" class="text-danger" />
            <AlertTriangle v-else-if="uiStore.modal.type === 'warning'" :size="22" class="text-warning" />
            <CheckCircle2 v-else-if="uiStore.modal.type === 'success'" :size="22" class="text-success" />
            <Info v-else :size="22" class="text-info" />
            <h3 class="font-bold text-lg text-main">{{ uiStore.modal.title }}</h3>
          </div>
          <button class="btn btn-ghost btn-sm" @click="uiStore.closeModal">&times;</button>
        </div>

        <div class="modal-body text-muted font-medium text-sm leading-relaxed space-y-3">
          <p>{{ uiStore.modal.message }}</p>

          <!-- Input field for prompt dialogs -->
          <div v-if="uiStore.modal.isPrompt" class="mt-2">
            <input
              v-model="uiStore.modal.promptValue"
              type="text"
              class="form-input w-full font-medium"
              :placeholder="uiStore.modal.promptPlaceholder || 'Type here...'"
              autofocus
              @keydown.enter.prevent="uiStore.handleModalConfirm"
            />
          </div>
        </div>

        <div class="modal-footer flex items-center justify-end gap-2">
          <button
            v-if="uiStore.modal.isPrompt || uiStore.modal.isConfirm"
            type="button"
            class="btn btn-secondary"
            @click="uiStore.handleModalCancel"
          >
            {{ uiStore.modal.cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            :class="['btn', `btn-${uiStore.modal.type === 'danger' ? 'danger' : uiStore.modal.type === 'warning' ? 'warning' : 'primary'}`]"
            @click="uiStore.modal.isPrompt || uiStore.modal.isConfirm ? uiStore.handleModalConfirm() : uiStore.closeModal()"
          >
            {{ uiStore.modal.confirmText || 'OK' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Floating Toast Notification -->
    <div v-if="uiStore.toast.show" :class="['toast-notification', `toast-${uiStore.toast.type}`, 'glass-panel']">
      <CheckCircle2 v-if="uiStore.toast.type === 'success'" :size="18" class="text-success" />
      <AlertTriangle v-else-if="uiStore.toast.type === 'warning'" :size="18" class="text-warning" />
      <Info v-else :size="18" class="text-info" />
      <span class="font-semibold text-sm">{{ uiStore.toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
import { ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<style scoped>
.notification-modal-box {
  max-width: 480px;
}

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
  z-index: 2000;
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

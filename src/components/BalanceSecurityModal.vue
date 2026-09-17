<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content security-modal max-w-md animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="security-icon-badge">
            <Lock :size="18" />
          </div>
          <div>
            <h3 class="text-base font-bold text-main leading-tight">Financial Balance Security</h3>
            <p class="text-xs text-subtle mt-0.5">Authentication required to reveal financial figures</p>
          </div>
        </div>
        <button @click="closeModal" class="btn-close-modal" title="Close">✕</button>
      </div>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerify" class="m-0">
        <div class="modal-body p-5 space-y-4">
          <!-- Security Notice -->
          <div class="security-notice-box">
            <ShieldAlert :size="16" class="text-amber-500 shrink-0 mt-0.5" />
            <div class="text-xs text-slate-300 dark-text-notice">
              Sensitive ledger and balance figures are masked. Enter your account password to verify your identity.
            </div>
          </div>

          <!-- Active Account Card (Strict 38px Avatar) -->
          <div class="account-card flex items-center justify-between p-3 rounded-xl border">
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="authStore.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'"
                alt="User Avatar"
                class="security-user-avatar"
              />
              <div class="min-w-0">
                <div class="text-xs font-bold text-main truncate">{{ authStore.user?.name || 'Authorized User' }}</div>
                <div class="text-[11px] text-subtle font-mono truncate">{{ authStore.user?.email || 'user@nexis.com' }}</div>
              </div>
            </div>
            <span class="badge badge-purple text-[10px] font-mono shrink-0 font-bold uppercase ml-2">
              {{ (authStore.user?.role || 'accountant').toUpperCase() }} (L{{ authStore.roleLevel }})
            </span>
          </div>

          <!-- Password Field -->
          <div class="form-group space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="form-label text-xs font-bold mb-0">Dashboard Password *</label>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye v-if="!showPassword" :size="12" />
                <EyeOff v-else :size="12" />
                <span>{{ showPassword ? 'Hide' : 'Show' }}</span>
              </button>
            </div>

            <div class="relative">
              <input
                ref="passwordInputRef"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password..."
                required
                class="form-input text-sm pr-10 font-bold"
                :class="{ 'border-red-500': errorMessage }"
              />
              <KeyRound :size="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <p v-if="errorMessage" class="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
              <AlertCircle :size="12" />
              <span>{{ errorMessage }}</span>
            </p>
            <p v-else class="text-[11px] text-slate-400 mt-1">
              Demo access: Enter your account password or 'admin123' / 'superadmin123'.
            </p>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer flex items-center justify-end gap-2.5 p-4 border-t">
          <button type="button" @click="closeModal" class="btn btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !password.trim()"
            class="btn btn-primary text-xs flex items-center gap-1.5 font-bold"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <Unlock v-else :size="14" />
            <span>{{ isSubmitting ? 'Verifying...' : 'Unlock & Show Balances' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Lock, Unlock, ShieldAlert, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'unlocked'])

const authStore = useAuthStore()

const isOpen = ref(props.modelValue)
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)
const passwordInputRef = ref(null)

watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    password.value = ''
    errorMessage.value = ''
    showPassword.value = false
    nextTick(() => {
      passwordInputRef.value?.focus()
    })
  }
})

function closeModal() {
  isOpen.value = false
  emit('update:modelValue', false)
  authStore.showBalanceModal = false
}

async function handleVerify() {
  if (!password.value.trim()) return

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const success = await authStore.verifyDashboardPassword(password.value)
    if (success) {
      closeModal()
      emit('unlocked')
    } else {
      errorMessage.value = 'Incorrect dashboard login password.'
    }
  } catch (err) {
    errorMessage.value = err.message || 'Incorrect dashboard login password.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.security-modal {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.security-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.btn-close-modal:hover {
  background: var(--bg-input);
  color: var(--text-main);
}

.security-notice-box {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.account-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.security-user-avatar {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  border-radius: 9999px !important;
  object-fit: cover !important;
  border: 2px solid var(--primary) !important;
  flex-shrink: 0 !important;
  display: block !important;
}

/* Light Mode Overrides */
[data-theme="light"] .security-notice-box {
  background: #fffbeb !important;
  border-color: #fde68a !important;
}

[data-theme="light"] .dark-text-notice {
  color: #92400e !important;
}

[data-theme="light"] .account-card {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}
</style>

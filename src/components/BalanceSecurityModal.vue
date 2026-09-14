<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-md animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lock :size="20" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white leading-snug">Financial Balance Security</h3>
            <p class="text-xs text-slate-400">Dashboard authentication required</p>
          </div>
        </div>
        <button @click="closeModal" class="btn btn-ghost text-slate-400 hover:text-white p-2">✕</button>
      </div>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerify" class="m-0">
        <div class="modal-body space-y-4">
          <!-- Security Notice -->
          <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
            <ShieldAlert :size="16" class="shrink-0 mt-0.5" />
            <div>
              Customer financial figures and balance amounts are masked for privacy. Enter your dashboard login password to reveal.
            </div>
          </div>

          <!-- Active Account Card -->
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img
                :src="authStore.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'"
                alt="User Avatar"
                class="w-9 h-9 rounded-full object-cover border border-slate-600"
              />
              <div>
                <div class="text-xs font-bold text-white">{{ authStore.user?.name || 'Authorized Admin' }}</div>
                <div class="text-xs text-slate-400 font-mono">{{ authStore.user?.email || 'admin@nexis.com' }}</div>
              </div>
            </div>
            <span class="badge badge-purple text-[10px] uppercase font-bold tracking-wider">
              {{ authStore.user?.role || 'Admin' }}
            </span>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label class="form-label flex items-center justify-between">
              <span>Dashboard Password *</span>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                <Eye v-if="!showPassword" :size="12" />
                <EyeOff v-else :size="12" />
                <span>{{ showPassword ? 'Hide' : 'Show' }}</span>
              </button>
            </label>
            <div class="relative">
              <input
                ref="passwordInputRef"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter dashboard login password..."
                required
                class="form-input text-sm pr-10"
                :class="{ 'border-red-500': errorMessage }"
              />
              <KeyRound :size="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
            <p v-if="errorMessage" class="text-xs text-red-400 flex items-center gap-1 mt-1">
              <AlertCircle :size="12" />
              <span>{{ errorMessage }}</span>
            </p>
            <p v-else class="text-[11px] text-slate-500 mt-1">
              Demo access: Enter your account password or 'admin123' / 'superadmin123'.
            </p>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer flex items-center justify-end gap-3 p-4 border-t border-slate-700/60">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !password.trim()"
            class="btn btn-success flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <Unlock v-else :size="16" />
            <span>{{ isSubmitting ? 'Verifying...' : 'Unlock & Show Balance' }}</span>
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

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content max-w-lg animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <UserCog :size="18" />
          </div>
          <div>
            <h3 class="text-base font-bold text-main leading-tight">Edit Officer Profile</h3>
            <p class="text-xs text-subtle mt-0.5">Update your account credentials and system identity</p>
          </div>
        </div>
        <button @click="closeModal" class="btn-close-modal" title="Close">✕</button>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="handleSubmit" class="m-0">
        <div class="modal-body p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <!-- Active Role Banner -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div class="flex items-center gap-3">
              <img
                :src="form.avatar || authStore.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'"
                alt="Avatar"
                class="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shadow-sm"
              />
              <div>
                <div class="text-sm font-bold text-main">{{ form.name || authStore.user?.name || 'Authorized Officer' }}</div>
                <div class="text-xs text-subtle font-mono">{{ authStore.user?.email || 'officer@nexis.com' }}</div>
              </div>
            </div>
            <span :class="['badge font-bold text-[11px] uppercase tracking-wider', `badge-${authStore.user?.badgeColor || 'purple'}`]">
              {{ (authStore.user?.role || 'superadmin').toUpperCase() }} (L{{ authStore.roleLevel }})
            </span>
          </div>

          <!-- Basic Info Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="form-group space-y-1">
              <label class="form-label text-xs font-bold mb-0">Full Name *</label>
              <div class="relative">
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Officer Name"
                  class="form-input text-xs pl-8 font-medium"
                />
                <User :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div class="form-group space-y-1">
              <label class="form-label text-xs font-bold mb-0">Job Title / Designation</label>
              <div class="relative">
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Chief Operations Officer"
                  class="form-input text-xs pl-8 font-medium"
                />
                <Briefcase :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          <!-- Avatar Selection & URL -->
          <div class="form-group space-y-2">
            <label class="form-label text-xs font-bold mb-0">Profile Avatar</label>
            <div class="relative">
              <input
                v-model="form.avatar"
                type="url"
                placeholder="https://images.unsplash.com/..."
                class="form-input text-xs pl-8 font-mono"
              />
              <ImageIcon :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <!-- Avatar Quick Presets -->
            <div class="flex items-center gap-2 pt-1">
              <span class="text-[11px] text-subtle font-semibold">Presets:</span>
              <div class="flex items-center gap-2">
                <button
                  v-for="(preset, idx) in avatarPresets"
                  :key="idx"
                  type="button"
                  @click="form.avatar = preset"
                  class="w-7 h-7 rounded-full overflow-hidden border-2 transition-all hover:scale-110"
                  :class="form.avatar === preset ? 'border-primary ring-2 ring-primary/30' : 'border-slate-700 opacity-70 hover:opacity-100'"
                >
                  <img :src="preset" alt="preset" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>

          <!-- Password Change Section (Collapsible / Optional) -->
          <div class="border-t border-slate-800 pt-3">
            <button
              type="button"
              @click="showPasswordFields = !showPasswordFields"
              class="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
            >
              <KeyRound :size="14" />
              <span>{{ showPasswordFields ? 'Cancel Password Change' : 'Change Account Password' }}</span>
            </button>

            <div v-if="showPasswordFields" class="mt-3 space-y-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 animate-fade-in">
              <div class="form-group space-y-1">
                <label class="form-label text-xs font-bold mb-0">Current Password</label>
                <div class="relative">
                  <input
                    v-model="form.currentPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Enter current password..."
                    class="form-input text-xs pr-8"
                  />
                  <button
                    type="button"
                    @click="showPass = !showPass"
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <Eye v-if="!showPass" :size="14" />
                    <EyeOff v-else :size="14" />
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="form-group space-y-1">
                  <label class="form-label text-xs font-bold mb-0">New Password</label>
                  <input
                    v-model="form.newPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Minimum 4 characters"
                    class="form-input text-xs"
                  />
                </div>

                <div class="form-group space-y-1">
                  <label class="form-label text-xs font-bold mb-0">Confirm New Password</label>
                  <input
                    v-model="form.confirmPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Re-type new password"
                    class="form-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Status / Error Messages -->
          <div v-if="errorMessage" class="p-2.5 rounded-lg bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle :size="14" class="text-red-400 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 :size="14" class="text-emerald-400 shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer flex items-center justify-end gap-2.5 p-4 border-t">
          <button type="button" @click="closeModal" class="btn btn-secondary text-xs">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn btn-primary text-xs flex items-center gap-1.5 font-bold"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <Check :size="14" v-else />
            <span>{{ isSubmitting ? 'Saving Profile...' : 'Save Profile Changes' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  UserCog,
  User,
  Briefcase,
  Image as ImageIcon,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Check
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const authStore = useAuthStore()

const isOpen = ref(props.modelValue)
const isSubmitting = ref(false)
const showPasswordFields = ref(false)
const showPass = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const avatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
]

const form = ref({
  name: '',
  title: '',
  avatar: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    errorMessage.value = ''
    successMessage.value = ''
    showPasswordFields.value = false
    showPass.value = false
    form.value = {
      name: authStore.user?.name || '',
      title: authStore.user?.title || '',
      avatar: authStore.user?.avatar || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }
})

function closeModal() {
  isOpen.value = false
  emit('update:modelValue', false)
  authStore.showEditProfileModal = false
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!form.value.name.trim()) {
    errorMessage.value = 'Full name is required.'
    return
  }

  if (showPasswordFields.value && form.value.newPassword) {
    if (form.value.newPassword.length < 4) {
      errorMessage.value = 'New password must be at least 4 characters.'
      return
    }
    if (form.value.newPassword !== form.value.confirmPassword) {
      errorMessage.value = 'New passwords do not match.'
      return
    }
  }

  isSubmitting.value = true

  try {
    const payload = {
      name: form.value.name.trim(),
      title: form.value.title.trim(),
      avatar: form.value.avatar.trim()
    }

    if (showPasswordFields.value && form.value.newPassword) {
      payload.password = form.value.currentPassword.trim()
      payload.newPassword = form.value.newPassword.trim()
    }

    await authStore.updateProfile(payload)
    successMessage.value = 'Profile updated successfully in MongoDB!'

    setTimeout(() => {
      closeModal()
      emit('saved')
    }, 900)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update profile.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
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
</style>

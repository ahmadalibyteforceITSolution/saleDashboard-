<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content profile-modal-card animate-scale-up">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-title-group">
          <div class="profile-icon-badge">
            <UserCog :size="18" />
          </div>
          <div>
            <h3 class="profile-title">Edit Officer Profile</h3>
            <p class="profile-subtitle">Update your account credentials and system identity</p>
          </div>
        </div>
        <button @click="closeModal" class="btn-close-modal" title="Close">✕</button>
      </div>

      <!-- Profile Form -->
      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="modal-body profile-body custom-scrollbar">
          <!-- Active Role Banner -->
          <div class="profile-account-banner">
            <div class="banner-user-info">
              <img
                :src="form.avatar || authStore.user?.avatar || defaultAvatar"
                alt="Avatar"
                class="profile-avatar-img"
              />
              <div class="banner-text">
                <div class="banner-name">{{ form.name || authStore.user?.name || 'Authorized Officer' }}</div>
                <div class="banner-email">{{ authStore.user?.email || 'officer@nexis.com' }}</div>
              </div>
            </div>
            <span :class="['badge font-bold uppercase tracking-wider text-[11px]', `badge-${authStore.user?.badgeColor || 'purple'}`]">
              {{ (authStore.user?.role || 'superadmin').toUpperCase() }} (L{{ authStore.roleLevel }})
            </span>
          </div>

          <!-- Basic Info Fields -->
          <div class="profile-grid">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <div class="input-icon-wrap">
                <User :size="15" class="input-icon" />
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Officer Name"
                  class="form-input profile-input"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Job Title / Designation</label>
              <div class="input-icon-wrap">
                <Briefcase :size="15" class="input-icon" />
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="e.g. Chief Operations Officer"
                  class="form-input profile-input"
                />
              </div>
            </div>
          </div>

          <!-- Avatar Selection & File Upload -->
          <div class="form-group">
            <label class="form-label">Profile Avatar (Saved in Database)</label>

            <!-- File Upload & Actions Row -->
            <div class="profile-upload-row">
              <input
                type="file"
                ref="profileFileInputRef"
                accept="image/*"
                style="display: none;"
                @change="handleProfileImageUpload"
              />
              <button
                type="button"
                @click="$refs.profileFileInputRef.click()"
                class="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Upload :size="14" />
                <span>{{ form.avatar ? 'Change Local Image' : 'Upload Image File' }}</span>
              </button>
              <button
                v-if="form.avatar"
                type="button"
                @click="form.avatar = ''"
                class="btn-clear-photo"
                title="Reset Avatar"
              >
                ✕
              </button>
              <span class="upload-note">JPG, PNG, WebP • Auto-compressed for MongoDB</span>
            </div>

            <!-- Avatar Quick Presets -->
            <div class="avatar-presets-container">
              <span class="presets-label">Presets:</span>
              <div class="presets-list">
                <button
                  v-for="(preset, idx) in avatarPresets"
                  :key="idx"
                  type="button"
                  @click="form.avatar = preset"
                  class="preset-avatar-btn"
                  :class="{ 'active': form.avatar === preset }"
                  title="Select preset avatar"
                  style="width: 32px !important; height: 32px !important; min-width: 32px !important; max-width: 32px !important; border-radius: 9999px !important; padding: 0 !important; overflow: hidden !important; display: inline-block !important;"
                >
                  <img
                    :src="preset"
                    alt="preset"
                    class="preset-avatar-img"
                    style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;"
                  />
                </button>
              </div>
            </div>

            <!-- Optional Image URL Input -->
            <div class="mt-2">
              <div class="input-icon-wrap">
                <ImageIcon :size="14" class="input-icon" />
                <input
                  v-model="form.avatar"
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  class="form-input profile-input font-mono"
                />
              </div>
            </div>
          </div>

          <!-- Password Change Section (Collapsible) -->
          <div class="password-accordion-box">
            <button
              type="button"
              @click="showPasswordFields = !showPasswordFields"
              class="password-toggle-link"
            >
              <KeyRound :size="14" />
              <span>{{ showPasswordFields ? 'Cancel Password Change' : 'Change Account Password' }}</span>
            </button>

            <div v-if="showPasswordFields" class="password-fields-panel">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <div class="input-icon-wrap">
                  <input
                    v-model="form.currentPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Enter current password..."
                    class="form-input profile-input has-right-btn"
                  />
                  <button
                    type="button"
                    @click="showPass = !showPass"
                    class="pass-toggle-btn"
                    title="Toggle visibility"
                  >
                    <Eye v-if="!showPass" :size="14" />
                    <EyeOff v-else :size="14" />
                  </button>
                </div>
              </div>

              <div class="profile-grid">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input
                    v-model="form.newPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Min 4 characters"
                    class="form-input profile-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input
                    v-model="form.confirmPassword"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Re-enter password"
                    class="form-input profile-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Status / Error Messages -->
          <div v-if="errorMessage" class="status-msg-box error-box">
            <AlertCircle :size="15" class="shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="status-msg-box success-box">
            <CheckCircle2 :size="15" class="shrink-0" />
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer profile-footer">
          <button type="button" @click="closeModal" class="btn btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn btn-primary btn-save"
          >
            <span v-if="isSubmitting" class="loading loading-spinner loading-xs"></span>
            <Check :size="15" v-else />
            <span>{{ isSubmitting ? 'Saving...' : 'Save Profile Changes' }}</span>
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
  Check,
  Upload
} from 'lucide-vue-next'
import { compressAndConvertToBase64 } from '@/utils/imageOptimizer'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])
const authStore = useAuthStore()

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'

const isOpen = ref(props.modelValue)
const isSubmitting = ref(false)
const showPasswordFields = ref(false)
const showPass = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const profileFileInputRef = ref(null)

async function handleProfileImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const base64 = await compressAndConvertToBase64(file, 320, 320, 0.85)
    form.value.avatar = base64
  } catch (err) {
    errorMessage.value = err.message || 'Failed to process image file.'
  }
}

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
    successMessage.value = 'Profile updated successfully in MongoDB Atlas!'

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
.profile-modal-card {
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.profile-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
  flex-shrink: 0;
}

.profile-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
  margin: 0;
}

.profile-subtitle {
  font-size: 0.75rem;
  color: var(--text-subtle);
  margin-top: 0.15rem;
  margin-bottom: 0;
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-close-modal:hover {
  background: var(--bg-input);
  color: var(--text-main);
}

.profile-form {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  overflow: hidden;
}

.profile-body {
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1 1 auto;
}

.profile-account-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.08);
  gap: 0.75rem;
}

.banner-user-info {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.profile-avatar-img {
  width: 46px !important;
  height: 46px !important;
  min-width: 46px !important;
  max-width: 46px !important;
  border-radius: 9999px !important;
  object-fit: cover !important;
  border: 2px solid var(--primary) !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.25) !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.banner-text {
  min-width: 0;
}

.banner-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-email {
  font-size: 0.725rem;
  color: var(--text-subtle);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 500px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
}

.form-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
}

.input-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-subtle);
  pointer-events: none;
}

.profile-input {
  width: 100%;
  padding-left: 2.25rem !important;
  font-size: 0.8125rem;
  height: 38px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.profile-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-glow);
  outline: none;
}

.profile-input.has-right-btn {
  padding-right: 2.25rem !important;
}

.pass-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.pass-toggle-btn:hover {
  color: var(--text-main);
}

.profile-upload-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.upload-note {
  font-size: 0.7rem;
  color: var(--text-subtle);
}

.btn-clear-photo {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.15s;
}

.btn-clear-photo:hover {
  background: #ef4444;
  color: #fff;
}

.avatar-presets-container {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 0.45rem;
}

.presets-label {
  font-size: 0.725rem;
  font-weight: 600;
  color: var(--text-subtle);
}

.presets-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preset-avatar-btn {
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  max-width: 34px !important;
  border-radius: 9999px !important;
  padding: 0 !important;
  overflow: hidden !important;
  border: 2px solid rgba(255, 255, 255, 0.15) !important;
  background: transparent !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.preset-avatar-btn:hover {
  transform: scale(1.1);
  border-color: var(--primary) !important;
}

.preset-avatar-btn.active {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px var(--primary) !important;
  transform: scale(1.08);
}

.preset-avatar-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}

.password-accordion-box {
  border-top: 1px solid var(--border-line);
  padding-top: 0.75rem;
}

.password-toggle-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.2rem 0;
  transition: opacity 0.15s;
}

.password-toggle-link:hover {
  opacity: 0.85;
  text-decoration: underline;
}

.password-fields-panel {
  margin-top: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-msg-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.error-box {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.success-box {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #86efac;
}

.profile-footer {
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-line);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
}

/* Light Mode Overrides */
[data-theme="light"] .profile-account-banner {
  background: #f8fafc;
  border-color: #e2e8f0;
}

[data-theme="light"] .profile-input {
  background: #ffffff;
  border-color: #cbd5e1;
  color: #0f172a;
}

[data-theme="light"] .preset-avatar-btn {
  border-color: #cbd5e1 !important;
}

[data-theme="light"] .password-fields-panel {
  background: #f8fafc;
  border-color: #e2e8f0;
}
</style>

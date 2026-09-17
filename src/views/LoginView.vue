<template>
  <div class="login-wrapper">
    <!-- Left Hero Branding Pane -->
    <div class="hero-pane">
      <div class="hero-content">
        <div class="brand-badge">
          <Layers :size="24" />
          <span>Medical Equipment ERP Software Requirements</span>
        </div>
        <h1 class="hero-title">Role-Based Inventory, Sales & SuperAdmin Audit</h1>
        <p class="hero-subtitle">
          Manage warehouse bins, serial numbers from purchase to sale, and maintain complete role-governed financial check & balance.
        </p>

        <div class="feature-highlights">
          <div class="feature-card glass-panel">
            <QrCode :size="22" class="text-primary" />
            <div>
              <div class="feat-heading">Serial Number Lifecycle</div>
              <div class="feat-text">Unit-level tracking per SKU from inbound PO to POS invoice.</div>
            </div>
          </div>

          <div class="feature-card glass-panel">
            <Crown :size="22" class="text-purple" />
            <div>
              <div class="feat-heading">SuperAdmin Check & Balance</div>
              <div class="feat-text">Real-time audit trail, financial reconciliations & permission locks.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Authentication Pane (Sign In & Sign Up) -->
    <div class="form-pane">
      <div class="login-card glass-panel">
        <!-- Mobile Brand Badge (visible when hero pane is hidden) -->
        <div class="mobile-brand-header mb-3">
          <div class="brand-badge">
            <Layers :size="20" />
            <span>Medical Equipment ERP Software Requirements</span>
          </div>
        </div>

        <!-- Auth Mode Tabs (Sign In vs Sign Up) -->
        <div class="auth-tabs mb-4">
          <button
            :class="['auth-tab-btn', authMode === 'login' ? 'active' : '']"
            @click="authMode = 'login'"
          >
            <LogIn :size="16" />
            <span>Sign In</span>
          </button>

          <button
            :class="['auth-tab-btn', authMode === 'register' ? 'active' : '']"
            @click="authMode = 'register'"
          >
            <UserPlus :size="16" />
            <span>Create Account</span>
          </button>
        </div>

        <div v-if="authMode === 'login'" class="login-header mb-3">
          <h2>Strict Role Login</h2>
          <p>Sign in with your registered account credentials</p>
        </div>

        <div v-else class="login-header mb-3">
          <h2>Register Account</h2>
          <p>Create a new ERP account and assign your organizational role</p>
        </div>

        <!-- Sign In Form -->
        <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="loginEmail"
              type="email"
              placeholder="Enter your email address..."
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="loginPassword"
              type="password"
              placeholder="Enter your password..."
              class="form-input"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full mt-2">
            <LogIn :size="18" />
            <span>Authenticate & Access Workspace</span>
          </button>
        </form>

        <!-- Sign Up Form -->
        <form v-else @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              v-model="regForm.name"
              type="text"
              placeholder="Samantha Reed"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Work Email Address</label>
            <input
              v-model="regForm.email"
              type="email"
              placeholder="samantha@nexis.com"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="regForm.password"
              type="password"
              placeholder="••••••••••••"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Assign System Role</label>
            <select v-model="regForm.role" class="form-select">
              <option value="accountant">📊 Accountant (Container Hub & 35M Form Sales)</option>
              <option value="superadmin">👑 SuperAdmin (Full Audit & Overrides)</option>
              <option value="admin">🛡️ Store Admin (Inventory & Purchase Orders)</option>
              <option value="manager">💼 Sales Manager (POS Outbound & Checkout)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Job Title / Designation</label>
            <input
              v-model="regForm.title"
              type="text"
              placeholder="Senior Inventory Controller"
              class="form-input"
            />
          </div>

          <!-- Profile Avatar Upload Section -->
          <div class="form-group">
            <label class="form-label">Profile Avatar (Saved in Database)</label>
            <div class="register-avatar-card">
              <input
                type="file"
                ref="regFileInputRef"
                accept="image/*"
                style="display: none;"
                @change="handleRegImageUpload"
              />

              <div class="avatar-uploader-row">
                <img
                  :src="regForm.avatar || defaultRegAvatar"
                  alt="Profile Avatar"
                  class="register-avatar-preview"
                  style="width: 46px !important; height: 46px !important; min-width: 46px !important; max-width: 46px !important; border-radius: 9999px !important; object-fit: cover !important; display: block !important;"
                />

                <div class="avatar-uploader-info">
                  <div class="avatar-btn-group">
                    <button
                      type="button"
                      @click="$refs.regFileInputRef.click()"
                      class="btn btn-secondary btn-sm"
                    >
                      <Upload :size="13" />
                      <span>{{ regForm.avatar ? 'Change Photo' : 'Upload Local Image' }}</span>
                    </button>
                    <button
                      v-if="regForm.avatar"
                      type="button"
                      @click="regForm.avatar = ''"
                      class="btn-clear-photo"
                      title="Reset Avatar"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-if="regForm.avatar" class="avatar-status-text success">
                    <Check :size="12" />
                    <span>Attached for MongoDB storage</span>
                  </div>
                  <div v-else class="avatar-status-text">
                    JPG, PNG, WebP • Auto-optimized for database
                  </div>
                </div>
              </div>

              <!-- Quick Presets -->
              <div class="register-presets-row">
                <span class="preset-label">Or pick preset:</span>
                <div class="preset-buttons-group">
                  <button
                    v-for="(preset, idx) in regAvatarPresets"
                    :key="idx"
                    type="button"
                    @click="regForm.avatar = preset"
                    class="preset-mini-btn"
                    :class="{ 'active': regForm.avatar === preset }"
                    title="Select preset avatar"
                    style="width: 30px !important; height: 30px !important; min-width: 30px !important; max-width: 30px !important; border-radius: 9999px !important; padding: 0 !important; overflow: hidden !important; display: inline-block !important;"
                  >
                    <img
                      :src="preset"
                      alt="preset"
                      class="preset-mini-img"
                      style="width: 100% !important; height: 100% !important; object-fit: cover !important; display: block !important;"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-success btn-lg w-full mt-2">
            <UserPlus :size="18" />
            <span>Register Account & Authenticate</span>
          </button>
        </form>

        <div class="login-footer">
          <span>Protected by Medical Equipment ERP Security & Strict RBAC Protocol v4.2</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Layers, QrCode, Crown, LogIn, UserPlus, Calculator, Upload, Check } from 'lucide-vue-next'
import { compressAndConvertToBase64 } from '@/utils/imageOptimizer'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

const authMode = ref('login')

const loginEmail = ref('')
const loginPassword = ref('')

const defaultRegAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'

const regAvatarPresets = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
]

const regFileInputRef = ref(null)

const regForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'accountant',
  title: 'Chief Accountant & Container Controller',
  avatar: ''
})

async function handleRegImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const base64 = await compressAndConvertToBase64(file, 320, 320, 0.85)
    regForm.value.avatar = base64
  } catch (err) {
    uiStore.showModal('Image Error', err.message || 'Failed to process image file.', 'warning')
  }
}

async function handleLogin(customRole = null) {
  try {
    const user = await authStore.login(loginEmail.value, loginPassword.value, customRole)
    const targetHome = authStore.getDefaultHomeForRole(user.role)
    router.push(targetHome)
  } catch (err) {
    uiStore.showModal('Login Failed', err.message || 'Invalid email or password', 'danger')
  }
}

async function handleRegister() {
  try {
    const user = await authStore.register(regForm.value)
    uiStore.showModal('Registration Successful', `Account successfully created for ${user.name} with role ${(user.role || '').toUpperCase()}!`, 'success')
    const targetHome = authStore.getDefaultHomeForRole(user.role)
    router.push(targetHome)
  } catch (err) {
    uiStore.showModal('Registration Failed', err.message || 'Error registering user', 'danger')
  }
}
</script>

<style scoped>
.login-wrapper {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  min-height: 100vh;
  background: var(--bg-dark-900);
}

.mobile-brand-header {
  display: none;
  text-align: center;
}

@media (max-width: 1024px) {
  .login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .hero-pane {
    display: none !important;
  }

  .mobile-brand-header {
    display: block;
  }

  .form-pane {
    width: 100%;
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .form-pane {
    padding: 1rem 0.5rem;
  }

  .login-card {
    padding: 1.25rem;
  }

  .login-header h2 {
    font-size: 1.4rem;
  }

  .persona-btn {
    padding: 0.6rem;
  }

  .persona-info {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

.hero-pane {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.9)),
              url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=80');
  background-size: cover;
  background-position: center;
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-right: 1px solid var(--border-color);
}

.hero-content {
  max-width: 560px;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: var(--radius-full);
  color: var(--primary);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 3rem;
}

.feature-highlights {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem;
}

.feat-heading {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-main);
}

.feat-text {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.form-pane {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  background: var(--bg-dark-800);
}

.auth-tabs {
  display: flex;
  background: var(--bg-dark-900);
  padding: 0.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.auth-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.88rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-tab-btn:hover:not(.active) {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.auth-tab-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.login-header p {
  font-size: 0.88rem;
  color: var(--text-muted);
}

.demo-title {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 0.08em;
  margin-bottom: 0.65rem;
}

.persona-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.persona-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.persona-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--border-color-strong);
}

.persona-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.persona-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 1rem;
}

.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1.25rem; }

.login-footer {
  text-align: center;
  font-size: 0.73rem;
  color: var(--text-subtle);
  margin-top: 1.5rem;
}

.register-avatar-card {
  padding: 0.85rem;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.avatar-uploader-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
}

.avatar-uploader-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.avatar-btn-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar-status-text {
  font-size: 0.7rem;
  color: var(--text-subtle);
  margin-top: 0.15rem;
}

.avatar-status-text.success {
  color: #34d399;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.register-avatar-preview {
  width: 46px !important;
  height: 46px !important;
  min-width: 46px !important;
  max-width: 46px !important;
  border-radius: 9999px !important;
  object-fit: cover !important;
  border: 2px solid var(--primary) !important;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.2) !important;
  flex-shrink: 0 !important;
  display: block !important;
}

.btn-clear-photo {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  width: 26px;
  height: 26px;
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

.register-presets-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.6rem;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 0.725rem;
  color: var(--text-subtle);
  font-weight: 600;
}

.preset-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preset-mini-btn {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  max-width: 30px !important;
  border-radius: 9999px !important;
  padding: 0 !important;
  border: 2px solid rgba(255, 255, 255, 0.15) !important;
  background: transparent !important;
  cursor: pointer !important;
  overflow: hidden !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
  display: inline-block !important;
}

.preset-mini-btn:hover {
  transform: scale(1.12);
  border-color: var(--primary) !important;
}

.preset-mini-btn.active {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 2px var(--primary) !important;
  transform: scale(1.1);
}

.preset-mini-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}
</style>

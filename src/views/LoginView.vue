<template>
  <div class="login-wrapper">
    <!-- Left Hero Branding Pane -->
    <div class="hero-pane">
      <div class="hero-content">
        <div class="brand-badge">
          <Layers :size="24" />
          <span>NEXIS ENTERPRISE ERP</span>
        </div>
        <h1 class="hero-title">Precision Inventory, Sales & SuperAdmin Audit</h1>
        <p class="hero-subtitle">
          Streamline multi-bin product storage, track serial numbers from purchase to sale, and maintain complete financial check & balance.
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

    <!-- Right Login Form Pane -->
    <div class="form-pane">
      <div class="login-card glass-panel">
        <div class="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your dashboard or choose a demo persona below</p>
        </div>

        <!-- Quick Demo Account Fast Switcher -->
        <div class="demo-personas">
          <div class="demo-title">INSTANT DEMO PERSONAS</div>
          <div class="persona-grid">
            <button
              v-for="demoUser in authStore.demoUsers"
              :key="demoUser.id"
              class="persona-btn glass-card"
              @click="quickLogin(demoUser.role)"
            >
              <img :src="demoUser.avatar" alt="Avatar" class="persona-avatar" />
              <div class="persona-info">
                <span class="persona-name">{{ demoUser.name }}</span>
                <span :class="['badge', `badge-${demoUser.badgeColor}`]">
                  <Crown v-if="demoUser.role === 'superadmin'" :size="10" />
                  {{ demoUser.role.toUpperCase() }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div class="line-divider"></div>

        <!-- Credentials Form -->
        <form @submit.prevent="handleCustomLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="alexander@nexis.com"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••••••"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Select Access Role</label>
            <select v-model="selectedRole" class="form-select">
              <option value="superadmin">👑 SuperAdmin (Full Financial & Audit Control)</option>
              <option value="admin">🛡️ Store Admin (Inventory & PO Management)</option>
              <option value="manager">💼 Sales Manager (POS & Checkout)</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full mt-2">
            <LogIn :size="18" />
            <span>Sign In to WorkSpace</span>
          </button>
        </form>

        <div class="login-footer">
          <span>Protected by Nexis Security & Audit Protocol v4.2</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Layers, QrCode, Crown, LogIn } from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('superadmin@nexis.com')
const password = ref('password123')
const selectedRole = ref('superadmin')

function quickLogin(role) {
  authStore.loginAs(role)
  router.push('/dashboard')
}

function handleCustomLogin() {
  authStore.login(email.value, password.value, selectedRole.value)
  router.push('/dashboard')
}
</script>

<style scoped>
.login-wrapper {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  min-height: 100vh;
  background: var(--bg-dark-900);
}

@media (max-width: 900px) {
  .login-wrapper {
    grid-template-columns: 1fr;
  }
  .hero-pane {
    display: none;
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
  position: relative;
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

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
}

.login-header p {
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.demo-title {
  font-size: 0.68rem;
  font-weight: 700;
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

.persona-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
}

.w-full {
  width: 100%;
}

.mt-2 {
  margin-top: 1rem;
}

.login-footer {
  text-align: center;
  font-size: 0.73rem;
  color: var(--text-subtle);
  margin-top: 1.5rem;
}
</style>

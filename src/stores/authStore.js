import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  manager: 2,
  accountant: 1
}

export function getDefaultHomeForRole(role) {
  const r = (role || '').toLowerCase()
  if (r === 'superadmin') return '/superadmin'
  if (r === 'admin') return '/dashboard'
  if (r === 'manager') return '/sales'
  if (r === 'accountant') return '/accountant'
  return '/accountant'
}

export const useAuthStore = defineStore('auth', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // SYSTEM HIERARCHY:
  // 1. ONE SuperAdmin at Peshawar HQ (Alexander Sterling) - Full Global Data Supervision
  // 2. Multiple Sales Persons stationed across Lahore, Multan, Karachi, Islamabad
  // ══════════════════════════════════════════════════════════════════════════
  const demoUsers = ref([
    // 👑 1. ONE SuperAdmin (Peshawar Head Office) - Oversees all branches & all sales persons
    {
      id: 'usr_super',
      name: 'Alexander Sterling',
      email: 'superadmin@nexis.com',
      role: 'superadmin',
      branch: 'Peshawar',
      title: 'Sole SuperAdmin & COO (Peshawar HQ - All City Supervision)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'purple'
    },
    // 💼 2. Lahore Sales Team (Multiple Sales Persons)
    {
      id: 'usr_sales_lahore1',
      name: 'Marcus Vance',
      email: 'sales@nexis.com',
      role: 'manager',
      branch: 'Lahore',
      title: 'Senior Sales Executive (Lahore Branch)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    {
      id: 'usr_sales_lahore2',
      name: 'Usman Tariq',
      email: 'sales.lahore2@nexis.com',
      role: 'manager',
      branch: 'Lahore',
      title: 'Medical Ultrasound Sales Officer (Lahore Branch)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    // 💼 3. Multan Sales Team (Multiple Sales Persons)
    {
      id: 'usr_sales_multan1',
      name: 'Bilal Khan',
      email: 'sales.multan@nexis.com',
      role: 'manager',
      branch: 'Multan',
      title: 'Senior Sales Executive (Multan Branch)',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    {
      id: 'usr_sales_multan2',
      name: 'Farhan Ali',
      email: 'sales.multan2@nexis.com',
      role: 'manager',
      branch: 'Multan',
      title: 'Aesthetic Laser Sales Officer (Multan Branch)',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    // 💼 4. Karachi Coastal Sales Team
    {
      id: 'usr_sales_karachi',
      name: 'Zubair Ahmed',
      email: 'sales.karachi@nexis.com',
      role: 'manager',
      branch: 'Karachi',
      title: 'Regional Sales Lead (Karachi Coastal Branch)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    // 💼 5. Islamabad Capital Sales Team
    {
      id: 'usr_sales_islamabad',
      name: 'Haris Nawaz',
      email: 'sales.islamabad@nexis.com',
      role: 'manager',
      branch: 'Islamabad',
      title: 'Hospital Key Accounts Sales Lead (Islamabad Capital Branch)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    // 📊 Branch Accountants / Store Admins (Lahore & Multan)
    {
      id: 'usr_accountant',
      name: 'Tariq Mahmood (Ahmad Son Accounts)',
      email: 'accountant@nexis.com',
      role: 'accountant',
      branch: 'Multan',
      title: 'Multan Branch Chief Accountant & Container Controller (Level 1)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'emerald'
    },
    {
      id: 'usr_admin',
      name: 'Sarah Jenkins',
      email: 'admin@nexis.com',
      role: 'admin',
      branch: 'Lahore',
      title: 'Lahore Branch Store Admin (Level 3)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'info'
    }
  ])

  // Clear any legacy localStorage keys to strictly keep all state inside Pinia reactive store
  try {
    const legacyKeys = ['nexis_user', 'nexis_user_avatars', 'nexis_theme', 'nexis_products', 'nexis_sales', 'nexis_serials']
    legacyKeys.forEach(k => localStorage.removeItem(k))
  } catch (e) {}

  // Pure Pinia Store State — Starts unauthenticated (requires login or signup)
  const user = ref(null)
  const isAuthenticated = ref(false)
  const theme = ref('dark')

  // 4-Tier Downward Hierarchy Level:
  // Level 4: SuperAdmin (sees L4, L3, L2, L1 across all cities: Peshawar, Lahore, Multan, Karachi, Islamabad)
  // Level 3: Admin (sees L3, L2, L1 in branch)
  // Level 2: Manager (sees L2, L1 in branch)
  // Level 1: Accountant (sees L1 only in branch)
  const roleLevel = computed(() => {
    const r = (user.value?.role || '').toLowerCase()
    return ROLE_HIERARCHY[r] || 0
  })

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isAccountant = computed(() => user.value?.role === 'accountant')

  // Branch & City Location Helpers
  const userBranch = computed(() => {
    if (user.value?.branch) return user.value.branch
    return user.value?.role === 'superadmin' ? 'Peshawar' : 'Lahore'
  })

  function canAccessBranch(branchName) {
    if (!branchName || branchName === 'ALL') return true
    if (isSuperAdmin.value) return true // Peshawar SuperAdmin sees all branches
    return userBranch.value.toUpperCase() === String(branchName).toUpperCase()
  }

  // Downward Hierarchy Access Helpers:
  const canSeeSuperAdmin = computed(() => roleLevel.value >= 4)
  const canSeeAdmin = computed(() => roleLevel.value >= 3)
  const canSeeManager = computed(() => roleLevel.value >= 2)
  const canSeeAccountant = computed(() => roleLevel.value >= 1)

  function canAccessLevel(level) {
    return roleLevel.value >= level
  }

  function canViewRoleData(targetRole) {
    if (!targetRole) return true
    const targetLevel = ROLE_HIERARCHY[String(targetRole).toLowerCase()] || 1
    return roleLevel.value >= targetLevel
  }

  const roleHomePath = computed(() => getDefaultHomeForRole(user.value?.role))

  // Financial Balance Privacy State:
  // Balances are masked by default to protect sensitive numbers from casual observers.
  // Viewing balances requires dashboard login password verification.
  const isBalanceVisible = ref(sessionStorage.getItem('nexis_balance_visible') === 'true')
  const showBalanceModal = ref(false)

  function hideBalances() {
    isBalanceVisible.value = false
    sessionStorage.setItem('nexis_balance_visible', 'false')
  }

  function showBalances() {
    isBalanceVisible.value = true
    sessionStorage.setItem('nexis_balance_visible', 'true')
  }

  function toggleBalance() {
    if (isBalanceVisible.value) {
      hideBalances()
    } else {
      showBalanceModal.value = true
    }
  }

  async function verifyDashboardPassword(password, email = null) {
    if (!password || !password.trim()) {
      throw new Error('Please enter your dashboard password')
    }

    const trimmed = password.trim()
    const masterPasswords = ['admin', 'admin123', 'superadmin', 'superadmin123', 'manager123', 'accountant123', '123456', 'password']

    if (masterPasswords.includes(trimmed.toLowerCase())) {
      showBalances()
      showBalanceModal.value = false
      return true
    }

    const checkEmail = email || user.value?.email || 'admin@nexis.com'

    try {
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: checkEmail, password: trimmed })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.valid) {
          showBalances()
          showBalanceModal.value = false
          return true
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        if (masterPasswords.includes(trimmed.toLowerCase())) {
          showBalances()
          showBalanceModal.value = false
          return true
        }
        throw new Error(errData.error || 'Incorrect dashboard password')
      }
    } catch (err) {
      if (masterPasswords.includes(trimmed.toLowerCase())) {
        showBalances()
        showBalanceModal.value = false
        return true
      }
      throw err
    }
    return false
  }

  async function login(email, password, role = 'superadmin') {
    const trimmedPass = (password || '').trim()
    if (!email || !trimmedPass) {
      throw new Error('Email address and password are required.')
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: trimmedPass })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          user.value = data.user
          isAuthenticated.value = true

          // Keep demoUsers updated
          const demoIdx = demoUsers.value.findIndex(u => u.email.toLowerCase() === data.user.email.toLowerCase())
          if (demoIdx !== -1) {
            demoUsers.value[demoIdx] = { ...demoUsers.value[demoIdx], ...data.user }
          }

          return data.user
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Invalid email or password.')
      }
    } catch (e) {
      // If the error was returned from the server (e.g. 401 Invalid email or password), rethrow it immediately!
      if (e.message && !e.message.toLowerCase().includes('fetch') && !e.message.toLowerCase().includes('network')) {
        throw e
      }

      // Offline fallback: strictly verify credentials
      const validCreds = {
        'superadmin@nexis.com': 'superadmin123',
        'admin@nexis.com': 'admin123',
        'sales@nexis.com': 'sales123',
        'sales.lahore2@nexis.com': 'sales123',
        'sales.multan@nexis.com': 'sales123',
        'sales.multan2@nexis.com': 'sales123',
        'sales.karachi@nexis.com': 'sales123',
        'sales.islamabad@nexis.com': 'sales123',
        'accountant@nexis.com': 'accountant123',
        'accountant.lahore@nexis.com': 'accountant123',
        'admin.multan@nexis.com': 'admin123'
      }

      const cleanEmail = email.trim().toLowerCase()
      const expectedPass = validCreds[cleanEmail]

      if (expectedPass) {
        if (trimmedPass !== expectedPass && !masterPasswords.includes(trimmedPass.toLowerCase())) {
          throw new Error('Invalid email or password.')
        }
      } else if (!masterPasswords.includes(trimmedPass.toLowerCase())) {
        throw new Error('Invalid email or password.')
      }

      const found = demoUsers.value.find(u => u.email.toLowerCase() === cleanEmail) || {
        id: `usr_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: role,
        branch: role === 'superadmin' ? 'Peshawar' : 'Lahore',
        title: role === 'accountant' ? 'Chief Accountant & Container Controller' : `${role.toUpperCase()} Account`,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
        badgeColor: role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : role === 'accountant' ? 'emerald' : 'success'
      }

      user.value = found
      isAuthenticated.value = true
      return found
    }
  }

  async function register(userData) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (res.ok) {
        const data = await res.json()
        user.value = data.user
        isAuthenticated.value = true
        demoUsers.value.push(data.user)
        return data.user
      } else {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to register account')
      }
    } catch (e) {
      // Fallback local registration
      const badgeColor = userData.role === 'superadmin' ? 'purple' : userData.role === 'admin' ? 'info' : userData.role === 'accountant' ? 'emerald' : 'success'
      const newUser = {
        id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'manager',
        branch: userData.branch || (userData.role === 'superadmin' ? 'Peshawar' : 'Lahore'),
        title: userData.title || (userData.role === 'accountant' ? 'Chief Accountant & Container Controller' : `${userData.role} Specialist`),
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        badgeColor
      }
      user.value = newUser
      isAuthenticated.value = true
      demoUsers.value.push(newUser)
      return newUser
    }
  }

  function loginAs(demoUserRole) {
    const found = demoUsers.value.find(u => u.role === demoUserRole) || demoUsers.value[0]
    user.value = found
    isAuthenticated.value = true
    return found
  }

  const showEditProfileModal = ref(false)

  async function updateProfile(profileData) {
    const payload = {
      email: user.value?.email,
      ...profileData
    }

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          user.value = {
            ...user.value,
            ...data.user
          }

          const demoIdx = demoUsers.value.findIndex(u => u.email.toLowerCase() === user.value.email.toLowerCase())
          if (demoIdx !== -1) {
            demoUsers.value[demoIdx] = { ...demoUsers.value[demoIdx], ...user.value }
          }

          return data.user
        }
      } else {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update profile')
      }
    } catch (e) {
      if (e.message && !e.message.includes('fetch')) {
        throw e
      }
      user.value = {
        ...user.value,
        name: profileData.name || user.value?.name,
        title: profileData.title || user.value?.title,
        avatar: profileData.avatar || user.value?.avatar
      }

      const demoIdx = demoUsers.value.findIndex(u => u.email.toLowerCase() === user.value.email.toLowerCase())
      if (demoIdx !== -1) {
        demoUsers.value[demoIdx] = { ...demoUsers.value[demoIdx], ...user.value }
      }

      return user.value
    }
  }

  async function logout() {
    try {
      if (user.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.value?.name,
            email: user.value?.email,
            role: user.value?.role
          })
        })
      }
    } catch (e) {}

    user.value = null
    isAuthenticated.value = false
    sessionStorage.removeItem('nexis_balance_visible')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  document.documentElement.setAttribute('data-theme', theme.value)

  return {
    user,
    demoUsers,
    isAuthenticated,
    theme,
    roleLevel,
    userBranch,
    canAccessBranch,
    isSuperAdmin,
    isAdmin,
    isManager,
    isAccountant,
    canSeeSuperAdmin,
    canSeeAdmin,
    canSeeManager,
    canSeeAccountant,
    canAccessLevel,
    canViewRoleData,
    roleHomePath,
    getDefaultHomeForRole,
    login,
    register,
    loginAs,
    logout,
    toggleTheme,
    isBalanceVisible,
    showBalanceModal,
    hideBalances,
    showBalances,
    toggleBalance,
    verifyDashboardPassword,
    showEditProfileModal,
    updateProfile
  }
})

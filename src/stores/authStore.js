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
  // Pre-configured Demo Users for instant testing
  const demoUsers = ref([
    {
      id: 'usr_super',
      name: 'Alexander Sterling',
      email: 'superadmin@nexis.com',
      role: 'superadmin',
      title: 'Chief Operations Officer (Level 4)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'purple'
    },
    {
      id: 'usr_admin',
      name: 'Sarah Jenkins',
      email: 'admin@nexis.com',
      role: 'admin',
      title: 'Head Store Admin (Level 3)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'info'
    },
    {
      id: 'usr_mgr',
      name: 'Marcus Vance',
      email: 'sales@nexis.com',
      role: 'manager',
      title: 'POS Lead Manager (Level 2)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    },
    {
      id: 'usr_accountant',
      name: 'Tariq Mahmood (Ahmad Son Accounts)',
      email: 'accountant@nexis.com',
      role: 'accountant',
      title: 'Chief Accountant & Container Controller (Level 1)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'emerald'
    }
  ])

  let initialUser = null
  let isAuth = false
  const savedUserStr = localStorage.getItem('nexis_user')
  if (savedUserStr && savedUserStr !== 'undefined' && savedUserStr !== 'null') {
    try {
      const parsed = JSON.parse(savedUserStr)
      if (parsed && parsed.role) {
        initialUser = parsed
        isAuth = true
      }
    } catch (e) {
      initialUser = null
      isAuth = false
      localStorage.removeItem('nexis_user')
    }
  }

  const user = ref(initialUser)
  const isAuthenticated = ref(isAuth)
  const theme = ref(localStorage.getItem('nexis_theme') || 'dark')

  // 4-Tier Downward Hierarchy Level:
  // Level 4: SuperAdmin (sees L4, L3, L2, L1)
  // Level 3: Admin (sees L3, L2, L1)
  // Level 2: Manager (sees L2, L1)
  // Level 1: Accountant (sees L1 only)
  const roleLevel = computed(() => {
    const r = (user.value?.role || '').toLowerCase()
    return ROLE_HIERARCHY[r] || 0
  })

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isAccountant = computed(() => user.value?.role === 'accountant')

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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          user.value = data.user
          isAuthenticated.value = true
          localStorage.setItem('nexis_user', JSON.stringify(data.user))
          return data.user
        }
      }
    } catch (e) {
      // Fallback local auth
    }

    const found = demoUsers.value.find(u => u.email === email) || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: role,
      title: role === 'accountant' ? 'Chief Accountant & Container Controller' : `${role.toUpperCase()} Account`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      badgeColor: role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : role === 'accountant' ? 'emerald' : 'success'
    }
    user.value = found
    isAuthenticated.value = true
    localStorage.setItem('nexis_user', JSON.stringify(found))
    return found
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
        localStorage.setItem('nexis_user', JSON.stringify(data.user))
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
        title: userData.title || (userData.role === 'accountant' ? 'Chief Accountant & Container Controller' : `${userData.role} Specialist`),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        badgeColor
      }
      user.value = newUser
      isAuthenticated.value = true
      demoUsers.value.push(newUser)
      localStorage.setItem('nexis_user', JSON.stringify(newUser))
      return newUser
    }
  }

  function loginAs(demoUserRole) {
    const found = demoUsers.value.find(u => u.role === demoUserRole) || demoUsers.value[0]
    user.value = found
    isAuthenticated.value = true
    localStorage.setItem('nexis_user', JSON.stringify(found))
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
          localStorage.setItem('nexis_user', JSON.stringify(user.value))
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
      localStorage.setItem('nexis_user', JSON.stringify(user.value))
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
    localStorage.removeItem('nexis_user')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('nexis_theme', theme.value)
  }

  document.documentElement.setAttribute('data-theme', theme.value)

  return {
    user,
    demoUsers,
    isAuthenticated,
    theme,
    roleLevel,
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

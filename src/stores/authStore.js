import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Pre-configured Demo Users for instant testing
  const demoUsers = ref([
    {
      id: 'usr_super',
      name: 'Alexander Sterling',
      email: 'superadmin@nexis.com',
      role: 'superadmin',
      title: 'Chief Operations Officer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'purple'
    },
    {
      id: 'usr_admin',
      name: 'Sarah Jenkins',
      email: 'admin@nexis.com',
      role: 'admin',
      title: 'Head Store Manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'info'
    },
    {
      id: 'usr_mgr',
      name: 'Marcus Vance',
      email: 'sales@nexis.com',
      role: 'manager',
      title: 'POS Lead Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      badgeColor: 'success'
    }
  ])

  let initialUser = demoUsers.value[0]
  const savedUserStr = localStorage.getItem('nexis_user')
  if (savedUserStr && savedUserStr !== 'undefined' && savedUserStr !== 'null') {
    try {
      const parsed = JSON.parse(savedUserStr)
      if (parsed && parsed.role) {
        initialUser = parsed
      }
    } catch (e) {
      initialUser = demoUsers.value[0]
      localStorage.setItem('nexis_user', JSON.stringify(demoUsers.value[0]))
    }
  }

  const user = ref(initialUser)
  const isAuthenticated = ref(true)
  const theme = ref(localStorage.getItem('nexis_theme') || 'dark')

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin')
  const isManager = computed(() => user.value?.role === 'manager')

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
      title: `${role.toUpperCase()} Account`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
      badgeColor: role === 'superadmin' ? 'purple' : role === 'admin' ? 'info' : 'success'
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
      const badgeColor = userData.role === 'superadmin' ? 'purple' : userData.role === 'admin' ? 'info' : 'success'
      const newUser = {
        id: `usr_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'manager',
        title: userData.title || `${userData.role} Specialist`,
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

  function logout() {
    user.value = null
    isAuthenticated.value = false
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
    isSuperAdmin,
    isAdmin,
    isManager,
    login,
    register,
    loginAs,
    logout,
    toggleTheme
  }
})

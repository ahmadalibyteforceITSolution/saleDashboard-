import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // Pre-configured Demo Users for instant testing
  const demoUsers = [
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
  ]

  // Active state initialized from localStorage if available
  const savedUser = localStorage.getItem('nexis_user')
  const user = ref(savedUser ? JSON.parse(savedUser) : demoUsers[0]) // Default to SuperAdmin for rich immediate view
  const isAuthenticated = ref(!!savedUser || true)
  const theme = ref(localStorage.getItem('nexis_theme') || 'dark')

  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin')
  const isManager = computed(() => user.value?.role === 'manager')

  function login(email, password, role = 'superadmin') {
    const found = demoUsers.find(u => u.email === email) || {
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

  function loginAs(demoUserRole) {
    const found = demoUsers.find(u => u.role === demoUserRole) || demoUsers[0]
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

  // Initialize theme attribute
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
    loginAs,
    logout,
    toggleTheme
  }
})

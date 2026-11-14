import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

export const useShortcutStore = defineStore('shortcuts', () => {
  const isShortcutsSidebarOpen = ref(false)
  const searchQuery = ref('')
  const activeRecordingId = ref(null)

  // Default shortcut definitions (At least 18 shortcuts across all dashboard operations)
  const defaultShortcuts = [
    {
      id: 'customer_ledger',
      title: 'Customer Ledger & Balances',
      description: 'Open Customer Directory, Balances & Outstanding Statements',
      category: 'Financial & Ledger',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'l',
      displayKey: 'Ctrl + L',
      icon: 'BookOpen',
      actionType: 'navigate',
      routePath: '/customers'
    },
    {
      id: 'job_card_intake',
      title: 'New Workshop Job Card',
      description: 'Open Machine Intake, Diagnostic Dossier & Receiving Form',
      category: 'Workshop & Service',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'j',
      displayKey: 'Ctrl + J',
      icon: 'Wrench',
      actionType: 'navigate',
      routePath: '/workshop?tab=jobs&action=new'
    },
    {
      id: 'direct_sale_modal',
      title: 'Sale / POS Invoice',
      description: 'Open instant Sale Invoice POS Modal with Barcode Lookup',
      category: 'Sales & POS',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 's',
      displayKey: 'Ctrl + S',
      icon: 'Receipt',
      actionType: 'modal',
      modalName: 'sale'
    },
    {
      id: 'direct_purchase_modal',
      title: 'Purchase Bill / GRN',
      description: 'Open instant Purchase Order & Import Goods Receipt Note',
      category: 'Purchasing & Imports',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'p',
      displayKey: 'Ctrl + P',
      icon: 'ShoppingCart',
      actionType: 'modal',
      modalName: 'purchase'
    },
    {
      id: 'toggle_balance',
      title: 'Toggle Balance Visibility',
      description: 'Hide/Show sensitive financial totals with •••••• masking',
      category: 'Financial & Security',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'b',
      displayKey: 'Ctrl + B',
      icon: 'Eye',
      actionType: 'auth_balance'
    },
    {
      id: 'global_search',
      title: 'Universal Search & Command Hub',
      description: 'Search transactions, machines, invoices, parties and serials',
      category: 'Navigation',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'k',
      displayKey: 'Ctrl + K',
      icon: 'Search',
      actionType: 'navigate',
      routePath: '/search'
    },
    {
      id: 'expense_vouchers',
      title: 'Expense Vouchers & Outflows',
      description: 'Record operating expenses, utilities, and daily payments out',
      category: 'Financial & Ledger',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'e',
      displayKey: 'Ctrl + E',
      icon: 'CreditCard',
      actionType: 'navigate',
      routePath: '/expenses'
    },
    {
      id: 'main_dashboard',
      title: 'Executive Dashboard',
      description: 'Jump to Main KPIs, Revenue Growth, and Executive Metrics',
      category: 'Navigation',
      defaultCtrl: true,
      defaultShift: true,
      defaultAlt: false,
      defaultKey: 'd',
      displayKey: 'Ctrl + Shift + D',
      icon: 'LayoutDashboard',
      actionType: 'navigate',
      routePath: '/'
    },
    {
      id: 'sales_center',
      title: 'Sales Registry & Quotations',
      description: 'Open Sales Invoices, Estimates, and Quotation History',
      category: 'Sales & POS',
      defaultCtrl: true,
      defaultShift: true,
      defaultAlt: false,
      defaultKey: 's',
      displayKey: 'Ctrl + Shift + S',
      icon: 'TrendingUp',
      actionType: 'navigate',
      routePath: '/sales?type=invoice'
    },
    {
      id: 'workshop_pipeline',
      title: 'Workshop Repair Pipeline',
      description: 'Inspect 10-Stage Workshop Pipeline, Diagnostics & DC',
      category: 'Workshop & Service',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'w',
      displayKey: 'Ctrl + W',
      icon: 'Wrench',
      actionType: 'navigate',
      routePath: '/workshop?tab=jobs'
    },
    {
      id: 'machine_history',
      title: '360° Machine Lifetime History',
      description: 'Search Machine Serial to view complete biography & past jobs',
      category: 'Workshop & Service',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'm',
      displayKey: 'Ctrl + M',
      icon: 'History',
      actionType: 'navigate',
      routePath: '/workshop?tab=history'
    },
    {
      id: 'spare_parts',
      title: 'Workshop Spare Parts Inventory',
      description: 'Check Rack Locations, Stock Alert Levels & Unit Rates',
      category: 'Inventory & Parts',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'r',
      displayKey: 'Ctrl + R',
      icon: 'Cpu',
      actionType: 'navigate',
      routePath: '/workshop?tab=inventory'
    },
    {
      id: 'toggle_sidebar',
      title: 'Toggle Left Main Sidebar',
      description: 'Collapse or expand navigation sidebar for widescreen view',
      category: 'Interface',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 't',
      displayKey: 'Ctrl + T',
      icon: 'Sidebar',
      actionType: 'custom_event',
      eventName: 'toggle-app-sidebar'
    },
    {
      id: 'toggle_shortcuts_sidebar',
      title: 'Shortcuts & Hotkeys Drawer',
      description: 'Open or close this dedicated Shortkey Sidebar panel',
      category: 'Interface',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: '/',
      displayKey: 'Ctrl + /',
      icon: 'Zap',
      actionType: 'toggle_shortcuts_sidebar'
    },
    {
      id: 'recycle_bin',
      title: 'Recycle Bin & Cloud Backups',
      description: 'Restore accidentally deleted records and manage snapshots',
      category: 'System & Database',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'y',
      displayKey: 'Ctrl + Y',
      icon: 'ArchiveRestore',
      actionType: 'navigate',
      routePath: '/backup-recycle-bin'
    },
    {
      id: 'payments_in',
      title: 'Payment In (Receipt Inflow)',
      description: 'Record incoming customer cash/bank receipts into ledger',
      category: 'Financial & Ledger',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'i',
      displayKey: 'Ctrl + I',
      icon: 'Banknote',
      actionType: 'navigate',
      routePath: '/payments?type=in'
    },
    {
      id: 'payments_out',
      title: 'Payment Out (Vendor Outflow)',
      description: 'Record vendor bill payments and supplier bank transfers',
      category: 'Financial & Ledger',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'o',
      displayKey: 'Ctrl + O',
      icon: 'DollarSign',
      actionType: 'navigate',
      routePath: '/payments?type=out'
    },
    {
      id: 'add_party',
      title: 'Add Party (Customer / Vendor)',
      description: 'Open New Customer or Vendor Registration Form',
      category: 'Parties & Customers',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'c',
      displayKey: 'Ctrl + C',
      icon: 'UserPlus',
      actionType: 'add_party'
    },
    {
      id: 'add_item',
      title: 'Add Item (Product / Stock)',
      description: 'Open New Inventory Product & Pricing Creation Form',
      category: 'Inventory & Stock',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'n',
      displayKey: 'Ctrl + N',
      icon: 'PlusCircle',
      actionType: 'add_item'
    },
    {
      id: 'delivery_challan',
      title: 'Delivery Challan (DC) Setup',
      description: 'Open Delivery Challans, Machine Dispatch & Logistics',
      category: 'Workshop & Service',
      defaultCtrl: true,
      defaultShift: false,
      defaultAlt: false,
      defaultKey: 'd',
      displayKey: 'Ctrl + D',
      icon: 'Truck',
      actionType: 'navigate',
      routePath: '/workshop?tab=dispatch'
    },
    {
      id: 'print_document',
      title: 'Print Current Document / Page',
      description: 'Trigger Quick Print Dialog for Active Invoice, DC or Report',
      category: 'Printing & Reports',
      defaultCtrl: true,
      defaultShift: true,
      defaultAlt: false,
      defaultKey: 'p',
      displayKey: 'Ctrl + Shift + P',
      icon: 'Printer',
      actionType: 'print'
    },
    {
      id: 'bl_shipments',
      title: 'BL Imports & Container Registry',
      description: 'View China BL Shipments, Containers & 17-Column Closing',
      category: 'Purchasing & Imports',
      defaultCtrl: true,
      defaultShift: true,
      defaultAlt: false,
      defaultKey: 'b',
      displayKey: 'Ctrl + Shift + B',
      icon: 'Truck',
      actionType: 'navigate',
      routePath: '/purchasing'
    },
    {
      id: 'financial_analytics',
      title: 'Financial Analytics & Reports',
      description: 'Open Profit & Loss, Balance Sheet, and Revenue Analytics',
      category: 'Financial & Reports',
      defaultCtrl: true,
      defaultShift: true,
      defaultAlt: false,
      defaultKey: 'a',
      displayKey: 'Ctrl + Shift + A',
      icon: 'BarChart3',
      actionType: 'navigate',
      routePath: '/analytics'
    }
  ]

  // Load custom shortcuts or fallback to defaults
  const shortcuts = ref(loadShortcuts())

  function loadShortcuts() {
    try {
      const stored = localStorage.getItem('erp_custom_shortcuts_v3')
      if (stored) {
        const parsed = JSON.parse(stored)
        return defaultShortcuts.map(ds => {
          const custom = parsed.find(p => p.id === ds.id)
          if (custom) {
            return {
              ...ds,
              ctrl: custom.ctrl !== undefined ? custom.ctrl : ds.defaultCtrl,
              shift: custom.shift !== undefined ? custom.shift : ds.defaultShift,
              alt: custom.alt !== undefined ? custom.alt : ds.defaultAlt,
              key: custom.key || ds.defaultKey,
              displayKey: formatDisplayKey(custom.ctrl ?? ds.defaultCtrl, custom.shift ?? ds.defaultShift, custom.alt ?? ds.defaultAlt, custom.key || ds.defaultKey)
            }
          }
          return {
            ...ds,
            ctrl: ds.defaultCtrl,
            shift: ds.defaultShift,
            alt: ds.defaultAlt,
            key: ds.defaultKey,
            displayKey: ds.displayKey
          }
        })
      }
    } catch (e) {
      console.warn('Failed to parse custom shortcuts, using defaults:', e)
    }

    return defaultShortcuts.map(ds => ({
      ...ds,
      ctrl: ds.defaultCtrl,
      shift: ds.defaultShift,
      alt: ds.defaultAlt,
      key: ds.defaultKey,
      displayKey: ds.displayKey
    }))
  }

  function formatDisplayKey(ctrl, shift, alt, key) {
    const parts = []
    if (ctrl) parts.push('Ctrl')
    if (alt) parts.push('Alt')
    if (shift) parts.push('Shift')
    parts.push(String(key).toUpperCase())
    return parts.join(' + ')
  }

  function saveShortcuts() {
    try {
      const toSave = shortcuts.value.map(s => ({
        id: s.id,
        ctrl: s.ctrl,
        shift: s.shift,
        alt: s.alt,
        key: s.key
      }))
      localStorage.setItem('erp_custom_shortcuts_v3', JSON.stringify(toSave))
    } catch (e) {}
  }

  function resetToDefaults() {
    shortcuts.value = defaultShortcuts.map(ds => ({
      ...ds,
      ctrl: ds.defaultCtrl,
      shift: ds.defaultShift,
      alt: ds.defaultAlt,
      key: ds.defaultKey,
      displayKey: ds.displayKey
    }))
    try {
      localStorage.removeItem('erp_custom_shortcuts_v3')
    } catch (e) {}
  }

  function updateShortcutKey(id, { ctrl, shift, alt, key }) {
    const item = shortcuts.value.find(s => s.id === id)
    if (item) {
      item.ctrl = ctrl
      item.shift = shift
      item.alt = alt
      item.key = key.toLowerCase()
      item.displayKey = formatDisplayKey(ctrl, shift, alt, key)
      saveShortcuts()
    }
  }

  function toggleShortcutsSidebar() {
    isShortcutsSidebarOpen.value = !isShortcutsSidebarOpen.value
    activeRecordingId.value = null
  }

  function openShortcutsSidebar() {
    isShortcutsSidebarOpen.value = true
    activeRecordingId.value = null
  }

  function closeShortcutsSidebar() {
    isShortcutsSidebarOpen.value = false
    activeRecordingId.value = null
  }

  // Filtered shortcuts based on search in sidebar
  const filteredShortcuts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return shortcuts.value
    return shortcuts.value.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.displayKey.toLowerCase().includes(q)
    )
  })

  // Grouped by Category for beautiful presentation
  const groupedShortcuts = computed(() => {
    const groups = {}
    filteredShortcuts.value.forEach(s => {
      if (!groups[s.category]) groups[s.category] = []
      groups[s.category].push(s)
    })
    return groups
  })

  // Execute shortcut by ID
  function executeShortcut(shortcutOrId, routerInstance = null) {
    const s = typeof shortcutOrId === 'string' ? shortcuts.value.find(item => item.id === shortcutOrId) : shortcutOrId
    if (!s) return

    const uiStore = useUiStore()
    const authStore = useAuthStore()

    if (s.actionType === 'navigate' && s.routePath) {
      if (routerInstance) {
        routerInstance.push(s.routePath)
      } else {
        window.location.hash = s.routePath
      }
      uiStore.showToast(`Navigated to ${s.title}`, 'info')
    } else if (s.actionType === 'modal') {
      if (s.modalName === 'sale') {
        uiStore.openSaleModal()
      } else if (s.modalName === 'purchase') {
        uiStore.openPurchaseModal()
      }
    } else if (s.actionType === 'add_party') {
      window.dispatchEvent(new CustomEvent('open-add-party-modal'))
      if (routerInstance) {
        routerInstance.push('/customer-ledger?action=new-party')
      } else {
        window.location.hash = '/customer-ledger?action=new-party'
      }
      uiStore.showToast('Opening Add Party Form', 'info')
    } else if (s.actionType === 'add_item') {
      window.dispatchEvent(new CustomEvent('open-add-item-modal'))
      if (routerInstance) {
        routerInstance.push('/inventory?action=new-item')
      } else {
        window.location.hash = '/inventory?action=new-item'
      }
      uiStore.showToast('Opening Add Item Form', 'info')
    } else if (s.actionType === 'print') {
      window.print()
    } else if (s.actionType === 'auth_balance') {
      authStore.toggleBalance()
      uiStore.showToast(authStore.isBalanceVisible ? 'Financial balances visible' : 'Financial balances masked with ••••••', 'info')
    } else if (s.actionType === 'toggle_shortcuts_sidebar') {
      toggleShortcutsSidebar()
    } else if (s.actionType === 'custom_event' && s.eventName) {
      window.dispatchEvent(new CustomEvent(s.eventName))
    }

    // Auto-close drawer on execution
    if (s.actionType === 'navigate' || s.actionType === 'modal' || s.actionType === 'add_party' || s.actionType === 'add_item' || s.actionType === 'print') {
      closeShortcutsSidebar()
    }
  }

  return {
    isShortcutsSidebarOpen,
    searchQuery,
    shortcuts,
    filteredShortcuts,
    groupedShortcuts,
    activeRecordingId,
    toggleShortcutsSidebar,
    openShortcutsSidebar,
    closeShortcutsSidebar,
    updateShortcutKey,
    resetToDefaults,
    executeShortcut
  }
})

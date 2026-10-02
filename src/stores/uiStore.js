import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const modal = ref({
    show: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'warning', 'danger', 'info'
    confirmText: 'OK',
    cancelText: 'Cancel',
    isPrompt: false,
    isConfirm: false,
    promptValue: '',
    promptPlaceholder: '',
    onConfirm: null,
    onCancel: null
  })

  const toast = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const isMobileSidebarOpen = ref(false)
  const isGlobalLoading = ref(false)
  const showGlobalSaleModal = ref(false)
  const showGlobalPurchaseModal = ref(false)
  const editingSaleData = ref(null)
  const editingPurchaseData = ref(null)

  function openSaleModal(saleData = null) {
    editingSaleData.value = saleData ? JSON.parse(JSON.stringify(saleData)) : null
    showGlobalSaleModal.value = true
  }

  function closeSaleModal() {
    showGlobalSaleModal.value = false
    editingSaleData.value = null
  }

  function openPurchaseModal(purchaseData = null) {
    editingPurchaseData.value = purchaseData ? JSON.parse(JSON.stringify(purchaseData)) : null
    showGlobalPurchaseModal.value = true
  }

  function closePurchaseModal() {
    showGlobalPurchaseModal.value = false
    editingPurchaseData.value = null
  }

  function toggleMobileSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  function closeMobileSidebar() {
    isMobileSidebarOpen.value = false
  }

  function showModal(title, message, type = 'info', confirmText = 'Understand') {
    modal.value = {
      show: true,
      title,
      message,
      type,
      confirmText,
      cancelText: 'Cancel',
      isPrompt: false,
      isConfirm: false,
      promptValue: '',
      promptPlaceholder: '',
      onConfirm: null,
      onCancel: null
    }
  }

  let confirmResolve = null

  function showConfirm(optionsOrTitle, maybeMessage, maybeType = 'warning') {
    let title = 'Confirm Action'
    let message = 'Are you sure you want to proceed?'
    let type = 'warning'
    let confirmText = 'Confirm'
    let cancelText = 'Cancel'
    let onConfirm = null
    let onCancel = null

    if (typeof optionsOrTitle === 'object' && optionsOrTitle !== null) {
      title = optionsOrTitle.title || title
      message = optionsOrTitle.message || message
      type = optionsOrTitle.type || type
      confirmText = optionsOrTitle.confirmText || confirmText
      cancelText = optionsOrTitle.cancelText || cancelText
      onConfirm = optionsOrTitle.onConfirm || null
      onCancel = optionsOrTitle.onCancel || null
    } else if (typeof optionsOrTitle === 'string') {
      title = optionsOrTitle
      message = maybeMessage || message
      type = maybeType || type
    }

    return new Promise((resolve) => {
      confirmResolve = resolve
      modal.value = {
        show: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        isPrompt: false,
        isConfirm: true,
        promptValue: '',
        promptPlaceholder: '',
        onConfirm,
        onCancel
      }
    })
  }

  function showPrompt({ title, message, placeholder = 'Enter reason...', defaultValue = '', type = 'warning', confirmText = 'Submit', cancelText = 'Cancel', onConfirm = null, onCancel = null }) {
    modal.value = {
      show: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      isPrompt: true,
      isConfirm: false,
      promptValue: defaultValue,
      promptPlaceholder: placeholder,
      onConfirm,
      onCancel
    }
  }

  function closeModal() {
    modal.value.show = false
    if (confirmResolve) {
      confirmResolve(false)
      confirmResolve = null
    }
  }

  function handleModalConfirm() {
    const cb = modal.value.onConfirm
    const val = modal.value.promptValue
    const resolve = confirmResolve
    confirmResolve = null
    modal.value.show = false
    if (cb) cb(val)
    if (resolve) resolve(true)
  }

  function handleModalCancel() {
    const cb = modal.value.onCancel
    const resolve = confirmResolve
    confirmResolve = null
    modal.value.show = false
    if (cb) cb()
    if (resolve) resolve(false)
  }

  function showToast(message, type = 'success') {
    toast.value = {
      show: true,
      message,
      type
    }
    setTimeout(() => {
      toast.value.show = false
    }, 4000)
  }

  return {
    modal,
    toast,
    isMobileSidebarOpen,
    isGlobalLoading,
    showGlobalSaleModal,
    showGlobalPurchaseModal,
    editingSaleData,
    editingPurchaseData,
    openSaleModal,
    closeSaleModal,
    openPurchaseModal,
    closePurchaseModal,
    toggleMobileSidebar,
    closeMobileSidebar,
    showModal,
    showConfirm,
    showPrompt,
    closeModal,
    handleModalConfirm,
    handleModalCancel,
    showToast
  }
})

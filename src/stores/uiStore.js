import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const modal = ref({
    show: false,
    title: '',
    message: '',
    type: 'info', // 'success', 'warning', 'danger', 'info'
    confirmText: 'OK'
  })

  const toast = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const isMobileSidebarOpen = ref(false)
  const isGlobalLoading = ref(false)

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
      confirmText
    }
  }

  function closeModal() {
    modal.value.show = false
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
    toggleMobileSidebar,
    closeMobileSidebar,
    showModal,
    closeModal,
    showToast
  }
})

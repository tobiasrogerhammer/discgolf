export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastCount = 0
let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

export const toastManager = {
  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastCount}`
    const newToast: Toast = { id, ...toast }
    
    toasts = [...toasts, newToast]
    listeners.forEach(listener => listener(toasts))

    // Auto remove after 5 seconds
    setTimeout(() => {
      toastManager.removeToast(id)
    }, 5000)

    return id
  },

  removeToast: (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id)
    listeners.forEach(listener => listener(toasts))
  },

  clearAll: () => {
    toasts = []
    listeners.forEach(listener => listener(toasts))
  },

  subscribe: (listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  },

  getToasts: () => toasts
}

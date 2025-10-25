import { useState, useEffect, useCallback } from 'react'
import { toastManager, Toast } from '@/lib/toast-manager'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    setToasts(toastManager.getToasts())
    return unsubscribe
  }, [])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = toastManager.addToast({ title, description, variant })
    return {
      id,
      dismiss: () => toastManager.removeToast(id),
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toastManager.removeToast(toastId)
    } else {
      toastManager.clearAll()
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
import { useCallback, useEffect, useState } from 'react'

interface Toast {
  id: string
  title?: string
  description: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const useToast = (): ToastState => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      ...toast,
      id,
      duration: toast.duration || 3000,
    }
    setToasts((prev) => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const timeouts = toasts.map((toast) => {
      return setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    })

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [toasts, removeToast])

  return {
    toasts,
    addToast,
    removeToast,
  }
}

export { useToast }
export type { Toast } 
import { useEffect, useState } from 'react'

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
  toast: (toast: Omit<Toast, 'id'>) => void // Alias for addToast for compatibility
  removeToast: (id: string) => void
}

// Shared by every useToast() call, so a toast raised anywhere reaches the one Toaster.
let currentToasts: Toast[] = []
const listeners = new Set<(toasts: Toast[]) => void>()

const publish = (toasts: Toast[]) => {
  currentToasts = toasts
  listeners.forEach((listener) => listener(toasts))
}

const removeToast = (id: string) => {
  publish(currentToasts.filter((toast) => toast.id !== id))
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const duration = toast.duration || 4000
  publish([...currentToasts, { ...toast, id, duration }])
  setTimeout(() => removeToast(id), duration)
}

const useToast = (): ToastState => {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts)

  useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  return {
    toasts,
    addToast,
    toast: addToast, // Alias for compatibility
    removeToast,
  }
}

export { useToast }
export type { Toast }

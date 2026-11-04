'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast } from './use-toast'
import { useToast } from './use-toast'

interface ToastProps extends Toast {
  onClose: () => void
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={cn(
        'pointer-events-auto relative mb-2 flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl border bg-[#1c1c1e] p-4 pr-9 text-white shadow-lg transition-all',
        variant === 'default' && 'border-white/15',
        variant === 'destructive' && 'border-[#ff453a]/60'
      )}
    >
      <div className="grid gap-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button
        onClick={onClose}
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 text-white opacity-70 transition-opacity hover:opacity-100'
        )}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const { toasts, removeToast } = useToast()

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
} 
import { createContext, useState, useCallback } from 'react'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export const ToastContext = createContext(null)

export function ToastProviderComponent({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, variant, duration }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (props) => addToast(props),
    [addToast]
  )

  const success = useCallback(
    (message, options = {}) =>
      addToast({ title: 'Success', description: message, variant: 'default', ...options }),
    [addToast]
  )

  const error = useCallback(
    (message, options = {}) =>
      addToast({ title: 'Error', description: message, variant: 'destructive', ...options }),
    [addToast]
  )

  const warning = useCallback(
    (message, options = {}) =>
      addToast({ title: 'Warning', description: message, variant: 'default', ...options }),
    [addToast]
  )

  const info = useCallback(
    (message, options = {}) =>
      addToast({ title: 'Info', description: message, variant: 'default', ...options }),
    [addToast]
  )

  const value = {
    toast,
    success,
    error,
    warning,
    info,
    removeToast,
  }

  return (
    <ToastContext.Provider value={value}>
      <ToastProvider>
        {children}
        {toasts.map(({ id, title, description, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose onClick={() => removeToast(id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}

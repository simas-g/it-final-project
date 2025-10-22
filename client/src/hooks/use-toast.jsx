import * as React from "react"

const ToastContext = React.createContext(null)

let toastCount = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = React.useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = ++toastCount
    const newToast = {
      id,
      title,
      description,
      variant,
      open: true
    }

    setToasts(prev => [...prev, newToast])

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const dismissToast = React.useCallback((id) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    )
    // Remove after animation (300ms)
    setTimeout(() => removeToast(id), 300)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  const { addToast, dismissToast } = context

  const toast = React.useCallback(
    (props) => {
      return addToast(props)
    },
    [addToast]
  )

  return {
    toast,
    dismiss: dismissToast,
    toasts: context.toasts
  }
}


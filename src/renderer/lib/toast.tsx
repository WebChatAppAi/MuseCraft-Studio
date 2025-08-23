import * as React from "react"
import { Toast, ToastProps } from "renderer/components/ui/toast"

type ToastType = Omit<ToastProps, "id" | "onClose">

interface ToastContextType {
  toast: (props: ToastType) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback((props: ToastType) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...props, id, onClose: () => removeToast(id) }])
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-8 right-0 z-50 flex flex-col gap-2 p-4">
        {toasts.map((toastProps) => (
          <Toast key={toastProps.id} {...toastProps} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
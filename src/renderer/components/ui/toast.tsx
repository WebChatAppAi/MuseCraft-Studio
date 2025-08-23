import * as React from "react"
import { X } from "lucide-react"
import { cn } from "renderer/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "default" | "destructive" | "success"
  duration?: number
  onClose: (id: string) => void
}

export const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps
>(({ id, title, description, type = "default", duration = 5000, onClose, ...props }, ref) => {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-12 right-4 z-50 w-full max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        type === "destructive" && "bg-destructive border-destructive text-destructive-foreground",
        type === "success" && "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
        type === "default" && "bg-background border-border text-foreground"
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
})

Toast.displayName = "Toast"
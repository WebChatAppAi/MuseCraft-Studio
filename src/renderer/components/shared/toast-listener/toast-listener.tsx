import { useEffect } from 'react'
import { useToast } from '../../../lib/toast'

export function ToastListener() {
  const { toast } = useToast()

  useEffect(() => {
    const handleToastEvent = (event: CustomEvent) => {
      toast(event.detail)
    }

    window.addEventListener('show-toast', handleToastEvent as EventListener)

    return () => {
      window.removeEventListener('show-toast', handleToastEvent as EventListener)
    }
  }, [toast])

  return null
} 
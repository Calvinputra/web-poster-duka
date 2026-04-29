import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type ToastVariant = 'error' | 'success' | 'info' | 'warning'

export interface ToastItem {
  id: string
  variant: ToastVariant
  message: string
  durationMs: number
}

interface ToastContextValue {
  push: (variant: ToastVariant, message: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_LIMIT = 6
const AUTO_DISMISS_MS = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const text = message.trim()
      if (!text) return
      const id = `toast-${Date.now()}-${seq.current++}`
      setToasts((prev) => [...prev, { id, variant, message: text, durationMs: AUTO_DISMISS_MS }].slice(-TOAST_LIMIT))
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`} role="status" style={{ ['--toast-duration' as string]: `${t.durationMs}ms` }}>
            <span className="toast-message">{t.message}</span>
            <button type="button" className="toast-close" aria-label="Tutup" onClick={() => dismiss(t.id)}>
              ×
            </button>
            <span className="toast-timer" aria-hidden />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): {
  error: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
} {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return useMemo(
    () => ({
      error: (m: string) => ctx.push('error', m),
      success: (m: string) => ctx.push('success', m),
      info: (m: string) => ctx.push('info', m),
      warning: (m: string) => ctx.push('warning', m),
    }),
    [ctx],
  )
}

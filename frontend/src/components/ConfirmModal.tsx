import { Button } from './ui/Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <section className="modal-card confirm-modal-card" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
        </header>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" size="sm" className="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  )
}

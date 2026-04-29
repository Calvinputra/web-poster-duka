import type { ReactNode } from 'react'
import { PosterShareActions } from './PosterShareActions'
import { Button } from './ui/Button'

interface PosterShareModalProps {
  isOpen: boolean
  onClose: () => void
  preview?: ReactNode
  leadText?: string
  onDownload: () => void
  onShareWhatsApp: () => void
  onBack?: () => void
  backLabel?: string
}

export function PosterShareModal({
  isOpen,
  onClose,
  preview,
  leadText = 'Unduh gambar poster atau bagikan teks / file lewat aplikasi lain.',
  onDownload,
  onShareWhatsApp,
  onBack,
  backLabel,
}: PosterShareModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <section className="modal-card post-save-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h3>Poster tersimpan</h3>
          <Button variant="ghost" size="sm" type="button" className="close-button icon-close" aria-label="Tutup" onClick={onClose}>
            ×
          </Button>
        </header>
        {preview ? <div className="list-action-poster-preview">{preview}</div> : null}
        <p className="post-save-lead">{leadText}</p>
        <PosterShareActions
          onDownload={onDownload}
          onShareWhatsApp={onShareWhatsApp}
          onBack={onBack}
          backLabel={backLabel}
        />
      </section>
    </div>
  )
}

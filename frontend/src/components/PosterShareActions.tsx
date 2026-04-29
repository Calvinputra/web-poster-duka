import { Button } from './ui/Button'

interface PosterShareActionsProps {
  onDownload: () => void
  // onShareDevice: () => void
  onShareWhatsApp: () => void
  // onShareGmail: () => void
  // onShareEmail: () => void
  onBack?: () => void
  backLabel?: string
}

export function PosterShareActions({
  onDownload,
  // onShareDevice,
  onShareWhatsApp,
  // onShareGmail,
  // onShareEmail,
  onBack,
  backLabel = 'Kembali',
}: PosterShareActionsProps) {
  return (
    <div className="post-save-actions">
      <Button variant="primary" type="button" fullWidth onClick={onDownload}>
        <i className="ri-download-2-line" aria-hidden="true" /> Unduh PNG
      </Button>
      {/* <Button variant="secondary" type="button" fullWidth onClick={onShareDevice}>
        <i className="ri-share-forward-line" aria-hidden="true" /> Bagikan (perangkat)
      </Button> */}
      <Button variant="secondary" type="button" fullWidth onClick={onShareWhatsApp}>
        <i className="ri-whatsapp-line" aria-hidden="true" /> WhatsApp
      </Button>
      {/* <Button variant="secondary" type="button" fullWidth onClick={onShareGmail}>
        <i className="ri-mail-send-line" aria-hidden="true" /> Gmail (web)
      </Button>
      <Button variant="secondary" type="button" fullWidth onClick={onShareEmail}>
        <i className="ri-mail-line" aria-hidden="true" /> Email (mailto)
      </Button> */}
      {onBack ? (
        <Button variant="ghost" type="button" fullWidth onClick={onBack}>
          {backLabel}
        </Button>
      ) : null}
    </div>
  )
}

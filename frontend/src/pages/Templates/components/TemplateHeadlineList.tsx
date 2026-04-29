import { Button } from '../../../components/shared/Button'
import type { CustomHeadline } from '../../../types/poster'

interface TemplateHeadlineListProps {
  headlines: CustomHeadline[]
  onEdit: (headline: CustomHeadline) => void
  onToggleLock: (headlineId: string) => void
  onDelete: (headlineId: string) => void
}

export function TemplateHeadlineList({
  headlines,
  onEdit,
  onToggleLock,
  onDelete,
}: TemplateHeadlineListProps) {
  if (headlines.length === 0) return null

  return (
    <div className="template-grid">
      {headlines.map((headline) => (
        <div key={headline.id} className="template-item">
          <strong>{headline.text}</strong>
          <div className="row-actions">
            <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(headline)}>
              Edit
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => onToggleLock(headline.id)}>
              {headline.locked ? 'Unlock' : 'Lock'}
            </Button>
            <Button type="button" size="sm" className="danger" onClick={() => onDelete(headline.id)}>
              Hapus
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

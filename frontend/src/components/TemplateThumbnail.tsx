import type { CSSProperties } from 'react'
import type { TemplateDesign } from '../types/poster'

const themePreview: Record<TemplateDesign['theme'], string> = {
  'elegant-night': 'radial-gradient(circle at top right, #1e3a8a, #020617 65%)',
  'warm-classic': 'linear-gradient(160deg, #7f1d1d, #111827)',
  'soft-gray': 'linear-gradient(160deg, #475569, #1f2937)',
}

interface TemplateThumbnailProps {
  template: TemplateDesign
}

export function TemplateThumbnail({ template }: TemplateThumbnailProps) {
  const style: CSSProperties =
    template.backgroundType === 'image' && template.backgroundValue
      ? { backgroundImage: `url(${template.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundImage: themePreview[template.theme] }

  return <div className="template-thumb" style={style} aria-label={`Preview ${template.name}`} />
}

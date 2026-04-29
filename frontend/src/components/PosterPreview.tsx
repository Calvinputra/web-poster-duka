import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type {
  PosterFontFamily,
  PosterFontStyle,
  CustomHeadline,
  PosterFormData,
  PosterTextField,
  TemplateDesign,
  PosterTypographySettings,
} from '../types/poster'
import { Button } from './ui/Button'

interface PosterPreviewProps {
  value: PosterFormData
  recid?: string
  typographySettings: PosterTypographySettings
  template: TemplateDesign
  isTemplateMode: boolean
  snapToGrid: boolean
  onLayoutChange: (field: PosterTextField, x: number, y: number) => void
  onHeadlineMove: (headlineId: string, x: number, y: number) => void
  onTypographyChange: (
    field: PosterTextField,
    property: 'fontSize' | 'fontFamily' | 'fontStyle' | 'color' | 'fontWeight' | 'textShadow',
    value: number | PosterFontFamily | PosterFontStyle | string | boolean,
  ) => void
}

export function PosterPreview({
  value,
  recid,
  typographySettings,
  template,
  isTemplateMode,
  snapToGrid,
  onLayoutChange,
  onHeadlineMove,
  onTypographyChange,
}: PosterPreviewProps) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [draggingField, setDraggingField] = useState<PosterTextField | null>(null)
  const [draggingHeadline, setDraggingHeadline] = useState<string | null>(null)
  const [activeFontField, setActiveFontField] = useState<PosterTextField | null>(null)
  const deceasedName = value.deceasedName || (isTemplateMode ? '[nama]' : 'Nama almarhum/almarhumah')
  const title = value.keterangan || value.title || (isTemplateMode ? '[keterangan]' : 'Keterangan')
  const age = value.age ? `Usia ${value.age}` : isTemplateMode ? '[usia]' : ''
  const dateOfPassing = value.dateOfPassing ? `Wafat pada ${value.dateOfPassing}` : isTemplateMode ? '[tanggal wafat]' : ''
  const placeOfPassing = value.placeOfPassing ? `di ${value.placeOfPassing}` : isTemplateMode ? '[tempat wafat]' : ''
  const messageFrom = value.messageFrom || (isTemplateMode ? '[ucapan dari]' : 'Keluarga Besar / Instansi')
  const condolenceMessage =
    value.condolenceMessage ||
    (isTemplateMode
      ? '[pesan belasungkawa]'
      : 'Semoga amal ibadah beliau diterima di sisi Tuhan Yang Maha Esa, dan keluarga diberi ketabahan.')
  const imageUrl = value.imageUrl || ''
  const styleOf = (field: PosterTextField): CSSProperties => ({
    fontSize: `${typographySettings[field].fontSize}px`,
    fontFamily: typographySettings[field].fontFamily,
    fontStyle: typographySettings[field].fontStyle,
    fontWeight: typographySettings[field].fontWeight,
    color: typographySettings[field].color,
    textShadow: typographySettings[field].textShadow ? '0 2px 8px rgba(0, 0, 0, 0.45)' : 'none',
    position: 'absolute',
    left: `${template.layout[field].x}%`,
    top: `${template.layout[field].y}%`,
    transform: 'translate(-50%, -50%)',
    margin: 0,
    cursor: isTemplateMode ? 'grab' : 'default',
    userSelect: 'none',
    textAlign: 'center',
    width: '80%',
  })

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if ((!draggingField && !draggingHeadline) || !isTemplateMode || !containerRef.current) {
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const rawX = Math.max(10, Math.min(90, x))
    const rawY = Math.max(8, Math.min(92, y))
    const clampedX = snapToGrid ? Math.round(rawX / 2) * 2 : rawX
    const clampedY = snapToGrid ? Math.round(rawY / 2) * 2 : rawY
    if (draggingField) {
      onLayoutChange(draggingField, clampedX, clampedY)
    }
    if (draggingHeadline) {
      onHeadlineMove(draggingHeadline, clampedX, clampedY)
    }
  }

  const startDrag = (field: PosterTextField) => (event: PointerEvent<HTMLElement>) => {
    if (!isTemplateMode) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingField(field)
  }

  const startHeadlineDrag = (headlineId: string) => (event: PointerEvent<HTMLElement>) => {
    if (!isTemplateMode) {
      return
    }
    const current = template.headlines.find((item) => item.id === headlineId)
    if (current?.locked) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingHeadline(headlineId)
  }

  const stopDrag = () => {
    setDraggingField(null)
    setDraggingHeadline(null)
  }
  const openFieldFontEditor = (field: PosterTextField) => {
    if (!isTemplateMode) return
    setActiveFontField(field)
  }
  const adjustActiveFieldSize = (delta: number) => {
    if (!activeFontField) return
    const current = typographySettings[activeFontField].fontSize
    const next = Math.max(12, Math.min(72, current + delta))
    onTypographyChange(activeFontField, 'fontSize', next)
  }

  const headlineStyle = (headline: CustomHeadline): CSSProperties => ({
    position: 'absolute',
    left: `${headline.x}%`,
    top: `${headline.y}%`,
    transform: 'translate(-50%, -50%)',
    margin: 0,
    fontWeight: headline.fontWeight,
    fontSize: `${headline.fontSize}px`,
    color: headline.color,
    cursor: isTemplateMode && !headline.locked ? 'grab' : 'default',
    textAlign: 'center',
    width: '80%',
  })

  const templateStyle: CSSProperties =
    template.backgroundType === 'image'
      ? { backgroundImage: `url(${template.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : {}
  const headerLabel =
    template.headerMode === 'recid'
      ? recid || 'RECID-AUTO'
      : template.headerText || 'IN MEMORIAM'

  return (
    <section className="poster-shell" aria-label="Preview poster">
      <article
        ref={containerRef}
        className={`poster-template theme-${template.theme}`}
        style={templateStyle}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <p className="poster-eyebrow">{headerLabel}</p>
        <div className="poster-photo-wrap">
          {imageUrl ? (
            <img className="poster-photo" src={imageUrl} alt={`Foto ${deceasedName}`} />
          ) : (
            <div className="poster-photo placeholder" aria-hidden="true" />
          )}
        </div>
        <h2 className="poster-title-fixed">Turut Berduka Cita</h2>
        <h3 style={styleOf('deceasedName')} onPointerDown={startDrag('deceasedName')} onDoubleClick={() => openFieldFontEditor('deceasedName')}>
          {deceasedName}
        </h3>
        <p className="poster-subtitle" style={styleOf('title')} onPointerDown={startDrag('title')} onDoubleClick={() => openFieldFontEditor('title')}>
          {title}
        </p>
        {age ? (
          <p style={styleOf('age')} onPointerDown={startDrag('age')} onDoubleClick={() => openFieldFontEditor('age')}>
            {age}
          </p>
        ) : null}
        {dateOfPassing ? (
          <p style={styleOf('dateOfPassing')} onPointerDown={startDrag('dateOfPassing')} onDoubleClick={() => openFieldFontEditor('dateOfPassing')}>
            {dateOfPassing}
          </p>
        ) : null}
        {placeOfPassing ? (
          <p style={styleOf('placeOfPassing')} onPointerDown={startDrag('placeOfPassing')} onDoubleClick={() => openFieldFontEditor('placeOfPassing')}>
            {placeOfPassing}
          </p>
        ) : null}
        <p
          className="poster-message"
          style={styleOf('condolenceMessage')}
          onPointerDown={startDrag('condolenceMessage')}
          onDoubleClick={() => openFieldFontEditor('condolenceMessage')}
        >
          {condolenceMessage}
        </p>
        <p className="poster-footer-fixed">Kami yang berduka cita,</p>
        <p className="poster-sender" style={styleOf('messageFrom')} onPointerDown={startDrag('messageFrom')} onDoubleClick={() => openFieldFontEditor('messageFrom')}>
          {messageFrom}
        </p>
        {activeFontField ? (
          <div className="poster-font-quick-editor">
            <span className="poster-font-quick-label">Ukuran font</span>
            <Button type="button" size="sm" onClick={() => adjustActiveFieldSize(-2)}>A-</Button>
            <Button type="button" size="sm" onClick={() => adjustActiveFieldSize(2)}>A+</Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setActiveFontField(null)}>Tutup</Button>
          </div>
        ) : null}
        {template.headlines.map((headline) => (
          <p
            key={headline.id}
            className="poster-custom-headline"
            style={headlineStyle(headline)}
            onPointerDown={startHeadlineDrag(headline.id)}
          >
            {headline.text}
          </p>
        ))}
      </article>
    </section>
  )
}

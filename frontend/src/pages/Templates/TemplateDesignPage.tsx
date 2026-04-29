import type { ReactNode } from 'react'
import { Button } from '../../components/shared/Button'
import type { TemplateDesign } from '../../types/poster'
import { TemplateHeadlineList } from './components/TemplateHeadlineList'

interface TemplateDesignPageProps {
  activeTemplate: TemplateDesign
  newHeadlineText: string
  headlineFontSize: number
  headlineColor: string
  headlineWeight: 400 | 500 | 600 | 700 | 800
  snapToGrid: boolean
  editingHeadlineId: string
  onBackToTemplates: () => void
  onSaveTemplate: () => void
  onDuplicateTemplate: () => void
  onTemplateNameChange: (name: string) => void
  onUploadBackgroundImage: (file: File | null) => void
  onHeadlineTextChange: (value: string) => void
  onHeadlineFontSizeChange: (value: number) => void
  onHeadlineColorChange: (value: string) => void
  onHeadlineWeightChange: (value: 400 | 500 | 600 | 700 | 800) => void
  onAddOrUpdateHeadline: () => void
  onSnapToGridChange: (checked: boolean) => void
  onEditHeadline: (headline: TemplateDesign['headlines'][number]) => void
  onToggleHeadlineLock: (headlineId: string) => void
  onDeleteHeadline: (headlineId: string) => void
  formPanel: ReactNode
  previewPanel: ReactNode
}

export function TemplateDesignPage({
  activeTemplate,
  newHeadlineText,
  headlineFontSize,
  headlineColor,
  headlineWeight,
  snapToGrid,
  editingHeadlineId,
  onBackToTemplates,
  onSaveTemplate,
  onDuplicateTemplate,
  onTemplateNameChange,
  onUploadBackgroundImage,
  onHeadlineTextChange,
  onHeadlineFontSizeChange,
  onHeadlineColorChange,
  onHeadlineWeightChange,
  onAddOrUpdateHeadline,
  onSnapToGridChange,
  onEditHeadline,
  onToggleHeadlineLock,
  onDeleteHeadline,
  formPanel,
  previewPanel,
}: TemplateDesignPageProps) {
  return (
    <div className="template-design-layout">
      <section className="list-card">
        <div className="template-action-card">
          <h3>Design Template</h3>
          <div className="list-actions template-action-row">
            <label className="template-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => onUploadBackgroundImage(event.target.files?.[0] ?? null)}
              />
              <span className="ui-btn ui-btn--secondary ui-btn--sm">Upload Gambar</span>
            </label>
            <Button type="button" size="sm" variant="secondary" onClick={onBackToTemplates}>
              Kembali ke Template List
            </Button>
            <Button type="button" size="sm" onClick={onSaveTemplate}>
              Save Template
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={onDuplicateTemplate}>
              Duplicate Template
            </Button>
          </div>
        </div>
        <p className="hint-message">
          Autosave draft aktif saat mengedit. Perubahan lokal akan tetap ada walau belum klik save template.
        </p>
        <div className="template-creator template-creator--section">
          <h4>Nama Template</h4>
          <input
            placeholder="Masukkan nama template"
            value={activeTemplate.name}
            onChange={(event) => onTemplateNameChange(event.target.value)}
          />
        </div>
        <div className="template-creator template-creator--section">
          <h4>Tulisan Custom</h4>
          <input
            placeholder="Tambah/Edit tulisan custom (non-dinamis form)"
            value={newHeadlineText}
            onChange={(event) => onHeadlineTextChange(event.target.value)}
          />
          <input
            type="number"
            min={12}
            max={72}
            value={headlineFontSize}
            onChange={(event) => onHeadlineFontSizeChange(Number(event.target.value))}
            placeholder="Font size"
          />
          <input type="color" value={headlineColor} onChange={(event) => onHeadlineColorChange(event.target.value)} />
          <select
            value={headlineWeight}
            onChange={(event) => onHeadlineWeightChange(Number(event.target.value) as 400 | 500 | 600 | 700 | 800)}
          >
            <option value={400}>Weight 400</option>
            <option value={500}>Weight 500</option>
            <option value={600}>Weight 600</option>
            <option value={700}>Weight 700</option>
            <option value={800}>Weight 800</option>
          </select>
          <Button type="button" size="sm" onClick={onAddOrUpdateHeadline}>
            {editingHeadlineId ? 'Simpan Edit Tulisan' : 'Tambah Tulisan Custom'}
          </Button>
          <label className="snap-toggle">
            <input type="checkbox" checked={snapToGrid} onChange={(event) => onSnapToGridChange(event.target.checked)} />
            Snap to grid saat drag
          </label>
        </div>
        <TemplateHeadlineList
          headlines={activeTemplate.headlines}
          onEdit={onEditHeadline}
          onToggleLock={onToggleHeadlineLock}
          onDelete={onDeleteHeadline}
        />
      </section>
      {formPanel}
      {previewPanel}
    </div>
  )
}

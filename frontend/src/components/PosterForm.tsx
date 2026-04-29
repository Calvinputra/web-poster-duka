import { useState, type ChangeEvent, type FormEvent } from 'react'
import type {
  PosterFontFamily,
  PosterFontStyle,
  PosterFormData,
  PosterTextField,
  PosterTheme,
  PosterTypographySettings,
} from '../types/poster'
import { Button } from './ui/Button'

interface PosterFormProps {
  value: PosterFormData
  typographySettings: PosterTypographySettings
  isSubmitting: boolean
  submitLabel: string
  selectedTheme: PosterTheme
  isTemplateMode: boolean
  onChange: (name: keyof PosterFormData, value: string) => void
  onImageChange: (file: File | null) => void
  onThemeChange: (theme: PosterTheme) => void
  onTypographyChange: (
    field: PosterTextField,
    property: 'fontSize' | 'fontFamily' | 'fontStyle' | 'color' | 'fontWeight' | 'textShadow',
    value: number | PosterFontFamily | PosterFontStyle | string | boolean,
  ) => void
  onSubmit: () => void
  onReset: () => void
}

interface FieldConfig {
  name: keyof PosterFormData
  label: string
  placeholder: string
  required?: boolean
  multiline?: boolean
}

interface TypographyFieldConfig {
  key: PosterTextField
  label: string
}

const typographyFields: TypographyFieldConfig[] = [
  { key: 'deceasedName', label: 'Nama Almarhum' },
  { key: 'title', label: 'Gelar / Keterangan' },
  { key: 'age', label: 'Usia' },
  { key: 'dateOfPassing', label: 'Tanggal Wafat' },
  { key: 'placeOfPassing', label: 'Tempat Wafat' },
  { key: 'condolenceMessage', label: 'Pesan Doa' },
  { key: 'messageFrom', label: 'Ucapan Dari' },
]

const fields: FieldConfig[] = [
  {
    name: 'deceasedName',
    label: 'Nama almarhum/almarhumah',
    placeholder: 'Contoh: John Doe',
    required: true,
  },
  {
    name: 'title',
    label: 'Gelar / keterangan',
    placeholder: 'Contoh: Bapak / Ibu',
  },
  {
    name: 'age',
    label: 'Usia',
    placeholder: 'Contoh: 88',
  },
  {
    name: 'dateOfPassing',
    label: 'Tanggal wafat',
    placeholder: 'Contoh: 28 April 2026',
    required: true,
  },
  {
    name: 'placeOfPassing',
    label: 'Tempat wafat',
    placeholder: 'Contoh: Rumah',
  },
  {
    name: 'messageFrom',
    label: 'Ucapan dari',
    placeholder: 'Contoh: Keluarga Besar / Instansi',
  },
  {
    name: 'condolenceMessage',
    label: 'Pesan doa',
    placeholder: 'Tulis ucapan belasungkawa...',
    required: true,
    multiline: true,
  },
]

export function PosterForm({
  value,
  typographySettings,
  isSubmitting,
  submitLabel,
  selectedTheme,
  isTemplateMode,
  onChange,
  onImageChange,
  onThemeChange,
  onTypographyChange,
  onSubmit,
  onReset,
}: PosterFormProps) {
  const [isTypographyOpen, setIsTypographyOpen] = useState<boolean>(false)
  const [selectedTypographyField, setSelectedTypographyField] = useState<PosterTextField>('deceasedName')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleInputChange =
    (name: keyof PosterFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(name, event.target.value)
    }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onImageChange(file)
  }

  const requiredLabels: Array<keyof PosterFormData> = [
    'deceasedName',
    'dateOfPassing',
    'condolenceMessage',
  ]

  const handleSizeChange = (field: PosterTextField) => (event: ChangeEvent<HTMLInputElement>) => {
    const size = Number(event.target.value)
    if (Number.isNaN(size)) {
      return
    }

    const clampedSize = Math.max(12, Math.min(size, 72))
    onTypographyChange(field, 'fontSize', clampedSize)
  }

  const handleFamilyChange = (field: PosterTextField) => (event: ChangeEvent<HTMLSelectElement>) => {
    onTypographyChange(field, 'fontFamily', event.target.value as PosterFontFamily)
  }

  const handleStyleChange = (field: PosterTextField) => (event: ChangeEvent<HTMLSelectElement>) => {
    onTypographyChange(field, 'fontStyle', event.target.value as PosterFontStyle)
  }

  const handleColorChange = (field: PosterTextField) => (event: ChangeEvent<HTMLInputElement>) => {
    onTypographyChange(field, 'color', event.target.value)
  }

  const handleWeightChange = (field: PosterTextField) => (event: ChangeEvent<HTMLSelectElement>) => {
    onTypographyChange(field, 'fontWeight', Number(event.target.value))
  }

  const handleShadowChange = (field: PosterTextField) => (event: ChangeEvent<HTMLInputElement>) => {
    onTypographyChange(field, 'textShadow', event.target.checked)
  }
  const typographyFieldMap: Record<PosterTextField, TypographyFieldConfig> = typographyFields.reduce(
    (accumulator, item) => ({ ...accumulator, [item.key]: item }),
    {} as Record<PosterTextField, TypographyFieldConfig>,
  )
  const formToTypographyField: Partial<Record<keyof PosterFormData, PosterTextField>> = {
    deceasedName: 'deceasedName',
    title: 'title',
    age: 'age',
    dateOfPassing: 'dateOfPassing',
    placeOfPassing: 'placeOfPassing',
    condolenceMessage: 'condolenceMessage',
    messageFrom: 'messageFrom',
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <header className="form-header">
        <h1>Generator Poster Turut Berduka Cita</h1>
        <p>Isi form sederhana, lalu poster otomatis dibuat dengan template konsisten.</p>
      </header>

      <div className="form-fields">
        {fields.map((field) => (
          <div key={field.name} className="field-row">
            <label className="form-label">
              <span className="label-with-action">
                <span>
                  {field.label}
                  {requiredLabels.includes(field.name) ? <strong className="required">*</strong> : null}
                </span>
                {formToTypographyField[field.name] ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="font-setting-button"
                    onClick={() => {
                      setSelectedTypographyField(formToTypographyField[field.name] as PosterTextField)
                      setIsTypographyOpen(true)
                    }}
                  >
                    Atur Font
                  </Button>
                ) : null}
              </span>
              {field.multiline ? (
                <textarea
                  name={field.name}
                  value={value[field.name]}
                  placeholder={field.placeholder}
                  onChange={handleInputChange(field.name)}
                  rows={4}
                  required={field.required}
                />
              ) : (
                <input
                  name={field.name}
                  value={value[field.name]}
                  placeholder={field.placeholder}
                  onChange={handleInputChange(field.name)}
                  required={field.required}
                />
              )}
            </label>
          </div>
        ))}

        <label className="form-label">
          <span>
            Foto
            <strong className="required">*</strong>
          </span>
          <input type="file" accept="image/*" onChange={handleFileChange} required={!value.imageUrl} />
        </label>
      </div>

      <label className="form-label">
        <span>Pilihan Tema / Design</span>
        <select
          value={selectedTheme}
          onChange={(event) => onThemeChange(event.target.value as PosterTheme)}
        >
          <option value="elegant-night">Elegant Night</option>
          <option value="warm-classic">Warm Classic</option>
          <option value="soft-gray">Soft Gray</option>
        </select>
      </label>

      {isTemplateMode ? (
        <p className="hint-message">
          Mode template aktif: drag elemen teks di preview untuk atur peletakan global.
        </p>
      ) : null}

      {isTypographyOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Popup pengaturan font">
          <section className="modal-card">
            <header className="modal-header">
              <h3>Pengaturan Font: {typographyFieldMap[selectedTypographyField].label}</h3>
              <Button type="button" size="sm" variant="secondary" className="close-button" onClick={() => setIsTypographyOpen(false)}>
                Tutup
              </Button>
            </header>
            <div className="typography-grid rows">
              <fieldset className="typography-item row">
                <legend>{typographyFieldMap[selectedTypographyField].label}</legend>
                <label className="form-label small">
                  <span>Font Size (px)</span>
                  <input
                    type="number"
                    min={12}
                    max={72}
                    value={typographySettings[selectedTypographyField].fontSize}
                    onChange={handleSizeChange(selectedTypographyField)}
                  />
                </label>
                <label className="form-label small">
                  <span>Font Family</span>
                  <select
                    value={typographySettings[selectedTypographyField].fontFamily}
                    onChange={handleFamilyChange(selectedTypographyField)}
                  >
                    <option value="sans-serif">Sans Serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </label>
                <label className="form-label small">
                  <span>Font Style</span>
                  <select
                    value={typographySettings[selectedTypographyField].fontStyle}
                    onChange={handleStyleChange(selectedTypographyField)}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </label>
                <label className="form-label small">
                  <span>Color</span>
                  <input type="color" value={typographySettings[selectedTypographyField].color} onChange={handleColorChange(selectedTypographyField)} />
                </label>
                <label className="form-label small">
                  <span>Weight</span>
                  <select value={typographySettings[selectedTypographyField].fontWeight} onChange={handleWeightChange(selectedTypographyField)}>
                    <option value={400}>400</option>
                    <option value={500}>500</option>
                    <option value={600}>600</option>
                    <option value={700}>700</option>
                    <option value={800}>800</option>
                  </select>
                </label>
                <label className="form-label small shadow-toggle">
                  <span>Text Shadow</span>
                  <input
                    type="checkbox"
                    checked={typographySettings[selectedTypographyField].textShadow}
                    onChange={handleShadowChange(selectedTypographyField)}
                  />
                </label>
              </fieldset>
            </div>
          </section>
        </div>
      ) : null}

      <div className="form-actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onReset} disabled={isSubmitting}>
          Reset Form
        </Button>
      </div>
    </form>
  )
}

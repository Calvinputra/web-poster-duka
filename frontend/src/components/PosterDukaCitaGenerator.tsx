import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { toPng } from 'html-to-image'
import type { PosterFormData, PosterRecord, TemplateDesign } from '../types/poster'
import { DEFAULT_CONDOLENCE_MESSAGE } from '../types/poster'
import { useToast } from '../context/ToastContext'
import { PosterShareModal } from './PosterShareModal'
import { TemplateThumbnail } from './TemplateThumbnail'
import { Button } from './ui/Button'

const RELATION_KEYS = ['ayahIbu', 'suamiIstri', 'anak', 'menantu', 'cucu', 'cicit'] as const
type RelationKey = (typeof RELATION_KEYS)[number]
type FamilyMap = Record<RelationKey, string[]>

const RELATION_PHRASE: Record<RelationKey, string> = {
  ayahIbu: 'Ayah/Ibu',
  suamiIstri: 'Suami/Istri',
  anak: 'Anak',
  menantu: 'Menantu',
  cucu: 'Cucu',
  cicit: 'Cicit',
}

const RELATION_FORM: { key: RelationKey; label: string }[] = [
  { key: 'ayahIbu', label: 'Ayah/Ibu' },
  { key: 'suamiIstri', label: 'Suami/Istri' },
  { key: 'anak', label: 'Anak'},
  { key: 'menantu', label: 'Menantu' },
  { key: 'cucu', label: 'Cucu' },
  { key: 'cicit', label: 'Cicit' },
]

function relationLine(key: RelationKey, name: string): string {
  return `${RELATION_PHRASE[key]}: ${name.trim()}`
}

/** Satu baris lama "Ayah ibu dari X" → kategori + nama */
function parseStoredRelationLine(line: string): { key: RelationKey; name: string } | null {
  const t = line.trim()
  if (!t) return null
  for (const k of RELATION_KEYS) {
    const prefix = `${RELATION_PHRASE[k]} dari `
    if (t.length >= prefix.length && t.toLowerCase().startsWith(prefix.toLowerCase())) {
      const name = t.slice(prefix.length).trim()
      if (name) return { key: k, name }
      return null
    }
  }
  return { key: 'ayahIbu', name: t }
}

const EMPTY_FAMILY: FamilyMap = {
  ayahIbu: [''],
  suamiIstri: [''],
  anak: [''],
  menantu: [''],
  cucu: [''],
  cicit: [''],
}

/** Tema poster BDC tetap minimal (krem); tidak lagi dipilih pengguna */
const DUKA_POSTER_THEME = 'putih'
const PREVIEW_THEME_CLASS = 'theme-soft-light'
const BDC_THEME_CLASS: Record<TemplateDesign['theme'], string> = {
  'elegant-night': 'theme-elegant-night',
  'warm-classic': 'theme-midnight-gold',
  'soft-gray': 'theme-soft-light',
}

const ZONE_OPTIONS = ['WIB', 'WITA', 'WIT'] as const

interface PosterDukaCitaGeneratorProps {
  initialValue: PosterFormData
  isSubmitting: boolean
  submitLabel: string
  templates: TemplateDesign[]
  selectedTemplateId: string
  mobileSubmitAfterPreview?: boolean
  hideBackButton?: boolean
  onTemplateSelect: (templateId: string) => void
  onSubmit: (value: PosterFormData) => Promise<PosterRecord | null>
  onBack: () => void
}

function sanitizeFileBaseName(name: string): string {
  const t = name.trim().replace(/[^a-zA-Z0-9\s.-]/g, '').replace(/\s+/g, '-')
  return t || 'berita-duka'
}

function buildSharePlainText(parts: {
  deceased: string
  age: string
  relationLines: string[]
  deathLine: string
  disemayam: string
  prosesiLabel: string
  prosesiDetail: string[]
  pesan: string
  penutup: string
}): string {
  const lines: string[] = [
    'BERITA DUKA CITA',
    '',
    'Telah berpulang dengan tenang:',
    parts.deceased.trim() || '—',
    ...(parts.age.trim() ? [`Usia ${parts.age.trim()} tahun`, ''] : ['']),
    ...parts.relationLines,
    ...(parts.relationLines.length ? [''] : []),
    ...(parts.deathLine.trim() ? [parts.deathLine.trim(), ''] : []),
    `Disemayamkan di: ${parts.disemayam.trim() || '—'}`,
    '',
    parts.prosesiLabel,
    ...parts.prosesiDetail,
    '',
    parts.pesan.trim() || '—',
    '',
    'Hormat kami,',
    parts.penutup.trim() || '—',
  ]
  return lines.join('\n')
}

const empty = (v?: string): string => v ?? ''

function parseFamilyData(raw: string, relationFallback: string): FamilyMap {
  const trimmed = raw?.trim() ?? ''
  if (trimmed) {
    try {
      const p = JSON.parse(trimmed) as Record<string, unknown>
      const next: FamilyMap = { ...EMPTY_FAMILY }
      for (const k of RELATION_KEYS) {
        const arr = p[k]
        if (Array.isArray(arr) && arr.every((x) => typeof x === 'string')) {
          next[k] = arr.length ? [...arr] : ['']
        }
      }
      const hasNew = RELATION_KEYS.some((k) => next[k].some((s) => s.trim() !== ''))
      if (!hasNew) {
        const legacy = ['suamiIstri', 'anak', 'menantu', 'cucu', 'cicit'] as const
        for (const k of legacy) {
          const arr = p[k]
          if (Array.isArray(arr) && arr.every((x) => typeof x === 'string')) {
            next[k] = arr.length ? [...arr] : ['']
          }
        }
      }
      if (RELATION_KEYS.some((k) => next[k].some((s) => s.trim()))) return next
    } catch {
      /* fall through */
    }
  }
  const lines = relationFallback
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length) {
    const next: FamilyMap = { ...EMPTY_FAMILY }
    for (const line of lines) {
      const parsed = parseStoredRelationLine(line)
      if (!parsed) continue
      const { key, name } = parsed
      const cur = next[key]
      if (cur.length === 1 && cur[0] === '') next[key] = [name]
      else next[key] = [...cur, name]
    }
    return next
  }
  return { ...EMPTY_FAMILY }
}

function serializeFamilyData(f: FamilyMap): string {
  const o: Record<string, string[]> = {}
  for (const k of RELATION_KEYS) {
    o[k] = f[k]
  }
  return JSON.stringify(o)
}

function familyToRelationSummary(f: FamilyMap): string {
  const lines: string[] = []
  for (const k of RELATION_KEYS) {
    for (const line of f[k]) {
      const t = line.trim()
      if (t) lines.push(relationLine(k, t))
    }
  }
  return lines.join('\n')
}

/** Parse YYYY-MM-DD, DD/MM/YYYY (ID), or Date.parse fallback → {y,m,d} local calendar */
function parseFlexibleDateParts(raw: string): { y: number; m: number; d: number } | null {
  const t = raw.trim()
  if (!t) return null
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const d = Number(iso[3])
    if (y && m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d }
  }
  const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(t)
  if (dmy) {
    const d = Number(dmy[1])
    const m = Number(dmy[2])
    const y = Number(dmy[3])
    if (y && m >= 1 && m <= 12 && d >= 1 && d <= 31) return { y, m, d }
  }
  const parsed = Date.parse(t)
  if (!Number.isNaN(parsed)) {
    const dt = new Date(parsed)
    return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() }
  }
  return null
}

function formatIdLongDate(parts: { y: number; m: number; d: number }): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(parts.y, parts.m - 1, parts.d))
}

function formatDisplayDateId(dateValue: string): string {
  const parts = parseFlexibleDateParts(dateValue)
  if (!parts) return dateValue.trim()
  return formatIdLongDate(parts)
}

/** Normalize stored tanggal wafat to YYYY-MM-DD for &lt;input type="date"&gt; when possible */
function normalizeDateOfPassingForInput(raw: string): string {
  const parts = parseFlexibleDateParts(raw)
  if (!parts) return raw.trim()
  return `${parts.y}-${String(parts.m).padStart(2, '0')}-${String(parts.d).padStart(2, '0')}`
}

/** Jangan isi kalimat wafat dengan teks ucapan belasungkawa (data lama / salah tempel) */
function sanitizeDeathStatementInput(stored: string, condolenceMessage: string): string {
  const s = stored.trim()
  if (!s) return ''
  const c = condolenceMessage.trim()
  if (c && s === c) return ''
  if (/bela\s*sungkawa|belasungkawa|turut berduka cita|kami segenap keluarga/i.test(s)) return ''
  return stored
}

function formatTimeDot(timeValue: string): string {
  if (!timeValue?.trim()) return ''
  const parts = timeValue.trim().split(':')
  const h = parts[0]
  const min = parts[1]
  const sec = parts[2]
  if (!h || min === undefined) return timeValue
  if (sec !== undefined && sec !== '' && sec !== '00') {
    return `${h}.${min}.${sec}`
  }
  return `${h}.${min}`
}

function processionHeading(jenis: string): string {
  const j = jenis.toLowerCase()
  if (j === 'dikremasi') return 'AKAN DIKREMASI PADA'
  return 'AKAN DIKEBUMIKAN PADA'
}

function defaultDeathSentence(place: string, dateRaw: string, timeRaw: string, zoneRaw: string): string {
  const parts = parseFlexibleDateParts(dateRaw)
  const tgl = parts ? formatIdLongDate(parts) : ''
  const loc = place.trim()
  const tz = (zoneRaw || 'WIB').trim() || 'WIB'
  const t = timeRaw.trim()
  const timeDot = formatTimeDot(t)
  const tail = t && timeDot ? ` pukul ${timeDot} ${tz}` : t ? ` ${tz}` : ''

  if (!loc && !tgl && !tail) return ''
  if (loc && tgl) return `Telah meninggal dunia di ${loc} pada tanggal ${tgl}${tail}.`
  if (tgl) return `Telah meninggal dunia pada tanggal ${tgl}${tail}.`
  if (loc && tail) return `Telah meninggal dunia di ${loc}${tail}.`
  return `Telah meninggal dunia di ${loc}.`
}

function resolveInitialDeathStatement(iv: PosterFormData): string {
  const sanitized = sanitizeDeathStatementInput(empty(iv.deathStatement), empty(iv.condolenceMessage))
  if (sanitized) return sanitized
  const dateNorm = normalizeDateOfPassingForInput(empty(iv.dateOfPassing)) || empty(iv.dateOfPassing)
  const auto = defaultDeathSentence(
    empty(iv.placeOfPassing),
    dateNorm,
    empty(iv.timeOfPassing),
    empty(iv.timeOfPassingZone) || 'WIB',
  )
  return auto || 'Telah meninggal dunia.'
}

function isAutoManagedDeathStatement(current: string, previousAuto: string): boolean {
  const normalized = current.trim()
  if (!normalized) return true
  if (normalized === 'Telah meninggal dunia.') return true
  return normalized === previousAuto.trim()
}

export function PosterDukaCitaGenerator({
  initialValue,
  isSubmitting,
  submitLabel,
  templates,
  selectedTemplateId,
  mobileSubmitAfterPreview = false,
  hideBackButton = false,
  onTemplateSelect,
  onSubmit,
  onBack,
}: PosterDukaCitaGeneratorProps) {
  const toast = useToast()
  const posterRef = useRef<HTMLElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [postSaveOpen, setPostSaveOpen] = useState(false)
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(empty(initialValue.imageUrl))
  const [photoError, setPhotoError] = useState('')
  const [family, setFamily] = useState<FamilyMap>(() =>
    parseFamilyData(empty(initialValue.familyData), empty(initialValue.relationSummary)),
  )
  const [form, setForm] = useState({
    nama: empty(initialValue.deceasedName),
    keterangan: empty(initialValue.keterangan) || empty(initialValue.title),
    usia: empty(initialValue.age),
    tanggalWafat: normalizeDateOfPassingForInput(empty(initialValue.dateOfPassing)),
    waktuWafat: empty(initialValue.timeOfPassing),
    zonaWafat: empty(initialValue.timeOfPassingZone) || 'WIB',
    tempatWafat: empty(initialValue.placeOfPassing),
    tempatDisemayamkan: empty(initialValue.placeLaidOut),
    jenisProsesi: empty(initialValue.processionType) || 'dikebumikan',
    hariTanggalProsesi: empty(initialValue.processionDate),
    pukulProsesi: empty(initialValue.processionTime),
    zonaProsesi: empty(initialValue.processionTimeZone) || 'WIB',
    tempatProsesi: empty(initialValue.processionPlace),
    ucapanDari: empty(initialValue.messageFrom),
    pesan: empty(initialValue.condolenceMessage) || DEFAULT_CONDOLENCE_MESSAGE,
    deathStatement: resolveInitialDeathStatement(initialValue),
  })

  useEffect(() => {
    setForm({
      nama: empty(initialValue.deceasedName),
      keterangan: empty(initialValue.keterangan) || empty(initialValue.title),
      usia: empty(initialValue.age),
      tanggalWafat: normalizeDateOfPassingForInput(empty(initialValue.dateOfPassing)),
      waktuWafat: empty(initialValue.timeOfPassing),
      zonaWafat: empty(initialValue.timeOfPassingZone) || 'WIB',
      tempatWafat: empty(initialValue.placeOfPassing),
      tempatDisemayamkan: empty(initialValue.placeLaidOut),
      jenisProsesi: empty(initialValue.processionType) || 'dikebumikan',
      hariTanggalProsesi: empty(initialValue.processionDate),
      pukulProsesi: empty(initialValue.processionTime),
      zonaProsesi: empty(initialValue.processionTimeZone) || 'WIB',
      tempatProsesi: empty(initialValue.processionPlace),
      ucapanDari: empty(initialValue.messageFrom),
      pesan: empty(initialValue.condolenceMessage) || DEFAULT_CONDOLENCE_MESSAGE,
      deathStatement: resolveInitialDeathStatement(initialValue),
    })
    setPhotoUrl(empty(initialValue.imageUrl))
    setFamily(parseFamilyData(empty(initialValue.familyData), empty(initialValue.relationSummary)))
  }, [initialValue])

  const deathLineDisplay = useMemo(() => {
    const custom = form.deathStatement.trim()
    if (custom) return custom
    return defaultDeathSentence(form.tempatWafat, form.tanggalWafat, form.waktuWafat, form.zonaWafat)
  }, [form.deathStatement, form.tempatWafat, form.tanggalWafat, form.waktuWafat, form.zonaWafat])

  const relationPreviewLines = useMemo(() => {
    const out: string[] = []
    for (const k of RELATION_KEYS) {
      for (const raw of family[k]) {
        const t = raw.trim().replace(/\s+/g, ' ')
        if (t) out.push(relationLine(k, t))
      }
    }
    return out
  }, [family])

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'tanggalWafat' || key === 'waktuWafat' || key === 'zonaWafat' || key === 'tempatWafat') {
        const prevAuto = defaultDeathSentence(prev.tempatWafat, prev.tanggalWafat, prev.waktuWafat, prev.zonaWafat)
        if (isAutoManagedDeathStatement(prev.deathStatement, prevAuto)) {
          next.deathStatement =
            defaultDeathSentence(next.tempatWafat, next.tanggalWafat, next.waktuWafat, next.zonaWafat) || 'Telah meninggal dunia.'
        }
      }
      return next
    })
  }

  const updateFamilyName = (categoryKey: RelationKey, index: number, value: string) => {
    const singleLine = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ')
    setFamily((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((name, itemIndex) => (itemIndex === index ? singleLine : name)),
    }))
  }

  const addFamilyName = (categoryKey: RelationKey) => {
    setFamily((prev) => ({ ...prev, [categoryKey]: [...prev[categoryKey], ''] }))
  }

  const removeFamilyName = (categoryKey: RelationKey, index: number) => {
    setFamily((prev) => ({
      ...prev,
      [categoryKey]:
        prev[categoryKey].length === 1 ? [''] : prev[categoryKey].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const readImageFile = (file: File, onData: (url: string) => void, onErr: (msg: string) => void) => {
    if (!file.type.startsWith('image/')) {
      onErr('File harus berupa gambar.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => onData(String(reader.result || ''))
    reader.onerror = () => onErr('Gagal membaca file.')
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setPhotoError('')
    if (!file) return
    readImageFile(
      file,
      setPhotoUrl,
      (msg) => {
        setPhotoError(msg)
        event.target.value = ''
      },
    )
  }

  const handleSave = async () => {
    const payload: PosterFormData = {
      deceasedName: form.nama,
      title: form.keterangan,
      keterangan: form.keterangan,
      age: form.usia,
      dateOfPassing: form.tanggalWafat,
      timeOfPassing: form.waktuWafat,
      timeOfPassingZone: form.zonaWafat || 'WIB',
      imageUrl: photoUrl,
      placeOfPassing: form.tempatWafat,
      placeLaidOut: form.tempatDisemayamkan,
      processionType: form.jenisProsesi,
      processionDate: form.hariTanggalProsesi,
      processionTime: form.pukulProsesi,
      processionTimeZone: form.zonaProsesi || 'WIB',
      processionPlace: form.tempatProsesi,
      messageFrom: form.ucapanDari,
      condolenceMessage: form.pesan,
      theme: DUKA_POSTER_THEME,
      familyData: serializeFamilyData(family),
      relationSummary: familyToRelationSummary(family),
      deathStatement: form.deathStatement,
    }
    const record = await onSubmit(payload)
    if (record) {
      setPostSaveOpen(true)
    }
  }

  const prosesiTanggalFormatted = formatDisplayDateId(form.hariTanggalProsesi)
  const prosesiWaktuFormatted = form.pukulProsesi
    ? `${formatTimeDot(form.pukulProsesi)} ${(form.zonaProsesi || 'WIB').trim()}`
    : ''
  const selectedTemplate = useMemo<TemplateDesign | null>(() => {
    if (!templates.length) return null
    return templates.find((item) => item.id === selectedTemplateId) ?? templates[0]
  }, [selectedTemplateId, templates])
  const previewThemeClass = selectedTemplate ? BDC_THEME_CLASS[selectedTemplate.theme] : PREVIEW_THEME_CLASS
  const previewTemplateStyle = useMemo<CSSProperties | undefined>(() => {
    if (!selectedTemplate) return undefined
    if (selectedTemplate.backgroundType !== 'image' || !selectedTemplate.backgroundValue) return undefined
    return {
      backgroundImage: `url(${selectedTemplate.backgroundValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }, [selectedTemplate])

  const sharePlain = useMemo(
    () =>
      buildSharePlainText({
        deceased: form.nama,
        age: form.usia,
        relationLines: relationPreviewLines,
        deathLine: deathLineDisplay,
        disemayam: form.tempatDisemayamkan,
        prosesiLabel: processionHeading(form.jenisProsesi),
        prosesiDetail: [
          form.hariTanggalProsesi ? `Hari/Tanggal: ${prosesiTanggalFormatted || form.hariTanggalProsesi}` : '',
          form.pukulProsesi ? `Pukul: ${prosesiWaktuFormatted}` : '',
          form.tempatProsesi.trim() ? `Tempat: ${form.tempatProsesi.trim()}` : '',
        ].filter(Boolean),
        pesan: form.pesan,
        penutup: form.ucapanDari,
      }),
    [
      deathLineDisplay,
      form.hariTanggalProsesi,
      form.jenisProsesi,
      form.nama,
      form.pesan,
      form.pukulProsesi,
      form.tempatDisemayamkan,
      form.tempatProsesi,
      form.ucapanDari,
      form.usia,
      prosesiTanggalFormatted,
      prosesiWaktuFormatted,
      relationPreviewLines,
    ],
  )

  const handleDownloadPng = useCallback(async () => {
    const node = posterRef.current
    if (!node) return
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `${sanitizeFileBaseName(form.nama)}.png`
      a.click()
      toast.success('Gambar poster diunduh.')
    } catch {
      toast.error('Gagal membuat gambar unduhan. Coba lagi atau periksa foto (ukuran file).')
    }
  }, [form.nama, toast])

  const handleShareWhatsApp = useCallback(() => {
    const u = `https://wa.me/?text=${encodeURIComponent(sharePlain)}`
    window.open(u, '_blank', 'noopener,noreferrer')
  }, [sharePlain])

  const closePostSave = () => {
    setPostSaveOpen(false)
  }

  return (
    <div className="poster-generator-page">
      <section className="form-card bdc-form-card">
        {!hideBackButton ? (
          <div className="list-actions">
            <Button variant="secondary" size="sm" type="button" onClick={onBack}>
              Kembali
            </Button>
          </div>
        ) : null}
        <header className="bdc-form-intro">
          <div className="bdc-template-toolbar">
            <Button variant="secondary" size="sm" type="button" onClick={() => setTemplatePickerOpen(true)}>
              Pilih template terlebih dahulu
            </Button>
            <span className="bdc-template-active-label">Template aktif: {selectedTemplate?.name ?? '-'}</span>
          </div>
          <h1>Berita Duka Cita</h1>
          <p>Isi data sesuai urutan poster. Preview di kanan memakai format tulisan berita duka (minimalis).</p>
        </header>

        <fieldset className="bdc-fieldset">
          <legend>Data mendiang</legend>
          <label className="form-label">
            <span>Foto mendiang *</span>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} />
          </label>
          {photoError ? <p className="error-message">{photoError}</p> : null}
          <label className="form-label">
            <span>Nama lengkap *</span>
            <input value={form.nama} onChange={(e) => update('nama', e.target.value)} placeholder="Ny. / Bpk. ..." />
          </label>
          <label className="form-label">
            <span>Keterangan (opsional)</span>
            <input value={form.keterangan} onChange={(e) => update('keterangan', e.target.value)} placeholder="Contoh: Ny." />
          </label>
          <label className="form-label">
            <span>Usia</span>
            <input value={form.usia} onChange={(e) => update('usia', e.target.value.replace(/\D/g, ''))} placeholder="71" />
          </label>
          <div className="bdc-three-col-inputs">
            <label className="form-label">
              <span>Tanggal wafat *</span>
              <input type="date" value={form.tanggalWafat} onChange={(e) => update('tanggalWafat', e.target.value)} />
            </label>
            <label className="form-label">
              <span>Jam wafat</span>
              <input type="time" value={form.waktuWafat} onChange={(e) => update('waktuWafat', e.target.value)} />
            </label>
            <label className="form-label">
              <span>Zona waktu</span>
              <select value={form.zonaWafat} onChange={(e) => update('zonaWafat', e.target.value)}>
                {ZONE_OPTIONS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="form-label">
            <span>Tempat wafat</span>
            <input
              value={form.tempatWafat}
              onChange={(e) => update('tempatWafat', e.target.value)}
              placeholder="Contoh: RS Daud Arif KTL"
            />
          </label>
          <label className="form-label">
            <span>Kalimat wafat (bukan pesan belasungkawa)</span>
            <textarea
              value={form.deathStatement}
              onChange={(e) => update('deathStatement', e.target.value)}
              rows={3}
              placeholder="Ubah sesuai kebutuhan. Kosongkan isi untuk kembali ke kalimat otomatis dari tanggal, waktu, dan tempat wafat."
            />
          </label>
        </fieldset>

        <fieldset className="bdc-fieldset">
          <legend>Keluarga yang ditinggalkan (opsional)</legend>


          <div className="bdc-relation-grid">
            {RELATION_FORM.map((section) => (
              <div key={section.key} className="bdc-relation-card">
                <p className="bdc-relation-card-title ">{section.label}</p>
                {family[section.key].map((name, index) => (
                  <div key={`${section.key}-${index}`} className="bdc-family-row">
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => updateFamilyName(section.key, index, event.target.value)}
                      placeholder={`Nama (satu baris, contoh: Alm. …)`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="bdc-delete-family"
                      onClick={() => removeFamilyName(section.key, index)}
                      aria-label="Hapus"
                    >
                      <i className="ri-delete-bin-6-line bdc-trash-icon" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" type="button" onClick={() => addFamilyName(section.key)}>
                  + Tambah {section.label}
                </Button>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="bdc-fieldset">
          <legend>Persemayaman &amp; prosesi</legend>
          <label className="form-label">
            <span>Disemayamkan di</span>
            <input
              value={form.tempatDisemayamkan}
              onChange={(e) => update('tempatDisemayamkan', e.target.value)}
              placeholder="Nama rumah duka / alamat"
            />
          </label>
          <label className="form-label">
            <span>Jenis prosesi</span>
            <select value={form.jenisProsesi} onChange={(e) => update('jenisProsesi', e.target.value)}>
              <option value="dikebumikan">Dikebumikan</option>
              <option value="dikremasi">Dikremasi</option>
            </select>
          </label>
          <div className="bdc-three-col-inputs">
            <label className="form-label">
              <span>Tanggal prosesi</span>
              <input type="date" value={form.hariTanggalProsesi} onChange={(e) => update('hariTanggalProsesi', e.target.value)} />
            </label>
            <label className="form-label">
              <span>Jam prosesi</span>
              <input type="time" value={form.pukulProsesi} onChange={(e) => update('pukulProsesi', e.target.value)} />
            </label>
            <label className="form-label">
              <span>Zona waktu</span>
              <select value={form.zonaProsesi} onChange={(e) => update('zonaProsesi', e.target.value)}>
                {ZONE_OPTIONS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="form-label">
            <span>Tempat prosesi</span>
            <input value={form.tempatProsesi} onChange={(e) => update('tempatProsesi', e.target.value)} placeholder="TPU / Krematorium ..." />
          </label>
        </fieldset>

        <fieldset className="bdc-fieldset">
          <legend>Ucapan</legend>
          <label className="form-label">
            <span>Pesan belasungkawa *</span>
            <textarea value={form.pesan} onChange={(e) => update('pesan', e.target.value)} rows={4} />
          </label>
          <label className="form-label">
            <span>Hormat kami / penutup</span>
            <input
              value={form.ucapanDari}
              onChange={(e) => update('ucapanDari', e.target.value)}
              placeholder="Nama keluarga / instansi"
            />
          </label>
        </fieldset>

        <div className={`form-actions ${mobileSubmitAfterPreview ? 'form-actions-desktop-only' : ''}`}>
          <Button variant="primary" type="button" disabled={isSubmitting} onClick={() => void handleSave()}>
            {isSubmitting ? 'Menyimpan...' : submitLabel}
          </Button>
        </div>
      </section>

      <div className="preview-wrap bdc-preview-shell">
        <article
          ref={posterRef}
          className={`bdc-poster ${previewThemeClass} ${previewTemplateStyle ? 'bdc-poster-template-bg' : ''}`}
          style={previewTemplateStyle}
        >
          <h1 className="bdc-headline">BERITA DUKA CITA</h1>
          <p className="bdc-subline">Telah berpulang dengan tenang:</p>

          <div className="bdc-photo-ring">
            {photoUrl ? <img src={photoUrl} alt="" className="bdc-photo" /> : <div className="bdc-photo bdc-photo-placeholder" />}
          </div>

          <h2 className="bdc-name">{form.nama.trim() || 'Nama Almarhum/Almarhumah'}</h2>
          {form.keterangan.trim() ? <p className="bdc-keterangan">{form.keterangan.trim()}</p> : null}
          {form.usia.trim() ? <p className="bdc-age">Usia {form.usia.trim()} tahun</p> : null}

          {deathLineDisplay ? <p className="bdc-death-line">{deathLineDisplay}</p> : null}

          {relationPreviewLines.length > 0 ? (
            <div className="bdc-relation-block bdc-relation-block-lines">
              <p className="bdc-relation-heading">Keluarga yang ditinggalkan</p>
              <ul className="bdc-relation-ul">
                {relationPreviewLines.map((text, index) => (
                  <li key={`rel-${index}`} className="bdc-relation-li">
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="bdc-logistics">
            <div className="bdc-logistics-box">
              <h3 className="bdc-logistics-title">DISEMAYAMKAN DI</h3>
              <p className="bdc-logistics-body">{form.tempatDisemayamkan.trim() || '—'}</p>
            </div>
            <div className="bdc-logistics-box">
              <h3 className="bdc-logistics-title">{processionHeading(form.jenisProsesi)}</h3>
              <dl className="bdc-dl">
                {form.hariTanggalProsesi ? (
                  <>
                    <dt>Hari/Tanggal</dt>
                    <dd>{prosesiTanggalFormatted || form.hariTanggalProsesi}</dd>
                  </>
                ) : null}
                {form.pukulProsesi ? (
                  <>
                    <dt>Pukul</dt>
                    <dd>{prosesiWaktuFormatted}</dd>
                  </>
                ) : null}
                {form.tempatProsesi.trim() ? (
                  <>
                    <dt>Tempat</dt>
                    <dd>{form.tempatProsesi.trim()}</dd>
                  </>
                ) : null}
                {!form.hariTanggalProsesi && !form.pukulProsesi && !form.tempatProsesi.trim() ? (
                  <dd className="bdc-muted">—</dd>
                ) : null}
              </dl>
            </div>
          </div>

          <p className="bdc-condolence">{form.pesan.trim() || '…'}</p>
          <p className="bdc-hormat">Hormat kami,</p>
          <p className="bdc-signature">{form.ucapanDari.trim() || 'Nama pengirim'}</p>
        </article>
        {mobileSubmitAfterPreview ? (
          <div className="form-actions form-actions-mobile-preview">
            <Button variant="primary" type="button" disabled={isSubmitting} onClick={() => void handleSave()}>
              {isSubmitting ? 'Menyimpan...' : submitLabel}
            </Button>
          </div>
        ) : null}
      </div>
      {templatePickerOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setTemplatePickerOpen(false)}>
          <section className="modal-card bdc-template-modal" onClick={(event) => event.stopPropagation()}>
            <header className="modal-header">
              <h3>Pilih template poster</h3>
              <Button variant="ghost" size="sm" type="button" className="close-button icon-close" onClick={() => setTemplatePickerOpen(false)}>
                ×
              </Button>
            </header>
            <div className="bdc-template-list">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`bdc-template-item ${template.id === selectedTemplate?.id ? 'active' : ''}`}
                  onClick={() => {
                    onTemplateSelect(template.id)
                    setTemplatePickerOpen(false)
                  }}
                >
                  <TemplateThumbnail template={template} />
                  <div className="bdc-template-item-text">
                    <strong>{template.name}</strong>
                    <span>Dummy preview teks template</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <PosterShareModal
        isOpen={postSaveOpen}
        onClose={closePostSave}
        onDownload={() => void handleDownloadPng()}
        onShareWhatsApp={handleShareWhatsApp}
        onBack={() => {
          closePostSave()
          onBack()
        }}
        backLabel="Ke daftar poster"
      />
    </div>
  )
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPoster, deletePoster, getPosterById, listPosters, updatePoster } from './services/posters'
import { createTemplate, deleteTemplate, listTemplates, updateTemplate } from './services/templates'
import { useToast } from './context/ToastContext'
import { type ManagementTableColumn } from './components/shared/ManagementTable'
import { PosterDukaCitaCard, PosterDukaCitaGenerator, PosterPreview } from './pages/Posters/components'
import { PosterForm } from './components/PosterForm'
import { PosterShareActions } from './components/PosterShareActions'
import { PosterShareModal } from './components/shared/PosterShareModal'
import { ConfirmModal } from './components/shared/ConfirmModal'
import { TemplateThumbnail } from './components/TemplateThumbnail'
import { Button } from './components/shared/Button'
import { PostersListPage } from './pages/Posters/PostersListPage'
import { TemplatesListPage } from './pages/Templates/TemplatesListPage'
import { TemplateDesignPage } from './pages/Templates/TemplateDesignPage'
import { PosterEditorPage } from './pages/Posters/PosterEditorPage'
import { usePosterList, type PosterSortKey } from './hooks/usePosterList'
import { useTemplateManager } from './hooks/useTemplateManager'
import { formatDateTime, formatDateTimeWithSeconds, formatYmdWithTime } from './pages/Posters/utils/dateFormatters'
import './styles/shared.css'
import './styles/posters.css'
import './styles/templates.css'
import {
  type CustomHeadline,
  type PosterFormData,
  type PosterFontFamily,
  type PosterFontStyle,
  type PosterRecord,
  type PosterTextField,
  type PosterTheme,
  type TemplateDesign,
  type PosterTypographySettings,
  DEFAULT_CONDOLENCE_MESSAGE,
} from './types/poster'

const initialFormData: PosterFormData = {
  deceasedName: '',
  title: '',
  keterangan: '',
  age: '',
  dateOfPassing: '',
  timeOfPassing: '',
  timeOfPassingZone: 'WIB',
  imageUrl: '',
  placeOfPassing: '',
  placeLaidOut: '',
  processionType: 'dikebumikan',
  processionDate: '',
  processionTime: '',
  processionTimeZone: 'WIB',
  processionPlace: '',
  messageFrom: '',
  theme: 'putih',
  familyData: '',
  condolenceMessage: DEFAULT_CONDOLENCE_MESSAGE,
  relationSummary: '',
  deathStatement: '',
}

function fromApiOrPayload(result: PosterRecord, payload: PosterFormData): PosterFormData {
  const keterangan = result.keterangan ?? result.title ?? payload.keterangan ?? payload.title
  return {
    deceasedName: result.deceasedName || payload.deceasedName,
    title: keterangan,
    keterangan,
    age: result.age || payload.age,
    dateOfPassing: result.dateOfPassing || payload.dateOfPassing,
    timeOfPassing: result.timeOfPassing ?? payload.timeOfPassing ?? '',
    timeOfPassingZone: result.timeOfPassingZone ?? payload.timeOfPassingZone ?? 'WIB',
    imageUrl: result.imageUrl || payload.imageUrl,
    placeOfPassing: result.placeOfPassing || payload.placeOfPassing,
    placeLaidOut: result.placeLaidOut ?? payload.placeLaidOut ?? '',
    processionType: result.processionType ?? payload.processionType ?? 'dikebumikan',
    processionDate: result.processionDate ?? payload.processionDate ?? '',
    processionTime: result.processionTime ?? payload.processionTime ?? '',
    processionTimeZone: result.processionTimeZone ?? payload.processionTimeZone ?? 'WIB',
    processionPlace: result.processionPlace ?? payload.processionPlace ?? '',
    messageFrom: result.messageFrom ?? payload.messageFrom ?? '',
    theme: result.theme ?? payload.theme ?? 'putih',
    familyData: result.familyData ?? payload.familyData ?? '',
    condolenceMessage: result.condolenceMessage || payload.condolenceMessage,
    relationSummary: result.relationSummary ?? payload.relationSummary ?? '',
    deathStatement: result.deathStatement ?? payload.deathStatement ?? '',
  }
}

const initialTypographySettings: PosterTypographySettings = {
  deceasedName: { fontSize: 46, fontFamily: 'serif', fontStyle: 'normal', color: '#ffffff', fontWeight: 700, textShadow: true },
  title: { fontSize: 20, fontFamily: 'sans-serif', fontStyle: 'normal', color: '#e5e7eb', fontWeight: 600, textShadow: true },
  age: { fontSize: 20, fontFamily: 'sans-serif', fontStyle: 'normal', color: '#f8fafc', fontWeight: 500, textShadow: true },
  dateOfPassing: { fontSize: 20, fontFamily: 'sans-serif', fontStyle: 'normal', color: '#f8fafc', fontWeight: 500, textShadow: true },
  placeOfPassing: { fontSize: 20, fontFamily: 'sans-serif', fontStyle: 'normal', color: '#f8fafc', fontWeight: 500, textShadow: true },
  messageFrom: { fontSize: 36, fontFamily: 'serif', fontStyle: 'normal', color: '#ffffff', fontWeight: 700, textShadow: true },
  condolenceMessage: { fontSize: 20, fontFamily: 'sans-serif', fontStyle: 'normal', color: '#f8fafc', fontWeight: 500, textShadow: true },
}

const initialLayout = {
  deceasedName: { x: 50, y: 38 },
  title: { x: 50, y: 46 },
  age: { x: 50, y: 56 },
  dateOfPassing: { x: 50, y: 62 },
  placeOfPassing: { x: 50, y: 68 },
  condolenceMessage: { x: 50, y: 77 },
  messageFrom: { x: 50, y: 92 },
}

const defaultTemplates: TemplateDesign[] = [
  {
    id: 'default-elegant',
    name: 'Elegant Night',
    headerMode: 'headline',
    headerText: 'IN MEMORIAM',
    theme: 'elegant-night',
    backgroundType: 'theme',
    backgroundValue: '',
    layout: initialLayout,
    headlines: [],
  },
  {
    id: 'default-warm',
    name: 'Warm Classic',
    headerMode: 'headline',
    headerText: 'IN MEMORIAM',
    theme: 'warm-classic',
    backgroundType: 'theme',
    backgroundValue: '',
    layout: initialLayout,
    headlines: [],
  },
  {
    id: 'default-soft',
    name: 'Soft Gray',
    headerMode: 'headline',
    headerText: 'IN MEMORIAM',
    theme: 'soft-gray',
    backgroundType: 'theme',
    backgroundValue: '',
    layout: initialLayout,
    headlines: [],
  },
]

function App() {
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editingPosterId, setEditingPosterId] = useState<string>('')
  const [viewingPoster, setViewingPoster] = useState<PosterRecord | null>(null)
  const [formData, setFormData] = useState<PosterFormData>(initialFormData)
  const [typographySettings, setTypographySettings] = useState<PosterTypographySettings>(
    initialTypographySettings,
  )
  const [templates, setTemplates] = useState<TemplateDesign[]>(defaultTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default-elegant')
  const [newHeadlineText, setNewHeadlineText] = useState<string>('')
  const [editingHeadlineId, setEditingHeadlineId] = useState<string>('')
  const [headlineFontSize, setHeadlineFontSize] = useState<number>(22)
  const [headlineColor, setHeadlineColor] = useState<string>('#ffffff')
  const [headlineWeight, setHeadlineWeight] = useState<400 | 500 | 600 | 700 | 800>(700)
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [posterList, setPosterList] = useState<PosterRecord[]>([])
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [posterSearch, setPosterSearch] = useState<string>('')
  const [posterSortKey, setPosterSortKey] = useState<PosterSortKey>('updateDateTime')
  const [posterSortDir, setPosterSortDir] = useState<'asc' | 'desc'>('desc')
  const viewingPosterRef = useRef<HTMLDivElement | null>(null)
  const listActionPosterRef = useRef<HTMLDivElement | null>(null)
  const [listActionPoster, setListActionPoster] = useState<PosterRecord | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ type: 'poster' | 'template'; id: string } | null>(null)
  const templateDesignId = location.pathname.startsWith('/templates/design/')
    ? location.pathname.replace('/templates/design/', '')
    : ''
  const isUnsavedGeneratePath = location.pathname === '/posters/generate'
  const editingPathId = location.pathname.startsWith('/posters/edit/')
    ? location.pathname.replace('/posters/edit/', '').trim()
    : ''
  const activeView: 'list' | 'create' | 'template' | 'template-design' =
    location.pathname === '/posters/new' || isUnsavedGeneratePath || Boolean(editingPathId)
      ? 'create'
      : location.pathname === '/templates'
        ? 'template'
        : templateDesignId
          ? 'template-design'
          : 'list'

  const previewData = useMemo<PosterFormData>(() => formData, [formData])
  const { activeTemplate } = useTemplateManager({
    templates,
    setTemplates,
    selectedTemplateId,
    fallbackTemplate: defaultTemplates[0],
  })
  const selectedTemplate = useMemo<TemplateDesign | null>(() => {
    return templates.find((item) => item.id === selectedTemplateId) ?? null
  }, [templates, selectedTemplateId])
  const pageSize = 10
  const formatDeathInfo = (item: PosterRecord): string => {
    const date = item.dateOfPassing?.trim() || '-'
    const time = item.timeOfPassing?.trim()
    const zone = (item.timeOfPassingZone || 'WIB').trim()
    if (!time) return date
    return `${date} ${time} ${zone}`
  }
  const formatProcessionInfo = (item: PosterRecord): string => {
    const date = item.processionDate?.trim()
    const time = item.processionTime?.trim()
    const zone = (item.processionTimeZone || 'WIB').trim()
    const place = item.processionPlace?.trim()
    const dateTime = date ? `${formatYmdWithTime(date, time)} ${zone}` : ''
    const parts = [dateTime, place].filter(Boolean)
    return parts.length ? parts.join(' | ') : '-'
  }
  const {
    sortedPosters,
    totalPages: totalListPages,
    safePage,
    pagedPosters,
  } = usePosterList({
    posters: posterList,
    search: posterSearch,
    sortKey: posterSortKey,
    sortDir: posterSortDir,
    page: currentPage,
    pageSize,
  })
  const tableRows = pagedPosters.map((item, index) => ({ item, no: (safePage - 1) * pageSize + index + 1 }))
  useEffect(() => {
    setCurrentPage(1)
  }, [posterSearch, posterSortDir, posterSortKey])
  const togglePosterSort = (key: PosterSortKey) => {
    if (posterSortKey === key) {
      setPosterSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setPosterSortKey(key)
    setPosterSortDir('asc')
  }
  const sortMark = (key: PosterSortKey): string => (posterSortKey === key ? (posterSortDir === 'asc' ? '↑' : '↓') : '')
  const buildPosterShareText = (item: PosterRecord): string => {
    const lines: string[] = [
      'BERITA DUKA CITA',
      '',
      item.deceasedName || '-',
      item.age ? `Usia ${item.age} tahun` : '',
      item.placeOfPassing || item.dateOfPassing ? formatDeathInfo(item) : '',
      item.placeOfPassing ? `Tempat wafat: ${item.placeOfPassing}` : '',
      item.placeLaidOut ? `Disemayamkan di: ${item.placeLaidOut}` : '',
      formatProcessionInfo(item) !== '-' ? `Prosesi: ${formatProcessionInfo(item)}` : '',
      '',
      item.condolenceMessage || '',
      '',
      'Hormat kami,',
      item.messageFrom || '-',
    ]
    return lines.filter(Boolean).join('\n')
  }
  const handleDownloadViewingPoster = useCallback(async () => {
    if (!viewingPosterRef.current || !viewingPoster) return
    try {
      const dataUrl = await toPng(viewingPosterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })
      const link = document.createElement('a')
      const safeName = (viewingPoster.deceasedName || 'poster-duka').replace(/[^a-zA-Z0-9\s.-]/g, '').replace(/\s+/g, '-')
      link.href = dataUrl
      link.download = `${safeName}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      toast.error('Gagal membuat gambar unduhan dari preview.')
    }
  }, [toast, viewingPoster])
  const handleShareViewingWhatsApp = useCallback(() => {
    if (!viewingPoster) return
    const text = buildPosterShareText(viewingPoster)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }, [viewingPoster])
  const handleDownloadListActionPoster = useCallback(async () => {
    if (!listActionPosterRef.current || !listActionPoster) return
    try {
      const dataUrl = await toPng(listActionPosterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })
      const safeName = (listActionPoster.deceasedName || 'poster-duka').replace(/[^a-zA-Z0-9\s.-]/g, '').replace(/\s+/g, '-')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${safeName}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Gambar poster diunduh.')
    } catch {
      toast.error('Gagal membuat gambar unduhan dari preview.')
    }
  }, [listActionPoster, toast])
  const handleShareListActionPosterWhatsApp = useCallback(() => {
    if (!listActionPoster) return
    const text = buildPosterShareText(listActionPoster)
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }, [listActionPoster])
  const posterColumns: ManagementTableColumn<{ item: PosterRecord; no: number }>[] = [
      { key: 'no', header: 'No', render: (row) => row.no },
      {
        key: 'name',
        header: (
          <Button variant="ghost" size="sm" type="button" className="table-sort-btn" onClick={() => togglePosterSort('deceasedName')}>
            Nama {sortMark('deceasedName')}
          </Button>
        ),
        render: (row) => row.item.deceasedName,
      },
      {
        key: 'preview',
        header: 'Gambar Muka',
        render: (row) => (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="poster-thumb-btn"
            onClick={() => setViewingPoster(row.item)}
            aria-label={`Lihat contoh poster ${row.item.deceasedName}`}
          >
            {row.item.imageUrl ? <img src={row.item.imageUrl} alt="" className="poster-list-thumb" /> : <span className="poster-list-thumb-empty">—</span>}
          </Button>
        ),
      },
      {
        key: 'procession',
        header: (
          <Button variant="ghost" size="sm" type="button" className="table-sort-btn" onClick={() => togglePosterSort('procession')}>
            Prosesi {sortMark('procession')}
          </Button>
        ),
        render: (row) => formatProcessionInfo(row.item),
      },
      {
        key: 'from',
        header: (
          <Button variant="ghost" size="sm" type="button" className="table-sort-btn" onClick={() => togglePosterSort('messageFrom')}>
            Dari {sortMark('messageFrom')}
          </Button>
        ),
        render: (row) => row.item.messageFrom || '-',
      },
      {
        key: 'updateDateTime',
        header: (
          <Button variant="ghost" size="sm" type="button" className="table-sort-btn" onClick={() => togglePosterSort('updateDateTime')}>
            UpdateDateTime {sortMark('updateDateTime')}
          </Button>
        ),
        render: (row) => formatDateTimeWithSeconds(row.item.updateDateTime),
      },
      {
        key: 'createdDateTime',
        header: (
          <Button variant="ghost" size="sm" type="button" className="table-sort-btn" onClick={() => togglePosterSort('createdDateTime')}>
            CreatedDateTime {sortMark('createdDateTime')}
          </Button>
        ),
        render: (row) => formatDateTimeWithSeconds(row.item.createdDateTime ?? row.item.createdAt),
      },
      {
        key: 'actions',
        header: 'Action',
        render: (row) => (
          <div className="row-actions">
            <Button variant="ghost" size="sm" type="button" className="table-action-icon" aria-label="View poster" onClick={() => handleOpenView(row.item.id)}>
              <i className="ri-eye-line" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="sm" type="button" className="table-action-icon" aria-label="Edit poster" onClick={() => handleOpenEdit(row.item.id)}>
              <i className="ri-pencil-line" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="sm" type="button" className="table-action-icon" aria-label="Share atau download poster" onClick={() => setListActionPoster(row.item)}>
              <i className="ri-share-forward-line" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="table-action-icon danger"
              aria-label="Delete poster"
              onClick={() => setPendingDelete({ type: 'poster', id: row.item.id })}
            >
              <i className="ri-delete-bin-6-line" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ]
  const templateColumns: ManagementTableColumn<TemplateDesign>[] = [
      { key: 'name', header: 'Template', render: (item) => item.name },
      {
        key: 'preview',
        header: 'Gambar Template',
        render: (item) => <TemplateThumbnail template={item} />,
      },
      { key: 'createdDateTime', header: 'CreatedDateTime', render: (item) => formatDateTime(item.createdDateTime) },
      { key: 'updateDateTime', header: 'UpdateDateTime', render: (item) => formatDateTime(item.updateDateTime) },
      {
        key: 'actions',
        header: 'Action',
        render: (item) => (
          <div className="row-actions">
            <Button variant="ghost" size="sm" type="button" className="table-action-icon" aria-label="View template" onClick={() => handleViewTemplate(item.id)}>
              <i className="ri-eye-line" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="sm" type="button" className="table-action-icon" aria-label="Edit template" onClick={() => handleOpenEditTemplate(item.id)}>
              <i className="ri-pencil-line" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="table-action-icon danger"
              aria-label="Delete template"
              onClick={() => setPendingDelete({ type: 'template', id: item.id })}
            >
              <i className="ri-delete-bin-6-line" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ]

  const loadTemplateList = async () => {
    try {
      const records = await listTemplates(100)
      if (records.length > 0) {
        setTemplates(records)
        setSelectedTemplateId(records[0].id)
        localStorage.setItem('poster_templates', JSON.stringify(records))
        localStorage.setItem('poster_template_active', records[0].id)
        return
      }
    } catch {
      // fallback ke local cache/default
    }

    try {
      const cachedTemplates = localStorage.getItem('poster_templates')
      if (cachedTemplates) {
        setTemplates(JSON.parse(cachedTemplates) as TemplateDesign[])
      }
      const cachedTemplateId = localStorage.getItem('poster_template_active')
      if (cachedTemplateId) {
        setSelectedTemplateId(cachedTemplateId)
      }
    } catch {
      setTemplates(defaultTemplates)
    }
  }

  useEffect(() => {
    void loadTemplateList()
  }, [])

  useEffect(() => {
    if (!templateDesignId) return
    const matched = templates.find((item) => item.id === templateDesignId)
    if (matched) {
      handleTemplateSelect(matched.id)
    }
  }, [templateDesignId, templates])

  useEffect(() => {
    if (!templateDesignId) return
    const draftKey = `poster_template_draft_${templateDesignId}`
    try {
      const rawDraft = localStorage.getItem(draftKey)
      if (!rawDraft) return
      const draft = JSON.parse(rawDraft) as TemplateDesign
      setTemplates((previous) => {
        const exists = previous.some((item) => item.id === templateDesignId)
        if (!exists) return previous
        return previous.map((item) => (item.id === templateDesignId ? draft : item))
      })
    } catch {
      // ignore malformed draft
    }
  }, [templateDesignId])

  useEffect(() => {
    if (activeView !== 'template-design' || !selectedTemplate) return
    const draftKey = `poster_template_draft_${selectedTemplate.id}`
    try {
      localStorage.setItem(draftKey, JSON.stringify(selectedTemplate))
    } catch {
      // noop
    }
  }, [activeView, selectedTemplate])

  const loadPosterList = async () => {
    setIsLoadingList(true)
    try {
      const records = await listPosters(100)
      setPosterList(records)
      setCurrentPage(1)
    } catch {
      setPosterList([])
    } finally {
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    void loadPosterList()
  }, [])

  useEffect(() => {
    if (!editingPathId) {
      return
    }
    let alive = true
    const loadEditPoster = async () => {
      try {
        const poster = await getPosterById(editingPathId)
        if (!alive) return
        setEditingPosterId(editingPathId)
        setFormMode('edit')
        setFormData(fromApiOrPayload(poster, initialFormData))
      } catch (error) {
        if (!alive) return
        toast.error(error instanceof Error ? error.message : 'Gagal membuka data edit.')
        navigate('/posters')
      }
    }
    void loadEditPoster()
    return () => {
      alive = false
    }
  }, [editingPathId, navigate, toast])

  const handleChange = (name: keyof PosterFormData, value: string) => {
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setEditingPosterId('')
    setFormMode('create')
    setTypographySettings(initialTypographySettings)
  }

  const handleLayoutChange = (field: PosterTextField, x: number, y: number) => {
    setTemplates((previous) => {
      const next = previous.map((template) =>
        template.id === selectedTemplateId
          ? { ...template, layout: { ...template.layout, [field]: { x, y } } }
          : template,
      )
      localStorage.setItem('poster_templates', JSON.stringify(next))
      return next
    })
  }

  const handleHeadlineMove = (headlineId: string, x: number, y: number) => {
    setTemplates((previous) => {
      const next = previous.map((template) =>
        template.id === selectedTemplateId
          ? {
              ...template,
              headlines: template.headlines.map((headline) =>
                headline.id === headlineId ? { ...headline, x, y } : headline,
              ),
            }
          : template,
      )
      localStorage.setItem('poster_templates', JSON.stringify(next))
      return next
    })
  }

  const handleTypographyChange = (
    field: PosterTextField,
    property: 'fontSize' | 'fontFamily' | 'fontStyle' | 'color' | 'fontWeight' | 'textShadow',
    value: number | PosterFontFamily | PosterFontStyle | string | boolean,
  ) => {
    setTypographySettings((previous) => {
      const currentField = previous[field]
      if (property === 'fontSize' && typeof value === 'number') {
        return { ...previous, [field]: { ...currentField, fontSize: value } }
      }
      if (property === 'fontFamily' && typeof value === 'string') {
        return { ...previous, [field]: { ...currentField, fontFamily: value as PosterFontFamily } }
      }
      if (property === 'fontStyle' && typeof value === 'string') {
        return { ...previous, [field]: { ...currentField, fontStyle: value as PosterFontStyle } }
      }
      if (property === 'color' && typeof value === 'string') {
        return { ...previous, [field]: { ...currentField, color: value } }
      }
      if (property === 'fontWeight' && typeof value === 'number') {
        return { ...previous, [field]: { ...currentField, fontWeight: value as 400 | 500 | 600 | 700 | 800 } }
      }
      if (property === 'textShadow' && typeof value === 'boolean') {
        return { ...previous, [field]: { ...currentField, textShadow: value } }
      }
      return previous
    })
  }

  const handleImageChange = (file: File | null) => {
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        setFormData((previous) => ({ ...previous, imageUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (
    override?: PosterFormData,
    options?: { skipNavigate?: boolean },
  ): Promise<PosterRecord | null> => {
    const payload = override ?? formData
    if (!payload.deceasedName.trim()) {
      toast.error('Nama almarhum/almarhumah wajib diisi.')
      return null
    }
    if (!payload.dateOfPassing.trim()) {
      toast.error('Tanggal wafat wajib diisi.')
      return null
    }
    if (!payload.imageUrl.trim()) {
      toast.error('Foto wajib diupload.')
      return null
    }
    if (!payload.condolenceMessage.trim()) {
      toast.error('Pesan doa wajib diisi.')
      return null
    }

    setIsSubmitting(true)

    try {
      const result =
        formMode === 'edit'
          ? await updatePoster(editingPosterId, payload)
          : await createPoster(payload)
      setFormData(fromApiOrPayload(result, payload))
      await loadPosterList()
      if (!options?.skipNavigate) {
        toast.success(formMode === 'edit' ? 'Poster berhasil diperbarui.' : 'Poster berhasil disimpan.')
        navigate('/posters')
      } else {
        toast.success('Poster berhasil disimpan.')
      }
      return result
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Terjadi kesalahan saat menyimpan poster.')
      }
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenCreate = () => {
    handleReset()
    navigate('/posters/new')
  }

  const handleOpenGenerateUnsaved = () => {
    handleReset()
    navigate('/posters/generate')
  }

  const handleOpenEdit = (id: string) => {
    navigate(`/posters/edit/${id}`)
  }

  const handleOpenView = async (id: string) => {
    try {
      const poster = await getPosterById(id)
      setViewingPoster(poster)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal melihat data.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePoster(id)
      toast.success('Poster berhasil dihapus.')
      await loadPosterList()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus poster.')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    localStorage.setItem('poster_template_active', templateId)
  }

  const updateTemplateState = (updater: (template: TemplateDesign) => TemplateDesign) => {
    setTemplates((previous) => {
      const next = previous.map((template) => (template.id === selectedTemplateId ? updater(template) : template))
      localStorage.setItem('poster_templates', JSON.stringify(next))
      return next
    })
  }

  const handleCreateTemplateAndOpenDesign = async () => {
    const draft: TemplateDesign = {
      id: `tpl-${Date.now()}`,
      name: `Template ${templates.length + 1}`,
      headerMode: 'headline',
      headerText: 'IN MEMORIAM',
      theme: activeTemplate.theme,
      backgroundType: 'theme',
      backgroundValue: '',
      layout: initialLayout,
      headlines: [],
    }

    try {
      const saved = await createTemplate(draft)
      const next = [...templates, saved]
      setTemplates(next)
      setSelectedTemplateId(saved.id)
      localStorage.setItem('poster_templates', JSON.stringify(next))
      localStorage.setItem('poster_template_active', saved.id)
      navigate(`/templates/design/${saved.id}`)
      return
    } catch {
      toast.warning('Gagal buat template ke endpoint /api/templates, pakai lokal sementara.')
    }

    const next = [...templates, draft]
    setTemplates(next)
    setSelectedTemplateId(draft.id)
    localStorage.setItem('poster_templates', JSON.stringify(next))
    localStorage.setItem('poster_template_active', draft.id)
    navigate(`/templates/design/${draft.id}`)
  }

  const handleOpenEditTemplate = (templateId: string) => {
    const found = templates.find((item) => item.id === templateId)
    if (!found) return
    handleTemplateSelect(templateId)
    navigate(`/templates/design/${templateId}`)
  }

  const handleViewTemplate = (templateId: string) => {
    handleTemplateSelect(templateId)
    navigate(`/templates/design/${templateId}`)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (templates.length <= 1) {
      toast.warning('Minimal harus ada 1 template.')
      return
    }

    const next = templates.filter((item) => item.id !== templateId)
    try {
      await deleteTemplate(templateId)
    } catch {
      toast.error('Gagal hapus template dari endpoint /api/templates.')
    }
    const fallback = next[0]
    setTemplates(next)
    if (selectedTemplateId === templateId && fallback) {
      setSelectedTemplateId(fallback.id)
      localStorage.setItem('poster_template_active', fallback.id)
    }
    localStorage.setItem('poster_templates', JSON.stringify(next))
    localStorage.removeItem(`poster_template_draft_${templateId}`)
    if (next.length > 0) {
      void loadTemplateList()
    }
  }

  const handleSaveActiveTemplate = async () => {
    const active = templates.find((item) => item.id === selectedTemplateId)
    if (!active) {
      toast.error('Template aktif tidak ditemukan.')
      return
    }

    try {
      const looksLocalOnly = active.id.startsWith('default-') || active.id.startsWith('tpl-')
      if (looksLocalOnly) {
        const created = await createTemplate(active)
        const next = templates.map((item) => (item.id === active.id ? created : item))
        setTemplates(next)
        setSelectedTemplateId(created.id)
        localStorage.setItem('poster_templates', JSON.stringify(next))
        localStorage.setItem('poster_template_active', created.id)
        localStorage.removeItem(`poster_template_draft_${active.id}`)
        localStorage.removeItem(`poster_template_draft_${created.id}`)
      } else {
        await updateTemplate(active.id, active)
        localStorage.removeItem(`poster_template_draft_${active.id}`)
      }
      toast.success('Template berhasil disimpan ke backend.')
      await loadTemplateList()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal simpan template ke backend.')
    }
  }

  const handleAddHeadline = () => {
    if (!newHeadlineText.trim()) return
    const headlineId = editingHeadlineId || `hl-${Date.now()}`
    const headlineText = newHeadlineText.trim()
    updateTemplateState((template) => {
      return {
        ...template,
        headlines: editingHeadlineId
          ? template.headlines.map((headline) =>
              headline.id === editingHeadlineId
                ? {
                    ...headline,
                    text: headlineText,
                    fontSize: headlineFontSize,
                    color: headlineColor,
                    fontWeight: headlineWeight,
                  }
                : headline,
            )
          : [
              ...template.headlines,
              {
                id: headlineId,
                text: headlineText,
                x: 50,
                y: 20,
                fontSize: headlineFontSize,
                color: headlineColor,
                fontWeight: headlineWeight,
                locked: false,
              },
            ],
      }
    })
    setNewHeadlineText('')
    setEditingHeadlineId('')
    setHeadlineFontSize(22)
    setHeadlineColor('#ffffff')
    setHeadlineWeight(700)
  }

  const handleEditHeadline = (headline: CustomHeadline) => {
    setEditingHeadlineId(headline.id)
    setNewHeadlineText(headline.text)
    setHeadlineFontSize(headline.fontSize)
    setHeadlineColor(headline.color)
    setHeadlineWeight(headline.fontWeight)
  }

  const handleDeleteHeadline = (headlineId: string) => {
    updateTemplateState((template) => ({
      ...template,
      headlines: template.headlines.filter((headline) => headline.id !== headlineId),
    }))
    if (editingHeadlineId === headlineId) {
      setEditingHeadlineId('')
      setNewHeadlineText('')
    }
  }

  const handleTemplateThemeChange = (theme: PosterTheme) => {
    updateTemplateState((template) => ({ ...template, theme, backgroundType: 'theme' }))
  }

  const handleDuplicateTemplate = () => {
    const duplicated: TemplateDesign = {
      ...activeTemplate,
      id: `tpl-${Date.now()}`,
      name: `${activeTemplate.name} Copy`,
      layout: { ...activeTemplate.layout },
      headlines: activeTemplate.headlines.map((headline) => ({ ...headline, id: `hl-${Date.now()}-${headline.id}` })),
    }
    const next = [...templates, duplicated]
    setTemplates(next)
    setSelectedTemplateId(duplicated.id)
    localStorage.setItem('poster_templates', JSON.stringify(next))
    localStorage.setItem('poster_template_active', duplicated.id)
  }

  const handleToggleHeadlineLock = (headlineId: string) => {
    updateTemplateState((template) => ({
      ...template,
      headlines: template.headlines.map((headline) =>
        headline.id === headlineId ? { ...headline, locked: !headline.locked } : headline,
      ),
    }))
  }

  const handleTemplateNameChange = (name: string) => {
    updateTemplateState((template) => ({ ...template, name }))
  }

  const handleTemplateBackgroundUpload = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('File background harus berupa gambar.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      updateTemplateState((template) => ({
        ...template,
        backgroundType: 'image',
        backgroundValue: result,
      }))
    }
    reader.onerror = () => toast.error('Gagal membaca file background.')
    reader.readAsDataURL(file)
  }

  return (
    <main
      className={`page ${
        activeView === 'list' || activeView === 'template' || activeView === 'create' ? 'page-list' : ''
      }`}
    >
      {activeView === 'list' ? (
        <PostersListPage
          isLoadingList={isLoadingList}
          posterSearch={posterSearch}
          setPosterSearch={setPosterSearch}
          posterColumns={posterColumns}
          tableRows={tableRows}
          pageSize={pageSize}
          totalRows={sortedPosters.length}
          safePage={safePage}
          totalPages={totalListPages}
          onPrev={() => setCurrentPage((p) => p - 1)}
          onNext={() => setCurrentPage((p) => p + 1)}
          onOpenCreate={handleOpenCreate}
          onOpenGenerateUnsaved={handleOpenGenerateUnsaved}
          onOpenTemplates={() => navigate('/templates')}
        />
      ) : activeView === 'template' ? (
        <TemplatesListPage
          templates={templates}
          templateColumns={templateColumns}
          onBackToList={() => navigate('/posters')}
          onAddNew={handleCreateTemplateAndOpenDesign}
        />
      ) : activeView === 'template-design' ? (
        <TemplateDesignPage
          activeTemplate={activeTemplate}
          newHeadlineText={newHeadlineText}
          headlineFontSize={headlineFontSize}
          headlineColor={headlineColor}
          headlineWeight={headlineWeight}
          snapToGrid={snapToGrid}
          editingHeadlineId={editingHeadlineId}
          onBackToTemplates={() => navigate('/templates')}
          onSaveTemplate={() => void handleSaveActiveTemplate()}
          onDuplicateTemplate={handleDuplicateTemplate}
          onTemplateNameChange={handleTemplateNameChange}
          onUploadBackgroundImage={handleTemplateBackgroundUpload}
          onHeadlineTextChange={setNewHeadlineText}
          onHeadlineFontSizeChange={setHeadlineFontSize}
          onHeadlineColorChange={setHeadlineColor}
          onHeadlineWeightChange={setHeadlineWeight}
          onAddOrUpdateHeadline={handleAddHeadline}
          onSnapToGridChange={setSnapToGrid}
          onEditHeadline={handleEditHeadline}
          onToggleHeadlineLock={handleToggleHeadlineLock}
          onDeleteHeadline={handleDeleteHeadline}
          formPanel={(
            <PosterForm
              value={formData}
              isSubmitting={isSubmitting}
              submitLabel={formMode === 'edit' ? 'Update Poster' : 'Generate Poster'}
              selectedTheme={activeTemplate.theme}
              isTemplateMode
              onChange={handleChange}
              onImageChange={handleImageChange}
              onThemeChange={handleTemplateThemeChange}
              typographySettings={typographySettings}
              onTypographyChange={handleTypographyChange}
              onSubmit={handleSubmit}
              onReset={handleReset}
            />
          )}
          previewPanel={(
            <div className="preview-wrap">
              <div className="list-actions">
                <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/templates')}>
                  Kembali ke Template List
                </Button>
              </div>
              <PosterPreview
                value={previewData}
                recid={editingPosterId}
                typographySettings={typographySettings}
                template={activeTemplate}
                isTemplateMode
                snapToGrid={snapToGrid}
                onLayoutChange={handleLayoutChange}
                onHeadlineMove={handleHeadlineMove}
                onTypographyChange={handleTypographyChange}
              />
            </div>
          )}
        />
      ) : (
        <PosterEditorPage
          editor={(
            <PosterDukaCitaGenerator
              initialValue={formData}
              isSubmitting={isSubmitting}
              mobileSubmitAfterPreview={isUnsavedGeneratePath || formMode === 'create'}
              hideBackButton={isUnsavedGeneratePath}
              templates={templates}
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              submitLabel={
                isUnsavedGeneratePath
                  ? 'Generate (tanpa simpan DB)'
                  : formMode === 'edit'
                    ? 'Simpan poster'
                    : 'Simpan & generate poster'
              }
              onSubmit={async (value) => {
                setFormData(value)
                if (isUnsavedGeneratePath) {
                  const nowIso = new Date().toISOString()
                  return {
                    id: `unsaved-${Date.now()}`,
                    ...value,
                    createdAt: nowIso,
                    createdDateTime: nowIso,
                    updateDateTime: nowIso,
                  }
                }
                return handleSubmit(value, { skipNavigate: true })
              }}
              onBack={() => navigate('/posters')}
            />
          )}
        />
      )}
      {viewingPoster ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <section className="modal-card">
            <header className="modal-header">
              <h3>Detail Poster</h3>
              <Button variant="ghost" size="sm" type="button" className="close-x-btn" aria-label="Tutup" onClick={() => setViewingPoster(null)}>
                ×
              </Button>
            </header>
            <div ref={viewingPosterRef}>
              <PosterDukaCitaCard value={viewingPoster} />
            </div>
            <p className="post-save-lead">Unduh atau bagikan poster langsung dari popup ini.</p>
            <PosterShareActions
              onDownload={() => void handleDownloadViewingPoster()}
              onShareWhatsApp={handleShareViewingWhatsApp}
            />
          </section>
        </div>
      ) : null}
      {listActionPoster ? (
        <PosterShareModal
          isOpen={Boolean(listActionPoster)}
          onClose={() => setListActionPoster(null)}
          preview={
            <div ref={listActionPosterRef}>
              <PosterDukaCitaCard value={listActionPoster} />
            </div>
          }
          onDownload={() => void handleDownloadListActionPoster()}
          onShareWhatsApp={handleShareListActionPosterWhatsApp}
        />
      ) : null}
      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        title={pendingDelete?.type === 'template' ? 'Hapus template?' : 'Hapus poster?'}
        message={
          pendingDelete?.type === 'template'
            ? 'Template yang dihapus tidak bisa dikembalikan.'
            : 'Poster yang dihapus tidak bisa dikembalikan.'
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const current = pendingDelete
          setPendingDelete(null)
          if (!current) return
          if (current.type === 'template') {
            void handleDeleteTemplate(current.id)
            return
          }
          void handleDelete(current.id)
        }}
      />
    </main>
  )
}

export default App

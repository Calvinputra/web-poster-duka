import type { APIResponse, TemplateDesign } from '../types/poster'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface TemplateApiPayload {
  id: string
  name: string
  headerMode: 'recid' | 'headline'
  headerText: string
  theme: TemplateDesign['theme']
  backgroundType: TemplateDesign['backgroundType']
  backgroundValue: string
  layout: TemplateDesign['layout']
  headlines: TemplateDesign['headlines']
  thumbnailUrl: string
  createdDateTime?: string
  updateDateTime?: string
}

function toPayload(template: TemplateDesign): Omit<TemplateApiPayload, 'id'> {
  return {
    name: template.name,
    headerMode: template.headerMode,
    headerText: template.headerText,
    theme: template.theme,
    backgroundType: template.backgroundType,
    backgroundValue: template.backgroundValue,
    layout: template.layout,
    headlines: template.headlines,
    thumbnailUrl: template.backgroundType === 'image' ? template.backgroundValue : '',
  }
}

function toTemplate(record: TemplateApiPayload): TemplateDesign {
  return {
    id: record.id,
    name: record.name,
    headerMode: record.headerMode,
    headerText: record.headerText,
    theme: record.theme,
    backgroundType: record.backgroundType,
    backgroundValue: record.backgroundValue,
    layout: record.layout,
    headlines: record.headlines,
    createdDateTime: record.createdDateTime,
    updateDateTime: record.updateDateTime,
  }
}

export async function listTemplates(limit: number = 100): Promise<TemplateDesign[]> {
  const response = await fetch(`${API_BASE_URL}/api/templates?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Gagal mengambil data template.')
  }

  const data = (await response.json()) as APIResponse<TemplateApiPayload[]>
  return data.data.map(toTemplate)
}

export async function createTemplate(payload: TemplateDesign): Promise<TemplateDesign> {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Actor': 'web-user',
    },
    body: JSON.stringify(toPayload(payload)),
  })

  if (!response.ok) {
    throw new Error('Gagal membuat template.')
  }

  const data = (await response.json()) as APIResponse<TemplateApiPayload>
  return toTemplate(data.data)
}

export async function updateTemplate(id: string, payload: TemplateDesign): Promise<TemplateDesign> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Actor': 'web-user',
    },
    body: JSON.stringify(toPayload(payload)),
  })

  if (!response.ok) {
    throw new Error('Gagal mengubah template.')
  }

  const data = (await response.json()) as APIResponse<TemplateApiPayload>
  return toTemplate(data.data)
}

export async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Actor': 'web-user',
    },
  })

  if (!response.ok) {
    throw new Error('Gagal menghapus template.')
  }
}

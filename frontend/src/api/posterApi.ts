import type { APIResponse, PosterFormData, PosterRecord } from '../types/poster'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export async function createPoster(payload: PosterFormData): Promise<PosterRecord> {
  const response = await fetch(`${API_BASE_URL}/api/posters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Actor': 'web-user',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const fallbackMessage = 'Gagal menyimpan poster.'

    try {
      const errorPayload = (await response.json()) as { message?: string }
      throw new Error(errorPayload.message ?? fallbackMessage)
    } catch {
      throw new Error(fallbackMessage)
    }
  }

  const data = (await response.json()) as APIResponse<PosterRecord>
  return data.data
}

export async function listPosters(limit: number = 50): Promise<PosterRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/posters?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Gagal mengambil data poster.')
  }

  const data = (await response.json()) as APIResponse<PosterRecord[]>
  return data.data
}

export async function getPosterById(id: string): Promise<PosterRecord> {
  const response = await fetch(`${API_BASE_URL}/api/posters/${id}`)
  if (!response.ok) {
    throw new Error('Data poster tidak ditemukan.')
  }

  const data = (await response.json()) as APIResponse<PosterRecord>
  return data.data
}

export async function updatePoster(id: string, payload: PosterFormData): Promise<PosterRecord> {
  const response = await fetch(`${API_BASE_URL}/api/posters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Actor': 'web-user',
    },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const fallback = 'Gagal mengubah poster.'
    try {
      const payloadError = (await response.json()) as { message?: string }
      throw new Error(payloadError.message ?? fallback)
    } catch {
      throw new Error(fallback)
    }
  }

  const data = (await response.json()) as APIResponse<PosterRecord>
  return data.data
}

export async function deletePoster(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/posters/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Actor': 'web-user',
    },
  })
  if (!response.ok) {
    throw new Error('Gagal menghapus poster.')
  }
}

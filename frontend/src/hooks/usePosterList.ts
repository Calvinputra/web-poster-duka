import { useMemo } from 'react'
import type { PosterRecord } from '../types/poster'

export type PosterSortKey = 'deceasedName' | 'procession' | 'messageFrom' | 'createdDateTime' | 'updateDateTime'

interface UsePosterListParams {
  posters: PosterRecord[]
  search: string
  sortKey: PosterSortKey
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function usePosterList({
  posters,
  search,
  sortKey,
  sortDir,
  page,
  pageSize,
}: UsePosterListParams) {
  const filteredPosters = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return posters
    return posters.filter((item) =>
      [
        item.deceasedName,
        item.messageFrom,
        item.processionDate,
        item.processionTime,
        item.processionPlace,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [posters, search])

  const sortedPosters = useMemo(() => {
    const next = [...filteredPosters]
    const getSortValue = (item: PosterRecord): string => {
      if (sortKey === 'deceasedName') return (item.deceasedName || '').toLowerCase()
      if (sortKey === 'messageFrom') return (item.messageFrom || '').toLowerCase()
      if (sortKey === 'procession') return `${item.processionDate || ''} ${item.processionTime || ''} ${item.processionPlace || ''}`.toLowerCase()
      if (sortKey === 'createdDateTime') return item.createdDateTime || item.createdAt || ''
      return item.updateDateTime || ''
    }

    next.sort((a, b) => {
      const cmp = getSortValue(a).localeCompare(getSortValue(b), 'id')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return next
  }, [filteredPosters, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedPosters.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pagedPosters = sortedPosters.slice((safePage - 1) * pageSize, safePage * pageSize)

  return {
    filteredPosters,
    sortedPosters,
    totalPages,
    safePage,
    pagedPosters,
  }
}

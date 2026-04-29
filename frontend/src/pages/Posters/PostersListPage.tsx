import type { Dispatch, SetStateAction } from 'react'
import { ManagementTable, type ManagementTableColumn } from '../../components/shared/ManagementTable'
import { Button } from '../../components/shared/Button'
import type { PosterRecord } from '../../types/poster'

interface PostersListRow {
  item: PosterRecord
  no: number
}

interface PostersListPageProps {
  isLoadingList: boolean
  posterSearch: string
  setPosterSearch: Dispatch<SetStateAction<string>>
  posterColumns: ManagementTableColumn<PostersListRow>[]
  tableRows: PostersListRow[]
  pageSize: number
  totalRows: number
  safePage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onOpenCreate: () => void
  onOpenGenerateUnsaved: () => void
  onOpenTemplates: () => void
}

export function PostersListPage({
  isLoadingList,
  posterSearch,
  setPosterSearch,
  posterColumns,
  tableRows,
  pageSize,
  totalRows,
  safePage,
  totalPages,
  onPrev,
  onNext,
  onOpenCreate,
  onOpenGenerateUnsaved,
  onOpenTemplates,
}: PostersListPageProps) {
  return (
    <section className="list-card">
      <div className="list-header">
        <h2>Data Poster Tersimpan</h2>
        <div className="list-actions">
          <Button type="button" size="sm" onClick={onOpenCreate}>
            Create New
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onOpenGenerateUnsaved}>
            Generate (Unsaved)
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onOpenTemplates}>
            Set Template
          </Button>
        </div>
      </div>
      <div className="list-tools">
        <input
          type="search"
          className="list-search-input"
          placeholder="Cari nama, prosesi, pengirim..."
          value={posterSearch}
          onChange={(e) => setPosterSearch(e.target.value)}
        />
      </div>
      {isLoadingList ? (
        <p>Loading data...</p>
      ) : (
        <ManagementTable
          columns={posterColumns}
          rows={tableRows}
          rowKey={(row) => row.item.id}
          emptyMessage="Belum ada data tersimpan."
        />
      )}
      {totalRows > pageSize ? (
        <div className="pagination">
          <Button type="button" size="sm" variant="secondary" disabled={safePage === 1} onClick={onPrev}>
            Prev
          </Button>
          <span>
            Page {safePage} / {totalPages}
          </span>
          <Button type="button" size="sm" variant="secondary" disabled={safePage === totalPages} onClick={onNext}>
            Next
          </Button>
        </div>
      ) : null}
    </section>
  )
}

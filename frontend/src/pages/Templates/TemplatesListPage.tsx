import { ManagementTable, type ManagementTableColumn } from '../../components/shared/ManagementTable'
import { Button } from '../../components/shared/Button'
import type { TemplateDesign } from '../../types/poster'

interface TemplatesListPageProps {
  templates: TemplateDesign[]
  templateColumns: ManagementTableColumn<TemplateDesign>[]
  onBackToList: () => void
  onAddNew: () => void
}

export function TemplatesListPage({
  templates,
  templateColumns,
  onBackToList,
  onAddNew,
}: TemplatesListPageProps) {
  return (
    <section className="list-card">
      <div className="list-header">
        <h2>Template List</h2>
        <div className="list-actions">
          <Button type="button" size="sm" variant="secondary" onClick={onBackToList}>
            Kembali ke List
          </Button>
          <Button type="button" size="sm" onClick={onAddNew}>
            Add New
          </Button>
        </div>
      </div>
      <ManagementTable
        columns={templateColumns}
        rows={templates}
        rowKey={(item) => item.id}
        emptyMessage="Belum ada template."
      />
    </section>
  )
}

import type { ReactNode } from 'react'

export interface ManagementTableColumn<TItem> {
  key: string
  header: ReactNode
  render: (item: TItem) => ReactNode
}

interface ManagementTableProps<TItem> {
  columns: ManagementTableColumn<TItem>[]
  rows: TItem[]
  rowKey: (item: TItem) => string
  emptyMessage: string
}

export function ManagementTable<TItem>({
  columns,
  rows,
  rowKey,
  emptyMessage,
}: ManagementTableProps<TItem>) {
  return (
    <table className="management-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={`${rowKey(row)}-${column.key}`}>{column.render(row)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

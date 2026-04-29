import type { ReactNode } from 'react'

interface PosterEditorPageProps {
  editor: ReactNode
}

export function PosterEditorPage({ editor }: PosterEditorPageProps) {
  return <>{editor}</>
}

import { useMemo } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { TemplateDesign } from '../types/poster'

interface UseTemplateManagerParams {
  templates: TemplateDesign[]
  setTemplates: Dispatch<SetStateAction<TemplateDesign[]>>
  selectedTemplateId: string
  fallbackTemplate: TemplateDesign
}

export function useTemplateManager({
  templates,
  setTemplates,
  selectedTemplateId,
  fallbackTemplate,
}: UseTemplateManagerParams) {
  const activeTemplate = useMemo<TemplateDesign>(() => {
    const found = templates.find((item) => item.id === selectedTemplateId)
    return found ?? templates[0] ?? fallbackTemplate
  }, [fallbackTemplate, selectedTemplateId, templates])

  const updateTemplateState = (updater: (template: TemplateDesign) => TemplateDesign) => {
    setTemplates((previous) => previous.map((template) => (template.id === selectedTemplateId ? updater(template) : template)))
  }

  return {
    activeTemplate,
    updateTemplateState,
  }
}

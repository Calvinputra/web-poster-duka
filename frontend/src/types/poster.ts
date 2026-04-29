export interface PosterFormData {
  deceasedName: string
  title: string
  keterangan: string
  age: string
  dateOfPassing: string
  /** HH:mm (24h), opsional */
  timeOfPassing: string
  /** WIB | WITA | WIT */
  timeOfPassingZone: string
  imageUrl: string
  placeOfPassing: string
  placeLaidOut: string
  processionType: string
  processionDate: string
  processionTime: string
  /** WIB | WITA | WIT */
  processionTimeZone: string
  processionPlace: string
  messageFrom: string
  theme: string
  familyData: string
  condolenceMessage: string
  relationSummary: string
  deathStatement: string
}

export const DEFAULT_CONDOLENCE_MESSAGE =
  'Kami turut berduka cita atas kepergianny. Semoga almarhum/almarhumah diterima di sisi-Nya dan keluarga yang ditinggalkan diberikan ketabahan.'

export type PosterTextField =
  | 'deceasedName'
  | 'title'
  | 'age'
  | 'dateOfPassing'
  | 'placeOfPassing'
  | 'messageFrom'
  | 'condolenceMessage'

export type PosterFontFamily = 'serif' | 'sans-serif' | 'monospace'
export type PosterFontStyle = 'normal' | 'italic'

export interface PosterTextStyle {
  fontSize: number
  fontFamily: PosterFontFamily
  fontStyle: PosterFontStyle
  color: string
  fontWeight: 400 | 500 | 600 | 700 | 800
  textShadow: boolean
}

export type PosterTypographySettings = Record<PosterTextField, PosterTextStyle>
export type PosterTheme = 'elegant-night' | 'warm-classic' | 'soft-gray'
export type EditorView = 'list' | 'create' | 'template'

export interface PosterTemplatePosition {
  x: number
  y: number
}

export type PosterTemplateLayout = Record<PosterTextField, PosterTemplatePosition>

export interface CustomHeadline {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: 400 | 500 | 600 | 700 | 800
  locked: boolean
}

export type TemplateBackgroundType = 'theme' | 'image'

export interface TemplateDesign {
  id: string
  name: string
  headerMode: 'recid' | 'headline'
  headerText: string
  theme: PosterTheme
  backgroundType: TemplateBackgroundType
  backgroundValue: string
  layout: PosterTemplateLayout
  headlines: CustomHeadline[]
  createdDateTime?: string
  updateDateTime?: string
}

export interface PosterRecord extends PosterFormData {
  id: string
  createdAt: string
  createdDateTime?: string
  updateDateTime?: string
}

export interface APIResponse<TData> {
  message: string
  data: TData
}

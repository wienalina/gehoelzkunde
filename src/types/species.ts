export type Group = 'nadel' | 'laub'
export type Level = 'pruefung' | 'vorlesung' | 'kontext'
export type DataState = 'vollstaendig' | 'teilweise' | 'duenn' | 'ohne_quelle'

/** Ein Merkmal mit Quellenangabe. Ohne Quelle kein Merkmal. */
export type Feld = {
  text: string
  quelle: 'skript' | 'zusammenfassung' | 'vorlesungsliste' | 'parkfuehrer'
  seite?: number
}

export type BildTyp =
  | 'habitus' | 'leaf' | 'twig' | 'bud' | 'bark'
  | 'flower' | 'fruit' | 'cone' | 'detail'

export const BILDTYPEN: { key: BildTyp; label: string }[] = [
  { key: 'habitus', label: 'Habitus' },
  { key: 'leaf',    label: 'Blatt' },
  { key: 'twig',    label: 'Zweig' },
  { key: 'bud',     label: 'Knospe' },
  { key: 'bark',    label: 'Rinde' },
  { key: 'flower',  label: 'Blüte' },
  { key: 'fruit',   label: 'Frucht' },
  { key: 'cone',    label: 'Zapfen' },
  { key: 'detail',  label: 'Detail' },
]

export type Species = {
  id: string
  name: string
  genus: string
  epithet: string
  family: string
  familySource: 'skript' | 'extern' | 'offen'
  group: Group
  level: Level
  exam: boolean
  de: string
  native: boolean
  unit: number | null
  skriptPages: number[]
  inLecture: boolean
  inSkript: boolean
  inSummary: boolean
  inPark: boolean
  dataState: DataState
  checkName: boolean
  ocrSuspect: boolean
  ocrVariants: string
  masterNames: string[]
  synonym: string

  /* ab Phase 4 befüllt – bis dahin undefined, nichts wird geraten */
  merkmale?: Partial<Record<
    'habitus'|'stamm'|'blatt'|'nadel'|'bluete'|'bluetezeit'|'frucht'|
    'vorkommen'|'ansprueche'|'verwendung'|'sonstiges', Feld>>
  freiland?: Feld
  entscheidend?: Feld[]
  verwechslung?: { mit: string; trennmerkmal: Feld }[]
  park?: { blatt: number; seite: number; bereich: 'park'|'arboretum'|'umgebung' }[]
}

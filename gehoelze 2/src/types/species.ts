export type Group = 'nadel' | 'laub'
export type Level = 'pruefung' | 'vorlesung' | 'kontext'
export type DataState = 'vollstaendig' | 'teilweise' | 'duenn' | 'ohne_quelle'

/** Ein Merkmal mit Quellenangabe. Ohne Quelle kein Merkmal. */
export type Feld = {
  text: string
  quelle: 'skript' | 'zusammenfassung' | 'vorlesungsliste' | 'parkfuehrer'
  seite?: number
}

export type MerkmalKey =
  | 'habitus' | 'stamm' | 'nadel' | 'blatt' | 'bluete' | 'bluetezeit'
  | 'frucht' | 'vorkommen' | 'ansprueche' | 'verwendung' | 'sonstiges' | 'sorten'

export type Merkmale = Partial<Record<MerkmalKey, Feld>>

/** Reihenfolge und Beschriftung wie in den Studienblättern */
export const MERKMALE: { key: MerkmalKey; label: string }[] = [
  { key: 'habitus',    label: 'Habitus' },
  { key: 'stamm',      label: 'Stamm' },
  { key: 'nadel',      label: 'Nadeln' },
  { key: 'blatt',      label: 'Blatt' },
  { key: 'bluete',     label: 'Blüte' },
  { key: 'bluetezeit', label: 'Blütezeit' },
  { key: 'frucht',     label: 'Frucht' },
  { key: 'vorkommen',  label: 'Vorkommen' },
  { key: 'ansprueche', label: 'Ansprüche' },
  { key: 'verwendung', label: 'Verwendung' },
  { key: 'sonstiges',  label: 'Sonstiges' },
  { key: 'sorten',     label: 'Sorten' },
]

/** Merkmale, die man draußen ohne Hilfsmittel sieht */
export const FREILAND_FELDER: MerkmalKey[] = [
  'habitus', 'stamm', 'nadel', 'blatt', 'bluete', 'frucht',
]

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

  /* Phase 4: seitengenau aus den Studienblättern übernommen */
  merkmale?: Merkmale
  /** Beschreibung der ganzen Gattung aus dem Skript */
  gattungsmerkmale?: Merkmale
  freiland?: Feld
  entscheidend?: Feld[]
  verwechslung?: { mit: string; trennmerkmal: Feld }[]
  park?: { blatt: number; seite: number; bereich: 'park'|'arboretum'|'umgebung' }[]
}

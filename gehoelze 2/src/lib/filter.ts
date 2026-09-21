import type { Species } from '../types/species'

export type Umfang = 'pruefung' | 'vorlesung' | 'alle'

export type Filter = {
  suche: string
  umfang: Umfang
  gruppe: 'alle' | 'nadel' | 'laub'
  familie: string
  gattung: string
  nurPark: boolean
  nurHeimisch: boolean
  ohneQuelleAusblenden: boolean
  nurZuPruefen: boolean
}

export const START_FILTER: Filter = {
  suche: '', umfang: 'pruefung', gruppe: 'alle', familie: '', gattung: '',
  nurPark: false, nurHeimisch: false, ohneQuelleAusblenden: true, nurZuPruefen: false,
}

export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss')

/** Ohne Leerzeichen und Bindestriche: „Feldahorn“, „Feld-Ahorn“ und „Feld Ahorn“ sind gleich. */
const kompakt = (t: string) => norm(t).replace(/[\s\-\u2010-\u2013]/g, '')

/** Sucht in lateinischem und deutschem Namen, Gattung, Familie und Synonymen. */
export function passtZuSuche(s: Species, suche: string): boolean {
  const teile = norm(suche.trim()).split(/\s+/).map(kompakt).filter(Boolean)
  if (teile.length === 0) return true
  // Felder einzeln verdichten, damit keine Treffer über Feldgrenzen hinweg entstehen
  const heu = [s.name, s.de, s.family, s.genus, s.synonym, ...s.masterNames].map(kompakt).join('|')
  return teile.every(teil => heu.includes(teil))
}

export function anwenden(liste: Species[], f: Filter): Species[] {
  const q = norm(f.suche.trim())
  return liste.filter(s => {
    if (f.umfang === 'pruefung' && !s.exam) return false
    if (f.umfang === 'vorlesung' && !(s.exam || s.inLecture)) return false
    if (f.gruppe !== 'alle' && s.group !== f.gruppe) return false
    if (f.familie && s.family !== f.familie) return false
    if (f.gattung && s.genus !== f.gattung) return false
    if (f.nurPark && !s.inPark) return false
    if (f.nurHeimisch && !s.native) return false
    if (f.ohneQuelleAusblenden && s.dataState === 'ohne_quelle') return false
    if (f.nurZuPruefen && !s.checkName) return false
    if (q && !passtZuSuche(s, f.suche)) return false
    return true
  })
}

export function anzahlAktiv(f: Filter): number {
  let n = 0
  if (f.umfang !== START_FILTER.umfang) n++
  if (f.gruppe !== 'alle') n++
  if (f.familie) n++
  if (f.gattung) n++
  if (f.nurPark) n++
  if (f.nurHeimisch) n++
  if (!f.ohneQuelleAusblenden) n++
  if (f.nurZuPruefen) n++
  return n
}

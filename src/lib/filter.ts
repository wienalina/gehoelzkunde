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

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss')

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
    if (q) {
      const heu = norm([s.name, s.de, s.family, s.genus, s.synonym, ...s.masterNames].join(' '))
      if (!heu.includes(q)) return false
    }
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

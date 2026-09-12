import raw from './species.json'
import type { Species } from '../types/species'

export const SPECIES: Species[] = raw as Species[]

export const byId = (id: string) => SPECIES.find(s => s.id === id)

export const FAMILIES = [...new Set(SPECIES.map(s => s.family))].sort()
export const GENERA   = [...new Set(SPECIES.map(s => s.genus))].sort()

export const stats = {
  total:    SPECIES.length,
  exam:     SPECIES.filter(s => s.exam).length,
  nadel:    SPECIES.filter(s => s.group === 'nadel').length,
  laub:     SPECIES.filter(s => s.group === 'laub').length,
  park:     SPECIES.filter(s => s.inPark).length,
  families: FAMILIES.length,
  genera:   GENERA.length,
}

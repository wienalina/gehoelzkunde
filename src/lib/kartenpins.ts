/**
 * Selbst gesetzte Gehölzstandorte auf der Türkenschanzpark-Karte.
 *
 * Die Pins liegen getrennt vom Kartenbild im Browser (localStorage).
 * Positionen sind relativ zum Bild gespeichert (0 bis 1), nicht in
 * Bildschirmpixeln – deshalb bleiben sie bei jedem Zoom, jeder Verschiebung
 * und jeder Fenstergröße an derselben Stelle der Karte.
 */

export type PlantMapPin = {
  id: string
  speciesId: string
  x: number // relativ zur Bildbreite, 0 bis 1
  y: number // relativ zur Bildhöhe, 0 bis 1
  note?: string
  createdAt: string
  updatedAt: string
}

export const KARTE_ID = 'tuerkenschanzpark'
const KEY = 'gehoelze.kartenpins.v1'
const FORMAT = 'gehoelze-kartenpins'

type Ablage = { version: 1; karte: string; pins: PlantMapPin[] }

/* ---------- Lesen und Schreiben ---------- */

export function pinsLesen(): PlantMapPin[] {
  try {
    const roh = localStorage.getItem(KEY)
    if (!roh) return []
    const daten = JSON.parse(roh) as Ablage
    return Array.isArray(daten.pins) ? daten.pins.filter(istGueltig) : []
  } catch {
    return []
  }
}

export function pinsSchreiben(pins: PlantMapPin[]): boolean {
  try {
    const ablage: Ablage = { version: 1, karte: KARTE_ID, pins }
    localStorage.setItem(KEY, JSON.stringify(ablage))
    return true
  } catch {
    return false // Speicher voll oder im privaten Modus gesperrt
  }
}

/* ---------- Anlegen, Ändern, Löschen ---------- */

function neueId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function pinAnlegen(speciesId: string, x: number, y: number, note?: string): PlantMapPin {
  const jetzt = new Date().toISOString()
  return {
    id: neueId(),
    speciesId,
    x: begrenzen(x),
    y: begrenzen(y),
    note: note?.trim() || undefined,
    createdAt: jetzt,
    updatedAt: jetzt,
  }
}

export function pinAendern(pin: PlantMapPin, aenderung: Partial<Pick<PlantMapPin, 'speciesId' | 'x' | 'y' | 'note'>>): PlantMapPin {
  return {
    ...pin,
    ...aenderung,
    x: begrenzen(aenderung.x ?? pin.x),
    y: begrenzen(aenderung.y ?? pin.y),
    note: (aenderung.note ?? pin.note)?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  }
}

/* ---------- Koordinaten ---------- */

const begrenzen = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Rechnet einen Klick in eine Position relativ zum Bild um.
 * `rect` ist das Rechteck des Kartenbildes, wie es gerade auf dem Bildschirm
 * steht – also bereits mit Zoom und Verschiebung. Dadurch sind Zoomstufe und
 * Verschiebung automatisch berücksichtigt.
 */
export function relativePosition(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null
  const x = (clientX - rect.left) / rect.width
  const y = (clientY - rect.top) / rect.height
  if (x < 0 || x > 1 || y < 0 || y > 1) return null // Klick neben dem Bild
  return { x, y }
}

/* ---------- Export und Import ---------- */

export function exportDatei(pins: PlantMapPin[]): { name: string; inhalt: string } {
  const datum = new Date().toISOString().slice(0, 10)
  const inhalt = JSON.stringify(
    { format: FORMAT, version: 1, karte: KARTE_ID, exportiert: new Date().toISOString(), pins },
    null,
    2,
  )
  return { name: `tuerkenschanzpark-pins-${datum}.json`, inhalt }
}

function istGueltig(p: unknown): p is PlantMapPin {
  if (!p || typeof p !== 'object') return false
  const o = p as Record<string, unknown>
  return typeof o.id === 'string' && o.id.length > 0
    && typeof o.speciesId === 'string' && o.speciesId.length > 0
    && typeof o.x === 'number' && o.x >= 0 && o.x <= 1
    && typeof o.y === 'number' && o.y >= 0 && o.y <= 1
    && (o.note === undefined || typeof o.note === 'string')
}

export type ImportErgebnis = {
  pins: PlantMapPin[]
  neu: number
  aktualisiert: number
  unbekannteArt: number
  ungueltig: number
}

/**
 * Führt eine exportierte Datei mit den vorhandenen Pins zusammen.
 * Gleiche Pin-ID → der importierte Stand gewinnt. Pins, deren Art es im
 * Katalog nicht gibt, werden nicht übernommen.
 */
export function importieren(
  text: string,
  vorhanden: PlantMapPin[],
  artExistiert: (id: string) => boolean,
): ImportErgebnis {
  let daten: unknown
  try {
    daten = JSON.parse(text)
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.')
  }
  const liste = Array.isArray(daten) ? daten : (daten as { pins?: unknown })?.pins
  if (!Array.isArray(liste)) throw new Error('In der Datei stehen keine Pins.')
  const karte = (daten as { karte?: unknown })?.karte
  if (typeof karte === 'string' && karte !== KARTE_ID) {
    throw new Error(`Die Datei gehört zu einer anderen Karte („${karte}“).`)
  }

  const nachId = new Map(vorhanden.map(p => [p.id, p]))
  let neu = 0, aktualisiert = 0, unbekannteArt = 0, ungueltig = 0
  const jetzt = new Date().toISOString()

  for (const roh of liste) {
    if (!istGueltig(roh)) { ungueltig++; continue }
    if (!artExistiert(roh.speciesId)) { unbekannteArt++; continue }
    const pin: PlantMapPin = {
      id: roh.id,
      speciesId: roh.speciesId,
      x: roh.x,
      y: roh.y,
      note: roh.note?.trim() || undefined,
      createdAt: typeof roh.createdAt === 'string' ? roh.createdAt : jetzt,
      updatedAt: typeof roh.updatedAt === 'string' ? roh.updatedAt : jetzt,
    }
    if (nachId.has(pin.id)) aktualisiert++
    else neu++
    nachId.set(pin.id, pin)
  }
  return { pins: [...nachId.values()], neu, aktualisiert, unbekannteArt, ungueltig }
}

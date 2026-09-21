/**
 * Lernfortschritt. Liegt ausschließlich im Browser des Nutzers (localStorage),
 * es werden keine Daten irgendwohin gesendet.
 */
export type Stand = {
  gesehen: number
  richtig: number
  falsch: number
  unsicher: boolean
  letzte: number | null      // Zeitstempel
  naechste: number | null    // Zeitstempel der nächsten Wiederholung
  stufe: number              // 0 = neu … 5 = sitzt
}

export type Verwechslung = { a: string; b: string; n: number }

type Store = { arten: Record<string, Stand>; fehler: Verwechslung[] }

const KEY = 'gehoelze.fortschritt.v1'
const LEER: Store = { arten: {}, fehler: [] }

function lesen(): Store {
  try {
    const s = localStorage.getItem(KEY)
    return s ? { ...LEER, ...JSON.parse(s) } : { ...LEER }
  } catch { return { ...LEER } }
}
function schreiben(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* Speicher voll oder gesperrt */ }
}

export const neuerStand = (): Stand => ({
  gesehen: 0, richtig: 0, falsch: 0, unsicher: false,
  letzte: null, naechste: null, stufe: 0,
})

export function stand(id: string): Stand {
  return lesen().arten[id] ?? neuerStand()
}
export function alleStaende(): Record<string, Stand> {
  return lesen().arten
}

/** Abstände in Tagen je Stufe – bewusst einfach gehalten. */
const ABSTAND = [0, 1, 3, 7, 16, 35]
const TAG = 86_400_000

export function antwort(id: string, richtig: boolean, unsicher = false) {
  const s = lesen()
  const a = s.arten[id] ?? neuerStand()
  a.gesehen += 1
  a.unsicher = unsicher
  if (richtig) { a.richtig += 1; a.stufe = Math.min(5, a.stufe + 1) }
  else         { a.falsch  += 1; a.stufe = Math.max(0, a.stufe - 2) }
  a.letzte = Date.now()
  a.naechste = Date.now() + ABSTAND[a.stufe] * TAG
  s.arten[id] = a
  schreiben(s)
  return a
}

export function gesehen(id: string) {
  const s = lesen()
  const a = s.arten[id] ?? neuerStand()
  a.gesehen += 1
  a.letzte = Date.now()
  s.arten[id] = a
  schreiben(s)
}

/** Merkt sich, welche Art mit welcher verwechselt wurde. */
export function verwechselt(richtig: string, gewaehlt: string) {
  if (richtig === gewaehlt) return
  const s = lesen()
  const [a, b] = [richtig, gewaehlt].sort()
  const treffer = s.fehler.find(f => f.a === a && f.b === b)
  if (treffer) treffer.n += 1
  else s.fehler.push({ a, b, n: 1 })
  schreiben(s)
}

export function problemgruppen(): Verwechslung[] {
  return lesen().fehler.sort((x, y) => y.n - x.n)
}

export function faellig(ids: string[]): string[] {
  const st = lesen().arten
  const jetzt = Date.now()
  return ids.filter(id => {
    const a = st[id]
    return !a || a.naechste === null || a.naechste <= jetzt
  })
}

export function zuruecksetzen() { schreiben({ ...LEER, arten: {}, fehler: [] }) }

export function uebersicht(ids: string[]) {
  const st = lesen().arten
  let sicher = 0, unsicher = 0, offen = 0
  for (const id of ids) {
    const a = st[id]
    if (!a || a.gesehen === 0) offen++
    else if (a.stufe >= 4 && !a.unsicher) sicher++
    else unsicher++
  }
  return { sicher, unsicher, offen, gesamt: ids.length }
}

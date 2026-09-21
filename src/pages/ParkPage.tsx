import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { byId } from '../data'
import { passtZuSuche } from '../lib/filter'
import {
  pinsLesen, pinsSchreiben, pinAnlegen, pinAendern, exportDatei, importieren,
  type PlantMapPin,
} from '../lib/kartenpins'
import InteractiveParkMap, { type Kartenmodus } from '../components/park/InteractiveParkMap'
import ArtAuswahl from '../components/park/ArtAuswahl'
import PinPanel from '../components/park/PinPanel'

type Dialog =
  | { typ: 'neu'; x: number; y: number }
  | { typ: 'bearbeiten'; pinId: string }
  | null

export default function ParkPage() {
  const [params, setParams] = useSearchParams()
  const [pins, setPins] = useState<PlantMapPin[]>(() => pinsLesen())
  const [modus, setModus] = useState<Kartenmodus>('ansehen')
  const [ausgewaehlt, setAusgewaehlt] = useState<string | null>(null)
  const [verschiebeId, setVerschiebeId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [suche, setSuche] = useState('')
  const [andereAusblenden, setAndereAusblenden] = useState(false)
  const [fokus, setFokus] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const dateiEingabe = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [verdecktAb, setVerdecktAb] = useState<number | null>(null)

  /* ---------- Hilfen ---------- */

  const melden = useCallback((text: string) => setMeldung(text), [])
  useEffect(() => {
    if (!meldung) return
    const t = setTimeout(() => setMeldung(null), 4200)
    return () => clearTimeout(t)
  }, [meldung])

  function uebernehmen(neu: PlantMapPin[]) {
    setPins(neu)
    if (!pinsSchreiben(neu)) {
      melden('Achtung: Der Browser hat das Speichern verweigert. Exportiere deine Pins zur Sicherheit.')
    }
  }

  function abbrechen() {
    setModus('ansehen')
    setVerschiebeId(null)
  }

  // Esc beendet Markier- und Verschiebemodus
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || dialog) return
      if (modus !== 'ansehen') abbrechen()
      else setAusgewaehlt(null)
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [modus, dialog])

  // Von der Artenseite kommend: /park?art=acer_platanoides
  useEffect(() => {
    const art = params.get('art')
    if (!art) return
    const s = byId(art)
    if (s) setSuche(s.name)
    const erster = pins.find(p => p.speciesId === art)
    if (erster) setFokus(erster.id)
    setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- Suche ---------- */

  const treffer = useMemo(() => {
    if (!suche.trim()) return null
    return new Set(pins.filter(p => {
      const s = byId(p.speciesId)
      return s ? passtZuSuche(s, suche) : false
    }).map(p => p.id))
  }, [pins, suche])

  const artenAnzahl = useMemo(() => new Set(pins.map(p => p.speciesId)).size, [pins])

  /* ---------- Karte ---------- */

  function aufKarteGetippt(x: number, y: number) {
    if (modus === 'markieren') {
      setDialog({ typ: 'neu', x, y })
      setModus('ansehen')
    } else if (modus === 'verschieben' && verschiebeId) {
      const pin = pins.find(p => p.id === verschiebeId)
      if (pin) {
        uebernehmen(pins.map(p => p.id === pin.id ? pinAendern(p, { x, y }) : p))
        melden(`${byId(pin.speciesId)?.name ?? 'Pin'} verschoben.`)
        setAusgewaehlt(pin.id)
      }
      abbrechen()
    }
  }

  function aufPinGetippt(id: string) {
    setAusgewaehlt(id)
  }

  /* ---------- Dialog ---------- */

  function speichern(speciesId: string, notiz: string) {
    if (!dialog) return
    if (dialog.typ === 'neu') {
      const pin = pinAnlegen(speciesId, dialog.x, dialog.y, notiz)
      uebernehmen([...pins, pin])
      melden(`${byId(speciesId)?.name} eingetragen.`)
      setAusgewaehlt(null)
    } else {
      uebernehmen(pins.map(p => p.id === dialog.pinId ? pinAendern(p, { speciesId, note: notiz }) : p))
      melden('Pin geändert.')
    }
    setDialog(null)
  }

  /* ---------- Panel-Aktionen ---------- */

  const aktiverPin = pins.find(p => p.id === ausgewaehlt) ?? null

  function loeschen(pin: PlantMapPin) {
    const name = byId(pin.speciesId)?.name ?? 'diesen Pin'
    if (!confirm(`Standort von ${name} löschen? Das lässt sich nicht rückgängig machen.`)) return
    uebernehmen(pins.filter(p => p.id !== pin.id))
    setAusgewaehlt(null)
    melden('Pin gelöscht.')
  }

  function verschiebenStarten(pin: PlantMapPin) {
    setVerschiebeId(pin.id)
    setModus('verschieben')
    setAusgewaehlt(null) // Panel schließen, damit die Karte frei ist
  }

  /* ---------- Export / Import ---------- */

  function exportieren() {
    if (pins.length === 0) { melden('Noch keine Pins zum Exportieren.'); return }
    const { name, inhalt } = exportDatei(pins)
    const url = URL.createObjectURL(new Blob([inhalt], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    melden(`${pins.length} Pins als ${name} gesichert.`)
  }

  async function importDatei(datei: File) {
    try {
      const text = await datei.text()
      const erg = importieren(text, pins, id => Boolean(byId(id)))
      uebernehmen(erg.pins)
      const teile = [`${erg.neu} neu`, `${erg.aktualisiert} aktualisiert`]
      if (erg.unbekannteArt) teile.push(`${erg.unbekannteArt} mit unbekannter Art übersprungen`)
      if (erg.ungueltig) teile.push(`${erg.ungueltig} ungültig`)
      melden(`Import: ${teile.join(', ')}.`)
    } catch (e) {
      melden(e instanceof Error ? e.message : 'Import fehlgeschlagen.')
    }
  }

  /* ---------- Darstellung ---------- */

  // Am Handy liegt das Infofenster über der Karte: seine Oberkante an die Karte melden
  useLayoutEffect(() => {
    const el = panelRef.current
    const handy = window.matchMedia('(max-width: 767px)').matches
    setVerdecktAb(el && handy ? el.getBoundingClientRect().top : null)
  }, [ausgewaehlt, modus])

  const verschiebeArt = verschiebeId ? byId(pins.find(p => p.id === verschiebeId)?.speciesId ?? '') : undefined
  const panelOffen = Boolean(aktiverPin) && modus === 'ansehen'

  return (
    <div className="flex flex-col"
         style={{ height: 'calc(100svh - 62px - env(safe-area-inset-bottom))' }}>
      {/* Kopf und Werkzeuge */}
      <header className="px-3 md:px-5 pt-3 pb-2 border-b border-line bg-paper space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[17px] md:text-[20px] font-semibold leading-tight">
            Türkenschanzpark – Gehölzkarte
          </h1>
          <Link to="/park/fuehrer" className="text-[13px] underline whitespace-nowrap">Parkführer-Liste</Link>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <input value={suche} onChange={e => setSuche(e.target.value)} type="search"
                 placeholder="Gehölz auf der Karte suchen …" aria-label="Gehölz auf der Karte suchen"
                 className="w-full md:flex-1 min-w-0 h-11 px-3 border border-line rounded-xl2 text-[16px]" />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setAusgewaehlt(null); setVerschiebeId(null); setModus(modus === 'markieren' ? 'ansehen' : 'markieren') }}
              className={`h-11 px-3 rounded-xl2 text-[15px] font-medium whitespace-nowrap
                ${modus === 'markieren' ? 'bg-signal text-paper' : 'bg-ink text-paper'}`}>
              {modus === 'markieren' ? 'Abbrechen' : '+ Gehölz markieren'}
            </button>
            <button onClick={exportieren} className="h-11 px-3 rounded-xl2 border border-line text-[13px] font-medium">
              Pins exportieren
            </button>
            <button onClick={() => dateiEingabe.current?.click()}
                    className="h-11 px-3 rounded-xl2 border border-line text-[13px] font-medium">
              Pins importieren
            </button>
          </div>
        </div>

        {treffer && (
          <label className="flex items-center gap-1.5 text-[13px]">
            <input type="checkbox" checked={andereAusblenden} onChange={e => setAndereAusblenden(e.target.checked)}
                   className="w-4 h-4 accent-ink" />
            andere ausblenden
          </label>
        )}
        <input ref={dateiEingabe} type="file" accept="application/json,.json" className="hidden"
               onChange={e => { const f = e.target.files?.[0]; if (f) importDatei(f); e.target.value = '' }} />
      </header>

      {/* Karte */}
      <div className="relative flex-1 min-h-0">
        <InteractiveParkMap
          pins={pins}
          modus={modus}
          ausgewaehlt={verschiebeId ?? ausgewaehlt}
          treffer={treffer}
          andereAusblenden={andereAusblenden}
          vorschau={dialog?.typ === 'neu' ? { x: dialog.x, y: dialog.y } : null}
          fokusPinId={fokus}
          verdecktAb={verdecktAb}
          aufKarteGetippt={aufKarteGetippt}
          aufPinGetippt={aufPinGetippt}
        />

        {/* Hinweisband für Markier- und Verschiebemodus */}
        {modus !== 'ansehen' && (
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-3 rounded-xl2 bg-ink text-paper px-4 py-2.5 shadow">
            <p className="flex-1 text-[15px]">
              {modus === 'markieren'
                ? 'Tippe auf den Standort des Gehölzes.'
                : <>Tippe auf die neue Position für <span className="binom">{verschiebeArt?.name}</span>.</>}
            </p>
            <button onClick={abbrechen} className="text-[14px] underline">Abbrechen</button>
          </div>
        )}

        {pins.length === 0 && modus === 'ansehen' && !dialog && (
          <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none">
            <p className="mx-auto max-w-[460px] rounded-xl2 bg-paper/95 border border-line px-4 py-3 text-[14px] leading-relaxed shadow-sm">
              Noch keine Standorte. Zoome an die Stelle, tippe auf <strong>+ Gehölz markieren</strong> und
              dann auf den Baum.
            </p>
          </div>
        )}

        {/* Infopanel: auf dem Desktop seitlich über der Karte, auf dem Handy von unten */}
        {panelOffen && aktiverPin && (
          <aside ref={panelRef} className="fixed md:absolute inset-x-0 bottom-0 md:inset-x-auto md:right-0 md:top-0 z-50 md:z-20
                            h-[60svh] md:h-auto md:max-h-none md:w-[400px] bg-paper
                            border-t md:border-t-0 md:border-l border-line rounded-t-[18px] md:rounded-none shadow-2xl
                            flex flex-col">
            <PinPanel
              pin={aktiverPin}
              weitereStandorte={pins.filter(p => p.speciesId === aktiverPin.speciesId).length - 1}
              schliessen={() => setAusgewaehlt(null)}
              bearbeiten={() => setDialog({ typ: 'bearbeiten', pinId: aktiverPin.id })}
              verschieben={() => verschiebenStarten(aktiverPin)}
              loeschen={() => loeschen(aktiverPin)}
            />
          </aside>
        )}
      </div>

      {/* Fußzeile mit Zählung */}
      <p className="px-3 md:px-5 py-2 border-t border-line text-[13px] text-muted bg-paper">
        <strong className="text-ink tabular-nums">{pins.length}</strong>{' '}
        eingetragene{pins.length === 1 ? 'r' : ''} Gehölzstandort{pins.length === 1 ? '' : 'e'}
        {pins.length > 0 && <> · {artenAnzahl} Art{artenAnzahl === 1 ? '' : 'en'}</>}
        {treffer && <> · <span className="text-ink">{treffer.size} passen zu „{suche.trim()}“</span></>}
      </p>

      {dialog && (
        <ArtAuswahl
          titel={dialog.typ === 'neu' ? 'Welches Gehölz steht hier?' : 'Pin bearbeiten'}
          startArt={dialog.typ === 'bearbeiten' ? pins.find(p => p.id === dialog.pinId)?.speciesId : undefined}
          startNotiz={dialog.typ === 'bearbeiten' ? pins.find(p => p.id === dialog.pinId)?.note : undefined}
          speichern={speichern}
          abbrechen={() => setDialog(null)}
        />
      )}

      {meldung && (
        <div role="status"
             className="fixed left-1/2 -translate-x-1/2 bottom-[84px] z-[70] max-w-[92vw] rounded-xl2 bg-ink text-paper px-4 py-2.5 text-[14px] shadow-lg">
          {meldung}
        </div>
      )}
    </div>
  )
}

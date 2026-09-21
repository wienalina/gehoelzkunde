import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { byId } from '../../data'
import { relativePosition, type PlantMapPin } from '../../lib/kartenpins'

/** Das Kartenbild liegt unverändert in public/maps/. Pins werden nur darübergelegt. */
export const KARTENBILD = {
  src: `${import.meta.env.BASE_URL}maps/tuerkenschanzpark.png`,
  breite: 2424,
  hoehe: 1306,
}

export type Kartenmodus = 'ansehen' | 'markieren' | 'verschieben'

type Props = {
  pins: PlantMapPin[]
  modus: Kartenmodus
  ausgewaehlt: string | null
  treffer: Set<string> | null        // null = keine Suche aktiv
  andereAusblenden: boolean
  vorschau: { x: number; y: number } | null   // Position, während der Dialog offen ist
  fokusPinId: string | null
  /** Bildschirm-y, ab dem die Karte von unten verdeckt ist (Infofenster am Handy) */
  verdecktAb: number | null
  aufKarteGetippt: (x: number, y: number) => void
  aufPinGetippt: (id: string) => void
}

const TIPP_TOLERANZ = 8 // px: mehr Bewegung ist Verschieben, kein Tippen

export default function InteractiveParkMap(props: Props) {
  const { pins, modus, ausgewaehlt, treffer, andereAusblenden, vorschau, fokusPinId, verdecktAb } = props

  const rahmen = useRef<HTMLDivElement>(null)
  const inhalt = useRef<HTMLDivElement>(null)
  const bild = useRef<HTMLImageElement>(null)
  const steuerung = useRef<ReactZoomPanPinchRef | null>(null)
  const druck = useRef<{ x: number; y: number; id: number } | null>(null)
  const finger = useRef(0)

  const [flaeche, setFlaeche] = useState({ w: 0, h: 0 })
  const [seiten, setSeiten] = useState(KARTENBILD.breite / KARTENBILD.hoehe)
  const [geladen, setGeladen] = useState(false)
  // Die Bibliothek zentriert erst im ersten Rückruf ihres ResizeObservers.
  // Vorher gestartete Zoom-Animationen würden dabei überschrieben.
  const [bereit, setBereit] = useState(false)
  const [fehler, setFehler] = useState(false)

  // Verfügbare Fläche messen – die Karte passt sich jeder Fenstergröße an
  useLayoutEffect(() => {
    const el = rahmen.current
    if (!el) return
    const messen = () => setFlaeche({ w: el.clientWidth, h: el.clientHeight })
    messen()
    const ro = new ResizeObserver(messen)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Bild so groß wie möglich, vollständig sichtbar, Seitenverhältnis bleibt
  const passW = Math.max(1, Math.min(flaeche.w, flaeche.h * seiten))
  const passH = Math.max(1, passW / seiten)

  // Pins sollen beim Zoomen gleich groß bleiben: Gegenskalierung per CSS-Variable,
  // ohne bei jeder Bewegung React neu rendern zu müssen.
  function skalaSetzen(scale: number) {
    inhalt.current?.style.setProperty('--z', String(scale))
  }

  // Kommt das Bild aus dem Cache, ist es womöglich fertig, bevor onLoad angehängt ist
  useLayoutEffect(() => {
    const i = bild.current
    if (i && i.complete && i.naturalWidth > 0) {
      setSeiten(i.naturalWidth / i.naturalHeight)
      setGeladen(true)
    }
  })

  // Zu einem Pin springen (z. B. von der Artenseite aus)
  useEffect(() => {
    if (!fokusPinId || !geladen || !bereit || !steuerung.current) return
    const el = inhalt.current?.querySelector<HTMLElement>(`[data-pin-id="${CSS.escape(fokusPinId)}"]`)
    if (el) steuerung.current.zoomToElement(el, 4, 500)
  }, [fokusPinId, geladen, bereit])

  // Deckt das Infofenster am Handy den Pin zu, die Karte so weit zoomen und
  // verschieben, dass der Pin im freien Bereich darüber liegt.
  useEffect(() => {
    const st = steuerung.current
    const pin = pins.find(p => p.id === ausgewaehlt)
    if (!pin || verdecktAb === null || !st || !rahmen.current) return
    const el = inhalt.current?.querySelector<HTMLElement>(`[data-pin-id="${CSS.escape(pin.id)}"]`)
    if (!el) return
    const r = rahmen.current.getBoundingClientRect()
    const frei = Math.min(r.bottom, verdecktAb) - r.top
    if (frei <= 60) return
    const spitze = el.getBoundingClientRect().bottom
    if (spitze > r.top + 44 && spitze < r.top + frei - 12) return // liegt schon frei

    // Lage des Pins im ungezoomten Inhalt
    const px = pin.x * passW
    const py = pin.y * passH
    const zielX = r.width / 2
    const zielY = frei * 0.62
    // Die Bibliothek erlaubt nur Verschiebungen, bei denen das Bild den Rahmen füllt.
    // Daraus folgt die kleinste Skala, bei der der Pin auf zielY landen darf.
    let s = st.instance.transformState.scale
    if (py > 0 && passH - py > 0) s = Math.max(s, zielY / py, (r.height - zielY) / (passH - py))
    s = Math.min(12, s)
    const lage = (ziel: number, p: number, inhaltGr: number, rahmenGr: number) => {
      const gr = inhaltGr * s
      if (gr <= rahmenGr) return (rahmenGr - gr) / 2
      return Math.min(0, Math.max(rahmenGr - gr, ziel - p * s))
    }
    const x = lage(zielX, px, passW, r.width)
    const y = lage(zielY, py, passH, r.height)
    // Erst nach dem Ende der Berührung: Auf „touchend“ richtet die Bibliothek die
    // Karte selbst aus und würde eine früher gestartete Bewegung abbrechen.
    const t = setTimeout(() => st.setTransform(x, y, s, 350), 120)
    return () => clearTimeout(t)
  }, [ausgewaehlt, verdecktAb, pins, passW, passH])

  function onPointerDown(e: React.PointerEvent) {
    finger.current += 1
    if (finger.current === 1) druck.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
    else druck.current = null // zwei Finger: Zoomen, kein Tippen
  }

  function onPointerUp(e: React.PointerEvent) {
    finger.current = Math.max(0, finger.current - 1)
    const start = druck.current
    druck.current = null
    if (!start || start.id !== e.pointerId) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > TIPP_TOLERANZ) return // war Verschieben

    const pinEl = (e.target as HTMLElement).closest<HTMLElement>('[data-pin-id]')
    if (pinEl && modus === 'ansehen') {
      props.aufPinGetippt(pinEl.dataset.pinId!)
      return
    }
    if (modus === 'ansehen') return // im normalen Modus setzt ein Tipp keinen Pin

    const rect = bild.current?.getBoundingClientRect()
    if (!rect) return
    const pos = relativePosition(e.clientX, e.clientY, rect)
    if (pos) props.aufKarteGetippt(pos.x, pos.y)
  }

  function onPointerCancel() {
    finger.current = Math.max(0, finger.current - 1)
    druck.current = null
  }

  const zielen = modus !== 'ansehen'

  return (
    <div ref={rahmen} className="relative w-full h-full overflow-hidden bg-mist select-none">
      {flaeche.w > 0 && (
        <TransformWrapper
          // Nur bei deutlicher Größenänderung (Drehen, Fenster) neu aufsetzen
          key={`${Math.round(passW / 40)}x${Math.round(passH / 40)}`}
          ref={steuerung}
          minScale={1}
          maxScale={12}
          centerOnInit
          centerZoomedOut
          limitToBounds
          wheel={{ step: 0.15 }}
          doubleClick={{ disabled: zielen, step: 0.8 }}
          panning={{ velocityDisabled: false }}
          onInit={r => {
            skalaSetzen(r.state.scale)
            setBereit(false)
            requestAnimationFrame(() => requestAnimationFrame(() => setBereit(true)))
          }}
          onTransformed={(_, st) => skalaSetzen(st.scale)}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: passW, height: passH }}
          >
            <div
              ref={inhalt}
              className={`relative ${zielen ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
              style={{ width: passW, height: passH, ['--z' as string]: 1 }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              <img
                ref={bild}
                src={KARTENBILD.src}
                alt="Karte des Türkenschanzparks"
                width={passW}
                height={passH}
                draggable={false}
                onLoad={e => {
                  const i = e.currentTarget
                  if (i.naturalWidth && i.naturalHeight) setSeiten(i.naturalWidth / i.naturalHeight)
                  setGeladen(true)
                }}
                onError={() => setFehler(true)}
                className="block w-full h-full pointer-events-none"
              />

              {/* Pins liegen über dem Bild, das Bild selbst bleibt unangetastet */}
              <div className="absolute inset-0">
                {pins.map(p => {
                  const s = byId(p.speciesId)
                  const passt = !treffer || treffer.has(p.id)
                  if (!passt && andereAusblenden) return null
                  return (
                    <Pin key={p.id} pin={p}
                         titel={s ? `${s.name}${s.de ? ' – ' + s.de : ''}` : p.speciesId}
                         farbe={s?.group === 'nadel' ? 'var(--nadel)' : 'var(--laub)'}
                         aktiv={ausgewaehlt === p.id}
                         treffer={!!treffer && passt}
                         gedimmt={!passt}
                         onAktivieren={() => modus === 'ansehen' && props.aufPinGetippt(p.id)} />
                  )
                })}
                {vorschau && (
                  <div className="absolute pointer-events-none"
                       style={{ left: `${vorschau.x * 100}%`, top: `${vorschau.y * 100}%`,
                                transform: 'translate(-50%, -100%) scale(calc(1 / var(--z)))',
                                transformOrigin: '50% 100%' }}>
                    <PinForm farbe="#12241B" gestrichelt />
                  </div>
                )}
              </div>
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}

      {fehler && (
        <p className="absolute inset-0 grid place-items-center text-center px-6 text-[15px]">
          Das Kartenbild wurde nicht gefunden. Es gehört nach
          <code className="mx-1">public/maps/tuerkenschanzpark.png</code>.
        </p>
      )}

      {/* Zoomsteuerung */}
      <div className="absolute right-3 bottom-3 z-10 flex flex-col gap-2">
        {[
          { label: 'Hineinzoomen', zeichen: '+', tun: () => steuerung.current?.zoomIn(0.6) },
          { label: 'Herauszoomen', zeichen: '−', tun: () => steuerung.current?.zoomOut(0.6) },
        ].map(k => (
          <button key={k.label} onClick={k.tun} aria-label={k.label}
                  className="w-12 h-12 rounded-xl2 bg-paper border border-line shadow-sm text-[24px] leading-none">
            {k.zeichen}
          </button>
        ))}
      </div>
      <button onClick={() => steuerung.current?.resetTransform(300)}
              className="absolute left-3 bottom-3 z-10 h-11 px-3 rounded-xl2 bg-paper border border-line shadow-sm text-[14px] font-medium">
        Ansicht zurücksetzen
      </button>
    </div>
  )
}

/* ---------- Pin ---------- */

function PinForm({ farbe, gestrichelt = false }: { farbe: string; gestrichelt?: boolean }) {
  return (
    <svg width="28" height="38" viewBox="0 0 28 38" aria-hidden className="block drop-shadow">
      <path d="M14 37C14 37 2 22.5 2 14a12 12 0 0 1 24 0c0 8.5-12 23-12 23z"
            fill={gestrichelt ? 'rgba(255,255,255,.85)' : farbe}
            stroke={gestrichelt ? farbe : '#fff'} strokeWidth="2"
            strokeDasharray={gestrichelt ? '3 2' : undefined} />
      <circle cx="14" cy="14" r="4.5" fill={gestrichelt ? farbe : '#fff'} />
    </svg>
  )
}

function Pin({ pin, titel, farbe, aktiv, treffer, gedimmt, onAktivieren }: {
  pin: PlantMapPin; titel: string; farbe: string
  aktiv: boolean; treffer: boolean; gedimmt: boolean
  onAktivieren: () => void
}) {
  const vergroesserung = aktiv ? 1.35 : treffer ? 1.15 : 1
  return (
    <button
      type="button"
      data-pin-id={pin.id}
      title={titel}
      aria-label={`Standort: ${titel}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAktivieren() } }}
      className="absolute px-1 pt-1"
      style={{
        left: `${pin.x * 100}%`,
        top: `${pin.y * 100}%`,
        transform: `translate(-50%, -100%) scale(calc(${vergroesserung} / var(--z)))`,
        transformOrigin: '50% 100%',
        opacity: gedimmt ? 0.22 : 1,
        zIndex: aktiv ? 3 : treffer ? 2 : 1,
        filter: aktiv ? 'drop-shadow(0 0 0 #12241B) drop-shadow(0 0 3px #12241B)' : undefined,
        transition: 'opacity .15s',
      }}
    >
      <PinForm farbe={farbe} />
    </button>
  )
}

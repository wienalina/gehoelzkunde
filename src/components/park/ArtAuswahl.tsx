import { useEffect, useMemo, useRef, useState } from 'react'
import { SPECIES, byId } from '../../data'
import { passtZuSuche } from '../../lib/filter'

type Props = {
  titel: string
  startArt?: string
  startNotiz?: string
  speichern: (speciesId: string, notiz: string) => void
  abbrechen: () => void
}

/**
 * Wählt eine Art aus dem bestehenden Katalog – es gibt keine zweite Pflanzenliste.
 * Gesucht wird nach lateinischem und deutschem Namen, Gattung und Familie.
 */
export default function ArtAuswahl({ titel, startArt, startNotiz, speichern, abbrechen }: Props) {
  const [suche, setSuche] = useState('')
  const [artId, setArtId] = useState<string | undefined>(startArt)
  const [notiz, setNotiz] = useState(startNotiz ?? '')
  const [nurPruefung, setNurPruefung] = useState(true)
  const eingabe = useRef<HTMLInputElement>(null)

  useEffect(() => { eingabe.current?.focus() }, [])
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') abbrechen() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abbrechen])

  const treffer = useMemo(() => {
    if (!suche.trim()) return []
    return SPECIES
      .filter(s => (!nurPruefung || s.exam) && s.dataState !== 'ohne_quelle' && passtZuSuche(s, suche))
      .sort((a, b) => Number(b.exam) - Number(a.exam) || a.name.localeCompare(b.name, 'de'))
      .slice(0, 40)
  }, [suche, nurPruefung])

  const gewaehlt = artId ? byId(artId) : undefined

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-ink/40"
         onClick={abbrechen}>
      <div role="dialog" aria-modal="true" aria-label={titel}
           className="bg-paper w-full md:max-w-[520px] max-h-[92dvh] flex flex-col rounded-t-[18px] md:rounded-[18px]"
           onClick={e => e.stopPropagation()}>
        <header className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">{titel}</h2>
          <button onClick={abbrechen} className="text-[15px] px-2 py-2 -mr-2 text-muted">Abbrechen</button>
        </header>

        <div className="px-4 pt-3 pb-2 border-b border-line">
          {gewaehlt ? (
            <div className="flex items-center justify-between gap-3 border-2 border-ink rounded-xl2 px-3 py-2">
              <span className="min-w-0">
                <span className="block binom text-[17px] truncate">{gewaehlt.name}</span>
                <span className="block text-[13px] text-muted truncate">
                  {gewaehlt.de || gewaehlt.family}
                </span>
              </span>
              <button onClick={() => { setArtId(undefined); setTimeout(() => eingabe.current?.focus(), 0) }}
                      className="text-[14px] underline shrink-0">ändern</button>
            </div>
          ) : (
            <>
              <input ref={eingabe} value={suche} onChange={e => setSuche(e.target.value)}
                     type="search" placeholder="Name, Gattung oder Familie"
                     aria-label="Art suchen"
                     className="w-full h-12 px-3 border border-line rounded-xl2 text-[16px]" />
              <label className="flex items-center gap-2 text-[14px] mt-2">
                <input type="checkbox" checked={nurPruefung} onChange={e => setNurPruefung(e.target.checked)}
                       className="w-5 h-5 accent-ink" />
                nur Prüfungsarten
              </label>
            </>
          )}
        </div>

        {!gewaehlt && (
          <ul className="flex-1 overflow-y-auto min-h-[120px]">
            {!suche.trim() && (
              <li className="px-4 py-6 text-[15px] text-muted">
                Tippe z. B. „Acer“, „Ahorn“ oder „Fagaceae“.
              </li>
            )}
            {suche.trim() && treffer.length === 0 && (
              <li className="px-4 py-6 text-[15px] text-muted">Keine Art gefunden.</li>
            )}
            {treffer.map(s => (
              <li key={s.id}>
                <button onClick={() => setArtId(s.id)}
                        className="w-full text-left px-4 py-2.5 border-b border-line active:bg-mist flex gap-3">
                  <span aria-hidden className={`w-1.5 self-stretch ${s.group === 'nadel' ? 'bg-nadel' : 'bg-laub'}`} />
                  <span className="min-w-0">
                    <span className="block binom text-[16px] truncate">{s.name}</span>
                    <span className="block text-[13px] text-muted truncate">
                      {[s.de, s.family].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="px-4 py-3 border-t border-line" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <label className="block text-[13px] text-muted mb-1" htmlFor="pin-notiz">
            Notiz zum Standort (optional)
          </label>
          <textarea id="pin-notiz" value={notiz} onChange={e => setNotiz(e.target.value)} rows={2}
                    placeholder="z. B. hinter der Bank am Teich, mehrstämmig"
                    className="w-full px-3 py-2 border border-line rounded-xl2 text-[16px] resize-none" />
          <button disabled={!artId} onClick={() => artId && speichern(artId, notiz)}
                  className="w-full h-12 mt-2 rounded-xl2 bg-ink text-paper text-[16px] font-medium disabled:opacity-30">
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}

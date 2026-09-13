import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SPECIES } from '../data'
import SpeciesRow from '../components/SpeciesRow'
import { BLOECKE, passt, hatText, naechsteFrage } from '../lib/merkmale'
import type { Umfang } from '../lib/filter'

export default function KeyPage() {
  const [params, setParams] = useSearchParams()
  const startGruppe = (params.get('start') as 'nadel' | 'laub' | null) ?? null

  const [gruppe, setGruppe] = useState<'nadel' | 'laub' | null>(startGruppe)
  const [gewaehlt, setGewaehlt] = useState<string[]>([])
  const [umfang, setUmfang] = useState<Umfang>('pruefung')

  const grundmenge = useMemo(
    () => SPECIES.filter(s => {
      if (!hatText(s)) return false
      if (umfang === 'pruefung' && !s.exam) return false
      if (umfang === 'vorlesung' && !(s.exam || s.inLecture)) return false
      if (gruppe && s.group !== gruppe) return false
      return true
    }),
    [gruppe, umfang])

  const kandidaten = useMemo(
    () => grundmenge.filter(s => passt(s, gewaehlt)),
    [grundmenge, gewaehlt])

  const tipp = useMemo(
    () => naechsteFrage(kandidaten, gewaehlt, gruppe),
    [kandidaten, gewaehlt, gruppe])

  function umschalten(id: string) {
    setGewaehlt(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id])
  }
  function zuruecksetzen() {
    setGewaehlt([]); setGruppe(null); setParams({})
  }

  const bloecke = BLOECKE.filter(b => !gruppe || b.gruppe === 'beide' || b.gruppe === gruppe)

  return (
    <div className="pb-24">
      <header className="px-4 pt-5 pb-4">
        <h1 className="text-[24px] font-semibold leading-tight">Was siehst du?</h1>
        <p className="text-[14px] text-muted mt-1">
          Kreuz an, was du am Gehölz erkennst. Die Liste unten schrumpft mit jeder Angabe.
        </p>
      </header>

      <section className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {(['nadel', 'laub'] as const).map(g => (
            <button key={g} onClick={() => setGruppe(gruppe === g ? null : g)}
              className={`h-16 rounded-xl2 text-[16px] font-semibold border-2 px-2
                ${gruppe === g
                  ? (g === 'nadel' ? 'bg-nadel text-paper border-nadel' : 'bg-laub text-paper border-laub')
                  : 'border-line'}`}>
              {g === 'nadel' ? 'Nadeln oder Schuppen' : 'Flächige Blätter'}
            </button>
          ))}
        </div>
      </section>

      <div className="sticky top-0 z-30 bg-paper border-y border-line px-4 py-2.5 flex items-center justify-between gap-3">
        <p className="text-[15px]">
          <strong className="tabular-nums">{kandidaten.length}</strong>
          {' '}von {grundmenge.length} kommen infrage
        </p>
        {(gewaehlt.length > 0 || gruppe) && (
          <button onClick={zuruecksetzen} className="text-[14px] font-medium underline">
            Neu anfangen
          </button>
        )}
      </div>

      {tipp && kandidaten.length > 1 && (
        <section className="px-4 py-3 bg-mist border-b border-line">
          <p className="text-[14px] text-muted mb-2">Diese Frage trennt am besten:</p>
          <button onClick={() => umschalten(tipp.id)}
                  className="w-full text-left min-h-[52px] px-3 py-2.5 rounded-xl2 border-2 border-ink text-[16px] font-medium">
            {tipp.frage}
          </button>
        </section>
      )}

      {bloecke.map(block => (
        <section key={block.titel} className="border-b border-line">
          <h2 className="px-4 py-2 text-[13px] text-muted bg-mist">{block.titel}</h2>
          <ul>
            {block.punkte.map(p => (
              <li key={p.id}>
                <label className="tap px-4 gap-3 border-b border-line last:border-0">
                  <input type="checkbox" checked={gewaehlt.includes(p.id)}
                         onChange={() => umschalten(p.id)} className="w-6 h-6 accent-ink shrink-0" />
                  <span className="text-[16px]">{p.frage}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="pt-5">
        <h2 className="px-4 text-[15px] font-semibold mb-2">
          {kandidaten.length === 0 ? 'Keine Art passt zu allem' : 'Kommt infrage'}
        </h2>
        {kandidaten.length === 0 ? (
          <p className="px-4 text-[15px] leading-relaxed">
            Nimm eine Angabe zurück. Die Suche liest die Merkmalstexte aus den
            Studienblättern — steht ein Merkmal dort nicht ausdrücklich, fällt die
            Art heraus, auch wenn sie passen würde.
          </p>
        ) : kandidaten.length > 40 ? (
          <p className="px-4 text-[15px] text-muted">
            Noch zu viele. Beantworte eine weitere Frage.
          </p>
        ) : (
          <ul>{kandidaten.map(s => <SpeciesRow key={s.id} s={s} />)}</ul>
        )}
      </section>

      <section className="px-4 py-5 mt-2 border-t border-line">
        <label className="block text-[13px] text-muted mb-1">Wie viele Arten durchsuchen?</label>
        <select value={umfang} onChange={e => setUmfang(e.target.value as Umfang)}
                className="w-full h-12 border border-line rounded-xl2 px-3 text-[15px] bg-paper">
          <option value="pruefung">nur Prüfungsarten</option>
          <option value="vorlesung">Prüfung und Vorlesung</option>
          <option value="alle">alles aus dem Skript</option>
        </select>
        <p className="text-[13px] text-muted mt-3 leading-relaxed">
          Gesucht wird in den Merkmalstexten aus den Studienblättern und der
          Zusammenfassung 2021S. Ein Merkmal, das dort nicht erwähnt ist, zählt hier
          als nicht vorhanden — das ist die Grenze dieser Methode.
          {' '}<Link to="/arten" className="underline">Alle Arten durchsehen</Link>
        </p>
      </section>
    </div>
  )
}

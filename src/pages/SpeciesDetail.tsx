import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { byId, SPECIES } from '../data'
import { Hauptbild, Bildraster } from '../components/ImageGrid'
import { gesehen } from '../lib/progress'

function Fehlt({ was }: { was: string }) {
  return <p className="text-[15px] text-muted">Nicht in den bereitgestellten Unterlagen gefunden ({was}).</p>
}

export default function SpeciesDetail() {
  const { id = '' } = useParams()
  const s = byId(id)
  useEffect(() => { if (s) gesehen(s.id) }, [s?.id])

  if (!s) return <p className="p-4">Diese Art gibt es im Datenbestand nicht.</p>

  const geschwister = SPECIES.filter(x => x.genus === s.genus && x.id !== s.id)

  return (
    <article className="pb-24">
      <header className="px-4 pt-5 pb-4">
        <p className="text-[13px] text-muted">
          {s.family}
          {s.familySource === 'extern' && ' (Familie extern ergänzt)'}
          <span className="text-line"> › </span>{s.genus}
        </p>
        <h1 className="binom text-[26px] leading-tight mt-1">{s.name}</h1>
        {s.de && <p className="text-[17px] mt-0.5">{s.de}</p>}
        {s.synonym && (
          <p className="text-[13px] text-muted mt-1">
            In der Lehrveranstaltung auch: <span className="binom">{s.synonym}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3 text-[12px]">
          <span className={`px-2 py-1 rounded-full text-paper ${s.group === 'nadel' ? 'bg-nadel' : 'bg-laub'}`}>
            {s.group === 'nadel' ? 'Nadelgehölz' : 'Laubgehölz'}
          </span>
          {s.exam && <span className="px-2 py-1 rounded-full border border-ink">Prüfungsart</span>}
          {s.native && <span className="px-2 py-1 rounded-full border border-laub text-laub">heimisch</span>}
          {s.inPark && <span className="px-2 py-1 rounded-full border border-line">Türkenschanzpark</span>}
          {s.checkName && <span className="px-2 py-1 rounded-full bg-signal text-paper">Name prüfen</span>}
        </div>
      </header>

      <Hauptbild id={s.id} />

      {s.checkName && (
        <section className="px-4 py-4 border-b border-line bg-mist">
          <h2 className="text-[15px] font-semibold mb-1">Name noch nicht gegengeprüft</h2>
          <p className="text-[14px] leading-relaxed">
            Dieser Name stammt allein aus der Texterkennung des Skripts
            {s.skriptPages.length > 0 && <> (Seite {s.skriptPages.join(', ')})</>}.
            {s.ocrSuspect && ' Die Endung passt nicht zu einem lateinischen Epitheton – vermutlich ein Lesefehler.'}
            {s.ocrVariants && <> Gelesene Varianten: {s.ocrVariants}.</>}
          </p>
        </section>
      )}

      <section className="px-4 py-4 border-b border-line">
        <h2 className="text-[15px] font-semibold mb-2">Erkennen</h2>
        {s.entscheidend?.length
          ? <ol className="list-decimal pl-5 space-y-1 text-[15px]">
              {s.entscheidend.map((f, i) => <li key={i}>{f.text}</li>)}
            </ol>
          : <Fehlt was="Merkmale folgen in Phase 4" />}
      </section>

      <section className="px-4 py-4 border-b border-line">
        <h2 className="text-[15px] font-semibold mb-2">Nicht verwechseln mit</h2>
        {s.verwechslung?.length
          ? <ul className="space-y-2">
              {s.verwechslung.map((v, i) => (
                <li key={i} className="border border-line rounded-xl2 p-3">
                  <Link to={`/art/${v.mit}`} className="binom text-[15px] underline">{byId(v.mit)?.name ?? v.mit}</Link>
                  <p className="text-[14px] mt-1">{v.trennmerkmal.text}</p>
                </li>
              ))}
            </ul>
          : <Fehlt was="Verwechslungsgruppen folgen in Phase 5" />}
      </section>

      <section className="px-4 py-4 border-b border-line">
        <h2 className="text-[15px] font-semibold mb-2">Bilder</h2>
      </section>
      <Bildraster id={s.id} />

      <section className="px-4 py-4 border-b border-line">
        <h2 className="text-[15px] font-semibold mb-2">Türkenschanzpark</h2>
        {s.inPark
          ? <p className="text-[15px]">Im Gehölzkundeführer belegt. Das genaue Kartenblatt wird in Phase 10 ergänzt.</p>
          : <p className="text-[15px] text-muted">Im Führer nicht gefunden.</p>}
      </section>

      {geschwister.length > 0 && (
        <section className="px-4 py-4">
          <h2 className="text-[15px] font-semibold mb-2">Andere Arten der Gattung {s.genus}</h2>
          <ul className="flex flex-wrap gap-2">
            {geschwister.map(g => (
              <li key={g.id}>
                <Link to={`/art/${g.id}`} className="inline-block binom text-[14px] border border-line rounded-full px-3 py-1.5">
                  {g.epithet || g.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="px-4 py-4 text-[13px] text-muted border-t border-line">
        Belegt in:{' '}
        {[s.inSkript && `Skript${s.skriptPages.length ? ' S. ' + s.skriptPages.join(', ') : ''}`,
          s.inLecture && 'Vorlesungsliste',
          s.inSummary && 'Zusammenfassung 2021S',
          s.inPark && 'Parkführer'].filter(Boolean).join(' · ') || 'keine Quelle'}
      </footer>
    </article>
  )
}

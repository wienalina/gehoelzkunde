import { Link } from 'react-router-dom'
import { SPECIES, stats } from '../data'
import { uebersicht, problemgruppen } from '../lib/progress'
import { byId } from '../data'

export default function Home() {
  const pruefung = SPECIES.filter(s => s.exam && s.dataState !== 'ohne_quelle')
  const u = uebersicht(pruefung.map(s => s.id))
  const probleme = problemgruppen().slice(0, 4)

  return (
    <div className="pb-24">
      {/* Die Frage, mit der draußen jede Bestimmung anfängt */}
      <section className="px-4 pt-8 pb-6">
        <h1 className="text-[28px] leading-[1.15] font-semibold tracking-tight">
          Du stehst vor einem Gehölz.<br />Was siehst du?
        </h1>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <Link to="/schluessel?start=nadel"
                className="h-28 rounded-xl2 bg-nadel text-paper flex flex-col justify-end p-4">
            <span className="text-[20px] font-semibold">Nadeln</span>
            <span className="text-[13px] opacity-80">oder Schuppen</span>
          </Link>
          <Link to="/schluessel?start=laub"
                className="h-28 rounded-xl2 bg-laub text-paper flex flex-col justify-end p-4">
            <span className="text-[20px] font-semibold">Blätter</span>
            <span className="text-[13px] opacity-80">flächig, sommer- oder immergrün</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-5 border-t border-line">
        <h2 className="text-[15px] font-semibold mb-3">Dein Stand</h2>
        <dl className="grid grid-cols-3 border border-line rounded-xl2 overflow-hidden">
          {[
            ['Sicher', u.sicher, 'text-laub'],
            ['Unsicher', u.unsicher, 'text-[#B8860B]'],
            ['Noch nicht', u.offen, 'text-muted'],
          ].map(([label, wert, farbe], i) => (
            <div key={label as string} className={`p-3 ${i ? 'border-l border-line' : ''}`}>
              <dd className={`text-[26px] font-semibold tabular-nums ${farbe}`}>{wert as number}</dd>
              <dt className="text-[13px] text-muted">{label as string}</dt>
            </div>
          ))}
        </dl>
        <p className="text-[13px] text-muted mt-2">
          von {u.gesamt} Prüfungsarten. Der Fortschritt bleibt auf diesem Gerät.
        </p>
      </section>

      {probleme.length > 0 && (
        <section className="px-4 py-5 border-t border-line">
          <h2 className="text-[15px] font-semibold mb-3">Deine Problemgruppen</h2>
          <ul className="space-y-2">
            {probleme.map(p => (
              <li key={p.a + p.b} className="border border-line rounded-xl2 px-3 py-2.5">
                <span className="binom text-[15px]">{byId(p.a)?.name}</span>
                <span className="text-muted mx-2">↔</span>
                <span className="binom text-[15px]">{byId(p.b)?.name}</span>
                <span className="text-[13px] text-signal ml-2">{p.n}×</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-4 py-5 border-t border-line">
        <h2 className="text-[15px] font-semibold mb-3">Datenbestand</h2>
        <p className="text-[15px] leading-relaxed">
          {stats.total} Taxa aus den Studienblättern, der Vorlesungsliste und dem
          Parkführer. Davon {stats.exam} prüfungsrelevant, {stats.park} im
          Türkenschanzpark-Führer belegt.
        </p>
        <Link to="/arten" className="inline-flex items-center h-12 mt-3 px-4 border border-ink rounded-xl2 text-[15px] font-medium">
          Arten durchsehen
        </Link>
      </section>
    </div>
  )
}

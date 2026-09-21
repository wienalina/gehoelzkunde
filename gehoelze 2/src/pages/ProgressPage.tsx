import { SPECIES, byId } from '../data'
import { uebersicht, problemgruppen, alleStaende, zuruecksetzen } from '../lib/progress'

export default function ProgressPage() {
  const pool = SPECIES.filter(s => s.exam && s.dataState !== 'ohne_quelle')
  const u = uebersicht(pool.map(s => s.id))
  const probleme = problemgruppen()
  const staende = alleStaende()
  const schwierig = Object.entries(staende)
    .filter(([, a]) => a.falsch > 0)
    .sort((a, b) => b[1].falsch - a[1].falsch)
    .slice(0, 12)

  return (
    <div className="pb-24 px-4 pt-5">
      <h1 className="text-[24px] font-semibold">Fortschritt</h1>

      <dl className="grid grid-cols-3 border border-line rounded-xl2 overflow-hidden mt-4">
        {[['Sicher', u.sicher], ['Unsicher', u.unsicher], ['Noch nicht', u.offen]].map(([l, w], i) => (
          <div key={l as string} className={`p-3 ${i ? 'border-l border-line' : ''}`}>
            <dd className="text-[26px] font-semibold tabular-nums">{w as number}</dd>
            <dt className="text-[13px] text-muted">{l as string}</dt>
          </div>
        ))}
      </dl>

      <h2 className="text-[15px] font-semibold mt-7 mb-2">Problemgruppen</h2>
      {probleme.length === 0
        ? <p className="text-[15px] text-muted">Noch keine Verwechslungen aufgezeichnet.</p>
        : <ul className="space-y-2">
            {probleme.map(p => (
              <li key={p.a + p.b} className="border border-line rounded-xl2 px-3 py-2.5 text-[15px]">
                <span className="binom">{byId(p.a)?.name}</span>
                <span className="text-muted mx-2">↔</span>
                <span className="binom">{byId(p.b)?.name}</span>
                <span className="text-signal ml-2 text-[13px]">{p.n}×</span>
              </li>
            ))}
          </ul>}

      <h2 className="text-[15px] font-semibold mt-7 mb-2">Häufig falsch</h2>
      {schwierig.length === 0
        ? <p className="text-[15px] text-muted">Noch nichts falsch beantwortet.</p>
        : <ul className="space-y-1">
            {schwierig.map(([id, a]) => (
              <li key={id} className="flex justify-between text-[15px] py-1">
                <span className="binom">{byId(id)?.name ?? id}</span>
                <span className="text-muted tabular-nums">{a.richtig}/{a.richtig + a.falsch}</span>
              </li>
            ))}
          </ul>}

      <button
        onClick={() => { if (confirm('Allen Lernfortschritt auf diesem Gerät löschen?')) { zuruecksetzen(); location.reload() } }}
        className="w-full h-12 mt-8 border border-signal text-signal rounded-xl2 text-[15px] font-medium">
        Fortschritt löschen
      </button>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SPECIES } from '../data'
import type { Species } from '../types/species'
import { antwort, verwechselt, faellig } from '../lib/progress'

/** Modus 2 aus dem Konzept: Familie → Gattung → Art. Läuft ohne Bilder. */
function frageBauen(pool: Species[]) {
  const ziel = pool[Math.floor(Math.random() * pool.length)]
  const falsche = pool
    .filter(s => s.id !== ziel.id && s.genus === ziel.genus)
    .concat(pool.filter(s => s.id !== ziel.id && s.family === ziel.family))
    .filter((s, i, a) => a.findIndex(x => x.id === s.id) === i)
    .slice(0, 8)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  const optionen = [ziel, ...falsche].sort(() => Math.random() - 0.5)
  return { ziel, optionen }
}

export default function QuizPage() {
  const pool = useMemo(
    () => SPECIES.filter(s => s.exam && s.de && s.dataState !== 'ohne_quelle'),
    [])
  const dran = useMemo(() => {
    const f = faellig(pool.map(s => s.id))
    const set = new Set(f)
    const bevorzugt = pool.filter(s => set.has(s.id))
    return bevorzugt.length >= 8 ? bevorzugt : pool
  }, [pool])

  const [runde, setRunde] = useState(() => frageBauen(dran))
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)
  const [punkte, setPunkte] = useState({ richtig: 0, gesamt: 0 })

  if (pool.length < 4) return <p className="p-4">Zu wenige Arten mit deutschem Namen für einen Test.</p>

  function waehlen(id: string) {
    if (gewaehlt) return
    setGewaehlt(id)
    const ok = id === runde.ziel.id
    antwort(runde.ziel.id, ok)
    if (!ok) verwechselt(runde.ziel.id, id)
    setPunkte(p => ({ richtig: p.richtig + (ok ? 1 : 0), gesamt: p.gesamt + 1 }))
  }

  return (
    <div className="pb-24 px-4 pt-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-[24px] font-semibold">Prüfung</h1>
        <p className="text-[14px] text-muted tabular-nums">{punkte.richtig}/{punkte.gesamt}</p>
      </div>
      <p className="text-[14px] text-muted mt-1">Deutscher Name → lateinischer Name</p>

      <p className="text-[22px] font-semibold mt-6 mb-4">{runde.ziel.de}</p>

      <ul className="space-y-2">
        {runde.optionen.map(o => {
          const istZiel = o.id === runde.ziel.id
          const gewaehltFalsch = gewaehlt === o.id && !istZiel
          const zeigen = gewaehlt !== null
          return (
            <li key={o.id}>
              <button
                onClick={() => waehlen(o.id)}
                disabled={zeigen}
                className={`w-full text-left min-h-[60px] px-4 py-3 rounded-xl2 border text-[17px] binom
                  ${zeigen && istZiel ? 'border-laub bg-laub/10' : ''}
                  ${gewaehltFalsch ? 'border-signal bg-signal/10' : ''}
                  ${!zeigen ? 'border-line active:bg-mist' : ''}
                  ${zeigen && !istZiel && !gewaehltFalsch ? 'border-line opacity-50' : ''}`}
              >
                {o.name}
              </button>
            </li>
          )
        })}
      </ul>

      {gewaehlt && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[15px]">
            Richtig ist <Link to={`/art/${runde.ziel.id}`} className="binom underline">{runde.ziel.name}</Link>
            {' · '}{runde.ziel.family}
          </p>
          <button
            onClick={() => { setRunde(frageBauen(dran)); setGewaehlt(null) }}
            className="w-full h-14 mt-3 rounded-xl2 bg-ink text-paper text-[16px] font-medium">
            Weiter
          </button>
        </div>
      )}
    </div>
  )
}

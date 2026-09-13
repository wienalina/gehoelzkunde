import { useState } from 'react'
import { MERKMALE, FREILAND_FELDER, type Merkmale } from '../types/species'

const QUELLE: Record<string, string> = {
  skript: 'Studienblätter',
  zusammenfassung: 'Zusammenfassung 2021S',
  vorlesungsliste: 'Vorlesungsliste',
  parkfuehrer: 'Parkführer',
}

/**
 * Zeigt zuerst die Merkmale, die man draußen am Baum sieht.
 * Standort, Ansprüche und Verwendung liegen darunter – sie helfen beim
 * Bestimmen nicht weiter.
 */
export default function Merkmalsliste({ m }: { m: Merkmale }) {
  const [alle, setAlle] = useState(false)
  const sichtbar = MERKMALE.filter(
    f => m[f.key] && (alle || FREILAND_FELDER.includes(f.key)),
  )
  const rest = MERKMALE.filter(f => m[f.key] && !FREILAND_FELDER.includes(f.key)).length

  if (sichtbar.length === 0 && rest === 0) return null

  return (
    <>
      <dl className="divide-y divide-line border-y border-line">
        {sichtbar.map(f => {
          const feld = m[f.key]!
          return (
            <div key={f.key} className="px-4 py-3">
              <dt className="text-[13px] text-muted">
                {f.label}
                {feld.seite && <span className="text-line"> · S. {feld.seite}</span>}
              </dt>
              <dd className="text-[15px] leading-relaxed mt-0.5">{feld.text}</dd>
            </div>
          )
        })}
      </dl>
      {rest > 0 && (
        <button onClick={() => setAlle(!alle)}
                className="w-full tap justify-center text-[15px] font-medium border-b border-line">
          {alle ? 'Nur Freilandmerkmale' : `Standort, Ansprüche, Verwendung (${rest})`}
        </button>
      )}
    </>
  )
}

export function Quellenzeile({ quelle, seite }: { quelle: string; seite?: number }) {
  return (
    <p className="text-[12px] text-muted">
      {QUELLE[quelle] ?? quelle}{seite ? `, Seite ${seite}` : ''}
    </p>
  )
}

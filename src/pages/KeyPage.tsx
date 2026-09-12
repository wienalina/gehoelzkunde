import { Link, useSearchParams } from 'react-router-dom'

/**
 * Phase 6. Der Schlüssel wird aus den Merkmalen der Phase 4 aufgebaut –
 * hier steht bewusst nur, was aus den Quellen bereits belegt ist.
 */
export default function KeyPage() {
  const [params] = useSearchParams()
  const start = params.get('start')

  return (
    <div className="pb-24 px-4 pt-5">
      <h1 className="text-[24px] font-semibold leading-tight">Bestimmungsschlüssel</h1>
      <p className="text-[15px] text-muted mt-1">
        Wird in Phase 6 gebaut, sobald die Merkmale seitengenau aus dem Skript stehen.
      </p>

      {start && (
        <p className="text-[15px] mt-4 border border-line rounded-xl2 p-3">
          Du bist über <strong>{start === 'nadel' ? 'Nadeln' : 'Blätter'}</strong> eingestiegen.
          Dieser Einstieg wird später der erste Knoten des Schlüssels.
        </p>
      )}

      <h2 className="text-[15px] font-semibold mt-6 mb-2">Schon belegt: Tanne oder Fichte</h2>
      <p className="text-[14px] text-muted mb-3">
        Wörtlich aus der Zusammenfassung 2021S – der wichtigste Knoten überhaupt.
      </p>
      <div className="grid gap-3">
        {[
          { g: 'Fichte (Picea)', farbe: 'border-nadel', p: [
            'Nadeln spitz, können stechen',
            'Nadeln rundum am Zweig',
            'Beim Abreißen bleibt ein weißes Fähnchen',
            'Zapfen hängen nach unten und liegen am Boden',
          ]},
          { g: 'Tanne (Abies)', farbe: 'border-laub', p: [
            'Nadeln flach und vorne abgerundet',
            'Zweireihig gescheitelt, links und rechts des Zweiges',
            'Beim Abziehen bleibt ein Teller',
            'Zapfen stehen aufrecht, fallen Schuppe für Schuppe ab',
          ]},
        ].map(k => (
          <div key={k.g} className={`border-l-4 ${k.farbe} border-y border-r border-line rounded-r-xl2 p-3`}>
            <h3 className="text-[16px] font-semibold">{k.g}</h3>
            <ul className="mt-1.5 space-y-1 text-[15px] list-disc pl-5">
              {k.p.map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <Link to="/arten" className="inline-flex items-center h-12 mt-6 px-4 border border-ink rounded-xl2 text-[15px] font-medium">
        Solange in der Artenliste suchen
      </Link>
    </div>
  )
}

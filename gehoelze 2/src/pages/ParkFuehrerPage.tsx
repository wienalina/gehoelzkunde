import { useMemo, useState } from 'react'
import { SPECIES } from '../data'
import SpeciesRow from '../components/SpeciesRow'
import { Link } from 'react-router-dom'

/** Die 16 Kartenblätter des Führers – Seitenzahlen und Bereiche wie gedruckt. */
const BLAETTER = [
  [1, 4, 'Abies – Cedrus'], [2, 5, 'Pinus – Cryptomeria'], [3, 7, 'Cupressus – Ginkgo'],
  [4, 8, 'Winter- und Frühjahrsblüher'], [5, 9, 'Liriodendron – Platanus'],
  [6, 11, 'Betula – Pterocarya'], [7, 12, 'Ulmus – Hydrangea'],
  [8, 14, 'Rosaceae: Prunoideae, Maloideae'], [9, 16, 'Rosaceae: Rosoideae, Spiraeoideae'],
  [10, 17, 'Cercis – Wisteria'], [11, 19, 'Hippophae – Aesculus'], [12, 20, 'Staphylea – Ilex'],
  [13, 21, 'Euonymus – Salix'], [14, 23, 'Hibiscus – Kolkwitzia'], [15, 24, 'Lonicera – Jasminum'],
  [16, 25, 'Buddleja – Thymus'],
] as const

export default function ParkFuehrerPage() {
  const [nurPruefung, setNurPruefung] = useState(true)
  const arten = useMemo(
    () => SPECIES.filter(s => s.inPark && (!nurPruefung || s.exam))
                 .sort((a, b) => a.name.localeCompare(b.name, 'de')),
    [nurPruefung])

  return (
    <div className="pb-24">
      <header className="px-4 pt-5 pb-4">
        <Link to="/park" className="text-[14px] underline">← zur Gehölzkarte</Link>
        <h1 className="text-[24px] font-semibold leading-tight mt-2">Arten im Parkführer</h1>
        <p className="text-[15px] text-muted mt-1">
          Gehölze aus dem Lehrveranstaltungsführer. Der Führer ist eine
          Auswahl, kein vollständiger Bestandsplan.
        </p>
      </header>


      <section className="px-4 py-5">
        <h2 className="text-[15px] font-semibold mb-2">Kartenblätter im Führer</h2>
        <ol className="border border-line rounded-xl2 divide-y divide-line">
          {BLAETTER.map(([nr, seite, titel]) => (
            <li key={nr} className="flex gap-3 px-3 py-2.5 text-[15px]">
              <span className="text-muted tabular-nums w-5">{nr}</span>
              <span className="flex-1">{titel}</span>
              <span className="text-muted text-[13px]">S.&nbsp;{seite}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="px-4 pb-3 flex items-center justify-between border-t border-line pt-4">
        <h2 className="text-[15px] font-semibold">Arten im Führer ({arten.length})</h2>
        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={nurPruefung} className="w-5 h-5 accent-ink"
                 onChange={e => setNurPruefung(e.target.checked)} />
          nur Prüfungsarten
        </label>
      </div>
      <ul>{arten.map(s => <SpeciesRow key={s.id} s={s} />)}</ul>
    </div>
  )
}

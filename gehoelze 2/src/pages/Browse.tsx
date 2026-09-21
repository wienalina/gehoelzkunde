import { useMemo, useState } from 'react'
import { SPECIES } from '../data'
import SpeciesRow from '../components/SpeciesRow'
import FilterSheet from '../components/FilterSheet'
import { anwenden, anzahlAktiv, START_FILTER, type Filter } from '../lib/filter'

export default function Browse() {
  const [filter, setFilter] = useState<Filter>(START_FILTER)
  const [offen, setOffen] = useState(false)

  const treffer = useMemo(() => anwenden(SPECIES, filter), [filter])
  const gruppiert = useMemo(() => {
    const m = new Map<string, typeof treffer>()
    for (const s of treffer) {
      const k = `${s.family} · ${s.genus}`
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(s)
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'))
  }, [treffer])

  const aktiv = anzahlAktiv(filter)

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-paper border-b border-line px-4 py-2.5 flex gap-2">
        <input
          value={filter.suche}
          onChange={e => setFilter({ ...filter, suche: e.target.value })}
          placeholder="Name, Familie, Gattung"
          type="search"
          className="flex-1 h-12 px-3 border border-line rounded-xl2 text-[16px] bg-paper"
          aria-label="Arten durchsuchen"
        />
        <button onClick={() => setOffen(true)}
                className="h-12 px-4 border border-ink rounded-xl2 text-[15px] font-medium whitespace-nowrap">
          Filter{aktiv ? ` (${aktiv})` : ''}
        </button>
      </div>

      <p className="px-4 py-2 text-[13px] text-muted">{treffer.length} Arten</p>

      {treffer.length === 0 ? (
        <p className="px-4 py-10 text-[15px]">
          Keine Art passt zu diesen Filtern. Setze den Umfang auf „+ Skript“ oder lösche die Suche.
        </p>
      ) : (
        gruppiert.map(([kopf, arten]) => (
          <section key={kopf}>
            <h2 className="px-4 py-1.5 bg-mist text-[13px] font-medium border-y border-line sticky top-[68px] z-20">
              {kopf}
            </h2>
            <ul>{arten.map(s => <SpeciesRow key={s.id} s={s} />)}</ul>
          </section>
        ))
      )}

      <FilterSheet offen={offen} filter={filter} setFilter={setFilter}
                   schliessen={() => setOffen(false)} treffer={treffer.length} />
    </div>
  )
}

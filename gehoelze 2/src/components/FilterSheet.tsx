import { FAMILIES, GENERA } from '../data'
import { START_FILTER, type Filter, type Umfang } from '../lib/filter'

type Props = {
  offen: boolean
  filter: Filter
  setFilter: (f: Filter) => void
  schliessen: () => void
  treffer: number
}

const umfaenge: { v: Umfang; label: string; hint: string }[] = [
  { v: 'pruefung',  label: 'Prüfungsarten', hint: 'deine Masterliste' },
  { v: 'vorlesung', label: '+ Vorlesung',   hint: 'alles aus der Lernliste' },
  { v: 'alle',      label: '+ Skript',      hint: 'jede Art aus den Studienblättern' },
]

export default function FilterSheet({ offen, filter, setFilter, schliessen, treffer }: Props) {
  if (!offen) return null
  const set = (p: Partial<Filter>) => setFilter({ ...filter, ...p })

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-ink/40" onClick={schliessen}>
      <div
        className="bg-paper max-h-[86vh] overflow-y-auto rounded-t-[18px] border-t border-line"
        onClick={e => e.stopPropagation()}
        role="dialog" aria-label="Filter"
      >
        <div className="sticky top-0 bg-paper border-b border-line px-4 py-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold">Filter</h2>
          <button onClick={schliessen} className="text-[15px] font-medium px-3 py-2 -mr-3">
            {treffer} anzeigen
          </button>
        </div>

        <div className="px-4 py-4 space-y-6 pb-10">
          <fieldset>
            <legend className="text-[13px] text-muted mb-2">Umfang</legend>
            <div className="space-y-2">
              {umfaenge.map(u => (
                <label key={u.v} className="tap gap-3 border border-line px-3 rounded-xl2">
                  <input type="radio" name="umfang" checked={filter.umfang === u.v}
                         onChange={() => set({ umfang: u.v })} className="w-5 h-5 accent-ink" />
                  <span>
                    <span className="block text-[15px] font-medium">{u.label}</span>
                    <span className="block text-[13px] text-muted">{u.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[13px] text-muted mb-2">Gruppe</legend>
            <div className="grid grid-cols-3 gap-2">
              {(['alle', 'nadel', 'laub'] as const).map(g => (
                <button key={g} onClick={() => set({ gruppe: g })}
                  className={`h-12 rounded-xl2 border text-[15px] font-medium
                    ${filter.gruppe === g ? 'border-ink bg-mist' : 'border-line'}`}>
                  {g === 'alle' ? 'Alle' : g === 'nadel' ? 'Nadel' : 'Laub'}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3">
            <label className="block">
              <span className="block text-[13px] text-muted mb-1">Familie</span>
              <select value={filter.familie} onChange={e => set({ familie: e.target.value, gattung: '' })}
                      className="w-full h-12 border border-line rounded-xl2 px-3 text-[15px] bg-paper">
                <option value="">alle Familien</option>
                {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-[13px] text-muted mb-1">Gattung</span>
              <select value={filter.gattung} onChange={e => set({ gattung: e.target.value })}
                      className="w-full h-12 border border-line rounded-xl2 px-3 text-[15px] bg-paper">
                <option value="">alle Gattungen</option>
                {GENERA.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
          </div>

          <fieldset className="space-y-1">
            <legend className="text-[13px] text-muted mb-1">Weitere</legend>
            {([
              ['nurPark', 'Nur Arten im Türkenschanzpark-Führer'],
              ['nurHeimisch', 'Nur heimische Arten'],
              ['ohneQuelleAusblenden', 'Arten ohne Quelle ausblenden'],
              ['nurZuPruefen', 'Nur Namen, die noch zu prüfen sind'],
            ] as const).map(([k, label]) => (
              <label key={k} className="tap gap-3">
                <input type="checkbox" checked={filter[k]} className="w-5 h-5 accent-ink"
                       onChange={e => set({ [k]: e.target.checked } as Partial<Filter>)} />
                <span className="text-[15px]">{label}</span>
              </label>
            ))}
          </fieldset>

          <button onClick={() => setFilter(START_FILTER)}
                  className="w-full h-12 border border-line rounded-xl2 text-[15px] font-medium">
            Filter zurücksetzen
          </button>
        </div>
      </div>
    </div>
  )
}

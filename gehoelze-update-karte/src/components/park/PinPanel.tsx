import { Link } from 'react-router-dom'
import { byId } from '../../data'
import type { PlantMapPin } from '../../lib/kartenpins'
import Merkmalsliste, { Quellenzeile } from '../Merkmalsliste'
import { Hauptbild, Bildraster } from '../ImageGrid'

type Props = {
  pin: PlantMapPin
  weitereStandorte: number
  schliessen: () => void
  bearbeiten: () => void
  verschieben: () => void
  loeschen: () => void
}

/** Zeigt zu einem Pin, was die Gehölz-Datenbank über die Art weiß – nicht mehr. */
export default function PinPanel({ pin, weitereStandorte, schliessen, bearbeiten, verschieben, loeschen }: Props) {
  const s = byId(pin.speciesId)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <header className="px-4 pt-3 pb-3 border-b border-line flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {s ? (
            <>
              <p className="text-[13px] text-muted truncate">
                {s.family}<span className="text-line"> › </span>{s.genus}
              </p>
              <h2 className="binom text-[22px] leading-tight">{s.name}</h2>
              {s.de && <p className="text-[16px]">{s.de}</p>}
            </>
          ) : (
            <h2 className="text-[17px] font-semibold">Art nicht mehr im Katalog</h2>
          )}
        </div>
        <button onClick={schliessen} aria-label="Schließen"
                className="w-11 h-11 -mr-2 -mt-1 grid place-items-center text-[22px] text-muted shrink-0">×</button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {pin.note && (
          <section className="px-4 py-3 bg-mist border-b border-line">
            <h3 className="text-[13px] text-muted">Deine Standortnotiz</h3>
            <p className="text-[15px] leading-relaxed">{pin.note}</p>
          </section>
        )}

        {!s && (
          <p className="px-4 py-4 text-[15px]">
            Die Art mit der ID <code>{pin.speciesId}</code> gibt es im Katalog nicht (mehr).
            Du kannst den Pin einer anderen Art zuordnen oder löschen.
          </p>
        )}

        {s && (
          <>
            <section className="px-4 py-3 border-b border-line">
              <h3 className="text-[15px] font-semibold mb-1.5">Entscheidendes Merkmal</h3>
              {s.entscheidend?.length ? (
                <ul className="space-y-1.5">
                  {s.entscheidend.map((f, i) => (
                    <li key={i} className="text-[15px] leading-relaxed border-l-2 border-signal pl-3">{f.text}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-muted">
                  Das Skript hebt für diese Art kein einzelnes Merkmal hervor.
                </p>
              )}
            </section>

            {s.freiland && (
              <section className="px-4 py-3 border-b border-line">
                <h3 className="text-[15px] font-semibold mb-1">Woran du sie draußen erkennst</h3>
                <p className="text-[15px] leading-relaxed">{s.freiland.text}</p>
                <div className="mt-1.5"><Quellenzeile quelle={s.freiland.quelle} seite={s.freiland.seite} /></div>
              </section>
            )}

            <section className="px-4 pt-3 pb-1">
              <h3 className="text-[15px] font-semibold">Bestimmungsmerkmale</h3>
              {!s.merkmale && (
                <p className="text-[14px] text-muted mt-1 pb-2">
                  Nicht in den bereitgestellten Unterlagen gefunden.
                </p>
              )}
            </section>
            {s.merkmale && <Merkmalsliste m={s.merkmale} />}

            <section className="pt-3">
              <h3 className="px-4 text-[15px] font-semibold mb-2">Bilder</h3>
              <Hauptbild id={s.id} />
              <div className="mt-px"><Bildraster id={s.id} /></div>
            </section>

            {weitereStandorte > 0 && (
              <p className="px-4 py-3 text-[14px] text-muted">
                Du hast diese Art noch an {weitereStandorte} weiteren Stelle{weitereStandorte > 1 ? 'n' : ''} eingetragen.
              </p>
            )}
          </>
        )}
      </div>

      <footer className="border-t border-line px-4 pt-3 grid grid-cols-2 gap-2 bg-paper"
              style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        {s && (
          <>
            <Link to={`/art/${s.id}`}
                  className="h-12 grid place-items-center rounded-xl2 bg-ink text-paper text-[15px] font-medium">
              Steckbrief öffnen
            </Link>
            <Link to={`/pruefung?art=${s.id}`}
                  className="h-12 grid place-items-center rounded-xl2 border border-ink text-[15px] font-medium">
              Gehölz lernen
            </Link>
          </>
        )}
        <button onClick={bearbeiten} className="h-11 rounded-xl2 border border-line text-[14px] font-medium">
          Pin bearbeiten
        </button>
        <button onClick={verschieben} className="h-11 rounded-xl2 border border-line text-[14px] font-medium">
          Pin verschieben
        </button>
        <button onClick={loeschen}
                className="col-span-2 h-11 rounded-xl2 border border-signal text-signal text-[14px] font-medium">
          Pin löschen
        </button>
      </footer>
    </div>
  )
}

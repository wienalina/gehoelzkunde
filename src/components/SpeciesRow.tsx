import { Link } from 'react-router-dom'
import type { Species } from '../types/species'

const punkt: Record<Species['dataState'], string> = {
  vollstaendig: 'bg-laub',
  teilweise:    'bg-[#C9A227]',
  duenn:        'bg-[#D98324]',
  ohne_quelle:  'bg-signal',
}

export default function SpeciesRow({ s }: { s: Species }) {
  return (
    <li>
      <Link to={`/art/${s.id}`} className="tap gap-3 px-4 border-b border-line active:bg-mist">
        {/* Farbschiene links: Nadel oder Laub – draußen auf einen Blick */}
        <span
          aria-hidden
          className={`w-1.5 self-stretch -my-px ${s.group === 'nadel' ? 'bg-nadel' : 'bg-laub'}`}
        />
        <span className="flex-1 min-w-0 py-2">
          <span className="block truncate">
            <span className="binom text-[17px]">{s.name}</span>
            {s.native && <span className="text-laub ml-1.5" title="heimisch">★</span>}
            {s.checkName && <span className="text-signal ml-1.5" title="Name noch zu prüfen">⚠</span>}
          </span>
          <span className="block truncate text-[13px] text-muted">
            {s.de || s.family}
            {s.de && <span className="text-line"> · </span>}
            {s.de && s.family}
          </span>
        </span>
        <span className={`w-2 h-2 rounded-full ${punkt[s.dataState]}`}
              title={`Datenlage: ${s.dataState}`} />
      </Link>
    </li>
  )
}

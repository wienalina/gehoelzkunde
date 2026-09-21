import { useEffect, useState } from 'react'
import { BILDTYPEN, type BildTyp } from '../types/species'
import { bildPfad, bildVorhanden } from '../lib/images'

export function Hauptbild({ id }: { id: string }) {
  const src = bildPfad(id, 'habitus')
  const [da, setDa] = useState<boolean | null>(null)
  useEffect(() => { bildVorhanden(src).then(setDa) }, [src])

  if (da) return <img src={src} alt="" className="w-full aspect-[4/3] object-cover" />
  return (
    <div className="w-full aspect-[4/3] bg-mist border-y border-line grid place-items-center text-center px-6">
      <p className="text-[14px] text-muted">
        Noch kein Hauptbild.<br />
        Lege <code className="text-ink">habitus.jpg</code> in<br />
        <code className="text-ink break-all">images/species/{id}/</code>
      </p>
    </div>
  )
}

export function Bildraster({ id }: { id: string }) {
  const [vorhanden, setVorhanden] = useState<Record<string, boolean>>({})
  useEffect(() => {
    let ab = false
    Promise.all(BILDTYPEN.map(async t => [t.key, await bildVorhanden(bildPfad(id, t.key))] as const))
      .then(p => { if (!ab) setVorhanden(Object.fromEntries(p)) })
    return () => { ab = true }
  }, [id])

  return (
    <ul className="grid grid-cols-3 gap-px bg-line border-y border-line">
      {BILDTYPEN.map(t => (
        <li key={t.key} className="bg-paper">
          {vorhanden[t.key]
            ? <img src={bildPfad(id, t.key as BildTyp)} alt={t.label}
                   className="w-full aspect-square object-cover" />
            : <div className="w-full aspect-square bg-mist grid place-items-center">
                <span className="text-[12px] text-muted text-center leading-tight px-1">
                  {t.label}<br /><span className="text-line">kein Bild</span>
                </span>
              </div>}
        </li>
      ))}
    </ul>
  )
}

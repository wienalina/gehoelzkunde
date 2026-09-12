import { NavLink } from 'react-router-dom'

const punkte = [
  { to: '/',        label: 'Start',    d: 'M3 11.5 12 4l9 7.5M6 10v10h12V10' },
  { to: '/arten',   label: 'Arten',    d: 'M4 6h16M4 12h16M4 18h10' },
  { to: '/schluessel', label: 'Schlüssel', d: 'M12 3v8m0 0-4 4m4-4 4 4M6 21h12' },
  { to: '/pruefung', label: 'Prüfung', d: 'M5 4h14v16l-7-4-7 4z' },
  { to: '/park',    label: 'Park',     d: 'M12 3 5 20h14L12 3zm0 17v2' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-line bg-paper"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Hauptbereiche"
    >
      <ul className="grid grid-cols-5">
        {punkte.map(p => (
          <li key={p.to}>
            <NavLink
              to={p.to}
              end={p.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium
                 ${isActive ? 'text-ink' : 'text-muted'}`
              }
            >
              {({ isActive }) => (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden
                       stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.6}
                       strokeLinecap="round" strokeLinejoin="round">
                    <path d={p.d} />
                  </svg>
                  {p.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

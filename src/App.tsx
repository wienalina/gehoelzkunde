import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Browse from './pages/Browse'
import SpeciesDetail from './pages/SpeciesDetail'
import KeyPage from './pages/KeyPage'
import QuizPage from './pages/QuizPage'
import ProgressPage from './pages/ProgressPage'
import ParkPage from './pages/ParkPage'
import ParkFuehrerPage from './pages/ParkFuehrerPage'

function NachOben() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const tief = pathname.startsWith('/art/')
  // Die Karte bekommt die volle Breite, alles andere bleibt lesefreundlich schmal
  const breit = pathname === '/park'

  return (
    <div className={breit ? 'min-h-full' : 'mx-auto max-w-[720px] min-h-full'}>
      <NachOben />
      {tief && (
        <div className="sticky top-0 z-30 bg-paper border-b border-line">
          <Link to="/arten" className="tap px-4 text-[15px] font-medium">← Arten</Link>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arten" element={<Browse />} />
        <Route path="/art/:id" element={<SpeciesDetail />} />
        <Route path="/schluessel" element={<KeyPage />} />
        <Route path="/pruefung" element={<QuizPage />} />
        <Route path="/fortschritt" element={<ProgressPage />} />
        <Route path="/park" element={<ParkPage />} />
        <Route path="/park/fuehrer" element={<ParkFuehrerPage />} />
        <Route path="*" element={<p className="p-4">Diese Seite gibt es nicht.</p>} />
      </Routes>
      <BottomNav />
    </div>
  )
}

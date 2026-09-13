import type { Species } from '../types/species'

/**
 * Beobachtungen, die man im Freiland ohne Hilfsmittel treffen kann.
 * Jede sucht in den Merkmalstexten, die aus den Studienblättern und der
 * Zusammenfassung übernommen wurden – es wird nichts dazuerfunden.
 */
export type Beobachtung = {
  id: string
  frage: string
  gruppe: 'nadel' | 'laub' | 'beide'
  muster: RegExp
}

export type Block = { titel: string; gruppe: 'nadel' | 'laub' | 'beide'; punkte: Beobachtung[] }

const b = (id: string, frage: string, gruppe: Beobachtung['gruppe'], muster: RegExp): Beobachtung =>
  ({ id, frage, gruppe, muster })

export const BLOECKE: Block[] = [
  {
    titel: 'Wie sitzen die Nadeln?',
    gruppe: 'nadel',
    punkte: [
      b('n-zwei',    'Zu zweit in einer Scheide', 'nadel', /\b2\s*(Na\b|Nadeln?)/i),
      b('n-fuenf',   'Zu fünft in einer Scheide', 'nadel', /\b5\s*(Na\b|Nadeln?)/i),
      b('n-buschel', 'In Büscheln an Kurztrieben', 'nadel', /kurztrieb|büschel/i),
      b('n-schuppen','Schuppenblätter statt Nadeln', 'nadel', /schuppen(blatt|förmig|artig)|schuppenblätt/i),
      b('n-stechend','Nadeln stechen', 'nadel', /stechend|scharf\s*spitz|spitzig/i),
      b('n-streifen','Weiße Streifen auf der Nadelunterseite', 'nadel',
        /spaltöffnungsstreifen|spaltöffnungsbänd|silberweiß|weiße\s*streifen/i),
      b('n-abfall',  'Nadeln fallen im Winter ab', 'nadel', /sommergrün/i),
    ],
  },
  {
    titel: 'Wie sitzen die Zapfen?',
    gruppe: 'nadel',
    punkte: [
      b('z-aufrecht', 'Zapfen stehen aufrecht', 'nadel', /aufrechte?\s*zapfen|zapfen[^.;]{0,25}aufrecht/i),
      b('z-haengend', 'Zapfen hängen nach unten', 'nadel', /zapfen[^.;]{0,25}häng|hängende\s*zapfen/i),
    ],
  },
  {
    titel: 'Wie stehen die Blätter?',
    gruppe: 'laub',
    punkte: [
      b('l-gegen', 'Gegenständig, paarweise gegenüber', 'laub', /gegenständig|gegenstdg/i),
      b('l-wechsel','Wechselständig, versetzt', 'laub', /wechselständig|wechselstdg/i),
    ],
  },
  {
    titel: 'Wie ist das Blatt gebaut?',
    gruppe: 'laub',
    punkte: [
      b('l-gefiedert', 'Gefiedert, aus vielen Blättchen', 'laub', /gefiedert|fiederblatt|fiederblätt/i),
      b('l-gefingert', 'Gefingert, Blättchen aus einem Punkt', 'laub', /gefingert|handförmig|handnervig/i),
      b('l-gelappt',   'Gelappt, tief eingebuchtet', 'laub', /gelappt|lappig/i),
      b('l-herz',      'Herzförmig', 'laub', /herzförmig/i),
    ],
  },
  {
    titel: 'Wie ist der Blattrand?',
    gruppe: 'laub',
    punkte: [
      b('r-ganz',   'Glatt, ohne Zähne', 'laub', /ganzrandig/i),
      b('r-gesaegt','Gesägt oder gezähnt', 'laub', /gesägt|gezähnt|kerbig/i),
      b('r-doppelt','Doppelt gesägt', 'laub', /doppelt\s*ges(ä|a)gt/i),
    ],
  },
  {
    titel: 'Was fällt sonst auf?',
    gruppe: 'beide',
    punkte: [
      b('s-immergruen', 'Immergrün', 'beide', /immergrün/i),
      b('s-dornen',     'Dornen, Stacheln oder stachelige Früchte', 'beide', /dorn|stachel/i),
      b('s-kletternd',  'Kletternd oder windend', 'beide', /kletternd|windend|liane|rankend/i),
      b('s-strauch',    'Strauch, nicht Baum', 'beide', /strauch/i),
      b('s-usfilzig',   'Blattunterseite filzig oder behaart', 'laub', /US[^.;]{0,25}(filzig|behaart)|unterseite[^.;]{0,25}(filzig|behaart)/i),
      b('s-ledrig',     'Blatt ledrig und glänzend', 'beide', /ledrig|lederartig/i),
    ],
  },
  {
    titel: 'Welche Frucht siehst du?',
    gruppe: 'beide',
    punkte: [
      b('f-zapfen', 'Zapfen', 'beide', /zapfen/i),
      b('f-beere',  'Beere', 'beide', /beere/i),
      b('f-kapsel', 'Kapsel', 'beide', /kapsel/i),
      b('f-nuss',   'Nuss oder Nüsschen', 'beide', /nuss|nüsschen/i),
      b('f-huelse', 'Hülse', 'beide', /hülse/i),
      b('f-fluegel','Geflügelt', 'beide', /geflügelt|flügel/i),
      b('f-stein',  'Steinfrucht', 'beide', /steinfrucht|steinkern/i),
    ],
  },
]

export const ALLE_PUNKTE = BLOECKE.flatMap(x => x.punkte)

/** Der durchsuchbare Text einer Art – nur belegte Merkmale, nichts Erfundenes. */
export function merkmalstext(s: Species): string {
  const teile: string[] = []
  for (const f of Object.values(s.merkmale ?? {})) teile.push(f.text)
  if (s.freiland) teile.push(s.freiland.text)
  // Die Gattungsbeschreibung gilt für alle Arten der Gattung. Sie kommt dazu,
  // weil das Skript Blattstellung und Fruchttyp meist nur dort nennt.
  for (const f of Object.values(s.gattungsmerkmale ?? {})) teile.push(f.text)
  return teile.join(' ')
}

export function hatText(s: Species): boolean {
  return Boolean(s.merkmale || s.freiland || s.gattungsmerkmale)
}

export function passt(s: Species, ids: string[]): boolean {
  if (ids.length === 0) return true
  const t = merkmalstext(s)
  if (!t) return false
  return ids.every(id => {
    const p = ALLE_PUNKTE.find(x => x.id === id)
    return p ? p.muster.test(t) : true
  })
}

/** Welche Beobachtung würde die Kandidatenliste am stärksten halbieren? */
export function naechsteFrage(kandidaten: Species[], schon: string[], gruppe: 'nadel' | 'laub' | null) {
  const texte = kandidaten.map(merkmalstext)
  let beste: { punkt: Beobachtung; wert: number } | null = null
  for (const p of ALLE_PUNKTE) {
    if (schon.includes(p.id)) continue
    if (gruppe && p.gruppe !== 'beide' && p.gruppe !== gruppe) continue
    const ja = texte.filter(t => p.muster.test(t)).length
    if (ja === 0 || ja === texte.length) continue
    const wert = Math.min(ja, texte.length - ja) / texte.length
    if (!beste || wert > beste.wert) beste = { punkt: p, wert }
  }
  return beste?.punkt ?? null
}

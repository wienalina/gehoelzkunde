import type { BildTyp } from '../types/species'

/**
 * Bildpfad einer Art. Die Datei muss nicht existieren – fehlt sie,
 * zeigt die Oberfläche einen Platzhalter. Nie ein fremdes Bild einsetzen.
 */
export function bildPfad(id: string, typ: BildTyp, endung = 'jpg') {
  return `${import.meta.env.BASE_URL}images/species/${id}/${typ}.${endung}`
}

/** Prüft im Hintergrund, ob eine Bilddatei wirklich da ist. */
export function bildVorhanden(src: string): Promise<boolean> {
  return new Promise(res => {
    const img = new Image()
    img.onload = () => res(true)
    img.onerror = () => res(false)
    img.src = src
  })
}

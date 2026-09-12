// Legt für jede Art einen Bildordner an: public/images/species/<id>/
// Aufruf:  npm run bilderordner
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const arten = JSON.parse(readFileSync(join(root, 'src/data/species.json'), 'utf8'))

let neu = 0
for (const a of arten) {
  const ordner = join(root, 'public/images/species', a.id)
  mkdirSync(ordner, { recursive: true })
  writeFileSync(join(ordner, '.gitkeep'), '')
  neu++
}
console.log(`${neu} Bildordner angelegt unter public/images/species/`)
console.log('Dateinamen: habitus.jpg, leaf.jpg, twig.jpg, bud.jpg, bark.jpg,')
console.log('            flower.jpg, fruit.jpg, cone.jpg, detail.jpg')

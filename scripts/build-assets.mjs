// Generates public/images from (1) Wikimedia Commons photos and (2) crops of the Figma PNG exports.
// Usage: node scripts/build-assets.mjs
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('public/images')
const SRC = path.resolve('..') // folder holding the Figma PNG exports
const UA = 'TrippyDemo/1.0 (prototype; scripts/build-assets.mjs)'

const W = (file) => `https://thumb.wikimedia.org/wikipedia/commons/thumb/${file}`

// Photos — Wikimedia Commons (licences listed in public/images/CREDITS.md)
const photos = {
  biarritz: [W('7/71/Phare_de_Biarritz_depuis_Rocher_du_Basta.jpg/1280px-Phare_de_Biarritz_depuis_Rocher_du_Basta.jpg'), 'CC BY-SA 4.0'],
  marseille: [W('c/c0/Vieux-Port_de_Marseille%2C_France.jpg/1280px-Vieux-Port_de_Marseille%2C_France.jpg'), 'CC BY-SA 4.0'],
  narbonne: [W('7/72/Mer_et_plage_-_Narbonne-Plage.JPG/1280px-Mer_et_plage_-_Narbonne-Plage.JPG'), 'CC BY-SA 3.0'],
  rijksmuseum: [W('8/80/South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg/1280px-South_facade_of_the_Rijksmuseum_Amsterdam_%28DSCF0528%29.jpg'), 'CC BY 4.0'],
  canal: [W('b/be/KeizersgrachtReguliersgrachtAmsterdam.jpg/1280px-KeizersgrachtReguliersgrachtAmsterdam.jpg'), 'CC BY-SA 3.0'],
  'paris-boat': [W('b/b9/Boat_on_the_Canal_Saint-Martin_in_2022.jpg/1280px-Boat_on_the_Canal_Saint-Martin_in_2022.jpg'), 'CC BY-SA 4.0'],
  forest: [W('0/05/For%C3%AAt_domaniale_des_Fanges_%282%29.jpg/1280px-For%C3%AAt_domaniale_des_Fanges_%282%29.jpg'), 'CC BY-SA 4.0'],
  'bali-gate': [W('a/a3/Lempuyang_4.jpg/1280px-Lempuyang_4.jpg'), 'CC0'],
  'bali-palms': [W('2/29/Bali%2C_rice_terraces_9.JPG/1280px-Bali%2C_rice_terraces_9.JPG'), 'CC BY-SA 3.0'],
  // Feed posts
  lisbon: [W('c/ce/Tram_Line_28_in_Alfama_%2850662582522%29.jpg/1280px-Tram_Line_28_in_Alfama_%2850662582522%29.jpg'), 'CC BY 2.0'],
  porto: [W('9/99/View_of_Ribeira_from_Cais_de_Gaia%2C_20250605_1628_9890.jpg/1280px-View_of_Ribeira_from_Cais_de_Gaia%2C_20250605_1628_9890.jpg'), 'CC BY 4.0'],
  prague: [W('5/59/Charles_Bridge_during_a_pink_sunrise_in_Prague.jpg/1280px-Charles_Bridge_during_a_pink_sunrise_in_Prague.jpg'), 'CC BY-SA 2.0'],
  budapest: [W('6/65/Hungarian_Parliament_Building_2023-9.jpg/1280px-Hungarian_Parliament_Building_2023-9.jpg'), 'CC0'],
  nyhavn: [W('c/ce/Kopenhagen_%28DK%29%2C_Nyhavn_--_2017_--_1711.jpg/1280px-Kopenhagen_%28DK%29%2C_Nyhavn_--_2017_--_1711.jpg'), 'CC BY-SA 4.0'],
  etretat: [W('6/6c/Aiguille_et_Porte_d%C2%B4Aval.jpg/1280px-Aiguille_et_Porte_d%C2%B4Aval.jpg'), 'CC BY-SA 4.0'],
  verdon: [W('c/c0/Gorge_du_Verdon_Goat_0254.jpg/1280px-Gorge_du_Verdon_Goat_0254.jpg'), 'CC BY-SA 3.0'],
  sevilla: [W('b/b6/Plaza_de_Espa%C3%B1a_%28Sevilla%29_-_01.jpg/1280px-Plaza_de_Espa%C3%B1a_%28Sevilla%29_-_01.jpg'), 'CC BY-SA 4.0'],
  annecy: [W('8/8f/Palais_de_l%27Isle_-_Annecy_-_France_-_panoramio.jpg/1280px-Palais_de_l%27Isle_-_Annecy_-_France_-_panoramio.jpg'), 'CC BY-SA 3.0'],
  hallstatt: [W('b/bb/Hallst%C3%A4tter_See_20180206.jpg/1280px-Hallst%C3%A4tter_See_20180206.jpg'), 'CC BY-SA 4.0'],
}

// Crops from the Figma exports: [file, left, top, width, height]
const crops = {
  // Chat list avatars (Messages-6.png, 786px wide)
  'av-daniel': ['Messages-6.png', 50, 448, 96, 96],
  'av-sarah': ['Messages-6.png', 50, 592, 96, 96],
  'av-sofia': ['Messages-6.png', 50, 736, 96, 96],
  'av-david': ['Messages-6.png', 50, 880, 96, 96],
  'av-maya': ['Messages-6.png', 50, 1024, 96, 96],
  'av-emily': ['Messages-6.png', 50, 1168, 96, 96],
  'av-oscar': ['Messages-6.png', 50, 1456, 96, 96],
  // Tourism brand logos (Messages-2.png)
  'logo-group': ['Messages-2.png', 48, 448, 96, 96],
  'logo-normandie': ['Messages-2.png', 48, 592, 96, 96],
  'logo-paris': ['Messages-2.png', 48, 736, 96, 96],
  'logo-occitanie': ['Messages-2.png', 48, 880, 96, 96],
  'logo-aude': ['Messages-2.png', 48, 1024, 96, 96],
  'logo-fun': ['Messages-2.png', 48, 1168, 96, 96],
  'logo-montpellier': ['Messages-2.png', 48, 1312, 96, 96],
  'logo-visiteurope': ['Feed.png', 30, 204, 122, 122],
  // People in the feed
  'av-teguh': ['Feed.png', 73, 1032, 80, 80],
  'av-apta': ['Feed-7.png', 152, 1306, 48, 48],
  'av-ruffles': ['Feed-7.png', 26, 211, 104, 104],
  'av-me': ['Feed.png', 766, 1760, 46, 46],
  'av-max': ['Chat-2.png', 30, 456, 36, 36],
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

await mkdir(OUT, { recursive: true })

// Author + licence of a Commons file, for the in-app credits (required by CC BY / CC BY-SA).
async function commonsInfo(file) {
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.search = new URLSearchParams({ action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'extmetadata', format: 'json' })
  const res = await fetch(api, { headers: { 'User-Agent': UA } })
  const page = Object.values((await res.json()).query.pages)[0]
  const meta = page.imageinfo[0].extmetadata
  const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  return {
    author: strip(meta.Artist?.value) || 'Auteur inconnu',
    licence: meta.LicenseShortName?.value,
    licenceUrl: meta.LicenseUrl?.value,
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
  }
}

const credits = ['# Crédits photos', '', 'Photos issues de Wikimedia Commons :', '']
const creditsJson = []
for (const [name, [url]] of Object.entries(photos)) {
  const buf = await fetchBuffer(url)
  await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, `${name}.jpg`))
  const file = decodeURIComponent(url.split('/').slice(-2, -1)[0])
  const info = await commonsInfo(file)
  credits.push(`- \`${name}.jpg\` — ${info.author} — ${info.licence} — ${info.source}`)
  creditsJson.push({ image: `${name}.jpg`, title: file.replace(/\.\w+$/, '').replace(/_/g, ' '), ...info })
  console.log('photo', name, '—', info.author, info.licence)
}
await writeFile(path.join(OUT, 'CREDITS.md'), credits.join('\n') + '\n')
await writeFile(path.resolve('src/photo-credits.json'), JSON.stringify(creditsJson, null, 2) + '\n')

for (const [name, [file, left, top, width, height]] of Object.entries(crops)) {
  await sharp(path.join(SRC, file)).extract({ left, top, width, height }).png().toFile(path.join(OUT, `${name}.png`))
  console.log('crop', name)
}

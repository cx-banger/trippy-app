import type { CSSProperties } from 'react'

// SNCF pictograms (charte-sncf-svg/pictogrammes, "No line" variants), recoloured to black so they can be
// used as a CSS mask: the icon takes the current text colour, like the lucide icons.
const files = import.meta.glob<string>('../assets/pictos/*.svg', { eager: true, query: '?url', import: 'default' })

const urls = Object.fromEntries(Object.entries(files).map(([path, url]) => [path.match(/([\w-]+)\.svg$/)![1], url]))

export type PictoName =
  | 'accessible'
  | 'bell'
  | 'bike'
  | 'chart'
  | 'chat'
  | 'clock'
  | 'compass'
  | 'dinner'
  | 'football'
  | 'globe'
  | 'graduation'
  | 'heart'
  | 'heater'
  | 'house'
  | 'luggage'
  | 'map'
  | 'parking'
  | 'phone'
  | 'piggy'
  | 'pin'
  | 'plane'
  | 'shield'
  | 'train'

export function Picto({ name, className = 'h-5 w-5', style }: { name: PictoName; className?: string; style?: CSSProperties }) {
  const mask = `url("${urls[name]}") center / contain no-repeat`
  return <span aria-hidden className={`inline-block shrink-0 bg-current ${className}`} style={{ mask, WebkitMask: mask, ...style }} />
}

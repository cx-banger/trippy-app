// Door-to-door itineraries for the booked trips (sample timetables, departing from Toulouse).
import type { PictoName } from './components/Picto'

export type Stop = { name: string; sub: string; code?: string; lat: number; lng: number }

export type Leg = {
  mode: 'metro' | 'train' | 'bus' | 'walk'
  line: string // badge text (empty for walking)
  color: string
  text: 'dark' | 'light'
  dep: string // HH:MM
  arr: string
  number?: string // train number
  carrier?: string
  platform?: string
}

export type Journey = {
  tripId: string
  date: string // ISO date of the outbound journey
  returnDate: string
  stops: Stop[] // legs[i] goes from stops[i] to stops[i + 1]
  legs: Leg[]
  seat: string
}

export const MODE_PICTO: Record<Leg['mode'], PictoName> = { metro: 'metro', train: 'train', bus: 'bus', walk: 'walk' }

const metroA = { mode: 'metro', line: 'A', color: '#E2001A', text: 'light', carrier: 'Tisséo' } as const
const capitole: Stop = { name: 'Toulouse, Capitole', sub: 'Toulouse, France', lat: 43.6045, lng: 1.444 }
const matabiau: Stop = { name: 'Marengo – SNCF', sub: 'Toulouse, Matabiau', code: 'TLS', lat: 43.6113, lng: 1.4537 }

export const JOURNEYS: Record<string, Journey> = {
  biarritz: {
    tripId: 'biarritz',
    date: '2027-09-10',
    returnDate: '2027-09-14',
    seat: 'Voiture 12 · places 41 à 45',
    stops: [
      capitole,
      matabiau,
      { name: 'Gare de Bayonne', sub: 'Bayonne, France', code: 'BYE', lat: 43.4966, lng: -1.4706 },
      { name: 'Biarritz – Phare', sub: 'Arrêt de bus', lat: 43.4925, lng: -1.5505 },
      { name: 'Phare de Biarritz', sub: 'Esplanade Élisabeth II, 64200 Biarritz', lat: 43.4936, lng: -1.5547 },
    ],
    legs: [
      { ...metroA, dep: '07:00', arr: '07:06' },
      { mode: 'train', line: 'IC', color: '#FDE73F', text: 'dark', dep: '07:23', arr: '11:10', number: 'Intercités 4651', carrier: 'SNCF Voyageurs', platform: 'Voie B' },
      { mode: 'bus', line: 'A1', color: '#1A73E8', text: 'light', dep: '11:30', arr: '11:52', carrier: 'Txik Txak' },
      { mode: 'walk', line: '', color: '#9CA3AF', text: 'dark', dep: '11:52', arr: '11:58' },
    ],
  },
  marseille: {
    tripId: 'marseille',
    date: '2027-05-14',
    returnDate: '2027-05-16',
    seat: 'Voiture 7 · places 22 et 23',
    stops: [
      capitole,
      matabiau,
      { name: 'Marseille Saint-Charles', sub: 'Marseille, France', code: 'MRS', lat: 43.3027, lng: 5.3806 },
      { name: 'Vieux-Port', sub: 'Station de métro', lat: 43.2955, lng: 5.374 },
      { name: 'Vieux-Port de Marseille', sub: 'Quai du Port, 13002 Marseille', lat: 43.2951, lng: 5.3713 },
    ],
    legs: [
      { ...metroA, dep: '06:50', arr: '06:56' },
      { mode: 'train', line: 'IC', color: '#FDE73F', text: 'dark', dep: '07:16', arr: '11:06', number: 'Intercités 4758', carrier: 'SNCF Voyageurs', platform: 'Voie D' },
      { mode: 'metro', line: 'M1', color: '#1A73E8', text: 'light', dep: '11:20', arr: '11:25', carrier: 'RTM' },
      { mode: 'walk', line: '', color: '#9CA3AF', text: 'dark', dep: '11:25', arr: '11:29' },
    ],
  },
  narbonne: {
    tripId: 'narbonne',
    date: '2027-07-03',
    returnDate: '2027-07-04',
    seat: 'Placement libre',
    stops: [
      capitole,
      matabiau,
      { name: 'Gare de Narbonne', sub: 'Narbonne, France', code: 'NAR', lat: 43.1906, lng: 3.0055 },
      { name: 'Narbonne-Plage – Front de mer', sub: 'Arrêt de bus', lat: 43.1663, lng: 3.1794 },
      { name: 'Narbonne-Plage', sub: 'Avenue du Théâtre, 11100 Narbonne', lat: 43.1648, lng: 3.1818 },
    ],
    legs: [
      { ...metroA, dep: '08:40', arr: '08:46' },
      { mode: 'train', line: 'TER', color: '#FDE73F', text: 'dark', dep: '09:05', arr: '10:25', number: 'TER liO 76512', carrier: 'SNCF Voyageurs', platform: 'Voie A' },
      { mode: 'bus', line: '8', color: '#1A73E8', text: 'light', dep: '10:45', arr: '11:15', carrier: 'Citibus' },
      { mode: 'walk', line: '', color: '#9CA3AF', text: 'dark', dep: '11:15', arr: '11:19' },
    ],
  },
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const fromMinutes = (n: number) => {
  const m = ((n % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export const formatDuration = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `${min} min`)

/** Shifts the legs before the main train so the traveller leaves home earlier (more margin at the station). */
export function withMargin(j: Journey, extra: number): Leg[] {
  const trainIdx = j.legs.findIndex((l) => l.mode === 'train')
  return j.legs.map((l, i) => (i < trainIdx ? { ...l, dep: fromMinutes(toMinutes(l.dep) - extra), arr: fromMinutes(toMinutes(l.arr) - extra) } : l))
}

/** .ics file with the outbound journey, so it can be added to any calendar app. */
export function calendarFile(j: Journey, title: string, legs: Leg[]) {
  const stamp = (date: string, time: string) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
  const first = legs[0]
  const last = legs[legs.length - 1]
  const steps = legs
    .map((l, i) => `${l.dep} ${l.mode === 'walk' ? 'À pied' : `${l.line} ${l.number ?? ''}`.trim()} : ${j.stops[i].name} → ${j.stops[i + 1].name} (${l.arr})`)
    .join('\\n')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Trippy//FR',
    'BEGIN:VEVENT',
    `UID:${j.tripId}-${j.date}@trippy`,
    `DTSTART;TZID=Europe/Paris:${stamp(j.date, first.dep)}`,
    `DTEND;TZID=Europe/Paris:${stamp(j.date, last.arr)}`,
    `SUMMARY:Trippy – ${title}`,
    `LOCATION:${j.stops[0].name}`,
    `DESCRIPTION:${steps}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

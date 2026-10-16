import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Journey, Leg } from '../itinerary'

/** OpenStreetMap map of the door-to-door journey: one coloured line per leg, a dot per stop. */
export default function RouteMap({ journey, legs, recenter }: { journey: Journey; legs: Leg[]; recenter: number }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const bounds = useRef<L.LatLngBounds | null>(null)

  useEffect(() => {
    if (!el.current) return
    const m = L.map(el.current, { zoomControl: false, attributionControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m)

    const pts = journey.stops.map((s) => L.latLng(s.lat, s.lng))
    legs.forEach((leg, i) => {
      L.polyline([pts[i], pts[i + 1]], {
        color: leg.mode === 'walk' ? '#6b7280' : leg.mode === 'train' ? '#1A73E8' : leg.color,
        weight: leg.mode === 'train' ? 6 : 4,
        dashArray: leg.mode === 'walk' ? '4 8' : undefined,
        opacity: 0.9,
      }).addTo(m)
    })
    journey.stops.forEach((s, i) => {
      const end = i === 0 || i === journey.stops.length - 1
      L.circleMarker(pts[i], {
        radius: end ? 8 : 6,
        color: '#fff',
        weight: 3,
        fillColor: end ? '#FDE73F' : '#1A73E8',
        fillOpacity: 1,
      })
        .bindTooltip(s.name)
        .addTo(m)
    })
    bounds.current = L.latLngBounds(pts)
    m.fitBounds(bounds.current, { padding: [36, 36] })
    map.current = m
    return () => {
      m.remove()
      map.current = null
    }
  }, [journey, legs])

  useEffect(() => {
    if (recenter && map.current && bounds.current) map.current.flyToBounds(bounds.current, { padding: [36, 36], duration: 0.6 })
  }, [recenter])

  return <div ref={el} className="h-full w-full" />
}

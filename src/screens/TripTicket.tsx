import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { ArrowLeft, ChevronDown, ChevronRight, LocateFixed, MessageCircle, Navigation, Share2, SlidersHorizontal, X } from 'lucide-react'
import { CONTACTS, ME, TRIPS } from '../data'
import { useStore } from '../store'
import { JOURNEYS, MODE_PICTO, calendarFile, formatDuration, toMinutes, withMargin, type Journey, type Leg } from '../itinerary'
import { Screen, Sheet, cx, useToast } from '../components/ui'
import { Picto } from '../components/Picto'

const RouteMap = lazy(() => import('../components/RouteMap'))

const TABS = [
  { id: 'itinerary', label: 'Itinéraire', icon: 'walk' },
  { id: 'map', label: 'Carte', icon: 'map' },
  { id: 'ar', label: 'Guide AR', icon: 'phone' },
] as const
type Tab = (typeof TABS)[number]['id']

const MARGINS = [0, 15, 30] // minutes of extra margin before the main train

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const shortDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export default function TripTicket() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { state } = useStore()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('itinerary')
  const [margin, setMargin] = useState(0)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [now] = useState(() => Date.now())

  const trip = TRIPS.find((t) => t.id === id)
  const journey = JOURNEYS[id]
  const booking = state.bookings[id]
  const legs = useMemo(() => (journey ? withMargin(journey, margin) : []), [journey, margin])
  const code = `TRIPPY-${id.toUpperCase()}-${booking?.people ?? 1}`

  if (!trip || !journey || !state.bookedTrips.includes(id)) return <Navigate to="/savings" replace />

  const group = state.conversations.find((c) => c.kind === 'group' && c.tripId === id)
  const days = Math.max(0, Math.ceil((new Date(`${journey.date}T${legs[0].dep}:00`).getTime() - now) / 864e5))
  const people = booking?.people ?? 1

  const share = async () => {
    const text = `Je pars à ${trip.name} le ${longDate(journey.date)} avec Trippy 🚆`
    try {
      if (navigator.share) await navigator.share({ title: trip.name, text, url: window.location.href })
      else {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`)
        toast.show('Lien copié')
      }
    } catch {
      // share sheet dismissed
    }
  }

  const addToCalendar = () => {
    const blob = new Blob([calendarFile(journey, trip.name, legs)], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `trippy-${trip.id}.ics`
    document.body.append(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast.show('Ajouté : ouvre le fichier pour l’enregistrer dans ton agenda')
  }

  return (
    <Screen className="pb-10">
      {/* Hero, like an event page */}
      <section className="relative h-80 text-white">
        <img src={trip.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-page via-page/90 to-transparent dark:from-page-dark dark:via-page-dark/90" />
        <div className="relative flex items-center justify-between px-5 pt-6">
          <button onClick={() => navigate(-1)} aria-label="Retour" className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={share} aria-label="Partager" className="grid h-10 w-10 place-items-center rounded-full bg-black/30 backdrop-blur">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-4 px-6 text-center text-neutral-900 dark:text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Voyage réservé</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{trip.name}</h1>
          <p className="mt-1 text-sm opacity-80">
            {shortDate(journey.date)} – {shortDate(journey.returnDate)} · {trip.days} jours · {people} voyageur{people > 1 ? 's' : ''}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-sun px-3 py-1 text-sm font-semibold text-neutral-900">
            <Picto name="clock" className="h-4 w-4" />
            {days === 0 ? 'Départ aujourd’hui' : `Départ dans ${days} jour${days > 1 ? 's' : ''}`}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-2 px-5">
        <Action onClick={share} icon={<Share2 className="h-5 w-5" />} label="Partager" />
        <Action onClick={addToCalendar} icon={<Picto name="calendar" className="h-5 w-5" />} label="Calendrier" />
        {group ? (
          <Action to={`/chat/${group.id}`} icon={<MessageCircle className="h-5 w-5" />} label="Chat du groupe" />
        ) : (
          <Action to={`/trip/${trip.id}`} icon={<ChevronRight className="h-5 w-5" />} label="Le voyage" />
        )}
      </div>

      {/* Ticket */}
      <Section title="Ton billet">
        <button onClick={() => setQrOpen(true)} className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left dark:bg-card-dark">
          <Qr value={code} className="h-24 w-24 rounded-xl bg-white p-1.5" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{legs.find((l) => l.mode === 'train')?.number}</p>
            <p className="text-neutral-500">{journey.seat}</p>
            <p className="mt-2 font-mono text-xs text-neutral-400">{code}</p>
            <p className="mt-2 text-xs font-semibold text-sky">Touche pour l’agrandir au contrôle</p>
          </div>
        </button>
      </Section>

      {/* E-tinerary */}
      <Section title="Trajet aller">
        <div className="isolate overflow-hidden rounded-3xl bg-[#2b2b2b] text-white">
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="text-lg font-semibold">E-tinerary</p>
            <span className="text-xs text-white/60">{longDate(journey.date)}</span>
          </div>
          <div className="mx-4 mt-3 grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cx('flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold', tab === t.id ? 'bg-white text-neutral-900' : 'text-white/80')}
              >
                <Picto name={t.icon} className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-white/15">
            <div className="h-full bg-sun transition-all duration-300" style={{ width: `${((TABS.findIndex((t) => t.id === tab) + 1) / TABS.length) * 100}%` }} />
          </div>

          {tab === 'itinerary' && <Timeline journey={journey} legs={legs} title={trip.name} />}
          {tab === 'map' && <MapTab journey={journey} legs={legs} onCalendar={addToCalendar} />}
          {tab === 'ar' && (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <Picto name="phone" className="h-12 w-12 text-sun" />
              <p className="mt-3 font-semibold">Guide en réalité augmentée</p>
              <p className="mt-1 text-sm text-white/60">Bientôt : vise la gare avec ta caméra pour voir ton quai et la sortie vers ton bus.</p>
            </div>
          )}

          {tab !== 'map' && (
            <div className="border-t border-white/10 bg-[#222] px-4 pb-5 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 rounded-lg border border-white/30 px-3 py-1.5">
                  <span className="text-white/70">Partir à</span>
                  <select value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="appearance-none bg-transparent font-semibold outline-none">
                    {MARGINS.map((m) => (
                      <option key={m} value={m} className="text-neutral-900">
                        {withMargin(journey, m)[0].dep}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4" />
                </label>
                <button onClick={() => setOptionsOpen(true)} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 font-semibold">
                  <SlidersHorizontal className="h-4 w-4" /> Options
                </button>
              </div>
              <dl className="mt-4 space-y-2.5">
                <Row label="N° de train" value={legs.find((l) => l.mode === 'train')?.number ?? '—'} />
                <Row label="Transporteur" value={legs.find((l) => l.mode === 'train')?.carrier ?? '—'} />
              </dl>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-3">
                <span className="text-white/70">Gare de départ</span>
                <span className="font-semibold">
                  {journey.stops[1].sub} · {legs.find((l) => l.mode === 'train')?.platform}
                </span>
              </div>
              <p className="mt-3 text-center text-xs text-white/50">
                Horaires indicatifs : vérifie-les la veille sur{' '}
                <a href="https://www.sncf-connect.com" target="_blank" rel="noreferrer" className="underline">
                  SNCF Connect
                </a>
              </p>
            </div>
          )}
        </div>
      </Section>

      {group && (
        <Section title="Le groupe">
          <Link to={`/chat/${group.id}`} className="flex items-center gap-3 rounded-3xl bg-white p-4 dark:bg-card-dark">
            <div className="flex -space-x-3">
              {[ME.avatar, ...(group.members ?? []).map((m) => CONTACTS[m]?.avatar)].filter(Boolean).slice(0, 5).map((a) => (
                <img key={a} src={a} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover dark:border-card-dark" />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{group.name}</p>
              <p className="text-sm text-neutral-500">{(group.members?.length ?? 0) + 1} participants · ouvrir le chat</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </Link>
        </Section>
      )}

      <Section title="Infos pratiques">
        <ul className="divide-y divide-neutral-100 rounded-3xl bg-white px-4 dark:divide-white/10 dark:bg-card-dark">
          <Info icon="luggage" title="Bagages" body="1 valise + 1 sac par personne, étiquetés à ton nom." />
          <Info icon="accessible" title="Accessibilité" body="Assistance gratuite en gare sur réservation, 48 h avant le départ." />
          <Info icon="leaf" title={`${trip.tags.co2} par rapport à la voiture`} body="Merci de voyager en train et en transports en commun." />
          <Info icon="shield" title="Annulation" body="Remboursement intégral jusqu’à 7 jours avant le départ." />
        </ul>
      </Section>

      <Sheet open={optionsOpen} onClose={() => setOptionsOpen(false)}>
        <h2 className="font-display text-xl font-semibold">Options du trajet</h2>
        <p className="mt-1 text-sm text-neutral-500">Choisis combien de temps tu veux avoir en gare avant le train.</p>
        <div className="mt-4 space-y-2">
          {MARGINS.map((m) => {
            const first = withMargin(journey, m)
            const train = first.find((l) => l.mode === 'train')!
            const wait = toMinutes(train.dep) - toMinutes(first[0].arr)
            return (
              <button
                key={m}
                onClick={() => (setMargin(m), setOptionsOpen(false))}
                className={cx('flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left', margin === m ? 'bg-sun text-neutral-900' : 'bg-white dark:bg-raised-dark')}
              >
                <span className="font-semibold">Partir à {first[0].dep}</span>
                <span className="text-sm">{wait} min en gare</span>
              </button>
            )
          })}
        </div>
      </Sheet>

      {qrOpen && (
        <button onClick={() => setQrOpen(false)} className="animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-8 text-neutral-900">
          <span className="absolute right-5 top-[max(env(safe-area-inset-top),20px)]">
            <X className="h-7 w-7" />
          </span>
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Présente ce code au contrôle</p>
          <Qr value={code} className="w-full max-w-[300px]" />
          <p className="font-mono text-sm">{code}</p>
          <p className="text-center text-sm text-neutral-500">
            {trip.name} · {people} voyageur{people > 1 ? 's' : ''} · {journey.seat}
          </p>
        </button>
      )}
      {toast.node}
    </Screen>
  )
}

function Timeline({ journey, legs, title }: { journey: Journey; legs: Leg[]; title: string }) {
  const ride = legs.filter((l) => l.mode !== 'walk')
  const walk = legs.find((l) => l.mode === 'walk')
  const total = toMinutes(legs[legs.length - 1].arr) - toMinutes(legs[0].dep)
  return (
    <div className="px-4 pb-4 pt-4">
      <p className="text-xl font-semibold">{title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
        <Picto name="train" className="h-4 w-4 text-white/70" />
        {ride.map((l, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <LineBadge leg={l} />
            {i < ride.length - 1 && <span className="text-white/40">/</span>}
          </span>
        ))}
        {walk && (
          <>
            <ChevronRight className="h-4 w-4 text-white/50" />
            <Picto name="walk" className="h-4 w-4" />
            <span className="text-xs">{toMinutes(walk.arr) - toMinutes(walk.dep)}</span>
          </>
        )}
        <span className="ml-auto text-xs text-white/60">{formatDuration(total)}</span>
      </div>

      <div className="my-4 border-t border-dashed border-white/30" />

      <ol>
        {journey.stops.map((stop, i) => {
          const leg = legs[i] // leaving this stop
          const arriving = legs[i - 1]
          const last = i === journey.stops.length - 1
          const isWalkEnd = last && arriving?.mode === 'walk'
          return (
            <li key={stop.name} className="grid grid-cols-[52px_20px_1fr_auto] gap-x-2">
              <div className="flex flex-col items-center pt-0.5">{leg && leg.mode !== 'walk' && <LineBadge leg={leg} />}</div>
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    'mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full',
                    isWalkEnd ? 'bg-white/30' : leg?.mode === 'train' || arriving?.mode === 'train' ? 'bg-white ring-4 ring-white/25' : 'bg-sky',
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2b2b2b]" />
                </span>
                {!last && <span className={cx('w-0.5 flex-1', leg?.mode === 'walk' ? 'border-l-2 border-dotted border-white/50' : 'bg-white/30')} />}
              </div>
              <div className={cx('pb-5', isWalkEnd && 'text-white/50')}>
                <p className="font-semibold leading-tight">{stop.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-white/50">{stop.sub}</p>
                {leg && !last && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
                    <Picto name={MODE_PICTO[leg.mode]} className="h-3.5 w-3.5" />
                    {leg.mode === 'walk' ? `${toMinutes(leg.arr) - toMinutes(leg.dep)} min à pied` : [leg.number ?? leg.carrier, leg.platform].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div className="pb-5 text-right">
                <p className={cx('font-semibold', leg?.mode === 'train' && 'text-2xl leading-none')}>{leg && !last ? leg.dep : arriving?.arr}</p>
                {leg?.mode === 'train' && <p className="mt-1 text-[11px] text-white/50">arr. {leg.arr}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function MapTab({ journey, legs, onCalendar }: { journey: Journey; legs: Leg[]; onCalendar: () => void }) {
  const [recenter, setRecenter] = useState(0)
  const navigate = useNavigate()
  const main = legs.filter((l) => l.mode === 'train' || l.mode === 'bus')
  const stopOf = (l: Leg) => legs.indexOf(l)
  const train = legs.find((l) => l.mode === 'train')!
  const total = toMinutes(legs[legs.length - 1].arr) - toMinutes(legs[0].dep)
  const dest = journey.stops[journey.stops.length - 1]
  return (
    <div className="relative h-[460px]">
      <Suspense fallback={<div className="grid h-full place-items-center text-sm text-white/60">Chargement de la carte…</div>}>
        <RouteMap journey={journey} legs={legs} recenter={recenter} />
      </Suspense>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=transit`}
        target="_blank"
        rel="noreferrer"
        aria-label="Ouvrir le guidage"
        className="absolute left-4 top-4 z-[500] grid h-11 w-11 place-items-center rounded-full bg-sky text-white shadow-lg"
      >
        <Navigation className="h-5 w-5" fill="currentColor" />
      </a>
      <button
        onClick={() => setRecenter((n) => n + 1)}
        aria-label="Recentrer"
        className="absolute right-4 top-4 z-[500] grid h-11 w-11 place-items-center rounded-full bg-[#2b2b2b] text-white shadow-lg"
      >
        <LocateFixed className="h-5 w-5" />
      </button>
      <div className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl bg-[#1f1f1f]/95 p-4 backdrop-blur">
        <div className="space-y-2 text-sm">
          {main.map((l) => {
            const i = stopOf(l)
            return (
              <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
                <p>
                  <span className="font-semibold">{l.dep}</span> <span className="text-white/60">{journey.stops[i].code ?? journey.stops[i].name.split(' ')[0]}</span>
                </p>
                <span className="text-white/50">→</span>
                <p>
                  <span className="font-semibold">{l.arr}</span> <span className="text-white/60">{journey.stops[i + 1].code ?? journey.stops[i + 1].name.split(' ')[0]}</span>
                </p>
                <LineBadge leg={l} />
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-white/60">
          {train.number} · {formatDuration(total)} porte à porte · {main.length - 1 === 0 ? 'direct' : `${main.length - 1} correspondance${main.length > 2 ? 's' : ''}`}
        </p>
        <button onClick={onCalendar} className="mt-3 h-10 w-full rounded-xl bg-sky text-sm font-semibold">
          Enregistrer l’itinéraire
        </button>
        <button onClick={() => navigate('/feed')} className="mt-2 h-10 w-full rounded-xl bg-white/10 text-sm font-semibold">
          Retour au feed
        </button>
      </div>
    </div>
  )
}

function LineBadge({ leg }: { leg: Leg }) {
  return (
    <span
      className="inline-flex h-5 min-w-8 items-center justify-center rounded-md px-1.5 text-[11px] font-bold italic"
      style={{ backgroundColor: leg.color, color: leg.text === 'dark' ? '#1f1f1f' : '#fff' }}
    >
      {leg.line}
    </span>
  )
}

function Qr({ value, className }: { value: string; className?: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(value, { margin: 1, width: 600 }).then(setSrc, () => setSrc(''))
  }, [value])
  return src ? <img src={src} alt="QR code du billet" className={className} /> : <span className={cx('block aspect-square', className)} />
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 px-5">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">{title}</h2>
      {children}
    </section>
  )
}

function Action({ icon, label, onClick, to }: { icon: ReactNode; label: string; onClick?: () => void; to?: string }) {
  const cls = 'flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3 text-xs font-semibold dark:bg-card-dark'
  return to ? (
    <Link to={to} className={cls}>
      {icon}
      {label}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {icon}
      {label}
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

function Info({ icon, title, body }: { icon: 'luggage' | 'accessible' | 'leaf' | 'shield'; title: string; body: string }) {
  return (
    <li className="flex gap-3 py-3.5">
      <Picto name={icon} className="mt-0.5 h-6 w-6 text-teal" />
      <div className="text-sm">
        <p className="font-semibold">{title}</p>
        <p className="text-neutral-500">{body}</p>
      </div>
    </li>
  )
}

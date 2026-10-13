import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bath, ChevronDown, CircleCheck, Clock, History, Lock, Map as MapIcon, MapPin, Pencil, Play, Send, Star, Utensils, Waves, Wifi } from 'lucide-react'
import { TRIPS, type CategoryFilter, type Trip } from '../data'
import { useStore } from '../store'
import { CategoryChips, Screen, Sheet, TrainIcon, cx, useToast } from '../components/ui'

const facilityIcon = { wifi: Wifi, dinner: Utensils, tub: Bath, pool: Waves } satisfies Record<Trip['facilities'][number]['icon'], unknown>

export default function TripDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, toggleSave, book } = useStore()
  const toast = useToast()
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [readMore, setReadMore] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [people, setPeople] = useState(2)

  const trip = TRIPS.find((t) => t.id === id)
  if (!trip) return <Navigate to="/" replace />

  const saved = state.savedTrips.includes(trip.id)
  const booked = state.bookedTrips.includes(trip.id)

  return (
    <>
      <Screen className="pb-32">
        <header className="flex items-center justify-between px-6 pb-4 pt-7">
          <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-lg" aria-label="Retour">
            <ArrowLeft className="h-6 w-6" />
            <span className="font-medium">Job Details</span>
          </button>
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-300">
            <MapPin className="h-5 w-5 text-sky" />
            <span className="text-[13px]">{state.city}</span>
            <button onClick={() => setMapOpen(true)} aria-label="Carte" className="relative ml-1 text-neutral-900 dark:text-white">
              <MapIcon className="h-6 w-6" fill="currentColor" stroke="white" strokeWidth={1.2} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-tomato" />
            </button>
          </div>
        </header>

        <section className="mx-5 overflow-hidden rounded-[26px] bg-white dark:bg-card-dark">
          <div className="relative h-36 sm:h-40">
            <img src={trip.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/40" />
            <div className="relative flex items-start gap-3 p-4 text-white">
              <img src={trip.logo} alt="" className="h-11 w-11 rounded-xl" />
              <div>
                <h1 className="text-lg font-semibold leading-tight drop-shadow">{trip.name}</h1>
                <p className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-sun" fill="currentColor" /> {trip.rating}
                </p>
              </div>
            </div>
            <div className="no-scrollbar absolute inset-x-0 bottom-3 flex gap-2 overflow-x-auto px-4 text-white">
              <button onClick={() => setMapOpen(true)} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <MapIcon className="h-4 w-4" /> Map
              </button>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <TrainIcon className="h-3 w-7" /> {trip.travelTime}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                <Clock className="h-4 w-4" /> {trip.days} Days <span className="h-1.5 w-1.5 rounded-full bg-white" />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <p className="flex items-center gap-2 text-[13px]">
              <History className="h-4 w-4" /> Posted {trip.postedDaysAgo} days ago
            </p>
            <p className="text-xl font-bold">${trip.price}/per</p>
          </div>
        </section>

        <CategoryChips className="mx-6 mt-4" value={category} onChange={setCategory} />

        <section className="mx-5 mt-4 rounded-[26px] bg-white p-5 dark:bg-card-dark">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-raised-dark">
              <Pencil className="h-5 w-5" />
            </span>
            <h2 className="flex-1 text-lg font-medium">Introduction</h2>
            <Play className="h-6 w-6 rounded-full bg-neutral-900 p-1.5 text-white dark:bg-white dark:text-neutral-900" fill="currentColor" />
          </div>
          <p className={cx('mt-4 text-[15px] leading-7 text-neutral-700 dark:text-neutral-300', !readMore && 'line-clamp-4')}>{trip.intro}</p>
          <button onClick={() => setReadMore((v) => !v)} className="mt-2 flex items-center gap-2 font-semibold text-sky">
            {readMore ? 'Read less' : 'Read more'}
            <ChevronDown className={cx('h-5 w-5 transition', readMore && 'rotate-180')} />
          </button>
        </section>

        <section className="mx-5 mt-4 rounded-[26px] bg-white p-5 dark:bg-card-dark">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 dark:bg-raised-dark">
              <CircleCheck className="h-5 w-5" />
            </span>
            <h2 className="flex-1 text-lg font-medium">Facilities &amp; Requirements</h2>
            <Lock className="h-5 w-5" fill="currentColor" />
          </div>
          <ul className="mt-5 grid grid-cols-4 gap-2.5">
            {trip.facilities.map((f) => {
              const Icon = facilityIcon[f.icon]
              return (
                <li key={f.label} className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl bg-neutral-100 text-xs dark:bg-raised-dark">
                  <Icon className="h-7 w-7" strokeWidth={1.6} />
                  {f.label}
                </li>
              )
            })}
          </ul>
        </section>
      </Screen>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-neutral-900/80 via-neutral-900/30 to-transparent px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-16">
        <div className="pointer-events-auto flex items-center">
          <button
            onClick={() => {
              toggleSave(trip.id)
              toast.show(saved ? 'Retiré des sauvegardes' : 'Sauvegardé ! Retrouve-le dans Découvrir › Saved')
            }}
            className={cx('h-12 w-[32%] rounded-full text-lg', saved ? 'bg-sun text-neutral-900' : 'bg-white text-neutral-900')}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <span className="h-1.5 w-3 bg-white" />
          <button
            onClick={() => (booked ? toast.show('Déjà réservé ✔') : setBookOpen(true))}
            className="flex h-16 flex-1 items-center justify-center gap-3 rounded-full bg-sky text-white"
          >
            <span className="text-lg">{booked ? 'Booked' : 'Book Now'}</span>
            <span className="text-3xl font-bold">${trip.bookPrice}</span>
            <Send className="h-6 w-6" fill="currentColor" />
          </button>
        </div>
      </footer>

      <Sheet open={mapOpen} onClose={() => setMapOpen(false)}>
        <h2 className="mb-3 font-display text-xl font-semibold">{trip.name}</h2>
        <iframe
          title={`Carte de ${trip.name}`}
          className="h-72 w-full rounded-2xl border-0"
          src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&bbox=${MAP_BOX[trip.id]}`}
        />
        <p className="mt-3 text-sm text-neutral-500">
          {trip.travelTime} de route depuis {state.city}
        </p>
      </Sheet>

      <Sheet open={bookOpen} onClose={() => setBookOpen(false)}>
        <h2 className="font-display text-2xl font-semibold">Réserver {trip.name}</h2>
        <p className="mt-1 text-neutral-500">
          {trip.days} jours · départ de {state.city}
        </p>
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-raised-dark">
          <span>Voyageurs</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setPeople((p) => Math.max(1, p - 1))} className="h-9 w-9 rounded-full bg-neutral-100 text-xl dark:bg-neutral-700" aria-label="Moins">
              −
            </button>
            <span className="w-4 text-center text-lg font-semibold">{people}</span>
            <button onClick={() => setPeople((p) => Math.min(trip.members, p + 1))} className="h-9 w-9 rounded-full bg-neutral-100 text-xl dark:bg-neutral-700" aria-label="Plus">
              +
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between px-1 text-lg">
          <span>Total</span>
          <span className="text-2xl font-bold">${trip.bookPrice * people}</span>
        </div>
        <button
          onClick={() => {
            book(trip.id)
            setBookOpen(false)
            toast.show('Réservation confirmée 🎉')
          }}
          className="mt-6 h-14 w-full rounded-full bg-sky text-lg font-semibold text-white"
        >
          Confirmer
        </button>
      </Sheet>
      {toast.node}
    </>
  )
}

const MAP_BOX: Record<string, string> = {
  biarritz: '-1.5741,43.4797,-1.5341,43.4997',
  marseille: '5.3530,43.2880,5.3830,43.3020',
  narbonne: '3.1450,43.1500,3.1850,43.1700',
}

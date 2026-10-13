import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Heart, MapPin, Moon, Play, Sun, TrendingUp, X } from 'lucide-react'
import { CITIES, TRIPS, type CategoryFilter, type Trip } from '../data'
import { useStore } from '../store'
import { CategoryChips, Screen, SearchField, Sheet, TrainIcon, cx } from '../components/ui'

export default function Home() {
  const { state, setCity, toggleLike, toggleTheme, markNotificationsRead } = useStore()
  const navigate = useNavigate()
  const [category, setCategory] = useState<CategoryFilter>('ALL')
  const [query, setQuery] = useState('')
  const [hotOnly, setHotOnly] = useState(false)
  const [expanded, setExpanded] = useState<string>('biarritz')
  const [menuOpen, setMenuOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const trips = useMemo(
    () =>
      TRIPS.filter(
        (t) =>
          (category === 'ALL' || t.category === category) &&
          (!hotOnly || t.hotDeal) &&
          `${t.name} ${t.region}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [category, query, hotOnly],
  )
  // The open card is drawn last so it shows its preview; default to the last one.
  const openId = trips.some((t) => t.id === expanded) ? expanded : trips.at(-1)?.id

  return (
    <Screen withNav>
      <div className="px-6 pt-6">
        <header className="flex items-center justify-between">
          <button onClick={() => setMenuOpen(true)} className="rounded-full bg-sun px-6 py-2.5 font-display text-base font-medium text-neutral-900">
            MENU
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setCityOpen(true)} className="flex items-center gap-1 text-[13px] text-neutral-500 dark:text-neutral-200">
              <MapPin className="h-4 w-4 text-sky" />
              {state.city}
              <ChevronDown className="h-4 w-4 text-sky" />
            </button>
            <button
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen(true)
                markNotificationsRead()
              }}
              className="relative p-1"
            >
              <Bell className="h-6 w-6" />
              {!state.readNotifications && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-tomato" />}
            </button>
          </div>
        </header>

        <h1 className="mt-6 px-1 font-display text-[23px] font-bold uppercase leading-[1.35] tracking-tight">
          Learn design anywhere, anytime with our e&#8209;learning app
        </h1>

        <SearchField className="mt-6" value={query} onChange={setQuery} placeholder="Find things to do" onFilter={() => setHotOnly((v) => !v)} />
        {hotOnly && (
          <button onClick={() => setHotOnly(false)} className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky/10 px-3 py-1 text-sm text-sky">
            <TrendingUp className="h-4 w-4" /> Hot Deals uniquement <X className="h-3.5 w-3.5" />
          </button>
        )}

        <CategoryChips className="mt-5" value={category} onChange={setCategory} />
      </div>

      <section className="mt-8 px-5">
        {trips.length === 0 && <p className="py-16 text-center text-neutral-500">Aucun voyage ne correspond à ta recherche.</p>}
        {trips.map((trip, i) => (
          <TripCard
            key={trip.id}
            trip={trip}
            first={i === 0}
            open={trip.id === openId}
            liked={state.likedTrips.includes(trip.id)}
            onToggle={() => setExpanded(trip.id)}
            onLike={() => toggleLike(trip.id)}
            onOpen={() => navigate(`/trip/${trip.id}`)}
          />
        ))}
      </section>

      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <nav className="flex flex-col gap-1 pb-2 font-display text-lg">
          {[
            ['/', 'Accueil'],
            ['/feed', 'Feed'],
            ['/discover', 'Découvrir'],
            ['/savings', 'Épargne'],
            ['/messages', 'Messages'],
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10">
              {label}
            </Link>
          ))}
          <button onClick={toggleTheme} className="mt-2 flex items-center justify-between rounded-2xl bg-white px-4 py-3 dark:bg-raised-dark">
            Thème {state.theme === 'dark' ? 'sombre' : 'clair'}
            {state.theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
        </nav>
      </Sheet>

      <Sheet open={cityOpen} onClose={() => setCityOpen(false)}>
        <h2 className="mb-3 font-display text-xl font-semibold">Ta ville de départ</h2>
        {CITIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCity(c)
              setCityOpen(false)
            }}
            className={cx('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left', c === state.city && 'bg-sun text-neutral-900')}
          >
            <MapPin className="h-5 w-5" /> {c}
          </button>
        ))}
      </Sheet>

      <Sheet open={notifOpen} onClose={() => setNotifOpen(false)}>
        <h2 className="mb-3 font-display text-xl font-semibold">Notifications</h2>
        <ul className="space-y-3 text-[15px]">
          <li className="rounded-2xl bg-white p-4 dark:bg-raised-dark">🔥 Hot Deal : Marseille passe à 110 $ ce week-end.</li>
          <li className="rounded-2xl bg-white p-4 dark:bg-raised-dark">🗳️ Nouveau sondage dans « Road Trip en Toscane ».</li>
          <li className="rounded-2xl bg-white p-4 dark:bg-raised-dark">👋 5 nouveaux membres pour Phare de Biarritz.</li>
        </ul>
      </Sheet>
    </Screen>
  )
}

function TripCard({
  trip,
  first,
  open,
  liked,
  onToggle,
  onLike,
  onOpen,
}: {
  trip: Trip
  first: boolean
  open: boolean
  liked: boolean
  onToggle: () => void
  onLike: () => void
  onOpen: () => void
}) {
  const light = trip.textOnColor === 'light'
  return (
    <article
      className={cx('notch-top relative rounded-[28px] pb-12 pt-9 transition-all', !first && '-mt-9', open && 'pb-6')}
      style={{ backgroundColor: trip.color }}
    >
      {/* handle drawn inside the notch */}
      <span className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-full" style={{ backgroundColor: trip.color }} />

      <div className={cx('flex items-start justify-between gap-3 pl-11 pr-4', light ? 'text-white' : 'text-neutral-900')}>
        <button onClick={onToggle} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <p className={cx('text-xs uppercase', light ? 'text-white/90' : 'text-neutral-600')}>{trip.members} membres</p>
          <h2 className="mt-3 flex items-center gap-2.5 font-display text-base font-semibold uppercase leading-tight">
            <span>{trip.shortName}</span>
            <TrainIcon className="h-3 w-8 shrink-0" />
          </h2>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <div className="flex items-start gap-3">
            <p className="font-display text-sm font-semibold leading-tight">
              {String(trip.days).padStart(2, '0')}
              <br />
              JOURS
            </p>
            <button onClick={onLike} aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={liked} className="-mr-1 -mt-1 p-1">
              <Heart className={cx('h-6 w-6 transition', liked && 'scale-110')} fill={liked ? (light ? '#fff' : '#1f1f1f') : 'none'} strokeWidth={1.8} />
            </button>
          </div>
          {trip.hotDeal && (
            <p className="flex items-center gap-1 text-xs font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-sky" /> <span className={light ? 'text-white' : 'text-neutral-700'}>Hot Deal</span>
            </p>
          )}
        </div>
      </div>

      {open && (
        <button onClick={onOpen} className="animate-fade-in relative mx-8 mt-5 block h-32 w-[calc(100%-4rem)] overflow-hidden rounded-[22px] text-left">
          <img src={trip.photo} alt={trip.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
          <div className="relative flex h-full items-end justify-between p-4 text-white">
            <div>
              <p className="font-display text-lg font-bold uppercase leading-tight drop-shadow">
                Start to
                <br />
                practice
              </p>
              <span className="mt-1 inline-block rounded-full border-2 border-white bg-emerald-900/70 px-1.5 text-[11px] font-semibold">
                {trip.days - 1}N/{trip.days}D
              </span>
            </div>
            <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-neutral-900">
              <Play className="ml-0.5 h-6 w-6" fill="white" />
            </span>
          </div>
        </button>
      )}
    </article>
  )
}

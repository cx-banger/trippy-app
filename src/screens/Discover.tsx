import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, History, Leaf, Users } from 'lucide-react'
import { TRIPS, type Trip } from '../data'
import { useStore } from '../store'
import { EmptyState as Empty, Screen, SearchField, TrainIcon, cx } from '../components/ui'
import traveler from '../assets/illustrations/traveler.svg'
import calendar from '../assets/illustrations/calendar.svg'
import travelers from '../assets/illustrations/travelers.svg'

const TABS = ['Discover', 'Saved', 'Applied', 'Closed'] as const
type Tab = (typeof TABS)[number]

// Offers that are no longer bookable, shown under "Closed".
const CLOSED: string[] = []

export default function Discover() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('Discover')
  const [query, setQuery] = useState('')
  const [sortByPrice, setSortByPrice] = useState(false)

  const byTab: Record<Tab, Trip[]> = {
    Discover: TRIPS.slice().reverse(),
    Saved: TRIPS.filter((t) => state.savedTrips.includes(t.id)),
    Applied: TRIPS.filter((t) => state.bookedTrips.includes(t.id)),
    Closed: TRIPS.filter((t) => CLOSED.includes(t.id)),
  }
  const q = query.trim().toLowerCase()
  let list = byTab[tab].filter((t) => `${t.name} ${t.region} ${t.tags.transport}`.toLowerCase().includes(q))
  if (sortByPrice) list = list.slice().sort((a, b) => a.price - b.price)

  return (
    <Screen withNav>
      <div className="px-6 pt-8">
        <div className="no-scrollbar -mx-1 flex overflow-x-auto px-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx(
                'relative -ml-1.5 shrink-0 rounded-full px-5 py-2.5 font-display text-[15px] first:ml-0',
                tab === t ? 'z-10 bg-violet text-white' : 'bg-neutral-300/80 text-neutral-900 dark:bg-neutral-300',
              )}
            >
              {t}
              {t === 'Saved' && state.savedTrips.length > 0 && <Badge n={state.savedTrips.length} />}
              {t === 'Applied' && state.bookedTrips.length > 0 && <Badge n={state.bookedTrips.length} />}
            </button>
          ))}
        </div>

        <SearchField
          tone="grey"
          className="mt-5"
          value={query}
          onChange={setQuery}
          placeholder="Search for company or roles..."
          onFilter={() => setSortByPrice((v) => !v)}
        />
        {sortByPrice && <p className="mt-2 text-sm text-sky">Trié par prix croissant</p>}
      </div>

      <div className="mt-5 space-y-5 px-6">
        {list.map((trip) => (
          <OfferCard key={trip.id} trip={trip} />
        ))}
        {list.length === 0 && <EmptyState tab={tab} />}
      </div>
    </Screen>
  )
}

function Badge({ n }: { n: number }) {
  return <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-xs font-semibold text-white">{n}</span>
}

function EmptyState({ tab }: { tab: Tab }) {
  const text: Record<Tab, string> = {
    Discover: 'Aucune offre ne correspond à ta recherche.',
    Saved: 'Rien de sauvegardé pour l’instant. Ouvre une offre et appuie sur « Save ».',
    Applied: 'Tu n’as encore rien réservé. Ouvre une offre et appuie sur « Book Now ».',
    Closed: 'Aucune offre clôturée.',
  }
  const art: Record<Tab, string> = { Discover: travelers, Saved: traveler, Applied: calendar, Closed: travelers }
  return <Empty illustration={art[tab]}>{text[tab]}</Empty>
}

function OfferCard({ trip }: { trip: Trip }) {
  const plain = trip.textOnColor === 'dark' // Narbonne card uses a flat yellow background in the design
  return (
    <article className="relative">
      <div
        className={cx('corner-cut relative overflow-hidden rounded-t-[26px]', plain ? 'text-neutral-900' : 'text-white')}
        style={plain ? { background: 'linear-gradient(#F3C13A,#E9B730)' } : undefined}
      >
        {!plain && (
          <>
            <img src={trip.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/55" />
          </>
        )}
        <div className="relative p-4">
          <div className="flex items-center gap-3 pr-24">
            <img src={trip.logo} alt="" className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold leading-tight">{trip.name}</h2>
              <p className={cx('text-sm', plain ? 'text-neutral-800' : 'text-white/90')}>{trip.region}</p>
            </div>
          </div>
          <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto">
            {[
              { icon: <TrainIcon className="h-4 w-4" />, label: trip.tags.transport },
              { icon: <Leaf className="h-4 w-4" />, label: trip.tags.co2 },
              { icon: <Users className="h-4 w-4" />, label: trip.tags.group },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className={cx('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm', plain ? 'border-neutral-800/60' : 'border-white/70 bg-white/10 backdrop-blur-sm')}
              >
                {icon}
                {label}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[13px] leading-snug">
            {trip.teaser}
            <Link to={`/trip/${trip.id}`} className="underline underline-offset-2">
              Read More
            </Link>
          </p>
        </div>
      </div>

      <Link
        to={`/trip/${trip.id}`}
        className="absolute right-0 top-0 flex h-12 w-[104px] items-center justify-center gap-1.5 rounded-full bg-neutral-800 text-base text-white dark:bg-card-dark dark:ring-1 dark:ring-white/40"
      >
        View <ArrowUpRight className="h-5 w-5" />
      </Link>

      <div className={cx('flex items-center justify-between rounded-b-[26px] px-5 py-4', plain ? 'bg-[#E9B730] text-neutral-900' : 'bg-white dark:bg-card-dark')}>
        <p className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" /> Posted {trip.postedDaysAgo} days ago
        </p>
        <p className="text-xl font-bold">{trip.price} €/pers.</p>
      </div>
    </article>
  )
}

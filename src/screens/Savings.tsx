import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { ChevronLeft, ExternalLink, Info, Leaf, PiggyBank, Plus, Ticket, Trash2, Users, X } from 'lucide-react'
import { GOAL_COLORS, SAVING_TIPS, TRIPS, type Goal, type Tip, type Trip } from '../data'
import { useStore } from '../store'
import { Screen, Sheet, TrainIcon, cx } from '../components/ui'
import { Picto, type PictoName } from '../components/Picto'

const euro = (n: number) => `${n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })} €`
const goalIcon = { hand: 'football', plane: 'plane', home: 'house' } as const satisfies Record<Goal['icon'], PictoName>

const TABS = ['Épargne', 'Billets', 'Astuces'] as const
type Tab = (typeof TABS)[number]

/** Weeks until the deadline (at least 1) and how much to put aside each week to get there. */
function plan(goal: Goal) {
  const weeks = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (7 * 864e5)))
  const left = Math.max(0, goal.target - goal.saved)
  return { weeks, left, perWeek: Math.ceil((left / weeks) * 100) / 100 }
}

export default function Savings() {
  const navigate = useNavigate()
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('Épargne')
  const [creating, setCreating] = useState(false)
  const total = state.goals.reduce((n, g) => n + g.saved, 0)
  const target = state.goals.reduce((n, g) => n + g.target, 0)

  return (
    <Screen withNav>
      <header className="bg-white px-6 pb-5 pt-8 dark:bg-card-dark">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3" aria-label="Retour">
            <ChevronLeft className="h-7 w-7" />
            <h1 className="text-2xl font-semibold">Portefeuille</h1>
          </button>
          {tab === 'Épargne' && (
            <button onClick={() => setCreating(true)} aria-label="Nouvel objectif">
              <Plus className="h-8 w-8" strokeWidth={2.2} />
            </button>
          )}
        </div>

        <div className="mt-5 rounded-3xl bg-neutral-900 p-5 text-white dark:bg-raised-dark">
          <p className="text-sm text-white/70">Mis de côté pour tes aventures</p>
          <p className="mt-1 font-display text-4xl font-bold">{euro(total)}</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-sun transition-all duration-500" style={{ width: `${Math.min(100, (total / (target || 1)) * 100)}%` }} />
          </div>
          <p className="mt-2 flex justify-between text-xs text-white/70">
            <span>{state.goals.length} objectifs</span>
            <span>sur {euro(target)}</span>
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-neutral-100 p-1 dark:bg-raised-dark" role="tablist">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cx('h-10 rounded-full text-sm font-semibold', tab === t ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-500')}>
              {t}
              {t === 'Billets' && state.bookedTrips.length > 0 && ` (${state.bookedTrips.length})`}
            </button>
          ))}
        </div>
      </header>

      {tab === 'Épargne' && <Goals onCreate={() => setCreating(true)} />}
      {tab === 'Billets' && <Tickets />}
      {tab === 'Astuces' && <Tips />}

      <NewGoalSheet open={creating} onClose={() => setCreating(false)} />
    </Screen>
  )
}

function Goals({ onCreate }: { onCreate: () => void }) {
  const { state } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const [note, setNote] = useState(true)
  return (
    <div className="px-6 pt-5">
      {note && (
        <div className="mb-4 flex gap-3 rounded-2xl bg-sky/10 p-3.5 text-sm text-neutral-700 dark:text-neutral-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
          <p className="flex-1">Ton argent reste sur ton compte bancaire. Trippy t'aide à fixer un objectif, à savoir combien mettre de côté chaque semaine et à suivre où tu en es.</p>
          <button onClick={() => setNote(false)} aria-label="Masquer" className="self-start">
            <X className="h-4 w-4 text-neutral-400" />
          </button>
        </div>
      )}
      {state.goals.map((g, i) => (
        <GoalCard key={g.id} goal={g} first={i === 0} last={i === state.goals.length - 1} open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} />
      ))}
      {state.goals.length === 0 && (
        <button onClick={onCreate} className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-neutral-300 py-10 text-neutral-500 dark:border-neutral-600">
          <PiggyBank className="h-10 w-10" />
          Crée ton premier objectif
        </button>
      )}
    </div>
  )
}

function GoalCard({ goal, first, last, open, onToggle }: { goal: Goal; first: boolean; last: boolean; open: boolean; onToggle: () => void }) {
  const { saveToGoal, removeGoal } = useStore()
  const [amount, setAmount] = useState('')
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100))
  const { weeks, left, perWeek } = plan(goal)
  const light = goal.text === 'light'
  const trip = TRIPS.find((t) => t.id === goal.tripId)
  const chip = cx('rounded-full px-3 py-1.5 text-sm font-semibold', light ? 'bg-white/20' : 'bg-black/10')
  const value = Number(amount.replace(',', '.'))

  return (
    <article
      className={cx('relative overflow-hidden px-5 pb-5 pt-5', first ? 'rounded-t-3xl' : '-mt-3 rounded-t-3xl', last && 'rounded-b-3xl', light ? 'text-white' : 'text-neutral-900')}
      style={{ backgroundColor: goal.color }}
    >
      <Picto name={goalIcon[goal.icon]} className="pointer-events-none absolute -right-3 -top-2 h-28 w-28 rotate-12 text-black opacity-20" />
      <div className="relative flex items-center gap-2">
        <h2 className="text-xl font-semibold">{goal.name}</h2>
        {trip && <span className={chip.replace('py-1.5', 'py-0.5').replace('text-sm', 'text-xs')}>{trip.shortName}</span>}
      </div>
      <div className="relative mt-5 pr-14">
        <div className="flex justify-between text-sm">
          <span>{pct === 100 ? 'Objectif atteint 🎉' : `${weeks} semaines restantes`}</span>
          <span>{pct}%</span>
        </div>
        <div className={cx('mt-2 h-1.5 rounded-full', light ? 'bg-white/50' : 'bg-white/70')}>
          <div className="h-full rounded-full bg-neutral-900 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5">
          <span className="text-lg font-semibold">{euro(goal.saved)}</span> <span className="text-sm">sur {euro(goal.target)}</span>
        </p>
      </div>
      {left > 0 && (
        <p className="relative mt-2 text-sm">
          👉 Mets <strong>{euro(perWeek)}</strong> de côté par semaine pour y arriver.
        </p>
      )}
      <button onClick={onToggle} className="relative mt-3 text-sm font-semibold underline underline-offset-2" aria-expanded={open}>
        {open ? 'Fermer' : 'Mettre à jour'}
      </button>
      {open && (
        <form
          className="animate-fade-in relative mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (value > 0) saveToGoal(goal.id, value)
            setAmount('')
          }}
        >
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20, perWeek].filter((n, i, a) => n > 0 && a.indexOf(n) === i).map((n) => (
              <button type="button" key={n} onClick={() => saveToGoal(goal.id, n)} className={chip}>
                + {euro(n)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="Autre montant"
              aria-label="Montant mis de côté"
              className="h-11 min-w-0 flex-1 rounded-full bg-white/90 px-4 text-neutral-900 outline-none"
            />
            <button disabled={!(value > 0)} className="h-11 rounded-full bg-neutral-900 px-4 text-sm font-semibold text-white disabled:opacity-50">
              J'ai mis de côté
            </button>
          </div>
          <div className="flex justify-between text-sm">
            <button type="button" disabled={!(value > 0)} onClick={() => (saveToGoal(goal.id, -value), setAmount(''))} className="font-semibold disabled:opacity-50">
              − Retirer ce montant
            </button>
            <button type="button" onClick={() => removeGoal(goal.id)} className="flex items-center gap-1 opacity-80">
              <Trash2 className="h-4 w-4" /> Supprimer
            </button>
          </div>
        </form>
      )}
    </article>
  )
}

function Tickets() {
  const { state } = useStore()
  const trips = state.bookedTrips.map((id) => TRIPS.find((t) => t.id === id)).filter((t): t is Trip => !!t)
  if (trips.length === 0) {
    return (
      <div className="px-6 pt-10 text-center text-neutral-500">
        <Ticket className="mx-auto h-12 w-12" />
        <p className="mt-3">Ton carnet de billets est vide.</p>
        <p className="text-sm">Les voyages organisés que tu réserves apparaîtront ici, avec leur QR code.</p>
        <Link to="/discover" className="mt-5 inline-block rounded-full bg-sky px-6 py-3 font-semibold text-white">
          Trouver un voyage
        </Link>
      </div>
    )
  }
  return (
    <ul className="space-y-4 px-6 pt-5">
      {trips.map((t) => (
        <TicketCard key={t.id} trip={t} people={state.bookings[t.id]?.people ?? 1} from={state.city} />
      ))}
    </ul>
  )
}

function TicketCard({ trip, people, from }: { trip: Trip; people: number; from: string }) {
  const [qr, setQr] = useState('')
  const code = `TRIPPY-${trip.id.toUpperCase()}-${people}`
  useEffect(() => {
    QRCode.toDataURL(code, { margin: 0, width: 200 }).then(setQr, () => setQr(''))
  }, [code])
  const dark = trip.textOnColor === 'dark'
  return (
    <li className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-card-dark">
      <div className={cx('p-5', dark ? 'text-neutral-900' : 'text-white')} style={{ backgroundColor: trip.color }}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Voyage organisé · {trip.days} jours</p>
        <h3 className="mt-1 text-xl font-semibold">{trip.name}</h3>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-semibold">{from.split(',')[0]}</span>
          <span className="flex flex-1 items-center gap-2 opacity-80">
            <span className="h-px flex-1 border-t border-dashed border-current" />
            <TrainIcon className="h-4 w-4" />
            <span className="h-px flex-1 border-t border-dashed border-current" />
          </span>
          <span className="font-semibold">{trip.region}</span>
        </div>
      </div>
      <div className="relative flex items-center gap-4 p-5">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-page dark:bg-page-dark" />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-page dark:bg-page-dark" />
        <div className="flex-1 space-y-1.5 text-sm">
          <p className="flex items-center gap-2">
            <TrainIcon className="h-4 w-4" /> {trip.tags.transport} · {trip.travelTime}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" /> {people} voyageur{people > 1 ? 's' : ''} · {trip.bookPrice * people} €
          </p>
          <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Leaf className="h-4 w-4" /> {trip.tags.co2} par rapport à la voiture
          </p>
          <p className="pt-1 font-mono text-xs text-neutral-400">{code}</p>
        </div>
        {qr && <img src={qr} alt="QR code du billet" className="h-24 w-24 rounded-lg bg-white p-1.5" />}
      </div>
    </li>
  )
}

function Tips() {
  const [tag, setTag] = useState<Tip['tag'] | 'Tout'>('Tout')
  const tags = ['Tout', ...new Set(SAVING_TIPS.map((t) => t.tag))] as const
  const list = SAVING_TIPS.filter((t) => tag === 'Tout' || t.tag === tag)
  return (
    <div className="pt-5">
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-6">
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} className={cx('shrink-0 rounded-full px-4 py-2 text-sm', tag === t ? 'bg-sun font-semibold text-neutral-900' : 'bg-white dark:bg-raised-dark')}>
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-3 px-6">
        {list.map((t) => (
          <li key={t.id} className="rounded-2xl bg-white p-4 dark:bg-card-dark">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold">{t.title}</h3>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">{t.saving}</span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-neutral-600 dark:text-neutral-300">{t.body}</p>
            <a href={t.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-sky">
              Voir le site officiel <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mx-6 mt-4 text-xs text-neutral-400">Les conditions et les prix changent : vérifie toujours sur le site officiel.</p>
    </div>
  )
}

function NewGoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useStore()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('150')
  const [deadline, setDeadline] = useState(() => new Date(Date.now() + 120 * 864e5).toISOString().slice(0, 10))
  const [tripId, setTripId] = useState<string>()
  const [colorIdx, setColorIdx] = useState(0)
  const valid = name.trim() && Number(target) > 0 && deadline
  const preview = plan({ id: '', name, saved: 0, target: Number(target) || 0, deadline, color: '', text: 'dark', icon: 'plane' })
  const field = 'h-12 w-full rounded-xl bg-white px-4 outline-none ring-sky focus:ring-2 dark:bg-raised-dark'
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-semibold">Nouvel objectif</h2>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          addGoal({ id: crypto.randomUUID(), name: name.trim(), saved: 0, target: Number(target), deadline, tripId, ...GOAL_COLORS[colorIdx], icon: tripId ? 'plane' : 'hand' })
          setName('')
          setTripId(undefined)
          onClose()
        }}
      >
        <div>
          <p className="mb-2 text-sm font-medium">Pour un voyage Trippy ?</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {TRIPS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  const on = tripId !== t.id
                  setTripId(on ? t.id : undefined)
                  if (on) {
                    setName(t.shortName)
                    setTarget(String(t.bookPrice))
                  }
                }}
                className={cx('flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm', tripId === t.id ? 'bg-sky text-white' : 'bg-white dark:bg-raised-dark')}
              >
                <img src={t.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                {t.shortName} · {t.bookPrice} €
              </button>
            ))}
          </div>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (ex. Interrail 2027)" className={field} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">
            Montant (€)
            <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min="1" className={cx(field, 'mt-1')} />
          </label>
          <label className="text-sm font-medium">
            Pour le
            <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className={cx(field, 'mt-1')} />
          </label>
        </div>
        {valid && (
          <p className="rounded-xl bg-sky/10 px-4 py-3 text-sm">
            Soit <strong>{euro(preview.perWeek)} par semaine</strong> pendant {preview.weeks} semaines.
          </p>
        )}
        <div className="flex gap-3">
          {GOAL_COLORS.map((c, i) => (
            <button
              type="button"
              key={c.color}
              aria-label={`Couleur ${i + 1}`}
              onClick={() => setColorIdx(i)}
              className={cx('h-10 w-10 rounded-full', i === colorIdx && 'ring-4 ring-neutral-900 ring-offset-2 dark:ring-white')}
              style={{ backgroundColor: c.color }}
            />
          ))}
        </div>
        <button disabled={!valid} className="h-14 w-full rounded-full bg-sky text-lg font-semibold text-white disabled:opacity-40">
          Créer l'objectif
        </button>
      </form>
    </Sheet>
  )
}

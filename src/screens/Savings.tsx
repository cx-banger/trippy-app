import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Hand, House, Navigation, Plus } from 'lucide-react'
import { GOAL_COLORS, type Goal } from '../data'
import { useStore } from '../store'
import { Screen, Sheet, cx } from '../components/ui'

const money = (n: number) => `$${n.toFixed(2).replace('.', ',')}`
const goalIcon = { hand: Hand, plane: Navigation, home: House } satisfies Record<Goal['icon'], unknown>

export default function Savings() {
  const navigate = useNavigate()
  const { state, addToGoal, addGoal } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <Screen withNav>
      <header className="bg-white px-6 pb-9 pt-8 dark:bg-card-dark">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3" aria-label="Retour">
            <ChevronLeft className="h-7 w-7" />
            <h1 className="text-2xl font-semibold">Savings</h1>
          </button>
          <button onClick={() => setCreating(true)} aria-label="Nouvel objectif">
            <Plus className="h-8 w-8" strokeWidth={2.2} />
          </button>
        </div>
        <p className="mt-2 pl-10 text-[13px] text-sky">Ici vous pouvez suivre votre Epargne pour vos futures Aventures</p>
      </header>

      <div className="-mt-5 px-6">
        {state.goals.map((g, i) => (
          <GoalCard key={g.id} goal={g} first={i === 0} last={i === state.goals.length - 1} open={open === g.id} onToggle={() => setOpen(open === g.id ? null : g.id)} onAdd={(n) => addToGoal(g.id, n)} />
        ))}
      </div>

      <NewGoalSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(goal) => {
          addGoal(goal)
          setCreating(false)
        }}
      />
    </Screen>
  )
}

function GoalCard({ goal, first, last, open, onToggle, onAdd }: { goal: Goal; first: boolean; last: boolean; open: boolean; onToggle: () => void; onAdd: (n: number) => void }) {
  const pct = Math.round((goal.saved / goal.target) * 100)
  const light = goal.text === 'light'
  const Icon = goalIcon[goal.icon]
  return (
    <article
      className={cx('relative overflow-hidden px-5 pb-5 pt-5', first ? 'rounded-t-lg' : '-mt-1 rounded-t-lg', last && 'rounded-b-lg', light ? 'text-white' : 'text-neutral-900')}
      style={{ backgroundColor: goal.color }}
    >
      <Icon className="pointer-events-none absolute -right-3 -top-2 h-28 w-28 rotate-12 opacity-20" strokeWidth={2.4} color="#000" />
      <h2 className="relative text-xl font-semibold">{goal.name}</h2>
      <div className="relative mt-6 pr-16">
        <div className="flex justify-between text-sm">
          <span className={light ? 'text-white/95' : ''}>Balance</span>
          <span>{pct}%</span>
        </div>
        <div className={cx('mt-2 h-1.5 rounded-full', light ? 'bg-white/60' : 'bg-white/70')}>
          <div className="h-full rounded-full bg-neutral-900 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <p>
            <span className="text-lg font-semibold">{money(goal.saved)}</span> <span className="text-sm">of {money(goal.target)}</span>
          </p>
          <span className="text-sm">{goal.left}</span>
        </div>
      </div>
      <button onClick={onToggle} className="relative mt-4 text-sm font-semibold" aria-expanded={open}>
        {open ? 'Hide detail' : 'See detail'}
      </button>
      {open && (
        <div className="animate-fade-in relative mt-4 flex flex-wrap gap-2">
          {[5, 10, 20].map((n) => (
            <button key={n} onClick={() => onAdd(n)} className={cx('rounded-full px-3 py-1.5 text-sm font-semibold', light ? 'bg-white/20' : 'bg-black/10')}>
              + ${n}
            </button>
          ))}
          <button onClick={() => onAdd(-5)} className={cx('rounded-full px-3 py-1.5 text-sm font-semibold', light ? 'bg-white/20' : 'bg-black/10')}>
            − $5
          </button>
          <p className="w-full pt-1 text-sm opacity-80">Il reste {money(goal.target - goal.saved)} à épargner.</p>
        </div>
      )}
    </article>
  )
}

function NewGoalSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (g: Goal) => void }) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('100')
  const [colorIdx, setColorIdx] = useState(0)
  const valid = name.trim() && Number(target) > 0
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-semibold">Nouvel objectif</h2>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          onCreate({ id: crypto.randomUUID(), name: name.trim(), saved: 0, target: Number(target), left: '1 year left', ...GOAL_COLORS[colorIdx], icon: 'plane' })
          setName('')
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (ex. Japon 2027)" className="h-12 w-full rounded-xl bg-white px-4 outline-none dark:bg-raised-dark" />
        <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" min="1" placeholder="Objectif en $" className="h-12 w-full rounded-xl bg-white px-4 outline-none dark:bg-raised-dark" />
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
          Créer
        </button>
      </form>
    </Sheet>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES, ME, type CategoryFilter } from '../data'
import { Picto, type PictoName } from './Picto'

// eslint-disable-next-line react-refresh/only-export-components
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

/** Train pictogram (SNCF charter) shown next to trip names and travel times. */
export function TrainIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return <Picto name="train" className={className} />
}

/** Empty list message with an SNCF-charter illustration. */
export function EmptyState({ illustration, children }: { illustration: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center text-neutral-500">
      <img src={illustration} alt="" className="mb-4 h-36 w-auto max-w-[80%] object-contain" />
      <p className="max-w-xs text-[15px]">{children}</p>
    </div>
  )
}

/** Phone-sized frame on desktop, full screen on a phone. Every screen renders inside it. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div
        id="phone"
        className="relative isolate h-dvh w-full max-w-[430px] overflow-hidden bg-page dark:bg-page-dark sm:my-6 sm:h-[min(932px,calc(100dvh-48px))] sm:rounded-[48px] sm:shadow-2xl sm:ring-8 sm:ring-neutral-900"
      >
        {children}
      </div>
    </div>
  )
}

/** Scrollable screen body. `withNav` leaves room for the bottom tab bar. */
export function Screen({ children, withNav = false, className }: { children: ReactNode; withNav?: boolean; className?: string }) {
  return (
    <main className={cx('no-scrollbar h-full overflow-y-auto overscroll-contain pt-[env(safe-area-inset-top)]', withNav && 'pb-24', className)}>
      {children}
    </main>
  )
}

const tabs: { to: string; icon: PictoName; label: string }[] = [
  { to: '/', icon: 'house', label: 'Accueil' },
  { to: '/savings', icon: 'piggy', label: 'Portefeuille' },
  { to: '/feed', icon: 'compass', label: 'Feed' },
  { to: '/discover', icon: 'chart', label: 'Découvrir' },
]

export function BottomNav() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] bg-white/95 pb-[max(env(safe-area-inset-bottom),8px)] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur dark:bg-[#3a3b3c]/95">
      <ul className="flex items-center justify-around px-4 pt-3">
        {tabs.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end
              aria-label={label}
              className={({ isActive }) =>
                cx(
                  'grid h-12 w-12 place-items-center rounded-full transition',
                  isActive ? 'text-neutral-900 dark:bg-white dark:text-neutral-900' : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-200',
                )
              }
            >
              <Picto name={icon} className="h-7 w-7" />
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink to="/messages" aria-label="Messages" className={({ isActive }) => cx('grid h-12 w-12 place-items-center rounded-full', isActive && 'ring-2 ring-neutral-900 dark:ring-white')}>
            <img src={ME.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          </NavLink>
        </li>
      </ul>
      <div className="mx-auto mt-2 hidden h-1.5 w-32 rounded-full bg-neutral-900 dark:bg-white sm:block" aria-hidden />
    </nav>
  )
}

export function CategoryChips({ value, onChange, className }: { value: CategoryFilter; onChange: (c: CategoryFilter) => void; className?: string }) {
  return (
    <div className={cx('no-scrollbar -mx-1 flex gap-0 overflow-x-auto px-1', className)} role="tablist">
      {CATEGORIES.map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={value === c}
          onClick={() => onChange(c)}
          className={cx(
            '-ml-1 shrink-0 rounded-full px-5 py-2.5 text-[13px] tracking-wide transition first:ml-0',
            value === c ? 'z-10 bg-sun px-7 font-medium text-neutral-900' : 'bg-white text-neutral-800 dark:bg-raised-dark dark:text-neutral-200',
          )}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  onFilter,
  className,
  tone = 'white',
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  onFilter?: () => void
  className?: string
  tone?: 'white' | 'grey'
}) {
  const surface = tone === 'white' ? 'bg-white dark:bg-card-dark' : 'bg-neutral-300/70 dark:bg-card-dark'
  return (
    <div className={cx('flex gap-3', className)}>
      <label className={cx('flex h-11 flex-1 items-center gap-3 rounded-xl px-4', surface)}>
        <Search className="h-5 w-5 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-neutral-700 dark:placeholder:text-neutral-300"
        />
        {value && (
          <button onClick={() => onChange('')} aria-label="Effacer">
            <X className="h-4 w-4 text-neutral-500" />
          </button>
        )}
      </label>
      {onFilter && (
        <button onClick={onFilter} aria-label="Filtres" className={cx('grid h-11 w-11 place-items-center rounded-xl', surface)}>
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

/** Bottom sheet rendered inside the phone frame. */
export function Sheet({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Fermer" className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className={cx('animate-slide-up relative max-h-[92%] overflow-y-auto rounded-t-[36px] bg-page px-6 pb-[max(env(safe-area-inset-bottom),24px)] pt-4 dark:bg-card-dark', className)}
      >
        <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600" />
        {children}
      </div>
    </div>
  )
}

/** Small transient confirmation message. */
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2400)
    return () => clearTimeout(t)
  }, [message])
  const node = message ? (
    <div role="status" className="animate-fade-in pointer-events-none absolute inset-x-6 top-[max(env(safe-area-inset-top),20px)] z-[60] rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white shadow-lg dark:bg-white dark:text-neutral-900">
      {message}
    </div>
  ) : null
  return { show: setMessage, node }
}

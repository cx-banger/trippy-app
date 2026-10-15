import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import { BatteryFull, Moon, RotateCw, Signal, Smartphone, Sun, Wifi } from 'lucide-react'
import { cx } from './components/ui'

// Screens shown side by side on desktop; each one is the real app running in an iframe.
const SCREENS = [
  { path: '', label: 'Accueil' },
  { path: 'trip/biarritz', label: 'Détails du voyage' },
  { path: 'discover', label: 'Découvrir' },
  { path: 'feed', label: 'Feed' },
  { path: 'savings', label: 'Portefeuille' },
  { path: 'messages', label: 'Messages' },
  { path: 'chat/paysbasque', label: 'Groupe : sondage + fichiers' },
  { path: 'trip/marseille', label: 'Réservation' },
]

const SIZES = { Petit: 0.62, Moyen: 0.78, 'Taille réelle': 1 } as const
type Size = keyof typeof SIZES
type Theme = 'light' | 'dark'

// iPhone 14-ish viewport inside a bezel
const SCREEN_W = 390
const SCREEN_H = 844
const BEZEL = 12
const STATUS_H = 44 // fake iOS status bar above the app

const PREFS_KEY = 'trippy-preview'

function loadPrefs(): { size: Size; theme: Theme } {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
    return { size: p.size in SIZES ? p.size : 'Moyen', theme: p.theme === 'dark' ? 'dark' : 'light' }
  } catch {
    return { size: 'Moyen', theme: 'light' }
  }
}

export default function DesktopPreview() {
  const [{ size, theme }, setPrefs] = useState(loadPrefs)
  const [reloadKey, setReloadKey] = useState(0)
  const [qr, setQr] = useState('')
  const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ size, theme }))
    } catch {
      // ignore: preferences are a convenience only
    }
  }, [size, theme])

  useEffect(() => {
    QRCode.toDataURL(appUrl, { margin: 1, width: 240, color: { dark: '#1f1f1f', light: '#ffffff' } }).then(setQr, () => setQr(''))
  }, [appUrl])

  const scale = SIZES[size]
  const set = (p: Partial<{ size: Size; theme: Theme }>) => setPrefs((s) => ({ ...s, ...p }))

  return (
    <div className="min-h-full bg-[#1c1c1c] px-8 pb-16 pt-6 text-white">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <h1 className="font-display text-2xl font-bold">Trippy – aperçu mobile</h1>
        <p className="text-sm text-neutral-400">Les écrans sont interactifs : clique, fais défiler, like, vote… tout se synchronise entre les téléphones.</p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Group>
            <Btn active={theme === 'light'} onClick={() => set({ theme: 'light' })}>
              <Sun className="h-4 w-4" /> Clair
            </Btn>
            <Btn active={theme === 'dark'} onClick={() => set({ theme: 'dark' })}>
              <Moon className="h-4 w-4" /> Sombre
            </Btn>
          </Group>
          <Group>
            {(Object.keys(SIZES) as Size[]).map((s) => (
              <Btn key={s} active={size === s} onClick={() => set({ size: s })}>
                {s}
              </Btn>
            ))}
          </Group>
          <Btn onClick={() => setReloadKey((k) => k + 1)}>
            <RotateCw className="h-4 w-4" /> Recharger
          </Btn>
        </div>
      </header>

      <section className="mt-6 flex items-center gap-5 rounded-2xl bg-[#262626] p-4">
        {qr && <img src={qr} alt="QR code vers l'appli" className="h-24 w-24 rounded-lg" />}
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-semibold">
            <Smartphone className="h-5 w-5 text-sun" /> Trippy est une appli mobile
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Scanne le QR code avec ton téléphone, ou ouvre <span className="text-white">{appUrl.replace(/^https?:\/\//, '')}</span>, puis « Ajouter à l'écran
            d'accueil » pour l'installer.
          </p>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-10">
        {SCREENS.map((s) => (
          <figure key={s.path} className="flex flex-col items-center gap-3">
            <Phone src={`${import.meta.env.BASE_URL}${s.path}?theme=${theme}`} scale={scale} reloadKey={reloadKey} title={s.label} dark={theme === 'dark'} />
            <figcaption className="text-sm font-semibold text-neutral-300">{s.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

function Phone({ src, scale, reloadKey, title, dark }: { src: string; scale: number; reloadKey: number; title: string; dark: boolean }) {
  const w = SCREEN_W + BEZEL * 2
  const h = SCREEN_H + BEZEL * 2
  return (
    <div style={{ width: w * scale, height: h * scale }}>
      <div
        className="origin-top-left rounded-[56px] bg-[#0b0b0b] shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/15"
        style={{ width: w, height: h, padding: BEZEL, transform: `scale(${scale})` }}
      >
        <div className={cx('flex h-full w-full flex-col overflow-hidden rounded-[44px]', dark ? 'bg-page-dark text-white' : 'bg-page text-neutral-900')}>
          <div className="relative flex shrink-0 items-center justify-between px-8 text-[15px] font-semibold" style={{ height: STATUS_H }}>
            9:41
            <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1.5">
              <Signal className="h-4 w-4" />
              <Wifi className="h-4 w-4" />
              <BatteryFull className="h-5 w-5" />
            </span>
          </div>
          <iframe key={reloadKey} src={src} title={title} className="w-full flex-1 border-0" loading="lazy" />
        </div>
      </div>
    </div>
  )
}

function Group({ children }: { children: ReactNode }) {
  return <div className="flex gap-1 rounded-xl bg-[#2a2a2a] p-1">{children}</div>
}

function Btn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition',
        active ? 'bg-sun text-neutral-900' : 'bg-[#333] text-neutral-200 hover:bg-[#3d3d3d]',
      )}
    >
      {children}
    </button>
  )
}

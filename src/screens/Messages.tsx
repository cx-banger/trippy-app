import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Check, Crosshair, EyeOff, Globe, Lock, Plus, Radio, Shield, SquarePen, X } from 'lucide-react'
import { BRANDS, CONTACTS, GROUP_FILTERS, conversationName, type Conversation } from '../data'
import { useStore } from '../store'
import { Screen, SearchField, cx } from '../components/ui'

const TABS = ['Chats', 'Groups', 'Travel'] as const
type Tab = (typeof TABS)[number]

export default function Messages() {
  const navigate = useNavigate()
  const { state, toggleFollow, createChannel } = useStore()
  const [tab, setTab] = useState<Tab>('Chats')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof GROUP_FILTERS)[number]>('All')
  const [channelStep, setChannelStep] = useState<0 | 1 | 2>(0)
  const [channelName, setChannelName] = useState('')
  const [banner, setBanner] = useState(true)

  const q = query.trim().toLowerCase()
  const chats = state.conversations.filter((c) => !c.channelName && c.id !== 'toscane' && conversationName(c).toLowerCase().includes(q))
  const groups = state.conversations.filter((c) => c.channelName || c.id === 'toscane')
  const brands = Object.values(BRANDS).filter((b) => b.id !== 'europe')
  const sortedBrands = filter === 'Popular' ? brands.slice().sort((a, b) => parseFloat(b.followers) - parseFloat(a.followers)) : filter === 'New' ? brands.slice().reverse() : brands

  return (
    <Screen withNav>
      <div className="bg-neutral-50 dark:bg-card-dark">
        <header className="flex items-center justify-between px-5 pb-3 pt-7">
          <button onClick={() => navigate(-1)} aria-label="Retour">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 pl-7 font-display text-2xl font-extrabold tracking-tight">Messages</h1>
          <button onClick={() => setChannelStep(1)} aria-label="Nouveau canal">
            <SquarePen className="h-6 w-6" />
          </button>
        </header>
        <div className="flex border-b-2 border-neutral-200 dark:border-neutral-600" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx('relative flex-1 py-3 text-base font-medium', tab === t ? '' : 'text-neutral-400')}
            >
              {t}
              {tab === t && <span className="absolute inset-x-8 -bottom-0.5 h-0.5 bg-neutral-900 dark:bg-white" />}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Chats' && (
        <>
          <div className="px-5 pt-5">
            <SearchField tone="grey" value={query} onChange={setQuery} placeholder="Search Message" className="[&_label]:rounded-full" />
          </div>
          <ul className="mt-2">
            {chats.map((c) => (
              <ConversationRow key={c.id} c={c} following={state.following.includes(c.contact)} onFollow={() => toggleFollow(c.contact)} />
            ))}
            {chats.length === 0 && <li className="py-12 text-center text-neutral-500">Aucune conversation trouvée.</li>}
          </ul>
        </>
      )}

      {tab !== 'Chats' && (
        <>
          <div className="no-scrollbar mt-5 flex gap-0 overflow-x-auto px-5">
            {GROUP_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cx('-ml-1 flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm first:ml-0', filter === f ? 'z-10 bg-violet text-white' : 'bg-neutral-300/80 text-neutral-900')}
              >
                {f === 'Indépendants' && <Globe className="h-4 w-4" />}
                {f}
              </button>
            ))}
          </div>
          <ul className="mt-2">
            {tab === 'Groups' && groups.map((c) => <ConversationRow key={c.id} c={c} />)}
            {sortedBrands.map((b) => {
              const following = state.following.includes(b.id)
              return (
                <li key={b.id} className="flex items-center gap-4 px-5 py-2.5">
                  <img src={b.logo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <span className="truncate">{b.name}</span>
                      <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />
                    </p>
                    <p className="text-sm">{b.followers} followers</p>
                  </div>
                  <button onClick={() => toggleFollow(b.id)} aria-label={following ? 'Ne plus suivre' : 'Suivre'} className="text-teal">
                    {following ? <Check className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {channelStep > 0 && (
        <div className="animate-fade-in absolute inset-0 z-50 flex flex-col bg-page dark:bg-page-dark">
          {banner && (
            <div className="mt-[max(env(safe-area-inset-top),40px)] flex items-center gap-4 bg-neutral-200/70 px-6 py-3 dark:bg-raised-dark">
              <Crosshair className="h-7 w-7 rounded-full bg-ink-blue p-1.5 text-white" />
              <span className="flex-1">Taking a new look</span>
              <button onClick={() => setBanner(false)} aria-label="Masquer">
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
          )}
          <div className="animate-slide-up mt-6 flex-1 overflow-y-auto rounded-t-[32px] bg-[#f0f0f0] px-6 pb-8 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:bg-card-dark">
            <div className="mx-auto h-1 w-24 rounded-full bg-neutral-300 dark:bg-neutral-500" />
            <div className="mt-5 flex items-center gap-4 text-neutral-600 dark:text-neutral-300">
              <button onClick={() => setChannelStep(0)} aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
              <Lock className="h-4 w-4 text-neutral-900 dark:text-white" fill="currentColor" />
              <span className="text-sm">Messages and calls are secure &amp; encrypted.</span>
            </div>

            {channelStep === 1 ? (
              <>
                <div className="mx-auto mt-8 grid h-24 w-24 place-items-center rounded-full bg-teal">
                  <Radio className="h-14 w-14 rounded-full bg-white/95 p-2.5 text-teal" strokeWidth={2.4} />
                </div>
                <h2 className="mt-6 text-center text-2xl font-semibold leading-tight text-teal dark:text-white">Create a channel to reach unlimited followers</h2>
                <ul className="mt-6 space-y-5">
                  {CHANNEL_POINTS.map(({ icon, title, body }) => (
                    <li key={title} className="flex items-center gap-4">
                      {icon}
                      <div>
                        <p>{title}</p>
                        <p className="text-sm leading-snug text-neutral-500 dark:text-neutral-400">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setChannelStep(2)} className="mt-8 h-12 w-full rounded-full bg-teal text-base font-medium text-white">
                  Continue
                </button>
              </>
            ) : (
              <form
                className="mt-8"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!channelName.trim()) return
                  const id = createChannel(channelName.trim())
                  setChannelName('')
                  setChannelStep(0)
                  navigate(`/chat/${id}`)
                }}
              >
                <h2 className="text-2xl font-semibold">Nomme ta chaîne</h2>
                <p className="mt-2 text-neutral-500">Tu pourras le modifier plus tard.</p>
                <input
                  autoFocus
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="ex. Surf à Biarritz"
                  className="mt-6 h-12 w-full rounded-2xl bg-white px-4 text-base outline-none ring-teal focus:ring-2 dark:bg-raised-dark"
                />
                <button disabled={!channelName.trim()} className="mt-6 h-12 w-full rounded-full bg-teal text-base font-medium text-white disabled:opacity-40">
                  Create channel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Screen>
  )
}

const CHANNEL_POINTS = [
  { icon: <Globe className="h-6 w-6 shrink-0 text-teal" />, title: 'Anyone can discover your channel', body: 'Channels are public, so anyone can find them and see 30 days of history.' },
  { icon: <EyeOff className="h-6 w-6 shrink-0 text-teal" />, title: 'People see your channel, not you', body: "Your phone number, profile picture and name aren't shown to followers." },
  { icon: <Shield className="h-6 w-6 shrink-0 text-teal" fill="currentColor" />, title: "You're responsible for your channel", body: 'Your channel needs to follow our guidelines and is reviewed against them.' },
]


function ConversationRow({ c, following, onFollow }: { c: Conversation; following?: boolean; onFollow?: () => void }) {
  const contact = CONTACTS[c.contact]
  return (
    <li className="flex items-center">
      <Link to={`/chat/${c.id}`} className="flex min-w-0 flex-1 items-center gap-4 py-2.5 pl-5 pr-2 active:bg-black/5 dark:active:bg-white/5">
        {contact ? (
          <img src={contact.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal text-white">
            <Radio className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cx('flex items-center gap-1.5 text-base', c.unread > 0 || c.boldPreview ? 'font-semibold' : 'font-medium')}>
            <span className="truncate">{conversationName(c)}</span>
            {contact?.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />}
          </p>
          <p className={cx('truncate text-sm', c.boldPreview && 'font-semibold')}>{c.preview}</p>
        </div>
        {!c.followable && (
          <div className="flex shrink-0 flex-col items-end gap-1 self-start pt-1.5">
            <span className="text-xs text-neutral-500">{c.time}</span>
            {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-xs text-white">{c.unread}</span>}
          </div>
        )}
      </Link>
      {c.followable ? (
        <button onClick={onFollow} aria-label={following ? 'Ne plus suivre' : 'Suivre'} className="pr-5 text-teal">
          {following ? <Check className="h-6 w-6" /> : <Plus className="h-7 w-7" />}
        </button>
      ) : (
        <span className="pr-3" />
      )}
    </li>
  )
}

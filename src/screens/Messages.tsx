import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, Check, EyeOff, Globe, Link2, Lock, Plus, Radio, Shield, SquarePen, Users } from 'lucide-react'
import { BRANDS, CHANNEL_FILTERS, CONTACTS, KIND_LABEL, ME, TRIPS, conversationAvatar, conversationName, type Conversation } from '../data'
import { useStore } from '../store'
import { Screen, SearchField, Sheet, cx, useToast } from '../components/ui'

const TABS = ['Discussions', 'Groupes', 'Chaînes'] as const
type Tab = (typeof TABS)[number]


export default function Messages() {
  const navigate = useNavigate()
  const { state, toggleFollow, openChannel } = useStore()
  const [tab, setTab] = useState<Tab>('Discussions')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof CHANNEL_FILTERS)[number]>('Tous')
  const [sheet, setSheet] = useState<null | 'menu' | 'group' | 'channel'>(null)
  const toast = useToast()

  const q = query.trim().toLowerCase()
  const matches = (c: Conversation) => conversationName(c).toLowerCase().includes(q)
  const byKind = (kind: Conversation['kind']) => state.conversations.filter((c) => c.kind === kind && matches(c))
  const chats = byKind('direct')
  const groups = byKind('group')
  const myChannels = byKind('channel').filter((c) => c.with === 'me' || state.following.includes(c.with))
  const unread = (kind: Conversation['kind']) => state.conversations.filter((c) => c.kind === kind && c.unread > 0).length

  const brands = Object.values(BRANDS).filter(
    (b) =>
      b.name.toLowerCase().includes(q) &&
      (filter === 'Tous' ||
        filter === 'Populaires' ||
        (filter === 'Offices de tourisme' && b.kind === 'office') ||
        (filter === 'Guides certifiés' && b.kind === 'guide') ||
        (filter === 'Partenaires' && b.kind === 'partner')),
  )
  if (filter === 'Populaires') brands.sort((a, b) => parseFollowers(b.followers) - parseFollowers(a.followers))

  const openBrand = (id: string) => {
    openChannel(id)
    navigate(`/chat/ch-${id}`)
  }

  return (
    <Screen withNav>
      <div className="sticky top-0 z-20 bg-neutral-50/95 backdrop-blur dark:bg-card-dark/95">
        <header className="flex items-center gap-4 px-5 pb-3 pt-7">
          <button onClick={() => navigate(-1)} aria-label="Retour">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="flex-1 font-display text-2xl font-extrabold tracking-tight">Messages</h1>
          <button onClick={() => setSheet('menu')} aria-label="Nouveau" className="grid h-10 w-10 place-items-center rounded-full bg-teal text-white">
            <SquarePen className="h-5 w-5" />
          </button>
        </header>
        <div className="flex border-b-2 border-neutral-200 dark:border-neutral-600" role="tablist">
          {TABS.map((t) => {
            const n = unread(t === 'Discussions' ? 'direct' : t === 'Groupes' ? 'group' : 'channel')
            return (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cx('relative flex flex-1 items-center justify-center gap-1.5 py-3 text-[15px] font-medium', tab !== t && 'text-neutral-400')}
              >
                {t}
                {n > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-[11px] text-white">{n}</span>}
                {tab === t && <span className="absolute inset-x-6 -bottom-0.5 h-0.5 bg-neutral-900 dark:bg-white" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 pt-4">
        <SearchField tone="grey" value={query} onChange={setQuery} placeholder={tab === 'Chaînes' ? 'Rechercher une chaîne' : 'Rechercher'} className="[&_label]:rounded-full" />
      </div>

      {tab === 'Discussions' && (
        <ul className="mt-2">
          {chats.map((c) => (
            <ConversationRow key={c.id} c={c} />
          ))}
          {chats.length === 0 && <Empty>Aucune conversation trouvée.</Empty>}
        </ul>
      )}

      {tab === 'Groupes' && (
        <>
          <button onClick={() => setSheet('group')} className="mx-5 mt-4 flex w-[calc(100%-40px)] items-center gap-4 rounded-2xl bg-sun p-4 text-left text-neutral-900">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-neutral-900 text-sun">
              <Users className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold">Organiser un voyage en groupe</span>
              <span className="text-sm">Sondages, fichiers partagés et budget au même endroit</span>
            </span>
          </button>
          <ul className="mt-2">
            {groups.map((c) => (
              <ConversationRow key={c.id} c={c} />
            ))}
            {groups.length === 0 && <Empty>Aucun groupe trouvé.</Empty>}
          </ul>
        </>
      )}

      {tab === 'Chaînes' && (
        <>
          {myChannels.length > 0 && (
            <>
              <SectionTitle>Mes chaînes</SectionTitle>
              <ul>
                {myChannels.map((c) => (
                  <ConversationRow key={c.id} c={c} />
                ))}
              </ul>
            </>
          )}
          <SectionTitle
            action={
              <button onClick={() => setSheet('channel')} className="text-sm font-semibold text-teal">
                + Créer
              </button>
            }
          >
            Découvrir des chaînes
          </SectionTitle>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
            {CHANNEL_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cx('shrink-0 rounded-full px-4 py-2 text-sm', filter === f ? 'bg-violet text-white' : 'bg-neutral-200 text-neutral-900 dark:bg-raised-dark dark:text-neutral-100')}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="mt-2">
            {brands.map((b) => {
              const following = state.following.includes(b.id)
              return (
                <li key={b.id} className="flex items-center gap-4 px-5 py-2.5">
                  <button onClick={() => openBrand(b.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <img src={b.logo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className="truncate">{b.name}</span>
                        <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />
                      </span>
                      <span className="block truncate text-sm text-neutral-500 dark:text-neutral-400">
                        {KIND_LABEL[b.kind]} · {b.followers} abonnés
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => toggleFollow(b.id)}
                    className={cx(
                      'h-9 shrink-0 rounded-full px-4 text-sm font-semibold',
                      following ? 'bg-neutral-200 text-neutral-700 dark:bg-raised-dark dark:text-neutral-200' : 'bg-teal text-white',
                    )}
                  >
                    {following ? 'Suivi' : 'Suivre'}
                  </button>
                </li>
              )
            })}
            {brands.length === 0 && <Empty>Aucune chaîne trouvée.</Empty>}
          </ul>
          <p className="mx-5 mt-4 rounded-2xl bg-white p-4 text-sm text-neutral-600 dark:bg-card-dark dark:text-neutral-300">
            <Shield className="mb-1 h-5 w-5 text-teal" />
            Les chaînes officielles sont tenues par des offices de tourisme, des guides certifiés et des établissements partenaires vérifiés par Trippy.
          </p>
        </>
      )}

      <Sheet open={sheet === 'menu'} onClose={() => setSheet(null)}>
        <div className="space-y-2 pb-2">
          <MenuItem icon={<Users className="h-5 w-5" />} title="Nouveau groupe de voyage" body="Organise un trip avec tes amis Trippy" onClick={() => setSheet('group')} />
          <MenuItem icon={<Radio className="h-5 w-5" />} title="Nouvelle chaîne" body="Partage tes conseils, en public ou en privé" onClick={() => setSheet('channel')} />
          <MenuItem
            icon={<Link2 className="h-5 w-5" />}
            title="Inviter un ami sur Trippy"
            body="L'inscription est gratuite"
            onClick={() => {
              navigator.clipboard?.writeText(new URL(import.meta.env.BASE_URL, window.location.origin).href).catch(() => {})
              setSheet(null)
              toast.show("Lien d'invitation copié")
            }}
          />
        </div>
      </Sheet>
      <NewGroupSheet open={sheet === 'group'} onClose={() => setSheet(null)} />
      <NewChannelSheet open={sheet === 'channel'} onClose={() => setSheet(null)} />
      {toast.node}
    </Screen>
  )
}

const parseFollowers = (f: string) => parseFloat(f) * (f.endsWith('M') ? 1e6 : f.endsWith('K') ? 1e3 : 1)

function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pb-2 pt-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{children}</h2>
      {action}
    </div>
  )
}

function Empty({ children }: { children: string }) {
  return <li className="list-none py-12 text-center text-neutral-500">{children}</li>
}

function MenuItem({ icon, title, body, onClick }: { icon: ReactNode; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left dark:bg-raised-dark">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 text-teal">{icon}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{body}</span>
      </span>
    </button>
  )
}

/** Overlapping member avatars, for group rows and the chat header. */
export function MemberStack({ ids, size = 'h-7 w-7' }: { ids: string[]; size?: string }) {
  const shown = ['me', ...ids].slice(0, 3)
  return (
    <span className="flex -space-x-2">
      {shown.map((id) => (
        <img key={id} src={id === 'me' ? ME.avatar : CONTACTS[id]?.avatar} alt="" className={cx(size, 'rounded-full object-cover ring-2 ring-page dark:ring-page-dark')} />
      ))}
    </span>
  )
}

function ConversationRow({ c }: { c: Conversation }) {
  const avatar = conversationAvatar(c)
  const verified = c.kind === 'channel' && c.with !== 'me'
  const trip = TRIPS.find((t) => t.id === c.tripId)
  return (
    <li>
      <Link to={`/chat/${c.id}`} className="flex items-center gap-4 px-5 py-2.5 active:bg-black/5 dark:active:bg-white/5">
        {c.kind === 'group' ? (
          <span className="relative h-12 w-12 shrink-0">
            {trip ? (
              <img src={trip.photo} alt="" className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun text-neutral-900">
                <Users className="h-6 w-6" />
              </span>
            )}
            <span className="absolute -bottom-1.5 -right-2">
              <MemberStack ids={c.members ?? []} size="h-5 w-5" />
            </span>
          </span>
        ) : avatar ? (
          <img src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal text-white">
            {c.visibility === 'private' ? <Lock className="h-5 w-5" /> : <Radio className="h-6 w-6" />}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className={cx('flex items-center gap-1.5 text-base', c.unread > 0 ? 'font-semibold' : 'font-medium')}>
            <span className="truncate">{conversationName(c)}</span>
            {verified && <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />}
          </p>
          <p className={cx('truncate text-sm', c.unread > 0 ? 'font-semibold' : 'text-neutral-500 dark:text-neutral-400')}>
            {c.kind === 'group' && <span className="font-normal">{(c.members?.length ?? 0) + 1} membres · </span>}
            {c.preview}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 self-start pt-1.5">
          <span className="text-xs text-neutral-500">{c.time}</span>
          {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-xs text-white">{c.unread}</span>}
        </div>
      </Link>
    </li>
  )
}

/** Pick friends among Trippy accounts only. */
export function ContactPicker({ selected, onToggle, exclude = [] }: { selected: string[]; onToggle: (id: string) => void; exclude?: string[] }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = Object.values(CONTACTS).filter((c) => !exclude.includes(c.id) && `${c.name} ${c.handle}`.toLowerCase().includes(q))
  return (
    <div>
      <SearchField value={query} onChange={setQuery} placeholder="Nom ou @pseudo Trippy" />
      <p className="mt-2 px-1 text-xs text-neutral-500">Seuls les membres Trippy peuvent être ajoutés. L'inscription est gratuite.</p>
      <ul className="mt-2 max-h-60 overflow-y-auto">
        {list.map((c) => {
          const on = selected.includes(c.id)
          return (
            <li key={c.id}>
              <button type="button" onClick={() => onToggle(c.id)} className="flex w-full items-center gap-3 py-2 text-left" aria-pressed={on}>
                <img src={c.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="text-sm text-neutral-500">{c.handle}</span>
                </span>
                <span className={cx('grid h-6 w-6 place-items-center rounded-full border-2', on ? 'border-teal bg-teal text-white' : 'border-neutral-300 dark:border-neutral-500')}>
                  {on && <Check className="h-4 w-4" />}
                </span>
              </button>
            </li>
          )
        })}
        {list.length === 0 && <li className="py-6 text-center text-sm text-neutral-500">Personne trouvé. Invite ton ami à créer son compte Trippy !</li>}
      </ul>
    </div>
  )
}

function NewGroupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { createGroup } = useStore()
  const [name, setName] = useState('')
  const [tripId, setTripId] = useState<string>()
  const [members, setMembers] = useState<string[]>([])
  const valid = name.trim() && members.length > 0
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-semibold">Nouveau groupe</h2>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          const id = createGroup(name.trim(), members, tripId)
          setName('')
          setMembers([])
          setTripId(undefined)
          onClose()
          navigate(`/chat/${id}`)
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du groupe (ex. Interrail 2027)"
          className="h-12 w-full rounded-xl bg-white px-4 outline-none ring-teal focus:ring-2 dark:bg-raised-dark"
        />
        <div>
          <p className="mb-2 text-sm font-medium">Lier à un voyage (facultatif)</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {TRIPS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTripId(tripId === t.id ? undefined : t.id)}
                className={cx('flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm', tripId === t.id ? 'bg-teal text-white' : 'bg-white dark:bg-raised-dark')}
              >
                <img src={t.photo} alt="" className="h-7 w-7 rounded-full object-cover" />
                {t.shortName}
              </button>
            ))}
          </div>
        </div>
        <ContactPicker selected={members} onToggle={(id) => setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))} />
        <button disabled={!valid} className="h-14 w-full rounded-full bg-teal text-lg font-semibold text-white disabled:opacity-40">
          Créer le groupe{members.length > 0 && ` (${members.length + 1})`}
        </button>
      </form>
    </Sheet>
  )
}

function NewChannelSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { createChannel } = useStore()
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const points =
    visibility === 'public'
      ? [
          { icon: Globe, title: 'Tout le monde peut la trouver', body: 'Les membres Trippy la découvrent dans la recherche et voient 30 jours d’historique.' },
          { icon: EyeOff, title: 'On voit ta chaîne, pas toi', body: 'Ton numéro et ton profil ne sont pas montrés aux abonnés.' },
        ]
      : [
          { icon: Lock, title: 'Sur invitation uniquement', body: 'Seules les personnes qui ont le lien peuvent la rejoindre.' },
          { icon: Users, title: 'Idéal pour une asso ou une promo', body: 'Partage les infos d’un voyage à toute ta classe ou ton club.' },
        ]
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal">
        <Radio className="h-12 w-12 rounded-full bg-white/95 p-2 text-teal" strokeWidth={2.4} />
      </div>
      <h2 className="mt-4 text-center font-display text-2xl font-semibold">Créer une chaîne</h2>
      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (!name.trim()) return
          const id = createChannel(name.trim(), visibility)
          setName('')
          onClose()
          navigate(`/chat/${id}`)
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom (ex. Surf à Biarritz)"
          className="h-12 w-full rounded-xl bg-white px-4 outline-none ring-teal focus:ring-2 dark:bg-raised-dark"
        />
        <div className="grid grid-cols-2 gap-1 rounded-full bg-neutral-200 p-1 dark:bg-raised-dark" role="radiogroup">
          {(['public', 'private'] as const).map((v) => (
            <button
              type="button"
              role="radio"
              aria-checked={visibility === v}
              key={v}
              onClick={() => setVisibility(v)}
              className={cx('flex h-10 items-center justify-center gap-2 rounded-full text-sm font-medium', visibility === v && 'bg-white shadow dark:bg-neutral-600')}
            >
              {v === 'public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {v === 'public' ? 'Publique' : 'Privée'}
            </button>
          ))}
        </div>
        <ul className="space-y-4 py-1">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-4">
              <Icon className="h-6 w-6 shrink-0 text-teal" />
              <div>
                <p>{title}</p>
                <p className="text-sm leading-snug text-neutral-500 dark:text-neutral-400">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <button disabled={!name.trim()} className="flex h-14 w-full items-center justify-center gap-1 rounded-full bg-teal text-lg font-semibold text-white disabled:opacity-40">
          <Plus className="h-5 w-5" /> Créer la chaîne
        </button>
      </form>
    </Sheet>
  )
}

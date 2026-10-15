import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, ChartColumn, CheckCheck, FileSpreadsheet, FileText, FileType2, Info, Lightbulb, Lock, Paperclip, Pin, Plus, Radio, SendHorizontal, Trash2, Users, X } from 'lucide-react'
import {
  AUTHOR_COLORS,
  BRANDS,
  CONTACTS,
  KIND_LABEL,
  TRIPS,
  conversationAvatar,
  conversationName,
  sender,
  type Conversation,
  type FileType,
  type Message,
  type Poll,
  type SharedFile,
} from '../data'
import { useStore } from '../store'
import { Sheet, cx } from '../components/ui'
import { ContactPicker, MemberStack } from './Messages'

export default function Chat() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { state, sendMessage, sendFile, vote, markRead, toggleFollow, togglePin } = useStore()
  const [draft, setDraft] = useState('')
  const [sheet, setSheet] = useState<null | 'attach' | 'poll' | 'info'>(null)
  const [openFile, setOpenFile] = useState<SharedFile | null>(null)
  const [hidePinned, setHidePinned] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const convo = state.conversations.find((c) => c.id === id)

  useEffect(() => {
    if (convo?.unread) markRead(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convo?.messages.length])

  if (!convo) return <Navigate to="/messages" replace />

  const brand = convo.kind === 'channel' ? BRANDS[convo.with] : undefined
  const official = !!brand
  const canPost = !official // official channels: only their team posts
  const canPoll = convo.kind === 'group' || convo.with === 'me'
  const avatar = conversationAvatar(convo)
  const trip = TRIPS.find((t) => t.id === convo.tripId)
  const pinned = [...convo.messages].reverse().find((m) => m.pinned)
  const colorOf = (from: string) => AUTHOR_COLORS[Math.max(0, convo.members?.indexOf(from) ?? 0) % AUTHOR_COLORS.length]

  const subtitle =
    convo.kind === 'group'
      ? `${(convo.members?.length ?? 0) + 1} membres${trip ? ` · ${trip.shortName}` : ''}`
      : brand
        ? `${KIND_LABEL[brand.kind]} · ${brand.followers} abonnés`
        : convo.kind === 'channel'
          ? `Chaîne ${convo.visibility === 'private' ? 'privée' : 'publique'}`
          : CONTACTS[convo.with]?.handle

  return (
    <div className="relative flex h-full flex-col">
      <header className="flex items-center gap-3 bg-white px-4 pb-3 pt-[max(env(safe-area-inset-top),24px)] dark:bg-card-dark">
        <button onClick={() => navigate(-1)} aria-label="Retour">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button onClick={() => setSheet('info')} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          {convo.kind === 'group' ? (
            <MemberStack ids={convo.members ?? []} size="h-9 w-9" />
          ) : avatar ? (
            <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-white">
              <Radio className="h-5 w-5" />
            </span>
          )}
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="truncate">{conversationName(convo)}</span>
              {official && <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />}
            </span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</span>
          </span>
        </button>
        <button onClick={() => setSheet('info')} aria-label="Infos" className="text-neutral-500">
          <Info className="h-6 w-6" />
        </button>
      </header>

      {pinned && !hidePinned && (
        <div className="flex items-center gap-3 border-t border-neutral-200 bg-white px-5 py-2.5 dark:border-neutral-700 dark:bg-raised-dark">
          <Pin className="h-5 w-5 shrink-0 text-tomato" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-tomato">Message épinglé</span>
            <span className="block truncate text-sm">{pinned.file?.name ?? pinned.text}</span>
          </span>
          <button onClick={() => setHidePinned(true)} aria-label="Masquer">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
      )}

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <p className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1 text-[12px] text-neutral-800">
          <Lock className="h-3 w-3" fill="currentColor" /> Messages chiffrés de bout en bout
        </p>
        {canPost && <p className="mt-2 text-center text-[11px] text-neutral-400">Astuce : double-tape un message pour l'épingler</p>}

        <ul className="mt-4 space-y-3">
          {convo.messages.map((m, i) => {
            const prev = convo.messages[i - 1]
            const first = !prev || prev.from !== m.from || prev.kind === 'event'
            return (
              <MessageRow
                key={m.id}
                m={m}
                showAuthor={convo.kind === 'group' && first}
                color={colorOf(m.from)}
                poll={m.pollId ? convo.polls?.[m.pollId] : undefined}
                votedFor={m.pollId ? state.pollVote[m.pollId] : undefined}
                onVote={(o) => m.pollId && vote(convo.id, m.pollId, o)}
                onOpenFile={setOpenFile}
                onPin={() => {
                  if (!canPost || m.kind === 'event') return
                  togglePin(convo.id, m.id)
                  setHidePinned(false)
                }}
              />
            )
          })}
        </ul>
        <div ref={bottom} />
      </div>

      {canPost ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            sendMessage(convo.id, draft.trim())
            setDraft('')
          }}
          className="flex items-center gap-2 bg-white px-3 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 dark:bg-card-dark"
        >
          <button type="button" onClick={() => setSheet('attach')} aria-label="Joindre" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-100 dark:bg-raised-dark">
            <Plus className="h-6 w-6" />
          </button>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" className="h-11 min-w-0 flex-1 rounded-full bg-neutral-100 px-5 outline-none dark:bg-raised-dark" />
          <button disabled={!draft.trim()} aria-label="Envoyer" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal text-white disabled:opacity-40">
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3 bg-white px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 dark:bg-card-dark">
          <p className="flex-1 text-sm text-neutral-500 dark:text-neutral-400">Seule l'équipe de {brand?.name} publie ici.</p>
          <FollowButton following={state.following.includes(convo.with)} onClick={() => toggleFollow(convo.with)} />
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (!f) return
          sendFile(convo.id, { name: f.name, type: fileType(f.name), size: formatSize(f.size) })
        }}
      />

      <Sheet open={sheet === 'attach'} onClose={() => setSheet(null)}>
        <div className="grid grid-cols-3 gap-3 pb-2">
          <AttachButton icon={<Paperclip className="h-6 w-6" />} label="Document" hint="PDF, Word, Excel" color="#1189B0" onClick={() => (setSheet(null), fileInput.current?.click())} />
          {canPoll && <AttachButton icon={<ChartColumn className="h-6 w-6" />} label="Sondage" hint="Voter ensemble" color="#5A27F7" onClick={() => setSheet('poll')} />}
          {convo.kind === 'group' && <AttachButton icon={<Users className="h-6 w-6" />} label="Membres" hint="Ajouter des amis" color="#E07A47" onClick={() => setSheet('info')} />}
        </div>
      </Sheet>
      <PollSheet open={sheet === 'poll'} onClose={() => setSheet(null)} conversationId={convo.id} />
      <InfoSheet open={sheet === 'info'} onClose={() => setSheet(null)} convo={convo} onOpenFile={setOpenFile} />
      <FileViewer file={openFile} onClose={() => setOpenFile(null)} />
    </div>
  )
}

function FollowButton({ following, onClick }: { following: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cx('h-10 shrink-0 rounded-full px-5 text-sm font-semibold', following ? 'bg-neutral-200 text-neutral-700 dark:bg-raised-dark dark:text-neutral-200' : 'bg-teal text-white')}>
      {following ? 'Suivi' : 'Suivre'}
    </button>
  )
}

function AttachButton({ icon, label, hint, color, onClick }: { icon: ReactNode; label: string; hint: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center dark:bg-raised-dark">
      <span className="grid h-12 w-12 place-items-center rounded-full text-white" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-[11px] text-neutral-500">{hint}</span>
    </button>
  )
}

const FILE_STYLE: Record<FileType, { color: string; label: string; Icon: typeof FileText }> = {
  pdf: { color: '#E5383B', label: 'PDF', Icon: FileText },
  docx: { color: '#2B579A', label: 'Word', Icon: FileType2 },
  xlsx: { color: '#217346', label: 'Excel', Icon: FileSpreadsheet },
}

const fileType = (name: string): FileType => (/\.(xlsx?|csv)$/i.test(name) ? 'xlsx' : /\.docx?$/i.test(name) ? 'docx' : 'pdf')
const formatSize = (bytes: number) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(bytes / 1e3))} Ko`)

function FileCard({ file, onOpen }: { file: SharedFile; onOpen: () => void }) {
  const { color, label, Icon } = FILE_STYLE[file.type]
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 rounded-xl bg-black/5 p-2.5 text-left dark:bg-white/10">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: color }}>
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium">{file.name}</span>
        <span className="text-xs opacity-70">
          {label} · {file.size}
        </span>
      </span>
    </button>
  )
}

function MessageRow({
  m,
  showAuthor,
  color,
  poll,
  votedFor,
  onVote,
  onOpenFile,
  onPin,
}: {
  m: Message
  showAuthor: boolean
  color: string
  poll?: Poll
  votedFor?: string
  onVote: (optionId: string) => void
  onOpenFile: (f: SharedFile) => void
  onPin: () => void
}) {
  if (m.kind === 'event') {
    return <li className="mx-auto w-fit rounded-full bg-white px-4 py-1.5 text-center text-sm text-neutral-600 dark:bg-raised-dark dark:text-neutral-300">{m.text}</li>
  }

  const mine = m.from === 'me'
  const who = sender(m.from)

  if (m.kind === 'tip') {
    return (
      <li className="overflow-hidden rounded-2xl bg-white dark:bg-raised-dark">
        {m.photo && <img src={m.photo} alt="" className="h-40 w-full object-cover" />}
        <div className="p-3.5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-teal">
            <Lightbulb className="h-4 w-4" /> Conseil · {who.name}
          </p>
          <p className="mt-1.5 text-[15px] leading-snug">{m.text}</p>
          {m.time && <p className="mt-1 text-right text-xs text-neutral-400">{m.time}</p>}
        </div>
      </li>
    )
  }

  let body
  if (m.kind === 'poll' && poll) {
    const total = poll.options.reduce((n, o) => n + o.votes, 0)
    body = (
      <div className="w-64 max-w-full">
        <p className="flex items-center gap-2 font-semibold">
          <ChartColumn className="h-4 w-4 shrink-0" /> {poll.question}
        </p>
        <ul className="mt-2 space-y-2">
          {poll.options.map((o) => {
            const pct = total ? Math.round((o.votes / total) * 100) : 0
            const chosen = votedFor === o.id
            return (
              <li key={o.id}>
                <button onClick={() => onVote(o.id)} className="flex w-full items-center gap-2.5 text-left" aria-pressed={chosen}>
                  <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', mine ? 'border-white' : 'border-teal')}>
                    {chosen && <span className={cx('h-2.5 w-2.5 rounded-full', mine ? 'bg-white' : 'bg-teal')} />}
                  </span>
                  <span className={cx('relative flex-1 overflow-hidden rounded-lg py-1.5 pl-2.5 pr-10 text-sm', mine ? 'bg-white/15' : 'bg-black/5 dark:bg-white/10')}>
                    <span className={cx('absolute inset-y-0 left-0 transition-all duration-500', mine ? 'bg-white/30' : 'bg-teal/25')} style={{ width: `${pct}%` }} />
                    <span className="relative">{o.label}</span>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-semibold">{pct}%</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs opacity-70">
          {total} vote{total > 1 ? 's' : ''} · se termine dans {poll.closesIn}
        </p>
      </div>
    )
  } else if (m.kind === 'file' && m.file) {
    const file = m.file
    body = (
      <div className="w-64 max-w-full">
        <FileCard file={file} onOpen={() => onOpenFile(file)} />
      </div>
    )
  } else {
    body = <p className="whitespace-pre-line text-[15px] leading-snug">{m.text}</p>
  }

  return (
    <li className={cx('flex items-end gap-2', mine && 'justify-end')} onDoubleClick={onPin}>
      {!mine && (showAuthor && who.avatar ? <img src={who.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" /> : <span className="w-8 shrink-0" />)}
      <div className={cx('max-w-[80%] rounded-2xl px-3.5 py-2.5', mine ? 'rounded-br-sm bg-teal text-white' : 'rounded-bl-sm bg-white dark:bg-raised-dark')}>
        {showAuthor && !mine && (
          <p className="mb-0.5 text-sm font-semibold" style={{ color }}>
            {who.name}
          </p>
        )}
        {body}
        <p className={cx('mt-1 flex items-center justify-end gap-1 text-[11px]', mine ? 'text-white/80' : 'text-neutral-400')}>
          {m.pinned && <Pin className="h-3 w-3" />}
          {m.time}
          {mine && <CheckCheck className="h-3.5 w-3.5" />}
        </p>
      </div>
    </li>
  )
}

function PollSheet({ open, onClose, conversationId }: { open: boolean; onClose: () => void; conversationId: string }) {
  const { createPoll } = useStore()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const filled = options.map((o) => o.trim()).filter(Boolean)
  const valid = question.trim() && filled.length >= 2
  return (
    <Sheet open={open} onClose={onClose}>
      <h2 className="font-display text-2xl font-semibold">Nouveau sondage</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          createPoll(conversationId, question.trim(), filled)
          setQuestion('')
          setOptions(['', ''])
          onClose()
        }}
      >
        <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question (ex. Quelle date pour partir ?)" className="h-12 w-full rounded-xl bg-white px-4 outline-none ring-teal focus:ring-2 dark:bg-raised-dark" />
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={o}
              onChange={(e) => setOptions((list) => list.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={`Option ${i + 1}`}
              className="h-11 flex-1 rounded-xl bg-white px-4 outline-none ring-teal focus:ring-2 dark:bg-raised-dark"
            />
            {options.length > 2 && (
              <button type="button" onClick={() => setOptions((list) => list.filter((_, j) => j !== i))} aria-label="Retirer l'option" className="text-neutral-400">
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button type="button" onClick={() => setOptions((list) => [...list, ''])} className="text-sm font-semibold text-teal">
            + Ajouter une option
          </button>
        )}
        <button disabled={!valid} className="h-14 w-full rounded-full bg-violet text-lg font-semibold text-white disabled:opacity-40">
          Publier le sondage
        </button>
      </form>
    </Sheet>
  )
}

function InfoSheet({ open, onClose, convo, onOpenFile }: { open: boolean; onClose: () => void; convo: Conversation; onOpenFile: (f: SharedFile) => void }) {
  const { state, addMembers, toggleFollow } = useStore()
  const tabs = convo.kind === 'group' ? (['Membres', 'Fichiers', 'Sondages'] as const) : (['Fichiers', 'Sondages'] as const)
  const [tab, setTab] = useState<string>(tabs[0])
  const [adding, setAdding] = useState<string[] | null>(null)
  const files = convo.messages.filter((m) => m.file).map((m) => m.file!)
  const polls = Object.values(convo.polls ?? {})
  const brand = convo.kind === 'channel' ? BRANDS[convo.with] : undefined
  const avatar = convo.kind === 'group' ? undefined : conversationAvatar(convo)

  return (
    <Sheet open={open} onClose={onClose} className="min-h-[70%]">
      <div className="flex flex-col items-center text-center">
        {avatar ? <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover" /> : <MemberStack ids={convo.members ?? []} size="h-14 w-14" />}
        <h2 className="mt-3 font-display text-xl font-semibold">{conversationName(convo)}</h2>
        {brand && (
          <>
            <p className="text-sm text-neutral-500">
              {brand.about} · {brand.followers} abonnés
            </p>
            <div className="mt-3">
              <FollowButton following={state.following.includes(brand.id)} onClick={() => toggleFollow(brand.id)} />
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex gap-1 rounded-full bg-neutral-200 p-1 dark:bg-raised-dark">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx('h-9 flex-1 rounded-full text-sm font-medium', tab === t && 'bg-white shadow dark:bg-neutral-600')}>
            {t}
            {t === 'Fichiers' && files.length > 0 && ` (${files.length})`}
          </button>
        ))}
      </div>

      {tab === 'Membres' && adding === null && (
        <>
          <button onClick={() => setAdding([])} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-teal/10 p-3 font-semibold text-teal">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal text-white">
              <Plus className="h-5 w-5" />
            </span>
            Ajouter des membres
          </button>
          <ul className="mt-2">
            {['me', ...(convo.members ?? [])].map((mid) => {
              const s = sender(mid)
              return (
                <li key={mid} className="flex items-center gap-3 py-2">
                  <img src={s.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <span className="flex-1 font-medium">{s.name}</span>
                  {convo.admins?.includes(mid) && <span className="rounded-full bg-sun px-2 py-0.5 text-xs font-semibold text-neutral-900">Organisateur</span>}
                </li>
              )
            })}
          </ul>
        </>
      )}

      {tab === 'Membres' && adding !== null && (
        <div className="mt-4 space-y-3">
          <ContactPicker selected={adding} exclude={convo.members} onToggle={(id) => setAdding((a) => (a!.includes(id) ? a!.filter((x) => x !== id) : [...a!, id]))} />
          <div className="flex gap-2">
            <button onClick={() => setAdding(null)} className="h-12 flex-1 rounded-full bg-neutral-200 font-semibold dark:bg-raised-dark">
              Annuler
            </button>
            <button
              disabled={!adding.length}
              onClick={() => {
                addMembers(convo.id, adding)
                setAdding(null)
              }}
              className="h-12 flex-1 rounded-full bg-teal font-semibold text-white disabled:opacity-40"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {tab === 'Fichiers' && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <FileCard key={i} file={f} onOpen={() => onOpenFile(f)} />
          ))}
          {files.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">Aucun fichier partagé. Utilise le bouton + pour envoyer un PDF, un Word ou un Excel.</p>}
        </div>
      )}

      {tab === 'Sondages' && (
        <ul className="mt-4 space-y-2">
          {polls.map((p) => {
            const total = p.options.reduce((n, o) => n + o.votes, 0)
            const top = [...p.options].sort((a, b) => b.votes - a.votes)[0]
            return (
              <li key={p.id} className="rounded-2xl bg-white p-3 dark:bg-raised-dark">
                <p className="font-semibold">{p.question}</p>
                <p className="text-sm text-neutral-500">
                  {total} votes · en tête : {top?.label}
                </p>
              </li>
            )
          })}
          {polls.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">Aucun sondage pour l'instant.</p>}
        </ul>
      )}
    </Sheet>
  )
}

function FileViewer({ file, onClose }: { file: SharedFile | null; onClose: () => void }) {
  if (!file) return null
  const { color, label, Icon } = FILE_STYLE[file.type]
  const p = file.preview
  return (
    <div role="dialog" aria-modal className="animate-fade-in absolute inset-0 z-[55] flex flex-col bg-page dark:bg-page-dark">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),24px)] text-white" style={{ backgroundColor: color }}>
        <button onClick={onClose} aria-label="Fermer">
          <X className="h-6 w-6" />
        </button>
        <Icon className="h-6 w-6" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{file.name}</span>
          <span className="text-xs opacity-80">
            {label} · {file.size} · partagé dans le groupe
          </span>
        </span>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="min-h-full rounded-lg bg-white p-5 text-neutral-900 shadow">
          {!p && <p className="py-16 text-center text-neutral-500">L'aperçu des fichiers importés arrivera avec le serveur Trippy. Le fichier est bien partagé avec le groupe.</p>}
          {p?.kind === 'text' && (
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{p.lines[0]}</h3>
              {p.lines.slice(1).map((l) => (
                <p key={l} className="text-[15px] leading-snug">
                  {l}
                </p>
              ))}
            </div>
          )}
          {p?.kind === 'checklist' && <Checklist items={p.items} />}
          {p?.kind === 'table' && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {p.head.map((h) => (
                    <th key={h} className="border border-neutral-300 bg-[#217346] px-2 py-1.5 text-left font-semibold text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.rows.map((r, i) => (
                  <tr key={i} className={cx(i === p.rows.length - 1 && 'font-bold')}>
                    {r.map((c, j) => (
                      <td key={j} className={cx('border border-neutral-300 px-2 py-1.5', j > 0 && 'text-right')}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/** Shared checklist: anyone in the group can tick an item (kept locally in the prototype). */
function Checklist({ items }: { items: { label: string; done: boolean }[] }) {
  const [done, setDone] = useState(items.map((i) => i.done))
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={it.label}>
          <label className="flex items-center gap-3 text-[15px]">
            <input type="checkbox" checked={done[i]} onChange={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))} className="h-5 w-5 accent-[#2B579A]" />
            <span className={cx(done[i] && 'text-neutral-400 line-through')}>{it.label}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

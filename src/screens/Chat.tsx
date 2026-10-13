import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BadgeCheck, ChartColumn, CheckCheck, Lock, Pin, SendHorizontal, X } from 'lucide-react'
import { CONTACTS, conversationName, type Conversation, type Message } from '../data'
import { useStore } from '../store'
import { cx } from '../components/ui'

const avatars: Record<string, string> = { max: '/images/av-max.png' }

export default function Chat() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { state, sendMessage, vote, markRead } = useStore()
  const [draft, setDraft] = useState('')
  const [pinBanner, setPinBanner] = useState(true)
  const bottom = useRef<HTMLDivElement>(null)

  const convo = state.conversations.find((c) => c.id === id)

  useEffect(() => {
    if (convo?.unread) markRead(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convo?.messages.length])

  if (!convo) return <Navigate to="/messages" replace />
  const contact = CONTACTS[convo.contact]

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 bg-white px-5 pb-3 pt-[max(env(safe-area-inset-top),24px)] dark:bg-card-dark">
        <button onClick={() => navigate(-1)} aria-label="Retour">
          <ArrowLeft className="h-6 w-6" />
        </button>
        {contact && <img src={contact.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />}
        <p className="flex min-w-0 items-center gap-1.5 font-semibold">
          <span className="truncate">{conversationName(convo)}</span>
          {contact?.verified && <BadgeCheck className="h-5 w-5 shrink-0 text-white" fill="#1189B0" />}
        </p>
      </header>

      {convo.poll && pinBanner && (
        <div className="flex items-center gap-4 border-t border-neutral-200 bg-white px-5 py-3 dark:border-neutral-700 dark:bg-raised-dark">
          <ChartColumn className="h-8 w-8 shrink-0 rounded-full bg-violet/70 p-1.5 text-white" />
          <span className="flex-1 text-[15px]">{convo.poll.question}</span>
          <button onClick={() => setPinBanner(false)} aria-label="Masquer">
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>
      )}

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        <p className="mt-4 text-center font-semibold text-neutral-600 dark:text-neutral-300">Today</p>
        <p className="mx-auto mt-2 flex max-w-[90%] items-center justify-center gap-3 rounded-md border border-yellow-300 bg-yellow-100 px-3 py-1 text-[13px] text-neutral-800">
          <Lock className="h-3.5 w-3.5" fill="currentColor" /> Messages and calls are secure &amp; encrypted.
        </p>

        <ul className="mt-4 space-y-3">
          {convo.messages.map((m) => (
            <MessageRow key={m.id} m={m} convo={convo} votedFor={state.pollVote[convo.id]} onVote={(o) => vote(convo.id, o)} />
          ))}
        </ul>
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          sendMessage(convo.id, draft.trim())
          setDraft('')
        }}
        className="flex items-center gap-3 bg-white px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 dark:bg-card-dark"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          className="h-12 flex-1 rounded-full bg-neutral-100 px-5 outline-none dark:bg-raised-dark"
        />
        <button disabled={!draft.trim()} aria-label="Envoyer" className="grid h-12 w-12 place-items-center rounded-full bg-teal text-white disabled:opacity-40">
          <SendHorizontal className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}

function MessageRow({ m, convo, votedFor, onVote }: { m: Message; convo: Conversation; votedFor?: string; onVote: (optionId: string) => void }) {
  if (m.kind === 'event') {
    return (
      <li className="w-fit rounded-xl bg-white px-4 py-2 dark:bg-raised-dark">
        {m.text} <span className="text-sm text-neutral-400">{m.time}</span>
      </li>
    )
  }

  if (m.kind === 'poll' && convo.poll) {
    const total = convo.poll.options.reduce((n, o) => n + o.votes, 0)
    return (
      <li className="ml-auto w-[85%] rounded-xl border-l-4 border-teal bg-[#a9d0cb] px-3.5 pb-2 pt-2.5 dark:bg-raised-dark">
        <p className="font-medium">{convo.poll.question}</p>
        <p className="text-sm text-[#3f8f86] dark:text-[#6fb3a9]">Visible Answers</p>
        <ul className="mt-2 space-y-2">
          {convo.poll.options.map((o) => {
            const pct = total ? Math.round((o.votes / total) * 100) : 0
            const mine = votedFor === o.id
            return (
              <li key={o.id}>
                <button onClick={() => onVote(o.id)} className="flex w-full items-center gap-3 text-left" aria-pressed={mine}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#13a67f]">
                    {mine && <span className="h-3.5 w-3.5 rounded-full bg-[#13a67f]" />}
                  </span>
                  <span className="relative flex-1 overflow-hidden rounded-lg py-2 pl-3 pr-11 text-[15px]">
                    <span className="absolute inset-y-0 left-0 rounded-lg bg-[#6cc4b5] transition-all duration-500 dark:bg-[#1f5a50]" style={{ width: `${Math.max(pct, 8)}%` }} />
                    <span className="relative">{o.label}</span>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2">{pct}%</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="mt-2.5 flex items-center justify-between border-t border-black/15 pt-1.5 text-sm text-neutral-600 dark:border-white/15 dark:text-neutral-400">
          <span>
            {total} votes · {convo.poll.hoursLeft} hrs left
          </span>
          <span className="flex items-center gap-1">
            {m.time} <CheckCheck className="h-4 w-4 text-sky" />
          </span>
        </div>
      </li>
    )
  }

  if (m.from === 'me') {
    return (
      <li className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-teal px-4 py-2.5 text-white">
        <p className="whitespace-pre-line text-[15px]">{m.text}</p>
        <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-white/80">
          {m.time} <CheckCheck className="h-4 w-4" />
        </p>
      </li>
    )
  }

  const avatar = avatars[m.from] ?? CONTACTS[m.from]?.avatar
  return (
    <li className="flex items-start gap-3">
      {avatar ? <img src={avatar} alt="" className="mt-1 h-8 w-8 shrink-0 rounded-full object-cover" /> : <span className="w-2 shrink-0" />}
      <div className={cx('relative max-w-[85%] rounded-xl rounded-tl-none bg-white px-4 py-2.5 dark:bg-raised-dark', m.from === 'kakashi' && 'border-r-4 border-[#E07A47]')}>
        {m.author && (
          <p className="flex items-center justify-between gap-4" style={{ color: m.authorColor }}>
            {m.author}
            {m.pinned && (
              <span className="flex items-center gap-1 text-xs italic text-neutral-500">
                <Pin className="h-3.5 w-3.5" /> [Message Épinglé]
              </span>
            )}
          </p>
        )}
        <p className="mt-0.5 whitespace-pre-line text-[15px] leading-snug">{m.text}</p>
        <p className="mt-0.5 flex items-center justify-end gap-1 text-xs text-neutral-400">
          {m.pinned ? <CheckCheck className="h-4 w-4 text-tomato" /> : m.time}
        </p>
      </div>
    </li>
  )
}

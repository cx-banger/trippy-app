import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CITIES, CONVERSATIONS, GOALS, channelFor, type Conversation, type Goal, type Message, type Poll, type SharedFile } from './data'

type State = {
  theme: 'light' | 'dark'
  city: string
  likedTrips: string[]
  savedTrips: string[]
  bookedTrips: string[]
  bookings: Record<string, { people: number; bookedAt: string }> // trip id -> booking, shown in the ticket wallet
  following: string[] // brand ids (channels)
  pollVote: Record<string, string> // poll id -> option id
  conversations: Conversation[]
  goals: Goal[]
  monthSaved: { month: string; amount: number } // net amount put aside this calendar month
  readNotifications: boolean
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

const initialState: State = {
  theme: 'light',
  city: CITIES[0],
  likedTrips: [],
  savedTrips: [],
  bookedTrips: ['marseille'], // demo booking so the ticket wallet isn't empty
  bookings: { marseille: { people: 2, bookedAt: '2026-10-01T10:00:00.000Z' } },
  following: ['occitanie', 'aude', 'lea', 'paris'],
  pollVote: {},
  conversations: CONVERSATIONS,
  goals: GOALS,
  monthSaved: { month: currentMonth(), amount: 35 }, // demo: some savings already this month
  readNotifications: false,
}

const STORAGE_KEY = 'trippy-state-v2'

// The desktop preview shows each screen in an iframe with ?theme=light|dark, which wins over the saved theme.
const themeParam = new URLSearchParams(window.location.search).get('theme')
const forcedTheme = themeParam === 'light' || themeParam === 'dark' ? themeParam : null

function readSaved(): Partial<State> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function load(): State {
  const state = { ...initialState, ...readSaved() }
  // a new month starts from zero
  if (state.monthSaved.month !== currentMonth()) state.monthSaved = { month: currentMonth(), amount: 0 }
  return forcedTheme ? { ...state, theme: forcedTheme } : state
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

const update = (list: Conversation[], id: string, fn: (c: Conversation) => Conversation) => list.map((c) => (c.id === id ? fn(c) : c))

/** Appends a message from me and moves the conversation preview to it. */
function post(list: Conversation[], id: string, fields: Partial<Message>, preview: string) {
  return update(list, id, (c) => {
    const message: Message = { id: crypto.randomUUID(), from: 'me', text: '', time: nowTime(), ...fields }
    return { ...c, messages: [...c.messages, message], preview, time: message.time }
  })
}

const nowTime = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

function useStoreValue() {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      // a forced theme is local to this frame: keep the saved one untouched
      const theme = forcedTheme ? (readSaved().theme ?? initialState.theme) : state.theme
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, theme }))
      if (!forcedTheme) localStorage.setItem('trippy-theme', theme)
    } catch {
      // storage unavailable (private mode) — the app still works for this session
    }
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#1F1F1F' : '#F2F2F2')
  }, [state])

  // Keep several open copies in sync (the preview phones on desktop, or two tabs)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setState(load())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), [])

  return useMemo(
    () => ({
      state,
      toggleTheme: () => patch((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setCity: (city: string) => patch(() => ({ city })),
      toggleLike: (id: string) => patch((s) => ({ likedTrips: toggle(s.likedTrips, id) })),
      toggleSave: (id: string) => patch((s) => ({ savedTrips: toggle(s.savedTrips, id) })),
      book: (id: string, people: number) =>
        patch((s) => ({
          bookedTrips: s.bookedTrips.includes(id) ? s.bookedTrips : [...s.bookedTrips, id],
          bookings: { ...s.bookings, [id]: { people, bookedAt: new Date().toISOString() } },
        })),
      toggleFollow: (id: string) => patch((s) => ({ following: toggle(s.following, id) })),
      markNotificationsRead: () => patch(() => ({ readNotifications: true })),
      vote: (conversationId: string, pollId: string, optionId: string) =>
        patch((s) => {
          const previous = s.pollVote[pollId]
          if (previous === optionId) return {}
          return {
            pollVote: { ...s.pollVote, [pollId]: optionId },
            conversations: update(s.conversations, conversationId, (c) => {
              const poll = c.polls?.[pollId]
              if (!poll) return c
              const options = poll.options.map((o) => ({ ...o, votes: o.votes + (o.id === optionId ? 1 : 0) - (o.id === previous ? 1 : 0) }))
              return { ...c, polls: { ...c.polls, [pollId]: { ...poll, options } } }
            }),
          }
        }),
      markRead: (conversationId: string) => patch((s) => ({ conversations: update(s.conversations, conversationId, (c) => ({ ...c, unread: 0 })) })),
      sendMessage: (conversationId: string, text: string) => patch((s) => ({ conversations: post(s.conversations, conversationId, { text }, text) })),
      sendFile: (conversationId: string, file: SharedFile) =>
        patch((s) => ({ conversations: post(s.conversations, conversationId, { kind: 'file', text: '', file }, `📎 ${file.name}`) })),
      createPoll: (conversationId: string, question: string, labels: string[]) =>
        patch((s) => {
          const poll: Poll = {
            id: crypto.randomUUID(),
            author: 'me',
            question,
            closesIn: '24 h',
            options: labels.map((label, i) => ({ id: `o${i}`, label, votes: 0 })),
          }
          const withPoll = update(s.conversations, conversationId, (c) => ({ ...c, polls: { ...c.polls, [poll.id]: poll } }))
          return { conversations: post(withPoll, conversationId, { kind: 'poll', text: '', pollId: poll.id }, `📊 ${question}`) }
        }),
      togglePin: (conversationId: string, messageId: string) =>
        patch((s) => ({
          conversations: update(s.conversations, conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m)),
          })),
        })),
      createGroup: (name: string, members: string[], tripId?: string) => {
        const id = `group-${Date.now()}`
        patch((s) => ({
          conversations: [
            {
              id,
              kind: 'group',
              with: id,
              name,
              members,
              admins: ['me'],
              tripId,
              preview: 'Groupe créé',
              time: nowTime(),
              unread: 0,
              messages: [{ id: 'created', from: 'system', kind: 'event', text: `Tu as créé le groupe « ${name} »`, time: nowTime() }],
            },
            ...s.conversations,
          ],
        }))
        return id
      },
      addMembers: (conversationId: string, ids: string[]) =>
        patch((s) => ({
          conversations: update(s.conversations, conversationId, (c) => ({
            ...c,
            members: [...(c.members ?? []), ...ids.filter((x) => !c.members?.includes(x))],
            messages: [...c.messages, { id: crypto.randomUUID(), from: 'system', kind: 'event', text: `Tu as ajouté ${ids.length} membre${ids.length > 1 ? 's' : ''}`, time: nowTime() }],
          })),
        })),
      createChannel: (name: string, visibility: 'public' | 'private') => {
        const id = `channel-${Date.now()}`
        patch((s) => ({
          conversations: [
            {
              id,
              kind: 'channel',
              with: 'me',
              name,
              visibility,
              preview: 'Chaîne créée',
              time: nowTime(),
              unread: 0,
              messages: [{ id: 'created', from: 'system', kind: 'event', text: `Tu as créé la chaîne ${visibility === 'public' ? 'publique' : 'privée'} « ${name} »`, time: nowTime() }],
            },
            ...s.conversations,
          ],
        }))
        return id
      },
      /** Official channels the user opens for the first time are added to the list. */
      openChannel: (brandId: string) =>
        patch((s) => (s.conversations.some((c) => c.id === `ch-${brandId}`) ? {} : { conversations: [...s.conversations, channelFor(brandId)] })),
      saveToGoal: (id: string, amount: number) =>
        patch((s) => {
          const goal = s.goals.find((g) => g.id === id)
          if (!goal) return {}
          const saved = Math.round(Math.max(0, goal.saved + amount) * 100) / 100
          const month = currentMonth()
          const before = s.monthSaved.month === month ? s.monthSaved.amount : 0
          return {
            goals: s.goals.map((g) => (g.id === id ? { ...g, saved } : g)),
            monthSaved: { month, amount: Math.round((before + saved - goal.saved) * 100) / 100 },
          }
        }),
      addGoal: (goal: Goal) => patch((s) => ({ goals: [...s.goals, goal] })),
      removeGoal: (id: string) => patch((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      reset: () => setState(initialState),
    }),
    [state, patch],
  )
}

type Store = ReturnType<typeof useStoreValue>
const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

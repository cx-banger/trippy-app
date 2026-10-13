import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CITIES, CONVERSATIONS, GOALS, type Conversation, type Goal, type Message } from './data'

type State = {
  theme: 'light' | 'dark'
  city: string
  likedTrips: string[]
  savedTrips: string[]
  bookedTrips: string[]
  following: string[]
  pollVote: Record<string, string> // conversation id -> option id
  conversations: Conversation[]
  goals: Goal[]
  readNotifications: boolean
}

const initialState: State = {
  theme: 'light',
  city: CITIES[0],
  likedTrips: [],
  savedTrips: [],
  bookedTrips: [],
  following: [],
  pollVote: {},
  conversations: CONVERSATIONS,
  goals: GOALS,
  readNotifications: false,
}

const STORAGE_KEY = 'trippy-state-v1'

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) }
  } catch {
    return initialState
  }
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

const nowTime = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

function useStoreValue() {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      localStorage.setItem('trippy-theme', state.theme)
    } catch {
      // storage unavailable (private mode) — the app still works for this session
    }
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#1F1F1F' : '#F2F2F2')
  }, [state])

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), [])

  return useMemo(
    () => ({
      state,
      toggleTheme: () => patch((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setCity: (city: string) => patch(() => ({ city })),
      toggleLike: (id: string) => patch((s) => ({ likedTrips: toggle(s.likedTrips, id) })),
      toggleSave: (id: string) => patch((s) => ({ savedTrips: toggle(s.savedTrips, id) })),
      book: (id: string) => patch((s) => ({ bookedTrips: s.bookedTrips.includes(id) ? s.bookedTrips : [...s.bookedTrips, id] })),
      toggleFollow: (id: string) => patch((s) => ({ following: toggle(s.following, id) })),
      markNotificationsRead: () => patch(() => ({ readNotifications: true })),
      vote: (conversationId: string, optionId: string) =>
        patch((s) => {
          const previous = s.pollVote[conversationId]
          if (previous === optionId) return {}
          return {
            pollVote: { ...s.pollVote, [conversationId]: optionId },
            conversations: s.conversations.map((c) =>
              c.id !== conversationId || !c.poll
                ? c
                : {
                    ...c,
                    poll: {
                      ...c.poll,
                      options: c.poll.options.map((o) => ({
                        ...o,
                        votes: o.votes + (o.id === optionId ? 1 : 0) - (o.id === previous ? 1 : 0),
                      })),
                    },
                  },
            ),
          }
        }),
      markRead: (conversationId: string) =>
        patch((s) => ({ conversations: s.conversations.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)) })),
      sendMessage: (conversationId: string, text: string) =>
        patch((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== conversationId) return c
            const message: Message = { id: crypto.randomUUID(), from: 'me', text, time: nowTime() }
            return { ...c, messages: [...c.messages, message], preview: text, time: message.time, boldPreview: false }
          }),
        })),
      createChannel: (name: string) => {
        const id = `channel-${Date.now()}`
        patch((s) => ({
          conversations: [
            {
              id,
              contact: id,
              preview: 'Chaîne créée',
              time: nowTime(),
              unread: 0,
              messages: [{ id: 'welcome', from: 'system', kind: 'event', text: `Vous avez créé la chaîne « ${name} »`, time: nowTime() }],
              channelName: name,
            },
            ...s.conversations,
          ],
        }))
        return id
      },
      addToGoal: (id: string, amount: number) =>
        patch((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.min(g.target, Math.max(0, g.saved + amount)) } : g)) })),
      addGoal: (goal: Goal) => patch((s) => ({ goals: [...s.goals, goal] })),
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

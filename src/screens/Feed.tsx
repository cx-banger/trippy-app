import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, ChevronRight, Clock, Contact, EllipsisVertical, Eye, Heart, Languages, MapPin, MessageCircle, Plus, Send, X } from 'lucide-react'
import { BRANDS, HIGHLIGHTS, ME, POSTS, STORIES, type Comment, type Post, type Story } from '../data'
import { useStore } from '../store'
import { Screen, TrainIcon, cx } from '../components/ui'

const SLIDE_MS = 5000

export default function Feed() {
  const [story, setStory] = useState<Story | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const [slide, setSlide] = useState(0)
  const highlight = HIGHLIGHTS[slide]
  const brand = BRANDS[highlight.brand]

  return (
    <Screen withNav>
      <header className="flex items-center justify-between px-6 pt-6">
        <h1 className="text-[28px] font-semibold">Feed</h1>
        <Link to="/messages" aria-label="Messages" className="p-1">
          <Send className="h-7 w-7 rotate-45" fill="currentColor" />
        </Link>
      </header>

      <ul className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-3 pb-3">
        {STORIES.map((s) => (
          <li key={s.id} className="w-[76px] shrink-0">
            <button
              onClick={() => {
                setStory(s)
                setSeen((v) => [...new Set([...v, s.id])])
              }}
              className="flex w-full flex-col items-center gap-1.5"
            >
              <span
                className={cx('relative grid h-[70px] w-[70px] place-items-center rounded-full p-[3px]', seen.includes(s.id) && 'opacity-60')}
                style={{ background: s.ring }}
              >
                <span className="grid h-full w-full place-items-center rounded-full bg-page p-[2px] dark:bg-page-dark">
                  <img src={s.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                </span>
                {s.isMe && (
                  <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full border-2 border-page bg-emerald-600 text-white dark:border-page-dark">
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-[13px]">{s.user}</span>
            </button>
          </li>
        ))}
      </ul>

      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="flex items-center gap-4 px-6 py-2.5 text-neutral-900 transition-colors"
        style={{ backgroundColor: brand.banner }}
      >
        <img src={brand.logo} alt="" className="h-9 w-9 rounded-md object-cover" />
        <span className="min-w-0 flex-1 text-sm leading-tight">
          <span className="block font-semibold">{brand.bannerTitle ?? brand.name}</span>
          <span className="block truncate">Go to www.websitehere.com</span>
        </span>
        <ChevronRight className="h-5 w-5" />
      </a>

      <Carousel index={slide} onChange={setSlide} />

      <div className="mt-6 flex items-center justify-between px-6">
        <h2 className="text-[22px] font-semibold">Publications des Trippers</h2>
        <EllipsisVertical className="h-6 w-6" />
      </div>

      <div className="mt-3 space-y-4 px-4">
        {POSTS.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {story && <StoryViewer story={story} onClose={() => setStory(null)} />}
    </Screen>
  )
}

function Carousel({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const go = (i: number) => onChange((i + HIGHLIGHTS.length) % HIGHLIGHTS.length)

  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => go(index + 1), SLIDE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused])

  const h = HIGHLIGHTS[index]
  return (
    <section
      className="relative h-[190px] select-none overflow-hidden"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      {HIGHLIGHTS.map((s, i) => (
        <img
          key={s.id}
          src={s.photo}
          alt=""
          className={cx('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', i === index ? 'opacity-100' : 'opacity-0')}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      {/* tap zones */}
      <button aria-label="Précédent" className="absolute inset-y-0 left-0 w-1/3" onClick={() => go(index - 1)} />
      <button aria-label="Suivant" className="absolute inset-y-0 right-0 w-1/3" onClick={() => go(index + 1)} />

      {h.closest && (
        <div className="absolute right-5 top-8 rounded-lg bg-black/90 px-3 py-1.5 text-center text-xs text-white">
          <Clock className="mx-auto h-3.5 w-3.5" />
          <p className="mt-1 leading-snug">
            Closest
            <br />
            {h.closest}
          </p>
        </div>
      )}
      <h3 key={h.id} className="animate-fade-in pointer-events-none absolute bottom-10 left-6 right-16 text-[22px] font-semibold leading-tight text-white drop-shadow-lg">
        {h.title}
      </h3>
      <div className="absolute bottom-4 left-6 flex items-center gap-1.5">
        {HIGHLIGHTS.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Diapo ${i + 1}`}
            onClick={() => go(i)}
            className={cx('h-1.5 rounded-full bg-white/90 transition-all', i === index ? 'w-6' : 'w-1.5 opacity-80')}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-sage/80">
        <div
          key={`${h.id}-${paused}`}
          className="h-full origin-left bg-sun"
          style={{ animation: paused ? undefined : `fill-bar ${SLIDE_MS}ms linear forwards`, transform: paused ? 'scaleX(0.7)' : undefined }}
        />
      </div>
    </section>
  )
}

function PostCard({ post }: { post: Post }) {
  const { state, toggleFollow } = useStore()
  const following = state.following.includes(post.handle)
  const [translated, setTranslated] = useState(false)
  const [liked, setLiked] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>(post.comments)
  const [reply, setReply] = useState('')
  const [replying, setReplying] = useState(false)

  const sendReply = () => {
    if (!reply.trim()) return
    setComments((c) => [...c, { id: crypto.randomUUID(), author: ME.name, avatar: ME.avatar, text: reply.trim(), time: 'à l’instant' }])
    setReply('')
    setReplying(false)
  }

  return (
    <>
      <article className="rounded-3xl border border-neutral-200 bg-white p-4 dark:border-transparent dark:bg-card-dark">
        <header className="flex items-start gap-3">
          <img src={post.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2">
              <span className="truncate font-semibold">{post.author}</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-white" />
              <span className="shrink-0 text-xs text-neutral-400">{post.time}</span>
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-300">{post.handle}</p>
          </div>
          <button
            onClick={() => toggleFollow(post.handle)}
            className={cx(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition',
              following ? 'bg-sky text-white' : 'border-2 border-sky text-sky dark:border-transparent dark:bg-raised-dark dark:text-white',
            )}
          >
            {following ? 'Abonné' : 'Suivre'}
          </button>
        </header>
        <p className="mt-2 text-sm font-semibold text-sky">{post.tags.join(', ')}</p>
        <p className="mt-1 text-[15px] leading-relaxed">{translated ? post.translation : post.text}</p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 dark:bg-raised-dark">
            <MapPin className="h-3.5 w-3.5 text-tomato" /> {post.place}
          </span>
          {post.transport && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              <TrainIcon className="h-3.5 w-3.5" /> {post.transport}
            </span>
          )}
          {post.budget && <span className="rounded-full bg-sun/40 px-2.5 py-1 text-neutral-900 dark:bg-sun/20 dark:text-sun">💶 {post.budget}</span>}
        </div>

        <div className={cx('mt-3 grid gap-1.5', post.photos.length > 1 && 'grid-cols-2')}>
          {post.photos.map((src, i) => (
            <button key={src} onClick={() => setPhoto(src)} className={cx('relative overflow-hidden rounded-sm', post.photos.length > 1 ? 'aspect-[6/5]' : 'aspect-[4/3] rounded-xl')}>
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === post.photos.length - 1 && (
                <span className="absolute right-2 top-2 rounded-full bg-neutral-800/80 px-2.5 py-0.5 text-sm text-white">
                  {post.photos.length}/{post.totalPhotos}
                </span>
              )}
            </button>
          ))}
        </div>

        <footer className="mt-3 flex items-center gap-3 px-1">
          {post.translation && (
            <button onClick={() => setTranslated((v) => !v)} className="flex items-center gap-2" aria-pressed={translated}>
              <Languages className="h-5 w-5 text-neutral-500 dark:text-neutral-300" />
              <span className="rounded-md bg-neutral-200 px-3 py-1 text-xs font-semibold dark:bg-raised-dark">{translated ? 'Français' : post.lang}</span>
            </button>
          )}
          <span className="flex items-center gap-1 text-sm text-neutral-500">
            <Eye className="h-4 w-4" /> {post.views}
          </span>
          <button onClick={() => setLiked((v) => !v)} aria-label="J'aime" className="ml-1">
            <Heart className={cx('h-5 w-5', liked && 'text-tomato')} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => setReplying(true)} aria-label="Commenter">
            <MessageCircle className="h-5 w-5" />
          </button>
          <span className="ml-auto flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-300">
            {post.source} <Contact className="h-4 w-4" />
          </span>
        </footer>
      </article>

      <ul className="space-y-4 pl-12 pr-2 text-[15px]">
        {comments.map((c) => (
          <CommentRow key={c.id} comment={c} handle={post.handle} onReply={() => setReplying(true)} />
        ))}
      </ul>

      {replying && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendReply()
          }}
          className="ml-12 mr-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 dark:bg-card-dark"
        >
          <input autoFocus value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Écrire une réponse…" className="flex-1 bg-transparent outline-none" />
          <button type="submit" className="font-semibold text-sky">
            Envoyer
          </button>
        </form>
      )}

      {photo && (
        <div className="animate-fade-in absolute inset-0 z-50 grid place-items-center bg-black/90" onClick={() => setPhoto(null)}>
          <img src={photo} alt="" className="max-h-full max-w-full" />
          <button aria-label="Fermer" className="absolute right-5 top-[max(env(safe-area-inset-top),20px)] text-white">
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  )
}

function CommentRow({ comment, handle, onReply }: { comment: Comment; handle: string; onReply: () => void }) {
  const [translated, setTranslated] = useState(false)
  return (
    <li className="flex gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-700">
      <img src={comment.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className="font-semibold">{comment.author}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-white" />
          <span className="text-xs text-neutral-400">{comment.time}</span>
        </p>
        <p className="mt-1">
          {translated && comment.translation ? comment.translation : comment.text}
          {comment.lang && (
            <>
              {' '}
              <span className="text-sky">{handle}</span>.
            </>
          )}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <button onClick={onReply} className="font-semibold text-sky">
            Reply
          </button>
          {comment.lang && (
            <button onClick={() => setTranslated((v) => !v)} className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-0.5 text-xs font-semibold dark:border-neutral-600 dark:bg-raised-dark">
              <Languages className="h-3.5 w-3.5" /> {translated ? 'Français' : comment.lang}
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function StoryViewer({ story, onClose }: { story: Story; onClose: () => void }) {
  const [i, setI] = useState(0)
  const slide = story.slides[i]
  const next = () => (i + 1 < story.slides.length ? setI(i + 1) : onClose())

  useEffect(() => {
    const t = setTimeout(next, SLIDE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  return (
    <div className="animate-fade-in absolute inset-0 z-50 bg-black text-white">
      <img key={slide.photo} src={slide.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      <div className="absolute inset-x-3 top-[max(env(safe-area-inset-top),16px)] flex gap-1">
        {story.slides.map((s, j) => (
          <div key={s.photo + j} className="h-1 flex-1 overflow-hidden rounded-full bg-white/40">
            <div
              key={`${i}-${j}`}
              className="h-full origin-left bg-white"
              style={{ transform: j < i ? 'scaleX(1)' : 'scaleX(0)', animation: j === i ? `fill-bar ${SLIDE_MS}ms linear forwards` : undefined }}
            />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[max(calc(env(safe-area-inset-top)+28px),44px)] flex items-center gap-3">
        <img src={story.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <span className="flex items-center gap-1 font-semibold">
          {story.user} {!story.isMe && <BadgeCheck className="h-4 w-4 text-sky" fill="white" />}
        </span>
        <button onClick={onClose} aria-label="Fermer" className="ml-auto">
          <X className="h-7 w-7" />
        </button>
      </div>
      <button aria-label="Précédent" className="absolute inset-y-0 left-0 w-1/3" onClick={() => setI(Math.max(0, i - 1))} />
      <button aria-label="Suivant" className="absolute inset-y-0 right-0 w-2/3" onClick={next} />
      <p className="pointer-events-none absolute inset-x-6 bottom-16 text-2xl font-semibold drop-shadow-lg">{slide.caption}</p>
    </div>
  )
}

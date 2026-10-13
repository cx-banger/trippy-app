// Sample content for the prototype. Every text and image shown in the app comes from here.

const img = (name: string) => `/images/${name}`

export type Category = 'PLACES' | 'COUNTRYSIDE' | 'OUTDOOR'
export const CATEGORIES = ['ALL', 'PLACES', 'COUNTRYSIDE', 'OUTDOOR'] as const
export type CategoryFilter = (typeof CATEGORIES)[number]

export type Trip = {
  id: string
  name: string
  shortName: string // label on the Home cards
  region: string
  members: number
  days: number
  hotDeal: boolean
  color: string
  textOnColor: 'dark' | 'light'
  category: Category
  photo: string
  logo: string
  rating: number
  travelTime: string
  price: number
  bookPrice: number
  postedDaysAgo: number
  tags: { location: string; level: string; schedule: string }
  teaser: string
  intro: string
  facilities: { icon: 'wifi' | 'dinner' | 'tub' | 'pool'; label: string }[]
}

export const TRIPS: Trip[] = [
  {
    id: 'narbonne',
    name: 'Narbonne-Plage',
    shortName: 'Narbonne-Plage',
    region: 'Occitanie',
    members: 12,
    days: 2,
    hotDeal: true,
    color: '#FDE73F',
    textOnColor: 'dark',
    category: 'OUTDOOR',
    photo: img('narbonne.jpg'),
    logo: img('co-spotify.png'),
    rating: 4.3,
    travelTime: '1 hr 20 mins',
    price: 60,
    bookPrice: 55,
    postedDaysAgo: 2,
    tags: { location: 'Remote', level: 'Freshers', schedule: 'Fulltime' },
    teaser: 'Sable fin, étangs et garrigue : deux jours pour profiter de la Méditerranée en petit groupe…',
    intro:
      "Deux jours entre plage et massif de la Clape. On partage la location, les repas et les sorties paddle. Idéal pour un premier voyage avec le groupe : peu de route, beaucoup de soleil et des couchers de soleil sur les étangs.",
    facilities: [
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'pool', label: 'Beach' },
    ],
  },
  {
    id: 'marseille',
    name: 'Vieux-port de Marseille',
    shortName: 'Marseilles',
    region: 'Marseille',
    members: 17,
    days: 3,
    hotDeal: true,
    color: '#FF453A',
    textOnColor: 'light',
    category: 'PLACES',
    photo: img('marseille.jpg'),
    logo: img('co-airbnb.png'),
    rating: 4.6,
    travelTime: '3 hrs 50 mins',
    price: 125,
    bookPrice: 110,
    postedDaysAgo: 5,
    tags: { location: 'Sydney', level: '1-5 years exp.', schedule: 'Part-time' },
    teaser: 'Airbnb was born in 2007 when two Hosts welcomed three guests to their San Francisco home…',
    intro:
      "Trois jours pour découvrir Marseille depuis le Vieux-Port : le Panier, les calanques en bateau et Notre-Dame-de-la-Garde au coucher du soleil. Hébergement en appartement partagé à deux pas du port.",
    facilities: [
      { icon: 'wifi', label: '1 Heater' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'tub', label: '1 Tub' },
    ],
  },
  {
    id: 'biarritz',
    name: 'Phares de Biarritz',
    shortName: 'Phare de Biarritz',
    region: 'Nouvelle-Aquitaine',
    members: 11,
    days: 5,
    hotDeal: false,
    color: '#3300E0',
    textOnColor: 'light',
    category: 'COUNTRYSIDE',
    photo: img('biarritz.jpg'),
    logo: img('co-google.png'),
    rating: 4.5,
    travelTime: '2 hrs 40 mins',
    price: 85,
    bookPrice: 75,
    postedDaysAgo: 2,
    tags: { location: 'New York', level: '3 years exp.', schedule: 'Fulltime' },
    teaser: "UX Designers are the synthesis of design and development. They take Google's most innovative product concepts…",
    intro:
      "In a UX Designer job, you'll need both types of skills to develop the next generation of products. You'll partner with Researchers and Designers to define and deliver new features. Le séjour inclut le phare, le Rocher de la Vierge, une journée surf à la Côte des Basques et une soirée à Saint-Jean-de-Luz.",
    facilities: [
      { icon: 'wifi', label: '1 Heater' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'tub', label: '1 Tub' },
      { icon: 'pool', label: 'Pool' },
    ],
  },
]

export const CITIES = ['Toulouse, FRA', 'Paris, FRA', 'Lyon, FRA', 'Bordeaux, FRA', 'Montpellier, FRA']

export type Brand = { id: string; name: string; bannerTitle?: string; logo: string; followers: string; banner: string }

export const BRANDS: Record<string, Brand> = {
  occitanie: { id: 'occitanie', name: 'Tourisme Occitanie', bannerTitle: 'Tourisme en Occitanie', logo: img('logo-occitanie.png'), followers: '2.2M', banner: '#B9CDB4' },
  aude: { id: 'aude', name: 'Aude Tourisme', bannerTitle: 'Aude - Sud France', logo: img('logo-aude.png'), followers: '1.2M', banner: '#EBB9B2' },
  paris: { id: 'paris', name: "Paris Je t'aime", bannerTitle: "Paris je T'aime", logo: img('logo-paris.png'), followers: '1.1M', banner: '#B9CDB4' },
  normandie: { id: 'normandie', name: 'Normandie Tourisme', logo: img('logo-normandie.png'), followers: '2.1M', banner: '#B9CDB4' },
  fun: { id: 'fun', name: 'Funbooker', logo: img('logo-fun.png'), followers: '2.2M', banner: '#F6C1E0' },
  montpellier: { id: 'montpellier', name: 'Montpelier Tourisme', logo: img('logo-montpellier.png'), followers: '1.1M', banner: '#B9CDB4' },
  europe: { id: 'europe', name: 'Visit Europe', logo: img('logo-visiteurope.png'), followers: '3.4M', banner: '#B9CDB4' },
}

export type Story = { id: string; user: string; avatar: string; ring: string; isMe?: boolean; slides: { photo: string; caption: string }[] }

export const STORIES: Story[] = [
  {
    id: 'me',
    user: 'Ruffles',
    avatar: img('av-ruffles.png'),
    ring: 'transparent',
    isMe: true,
    slides: [{ photo: img('narbonne.jpg'), caption: 'Week-end à Narbonne-Plage ☀️' }],
  },
  {
    id: 'aude',
    user: 'sabanok...',
    avatar: img('logo-aude.png'),
    ring: 'conic-gradient(#F4B400,#E94E1B,#8A6BD1,#F4B400)',
    slides: [
      { photo: img('forest.jpg'), caption: 'Forêt des Fanges : 12 km de fraîcheur' },
      { photo: img('narbonne.jpg'), caption: 'Les plages audoises cet été' },
    ],
  },
  {
    id: 'occitanie',
    user: 'blue_bouy',
    avatar: img('logo-occitanie.png'),
    ring: 'conic-gradient(#6EA8FE,#FDE73F,#9AD0A0,#6EA8FE)',
    slides: [{ photo: img('marseille.jpg'), caption: 'Escale méditerranéenne' }],
  },
  {
    id: 'fun',
    user: 'waggles',
    avatar: img('logo-fun.png'),
    ring: 'conic-gradient(#FF3D7F,#FF9F1C,#FF3D7F)',
    slides: [{ photo: img('canal.jpg'), caption: 'Amsterdam by night' }],
  },
  {
    id: 'paris',
    user: 'steve.loves',
    avatar: img('logo-paris.png'),
    ring: 'conic-gradient(#FF3D7F,#FF9F1C,#E1306C,#FF3D7F)',
    slides: [{ photo: img('paris-boat.jpg'), caption: 'Croisière sur le canal Saint-Martin' }],
  },
  {
    id: 'europe',
    user: 'Ruffles',
    avatar: img('logo-visiteurope.png'),
    ring: 'conic-gradient(#21B5B0,#1189B0,#21B5B0)',
    slides: [{ photo: img('rijksmuseum.jpg'), caption: 'Rijksmuseum, Amsterdam' }],
  },
]

export type Highlight = { id: string; brand: string; title: string; photo: string; closest?: string }

export const HIGHLIGHTS: Highlight[] = [
  { id: 'h1', brand: 'occitanie', title: 'Taking a boat tour through Canals', photo: img('rijksmuseum.jpg') },
  { id: 'h2', brand: 'occitanie', title: 'Taking a boat tour through Canals', photo: img('canal.jpg'), closest: '7.35pm' },
  { id: 'h3', brand: 'paris', title: 'Plus belle des visites guidées de Paris à bord !', photo: img('paris-boat.jpg') },
  { id: 'h4', brand: 'aude', title: "A la rencontre des Audois - Top des randos de l'été", photo: img('forest.jpg') },
  { id: 'h5', brand: 'aude', title: 'Les plus belles plages de la côte audoise', photo: img('narbonne.jpg') },
]

export type Comment = { id: string; author: string; avatar: string; text: string; time: string; lang?: string; translation?: string }

export type Post = {
  id: string
  author: string
  handle: string
  avatar: string
  subtitle: string
  time: string
  tags: string[]
  text: string
  translation: string
  photos: string[]
  totalPhotos: number
  views: number
  source: string
  comments: Comment[]
}

export const POSTS: Post[] = [
  {
    id: 'p1',
    author: 'Teguh Mahesa',
    handle: '@TagMeh',
    avatar: img('av-teguh.png'),
    subtitle: 'North Bali Reef Conservation',
    time: '2 hours ago',
    tags: ['#northbali', '#relax'],
    text: 'A very interesting place and worth visiting if you are in the north of Bali. 🏔️🚵',
    translation: "Un endroit très intéressant qui vaut le détour si vous êtes dans le nord de Bali. 🏔️🚵",
    photos: [img('bali-gate.jpg'), img('bali-palms.jpg')],
    totalPhotos: 5,
    views: 23,
    source: '@BaliTourism',
    comments: [
      {
        id: 'c1',
        author: 'Apta Bugantara',
        avatar: img('av-apta.png'),
        text: 'Keren acara barongnya sungguh luar bissa',
        time: '2 hours ago',
        lang: 'Indonesian',
        translation: 'Le spectacle de barong était vraiment incroyable',
      },
    ],
  },
]

export type Contact = { id: string; name: string; avatar: string; verified?: boolean; brand?: boolean }

export const CONTACTS: Record<string, Contact> = {
  daniel: { id: 'daniel', name: 'Daniel Jones', avatar: img('av-daniel.png') },
  sarah: { id: 'sarah', name: 'Sarah East', avatar: img('av-sarah.png') },
  sofia: { id: 'sofia', name: 'Sofia Brooks', avatar: img('av-sofia.png') },
  david: { id: 'david', name: 'David Smith', avatar: img('av-david.png') },
  maya: { id: 'maya', name: 'Maya Wilson', avatar: img('av-maya.png') },
  emily: { id: 'emily', name: 'Emily Harrison', avatar: img('av-emily.png') },
  occitanie: { id: 'occitanie', name: 'Tourisme Occitanie', avatar: img('logo-occitanie.png'), verified: true, brand: true },
  oscar: { id: 'oscar', name: 'Ocar Carter', avatar: img('av-oscar.png') },
  toscane: { id: 'toscane', name: 'Road Trip en Toscane', avatar: img('logo-group.png'), verified: true },
}

export type Message = {
  id: string
  from: string // contact id, or 'me'
  author?: string
  authorColor?: string
  text: string
  time: string
  pinned?: boolean
  kind?: 'text' | 'event' | 'poll'
}

export type Poll = { question: string; options: { id: string; label: string; votes: number }[]; hoursLeft: number }

export type Conversation = {
  id: string
  contact: string
  preview: string
  time: string
  unread: number
  boldPreview?: boolean
  followable?: boolean
  messages: Message[]
  poll?: Poll
  channelName?: string // set for channels created in the app
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'toscane',
    contact: 'toscane',
    preview: 'Which quest should we take?',
    time: '10:20',
    unread: 6,
    messages: [
      {
        id: 'm1',
        from: 'max',
        author: 'Max (Organisateur)',
        authorColor: '#E5383B',
        pinned: true,
        text: 'Salut à tous, content de vous avoir dans le groupe ! Voici les premières infos pour notre road trip à Biarritz.',
        time: '10:15',
      },
      {
        id: 'm2',
        from: 'max',
        author: 'Max (Organisateur)',
        authorColor: '#E5383B',
        text: 'Dates : 10 - 14 Septembre\nItinéraire : Bayonne - Biarritz - Saint-Jean-de-Luz\nHébergement : Airbnb à Biarritz\nTransport : Location de voiture',
        time: '10:16',
      },
      {
        id: 'm3',
        from: 'kakashi',
        author: 'Kakashi Sensei',
        authorColor: '#E07A47',
        text: "Who said you will be going on a S rank quest. There are others of your level. Let's have a poll to decide the quest.",
        time: '10:16',
      },
      { id: 'm4', from: 'naruto', kind: 'event', text: 'Naruto create a poll.', time: '10:16' },
      { id: 'm5', from: 'me', kind: 'poll', text: '', time: '10:20' },
    ],
    poll: {
      question: 'Which quest should we take?',
      hoursLeft: 24,
      options: [
        { id: 'o1', label: 'Find Orochimaru secret base.', votes: 2 },
        { id: 'o2', label: "Find granny's cat", votes: 1 },
      ],
    },
  },
  {
    id: 'daniel',
    contact: 'daniel',
    preview: 'It was realy great to see you at the beach!',
    time: '10:20',
    unread: 0,
    messages: [
      { id: 'd1', from: 'me', text: 'Merci pour le week-end à Narbonne 🙌', time: '10:12' },
      { id: 'd2', from: 'daniel', text: 'It was realy great to see you at the beach!', time: '10:20' },
    ],
  },
  {
    id: 'sarah',
    contact: 'sarah',
    preview: 'Perfect',
    time: '10:02',
    unread: 6,
    boldPreview: true,
    messages: [
      { id: 's1', from: 'me', text: 'On part vendredi à 8h ?', time: '09:58' },
      { id: 's2', from: 'sarah', text: 'Perfect', time: '10:02' },
    ],
  },
  {
    id: 'sofia',
    contact: 'sofia',
    preview: "Let's catchup when you are back from Biarritz",
    time: 'Hier',
    unread: 0,
    messages: [{ id: 'f1', from: 'sofia', text: "Let's catchup when you are back from Biarritz", time: 'Hier' }],
  },
  {
    id: 'david',
    contact: 'david',
    preview: 'Thanks',
    time: 'Hier',
    unread: 0,
    messages: [
      { id: 'v1', from: 'me', text: "Je t'ai envoyé l'itinéraire", time: 'Hier' },
      { id: 'v2', from: 'david', text: 'Thanks', time: 'Hier' },
    ],
  },
  {
    id: 'maya',
    contact: 'maya',
    preview: 'Hey, how are you doing ?',
    time: 'Tuesday',
    unread: 2,
    boldPreview: true,
    messages: [{ id: 'y1', from: 'maya', text: 'Hey, how are you doing ?', time: 'Tuesday' }],
  },
  {
    id: 'emily',
    contact: 'emily',
    preview: 'Send through your work and I will have a look',
    time: '',
    unread: 1,
    boldPreview: true,
    messages: [{ id: 'e1', from: 'emily', text: 'Send through your work and I will have a look', time: 'Monday' }],
  },
  {
    id: 'occitanie',
    contact: 'occitanie',
    preview: "Découvrez l'engagement du Comité Régional du Tourisme",
    time: '',
    unread: 0,
    boldPreview: true,
    followable: true,
    messages: [{ id: 'o1', from: 'occitanie', text: "Découvrez l'engagement du Comité Régional du Tourisme pour un tourisme durable 🌿", time: 'Monday' }],
  },
  {
    id: 'oscar',
    contact: 'oscar',
    preview: 'Check out this funny video from the trip',
    time: '',
    unread: 0,
    followable: true,
    messages: [{ id: 'k1', from: 'oscar', text: 'Check out this funny video from the trip 😂', time: 'Sunday' }],
  },
]

export const conversationName = (c: Conversation) => c.channelName ?? CONTACTS[c.contact]?.name ?? 'Conversation'

export const GROUP_FILTERS = ['All', 'Most active', 'Popular', 'New', 'Indépendants'] as const

export type Goal = { id: string; name: string; saved: number; target: number; left: string; color: string; text: 'dark' | 'light'; icon: 'hand' | 'plane' | 'home' }

export const GOALS: Goal[] = [
  { id: 'hobbies', name: 'Hobbies', saved: 48.24, target: 80.4, left: '30 days left', color: '#FF453A', text: 'light', icon: 'hand' },
  { id: 'vacances', name: 'Vacances', saved: 29.37, target: 60, left: '30 days left', color: '#FDE73F', text: 'dark', icon: 'plane' },
  { id: 'logement', name: 'Logement', saved: 39.67, target: 85.5, left: '3 years left', color: '#3300E0', text: 'light', icon: 'home' },
]

export const GOAL_COLORS = [
  { color: '#FF453A', text: 'light' as const },
  { color: '#FDE73F', text: 'dark' as const },
  { color: '#3300E0', text: 'light' as const },
  { color: '#1189B0', text: 'light' as const },
  { color: '#B9CDB4', text: 'dark' as const },
]

export const ME = { name: 'Ruffles', avatar: img('av-me.png') }

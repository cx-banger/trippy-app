// Sample content for the prototype. Every text and image shown in the app comes from here.

export const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}`

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
  logo: string // emblem of the destination (city or tourism office), never a company brand
  rating: number
  travelTime: string
  price: number
  bookPrice: number
  postedDaysAgo: number
  tags: { transport: string; co2: string; group: string } // low-carbon travel first
  teaser: string
  intro: string
  facilities: { icon: 'heater' | 'dinner' | 'parking' | 'bike' | 'luggage' | 'accessible'; label: string }[] // SNCF pictograms
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
    logo: img('logo-aude.png'),
    rating: 4.3,
    travelTime: '1 hr 20 mins',
    price: 60,
    bookPrice: 55,
    postedDaysAgo: 2,
    tags: { transport: 'Train TER', co2: '−92 % CO₂', group: '12 places' },
    teaser: 'Sable fin, étangs et garrigue : deux jours pour profiter de la Méditerranée en petit groupe…',
    intro:
      "Deux jours entre plage et massif de la Clape. On partage la location, les repas et les sorties paddle. Idéal pour un premier voyage avec le groupe : peu de route, beaucoup de soleil et des couchers de soleil sur les étangs.",
    facilities: [
      { icon: 'bike', label: 'Vélos' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'parking', label: 'Parking' },
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
    logo: img('city-marseille.svg'),
    rating: 4.6,
    travelTime: '3 hrs 50 mins',
    price: 125,
    bookPrice: 110,
    postedDaysAgo: 5,
    tags: { transport: 'Train + covoit', co2: '−85 % CO₂', group: '17 places' },
    teaser: 'Le Panier, les calanques en bateau et la Bonne Mère au coucher du soleil, en appartement partagé…',
    intro:
      "Trois jours pour découvrir Marseille depuis le Vieux-Port : le Panier, les calanques en bateau et Notre-Dame-de-la-Garde au coucher du soleil. Hébergement en appartement partagé à deux pas du port.",
    facilities: [
      { icon: 'heater', label: '1 Heater' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'luggage', label: 'Bagagerie' },
      { icon: 'accessible', label: 'Accès PMR' },
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
    logo: img('city-biarritz.svg'),
    rating: 4.5,
    travelTime: '2 hrs 40 mins',
    price: 85,
    bookPrice: 75,
    postedDaysAgo: 2,
    tags: { transport: 'Intercités', co2: '−90 % CO₂', group: '11 places' },
    teaser: 'Phare, Rocher de la Vierge et surf à la Côte des Basques : cinq jours au rythme du Pays basque…',
    intro:
      "Cinq jours au Pays basque, en auberge de jeunesse et en groupe. Le séjour inclut le phare, le Rocher de la Vierge, une journée surf à la Côte des Basques et une soirée à Saint-Jean-de-Luz.",
    facilities: [
      { icon: 'heater', label: '1 Heater' },
      { icon: 'dinner', label: 'Dinner' },
      { icon: 'parking', label: 'Parking' },
      { icon: 'bike', label: 'Vélos' },
    ],
  },
]

export const CITIES = ['Toulouse, FRA', 'Paris, FRA', 'Lyon, FRA', 'Bordeaux, FRA', 'Montpellier, FRA']

/** Who runs a channel. Only verified accounts can run one (offices, certified guides, partners). */
export type Brand = {
  id: string
  name: string
  bannerTitle?: string
  logo: string
  followers: string
  banner: string
  kind: 'office' | 'guide' | 'partner'
  about: string
}

export const BRANDS: Record<string, Brand> = {
  occitanie: { id: 'occitanie', kind: 'office', name: 'Tourisme Occitanie', bannerTitle: 'Tourisme en Occitanie', logo: img('logo-occitanie.png'), followers: '2.2M', banner: '#B9CDB4', about: 'Comité régional du tourisme' },
  aude: { id: 'aude', kind: 'office', name: 'Aude Tourisme', bannerTitle: 'Aude - Sud France', logo: img('logo-aude.png'), followers: '1.2M', banner: '#EBB9B2', about: 'Office départemental' },
  paris: { id: 'paris', kind: 'office', name: "Paris Je t'aime", bannerTitle: "Paris je T'aime", logo: img('logo-paris.png'), followers: '1.1M', banner: '#B9CDB4', about: 'Office du tourisme de Paris' },
  normandie: { id: 'normandie', kind: 'office', name: 'Normandie Tourisme', logo: img('logo-normandie.png'), followers: '2.1M', banner: '#B9CDB4', about: 'Comité régional du tourisme' },
  montpellier: { id: 'montpellier', kind: 'office', name: 'Montpellier Tourisme', logo: img('logo-montpellier.png'), followers: '1.1M', banner: '#B9CDB4', about: 'Office de tourisme métropolitain' },
  europe: { id: 'europe', kind: 'office', name: 'Visit Europe', logo: img('logo-visiteurope.png'), followers: '3.4M', banner: '#B9CDB4', about: 'Commission européenne du tourisme' },
  lea: { id: 'lea', kind: 'guide', name: 'Léa Martin', logo: img('guide-lea.svg'), followers: '48K', banner: '#B9CDB4', about: 'Guide certifiée · Pyrénées' },
  inaki: { id: 'inaki', kind: 'guide', name: 'Iñaki Etxeberria', logo: img('guide-inaki.svg'), followers: '21K', banner: '#EBB9B2', about: 'Guide certifié · Pays basque' },
  fun: { id: 'fun', kind: 'partner', name: 'Funbooker', logo: img('logo-fun.png'), followers: '2.2M', banner: '#F6C1E0', about: 'Activités partenaires' },
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

// ——— Messagerie ———
// Only people with a (free) Trippy account can be added to a group: CONTACTS is that directory.

export type Contact = { id: string; name: string; avatar: string; handle: string; verified?: boolean }

export const CONTACTS: Record<string, Contact> = {
  daniel: { id: 'daniel', name: 'Daniel Jones', handle: '@danieljones', avatar: img('av-daniel.png') },
  sarah: { id: 'sarah', name: 'Sarah East', handle: '@sarah.east', avatar: img('av-sarah.png') },
  sofia: { id: 'sofia', name: 'Sofia Brooks', handle: '@sofiab', avatar: img('av-sofia.png') },
  david: { id: 'david', name: 'David Smith', handle: '@davids', avatar: img('av-david.png') },
  maya: { id: 'maya', name: 'Maya Wilson', handle: '@maya.w', avatar: img('av-maya.png') },
  emily: { id: 'emily', name: 'Emily Harrison', handle: '@emilyh', avatar: img('av-emily.png') },
  oscar: { id: 'oscar', name: 'Oscar Carter', handle: '@oscarc', avatar: img('av-oscar.png') },
  max: { id: 'max', name: 'Max Durand', handle: '@max.roadtrip', avatar: img('av-max.png') },
  teguh: { id: 'teguh', name: 'Teguh Mahesa', handle: '@TagMeh', avatar: img('av-teguh.png') },
}

// ——— Feed ——— (after CONTACTS: comments are written by Trippy members)

export type Comment = { id: string; author: string; avatar: string; text: string; time: string; lang?: string; translation?: string }

export type Post = {
  id: string
  author: string
  handle: string
  avatar: string
  subtitle: string
  time: string
  place: string // shown with a pin under the text
  transport?: string // how the Tripper got there
  budget?: string
  tags: string[]
  text: string
  lang?: string // set when the text is not in French
  translation?: string
  photos: string[]
  totalPhotos: number
  views: number
  source: string
  comments: Comment[]
}

/** Comment written by a Trippy member (see CONTACTS). */
const comment = (id: string, who: string, text: string, time: string): Comment => {
  const person = CONTACTS[who]
  return { id, author: person.name, avatar: person.avatar, text, time }
}

export const POSTS: Post[] = [
  {
    id: 'p-lisbon',
    author: 'Sarah East',
    handle: '@sarah.east',
    avatar: img('av-sarah.png'),
    subtitle: 'Interrail · étape 3',
    time: 'il y a 1 h',
    place: 'Alfama, Lisbonne · Portugal',
    transport: 'Train + tram 28',
    budget: '42 €/jour',
    tags: ['#lisbonne', '#interrail', '#tram28'],
    text: "Astuce du jour : prenez le tram 28 au terminus Martim Moniz tôt le matin, il est presque vide et vous traversez toute l'Alfama pour le prix d'un ticket. Le soir, on a trouvé du fado gratuit dans les petits bars du quartier 🎶",
    photos: [img('lisbon.jpg')],
    totalPhotos: 6,
    views: 312,
    source: '@VisitLisboa',
    comments: [comment('cl1', 'daniel', 'Tu dors où là-bas ? 👀', 'il y a 40 min'), comment('cl2', 'sarah', 'Auberge de jeunesse à Baixa, 24 € la nuit avec le petit-déj', 'il y a 32 min')],
  },
  {
    id: 'p-etretat',
    author: 'Normandie Tourisme',
    handle: '@normandietourisme',
    avatar: img('logo-normandie.png'),
    subtitle: 'Office de tourisme',
    time: 'il y a 3 h',
    place: 'Étretat · Normandie',
    transport: 'TER jusqu’au Havre + bus',
    tags: ['#etretat', '#falaises', '#randonnee'],
    text: "L'Aiguille et la Porte d'Aval 🌊 Montez au sommet de la falaise par le sentier côtier : une courte marche et une vue imprenable. Vérifiez l'horaire des marées avant de descendre sur les galets.",
    photos: [img('etretat.jpg')],
    totalPhotos: 4,
    views: 1840,
    source: '@normandietourisme',
    comments: [comment('ce1', 'maya', 'On y va le mois prochain avec le groupe !', 'il y a 2 h')],
  },
  {
    id: 'p-prague',
    author: 'Daniel Jones',
    handle: '@danieljones',
    avatar: img('av-daniel.png'),
    subtitle: 'Road trip Europe centrale',
    time: 'il y a 5 h',
    place: 'Pont Charles, Prague · Tchéquie',
    transport: 'Bus de nuit',
    budget: '35 €/jour',
    tags: ['#prague', '#sunrise', '#petitbudget'],
    text: "Woke up at 5am for this and zero regrets. At sunrise the Charles Bridge is empty, by 9am you can't move 🌅",
    lang: 'English',
    translation: 'Réveil à 5 h pour ça et zéro regret. Au lever du soleil, le pont Charles est vide ; à 9 h, on ne peut plus bouger 🌅',
    photos: [img('prague.jpg'), img('budapest.jpg')],
    totalPhotos: 9,
    views: 527,
    source: '@VisitCzechia',
    comments: [comment('cp1', 'oscar', 'Next stop Budapest ? 🇭🇺', 'il y a 4 h'), comment('cp2', 'daniel', 'Yes ! Le train direct, en réservant tôt ça reste pas cher', 'il y a 4 h')],
  },
  {
    id: 'p-verdon',
    author: 'Léa Martin',
    handle: '@lea.guide',
    avatar: img('guide-lea.svg'),
    subtitle: 'Guide certifiée',
    time: 'hier',
    place: 'Gorges du Verdon · Provence',
    transport: 'Covoiturage depuis Marseille',
    tags: ['#verdon', '#kayak', '#nature'],
    text: "Le Verdon hors saison, c'est l'eau turquoise sans la foule. Louez un kayak à plusieurs pour partager le prix. Restez sur les sentiers balisés et remportez vos déchets 🌿",
    photos: [img('verdon.jpg')],
    totalPhotos: 3,
    views: 960,
    source: '@lea.guide',
    comments: [comment('cv1', 'sofia', 'Tu fais des sorties guidées en octobre ?', 'hier')],
  },
  {
    id: 'p-nyhavn',
    author: 'Maya Wilson',
    handle: '@maya.w',
    avatar: img('av-maya.png'),
    subtitle: 'Week-end au Danemark',
    time: 'hier',
    place: 'Nyhavn, Copenhague · Danemark',
    transport: 'Vélo en libre-service',
    budget: '60 €/jour',
    tags: ['#copenhague', '#velo', '#hygge'],
    text: 'Copenhague à vélo, c’est la meilleure façon de visiter : des pistes partout et pas besoin de payer les transports. Pique-nique sur les quais de Nyhavn plutôt que les restos 🚲🥪',
    photos: [img('nyhavn.jpg')],
    totalPhotos: 5,
    views: 274,
    source: '@VisitCopenhagen',
    comments: [],
  },
  {
    id: 'p-sevilla',
    author: 'Visit Europe',
    handle: '@visiteurope',
    avatar: img('logo-visiteurope.png'),
    subtitle: 'Commission européenne du tourisme',
    time: 'il y a 2 jours',
    place: 'Plaza de España, Séville · Espagne',
    transport: 'Train à grande vitesse depuis Madrid',
    tags: ['#sevilla', '#andalousie', '#europe'],
    text: 'La Plaza de España est gratuite et ouverte à tous. Venez en fin d’après-midi : la lumière est dorée et la chaleur retombe. Les bancs en céramique représentent les provinces espagnoles 🇪🇸',
    photos: [img('sevilla.jpg')],
    totalPhotos: 7,
    views: 4210,
    source: '@visiteurope',
    comments: [comment('cs1', 'emily', 'Trop beau, je l’ajoute à ma liste', 'il y a 1 jour')],
  },
  {
    id: 'p-porto',
    author: 'Sofia Brooks',
    handle: '@sofiab',
    avatar: img('av-sofia.png'),
    subtitle: 'Erasmus à Porto',
    time: 'il y a 3 jours',
    place: 'Ribeira, Porto · Portugal',
    transport: 'Métro + à pied',
    budget: '30 €/jour',
    tags: ['#porto', '#erasmus', '#douro'],
    text: 'Vue sur la Ribeira depuis Gaia. Bon plan : traversez le pont Dom-Luís par le tablier du haut à pied, c’est gratuit et la vue est meilleure qu’en croisière 😉',
    photos: [img('porto.jpg')],
    totalPhotos: 4,
    views: 189,
    source: '@VisitPorto',
    comments: [comment('cpo1', 'david', 'Les francesinhas c’est où le mieux ?', 'il y a 2 jours')],
  },
  {
    id: 'p-annecy',
    author: 'David Smith',
    handle: '@davids',
    avatar: img('av-david.png'),
    subtitle: 'Week-end Alpes',
    time: 'il y a 4 jours',
    place: 'Palais de l’Isle, Annecy · Haute-Savoie',
    transport: 'Train + vélo autour du lac',
    budget: '50 €/jour',
    tags: ['#annecy', '#lac', '#velo'],
    text: 'Annecy en deux jours : vieille ville le matin, tour du lac à vélo l’après-midi sur la piste cyclable. Et la baignade dans le lac, c’est gratuit 🏊',
    photos: [img('annecy.jpg')],
    totalPhotos: 8,
    views: 402,
    source: '@AnnecyTourisme',
    comments: [],
  },
  {
    id: 'p-hallstatt',
    author: 'Emily Harrison',
    handle: '@emilyh',
    avatar: img('av-emily.png'),
    subtitle: 'Hiver en Autriche',
    time: 'il y a 5 jours',
    place: 'Hallstatt · Autriche',
    transport: 'Train + bateau',
    budget: '55 €/jour',
    tags: ['#hallstatt', '#autriche', '#hiver'],
    text: 'Hallstatt en février : neige, brume sur le lac et beaucoup moins de monde qu’en été. On arrive par le bateau depuis la gare, c’est déjà une balade ❄️',
    photos: [img('hallstatt.jpg')],
    totalPhotos: 5,
    views: 351,
    source: '@VisitAustria',
    comments: [comment('ch1', 'sarah', 'Ajouté à mon Interrail ✅', 'il y a 4 jours')],
  },
  {
    id: 'p-bali',
    author: 'Teguh Mahesa',
    handle: '@TagMeh',
    avatar: img('av-teguh.png'),
    subtitle: 'North Bali Reef Conservation',
    time: 'il y a 6 jours',
    place: 'Nord de Bali · Indonésie',
    tags: ['#northbali', '#relax'],
    text: 'A very interesting place and worth visiting if you are in the north of Bali. 🏔️🚵',
    lang: 'English',
    translation: 'Un endroit très intéressant qui vaut le détour si vous êtes dans le nord de Bali. 🏔️🚵',
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
        time: 'il y a 6 jours',
        lang: 'Indonesian',
        translation: 'Le spectacle de barong était vraiment incroyable',
      },
    ],
  },
]

export type FileType = 'pdf' | 'docx' | 'xlsx'
export type SharedFile = { name: string; type: FileType; size: string; preview?: FilePreview }
/** What the in-app viewer shows. Imported files only have a name and size. */
export type FilePreview = { kind: 'text'; lines: string[] } | { kind: 'checklist'; items: { label: string; done: boolean }[] } | { kind: 'table'; head: string[]; rows: string[][] }

export type Message = {
  id: string
  from: string // contact id, brand id, 'me' or 'system'
  text: string
  time: string
  pinned?: boolean
  kind?: 'text' | 'event' | 'poll' | 'file' | 'tip'
  pollId?: string
  file?: SharedFile
  photo?: string // tips in channels
}

export type Poll = { id: string; question: string; options: { id: string; label: string; votes: number }[]; closesIn: string; author: string }

export type Conversation = {
  id: string
  kind: 'direct' | 'group' | 'channel'
  /** direct: contact id · channel: brand id (or 'me' for channels created in the app) */
  with: string
  name?: string // groups and channels created in the app
  members?: string[] // groups: contact ids (without me)
  admins?: string[]
  tripId?: string // group organised around a Trippy trip
  visibility?: 'public' | 'private' // channels
  preview: string
  time: string
  unread: number
  messages: Message[]
  polls?: Record<string, Poll>
}

const PB_ITINERARY: FilePreview = {
  kind: 'text',
  lines: [
    'Road trip Pays basque — 10 au 14 septembre',
    'J1 · Train de nuit Paris → Bayonne, arrivée 7h12',
    'J2 · Bayonne : Petit Bayonne, halles, chocolat',
    'J3 · Biarritz : phare, Rocher de la Vierge, surf Côte des Basques',
    'J4 · Saint-Jean-de-Luz en bus (ligne 3, 2 €)',
    'J5 · Retour en TER + TGV',
    'Hébergement : auberge de jeunesse de Biarritz (dortoir 6)',
  ],
}

const PB_BUDGET: FilePreview = {
  kind: 'table',
  head: ['Poste', 'Total', 'Par pers.'],
  rows: [
    ['Train de nuit A/R', '312 €', '78 €'],
    ['Auberge (4 nuits)', '416 €', '104 €'],
    ['Courses + repas', '240 €', '60 €'],
    ['Cours de surf', '140 €', '35 €'],
    ['Bus locaux', '32 €', '8 €'],
    ['Total', '1 140 €', '285 €'],
  ],
}

const PB_PACKING: FilePreview = {
  kind: 'checklist',
  items: [
    { label: "Carte d'identité + carte Avantage Jeune", done: true },
    { label: 'Combinaison de surf (ou location sur place)', done: false },
    { label: 'Gourde et tote bag', done: true },
    { label: 'Sac de couchage léger pour le train', done: false },
  ],
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'paysbasque',
    kind: 'group',
    with: 'paysbasque',
    name: 'Road trip Pays basque',
    members: ['max', 'sarah', 'daniel', 'sofia'],
    admins: ['max'],
    tripId: 'biarritz',
    preview: 'Sondage : comment on rejoint Biarritz ?',
    time: '10:20',
    unread: 4,
    messages: [
      { id: 'm1', from: 'max', pinned: true, text: 'Salut à tous, content de vous avoir dans le groupe ! Toutes les infos sont dans les fichiers ci-dessous 👇', time: '10:15' },
      { id: 'm2', from: 'max', kind: 'file', text: '', time: '10:15', file: { name: 'Itinéraire Pays basque.pdf', type: 'pdf', size: '248 Ko', preview: PB_ITINERARY } },
      { id: 'm3', from: 'max', kind: 'file', text: '', time: '10:16', file: { name: 'Budget partagé.xlsx', type: 'xlsx', size: '32 Ko', preview: PB_BUDGET } },
      { id: 'm4', from: 'sarah', kind: 'file', text: '', time: '10:17', file: { name: "Liste d'affaires.docx", type: 'docx', size: '18 Ko', preview: PB_PACKING } },
      { id: 'm5', from: 'sarah', text: 'Le train de nuit revient moins cher que la voiture et on gagne une nuit 🚆', time: '10:18' },
      { id: 'm6', from: 'system', kind: 'event', text: 'Daniel a créé un sondage', time: '10:19' },
      { id: 'm7', from: 'daniel', kind: 'poll', pollId: 'pb-transport', text: '', time: '10:20' },
    ],
    polls: {
      'pb-transport': {
        id: 'pb-transport',
        author: 'daniel',
        question: 'Comment on rejoint Biarritz ?',
        closesIn: '24 h',
        options: [
          { id: 'o1', label: 'Train de nuit (78 €)', votes: 2 },
          { id: 'o2', label: 'Covoiturage (45 €)', votes: 1 },
          { id: 'o3', label: 'Bus longue distance (39 €)', votes: 0 },
        ],
      },
    },
  },
  {
    id: 'narbonne-we',
    kind: 'group',
    with: 'narbonne-we',
    name: 'Week-end Narbonne-Plage',
    members: ['daniel', 'maya'],
    admins: ['me'],
    tripId: 'narbonne',
    preview: 'Maya : je ramène le paddle !',
    time: 'Hier',
    unread: 0,
    messages: [
      { id: 'n1', from: 'system', kind: 'event', text: 'Tu as créé le groupe', time: 'Lundi' },
      { id: 'n2', from: 'me', text: 'TER samedi 8h04 depuis Toulouse, qui est chaud ?', time: 'Lundi' },
      { id: 'n3', from: 'maya', text: 'Je ramène le paddle !', time: 'Hier' },
    ],
  },
  {
    id: 'daniel',
    kind: 'direct',
    with: 'daniel',
    preview: "C'était trop bien de te voir à la plage !",
    time: '10:20',
    unread: 0,
    messages: [
      { id: 'd1', from: 'me', text: 'Merci pour le week-end à Narbonne 🙌', time: '10:12' },
      { id: 'd2', from: 'daniel', text: "C'était trop bien de te voir à la plage !", time: '10:20' },
    ],
  },
  {
    id: 'sarah',
    kind: 'direct',
    with: 'sarah',
    preview: 'Parfait',
    time: '10:02',
    unread: 2,
    messages: [
      { id: 's1', from: 'me', text: 'On part vendredi à 8h ?', time: '09:58' },
      { id: 's2', from: 'sarah', text: 'Parfait', time: '10:02' },
    ],
  },
  {
    id: 'sofia',
    kind: 'direct',
    with: 'sofia',
    preview: 'On se fait un café quand tu rentres de Biarritz',
    time: 'Hier',
    unread: 0,
    messages: [{ id: 'f1', from: 'sofia', text: 'On se fait un café quand tu rentres de Biarritz', time: 'Hier' }],
  },
  {
    id: 'david',
    kind: 'direct',
    with: 'david',
    preview: 'Merci !',
    time: 'Hier',
    unread: 0,
    messages: [
      { id: 'v1', from: 'me', text: "Je t'ai envoyé l'itinéraire", time: 'Hier' },
      { id: 'v2', from: 'david', text: 'Merci !', time: 'Hier' },
    ],
  },
  {
    id: 'maya',
    kind: 'direct',
    with: 'maya',
    preview: 'Hey, ça va ?',
    time: 'Mardi',
    unread: 1,
    messages: [{ id: 'y1', from: 'maya', text: 'Hey, ça va ?', time: 'Mardi' }],
  },
  {
    id: 'oscar',
    kind: 'direct',
    with: 'oscar',
    preview: 'Regarde la vidéo du trip 😂',
    time: 'Dimanche',
    unread: 0,
    messages: [{ id: 'k1', from: 'oscar', text: 'Regarde la vidéo du trip 😂', time: 'Dimanche' }],
  },
  {
    id: 'ch-occitanie',
    kind: 'channel',
    with: 'occitanie',
    preview: 'Astuce : les tarifs jeunes sur les trains liO',
    time: '09:30',
    unread: 1,
    messages: [
      { id: 'oc1', from: 'occitanie', kind: 'tip', text: "Découvrez l'engagement du Comité Régional du Tourisme pour un tourisme durable 🌿", time: 'Lundi', photo: img('forest.jpg') },
      { id: 'oc2', from: 'occitanie', kind: 'tip', text: "Astuce : la Région propose des tarifs très réduits sur les trains liO pour les jeunes. Vérifiez les conditions sur le site liO avant de réserver 🚆", time: '09:30' },
    ],
  },
  {
    id: 'ch-aude',
    kind: 'channel',
    with: 'aude',
    preview: 'Les plus belles plages de la côte audoise',
    time: 'Hier',
    unread: 0,
    messages: [
      { id: 'au1', from: 'aude', kind: 'tip', text: 'Les plus belles plages de la côte audoise, accessibles en bus depuis Narbonne 🏖️', time: 'Hier', photo: img('narbonne.jpg') },
      { id: 'au2', from: 'aude', kind: 'tip', text: 'Randonnée : la forêt des Fanges reste fraîche même en plein été. Comptez 3 h pour la boucle de 12 km.', time: 'Hier', photo: img('forest.jpg') },
    ],
  },
  {
    id: 'ch-lea',
    kind: 'channel',
    with: 'lea',
    preview: 'Bivouac : les 3 règles à connaître',
    time: 'Mardi',
    unread: 0,
    messages: [
      { id: 'le1', from: 'lea', kind: 'tip', text: "Bivouac dans les Pyrénées : on s'installe au coucher du soleil, on repart au lever, et on ne laisse aucune trace. Je réponds à vos questions en commentaire 🏕️", time: 'Mardi' },
    ],
  },
  {
    id: 'ch-paris',
    kind: 'channel',
    with: 'paris',
    preview: 'Les musées nationaux gratuits pour les moins de 26 ans',
    time: 'Lundi',
    unread: 0,
    messages: [
      { id: 'pa1', from: 'paris', kind: 'tip', text: "Moins de 26 ans et résident de l'UE ? Les collections permanentes des musées nationaux sont gratuites 🎨", time: 'Lundi', photo: img('paris-boat.jpg') },
    ],
  },
]

/** Brands without a channel in CONVERSATIONS get an empty one when opened. */
export const channelFor = (brandId: string): Conversation => ({
  id: `ch-${brandId}`,
  kind: 'channel',
  with: brandId,
  preview: '',
  time: '',
  unread: 0,
  messages: [{ id: 'welcome', from: brandId, kind: 'tip', text: `Bienvenue sur la chaîne de ${BRANDS[brandId]?.name ?? 'ce partenaire'} ! Suivez-la pour recevoir nos conseils.`, time: '' }],
})

export function conversationName(c: Conversation) {
  if (c.name) return c.name
  if (c.kind === 'channel') return BRANDS[c.with]?.name ?? 'Chaîne'
  return CONTACTS[c.with]?.name ?? 'Conversation'
}

export function conversationAvatar(c: Conversation): string | undefined {
  if (c.kind === 'channel') return BRANDS[c.with]?.logo
  if (c.kind === 'direct') return CONTACTS[c.with]?.avatar
  return undefined
}

/** Display name and avatar of whoever sent a message. */
export function sender(id: string): { name: string; avatar?: string } {
  if (id === 'me') return { name: 'Toi', avatar: ME.avatar }
  if (CONTACTS[id]) return { name: CONTACTS[id].name, avatar: CONTACTS[id].avatar }
  if (BRANDS[id]) return { name: BRANDS[id].name, avatar: BRANDS[id].logo }
  return { name: '' }
}

export const AUTHOR_COLORS = ['#E5383B', '#E07A47', '#1189B0', '#5A27F7', '#2E7D5B']

export const KIND_LABEL: Record<Brand['kind'], string> = { office: 'Office de tourisme', guide: 'Guide certifié·e', partner: 'Partenaire' }

export const CHANNEL_FILTERS = ['Tous', 'Offices de tourisme', 'Guides certifiés', 'Partenaires', 'Populaires'] as const

// ——— Portefeuille ———

export type Goal = {
  id: string
  name: string
  saved: number
  target: number
  deadline: string // ISO date
  color: string
  text: 'dark' | 'light'
  icon: 'hand' | 'plane' | 'home'
  tripId?: string
}

export const GOALS: Goal[] = [
  { id: 'paysbasque', name: 'Pays basque', saved: 185, target: 285, deadline: '2027-09-01', color: '#FF453A', text: 'light', icon: 'plane', tripId: 'biarritz' },
  { id: 'interrail', name: 'Interrail été 2027', saved: 120, target: 450, deadline: '2027-06-15', color: '#FDE73F', text: 'dark', icon: 'plane' },
  { id: 'loisirs', name: 'Sorties & loisirs', saved: 48, target: 80, deadline: '2026-12-20', color: '#3300E0', text: 'light', icon: 'hand' },
]

export const GOAL_COLORS = [
  { color: '#FF453A', text: 'light' as const },
  { color: '#FDE73F', text: 'dark' as const },
  { color: '#3300E0', text: 'light' as const },
  { color: '#1189B0', text: 'light' as const },
  { color: '#B9CDB4', text: 'dark' as const },
]

export type Tip = { id: string; title: string; body: string; saving: string; tag: 'Transport' | 'Logement' | 'Culture' | 'Au quotidien'; url: string }

/** Real schemes for young travellers in Europe. Amounts change: the app links to the official page. */
export const SAVING_TIPS: Tip[] = [
  {
    id: 'discovereu',
    title: 'DiscoverEU',
    body: "Tu as 18 ans ? L'Union européenne fait gagner des pass de train pour voyager jusqu'à 30 jours en Europe, deux sessions par an.",
    saving: 'Pass gratuit',
    tag: 'Transport',
    url: 'https://youth.europa.eu/discovereu_fr',
  },
  {
    id: 'avantage-jeune',
    title: 'Carte Avantage Jeune SNCF',
    body: 'De 12 à 27 ans : environ 30 % de réduction sur les TGV INOUI, Intercités et la plupart des TER, prix plafonnés.',
    saving: '−30 %',
    tag: 'Transport',
    url: 'https://www.sncf-connect.com/cartes-avantages',
  },
  {
    id: 'interrail',
    title: 'Pass Interrail Jeune',
    body: 'Moins de 28 ans : tarif réduit sur le pass qui donne accès aux trains de 33 pays. Idéal pour un tour d’Europe.',
    saving: 'Tarif jeune',
    tag: 'Transport',
    url: 'https://www.interrail.eu/fr',
  },
  {
    id: 'covoit',
    title: 'Covoiturage',
    body: 'Partager la route divise le prix du trajet et les émissions. Pense à le proposer dans tes groupes Trippy.',
    saving: 'Jusqu’à −75 %',
    tag: 'Transport',
    url: 'https://www.blablacar.fr',
  },
  {
    id: 'auberges',
    title: 'Auberges de jeunesse',
    body: 'Dortoirs, cuisine partagée et rencontres : la carte d’adhérent donne accès à un réseau mondial d’auberges.',
    saving: 'Dès ~25 €/nuit',
    tag: 'Logement',
    url: 'https://www.hifrance.org',
  },
  {
    id: 'musees',
    title: 'Musées gratuits',
    body: "En France, les collections permanentes des musées et monuments nationaux sont gratuites pour les moins de 26 ans résidents de l'UE.",
    saving: 'Gratuit',
    tag: 'Culture',
    url: 'https://www.culture.gouv.fr',
  },
  {
    id: 'eyca',
    title: 'Carte Jeune Européenne',
    body: 'Des réductions dans plus de 35 pays sur les transports, la culture et les loisirs, jusqu’à 30 ans.',
    saving: 'Réductions',
    tag: 'Au quotidien',
    url: 'https://www.eyca.org',
  },
  {
    id: 'courses',
    title: 'Cuisiner en groupe',
    body: 'Faire les courses ensemble et cuisiner à l’auberge revient 3 à 4 fois moins cher que le restaurant à chaque repas.',
    saving: '~−70 %',
    tag: 'Au quotidien',
    url: 'https://www.hifrance.org',
  },
]

export const ME = { name: 'Ruffles', avatar: img('av-me.png') }

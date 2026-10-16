import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import { BottomNav, PhoneFrame } from './components/ui'
import Home from './screens/Home'
import TripDetails from './screens/TripDetails'
import Discover from './screens/Discover'
import Feed from './screens/Feed'
import Savings from './screens/Savings'
import Messages from './screens/Messages'
import Chat from './screens/Chat'
import TripTicket from './screens/TripTicket'
import DesktopPreview from './DesktopPreview'

// On a computer, show the gallery of phones instead of the app itself.
// Inside those phones (iframes), or with ?app in the URL, run the app normally.
const showDesktopPreview =
  window.self === window.top &&
  !new URLSearchParams(window.location.search).has('app') &&
  window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches

function TabsLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

export default function App() {
  if (showDesktopPreview) return <DesktopPreview />
  return (
    <StoreProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <PhoneFrame>
          <Routes>
            <Route element={<TabsLayout />}>
              <Route index element={<Home />} />
              <Route path="feed" element={<Feed />} />
              <Route path="discover" element={<Discover />} />
              <Route path="savings" element={<Savings />} />
              <Route path="messages" element={<Messages />} />
            </Route>
            <Route path="trip/:id" element={<TripDetails />} />
            <Route path="chat/:id" element={<Chat />} />
            <Route path="ticket/:id" element={<TripTicket />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </PhoneFrame>
      </BrowserRouter>
    </StoreProvider>
  )
}

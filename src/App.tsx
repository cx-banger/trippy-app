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

function TabsLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

export default function App() {
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
            <Route path="*" element={<Home />} />
          </Routes>
        </PhoneFrame>
      </BrowserRouter>
    </StoreProvider>
  )
}

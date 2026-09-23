import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import FAB from './FAB'

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-bg flex">
      <Sidebar />

      <main className="flex-1 min-w-0 pb-28 lg:pb-0">
        <div className="mx-auto w-full max-w-2xl pt-safe">
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <FAB />
    </div>
  )
}
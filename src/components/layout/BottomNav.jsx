import { NavLink } from 'react-router-dom'
import { Home, List, Banknote, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/data/constants'

const items = [
  { to: ROUTES.HOME, icon: Home, label: 'خانه' },
  { to: ROUTES.EXPENSES, icon: List, label: 'مصارف' },
  { type: 'spacer' },
  { to: ROUTES.SAVINGS, icon: Banknote, label: 'پس‌انداز' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'تنظیمات' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-2 inset-x-3 z-30 pb-safe">
      <div
        className={cn(
          'glass-strong rounded-[26px] h-16 flex items-center justify-around px-1.5 max-w-md mx-auto'
        )}
      >
        {items.map((item, i) => {
          if (item.type === 'spacer') {
            return <div key={`spacer-${i}`} className="w-16" />
          }
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5',
                  'flex-1 h-full rounded-2xl transition-all duration-200',
                  'press-sm',
                  isActive
                    ? 'text-brand'
                    : 'text-fg-muted'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      isActive && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
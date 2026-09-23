import { NavLink } from 'react-router-dom'
import { Home, List, Banknote, Settings, BarChart3, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES, APP_NAME, APP_VERSION, APP_TAGLINE } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import Button from '@/components/ui/Button'

const items = [
  { to: ROUTES.HOME, icon: Home, label: 'خانه' },
  { to: ROUTES.EXPENSES, icon: List, label: 'مصارف' },
  { to: ROUTES.SAVINGS, icon: Banknote, label: 'پس‌انداز' },
  { to: ROUTES.REPORTS, icon: BarChart3, label: 'گزارش‌ها' },
  { to: ROUTES.SETTINGS, icon: Settings, label: 'تنظیمات' },
]

export default function Sidebar() {
  const openSheet = useUIStore((s) => s.openSheet)

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0',
        'w-64 border-l border-border',
        'bg-card',
        'sticky top-0 h-dvh overflow-y-auto'
      )}
    >
      {/* لوگو */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src="/icons/logo.png"
            alt={APP_NAME}
            className="size-11 rounded-2xl object-cover bg-brand-soft"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="min-w-0">
            <div className="font-bold text-fg truncate">{APP_NAME}</div>
            <div className="text-[11px] text-fg-muted truncate">
              {APP_TAGLINE}
            </div>
          </div>
        </div>
      </div>

      {/* منو */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-btn',
                  'transition-colors duration-200',
                  isActive
                    ? 'bg-brand-soft text-brand font-medium'
                    : 'text-fg-secondary hover:bg-brand-soft/40 hover:text-fg'
                )
              }
            >
              <Icon size={20} strokeWidth={2.2} />
              <span className="text-[15px]">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* دکمه‌ی ثبت + نسخه */}
      <div className="p-4 border-t border-border space-y-3">
        <Button
          full
          icon={Plus}
          onClick={() => openSheet('quick-add', { tab: 'expense' })}
        >
          ثبت مصرف
        </Button>
        <div className="text-center text-[11px] text-fg-muted">
          {APP_NAME} • نسخه {APP_VERSION}
        </div>
      </div>
    </aside>
  )
}
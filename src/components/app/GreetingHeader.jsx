import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon } from 'lucide-react'
import { formatFullDate } from '@/lib/jalali'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import Avatar from '@/components/ui/Avatar'
import { ROUTES } from '@/data/constants'

export default function GreetingHeader() {
  const navigate = useNavigate()
  const name = useSettingsStore((s) => s.getDisplayName())
  const initial = useSettingsStore((s) => s.getInitial())
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  return (
    <header className="flex items-center gap-3 px-1">
      <Avatar name={initial} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text truncate">
          سلام {name} <span className="inline-block">👋</span>
        </div>
        <div className="text-xs text-text-muted truncate mt-0.5">
          {formatFullDate(new Date())}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => navigate(ROUTES.EXPENSES)}
          className="size-10 rounded-full neu-raised-sm flex items-center justify-center text-text transition press-sm"
          aria-label="جستجو"
        >
          <Search size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="size-10 rounded-full neu-raised-sm flex items-center justify-center text-text transition press-sm"
          aria-label="تغییر تم"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
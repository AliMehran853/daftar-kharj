import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  action,
  className,
}) {
  const navigate = useNavigate()

  return (
    <header className={cn('flex items-center gap-3 h-14', className)}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="size-10 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg transition-colors shrink-0"
          aria-label="بازگشت"
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-fg truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-fg-muted truncate mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  )
}
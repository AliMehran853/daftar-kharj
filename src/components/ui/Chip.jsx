import { cn } from '@/lib/utils'

export default function Chip({
  active = false,
  onClick,
  icon: Icon,
  className,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 shrink-0',
        'h-9 px-3.5 rounded-full',
        'text-sm font-medium',
        'press-sm transition-all duration-200 select-none',
        active
          ? 'bg-brand text-white shadow-brand border border-white/15'
          : 'bg-card text-fg-secondary border border-border shadow-soft hover:bg-brand-soft/40 hover:border-border-strong',
        className
      )}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
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
          ? 'text-white'
          : 'text-text-secondary neu-raised-sm hover:shadow-raised',
        className
      )}
      style={
        active
          ? {
              background: 'var(--primary)',
              boxShadow:
                'inset 2px 2px 6px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(255,255,255,0.08)',
            }
          : undefined
      }
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  )
}
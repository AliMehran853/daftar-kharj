import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand text-white shadow-brand border border-white/10 hover:bg-brand-dark',
  secondary:
    'bg-card text-fg border border-border shadow-soft hover:bg-brand-soft/40 hover:border-border-strong',
  danger:
    'bg-danger text-white shadow-md border border-white/10 hover:opacity-95',
  ghost:
    'bg-transparent text-fg hover:bg-brand-soft/40',
  outline:
    'bg-transparent text-brand border border-brand hover:bg-brand-soft/40',
}

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-[12px] gap-1.5',
  md: 'h-11 px-4 text-[15px] rounded-btn gap-2',
  lg: 'h-14 px-6 text-base rounded-[18px] gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  full = false,
  icon: Icon,
  iconSize,
  className,
  children,
  ...rest
}) {
  const isDisabled = disabled || loading
  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex items-center justify-center font-medium',
        'press',
        'select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:shadow-none',
        variants[variant],
        sizes[size],
        full && 'w-full',
        className
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        Icon && <Icon size={iconSize || (size === 'lg' ? 22 : 18)} />
      )}
      {children && <span>{children}</span>}
    </button>
  )
}
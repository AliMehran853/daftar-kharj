import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-gradient-brand text-white shadow-raised-sm hover:shadow-raised active:shadow-inset-sm',
  secondary:
    'neu-raised-sm text-text hover:shadow-raised active:shadow-inset-sm',
  danger:
    'bg-expense text-white shadow-raised-sm hover:shadow-raised active:shadow-inset-sm',
  ghost:
    'bg-transparent text-text hover:bg-surface-high active:bg-surface-deep',
  outline:
    'bg-transparent text-primary border border-primary/25 hover:bg-primary/5 active:bg-primary/10',
}

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-card-sm gap-1.5',
  md: 'h-11 px-4 text-[15px] rounded-btn gap-2',
  lg: 'h-14 px-6 text-base rounded-card gap-2.5',
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
        'press-sm select-none',
        'disabled:opacity-50 disabled:pointer-events-none',
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
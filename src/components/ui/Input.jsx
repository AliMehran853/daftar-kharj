import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    className,
    containerClassName,
    ...rest
  },
  ref
) {
  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-fg-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          {...rest}
          className={cn(
            'w-full h-11 rounded-btn',
            'bg-card border border-border',
            'text-fg placeholder:text-fg-muted',
            'px-3.5 text-[15px]',
            'transition-colors duration-200',
            'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
            'disabled:opacity-50',
            Icon && 'pr-10',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
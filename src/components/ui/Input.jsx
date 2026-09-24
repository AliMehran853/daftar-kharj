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
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          {...rest}
          className={cn(
            'w-full h-11 rounded-btn',
            'neu-inset',
            'text-text placeholder:text-text-muted',
            'px-3.5 text-[15px]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
            'disabled:opacity-50',
            Icon && 'pr-10',
            error && 'border-expense/40 focus:ring-expense/20',
            className
          )}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-expense">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
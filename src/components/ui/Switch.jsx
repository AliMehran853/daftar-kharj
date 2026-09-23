import { cn } from '@/lib/utils'

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className,
}) {
  const dims =
    size === 'sm'
      ? { track: 'w-9 h-5', thumb: 'size-4', shift: 'translate-x-4 rtl:-translate-x-4' }
      : { track: 'w-12 h-7', thumb: 'size-5.5', shift: 'translate-x-5 rtl:-translate-x-5' }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full',
        'transition-colors duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
        dims.track,
        checked ? 'bg-brand' : 'bg-border',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm',
          'transition-transform duration-200 ease-out',
          'start-0.5',
          dims.thumb,
          checked && dims.shift
        )}
      />
    </button>
  )
}
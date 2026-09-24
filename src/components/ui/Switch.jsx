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
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        'press-sm',
        dims.track,
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      style={{
        background: checked ? 'var(--primary)' : 'var(--surface-deep)',
        boxShadow: checked
          ? 'inset 2px 2px 6px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(255,255,255,0.1)'
          : 'inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.7)',
      }}
    >
      <span
        className={cn(
          'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md',
          'transition-transform duration-200 ease-out',
          'start-0.5',
          dims.thumb,
          checked && dims.shift
        )}
      />
    </button>
  )
}
import { cn } from '@/lib/utils'

const DEFAULT_FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'expense', label: 'مصارف' },
  { key: 'income', label: 'درآمد جانبی' },
  { key: 'transfer', label: 'انتقال‌ها' },
]

export default function FilterChips({
  value = 'all',
  onChange,
  filters = DEFAULT_FILTERS,
  className,
}) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0',
        className
      )}
    >
      {filters.map((f) => {
        const active = value === f.key
        return (
          <button
            key={f.key}
            onClick={() => onChange?.(f.key)}
            className={cn(
              'shrink-0 h-9 px-4 rounded-full',
              'text-[13px] font-medium',
              'transition-all duration-200 select-none active:scale-95',
              active
                ? 'bg-brand text-white shadow-brand'
                : 'bg-card text-fg-secondary border border-border hover:bg-brand-soft'
            )}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
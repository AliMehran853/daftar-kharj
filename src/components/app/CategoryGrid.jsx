import * as Icons from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CategoryGrid({
  categories = [],
  selectedId,
  onSelect,
  columns = 3,
  className,
}) {
  if (!categories.length) {
    return (
      <div className="text-center text-sm text-fg-muted py-6">
        دسته‌ای یافت نشد
      </div>
    )
  }

  const gridCols =
    columns === 4
      ? 'grid-cols-4'
      : columns === 2
        ? 'grid-cols-2'
        : 'grid-cols-3'

  return (
    <div className={cn('grid gap-2', gridCols, className)}>
      {categories.map((cat) => {
        const Icon = Icons[cat.icon] || MoreHorizontal
        const active = selectedId === cat.id

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5',
              'py-3 px-2 rounded-2xl border transition-all duration-200',
              'active:scale-[0.97]',
              active
                ? 'border-brand bg-brand-soft'
                : 'border-border bg-card hover:bg-brand-soft/30'
            )}
          >
            <div
              className="size-11 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${cat.color}1A`,
                color: cat.color,
              }}
            >
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <div
              className={cn(
                'text-[11px] font-medium text-center leading-tight',
                active ? 'text-brand' : 'text-fg-secondary'
              )}
            >
              {cat.name}
            </div>
          </button>
        )
      })}
    </div>
  )
}
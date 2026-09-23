import { cn } from '@/lib/utils'
import IconCircle from '@/components/ui/IconCircle'
import { toPersianDigits } from '@/lib/utils'

export default function StatCard({
  icon,
  color = '#D81B60',
  label,
  value,
  unit,
  onClick,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'bg-card border border-border rounded-card p-4',
        'depth-card',
        'text-right transition-all duration-200',
        onClick &&
          'press hover:-translate-y-0.5 hover:border-border-strong cursor-pointer',
        className
      )}
    >
      <IconCircle icon={icon} color={color} size="md" />
      <div className="mt-3 text-[13px] text-fg-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-fg leading-none tabular-nums">
          {typeof value === 'number' ? toPersianDigits(value) : value}
        </span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
    </button>
  )
}
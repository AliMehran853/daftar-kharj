import { cn } from '@/lib/utils'
import IconCircle from '@/components/ui/IconCircle'
import { toPersianDigits } from '@/lib/utils'

export default function StatCard({
  icon,
  color = 'var(--primary)',
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
        'rounded-card p-4 text-right transition-all duration-200',
        'neu-raised-sm',
        onClick && 'press-sm hover:shadow-raised',
        className
      )}
    >
      <IconCircle icon={icon} color={color} size="md" />
      <div className="mt-3 text-[13px] text-text-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-text leading-none tabular-nums">
          {typeof value === 'number' ? toPersianDigits(value) : value}
        </span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
    </button>
  )
}
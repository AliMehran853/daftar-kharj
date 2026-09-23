import { cn, formatMoney } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export default function StatSmallCard({
  label,
  value,
  color = '#D81B60',
  prefix = '',
  unit = 'افغانی',
  className,
}) {
  const privacyMode = useUIStore((s) => s.privacyMode)
  const displayValue = privacyMode ? '••••' : formatMoney(Math.abs(value))

  return (
    <div
      className={cn('rounded-card p-3.5 border depth-card', className)}
      style={{
        background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`,
        borderColor: `${color}25`,
      }}
    >
      <div className="text-[11px] text-fg-muted mb-1">{label}</div>
      <div
        className="text-[16px] font-bold leading-tight tabular-nums"
        style={{ color }}
      >
        {prefix}
        {displayValue}
      </div>
      <div className="text-[10px] text-fg-muted mt-0.5">{unit}</div>
    </div>
  )
}
import { cn, formatMoney } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

export default function StatSmallCard({
  label,
  value,
  color = 'var(--primary)',
  prefix = '',
  unit = 'افغانی',
  className,
}) {
  const privacyMode = useUIStore((s) => s.privacyMode)
  const displayValue = privacyMode ? '••••' : formatMoney(Math.abs(value))

  return (
    <div
      className={cn('rounded-card p-3.5 neu-raised-sm', className)}
    >
      <div className="text-[11px] text-text-muted mb-1">{label}</div>
      <div
        className="text-[16px] font-bold leading-tight tabular-nums"
        style={{ color }}
      >
        {prefix}
        {displayValue}
      </div>
      <div className="text-[10px] text-text-muted mt-0.5">{unit}</div>
    </div>
  )
}
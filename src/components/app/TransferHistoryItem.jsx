import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatMoney } from '@/lib/utils'
import { formatTime, relativeDayLabel } from '@/lib/jalali'
import { TX_SUBTYPES } from '@/data/constants'

export default function TransferHistoryItem({ tx }) {
  const isDeposit = tx.subtype === TX_SUBTYPES.TO_SAVINGS
  const Icon = isDeposit ? ArrowDown : ArrowUp
  const color = isDeposit ? 'var(--income)' : 'var(--expense)'
  const sign = isDeposit ? '+' : '−'
  const label = isDeposit ? 'واریز' : 'برداشت'

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="size-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `${color}15`,
          color,
          boxShadow: `inset 2px 2px 6px rgba(0,0,0,0.08), inset -2px -2px 6px rgba(255,255,255,0.7)`,
        }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text text-[15px]">{label}</div>
        <div className="text-[11px] text-text-muted mt-0.5 truncate">
          {tx.note || relativeDayLabel(tx.date)} •{' '}
          {formatTime(new Date(tx.createdAt))}
        </div>
      </div>

      <div className="text-left shrink-0">
        <div className="font-semibold text-[15px] tabular-nums" style={{ color }}>
          {sign}
          {formatMoney(tx.amount)}
        </div>
      </div>
    </div>
  )
}
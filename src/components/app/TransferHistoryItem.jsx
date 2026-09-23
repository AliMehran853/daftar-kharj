import { ArrowDown, ArrowUp } from 'lucide-react'
import { cn, formatMoney } from '@/lib/utils'
import { formatTime, relativeDayLabel } from '@/lib/jalali'
import { TX_SUBTYPES } from '@/data/constants'

export default function TransferHistoryItem({ tx }) {
  const isDeposit = tx.subtype === TX_SUBTYPES.TO_SAVINGS
  const Icon = isDeposit ? ArrowDown : ArrowUp
  const color = isDeposit ? '#4A9FE8' : '#00B894'
  const sign = isDeposit ? '+' : '−'
  const label = isDeposit ? 'واریز' : 'برداشت'

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="size-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-fg text-[15px]">{label}</div>
        <div className="text-[11px] text-fg-muted mt-0.5 truncate">
          {tx.note || relativeDayLabel(tx.date)} • {formatTime(new Date(tx.createdAt))}
        </div>
      </div>

      <div className="text-left shrink-0">
        <div className="font-semibold text-[15px]" style={{ color }}>
          {sign}
          {formatMoney(tx.amount)}
        </div>
      </div>
    </div>
  )
}
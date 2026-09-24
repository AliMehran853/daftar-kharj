import { ArrowDown, ArrowUp } from 'lucide-react'
import { formatMoney } from '@/lib/utils'
import { formatTime, relativeDayLabel, isSameDay } from '@/lib/jalali'
import { TX_SUBTYPES } from '@/data/constants'

export default function TransferHistoryItem({ tx }) {
  const isDeposit = tx.subtype === TX_SUBTYPES.TO_SAVINGS
  const Icon = isDeposit ? ArrowDown : ArrowUp
  const color = isDeposit ? 'var(--income)' : 'var(--expense)'
  const sign = isDeposit ? '+' : '−'
  const label = isDeposit ? 'واریز' : 'برداشت'

  const txDate = new Date(tx.date)
  const today = new Date()
  const isToday = isSameDay(txDate, today)

  const dayLabel = relativeDayLabel(tx.date)
  const isRecent = dayLabel === 'امروز' || dayLabel === 'دیروز'
  const timeLabel = formatTime(new Date(tx.createdAt))

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="size-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
        }}
      >
        <Icon size={18} strokeWidth={2.4} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text text-[15px]">{label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[11px] font-medium ${
              isRecent ? 'text-primary' : 'text-text-muted'
            }`}
          >
            {dayLabel}
          </span>
          {isToday && (
            <>
              <span className="text-[10px] text-text-muted/60">•</span>
              <span className="text-[11px] text-text-muted truncate">
                {timeLabel}
              </span>
            </>
          )}
          {tx.note && (
            <>
              <span className="text-[10px] text-text-muted/60">•</span>
              <span className="text-[11px] text-text-muted truncate max-w-[100px]">
                {tx.note}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-left shrink-0">
        <div
          className="font-semibold text-[15px] tabular-nums"
          style={{ color }}
        >
          {sign}
          {formatMoney(tx.amount)}
        </div>
      </div>
    </div>
  )
}
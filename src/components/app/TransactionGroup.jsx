import { cn, formatMoney } from '@/lib/utils'
import { relativeDayLabel, formatJalaliLong } from '@/lib/jalali'
import { toPersianDigits } from '@/lib/utils'
import TransactionList from './TransactionList'

export default function TransactionGroup({
  date,
  transactions,
  onItemClick,
}) {
  if (!transactions.length) return null

  const total = transactions.reduce((sum, tx) => {
    if (tx.type === 'income') return sum + Number(tx.amount)
    if (tx.type === 'expense') return sum - Number(tx.amount)
    return sum
  }, 0)

  const isPositive = total >= 0

  return (
    <section className="space-y-1">
      {/* هدر روز */}
      <div className="flex items-center justify-between pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-fg">
            {relativeDayLabel(date)}
          </span>
          <span className="text-[11px] text-fg-muted">
            {formatJalaliLong(date)}
          </span>
        </div>
        <span
          className={cn(
            'text-[12px] font-medium',
            isPositive ? 'text-brand' : 'text-fg-muted'
          )}
        >
          {isPositive ? '+' : '−'}
          {formatMoney(Math.abs(total))}
        </span>
      </div>

      {/* لیست */}
      <div className="divide-y divide-border">
        <TransactionList
          transactions={transactions}
          onItemClick={onItemClick}
        />
      </div>
    </section>
  )
}
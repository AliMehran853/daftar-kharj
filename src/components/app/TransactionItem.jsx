import * as Icons from 'lucide-react'
import { cn, formatMoney } from '@/lib/utils'
import { formatTime } from '@/lib/jalali'
import { CATEGORY_MAP } from '@/data/categories'
import IconCircle from '@/components/ui/IconCircle'
import { MoreHorizontal } from 'lucide-react'

function resolveCategory(categoryId) {
  return CATEGORY_MAP[categoryId] || {
    name: 'سایر',
    icon: 'MoreHorizontal',
    color: '#6B7280',
  }
}

export default function TransactionItem({ tx, onClick }) {
  const cat = resolveCategory(tx.categoryId)
  const Icon = Icons[cat.icon] || MoreHorizontal

  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'

  const amountColor = isIncome
    ? 'text-brand'
    : isTransfer
      ? 'text-info'
      : 'text-danger'

  const sign = isIncome ? '+' : isTransfer ? '' : '−'

  const timeLabel = formatTime(new Date(tx.createdAt))

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'w-full flex items-center gap-3 py-3 text-right',
        'transition-colors',
        onClick && 'hover:bg-brand-soft/30 active:bg-brand-soft/50 rounded-btn px-2 -mx-2'
      )}
    >
      <IconCircle icon={Icon} color={cat.color} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-fg truncate">{cat.name}</div>
        {tx.note && (
          <div className="text-xs text-fg-muted truncate mt-0.5">{tx.note}</div>
        )}
      </div>
      <div className="text-left shrink-0">
        <div className={cn('font-semibold text-[15px]', amountColor)}>
          {sign}
          {formatMoney(tx.amount)}
        </div>
        <div className="text-[11px] text-fg-muted mt-0.5">{timeLabel}</div>
      </div>
    </button>
  )
}
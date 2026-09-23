import TransactionItem from './TransactionItem'
import { cn } from '@/lib/utils'

export default function TransactionList({
  transactions = [],
  onItemClick,
  empty,
  className,
}) {
  if (!transactions.length) {
    return empty || null
  }

  return (
    <div className={cn('divide-y divide-border', className)}>
      {transactions.map((tx) => (
        <TransactionItem
          key={tx.id}
          tx={tx}
          onClick={onItemClick ? () => onItemClick(tx) : undefined}
        />
      ))}
    </div>
  )
}
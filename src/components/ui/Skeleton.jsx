import { cn } from '@/lib/utils'

export default function Skeleton({ className, rounded = 'rounded-btn' }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-border',
        rounded,
        className
      )}
    />
  )
}
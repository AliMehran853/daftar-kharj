import { cn } from '@/lib/utils'

export default function Card({
  as: Tag = 'div',
  padded = true,
  clickable = false,
  variant = 'default', // 'default' | 'glass' | 'gradient'
  className,
  children,
  ...rest
}) {
  const baseClasses = cn(
    'rounded-card',
    padded && 'p-4',
    variant === 'default' &&
      'bg-card border border-border depth-card',
    variant === 'glass' && 'glass-strong rounded-card',
    clickable &&
      'cursor-pointer press transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong',
    className
  )

  return (
    <Tag {...rest} className={baseClasses}>
      {children}
    </Tag>
  )
}
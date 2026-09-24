import { cn } from '@/lib/utils'

export default function Card({
  as: Tag = 'div',
  padded = true,
  clickable = false,
  variant = 'raised', // 'raised' | 'raised-sm' | 'raised-lg' | 'inset' | 'flat'
  className,
  children,
  ...rest
}) {
  const variantClasses = {
    'raised': 'neu-raised rounded-card',
    'raised-sm': 'neu-raised-sm rounded-card-sm',
    'raised-lg': 'neu-raised-lg rounded-card-lg',
    'inset': 'neu-inset rounded-card',
    'flat': 'neu-flat rounded-card',
  }

  return (
    <Tag
      {...rest}
      className={cn(
        variantClasses[variant],
        padded && 'p-4',
        clickable && 'cursor-pointer press hover:shadow-raised-lg transition-all duration-200',
        className
      )}
    >
      {children}
    </Tag>
  )
}
import { cn } from '@/lib/utils'

const sizeMap = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-14',
}

const iconSizeMap = {
  sm: 15,
  md: 18,
  lg: 22,
  xl: 26,
}

export default function IconCircle({
  icon: Icon,
  color = 'var(--primary)',
  size = 'md',
  variant = 'soft',
  className,
}) {
  const iconSize = iconSizeMap[size]

  const style =
    variant === 'soft'
      ? {
          backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
          color,
        }
      : {
          backgroundColor: color,
          color: '#fff',
          boxShadow: `0 2px 6px ${color}40`,
        }

  return (
    <div
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center',
        sizeMap[size],
        className
      )}
      style={style}
    >
      {Icon && <Icon size={iconSize} strokeWidth={2.2} />}
    </div>
  )
}
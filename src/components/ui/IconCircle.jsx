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
  color = '#00B894',
  size = 'md',
  variant = 'soft', // 'soft' = پس‌زمینه‌ی ملایم، 'solid' = پررنگ
  className,
}) {
  const iconSize = iconSizeMap[size]

  const style =
    variant === 'soft'
      ? { backgroundColor: `${color}1A`, color }
      : { backgroundColor: color, color: '#fff' }

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
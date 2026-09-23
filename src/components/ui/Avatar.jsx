import { cn } from '@/lib/utils'

const sizeMap = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-xl',
}

export default function Avatar({
  name = '',
  src,
  size = 'md',
  className,
}) {
  const initial = (name || '؟').trim().charAt(0)
  return (
    <div
      className={cn(
        'shrink-0 rounded-full overflow-hidden',
        'bg-brand text-white',
        'flex items-center justify-center font-bold',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
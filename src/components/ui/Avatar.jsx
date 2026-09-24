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
        'flex items-center justify-center font-bold',
        'text-white',
        sizeMap[size],
        className
      )}
      style={{
        background: 'var(--gradient-brand)',
        boxShadow: 'var(--shadow-raised-sm)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
      }}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
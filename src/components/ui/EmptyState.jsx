import { cn } from '@/lib/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6',
        className
      )}
    >
      {Icon && (
        <div className="size-16 rounded-full bg-brand-soft flex items-center justify-center text-brand mb-4">
          <Icon size={28} />
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-fg mb-1">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-fg-muted max-w-[260px]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
import { Drawer } from 'vaul'
import { cn } from '@/lib/utils'

/**
 * Bottom Sheet پایه — wrapper روی vaul
 * استفاده:
 *   <Sheet open={open} onOpenChange={setOpen}>
 *     <Sheet.Content>
 *       ...
 *     </Sheet.Content>
 *   </Sheet>
 */
export default function Sheet({ open, onOpenChange, children, snapPoints }) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      shouldScaleBackground={false}
    >
      {children}
    </Drawer.Root>
  )
}

Sheet.Trigger = Drawer.Trigger

Sheet.Content = function SheetContent({
  title,
  showHandle = true,
  className,
  children,
}) {
  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <Drawer.Content
        className={cn(
          'fixed bottom-0 inset-x-0 z-50',
          'bg-card border-t border-border',
          'rounded-t-[28px]',
          'flex flex-col max-h-[92dvh]',
          'focus:outline-none',
          className
        )}
      >
        {showHandle && (
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>
        )}
        {title && (
          <div className="px-5 pt-3 pb-2 shrink-0">
            <Drawer.Title className="text-lg font-semibold text-fg text-center">
              {title}
            </Drawer.Title>
          </div>
        )}
        <div className="overflow-y-auto overscroll-contain">{children}</div>
      </Drawer.Content>
    </Drawer.Portal>
  )
}
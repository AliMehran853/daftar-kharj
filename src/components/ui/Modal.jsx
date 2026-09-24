import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  showClose = true,
  closeOnBackdrop = true,
  lockScroll = true,
}) {
  useEffect(() => {
    if (!open || !lockScroll) return

    const scrollY = window.scrollY
    const body = document.body

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [open, lockScroll])

  useEffect(() => {
    if (!open) return
    const handler = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-vaul-no-drag=""
          style={{
            pointerEvents: 'auto',
            touchAction: 'none',
            overscrollBehavior: 'contain',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/40"
            style={{ pointerEvents: 'auto', touchAction: 'none' }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className={cn(
              'relative w-full max-w-md',
              'rounded-card-lg',
              'p-5 max-h-[92dvh] overflow-y-auto no-scrollbar',
              className
            )}
            style={{
              background: 'var(--surface)',
              boxShadow: 'var(--modal-shadow)',
              pointerEvents: 'auto',
              touchAction: 'auto',
              overscrollBehavior: 'contain',
            }}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between mb-4">
                {title ? (
                  <h2 className="text-lg font-semibold text-text">{title}</h2>
                ) : (
                  <div />
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="size-9 rounded-full flex items-center justify-center text-text-muted transition press-sm"
                    style={{
                      background: 'var(--surface)',
                      boxShadow: 'var(--shadow-raised-sm)',
                    }}
                    aria-label="بستن"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
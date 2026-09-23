import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scrollLock } from '@/lib/utils'

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  showClose = true,
  closeOnBackdrop = true,
}) {
  useEffect(() => {
    if (!open) return
    scrollLock(true)
    return () => scrollLock(false)
  }, [open])

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop شیشه‌ای */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/40"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* کارت مودال با عمق سه‌بعدی */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className={cn(
              'relative w-full max-w-md',
              'bg-card rounded-card-lg',
              'border border-border',
              'p-5',
              className
            )}
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 4px 12px rgba(26, 15, 31, 0.10), 0 20px 48px rgba(26, 15, 31, 0.18), 0 48px 96px rgba(26, 15, 31, 0.12)',
            }}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between mb-4">
                {title ? (
                  <h2 className="text-lg font-semibold text-fg">{title}</h2>
                ) : (
                  <div />
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition press-sm"
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
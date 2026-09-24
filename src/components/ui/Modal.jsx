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
          <div
            className="absolute inset-0 backdrop-blur-md bg-black/30"
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
              'neu-raised-lg rounded-card-lg',
              'p-5',
              className
            )}
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
                    className="size-9 rounded-full neu-raised-sm flex items-center justify-center text-text-muted transition press-sm"
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
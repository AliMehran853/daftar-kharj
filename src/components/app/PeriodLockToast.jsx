import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Info } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

export default function PeriodLockToast() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)

  const open = modal === 'period-lock'

  useEffect(() => {
    if (!open) return
    const t = setTimeout(closeModal, 4500)
    return () => clearTimeout(t)
  }, [open, closeModal])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed top-3 inset-x-3 z-[70] pointer-events-none pt-safe"
        >
          <div className="pointer-events-auto max-w-md mx-auto rounded-2xl bg-card border border-border p-3.5 shadow-float flex items-start gap-3">
            <div className="size-9 rounded-full bg-info-soft text-info flex items-center justify-center shrink-0">
              <Info size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13.5px] text-fg">
                امکان ثبت در این دوره نیست
              </div>
              <div className="text-[12px] text-fg-muted mt-0.5 leading-relaxed">
                برای ثبت تراکنش، از حالت روزانه یا هفتگی استفاده کن.
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'

const ICONS = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertCircle,
}

const COLORS = {
  success: 'var(--income)',
  error: 'var(--expense)',
  info: 'var(--info)',
  warning: 'var(--warning)',
}

export default function Toast() {
  const toast = useUIStore((s) => s.toast)
  const clearToast = useUIStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => clearToast(), 3000)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-24 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
        >
          <div
            className={cn(
              'pointer-events-auto',
              'flex items-center gap-2.5 px-4 py-3 rounded-btn',
              'text-white shadow-raised'
            )}
            style={{
              background: COLORS[toast.type] || COLORS.info,
            }}
          >
            {(() => {
              const Icon = ICONS[toast.type] || Info
              return <Icon size={18} strokeWidth={2.5} />
            })()}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'

export default function FAB() {
  const { pathname } = useLocation()
  const openSheet = useUIStore((s) => s.openSheet)

  const hidden =
    pathname === ROUTES.SETTINGS ||
    pathname === ROUTES.REPORTS ||
    pathname.startsWith(ROUTES.CATEGORY)

  if (hidden) return null

  const isSavings = pathname === ROUTES.SAVINGS
  const Icon = isSavings ? ArrowLeftRight : Plus
  const key = isSavings ? 'transfer' : 'add'

  const handleClick = () => {
    if (isSavings) {
      openSheet('transfer')
    } else {
      openSheet('quick-add', { tab: 'expense' })
    }
  }

  return (
    <div className="lg:hidden fixed bottom-[72px] inset-x-0 z-40 flex justify-center pointer-events-none">
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.92, y: 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className={cn(
          'pointer-events-auto relative',
          'size-[58px] rounded-full',
          'bg-brand text-white',
          'flex items-center justify-center',
          'press-lg'
        )}
        style={{
          boxShadow:
            'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 10px rgba(216, 27, 96, 0.35), 0 12px 28px rgba(216, 27, 96, 0.30), 0 24px 48px rgba(216, 27, 96, 0.20)',
        }}
        aria-label={isSavings ? 'انتقال' : 'ثبت سریع'}
      >
        {/* حلقه‌ی نورانی بالا */}
        <span
          className="absolute top-0 inset-x-3 h-[55%] rounded-full bg-white/20 blur-md pointer-events-none"
          aria-hidden
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={key}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative flex items-center justify-center"
          >
            <Icon size={26} strokeWidth={2.4} />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
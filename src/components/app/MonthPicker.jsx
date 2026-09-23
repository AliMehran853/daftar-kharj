import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { addMonths, subMonths, isSameMonth } from 'date-fns-jalali'
import { toPersianDigits, cn } from '@/lib/utils'
import { AFGHAN_MONTHS, getMonth, getYear } from '@/lib/jalali'

export default function MonthPicker({ value, onChange, className }) {
  const isCurrentMonth = isSameMonth(value, new Date())

  const goPrev = () => onChange(subMonths(value, 1))
  const goNext = () => {
    const next = addMonths(value, 1)
    // جلوتر از ماه جاری نرو
    if (next > new Date() && !isSameMonth(next, new Date())) return
    onChange(next)
  }

  const canGoNext = !isCurrentMonth && value < new Date()

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'h-12 rounded-btn',
        'bg-card border border-border px-1',
        className
      )}
    >
      <button
        onClick={goPrev}
        className="size-10 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg transition active:scale-90"
        aria-label="ماه قبل"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex-1 text-center">
        <motion.div
          key={`${getYear(value)}-${getMonth(value)}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-[15px] font-semibold text-fg">
            {AFGHAN_MONTHS[getMonth(value)]} {toPersianDigits(getYear(value))}
          </div>
        </motion.div>
      </div>

      <button
        onClick={goNext}
        disabled={!canGoNext}
        className={cn(
          'size-10 rounded-full flex items-center justify-center transition active:scale-90',
          canGoNext
            ? 'hover:bg-brand-soft text-fg'
            : 'text-fg-muted/30 cursor-not-allowed'
        )}
        aria-label="ماه بعد"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  )
}
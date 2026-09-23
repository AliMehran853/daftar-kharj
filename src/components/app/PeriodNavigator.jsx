import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import {
  addDays,
  addMonths,
  startOfDay,
  startOfMonth,
} from 'date-fns-jalali'
import { toPersianDigits, cn } from '@/lib/utils'
import {
  AFGHAN_MONTHS,
  getMonth,
  getYear,
  getDate,
  getWeekRange,
  getMonthRange,
  formatFullDate,
} from '@/lib/jalali'
import { PERIODS } from '@/data/constants'

/* ─────────────────────────────────────────────
   جابه‌جایی تاریخ بر اساس دوره
   ───────────────────────────────────────────── */
function shiftDate(date, period, delta) {
  if (period === PERIODS.DAILY) return addDays(date, delta)
  if (period === PERIODS.WEEKLY) return addDays(date, delta * 7)
  if (period === PERIODS.YEARLY) return addMonths(date, delta * 12)
  return addMonths(date, delta) // monthly
}

/* ─────────────────────────────────────────────
   آیا می‌شه جلوتر رفت؟ (توی دوره‌ی جاری نباشه)
   ───────────────────────────────────────────── */
function canNavigateNext(date, period) {
  const now = new Date()

  if (period === PERIODS.DAILY) {
    const d = startOfDay(date).getTime()
    const n = startOfDay(now).getTime()
    return d < n
  }

  if (period === PERIODS.WEEKLY) {
    const d = getWeekRange(date).start.getTime()
    const n = getWeekRange(now).start.getTime()
    return d < n
  }

  if (period === PERIODS.YEARLY) {
    return getYear(date) < getYear(now)
  }

  // monthly
  const d = startOfMonth(date).getTime()
  const n = startOfMonth(now).getTime()
  return d < n
}

/* ─────────────────────────────────────────────
   ساخت برچسب مناسب هر دوره
   ───────────────────────────────────────────── */
function getLabel(date, period) {
  if (period === PERIODS.DAILY) {
    return formatFullDate(date) // مثل: سه‌شنبه ۳ میزان ۱۴۰۵
  }

  if (period === PERIODS.WEEKLY) {
    const { start, end } = getWeekRange(date)
    const sm = AFGHAN_MONTHS[getMonth(start)]
    const em = AFGHAN_MONTHS[getMonth(end)]
    const sy = getYear(start)
    const ey = getYear(end)
    const sd = getDate(start)
    const ed = getDate(end)

    if (sm === em && sy === ey) {
      return `${toPersianDigits(sd)} تا ${toPersianDigits(ed)} ${sm} ${toPersianDigits(sy)}`
    }
    if (sy === ey) {
      return `${toPersianDigits(sd)} ${sm} تا ${toPersianDigits(ed)} ${em} ${toPersianDigits(sy)}`
    }
    return `${toPersianDigits(sd)} ${sm} ${toPersianDigits(sy)} تا ${toPersianDigits(ed)} ${em} ${toPersianDigits(ey)}`
  }

  if (period === PERIODS.YEARLY) {
    return `سال ${toPersianDigits(getYear(date))}`
  }

  // monthly
  return `${AFGHAN_MONTHS[getMonth(date)]} ${toPersianDigits(getYear(date))}`
}

/* ─────────────────────────────────────────────
   کامپوننت اصلی
   ───────────────────────────────────────────── */
export default function PeriodNavigator({
  value,
  onChange,
  period = PERIODS.MONTHLY,
  className,
}) {
  const canGoNext = canNavigateNext(value, period)
  const label = getLabel(value, period)

  const goPrev = () => onChange(shiftDate(value, period, -1))
  const goNext = () => {
    if (!canGoNext) return
    onChange(shiftDate(value, period, 1))
  }

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
        aria-label="قبلی"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex-1 text-center min-w-0 px-2">
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="text-[14.5px] font-semibold text-fg truncate">
            {label}
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
        aria-label="بعدی"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  )
}
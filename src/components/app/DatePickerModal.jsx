import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
} from 'lucide-react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from 'date-fns-jalali'
import { cn, toPersianDigits, toISODate } from '@/lib/utils'
import {
  AFGHAN_MONTHS,
  formatJalaliLong,
  getDate,
  getMonth,
  getYear,
} from '@/lib/jalali'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const WEEKDAYS = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

function buildMonthGrid(date) {
  const first = startOfMonth(date)
  const last = endOfMonth(date)
  const days = []
  const cursor = new Date(first)
  while (cursor <= last) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  const offset = (first.getDay() + 1) % 7
  const cells = new Array(offset).fill(null).concat(days)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function dayKey(d) {
  return toISODate(d)
}

export default function DatePickerModal({
  open,
  onClose,
  value,
  onSelect,
}) {
  const [viewDate, setViewDate] = useState(new Date())
  const [selected, setSelected] = useState(todayISO())

  const today = new Date()
  const todayKey = dayKey(today)

  /* sync با value وقتی مودال باز می‌شه */
  useEffect(() => {
    if (open) {
      const v = value || toISODate(new Date())
      setViewDate(value ? new Date(value) : new Date())
      setSelected(v)
    }
  }, [open, value])

  const isCurrentMonth =
    getYear(viewDate) === getYear(today) &&
    getMonth(viewDate) === getMonth(today)

  const canGoNext = !isCurrentMonth && viewDate < today

  const handlePrev = () => setViewDate(subMonths(viewDate, 1))
  const handleNext = () => {
    if (!canGoNext) return
    setViewDate(addMonths(viewDate, 1))
  }
  const handleToday = () => {
    setViewDate(new Date())
    setSelected(toISODate(today))
  }

  /* فقط انتخاب می‌کنه، نمی‌بنده */
  const handlePick = (day) => {
    if (!day) return
    if (dayKey(day) > todayKey) return
    setSelected(toISODate(day))
  }

  /* تایید و بستن */
  const handleConfirm = () => {
    onSelect?.(selected)
    onClose?.()
  }

  const cells = buildMonthGrid(viewDate)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="انتخاب تاریخ"
      className="max-w-sm"
      lockScroll={true}
    >
      {/* هدر ماه */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            'size-9 rounded-full flex items-center justify-center transition press-sm',
            canGoNext
              ? 'hover:bg-primary/10 text-text'
              : 'text-text-muted/30 cursor-not-allowed'
          )}
          aria-label="ماه بعد"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleToday}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/10 transition press-sm"
        >
          <CalendarIcon size={14} className="text-primary" />
          <span className="text-sm font-medium text-text">
            {AFGHAN_MONTHS[getMonth(viewDate)]}{' '}
            {toPersianDigits(getYear(viewDate))}
          </span>
        </button>

        <button
          onClick={handlePrev}
          className="size-9 rounded-full hover:bg-primary/10 flex items-center justify-center text-text transition press-sm"
          aria-label="ماه قبل"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* نام روزها */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              'text-[10px] font-medium text-center py-1',
              i === 6 ? 'text-expense' : 'text-text-muted'
            )}
          >
            {d.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* شبکه‌ی روزها */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const key = dayKey(day)
          const isFuture = key > todayKey
          const isToday = isSameDay(day, today)
          const isSelected = selected === key
          const isFriday = day.getDay() === 5

          if (isFuture) {
            return (
              <div
                key={idx}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center',
                  'text-[13px] font-medium text-text-muted/25',
                  'cursor-not-allowed select-none'
                )}
              >
                {toPersianDigits(getDate(day))}
              </div>
            )
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePick(day)}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center',
                'text-[13px] font-medium transition-all duration-150',
                'press-sm',
                isSelected
                  ? 'bg-primary text-white shadow-md font-bold'
                  : isToday
                    ? 'bg-primary/15 text-primary font-bold'
                    : isFriday
                      ? 'text-expense hover:bg-expense/10'
                      : 'text-text hover:bg-primary/10'
              )}
            >
              {toPersianDigits(getDate(day))}
            </button>
          )
        })}
      </div>

      {/* پیش‌نمایش */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
          <CalendarIcon size={12} />
          <span className="text-xs font-medium">
            {formatJalaliLong(new Date(selected))}
          </span>
        </div>
      </div>

      {/* دکمه‌های عملیات */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={handleToday}>
          امروز
        </Button>
        <Button variant="primary" icon={Check} onClick={handleConfirm}>
          تایید
        </Button>
      </div>
    </Modal>
  )
}

function todayISO() {
  return toISODate(new Date())
}
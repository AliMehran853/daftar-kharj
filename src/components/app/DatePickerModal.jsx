import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
} from 'date-fns-jalali'
import { cn, toPersianDigits, toISODate } from '@/lib/utils'
import { AFGHAN_MONTHS, formatJalaliLong } from '@/lib/jalali'
import { getDate, getMonth, getYear } from '@/lib/jalali'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']

function buildMonthGrid(date) {
  const first = startOfMonth(date)
  const last = endOfMonth(date)
  const days = []
  const cursor = new Date(first)
  while (cursor <= last) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  // offset: شنبه = 0
  const offset = (first.getDay() + 1) % 7
  const cells = new Array(offset).fill(null).concat(days)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

export default function DatePickerModal({
  open,
  onClose,
  value,
  onSelect,
}) {
  const initial = value ? new Date(value) : new Date()
  const [viewDate, setViewDate] = useState(initial)

  const cells = buildMonthGrid(viewDate)
  const today = new Date()

  const handlePrev = () => setViewDate(subMonths(viewDate, 1))
  const handleNext = () => setViewDate(addMonths(viewDate, 1))
  const handleToday = () => setViewDate(new Date())

  const handlePick = (day) => {
    if (!day) return
    onSelect?.(toISODate(day))
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="انتخاب تاریخ"
      className="max-w-sm"
    >
      {/* هدر ماه */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleNext}
          className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg transition active:scale-95"
          aria-label="ماه بعد"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleToday}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brand-soft transition"
        >
          <CalendarIcon size={14} className="text-brand" />
          <span className="text-sm font-medium text-fg">
            {AFGHAN_MONTHS[getMonth(viewDate)]} {toPersianDigits(getYear(viewDate))}
          </span>
        </button>

        <button
          onClick={handlePrev}
          className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg transition active:scale-95"
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
              i === 6 ? 'text-danger' : 'text-fg-muted'
            )}
          >
            {d.slice(0, 3)}
          </div>
        ))}
      </div>

      {/* شبکه‌ی روزها */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="aspect-square" />

          const isToday = isSameDay(day, today)
          const isSelected = value && isSameDay(day, new Date(value))
          const isFriday = day.getDay() === 5

          return (
            <button
              key={idx}
              onClick={() => handlePick(day)}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center',
                'text-[13px] font-medium transition-all duration-150',
                'active:scale-90',
                isSelected
                  ? 'bg-brand text-white shadow-brand'
                  : isToday
                    ? 'bg-brand-soft text-brand font-bold'
                    : isFriday
                      ? 'text-danger hover:bg-danger-soft'
                      : 'text-fg hover:bg-brand-soft'
              )}
            >
              {toPersianDigits(getDate(day))}
            </button>
          )
        })}
      </div>

      {/* دکمه‌ها */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={handleToday}>
          امروز
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onSelect?.(toISODate(today))
            onClose?.()
          }}
        >
          انتخاب امروز
        </Button>
      </div>

      {value && (
        <p className="mt-3 text-center text-xs text-fg-muted">
          انتخاب شده: {formatJalaliLong(new Date(value))}
        </p>
      )}
    </Modal>
  )
}
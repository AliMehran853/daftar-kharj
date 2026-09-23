import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { toPersianDigits, cn } from '@/lib/utils'

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function parse24(value) {
  const fallback = { h12: 9, m: 0, period: 'AM' }
  if (!value) return fallback
  const [hStr, mStr] = value.split(':')
  const h24 = parseInt(hStr, 10)
  const m = parseInt(mStr, 10) || 0
  if (Number.isNaN(h24)) return fallback
  const period = h24 < 12 ? 'AM' : 'PM'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return { h12, m, period }
}

function to24(h12, m, period) {
  let h = h12 % 12
  if (period === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function TimePickerModal({ open, onClose, value, onSelect }) {
  const [h12, setH12] = useState(9)
  const [m, setM] = useState(0)
  const [period, setPeriod] = useState('AM')

  useEffect(() => {
    if (open) {
      const parsed = parse24(value)
      setH12(parsed.h12)
      setM(parsed.m)
      setPeriod(parsed.period)
    }
  }, [open, value])

  const handleSave = () => {
    onSelect?.(to24(h12, m, period))
    onClose?.()
  }

  const periodLabel = period === 'AM' ? 'قبل از ظهر' : 'بعد از ظهر'

  return (
    <Modal open={open} onClose={onClose} title="زمان یادآوری">
      <div className="space-y-4">
        {/* انتخاب قبل/بعد از ظهر */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-bg border border-border">
          <button
            type="button"
            onClick={() => setPeriod('AM')}
            className={cn(
              'h-10 rounded-full text-sm font-medium transition flex items-center justify-center gap-1.5',
              period === 'AM'
                ? 'bg-brand text-white shadow-brand'
                : 'text-fg-secondary hover:text-fg'
            )}
          >
            <Sun size={15} />
            <span>قبل از ظهر</span>
          </button>
          <button
            type="button"
            onClick={() => setPeriod('PM')}
            className={cn(
              'h-10 rounded-full text-sm font-medium transition flex items-center justify-center gap-1.5',
              period === 'PM'
                ? 'bg-info text-white shadow-md'
                : 'text-fg-secondary hover:text-fg'
            )}
          >
            <Moon size={15} />
            <span>بعد از ظهر</span>
          </button>
        </div>

        {/* ساعت و دقیقه */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-fg-muted mb-1.5 text-center">
              ساعت
            </div>
            <div className="h-40 overflow-y-auto rounded-btn border border-border bg-bg p-1 no-scrollbar">
              {HOURS_12.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setH12(h)}
                  className={cn(
                    'w-full h-9 rounded-lg text-sm font-medium transition',
                    h12 === h
                      ? 'bg-brand text-white'
                      : 'text-fg hover:bg-brand-soft'
                  )}
                >
                  {toPersianDigits(h)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-fg-muted mb-1.5 text-center">
              دقیقه
            </div>
            <div className="h-40 overflow-y-auto rounded-btn border border-border bg-bg p-1 no-scrollbar">
              {MINUTES.map((mm) => (
                <button
                  key={mm}
                  type="button"
                  onClick={() => setM(mm)}
                  className={cn(
                    'w-full h-9 rounded-lg text-sm font-medium transition',
                    m === mm
                      ? 'bg-brand text-white'
                      : 'text-fg hover:bg-brand-soft'
                  )}
                >
                  {toPersianDigits(String(mm).padStart(2, '0'))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* پیش‌نمایش */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-soft text-brand">
            <span className="text-sm font-semibold">
              {toPersianDigits(h12)}:
              {toPersianDigits(String(m).padStart(2, '0'))} {periodLabel}
            </span>
          </div>
        </div>

        <Button full onClick={handleSave}>
          ذخیره
        </Button>
      </div>
    </Modal>
  )
}
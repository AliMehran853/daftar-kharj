import { useEffect, useState } from 'react'
import { Banknote, TrendingUp } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { cn, toEnglishDigits, toPersianDigits, safeNumber } from '@/lib/utils'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { addTransaction, getStatsBetween } from '@/db/queries'
import { getMonthRange } from '@/lib/jalali'

export default function SalaryModal({ open, onClose }) {
  const monthlySalary = useSettingsStore((s) => s.monthlySalary)
  const currency = useSettingsStore((s) => s.currencyLabel)
  const update = useSettingsStore((s) => s.update)
  const showToast = useUIStore((s) => s.showToast)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)

  const [value, setValue] = useState('')
  const [addAsIncome, setAddAsIncome] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setValue(monthlySalary ? String(Math.round(monthlySalary)) : '')
      setAddAsIncome(false)
    }
  }, [open, monthlySalary])

  const display = value ? toPersianDigits(value) : ''
  const numericValue = safeNumber(value)

  const handleChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    setValue(cleaned.slice(0, 10))
  }

  const handleSave = async () => {
    if (numericValue < 0) return
    setSaving(true)
    try {
      await update('monthlySalary', numericValue)

      if (addAsIncome && numericValue > 0) {
        const { start, end } = getMonthRange(new Date())
        const stats = await getStatsBetween(start, end)
        // فقط اگه این ماه معاش ثبت نشده باشه
        if (!stats.salary) {
          await addTransaction({
            type: 'income',
            subtype: 'salary',
            amount: numericValue,
            categoryId: 'salary',
            toAccountId: 'wallet',
            note: 'معاش ماه',
            date: new Date(),
          })
          triggerRefresh()
          showToast('معاش ثبت و به خزانه اضافه شد', 'success')
        } else {
          showToast('معاش این ماه قبلاً ثبت شده بود', 'info')
        }
      } else {
        showToast('معاش به‌روزرسانی شد', 'success')
      }

      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="معاش ماهانه">
      <div className="space-y-4">
        <div className="rounded-2xl bg-brand-soft/40 border border-brand/20 p-4">
          <input
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            placeholder="۰"
            autoFocus
            className={cn(
              'w-full bg-transparent text-center',
              'text-[36px] leading-none font-bold text-brand',
              'placeholder:text-brand/30 focus:outline-none'
            )}
          />
          <div className="text-center text-xs text-fg-muted mt-2">
            {currency}
          </div>
        </div>

        <button
          onClick={() => setAddAsIncome((v) => !v)}
          className={cn(
            'w-full p-3.5 rounded-btn border text-right',
            'flex items-start gap-3 transition',
            addAsIncome
              ? 'border-brand bg-brand-soft/40'
              : 'border-border bg-card hover:bg-brand-soft/20'
          )}
        >
          <div
            className={cn(
              'size-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
              addAsIncome
                ? 'border-brand bg-brand'
                : 'border-border bg-card'
            )}
          >
            {addAsIncome && (
              <svg viewBox="0 0 12 12" className="size-3 text-white">
                <path
                  d="M2 6l3 3 5-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-fg flex items-center gap-1.5">
              <TrendingUp size={14} className="text-brand" />
              <span>همزمان به‌عنوان درآمد این ماه ثبت کن</span>
            </div>
            <div className="text-[11px] text-fg-muted mt-1">
              اگر این ماه معاش ثبت نکردی، این گزینه معاش را به خزانه اضافه می‌کند.
            </div>
          </div>
        </button>

        <Button full loading={saving} onClick={handleSave}>
          ذخیره
        </Button>
      </div>
    </Modal>
  )
}
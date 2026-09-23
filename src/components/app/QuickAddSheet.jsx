import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  PencilLine,
  Check,
} from 'lucide-react'
import { Drawer } from 'vaul'
import {
  cn,
  toEnglishDigits,
  toPersianDigits,
  todayISO,
  safeNumber,
} from '@/lib/utils'
import { formatJalaliLong, relativeDayLabel } from '@/lib/jalali'
import { addTransaction } from '@/db/queries'
import { useCategories } from '@/hooks/useTransactions'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import CategoryGrid from './CategoryGrid'
import DatePickerModal from './DatePickerModal'

export default function QuickAddSheet({ open, payload, onClose }) {
  const currency = useSettingsStore((s) => s.currencyLabel)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)

  const [tab, setTab] = useState(payload?.tab || 'expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { categories } = useCategories(tab)

  const isExpense = tab === 'expense'

  useEffect(() => {
    if (open) {
      setTab(payload?.tab || 'expense')
      setAmount('')
      setCategoryId(null)
      setNote('')
      setDate(todayISO())
      setSubmitting(false)
    }
  }, [open, payload])

  useEffect(() => {
    if (!categories.length) return
    if (!categoryId || !categories.find((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const displayAmount = amount ? toPersianDigits(amount) : ''

  const handleAmountChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    setAmount(cleaned.slice(0, 12))
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  )

  const canSubmit = safeNumber(amount) > 0 && categoryId && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await addTransaction({
        type: isExpense ? 'expense' : 'income',
        subtype: isExpense ? null : 'extra',
        amount: safeNumber(amount),
        categoryId,
        fromAccountId: isExpense ? 'wallet' : null,
        toAccountId: isExpense ? null : 'wallet',
        note: note.trim(),
        date,
      })
      triggerRefresh()
      showToast(isExpense ? 'مصرف ثبت شد' : 'درآمد ثبت شد', 'success')
      onClose?.()
    } catch (err) {
      console.error(err)
      showToast('خطا در ثبت', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  /* رنگ‌های داینامیک بر اساس تب */
  const accent = isExpense ? 'var(--danger)' : 'var(--success)'
  const accentSoft = isExpense ? 'var(--danger-soft)' : 'var(--success-soft)'
  const accentTextColor = isExpense ? '#B91C4A' : '#15803D'

  return (
    <>
      <Drawer.Root
        open={open}
        onOpenChange={(o) => !o && onClose?.()}
        shouldScaleBackground={false}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Drawer.Content
            className={cn(
              'fixed bottom-0 inset-x-0 z-50',
              'bg-card border-t border-border',
              'rounded-t-[28px]',
              'flex flex-col max-h-[94dvh]',
              'focus:outline-none'
            )}
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 -8px 32px rgba(26, 15, 31, 0.15)',
            }}
          >
            {/* دسته‌گیر */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-border" />
            </div>

            {/* هدر */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
              <Drawer.Title className="text-lg font-semibold text-fg">
                ثبت سریع
              </Drawer.Title>
              <button
                onClick={onClose}
                className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition press-sm"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            {/* تب‌ها */}
            <div className="px-5 pb-3 shrink-0">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-bg border border-border">
                <TabButton
                  active={isExpense}
                  onClick={() => setTab('expense')}
                  activeColor="var(--danger)"
                >
                  مصرف
                </TabButton>
                <TabButton
                  active={!isExpense}
                  onClick={() => setTab('income')}
                  activeColor="var(--success)"
                >
                  درآمد جانبی
                </TabButton>
              </div>
            </div>

            {/* محتوا */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              {/* ورودی مبلغ */}
              <div
                className="rounded-2xl p-4 mb-4 border transition-colors duration-300"
                style={{
                  backgroundColor: accentSoft,
                  borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  placeholder="۰"
                  autoFocus
                  className={cn(
                    'w-full bg-transparent text-center',
                    'text-[42px] leading-none font-bold tabular-nums',
                    'placeholder:opacity-40',
                    'focus:outline-none transition-colors duration-300'
                  )}
                  style={{ color: accent }}
                />
                <div
                  className="text-center text-xs mt-2 font-medium"
                  style={{ color: accentTextColor }}
                >
                  {currency}
                </div>
              </div>

              {/* دسته‌ها */}
              <div className="mb-1.5 text-sm font-medium text-fg-secondary">
                دسته‌بندی
              </div>
              <CategoryGrid
                categories={categories}
                selectedId={categoryId}
                onSelect={setCategoryId}
                columns={3}
                accentColor={accent}
              />

              {/* یادداشت */}
              <div className="mt-4">
                <label className="flex items-center gap-1.5 text-sm font-medium text-fg-secondary mb-1.5">
                  <PencilLine size={14} />
                  <span>توضیحات (اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    activeCategory?.placeholder || 'مثلاً خرید نان و مواد غذایی'
                  }
                  maxLength={80}
                  className={cn(
                    'w-full h-11 rounded-btn px-3.5',
                    'bg-bg border border-border',
                    'text-fg placeholder:text-fg-muted text-[15px]',
                    'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'
                  )}
                />
              </div>

              {/* انتخاب تاریخ */}
              <button
                type="button"
                onClick={() => setDatePickerOpen(true)}
                className={cn(
                  'mt-3 w-full h-12 rounded-btn px-3.5',
                  'bg-bg border border-border',
                  'flex items-center gap-2.5 transition press-sm'
                )}
              >
                <CalendarIcon
                  size={18}
                  className="shrink-0"
                  style={{ color: 'var(--brand)' }}
                />
                <div className="flex-1 text-right">
                  <div className="text-sm font-medium text-fg">
                    {relativeDayLabel(date)}
                  </div>
                  <div className="text-[11px] text-fg-muted mt-0.5">
                    {formatJalaliLong(date)}
                  </div>
                </div>
                <ChevronLeft size={18} className="text-fg-muted shrink-0" />
              </button>
            </div>

            {/* دکمه‌ی ثبت */}
            <div className="p-5 pt-3 pb-safe shrink-0 border-t border-border bg-card">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={cn(
                  'w-full rounded-btn font-semibold text-white',
                  'flex items-center justify-center gap-2',
                  'transition-all duration-200 select-none press',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
                style={{
                  height: '52px',
                  background: isExpense
                    ? 'linear-gradient(135deg, #D81B60 0%, #B91C4A 100%)'
                    : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  boxShadow: isExpense
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 2px 6px rgba(216, 27, 96, 0.25), 0 8px 20px rgba(216, 27, 96, 0.20)'
                    : 'inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 2px 6px rgba(22, 163, 74, 0.25), 0 8px 20px rgba(22, 163, 74, 0.20)',
                }}
              >
                {submitting ? (
                  <span className="opacity-70">در حال ثبت…</span>
                ) : (
                  <>
                    <Check size={20} strokeWidth={2.6} />
                    <span>{isExpense ? 'ثبت مصرف' : 'ثبت درآمد'}</span>
                  </>
                )}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* انتخابگر تاریخ */}
      <DatePickerModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        value={date}
        onSelect={setDate}
      />
    </>
  )
}

function TabButton({ active, onClick, activeColor, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-10 rounded-full text-sm font-medium',
        'transition-all duration-200 select-none press-sm',
        active ? 'text-white shadow-md' : 'text-fg-secondary hover:text-fg'
      )}
      style={
        active
          ? {
              backgroundColor: activeColor,
              boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 2px 6px ${activeColor}40`,
            }
          : undefined
      }
    >
      {children}
    </button>
  )
}
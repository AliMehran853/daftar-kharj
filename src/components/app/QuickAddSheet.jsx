import { useEffect, useMemo, useRef, useState } from 'react'
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  PencilLine,
  Check,
  Pencil,
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
import { addTransaction, updateTransaction } from '@/db/queries'
import { useCategories } from '@/hooks/useTransactions'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import CategoryGrid from './CategoryGrid'

const NOTE_MAX = 300
const NOTE_WARN_AT = 240
const NOTE_DANGER_AT = 285

export default function QuickAddSheet({ open, payload, onClose }) {
  const currency = useSettingsStore((s) => s.currencyLabel)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)
  const openDatePicker = useUIStore((s) => s.openDatePicker)
  const datePickerOpen = useUIStore((s) => !!s.datePicker)

  const isEditMode = !!payload?.editId
  const editData = payload?.editData

  const [tab, setTab] = useState(payload?.tab || 'expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [submitting, setSubmitting] = useState(false)

  const { categories } = useCategories(tab)

  const isExpense = tab === 'expense'

  /* GUARD: جلوگیری از بسته شدن Drawer بعد از DatePicker */
  const skipNextDrawerClose = useRef(false)
  const prevDatePickerOpen = useRef(false)

  useEffect(() => {
    const wasOpen = prevDatePickerOpen.current
    prevDatePickerOpen.current = datePickerOpen

    if (wasOpen && !datePickerOpen) {
      skipNextDrawerClose.current = true
      const t = setTimeout(() => {
        skipNextDrawerClose.current = false
      }, 350)
      return () => clearTimeout(t)
    }
  }, [datePickerOpen])

  const handleDrawerOpenChange = (o) => {
    if (o) return
    if (skipNextDrawerClose.current) return
    onClose?.()
  }

  /* قفل body */
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    const body = document.body

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'

    return () => {
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.left = prev.left
      body.style.right = prev.right
      body.style.width = prev.width
      body.style.overflow = prev.overflow
      window.scrollTo(0, scrollY)
    }
  }, [open])

  /* ── مقداردهی اولیه ── */
  useEffect(() => {
    if (!open) return

    if (isEditMode && editData) {
      setTab(editData.type === 'income' ? 'income' : 'expense')
      setAmount(String(editData.amount || ''))
      setCategoryId(editData.categoryId || null)
      setNote(editData.note || '')
      setDate(editData.date || todayISO())
    } else {
      setTab(payload?.tab || 'expense')
      setAmount('')
      setCategoryId(null)
      setNote('')
      setDate(todayISO())
    }
    setSubmitting(false)
  }, [open, payload, isEditMode, editData])

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

  const handleNoteChange = (e) => {
    const v = e.target.value
    if (v.length <= NOTE_MAX) {
      setNote(v)
    } else {
      setNote(v.slice(0, NOTE_MAX))
    }
  }

  const noteLen = note.length
  const noteState =
    noteLen >= NOTE_DANGER_AT
      ? 'danger'
      : noteLen >= NOTE_WARN_AT
        ? 'warn'
        : 'normal'

  const counterColor =
    noteState === 'danger'
      ? 'var(--expense)'
      : noteState === 'warn'
        ? 'var(--warning)'
        : 'var(--text-muted)'

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  )

  const canSubmit = safeNumber(amount) > 0 && categoryId && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const payloadData = {
        type: isExpense ? 'expense' : 'income',
        subtype: isExpense ? null : 'extra',
        amount: safeNumber(amount),
        categoryId,
        fromAccountId: isExpense ? 'wallet' : null,
        toAccountId: isExpense ? null : 'wallet',
        note: note.trim(),
        date,
      }

      if (isEditMode && payload?.editId) {
        await updateTransaction(payload.editId, payloadData)
        showToast('تراکنش به‌روزرسانی شد', 'success')
      } else {
        await addTransaction(payloadData)
        showToast(isExpense ? 'مصرف ثبت شد' : 'درآمد ثبت شد', 'success')
      }

      triggerRefresh()
      onClose?.()
    } catch (err) {
      console.error(err)
      showToast('خطا در ثبت', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenDatePicker = () => {
    openDatePicker({
      value: date,
      onSelect: setDate,
    })
  }

  const accent = isExpense ? 'var(--expense)' : 'var(--income)'
  const accentSoft = isExpense ? 'var(--expense-soft)' : 'var(--income-soft)'

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleDrawerOpenChange}
      shouldScaleBackground={false}
      preventScrollRestoration={true}
      dismissible={!datePickerOpen}
      noBodyStyles={true}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 inset-x-0 z-50',
            'bg-surface border-t border-border',
            'rounded-t-[28px]',
            'flex flex-col',
            'focus:outline-none',
            'overscroll-contain'
          )}
          style={{
            maxHeight: '100dvh',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.20)',
          }}
        >
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-surface-deep" />
          </div>

          {/* هدر */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
            <Drawer.Title className="text-lg font-semibold text-text flex items-center gap-2">
              {isEditMode && (
                <Pencil size={16} className="text-primary" />
              )}
              <span>{isEditMode ? 'ویرایش تراکنش' : 'ثبت سریع'}</span>
            </Drawer.Title>
            <button
              onClick={onClose}
              className="size-9 rounded-full hover:bg-surface-high flex items-center justify-center text-text-muted transition press-sm"
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>

          {/* تب‌ها — در حالت ویرایش غیرفعال */}
          {!isEditMode && (
            <div className="px-5 pb-3 shrink-0">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-surface-deep border border-border">
                <TabButton
                  active={isExpense}
                  onClick={() => setTab('expense')}
                  activeColor="var(--expense)"
                >
                  مصرف
                </TabButton>
                <TabButton
                  active={!isExpense}
                  onClick={() => setTab('income')}
                  activeColor="var(--income)"
                >
                  درآمد
                </TabButton>
              </div>
            </div>
          )}

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-6"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
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
                autoFocus={!isEditMode}
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
                style={{ color: accent }}
              >
                {currency}
              </div>
            </div>

            {/* دسته‌ها */}
            <div className="mb-1.5 text-sm font-medium text-text-secondary">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                  <PencilLine size={14} />
                  <span>توضیحات (اختیاری)</span>
                </label>
                <span
                  className="text-[11px] font-medium tabular-nums transition-colors"
                  style={{ color: counterColor }}
                >
                  {toPersianDigits(noteLen)}/{toPersianDigits(NOTE_MAX)}
                </span>
              </div>
              <input
                type="text"
                value={note}
                onChange={handleNoteChange}
                placeholder={
                  activeCategory?.placeholder || 'مثلاً خرید نان و مواد غذایی'
                }
                className={cn(
                  'w-full h-11 rounded-btn px-3.5',
                  'bg-surface-deep border',
                  'text-text placeholder:text-text-muted text-[15px]',
                  'focus:outline-none focus:ring-2',
                  noteState === 'danger'
                    ? 'border-expense/40 focus:border-expense/50 focus:ring-expense/20'
                    : noteState === 'warn'
                      ? 'border-warning/40 focus:border-warning/50 focus:ring-warning/20'
                      : 'border-border focus:border-primary/40 focus:ring-primary/20'
                )}
              />
            </div>

            {/* تاریخ */}
            <button
              type="button"
              onClick={handleOpenDatePicker}
              className={cn(
                'mt-3 w-full h-12 rounded-btn px-3.5',
                'bg-surface-deep border border-border',
                'flex items-center gap-2.5 transition press-sm'
              )}
            >
              <CalendarIcon
                size={18}
                className="shrink-0"
                style={{ color: 'var(--primary)' }}
              />
              <div className="flex-1 text-right">
                <div className="text-sm font-medium text-text">
                  {relativeDayLabel(date)}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  {formatJalaliLong(date)}
                </div>
              </div>
              <ChevronLeft size={18} className="text-text-muted shrink-0" />
            </button>
          </div>

          {/* دکمه */}
          <div
            className="px-5 pt-3 pb-safe shrink-0 border-t border-border bg-surface"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
          >
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
                  ? 'linear-gradient(135deg, #F04478 0%, #D93666 100%)'
                  : 'linear-gradient(135deg, #16A56A 0%, #128A55 100%)',
                boxShadow: isExpense
                  ? '0 2px 6px rgba(240, 68, 120, 0.30), 0 8px 20px rgba(240, 68, 120, 0.20)'
                  : '0 2px 6px rgba(22, 165, 106, 0.30), 0 8px 20px rgba(22, 165, 106, 0.20)',
              }}
            >
              {submitting ? (
                <span className="opacity-70">
                  {isEditMode ? 'در حال ذخیره…' : 'در حال ثبت…'}
                </span>
              ) : (
                <>
                  <Check size={20} strokeWidth={2.6} />
                  <span>
                    {isEditMode
                      ? 'ذخیره تغییرات'
                      : isExpense
                        ? 'ثبت مصرف'
                        : 'ثبت درآمد'}
                  </span>
                </>
              )}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function TabButton({ active, onClick, activeColor, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative h-10 rounded-full text-sm font-medium',
        'transition-all duration-200 select-none press-sm'
      )}
      style={
        active
          ? {
              backgroundColor: activeColor,
              color: '#FFFFFF',
              boxShadow: `0 2px 6px ${activeColor}50`,
            }
          : {
              color: 'var(--text-secondary)',
            }
      }
    >
      {children}
    </button>
  )
}
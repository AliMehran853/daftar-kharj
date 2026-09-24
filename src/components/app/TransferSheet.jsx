import { useEffect, useRef, useState } from 'react'
import { X, ArrowDown, ArrowUp, Check, Pencil } from 'lucide-react'
import { Drawer } from 'vaul'
import {
  cn,
  toEnglishDigits,
  toPersianDigits,
  todayISO,
  safeNumber,
  formatMoney,
} from '@/lib/utils'
import { addTransaction, updateTransaction, getBalance } from '@/db/queries'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { TX_SUBTYPES, ACCOUNTS } from '@/data/constants'

const NOTE_MAX = 400
const NOTE_WARN_AT = 320
const NOTE_DANGER_AT = 380

export default function TransferSheet({ open, payload, onClose }) {
  const currency = useSettingsStore((s) => s.currencyLabel)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)

  const isEditMode = !!payload?.editId
  const editData = payload?.editData

  const [direction, setDirection] = useState('to-savings')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [balance, setBalance] = useState({ wallet: 0, savings: 0 })

  /* GUARD برای DatePicker (فعلاً این sheet DatePicker نداره، ولی برای اطمینان) */
  const skipNextDrawerClose = useRef(false)

  useEffect(() => {
    if (!open) return
    ;(async () => {
      const b = await getBalance()
      setBalance(b)
    })()

    if (isEditMode && editData) {
      // حالت ویرایش
      setDirection(
        editData.subtype === TX_SUBTYPES.TO_SAVINGS
          ? 'to-savings'
          : 'from-savings'
      )
      setAmount(String(editData.amount || ''))
      setNote(editData.note || '')
    } else {
      // حالت جدید
      setDirection(payload?.direction || 'to-savings')
      setAmount('')
      setNote('')
    }
    setSubmitting(false)
  }, [open, payload, isEditMode, editData])

  const displayAmount = amount ? toPersianDigits(amount) : ''
  const handleAmountChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    setAmount(cleaned.slice(0, 12))
  }

  const handleNoteChange = (e) => {
    const v = e.target.value
    setNote(v.length <= NOTE_MAX ? v : v.slice(0, NOTE_MAX))
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

  const numericAmount = safeNumber(amount)
  const isToSavings = direction === 'to-savings'

  /* در حالت ویرایش، موجودی فعلی رو با مقدار قدیمی اصلاح می‌کنیم */
  const baseBalance = isEditMode
    ? {
        wallet:
          editData.fromAccountId === 'wallet'
            ? balance.wallet + Number(editData.amount)
            : balance.wallet,
        savings:
          editData.fromAccountId === 'savings'
            ? balance.savings + Number(editData.amount)
            : balance.savings,
      }
    : balance

  const sourceBalance = isToSavings
    ? baseBalance.wallet
    : baseBalance.savings

  const canSubmit =
    numericAmount > 0 &&
    numericAmount <= sourceBalance &&
    !submitting

  const insufficient =
    numericAmount > sourceBalance && sourceBalance >= 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const payloadData = {
        type: 'transfer',
        subtype: isToSavings
          ? TX_SUBTYPES.TO_SAVINGS
          : TX_SUBTYPES.FROM_SAVINGS,
        amount: numericAmount,
        fromAccountId: isToSavings ? ACCOUNTS.WALLET : ACCOUNTS.SAVINGS,
        toAccountId: isToSavings ? ACCOUNTS.SAVINGS : ACCOUNTS.WALLET,
        note: note.trim(),
        date: todayISO(),
      }

      if (isEditMode && payload?.editId) {
        await updateTransaction(payload.editId, payloadData)
        showToast('انتقال به‌روزرسانی شد', 'success')
      } else {
        await addTransaction(payloadData)
        showToast(
          isToSavings ? 'به پس‌انداز واریز شد' : 'از پس‌انداز برداشت شد',
          'success'
        )
      }

      triggerRefresh()
      onClose?.()
    } catch (err) {
      console.error(err)
      showToast('خطا در انتقال', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMax = () => {
    if (sourceBalance > 0) setAmount(String(Math.floor(sourceBalance)))
  }

  const accent = isToSavings ? 'var(--saving)' : 'var(--income)'
  const accentSoft = isToSavings ? 'var(--saving-soft)' : 'var(--income-soft)'
  const accentDark = isToSavings ? '#5B44A8' : '#128A55'

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => !o && onClose?.()}
      shouldScaleBackground={false}
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
          {/* دسته‌گیر */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-surface-deep" />
          </div>

          {/* هدر */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
            <Drawer.Title className="text-lg font-semibold text-text flex items-center gap-2">
              {isEditMode && <Pencil size={16} className="text-primary" />}
              <span>{isEditMode ? 'ویرایش انتقال' : 'انتقال پس‌انداز'}</span>
            </Drawer.Title>
            <button
              onClick={onClose}
              className="size-9 rounded-full hover:bg-surface-high flex items-center justify-center text-text-muted transition press-sm"
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>

          {/* محتوا */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-6"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
          >
            {/* انتخاب جهت — فقط در حالت جدید */}
            {!isEditMode && (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-surface-deep border border-border mb-4">
                <DirectionTab
                  active={isToSavings}
                  onClick={() => setDirection('to-savings')}
                  icon={ArrowDown}
                  color="var(--saving)"
                >
                  واریز به پس‌انداز
                </DirectionTab>
                <DirectionTab
                  active={!isToSavings}
                  onClick={() => setDirection('from-savings')}
                  icon={ArrowUp}
                  color="var(--income)"
                >
                  برداشت از پس‌انداز
                </DirectionTab>
              </div>
            )}

            {/* موجودی مبدأ */}
            <div className="rounded-2xl bg-surface-deep border border-border p-3 mb-4 flex items-center justify-between">
              <span className="text-xs text-text-muted">
                موجودی {isToSavings ? 'خزانه' : 'پس‌انداز'}
              </span>
              <span className="text-sm font-semibold text-text tabular-nums">
                {formatMoney(sourceBalance)} {currency}
              </span>
            </div>

            {/* ورودی مبلغ */}
            <div
              className="rounded-2xl p-4 mb-4 border transition-colors"
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
                  'focus:outline-none transition-colors'
                )}
                style={{ color: accent }}
              />
              <div className="text-center text-xs mt-2 flex items-center justify-center gap-2">
                <span className="text-text-muted">{currency}</span>
                {sourceBalance > 0 && (
                  <>
                    <span className="text-text-muted/40">•</span>
                    <button
                      onClick={handleMax}
                      className="text-[11px] font-medium transition press-sm"
                      style={{ color: accent }}
                    >
                      همه ({formatMoney(sourceBalance)})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* هشدار کمبود */}
            {insufficient && (
              <div
                className="mb-3 text-xs rounded-btn px-3 py-2 text-center"
                style={{
                  background: 'var(--expense-soft)',
                  color: 'var(--expense)',
                }}
              >
                مبلغ بیشتر از موجودی {isToSavings ? 'خزانه' : 'پس‌انداز'} است
              </div>
            )}

            {/* یادداشت با شمارشگر */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  توضیحات (اختیاری)
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
                  isToSavings
                    ? 'مثلاً پس‌انداز ماه میزان'
                    : 'مثلاً برداشت برای خرید ضروری'
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
                background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
                boxShadow: `0 2px 6px ${accent}50, 0 8px 20px ${accent}30`,
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
                      : isToSavings
                        ? 'واریز به پس‌انداز'
                        : 'برداشت از پس‌انداز'}
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

function DirectionTab({ active, onClick, icon: Icon, color, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-10 rounded-full text-[12.5px] font-medium transition-all duration-200',
        'select-none press-sm',
        'flex items-center justify-center gap-1.5'
      )}
      style={
        active
          ? {
              backgroundColor: color,
              color: '#FFFFFF',
              boxShadow: `0 2px 6px ${color}50`,
            }
          : {
              color: 'var(--text-secondary)',
            }
      }
    >
      <Icon size={15} strokeWidth={2.4} />
      <span>{children}</span>
    </button>
  )
}
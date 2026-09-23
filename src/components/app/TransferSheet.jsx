import { useEffect, useState } from 'react'
import { X, ArrowDown, ArrowUp, Check } from 'lucide-react'
import { Drawer } from 'vaul'
import { cn, toEnglishDigits, toPersianDigits, todayISO, safeNumber, formatMoney } from '@/lib/utils'
import { addTransaction, getBalance } from '@/db/queries'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { TX_SUBTYPES, ACCOUNTS } from '@/data/constants'

export default function TransferSheet({ open, payload, onClose }) {
  const currency = useSettingsStore((s) => s.currencyLabel)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)

  const [direction, setDirection] = useState(payload?.direction || 'to-savings')
  // 'to-savings' = از خزانه به پس‌انداز
  // 'from-savings' = از پس‌انداز به خزانه

  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [balance, setBalance] = useState({ wallet: 0, savings: 0 })

  useEffect(() => {
    if (!open) return
    setDirection(payload?.direction || 'to-savings')
    setAmount('')
    setNote('')
    setSubmitting(false)
    ;(async () => {
      const b = await getBalance()
      setBalance(b)
    })()
  }, [open, payload])

  const displayAmount = amount ? toPersianDigits(amount) : ''
  const handleAmountChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    setAmount(cleaned.slice(0, 12))
  }

  const numericAmount = safeNumber(amount)
  const isToSavings = direction === 'to-savings'
  const sourceBalance = isToSavings ? balance.wallet : balance.savings
  const available = sourceBalance

  const canSubmit = numericAmount > 0 && numericAmount <= available && !submitting
  const insufficient = numericAmount > available && available >= 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await addTransaction({
        type: 'transfer',
        subtype: isToSavings ? TX_SUBTYPES.TO_SAVINGS : TX_SUBTYPES.FROM_SAVINGS,
        amount: numericAmount,
        fromAccountId: isToSavings ? ACCOUNTS.WALLET : ACCOUNTS.SAVINGS,
        toAccountId: isToSavings ? ACCOUNTS.SAVINGS : ACCOUNTS.WALLET,
        note: note.trim(),
        date: todayISO(),
      })
      triggerRefresh()
      showToast(isToSavings ? 'به پس‌انداز واریز شد' : 'از پس‌انداز برداشت شد', 'success')
      onClose?.()
    } catch (err) {
      console.error(err)
      showToast('خطا در انتقال', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMax = () => {
    if (available > 0) setAmount(String(Math.floor(available)))
  }

  const accent = isToSavings ? '#4A9FE8' : '#00B894'
  const accentDark = isToSavings ? '#2E7BC4' : '#009B7A'

  return (
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
            'flex flex-col max-h-[92dvh]',
            'focus:outline-none'
          )}
        >
          {/* دسته‌گیر */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>

          {/* هدر */}
          <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
            <Drawer.Title className="text-lg font-semibold text-fg">
              انتقال پس‌انداز
            </Drawer.Title>
            <button
              onClick={onClose}
              className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition active:scale-95"
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>

          {/* محتوا */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
            {/* انتخاب جهت */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-bg border border-border mb-4">
              <DirectionTab
                active={isToSavings}
                onClick={() => setDirection('to-savings')}
                icon={ArrowDown}
                color="#4A9FE8"
              >
                واریز به پس‌انداز
              </DirectionTab>
              <DirectionTab
                active={!isToSavings}
                onClick={() => setDirection('from-savings')}
                icon={ArrowUp}
                color="#00B894"
              >
                برداشت از پس‌انداز
              </DirectionTab>
            </div>

            {/* موجودی مبدأ */}
            <div className="rounded-2xl bg-bg border border-border p-3 mb-4 flex items-center justify-between">
              <span className="text-xs text-fg-muted">
                موجودی {isToSavings ? 'خزانه' : 'پس‌انداز'}
              </span>
              <span className="text-sm font-semibold text-fg">
                {formatMoney(available)} {currency}
              </span>
            </div>

            {/* ورودی مبلغ */}
            <div
              className="rounded-2xl border p-4 mb-4"
              style={{
                backgroundColor: `${accent}0F`,
                borderColor: `${accent}30`,
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
                  'text-[42px] leading-none font-bold',
                  'placeholder:text-fg-muted/40',
                  'focus:outline-none'
                )}
                style={{ color: accent }}
              />
              <div className="text-center text-xs text-fg-muted mt-2 flex items-center justify-center gap-2">
                <span>{currency}</span>
                {available > 0 && (
                  <>
                    <span className="text-border">•</span>
                    <button
                      onClick={handleMax}
                      className="text-[11px] font-medium transition active:scale-95"
                      style={{ color: accent }}
                    >
                      همه ({formatMoney(available)})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* هشدار کمبود موجودی */}
            {insufficient && (
              <div className="mb-3 text-xs text-danger bg-danger-soft rounded-btn px-3 py-2 text-center">
                مبلغ بیشتر از موجودی {isToSavings ? 'خزانه' : 'پس‌انداز'} است
              </div>
            )}

            {/* یادداشت */}
            <div>
              <label className="block text-sm font-medium text-fg-secondary mb-1.5">
                توضیحات (اختیاری)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  isToSavings
                    ? 'مثلاً پس‌انداز ماه میزان'
                    : 'مثلاً برداشت برای خرید ضروری'
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
          </div>

          {/* دکمه‌ی ثبت */}
          <div className="p-5 pt-3 pb-safe shrink-0 border-t border-border bg-card">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={cn(
                'w-full rounded-btn font-semibold',
                'flex items-center justify-center gap-2',
                'transition-all duration-200 select-none',
                'disabled:opacity-40 disabled:pointer-events-none',
                'active:scale-[0.98] text-white'
              )}
              style={{
                height: '52px',
                background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
                boxShadow: `0 8px 24px ${accent}45`,
              }}
            >
              {submitting ? (
                <span className="opacity-70">در حال ثبت…</span>
              ) : (
                <>
                  <Check size={20} strokeWidth={2.6} />
                  <span>{isToSavings ? 'واریز به پس‌انداز' : 'برداشت از پس‌انداز'}</span>
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
        'select-none active:scale-[0.97]',
        'flex items-center justify-center gap-1.5',
        active ? 'text-white shadow-md' : 'text-fg-secondary hover:text-fg'
      )}
      style={active ? { backgroundColor: color } : undefined}
    >
      <Icon size={15} strokeWidth={2.4} />
      <span>{children}</span>
    </button>
  )
}
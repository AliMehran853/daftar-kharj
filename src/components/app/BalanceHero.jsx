import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
} from 'date-fns-jalali'
import { cn, formatMoney } from '@/lib/utils'
import { getTransactionsBetween } from '@/db/queries'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { ROUTES } from '@/data/constants'

const PERIODS = [
  { value: 'today', label: 'امروز' },
  { value: 'yesterday', label: 'دیروز' },
  { value: 'this-week', label: 'این هفته' },
  { value: 'last-week', label: 'هفته پیش' },
  { value: 'this-month', label: 'این ماه' },
  { value: 'last-month', label: 'ماه پیش' },
]

function getPeriodRange(period) {
  const now = new Date()
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday': {
      const y = subDays(now, 1)
      return { start: startOfDay(y), end: endOfDay(y) }
    }
    case 'this-week':
      return {
        start: startOfWeek(now, { weekStartsOn: 6 }),
        end: endOfWeek(now, { weekStartsOn: 6 }),
      }
    case 'last-week': {
      const lw = subDays(now, 7)
      return {
        start: startOfWeek(lw, { weekStartsOn: 6 }),
        end: endOfWeek(lw, { weekStartsOn: 6 }),
      }
    }
    case 'this-month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'last-month': {
      const lm = subMonths(now, 1)
      return { start: startOfMonth(lm), end: endOfMonth(lm) }
    }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

function getHealthColors(usedPercent) {
  if (usedPercent < 50) {
    return {
      bar: 'var(--income)',
      glow: 'rgba(22, 165, 106, 0.4)',
      text: '#B8F5D5',
    }
  }
  if (usedPercent < 80) {
    return {
      bar: 'var(--warning)',
      glow: 'rgba(245, 166, 35, 0.4)',
      text: '#FFE4B5',
    }
  }
  return {
    bar: 'var(--expense)',
    glow: 'rgba(240, 68, 120, 0.4)',
    text: '#FFC5D5',
  }
}

export default function BalanceHero({ balance = 0, savings = 0, stats }) {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const privacyMode = useUIStore((s) => s.privacyMode)
  const togglePrivacy = useUIStore((s) => s.togglePrivacy)
  const refreshKey = useUIStore((s) => s.refreshKey)

  const [expensePeriod, setExpensePeriod] = useState('this-month')
  const [expenseValue, setExpenseValue] = useState(
    stats?.totalExpense || 0
  )
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { start, end } = getPeriodRange(expensePeriod)
      const txs = await getTransactionsBetween(start, end)
      if (cancelled) return
      const total = txs
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + (Number(t.amount) || 0), 0)
      setExpenseValue(total)
    })()
    return () => {
      cancelled = true
    }
  }, [expensePeriod, refreshKey])

  const income = (stats?.salary || 0) + (stats?.extraIncome || 0)
  const monthExpense = stats?.totalExpense || 0
  const usedPercent =
    income > 0
      ? Math.min(100, Math.max(0, (monthExpense / income) * 100))
      : 0
  const remainingPercent = 100 - usedPercent

  const isNegative = balance < 0
  const health = getHealthColors(usedPercent)

  const totalBudget = (balance || 0) + (savings || 0)

  const money = (n) => (privacyMode ? '••••' : formatMoney(n))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-card-lg p-5 text-white relative overflow-hidden"
      style={{
        background: 'var(--gradient-brand)',
        boxShadow: 'var(--hero-shadow)',
      }}
    >
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] h-48 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* هدر */}
        <div className="flex items-start justify-between">
          <div className="text-sm text-white/80">موجودی خزانه</div>
          <button
            onClick={togglePrivacy}
            className="size-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center transition press-sm hover:bg-white/20"
            aria-label="حریم خصوصی"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* عدد اصلی */}
        <div className="mt-3 flex items-baseline gap-2 min-h-[52px]">
          <motion.span
            key={balance}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[44px] leading-none font-bold tracking-tight tabular-nums"
            style={{
              color: isNegative ? '#FFB3B3' : '#FFFFFF',
              textShadow: isNegative
                ? '0 0 20px rgba(255, 80, 80, 0.5)'
                : '0 1px 2px rgba(0, 0, 0, 0.10)',
            }}
          >
            {money(balance)}
          </motion.span>
          <span className="text-sm text-white/70">{currency}</span>
        </div>

        {/* نوار پیشرفت */}
        <div className="mt-6">
          <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${remainingPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                backgroundColor: health.bar,
                boxShadow: `0 0 12px ${health.glow}`,
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px]">
            <span className="font-medium" style={{ color: health.text }}>
              {Math.round(remainingPercent)}٪ باقی
            </span>
            <span className="text-white/60">
              {Math.round(usedPercent)}٪ مصرف شده
            </span>
          </div>
        </div>

        {/* سه ستون هم‌سطح */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatColumn
            label="بودجه کل"
            value={money(totalBudget)}
            color="#86EFAC"
          />
          <StatColumn
            label="پس‌انداز"
            value={money(savings)}
            color="#C4B5FD"
          />
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className={cn(
              'relative text-center transition-all duration-200',
              'rounded-xl px-2 py-2 -my-1',
              'border',
              pickerOpen
                ? 'bg-white/15 border-white/25 shadow-inner'
                : 'bg-white/[0.06] border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.97]'
            )}
          >
            {/* chevron گوشه‌ی بالا-چپ */}
            <motion.span
              animate={{ rotate: pickerOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1.5 left-1.5 inline-flex text-white/70"
            >
              <ChevronDown size={12} strokeWidth={2.5} />
            </motion.span>

            <div className="text-[11px] text-white/75 mb-1">مصارف</div>
            <div
              className="text-[15px] font-semibold tabular-nums"
              style={{
                color: '#FCA5A5',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.10)',
              }}
            >
              −{money(expenseValue)}
            </div>
          </button>
        </div>

        {/* انتخاب‌گر دوره */}
        <AnimatePresence initial={false}>
          {pickerOpen && (
            <motion.div
              key="periods"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                {PERIODS.map((p) => {
                  const active = expensePeriod === p.value
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setExpensePeriod(p.value)
                        setPickerOpen(false)
                      }}
                      className={cn(
                        'h-7 px-3 rounded-full text-[11px] font-medium',
                        'transition press-sm',
                        active
                          ? 'bg-white/25 text-white shadow-sm'
                          : 'bg-white/10 text-white/70 hover:bg-white/15'
                      )}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* دکمه خلاصه */}
        <button
          onClick={() => navigate(ROUTES.REPORTS)}
          className="mt-4 w-full h-11 rounded-btn bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center gap-2 text-sm font-medium transition press hover:bg-white/20"
        >
          <span>خلاصه‌ی همه‌ی دوره‌ها</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function StatColumn({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-white/70 mb-1">{label}</div>
      <div
        className="text-[15px] font-semibold tabular-nums"
        style={{
          color,
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.10)',
        }}
      >
        {value}
      </div>
    </div>
  )
}
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, TrendingUp, FileText } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
} from 'date-fns-jalali'
import { motion, AnimatePresence } from 'motion/react'
import { toPersianDigits, formatMoney, cn } from '@/lib/utils'
import {
  toDate,
  getDate,
  getYear,
  formatFullDate,
  formatMonthYear,
  getWeekRange,
} from '@/lib/jalali'
import { getTransactionsBetween, getBalance } from '@/db/queries'
import { CATEGORY_MAP } from '@/data/categories'
import { ROUTES, PERIODS } from '@/data/constants'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { useReports } from '@/hooks/useReports'
import { buildPeriodReportHtml, downloadPdf } from '@/lib/pdf'

import PageHeader from '@/components/layout/PageHeader'
import PeriodPicker from '@/components/app/PeriodPicker'
import PeriodNavigator from '@/components/app/PeriodNavigator'
import StatSmallCard from '@/components/app/StatSmallCard'
import DonutChart from '@/components/charts/DonutChart'
import BarChart from '@/components/charts/BarChart'
import LineChart from '@/components/charts/LineChart'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import IconCircle from '@/components/ui/IconCircle'
import * as Icons from 'lucide-react'

const TABS = [
  { key: 'summary', label: 'خلاصه' },
  { key: 'categories', label: 'دسته‌بندی' },
  { key: 'trend', label: 'روند' },
]

const DAY_WIDTH = 48
const TOTAL_DAYS = 30

const INCOME_COLOR = '#16A56A'
const EXPENSE_COLOR = '#F04478'
const SAVING_COLOR = '#7457D9'
const WALLET_COLOR = '#3299E8'

const WEEKDAY_LABELS = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

const WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

function getRange(date, period) {
  if (period === PERIODS.DAILY) {
    return { start: startOfDay(date), end: endOfDay(date) }
  }
  if (period === PERIODS.WEEKLY) {
    return {
      start: startOfWeek(date, { weekStartsOn: 6 }),
      end: endOfWeek(date, { weekStartsOn: 6 }),
    }
  }
  return { start: startOfMonth(date), end: endOfMonth(date) }
}

function getBucketCount(period) {
  if (period === PERIODS.DAILY) return 7
  if (period === PERIODS.WEEKLY) return 7
  return TOTAL_DAYS
}

function getBucketIndex(date, period) {
  if (period === PERIODS.MONTHLY) return getDate(date) - 1
  if (period === PERIODS.WEEKLY || period === PERIODS.DAILY) {
    return (date.getDay() + 1) % 7
  }
  return 0
}

function getPeriodLabel(date, period) {
  if (period === PERIODS.DAILY) return formatFullDate(date)
  if (period === PERIODS.WEEKLY) {
    const { start, end } = getWeekRange(date)
    return `${formatFullDate(start)} تا ${formatFullDate(end)}`
  }
  if (period === PERIODS.YEARLY) {
    return `سال ${toPersianDigits(getYear(date))}`
  }
  return formatMonthYear(date)
}

function getPeriodTitle(period) {
  if (period === PERIODS.DAILY) return 'گزارش روزانه'
  if (period === PERIODS.WEEKLY) return 'گزارش هفتگی'
  if (period === PERIODS.YEARLY) return 'گزارش سالانه'
  return 'گزارش ماهانه'
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const showToast = useUIStore((s) => s.showToast)
  const refreshKey = useUIStore((s) => s.refreshKey)

  const [tab, setTab] = useState('summary')
  const [period, setPeriod] = useState(PERIODS.MONTHLY)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [exporting, setExporting] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)
  const [savingsBalance, setSavingsBalance] = useState(0)

  const { stats, byCategory, loading } = useReports(selectedDate, period)

  /* لود موجودی خزانه و پس‌انداز */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const b = await getBalance()
      if (!cancelled) {
        setWalletBalance(b.wallet)
        setSavingsBalance(b.savings)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedDate, period, refreshKey])

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    setSelectedDate(new Date())
  }

  const handleExportPdf = async () => {
    if (!stats || stats.txCount === 0) {
      showToast('تراکنشی برای خروجی نیست', 'info')
      return
    }
    setExporting(true)
    try {
      const periodSlug =
        {
          [PERIODS.DAILY]: 'daily',
          [PERIODS.WEEKLY]: 'weekly',
          [PERIODS.MONTHLY]: 'monthly',
          [PERIODS.YEARLY]: 'yearly',
        }[period] || 'report'

      const report = buildPeriodReportHtml({
        txs: stats.transactions || [],
        stats,
        periodLabel: getPeriodLabel(selectedDate, period),
        periodTitle: getPeriodTitle(period),
        savingsDelta: (stats.toSavings || 0) - (stats.fromSavings || 0),
        currentWallet: walletBalance,
        currentSavings: savingsBalance,
        filename: `daftar-kharj-${periodSlug}`,
      })

      await downloadPdf(report)
      showToast('PDF دانلود شد', 'success')
    } catch (e) {
      console.error(e)
      showToast('خطا در ساخت PDF', 'error')
    } finally {
      setTimeout(() => setExporting(false), 800)
    }
  }

  return (
    <div className="px-4 lg:px-6 py-2 pb-6 space-y-4">
      <PageHeader
        title="گزارش‌های مالی"
        showBack
        action={
          <button
            onClick={handleExportPdf}
            disabled={exporting || loading || !stats || stats.txCount === 0}
            className={cn(
              'size-10 rounded-full flex items-center justify-center transition press-sm',
              'disabled:opacity-40 disabled:pointer-events-none',
              'hover:bg-primary/10 text-primary'
            )}
            aria-label="خروجی PDF"
          >
            {exporting ? (
              <div className="size-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            ) : (
              <FileText size={18} />
            )}
          </button>
        }
      />

      <PeriodPicker value={period} onChange={handlePeriodChange} />

      <PeriodNavigator
        value={selectedDate}
        onChange={setSelectedDate}
        period={period}
      />

      <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-card border border-border">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'relative h-9 rounded-full text-[13px] font-medium transition-colors',
                active ? 'text-white' : 'text-fg-secondary hover:text-fg'
              )}
            >
              {active && (
                <motion.span
                  layoutId="reports-tab-active"
                  className="absolute inset-0 rounded-full bg-primary shadow-brand"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-64" rounded="rounded-card" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      ) : !stats || stats.txCount === 0 ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="داده‌ای برای گزارش نیست"
            description="با ثبت تراکنش‌های این دوره، نمودارها این‌جا نمایش داده می‌شن."
          />
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            {tab === 'summary' && (
              <SummaryTab
                byCategory={byCategory}
                stats={stats}
                currency={currency}
                walletBalance={walletBalance}
                onCategoryClick={(id) => navigate(`${ROUTES.CATEGORY}/${id}`)}
              />
            )}
            {tab === 'categories' && (
              <CategoriesTab
                byCategory={byCategory}
                currency={currency}
                onCategoryClick={(id) => navigate(`${ROUTES.CATEGORY}/${id}`)}
              />
            )}
            {tab === 'trend' && (
              <TrendTab
                selectedDate={selectedDate}
                period={period}
                walletBalance={walletBalance}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

/* ──────────────────────────────
   تب خلاصه
────────────────────────────── */
function SummaryTab({
  byCategory,
  stats,
  currency,
  walletBalance,
  onCategoryClick,
}) {
  const rows = byCategory?.rows || []
  const total = byCategory?.totalExpense || 0

  const chartData = rows.map((r) => Math.round(r.amount))
  const chartLabels = rows.map(
    (r) => CATEGORY_MAP[r.categoryId]?.name || 'سایر'
  )
  const chartColors = rows.map(
    (r) => CATEGORY_MAP[r.categoryId]?.color || '#91A6BA'
  )

  return (
    <>
      <Card padded={false} className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DonutChart
              data={chartData}
              labels={chartLabels}
              colors={chartColors}
              centerLabel="مجموع مصارف"
              centerValue={toPersianDigits(Math.round(total))}
              height={220}
            />
          </div>
          <div className="w-28 shrink-0 space-y-2">
            {rows.slice(0, 5).map((r) => {
              const cat = CATEGORY_MAP[r.categoryId]
              return (
                <div key={r.categoryId} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat?.color || '#91A6BA' }}
                  />
                  <span className="text-[11px] text-fg-secondary truncate flex-1">
                    {cat?.name || 'سایر'}
                  </span>
                  <span className="text-[11px] font-medium text-fg">
                    {toPersianDigits(Math.round(r.percent))}٪
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatSmallCard
          label="پس‌انداز"
          value={stats.toSavings - stats.fromSavings}
          color={SAVING_COLOR}
        />
        <StatSmallCard
          label="موجودی خزانه"
          value={walletBalance}
          color={WALLET_COLOR}
        />
        <StatSmallCard
          label="مصارف"
          value={stats.totalExpense}
          prefix="−"
          color={EXPENSE_COLOR}
        />
      </div>
    </>
  )
}

/* ──────────────────────────────
   تب دسته‌بندی
────────────────────────────── */
function CategoriesTab({ byCategory, currency, onCategoryClick }) {
  const rows = byCategory?.rows || []
  const total = byCategory?.totalExpense || 0

  const chartData = rows.map((r) => Math.round(r.amount))
  const chartLabels = rows.map(
    (r) => CATEGORY_MAP[r.categoryId]?.name || 'سایر'
  )
  const chartColors = rows.map(
    (r) => CATEGORY_MAP[r.categoryId]?.color || '#91A6BA'
  )

  return (
    <>
      <Card padded={false} className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <DonutChart
              data={chartData}
              labels={chartLabels}
              colors={chartColors}
              centerLabel="مجموع مصارف"
              centerValue={toPersianDigits(Math.round(total))}
              height={220}
            />
          </div>
          <div className="w-[150px] shrink-0 grid grid-cols-1 gap-1.5 max-h-[240px] overflow-y-auto no-scrollbar">
            {rows.map((r) => {
              const cat = CATEGORY_MAP[r.categoryId]
              return (
                <div
                  key={r.categoryId}
                  className="flex items-center gap-2 py-1"
                >
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: cat?.color || '#91A6BA',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-fg-secondary truncate">
                        {cat?.name || 'سایر'}
                      </span>
                      <span className="text-[10px] font-semibold text-fg shrink-0">
                        {toPersianDigits(Math.round(r.percent))}٪
                      </span>
                    </div>
                    <div className="text-[10px] text-fg-muted tabular-nums mt-0.5">
                      {formatMoney(r.amount)} {currency}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <Card padded={false} className="px-4 py-2">
        <div className="py-3 border-b border-border">
          <h3 className="font-semibold text-fg text-sm">جزئیات دسته‌بندی</h3>
        </div>
        <div className="divide-y divide-border">
          {rows.map((r) => {
            const cat = CATEGORY_MAP[r.categoryId]
            const Icon = Icons[cat?.icon] || Icons.MoreHorizontal
            return (
              <button
                key={r.categoryId}
                onClick={() => onCategoryClick(r.categoryId)}
                className="w-full flex items-center gap-3 py-3 text-right hover:bg-primary/5 rounded-btn px-2 -mx-2 transition"
              >
                <IconCircle
                  icon={Icon}
                  color={cat?.color || '#91A6BA'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-fg text-[14px] truncate">
                    {cat?.name || 'سایر'}
                  </div>
                  <div className="text-[11px] text-fg-muted mt-0.5">
                    {formatMoney(r.amount)} {currency}
                  </div>
                </div>
                <div className="text-sm font-semibold text-fg shrink-0">
                  {toPersianDigits(Math.round(r.percent))}٪
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </>
  )
}

/* ──────────────────────────────
   تب روند
────────────────────────────── */
function TrendTab({ selectedDate, period, walletBalance }) {
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  const isDaily = period === PERIODS.DAILY
  const isWeekly = period === PERIODS.WEEKLY
  const isWeeklyLike = isDaily || isWeekly
  const bucketCount = getBucketCount(period)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      let start, end
      if (isWeeklyLike) {
        const { start: ws, end: we } = getWeekRange(selectedDate)
        start = ws
        end = we
      } else {
        const { start: s, end: e } = getRange(selectedDate, period)
        start = s
        end = e
      }
      const data = await getTransactionsBetween(start, end)
      if (!cancelled) {
        setTxs(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedDate, period, isWeeklyLike])

  const computed = useMemo(() => {
    if (isWeeklyLike) {
      const { start: weekStart } = getWeekRange(selectedDate)
      const weekStartMid = new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate()
      ).getTime()

      const income = [0, 0, 0, 0, 0, 0, 0]
      const expense = [0, 0, 0, 0, 0, 0, 0]

      let totalIncome = 0
      let totalExtra = 0
      let totalExpense = 0

      for (const tx of txs) {
        const d = toDate(tx.date)
        const dayMid = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        ).getTime()
        const diffDays = Math.round(
          (dayMid - weekStartMid) / (1000 * 60 * 60 * 24)
        )
        if (diffDays < 0 || diffDays > 6) continue

        const amt = Number(tx.amount) || 0
        if (tx.type === 'income') {
          income[diffDays] += amt
          totalIncome += amt
          if (tx.subtype !== 'salary') totalExtra += amt
        } else if (tx.type === 'expense') {
          expense[diffDays] += amt
          totalExpense += amt
        }
      }

      const selMid = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      ).getTime()
      const highlightIdx = Math.round(
        (selMid - weekStartMid) / (1000 * 60 * 60 * 24)
      )

      return {
        categoriesFull: WEEKDAY_LABELS,
        categoriesShort: WEEKDAY_SHORT,
        income,
        expense,
        stats: { totalIncome, totalExtra, totalExpense },
        highlightIndex:
          highlightIdx >= 0 && highlightIdx <= 6 ? highlightIdx : null,
      }
    }

    const income = new Array(bucketCount).fill(0)
    const expense = new Array(bucketCount).fill(0)

    let totalIncome = 0
    let totalExtra = 0
    let totalExpense = 0

    for (const tx of txs) {
      const d = toDate(tx.date)
      const idx = getBucketIndex(d, period)
      if (idx < 0 || idx >= bucketCount) continue

      const amt = Number(tx.amount) || 0
      if (tx.type === 'income') {
        income[idx] += amt
        totalIncome += amt
        if (tx.subtype !== 'salary') totalExtra += amt
      } else if (tx.type === 'expense') {
        expense[idx] += amt
        totalExpense += amt
      }
    }

    return {
      categoriesFull: Array.from({ length: bucketCount }, (_, i) =>
        toPersianDigits(i + 1)
      ),
      categoriesShort: null,
      income,
      expense,
      stats: { totalIncome, totalExtra, totalExpense },
      highlightIndex: null,
    }
  }, [txs, period, bucketCount, isWeeklyLike, selectedDate])

  useEffect(() => {
    if (loading || isWeeklyLike || period !== PERIODS.MONTHLY) return
    const el = scrollRef.current
    if (!el) return

    const today = new Date()
    const isSameMonth =
      today.getFullYear() === selectedDate.getFullYear() &&
      today.getMonth() === selectedDate.getMonth()

    const todayJalali = getDate(today)
    const targetDay = isSameMonth ? todayJalali : TOTAL_DAYS
    const targetPos = Math.max(0, (targetDay - 3) * DAY_WIDTH)

    const t = setTimeout(() => {
      el.scrollTo({ left: targetPos, behavior: 'smooth' })
    }, 350)
    return () => clearTimeout(t)
  }, [loading, txs, selectedDate, period, isWeeklyLike])

  if (loading) {
    return <Skeleton className="h-64" rounded="rounded-card" />
  }

  if (txs.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={TrendingUp}
          title="داده‌ای برای روند نیست"
          description="این دوره تراکنشی ثبت نشده است."
        />
      </Card>
    )
  }

  const chartWidth = isWeeklyLike
    ? undefined
    : Math.max(bucketCount * DAY_WIDTH, 320)
  const isScrollable = !isWeeklyLike && bucketCount > 7

  const titleText = isDaily
    ? 'روند این هفته'
    : isWeekly
      ? 'روند هفتگی'
      : period === PERIODS.YEARLY
        ? 'روند سالانه'
        : 'روند ماهانه'

  return (
    <>
      <Card padded={false} className="p-3">
        <div className="px-1.5 pb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-fg">{titleText}</span>
          <div className="flex items-center gap-3 text-[11px]">
            {!isDaily && (
              <div className="flex items-center gap-1">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: INCOME_COLOR }}
                />
                <span className="text-fg-secondary">درآمد</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: EXPENSE_COLOR }}
              />
              <span className="text-fg-secondary">مصارف</span>
            </div>
          </div>
        </div>

        {isScrollable && (
          <div className="px-1.5 pb-1 text-[10px] text-fg-muted flex items-center gap-1">
            <span>←</span>
            <span>برای دیدن روزهای دیگر، افقی بکش</span>
          </div>
        )}

        {isDaily ? (
          <BarChart
            categories={computed.categoriesShort}
            series={[{ name: 'مصارف', data: computed.expense }]}
            colors={[EXPENSE_COLOR]}
            height={260}
            showDataLabels={true}
            highlightIndex={computed.highlightIndex}
            fadeFactor={0.25}
            compact={true}
          />
        ) : isWeekly ? (
          <LineChart
            categories={computed.categoriesFull}
            series={[
              { name: 'درآمد', data: computed.income },
              { name: 'مصارف', data: computed.expense },
            ]}
            colors={[INCOME_COLOR, EXPENSE_COLOR]}
            height={260}
          />
        ) : (
          <div
            ref={scrollRef}
            className="overflow-x-auto no-scrollbar pb-1"
            dir="ltr"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
              <LineChart
                categories={computed.categoriesFull}
                series={[
                  { name: 'درآمد', data: computed.income },
                  { name: 'مصارف', data: computed.expense },
                ]}
                colors={[INCOME_COLOR, EXPENSE_COLOR]}
                height={240}
                width={chartWidth}
              />
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatSmallCard
          label="کل درآمد"
          value={computed.stats.totalIncome}
          prefix="+"
          color={SAVING_COLOR}
        />
        <StatSmallCard
          label="موجودی خزانه"
          value={walletBalance}
          color={WALLET_COLOR}
        />
        <StatSmallCard
          label="مصارف"
          value={computed.stats.totalExpense}
          prefix="−"
          color={EXPENSE_COLOR}
        />
      </div>
    </>
  )
}
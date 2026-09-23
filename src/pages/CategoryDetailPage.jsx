import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Receipt } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  toDate,
} from 'date-fns-jalali'
import { toPersianDigits, formatMoney, toISODate, cn } from '@/lib/utils'
import { getTransactionsByCategory } from '@/db/queries'
import { CATEGORY_MAP } from '@/data/categories'
import { ROUTES, PERIODS } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'

import PageHeader from '@/components/layout/PageHeader'
import PeriodPicker from '@/components/app/PeriodPicker'
import BarChart from '@/components/charts/BarChart'
import TransactionList from '@/components/app/TransactionList'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import StatSmallCard from '@/components/app/StatSmallCard'

function getPeriodRange(period, refDate) {
  const d = toDate(refDate)
  if (period === PERIODS.DAILY) return { start: startOfDay(d), end: endOfDay(d) }
  if (period === PERIODS.WEEKLY)
    return { start: startOfWeek(d, { weekStartsOn: 6 }), end: endOfWeek(d, { weekStartsOn: 6 }) }
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

function getDayCount(period, refDate) {
  const d = toDate(refDate)
  if (period === PERIODS.DAILY) return 1
  if (period === PERIODS.WEEKLY) return 7
  return 30
}

export default function CategoryDetailPage() {
  const { categoryId } = useParams()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const refreshKey = useUIStore((s) => s.refreshKey)

  const cat = CATEGORY_MAP[categoryId] || {
    name: 'نامشخص',
    color: '#6B7280',
    placeholder: '',
  }

  const [period, setPeriod] = useState(PERIODS.MONTHLY)
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { start, end } = getPeriodRange(period, new Date())
      const data = await getTransactionsByCategory(categoryId, start, end)
      if (!cancelled) {
        setTxs(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [categoryId, period, refreshKey])

  const { categories, series, total, avg } = useMemo(() => {
    const dayCount = getDayCount(period, new Date())
    const buckets = new Array(dayCount).fill(0)
    let sum = 0

    for (const tx of txs) {
      const d = toDate(tx.date)
      let idx = 0
      if (period === PERIODS.MONTHLY) idx = d.getDate() - 1
      else if (period === PERIODS.WEEKLY) {
        // شنبه = 0
        idx = (d.getDay() + 1) % 7
      }
      if (idx < 0 || idx >= dayCount) continue
      const amt = Number(tx.amount) || 0
      buckets[idx] += amt
      sum += amt
    }

    return {
      categories: Array.from({ length: dayCount }, (_, i) =>
        toPersianDigits(i + 1)
      ),
      series: [{ name: cat.name, data: buckets }],
      total: sum,
      avg: sum / (dayCount || 1),
    }
  }, [txs, period, cat.name])

  return (
    <div className="px-4 lg:px-6 py-2 pb-6 space-y-4">
      <PageHeader title={`جزئیات ${cat.name}`} showBack />

      {/* انتخابگر دوره */}
      <PeriodPicker value={period} onChange={setPeriod} />

      {/* نمودار میله‌ای */}
      {loading ? (
        <Skeleton className="h-64" rounded="rounded-card" />
      ) : txs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Receipt}
            title="تراکنشی نیست"
            description={`در این دوره تراکنشی برای دسته‌ی ${cat.name} ثبت نشده است.`}
          />
        </Card>
      ) : (
        <>
          <Card padded={false} className="p-3">
            <BarChart
              categories={categories}
              series={series}
              colors={[cat.color]}
              height={240}
            />
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <StatSmallCard
              label="مجموع"
              value={total}
              color={cat.color}
            />
            <StatSmallCard
              label="میانگین روزانه"
              value={avg}
              color="#8B5CF6"
            />
          </div>

          <section>
            <h2 className="font-semibold text-fg mb-2 px-1">
              آخرین تراکنش‌های {cat.name}
            </h2>
            <Card padded={false} className="px-4">
              <TransactionList transactions={txs.slice(0, 20)} />
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
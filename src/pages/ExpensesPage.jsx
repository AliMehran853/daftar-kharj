import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ListChecks, X, Filter } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  compareAsc,
} from 'date-fns-jalali'
import { cn, toISODate, formatMoney, toPersianDigits } from '@/lib/utils'
import { dayKey } from '@/lib/jalali'
import { getTransactionsBetween } from '@/db/queries'
import { CATEGORY_MAP } from '@/data/categories'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'

import PageHeader from '@/components/layout/PageHeader'
import MonthPicker from '@/components/app/MonthPicker'
import FilterChips from '@/components/app/FilterChips'
import TransactionGroup from '@/components/app/TransactionGroup'
import SearchBar from '@/components/app/SearchBar'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

export default function ExpensesPage() {
  const navigate = useNavigate()
  const refreshKey = useUIStore((s) => s.refreshKey)
  const openSheet = useUIStore((s) => s.openSheet)
  const currency = useSettingsStore((s) => s.currencyLabel)

  const [monthDate, setMonthDate] = useState(new Date())
  const [filter, setFilter] = useState('all')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)
      const txs = await getTransactionsBetween(start, end)
      if (!cancelled) {
        setRaw(txs)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [monthDate, refreshKey])

  /* ── فیلتر + جستجو ── */
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return raw.filter((tx) => {
      // فیلتر
      if (filter === 'expense' && tx.type !== 'expense') return false
      if (filter === 'income' && tx.type !== 'income') return false
      if (filter === 'transfer' && tx.type !== 'transfer') return false

      // جستجو
      if (q) {
        const catName = CATEGORY_MAP[tx.categoryId]?.name || ''
        const haystack = `${tx.note || ''} ${catName}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [raw, filter, searchQuery])

  /* ── گروه‌بندی بر اساس روز ── */
  const groups = useMemo(() => {
    const map = new Map()
    for (const tx of filtered) {
      const key = tx.date
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(tx)
    }
    // مرتب: جدیدترین روز اول
    const entries = Array.from(map.entries())
    entries.sort((a, b) => (a[0] < b[0] ? 1 : -1))
    return entries.map(([date, list]) => ({
      date,
      list: list.sort((a, b) => b.createdAt - a.createdAt),
    }))
  }, [filtered])

  /* ── جمع کل فیلتر شده ── */
  const totalFiltered = useMemo(() => {
    return filtered.reduce((sum, tx) => {
      if (tx.type === 'expense') return sum + Number(tx.amount)
      return sum
    }, 0)
  }, [filtered])

  const handleItemClick = (tx) => {
    // در گام‌های بعدی: صفحه‌ی جزئیات تراکنش
    console.log('tx clicked', tx)
  }

  const hasAnyTransaction = raw.length > 0
  const hasFiltered = filtered.length > 0

  return (
    <div className="px-4 lg:px-6 py-2 pb-4">
      <PageHeader
        title="مصارف"
        action={
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className={cn(
              'size-10 rounded-full flex items-center justify-center transition active:scale-95',
              searchOpen
                ? 'bg-brand text-white shadow-brand'
                : 'hover:bg-brand-soft text-fg'
            )}
            aria-label="جستجو"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        }
      />

      {/* جستجو */}
      <SearchBar
        open={searchOpen}
        value={searchQuery}
        onChange={setSearchQuery}
        onClose={() => {
          setSearchOpen(false)
          setSearchQuery('')
        }}
      />

      {/* فیلترها */}
      <FilterChips value={filter} onChange={setFilter} className="mb-3" />

      {/* انتخاب ماه */}
      <MonthPicker value={monthDate} onChange={setMonthDate} className="mb-4" />

      {/* خلاصه‌ی ماه */}
      {!loading && hasFiltered && (
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-fg-muted">
            {filter === 'expense'
              ? 'مجموع مصارف:'
              : filter === 'all'
                ? 'مجموع این ماه:'
                : 'مجموع:'}
          </span>
          <span className="font-semibold text-fg">
            {formatMoney(totalFiltered)} {currency}
          </span>
        </div>
      )}

      {/* محتوا */}
      {loading ? (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-14" />
        </div>
      ) : !hasAnyTransaction ? (
        <Card className="mt-3">
          <EmptyState
            icon={ListChecks}
            title="این ماه هنوز چیزی ثبت نشده"
            description="اولین تراکنش این ماه را ثبت کن تا این‌جا نمایش داده شود."
            action={
              <Button
                size="sm"
                onClick={() => openSheet('quick-add', { tab: 'expense' })}
              >
                ثبت تراکنش
              </Button>
            }
          />
        </Card>
      ) : !hasFiltered ? (
        <Card className="mt-3">
          <EmptyState
            icon={Filter}
            title="نتیجه‌ای یافت نشد"
            description={
              searchQuery
                ? `برای «${searchQuery}» نتیجه‌ای پیدا نشد.`
                : 'با این فیلتر تراکنشی وجود ندارد.'
            }
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFilter('all')
                  setSearchQuery('')
                  setSearchOpen(false)
                }}
              >
                پاک کردن فیلترها
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3 mt-1">
          {groups.map((g) => (
            <TransactionGroup
              key={g.date}
              date={g.date}
              transactions={g.list}
              onItemClick={handleItemClick}
            />
          ))}

          {/* نشانگر پایان */}
          <div className="text-center text-[11px] text-fg-muted py-4">
            پایان لیست
          </div>
        </div>
      )}
    </div>
  )
}
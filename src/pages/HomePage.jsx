import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  Calendar,
  BarChart3,
  ArrowLeft,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toPersianDigits, formatMoney } from '@/lib/utils'
import { ROUTES } from '@/data/constants'
import { useBalance } from '@/hooks/useBalance'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'

import GreetingHeader from '@/components/app/GreetingHeader'
import BalanceHero from '@/components/app/BalanceHero'
import StatCard from '@/components/app/StatCard'
import TransactionList from '@/components/app/TransactionList'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

const INITIAL_LIMIT = 6
const MAX_LIMIT = 30

export default function HomePage() {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const openSheet = useUIStore((s) => s.openSheet)

  const { wallet, savings, monthStats, loading } = useBalance()
  const { transactions: allTxs, loading: txLoading } =
    useRecentTransactions(MAX_LIMIT)

  const [showAll, setShowAll] = useState(false)

  const transactions = showAll
    ? allTxs
    : allTxs.slice(0, INITIAL_LIMIT)

  const hasMore = allTxs.length > INITIAL_LIMIT
  const totalCount = allTxs.length

  return (
    <div className="px-4 lg:px-6 pt-4 pb-4 space-y-5">
      <GreetingHeader />

      {loading ? (
        <Skeleton className="h-64" rounded="rounded-card-lg" />
      ) : (
        <BalanceHero
          balance={wallet}
          savings={savings}
          stats={monthStats}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Banknote}
          color="var(--saving)"
          label="پس‌انداز"
          value={loading ? '…' : formatMoney(savings)}
          unit={currency}
          onClick={() => navigate(ROUTES.SAVINGS)}
        />
        <StatCard
          icon={Calendar}
          color="var(--primary)"
          label="این ماه"
          value={loading ? '…' : toPersianDigits(monthStats?.txCount || 0)}
          unit="تراکنش"
          onClick={() => navigate(ROUTES.EXPENSES)}
        />
      </div>

      {/* دو دکمه‌ی سریع */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openSheet('quick-add', { tab: 'expense' })}
          className="h-14 rounded-btn flex items-center justify-center gap-2 font-medium transition press-sm"
          style={{
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-raised-sm)',
            color: 'var(--expense)',
          }}
        >
          <div
            className="size-8 rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--expense)',
              boxShadow: '0 2px 6px rgba(240, 68, 120, 0.30)',
            }}
          >
            <Minus size={18} strokeWidth={2.6} />
          </div>
          <span className="text-[14px]">ثبت مصرف</span>
        </button>

        <button
          onClick={() => openSheet('quick-add', { tab: 'income' })}
          className="h-14 rounded-btn flex items-center justify-center gap-2 font-medium transition press-sm"
          style={{
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-raised-sm)',
            color: 'var(--income)',
          }}
        >
          <div
            className="size-8 rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--income)',
              boxShadow: '0 2px 6px rgba(22, 165, 106, 0.30)',
            }}
          >
            <Plus size={18} strokeWidth={2.6} />
          </div>
          <span className="text-[14px]">ثبت درآمد</span>
        </button>
      </div>

      <Card
        clickable
        onClick={() => navigate(ROUTES.REPORTS)}
        className="flex items-center gap-3"
      >
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <BarChart3 size={22} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-text">گزارش‌های مالی</div>
          <div className="text-xs text-text-muted mt-0.5">
            نمودار، تحلیل، روند
          </div>
        </div>
        <ArrowLeft size={18} className="text-text-muted" />
      </Card>

      {/* آخرین تراکنش‌ها */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-text">آخرین تراکنش‌ها</h2>

          {hasMore && !txLoading && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm text-primary font-medium flex items-center gap-1 transition press-sm"
            >
              {showAll ? (
                <>
                  <span>نمایش کمتر</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>نمایش همه ({toPersianDigits(totalCount)})</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {txLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <EmptyState
              icon={Plus}
              title="هنوز تراکنشی نداری"
              description="با ثبت اولین مصرف یا درآمد، این‌جا نمایش داده می‌شه."
              action={
                <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => openSheet('quick-add', { tab: 'expense' })}
                >
                  ثبت اولین تراکنش
                </Button>
              }
            />
          </Card>
        ) : (
          <Card padded={false} className="px-4">
            <TransactionList transactions={transactions} />

            {showAll && hasMore && (
              <button
                onClick={() => setShowAll(false)}
                className="w-full h-11 mt-1 border-t border-border text-primary text-[13px] font-medium flex items-center justify-center gap-1.5 transition press-sm"
              >
                <ChevronUp size={14} />
                <span>بستن لیست</span>
              </button>
            )}
          </Card>
        )}
      </section>
    </div>
  )
}
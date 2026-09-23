import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  Calendar,
  BarChart3,
  ArrowLeft,
  Minus,
  Plus,
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

export default function HomePage() {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const openSheet = useUIStore((s) => s.openSheet)

  const { wallet, savings, monthStats, loading } = useBalance()
  const { transactions, loading: txLoading } = useRecentTransactions(6)

  return (
    <div className="px-4 lg:px-6 pt-4 pb-4 space-y-5">
      <GreetingHeader />

      {loading ? (
        <Skeleton className="h-64" rounded="rounded-[28px]" />
      ) : (
        <BalanceHero balance={wallet} stats={monthStats} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Banknote}
          color="#6B4C93"
          label="پس‌انداز"
          value={loading ? '…' : formatMoney(savings)}
          unit={currency}
          onClick={() => navigate(ROUTES.SAVINGS)}
        />
        <StatCard
          icon={Calendar}
          color="#D81B60"
          label="این ماه"
          value={loading ? '…' : toPersianDigits(monthStats?.txCount || 0)}
          unit="تراکنش"
          onClick={() => navigate(ROUTES.EXPENSES)}
        />
      </div>

      {/* دو دکمه‌ی سریع — مصرف صورتی، درآمد سبز */}
      <div className="grid grid-cols-2 gap-3">
        {/* ثبت مصرف — صورتی */}
        <button
          onClick={() => openSheet('quick-add', { tab: 'expense' })}
          className="h-14 rounded-btn flex items-center justify-center gap-2 font-medium transition press border"
          style={{
            backgroundColor: 'var(--danger-soft)',
            color: 'var(--danger)',
            borderColor: 'color-mix(in srgb, var(--danger) 20%, transparent)',
          }}
        >
          <div
            className="size-8 rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--danger)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 6px rgba(185, 28, 74, 0.30)',
            }}
          >
            <Minus size={18} strokeWidth={2.6} />
          </div>
          <span className="text-[14px]">ثبت مصرف</span>
        </button>

        {/* درآمد جانبی — سبز */}
        <button
          onClick={() => openSheet('quick-add', { tab: 'income' })}
          className="h-14 rounded-btn flex items-center justify-center gap-2 font-medium transition press border"
          style={{
            backgroundColor: 'var(--success-soft)',
            color: '#15803D',
            borderColor: 'color-mix(in srgb, var(--success) 25%, transparent)',
          }}
        >
          <div
            className="size-8 rounded-full text-white flex items-center justify-center"
            style={{
              backgroundColor: 'var(--success)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 6px rgba(22, 163, 74, 0.30)',
            }}
          >
            <Plus size={18} strokeWidth={2.6} />
          </div>
          <span className="text-[14px]">درآمد جانبی</span>
        </button>
      </div>

      <Card
        clickable
        onClick={() => navigate(ROUTES.REPORTS)}
        className="flex items-center gap-3"
      >
        <div className="size-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center">
          <BarChart3 size={22} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-fg">گزارش‌های مالی</div>
          <div className="text-xs text-fg-muted mt-0.5">
            نمودار، تحلیل، روند
          </div>
        </div>
        <ArrowLeft size={18} className="text-fg-muted" />
      </Card>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-fg">آخرین تراکنش‌ها</h2>
          <button
            onClick={() => navigate(ROUTES.EXPENSES)}
            className="text-sm text-brand font-medium"
          >
            نمایش همه
          </button>
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
            <TransactionList
              transactions={transactions}
              onItemClick={() => navigate(ROUTES.EXPENSES)}
            />
          </Card>
        )}
      </section>
    </div>
  )
}
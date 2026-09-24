import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  ArrowDown,
  ArrowUp,
  PiggyBank,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import { formatMoney, toPersianDigits, cn } from '@/lib/utils'
import { getBalance, getTransferHistory } from '@/db/queries'
import { TX_SUBTYPES, ROUTES } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { buildSavingsReportHtml, downloadPdf } from '@/lib/pdf'

import PageHeader from '@/components/layout/PageHeader'
import TransferHistoryItem from '@/components/app/TransferHistoryItem'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const INITIAL_LIMIT = 5
const MAX_LIMIT = 100

export default function SavingsPage() {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const openSheet = useUIStore((s) => s.openSheet)
  const refreshKey = useUIStore((s) => s.refreshKey)
  const privacyMode = useUIStore((s) => s.privacyMode)
  const togglePrivacy = useUIStore((s) => s.togglePrivacy)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState({ wallet: 0, savings: 0 })
  const [history, setHistory] = useState([])
  const [exporting, setExporting] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const [b, allTxs] = await Promise.all([
        getBalance(),
        getTransferHistory(),
      ])
      if (cancelled) return
      setBalance(b)
      setHistory(allTxs)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const { depositCount, totalIn, totalOut } = useMemo(() => {
    let count = 0
    let inSum = 0
    let outSum = 0
    for (const tx of history) {
      const amt = Number(tx.amount) || 0
      if (tx.subtype === TX_SUBTYPES.TO_SAVINGS) {
        count++
        inSum += amt
      } else {
        outSum += amt
      }
    }
    return { depositCount: count, totalIn: inSum, totalOut: outSum }
  }, [history])

  const visibleHistory = useMemo(
    () =>
      showAll
        ? history.slice(0, MAX_LIMIT)
        : history.slice(0, INITIAL_LIMIT),
    [history, showAll]
  )

  const hasMore = history.length > INITIAL_LIMIT
  const totalCount = history.length

  const money = (n) => (privacyMode ? '••••' : formatMoney(n))

  const handleExportPdf = async () => {
    if (history.length === 0) {
      showToast('تراکنشی برای خروجی نیست', 'info')
      return
    }
    setExporting(true)
    try {
      const report = buildSavingsReportHtml({
        transfers: history,
        totalIn,
        totalOut,
        currentSavings: balance.savings,
        filename: 'daftar-kharj-savings',
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
    <div className="px-4 lg:px-6 py-2 pb-4 space-y-4">
      <PageHeader
        title="پس‌انداز"
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportPdf}
              disabled={loading || history.length === 0 || exporting}
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
            <button
              onClick={() => navigate(ROUTES.SETTINGS)}
              className="size-10 rounded-full hover:bg-primary/10 flex items-center justify-center text-text transition press-sm"
              aria-label="تنظیمات"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        }
      />

      {/* کارت اصلی پس‌انداز */}
      {loading ? (
        <Skeleton className="h-44" rounded="rounded-card-lg" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-card-lg p-5 text-white relative overflow-hidden"
          style={{
            background: 'var(--gradient-savings)',
            boxShadow: 'var(--savings-hero-shadow)',
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
            <div className="flex items-start justify-between">
              <div className="text-sm text-white/80">موجودی پس‌انداز</div>
              <button
                onClick={togglePrivacy}
                className="size-9 rounded-full bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center transition press-sm hover:bg-white/20"
                aria-label="حریم خصوصی"
              >
                <Sparkles size={16} />
              </button>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <motion.div
                key={balance.savings}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[44px] leading-none font-bold tracking-tight tabular-nums"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.10)' }}
              >
                {money(balance.savings)}
              </motion.div>
              <span className="text-sm text-white/70">{currency}</span>
            </div>

            <div className="mt-4 text-xs text-white/60">
              از ابتدا {toPersianDigits(depositCount)} بار پس‌انداز
            </div>
          </div>
        </motion.div>
      )}

      {/* دکمه‌های واریز/برداشت */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            openSheet('transfer', { direction: 'to-savings' })
          }
          className="h-12 rounded-btn text-white font-medium flex items-center justify-center gap-2 transition press-sm"
          style={{
            background: 'var(--saving)',
            boxShadow:
              '0 2px 6px rgba(116, 87, 217, 0.25), 0 8px 16px rgba(116, 87, 217, 0.15)',
          }}
        >
          <ArrowDown size={18} strokeWidth={2.4} />
          <span className="text-[13.5px]">واریز به پس‌انداز</span>
        </button>
        <button
          onClick={() =>
            openSheet('transfer', { direction: 'from-savings' })
          }
          className="h-12 rounded-btn font-medium flex items-center justify-center gap-2 transition press-sm neu-raised-sm"
          style={{ color: 'var(--saving)' }}
        >
          <ArrowUp size={18} strokeWidth={2.4} />
          <span className="text-[13.5px]">برداشت از پس‌انداز</span>
        </button>
      </div>

      {/* خلاصه‌ی آماری */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card padded className="!p-3.5">
            <div className="text-[11px] text-text-muted">مجموع واریز</div>
            <div
              className="mt-1 font-semibold text-[15px] tabular-nums"
              style={{ color: 'var(--income)' }}
            >
              +{money(totalIn)}
            </div>
          </Card>
          <Card padded className="!p-3.5">
            <div className="text-[11px] text-text-muted">مجموع برداشت</div>
            <div
              className="mt-1 font-semibold text-[15px] tabular-nums"
              style={{ color: 'var(--expense)' }}
            >
              −{money(totalOut)}
            </div>
          </Card>
        </div>
      )}

      {/* تاریخچه */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-semibold text-text">تاریخچه‌ی انتقال‌ها</h2>

          {hasMore && !loading && (
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

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : history.length === 0 ? (
          <Card>
            <EmptyState
              icon={PiggyBank}
              title="هنوز انتقالی نداری"
              description="اولین واریز به پس‌انداز را انجام بده تا این‌جا نمایش داده شود."
            />
          </Card>
        ) : (
          <Card padded={false} className="px-4">
            <div className="divide-y divide-border">
              {visibleHistory.map((tx) => (
                <TransferHistoryItem key={tx.id} tx={tx} />
              ))}
            </div>

            {/* دکمه‌ی بستن لیست */}
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
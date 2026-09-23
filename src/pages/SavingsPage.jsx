import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  ArrowDown,
  ArrowUp,
  PiggyBank,
  Sparkles,
  FileText,
} from 'lucide-react'
import { motion } from 'motion/react'
import { formatMoney, toPersianDigits, cn } from '@/lib/utils'
import { getBalance, getTransferHistory } from '@/db/queries'
import { TX_SUBTYPES, ROUTES } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { buildSavingsReportHtml, printHtml } from '@/lib/pdf'

import PageHeader from '@/components/layout/PageHeader'
import TransferHistoryItem from '@/components/app/TransferHistoryItem'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

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

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const [b, txs] = await Promise.all([
        getBalance(),
        getTransferHistory(),
      ])
      if (cancelled) return
      setBalance(b)
      setHistory(txs)
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

  const money = (n) => (privacyMode ? '••••' : formatMoney(n))

  const handleExportPdf = async () => {
    if (history.length === 0) {
      showToast('تراکنشی برای خروجی نیست', 'info')
      return
    }
    setExporting(true)
    try {
      const html = buildSavingsReportHtml({
        transfers: history,
        totalIn,
        totalOut,
      })
      printHtml(html)
      showToast('پنجره‌ی چاپ باز شد', 'success')
    } catch (e) {
      console.error(e)
      showToast('خطا در ساخت گزارش', 'error')
    } finally {
      setTimeout(() => setExporting(false), 1200)
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
                'hover:bg-brand-soft text-brand'
              )}
              aria-label="خروجی PDF"
            >
              <FileText size={18} />
            </button>
            <button
              onClick={() => navigate(ROUTES.SETTINGS)}
              className="size-10 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg transition press-sm"
              aria-label="تنظیمات"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        }
      />

      {/* کارت اصلی پس‌انداز — سایه‌ی خیلی خفیف + عمق ظریف */}
      {loading ? (
        <Skeleton className="h-44" rounded="rounded-[28px]" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] p-5 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6B4C93 0%, #8E24AA 100%)',
            boxShadow:
              'inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 1px 3px rgba(107, 76, 147, 0.08), 0 4px 12px rgba(107, 76, 147, 0.06)',
          }}
        >
          {/* نور بالای کارت — بازتاب */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[140%] h-48 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center top, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 45%, transparent 70%)',
              zIndex: 0,
            }}
          />

          {/* لکه‌ی تزئینی */}
          <div
            className="absolute -bottom-24 -right-12 size-56 rounded-full bg-white/5 blur-3xl pointer-events-none"
            style={{ zIndex: 0 }}
          />

          <div className="relative" style={{ zIndex: 1 }}>
            <div className="flex items-start justify-between">
              <div className="text-sm text-white/85">موجودی پس‌انداز</div>
              <button
                onClick={togglePrivacy}
                className="size-9 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center transition press-sm hover:bg-white/20"
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
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)' }}
              >
                {money(balance.savings)}
              </motion.div>
              <span className="text-sm text-white/85">{currency}</span>
            </div>

            <div className="mt-4 text-xs text-white/80">
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
          className="h-12 rounded-btn text-white font-medium flex items-center justify-center gap-2 transition press"
          style={{
            backgroundColor: '#6B4C93',
            boxShadow:
              'inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 2px 6px rgba(107, 76, 147, 0.20), 0 8px 16px rgba(107, 76, 147, 0.12)',
          }}
        >
          <ArrowDown size={18} strokeWidth={2.4} />
          <span className="text-[13.5px]">واریز به پس‌انداز</span>
        </button>
        <button
          onClick={() =>
            openSheet('transfer', { direction: 'from-savings' })
          }
          className="h-12 rounded-btn bg-card border-2 text-info font-medium flex items-center justify-center gap-2 transition press hover:bg-info-soft/30"
          style={{
            borderColor: '#6B4C93',
            boxShadow: '0 1px 3px rgba(107, 76, 147, 0.06)',
          }}
        >
          <ArrowUp size={18} strokeWidth={2.4} />
          <span className="text-[13.5px]">برداشت از پس‌انداز</span>
        </button>
      </div>

      {/* خلاصه‌ی آماری */}
      {!loading && history.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card padded className="!p-3.5">
            <div className="text-[11px] text-fg-muted">مجموع واریز</div>
            <div
              className="mt-1 font-semibold text-[15px] tabular-nums"
              style={{ color: '#16A34A' }}
            >
              +{money(totalIn)}
            </div>
          </Card>
          <Card padded className="!p-3.5">
            <div className="text-[11px] text-fg-muted">مجموع برداشت</div>
            <div
              className="mt-1 font-semibold text-[15px] tabular-nums"
              style={{ color: '#D81B60' }}
            >
              −{money(totalOut)}
            </div>
          </Card>
        </div>
      )}

      {/* تاریخچه */}
      <section>
        <h2 className="font-semibold text-fg mb-2 px-1">
          تاریخچه‌ی انتقال‌ها
        </h2>

        {loading ? (
          <div className="space-y-3">
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
              {history.map((tx) => (
                <TransferHistoryItem key={tx.id} tx={tx} />
              ))}
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
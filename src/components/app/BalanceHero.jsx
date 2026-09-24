import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react'
import { formatMoney } from '@/lib/utils'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { ROUTES } from '@/data/constants'

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

export default function BalanceHero({ balance = 0, stats }) {
  const navigate = useNavigate()
  const currency = useSettingsStore((s) => s.currencyLabel)
  const privacyMode = useUIStore((s) => s.privacyMode)
  const togglePrivacy = useUIStore((s) => s.togglePrivacy)

  const income = (stats?.salary || 0) + (stats?.extraIncome || 0)
  const expense = stats?.totalExpense || 0

  const usedPercent =
    income > 0 ? Math.min(100, Math.max(0, (expense / income) * 100)) : 0
  const remainingPercent = 100 - usedPercent

  const isNegative = balance < 0
  const health = getHealthColors(usedPercent)

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

        <div className="mt-5 grid grid-cols-3 gap-2">
          <StatColumn
            label="معاش"
            value={`+${money(stats?.salary || 0)}`}
            color="#86EFAC"
          />
          <StatColumn
            label="درآمد جانبی"
            value={`+${money(stats?.extraIncome || 0)}`}
            color="#86EFAC"
          />
          <StatColumn
            label="مصارف"
            value={`−${money(expense)}`}
            color="#FCA5A5"
          />
        </div>

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
      <div className="text-[11px] text-white/60 mb-1">{label}</div>
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
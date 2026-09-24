import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  MoreVertical,
  Pencil,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn, formatMoney } from '@/lib/utils'
import { formatTime, relativeDayLabel, formatJalaliLong } from '@/lib/jalali'
import { TX_SUBTYPES } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import { deleteTransaction } from '@/db/queries'

export default function TransferHistoryItem({ tx }) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmRevert, setConfirmRevert] = useState(false)
  const [reverting, setReverting] = useState(false)

  const openSheet = useUIStore((s) => s.openSheet)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)

  const isDeposit = tx.subtype === TX_SUBTYPES.TO_SAVINGS
  const Icon = isDeposit ? ArrowDown : ArrowUp
  const color = isDeposit ? 'var(--income)' : 'var(--expense)'
  const sign = isDeposit ? '+' : '−'
  const label = isDeposit ? 'واریز' : 'برداشت'
  const revertLabel = isDeposit ? 'برگشت واریز' : 'برگشت برداشت'

  /* توضیح دقیق که پول کجا می‌ره */
  const revertDescription = isDeposit
    ? 'مبلغ از پس‌انداز برداشته و به خزانه برمی‌گرده.'
    : 'مبلغ از خزانه برداشته و به پس‌انداز برمی‌گرده.'

  const dayLabel = relativeDayLabel(tx.date)
  const isRecent = dayLabel === 'امروز' || dayLabel === 'دیروز'
  const timeLabel = formatTime(new Date(tx.createdAt))
  const fullDate = formatJalaliLong(tx.date)

  const hasNote = !!tx.note

  const handleToggle = () => {
    setExpanded((v) => !v)
  }

  const handleOpenMenu = (e) => {
    e.stopPropagation()
    setMenuOpen(true)
  }

  const handleEdit = () => {
    setMenuOpen(false)
    setExpanded(false)
    openSheet('transfer', {
      editId: tx.id,
      editData: tx,
    })
  }

  const handleRevertClick = () => {
    setMenuOpen(false)
    setConfirmRevert(true)
  }

  const handleRevertConfirm = async () => {
    setReverting(true)
    try {
      await deleteTransaction(tx.id)
      triggerRefresh()
      showToast(`${revertLabel} انجام شد`, 'success')
      setConfirmRevert(false)
      setExpanded(false)
    } catch (err) {
      console.error(err)
      showToast('خطا در برگشت', 'error')
    } finally {
      setReverting(false)
    }
  }

  return (
    <>
      <div className="w-full">
        {/* ردیف اصلی */}
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              'flex-1 min-w-0 flex items-center gap-3 py-3 text-right',
              'transition-colors rounded-btn',
              'hover:bg-primary/5 active:bg-primary/10'
            )}
          >
            <div
              className="size-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                color,
              }}
            >
              <Icon size={20} strokeWidth={2.4} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-text truncate text-[15px]">
                {label}
              </div>
              {tx.note && !expanded && (
                <div className="text-xs text-text-muted truncate mt-0.5">
                  {tx.note}
                </div>
              )}
              {expanded && (
                <div className="text-[11px] text-text-muted mt-0.5">
                  {dayLabel === 'امروز'
                    ? `امروز • ${timeLabel}`
                    : `${fullDate} • ${timeLabel}`}
                </div>
              )}
            </div>

            <div className="text-left shrink-0 flex flex-col items-end gap-1">
              <div
                className="font-semibold text-[15px] tabular-nums"
                style={{ color }}
              >
                {sign}
                {formatMoney(tx.amount)}
              </div>

              {!expanded && (
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      isRecent ? 'text-primary' : 'text-text-muted'
                    )}
                  >
                    {dayLabel}
                  </span>
                  <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    <ChevronDown
                      size={12}
                      className="text-text-muted/70"
                      strokeWidth={2.5}
                    />
                  </motion.span>
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={handleOpenMenu}
            className={cn(
              'shrink-0 size-8 rounded-full ml-1',
              'flex items-center justify-center',
              'text-text-muted hover:text-text',
              'hover:bg-surface-high active:bg-surface-deep',
              'transition press-sm'
            )}
            aria-label="گزینه‌ها"
          >
            <MoreVertical size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* جزئیات expandable */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pr-[60px] pb-3 space-y-2">
                {hasNote && (
                  <div className="bg-surface-deep rounded-btn p-3">
                    <div className="text-[10px] text-text-muted mb-1">
                      توضیحات
                    </div>
                    <div
                      className="text-[13px] text-text leading-relaxed"
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {tx.note}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted/60">📅</span>
                    <span>{fullDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted/60">🕐</span>
                    <span>{timeLabel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="text-text-muted/60">نوع:</span>
                  <span className="font-semibold" style={{ color }}>
                    {label}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(false)
                  }}
                  className={cn(
                    'w-full h-8 rounded-btn',
                    'bg-surface-deep hover:bg-surface-high',
                    'text-text-secondary text-[11px] font-medium',
                    'flex items-center justify-center gap-1',
                    'transition press-sm'
                  )}
                >
                  <ChevronDown
                    size={12}
                    strokeWidth={2.5}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                  <span>بستن جزئیات</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Action Sheet ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-vaul-no-drag=""
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 backdrop-blur-md bg-black/40"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className={cn(
                'relative w-full sm:max-w-xs',
                'mx-3 mb-3 sm:mb-0',
                'neu-raised-lg rounded-card-lg',
                'p-4'
              )}
            >
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
                <div
                  className="size-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                    color,
                  }}
                >
                  <Icon size={18} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text text-sm truncate">
                    {label}
                  </div>
                  <div
                    className="text-[12px] font-medium tabular-nums"
                    style={{ color }}
                  >
                    {sign}
                    {formatMoney(tx.amount)} افغانی
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="size-8 rounded-full hover:bg-surface-high flex items-center justify-center text-text-muted transition press-sm"
                  aria-label="بستن"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className={cn(
                    'w-full h-12 rounded-btn',
                    'bg-primary/10 hover:bg-primary/15 active:bg-primary/20',
                    'text-primary font-medium text-[14px]',
                    'flex items-center justify-start gap-3 px-4',
                    'transition press-sm'
                  )}
                >
                  <Pencil size={18} strokeWidth={2.4} />
                  <span>ویرایش انتقال</span>
                </button>

                <button
                  type="button"
                  onClick={handleRevertClick}
                  className={cn(
                    'w-full h-12 rounded-btn',
                    'font-medium text-[14px]',
                    'flex items-center justify-start gap-3 px-4',
                    'transition press-sm'
                  )}
                  style={{
                    background:
                      'color-mix(in srgb, var(--warning) 12%, transparent)',
                    color: 'var(--warning)',
                  }}
                >
                  <RotateCcw size={18} strokeWidth={2.4} />
                  <span>{revertLabel}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── مودال تایید برگشت ─── */}
      <AnimatePresence>
        {confirmRevert && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-vaul-no-drag=""
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 backdrop-blur-md bg-black/50"
              onClick={() => !reverting && setConfirmRevert(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className="relative w-full max-w-xs neu-raised-lg rounded-card-lg p-5"
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className="size-14 rounded-full flex items-center justify-center mb-3"
                  style={{
                    background:
                      'color-mix(in srgb, var(--warning) 18%, transparent)',
                    color: 'var(--warning)',
                  }}
                >
                  <RotateCcw size={26} strokeWidth={2.2} />
                </div>

                <h3 className="text-base font-semibold text-text mb-1.5">
                  {revertLabel} شود؟
                </h3>
                <p className="text-[12.5px] text-text-secondary leading-relaxed">
                  {revertDescription}
                </p>

                {/* نمایش جزئیات تراکنش */}
                <div
                  className="mt-3 px-3 py-2 rounded-btn w-full"
                  style={{
                    background:
                      'color-mix(in srgb, var(--warning) 10%, transparent)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">
                      مبلغ
                    </span>
                    <span
                      className="text-[13px] font-bold tabular-nums"
                      style={{ color: 'var(--warning)' }}
                    >
                      {formatMoney(tx.amount)} افغانی
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-5">
                  <button
                    type="button"
                    onClick={() => setConfirmRevert(false)}
                    disabled={reverting}
                    className={cn(
                      'h-11 rounded-btn font-medium',
                      'bg-surface-deep hover:bg-surface-high',
                      'text-text text-[13px]',
                      'transition press-sm',
                      'disabled:opacity-50'
                    )}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleRevertConfirm}
                    disabled={reverting}
                    className={cn(
                      'h-11 rounded-btn font-medium text-white',
                      'text-[13px]',
                      'flex items-center justify-center gap-1.5',
                      'transition press-sm',
                      'disabled:opacity-60'
                    )}
                    style={{
                      background:
                        'linear-gradient(135deg, #F5A623 0%, #D68A12 100%)',
                      boxShadow: '0 2px 6px rgba(245, 166, 35, 0.30)',
                    }}
                  >
                    {reverting ? (
                      <span className="opacity-80">در حال برگشت…</span>
                    ) : (
                      <>
                        <RotateCcw size={14} strokeWidth={2.4} />
                        <span>برگشت بده</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
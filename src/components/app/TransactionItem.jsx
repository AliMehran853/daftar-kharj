import { useState } from 'react'
import * as Icons from 'lucide-react'
import {
  ChevronDown,
  MoreVertical,
  Trash2,
  Pencil,
  AlertTriangle,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn, formatMoney } from '@/lib/utils'
import {
  formatTime,
  relativeDayLabel,
  formatJalaliLong,
} from '@/lib/jalali'
import { CATEGORY_MAP } from '@/data/categories'
import IconCircle from '@/components/ui/IconCircle'
import { useUIStore } from '@/store/useUIStore'
import { deleteTransaction } from '@/db/queries'

function resolveCategory(categoryId) {
  return CATEGORY_MAP[categoryId] || {
    name: 'سایر',
    icon: 'MoreHorizontal',
    color: '#91A6BA',
  }
}

export default function TransactionItem({ tx, onClick }) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const openSheet = useUIStore((s) => s.openSheet)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)
  const showToast = useUIStore((s) => s.showToast)

  const cat = resolveCategory(tx.categoryId)
  const Icon = Icons[cat.icon] || Icons.MoreHorizontal

  const isIncome = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'

  const amountColor = isIncome
    ? 'text-income'
    : isTransfer
      ? 'text-info'
      : 'text-expense'

  const sign = isIncome ? '+' : isTransfer ? '' : '−'

  const dayLabel = relativeDayLabel(tx.date)
  const isRecent = dayLabel === 'امروز' || dayLabel === 'دیروز'
  const timeLabel = formatTime(new Date(tx.createdAt))
  const fullDate = formatJalaliLong(tx.date)

  const hasDetails =
    !!tx.note ||
    tx.type === 'transfer' ||
    (tx.subtype && tx.subtype !== 'extra' && tx.subtype !== 'salary')

  const handleToggle = () => {
    if (onClick) {
      onClick(tx)
      return
    }
    if (hasDetails) {
      setExpanded((v) => !v)
    }
  }

  const handleOpenMenu = (e) => {
    e.stopPropagation()
    setMenuOpen(true)
  }

  const handleEdit = () => {
    setMenuOpen(false)
    setExpanded(false)
    openSheet('quick-add', {
      tab: tx.type === 'income' ? 'income' : 'expense',
      editId: tx.id,
      editData: tx,
    })
  }

  const handleDeleteClick = () => {
    setMenuOpen(false)
    setConfirmDelete(true)
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteTransaction(tx.id)
      triggerRefresh()
      showToast('تراکنش حذف شد', 'info')
      setConfirmDelete(false)
      setExpanded(false)
    } catch (err) {
      console.error(err)
      showToast('خطا در حذف', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="w-full">
        {/* ردیف اصلی + دکمه سه‌نقطه */}
        <div className="relative flex items-center">
          {/* ردیف اصلی — قابل کلیک برای expand */}
          <button
            type="button"
            onClick={handleToggle}
            className={cn(
              'flex-1 min-w-0 flex items-center gap-3 py-3 text-right',
              'transition-colors rounded-btn',
              hasDetails &&
                'hover:bg-primary/5 active:bg-primary/10 cursor-pointer'
            )}
          >
            <IconCircle icon={Icon} color={cat.color} size="lg" />

            <div className="flex-1 min-w-0">
              <div className="font-medium text-text truncate">
                {cat.name}
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
                className={cn(
                  'font-semibold text-[15px] tabular-nums',
                  amountColor
                )}
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
                  {hasDetails && (
                    <ChevronDown
                      size={12}
                      className="text-text-muted/70"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              )}
            </div>
          </button>

          {/* دکمه‌ی سه‌نقطه */}
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

        {/* بخش جزئیات expandable */}
        <AnimatePresence initial={false}>
          {expanded && hasDetails && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pr-[60px] pb-3 space-y-2">
                {tx.note && (
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
                  <span>{fullDate}</span>
                  <span>{timeLabel}</span>
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

      {/* ─── Action Sheet (منوی سه‌نقطه) ─── */}
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
            {/* Backdrop */}
            <div
              className="absolute inset-0 backdrop-blur-md bg-black/40"
              onClick={() => setMenuOpen(false)}
            />

            {/* کارت منو */}
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
              {/* هدر خلاصه */}
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
                <IconCircle icon={Icon} color={cat.color} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text text-sm truncate">
                    {cat.name}
                  </div>
                  <div
                    className={cn(
                      'text-[12px] font-medium tabular-nums',
                      amountColor
                    )}
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

              {/* گزینه‌ها */}
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
                  <span>ویرایش تراکنش</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className={cn(
                    'w-full h-12 rounded-btn',
                    'bg-expense/10 hover:bg-expense/15 active:bg-expense/20',
                    'text-expense font-medium text-[14px]',
                    'flex items-center justify-start gap-3 px-4',
                    'transition press-sm'
                  )}
                >
                  <Trash2 size={18} strokeWidth={2.4} />
                  <span>حذف تراکنش</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── مودال تایید حذف ─── */}
      <AnimatePresence>
        {confirmDelete && (
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
              onClick={() => !deleting && setConfirmDelete(false)}
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
                      'color-mix(in srgb, var(--expense) 15%, transparent)',
                    color: 'var(--expense)',
                  }}
                >
                  <AlertTriangle size={26} strokeWidth={2.2} />
                </div>

                <h3 className="text-base font-semibold text-text mb-1.5">
                  تراکنش حذف شود؟
                </h3>
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  این عمل قابل بازگشت نیست.
                </p>
                <div
                  className="mt-2 px-3 py-1.5 rounded-full"
                  style={{
                    background:
                      'color-mix(in srgb, var(--expense) 10%, transparent)',
                  }}
                >
                  <span className="text-[12px] font-medium text-expense">
                    {cat.name} — {sign}
                    {formatMoney(tx.amount)} افغانی
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-5">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
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
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className={cn(
                      'h-11 rounded-btn font-medium text-white',
                      'text-[13px]',
                      'flex items-center justify-center gap-1.5',
                      'transition press-sm',
                      'disabled:opacity-60'
                    )}
                    style={{
                      background:
                        'linear-gradient(135deg, #F04478 0%, #D93666 100%)',
                      boxShadow: '0 2px 6px rgba(240, 68, 120, 0.30)',
                    }}
                  >
                    {deleting ? (
                      <span className="opacity-80">در حال حذف…</span>
                    ) : (
                      <>
                        <Trash2 size={14} strokeWidth={2.4} />
                        <span>حذف</span>
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
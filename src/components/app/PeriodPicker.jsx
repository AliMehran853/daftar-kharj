import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { PERIODS } from '@/data/constants'

const OPTIONS = [
  { key: PERIODS.DAILY, label: 'روزانه' },
  { key: PERIODS.WEEKLY, label: 'هفتگی' },
  { key: PERIODS.MONTHLY, label: 'ماهانه' },
  { key: PERIODS.YEARLY, label: 'سالانه' },
]

export default function PeriodPicker({ value, onChange, className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-4 gap-1 p-1 rounded-full bg-card border border-border',
        className
      )}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.key
        return (
          <button
            key={opt.key}
            onClick={() => onChange?.(opt.key)}
            className={cn(
              'relative h-9 rounded-full text-[12.5px] font-medium',
              'transition-colors duration-200 select-none',
              active ? 'text-white' : 'text-fg-secondary hover:text-fg'
            )}
          >
            {active && (
              <motion.span
                layoutId="period-picker-active"
                className="absolute inset-0 rounded-full bg-brand shadow-brand"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
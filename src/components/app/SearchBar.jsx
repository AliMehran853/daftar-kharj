import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export default function SearchBar({
  open,
  value,
  onChange,
  onClose,
  placeholder = 'جستجو در یادداشت‌ها و دسته‌ها…',
  className,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.22 }}
          className={cn('overflow-hidden', className)}
        >
          <div className="relative">
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full h-11 rounded-btn pr-10 pl-10',
                'bg-card border border-border',
                'text-fg placeholder:text-fg-muted text-[15px]',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'
              )}
            />
            <button
              onClick={onClose}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-7 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition"
              aria-label="بستن جستجو"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
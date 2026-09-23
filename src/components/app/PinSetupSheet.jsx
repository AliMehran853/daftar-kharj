import { useEffect, useState } from 'react'
import { Drawer } from 'vaul'
import { X, Delete } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { PIN_LENGTH } from '@/data/constants'
import { savePin, verifyPin } from '@/lib/auth'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export default function PinSetupSheet({ open, payload, onClose }) {
  const mode = payload?.mode || 'set'
  const showToast = useUIStore((s) => s.showToast)
  const refreshAuth = useAuthStore((s) => s.refresh)
  const markUnlocked = useAuthStore((s) => s.markUnlocked)

  const [stage, setStage] = useState('enter')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setStage('enter')
      setFirstPin('')
      setPin('')
      setError('')
      setShake(false)
      setSaving(false)
    }
  }, [open])

  useEffect(() => {
    if (pin.length !== PIN_LENGTH) return

    const complete = async () => {
      // ─── تنظیم رمز جدید ───
      if (mode === 'set') {
        if (stage === 'enter') {
          setFirstPin(pin)
          setTimeout(() => {
            setPin('')
            setStage('confirm')
          }, 180)
        } else {
          if (pin === firstPin) {
            setSaving(true)
            try {
              await savePin(pin)
              // بعد از تنظیم، این session رو unlocked کن
              markUnlocked()
              await refreshAuth()
              showToast('رمز تعیین شد', 'success')
              await payload?.onDone?.()
            } catch (e) {
              console.error(e)
              showToast('خطا در ذخیره‌ی رمز', 'error')
            } finally {
              setSaving(false)
              onClose?.()
            }
          } else {
            triggerError('رمز یکسان نیست')
            setTimeout(() => {
              setPin('')
              setFirstPin('')
              setStage('enter')
            }, 500)
          }
        }
        return
      }

      // ─── تایید رمز فعلی ───
      if (mode === 'verify') {
        setSaving(true)
        try {
          const ok = await verifyPin(pin)
          if (ok) {
            payload?.onVerified?.()
            onClose?.()
          } else {
            triggerError('رمز اشتباه است')
          }
        } finally {
          setSaving(false)
        }
      }
    }

    complete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const triggerError = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTimeout(() => setPin(''), 400)
    setTimeout(() => setError(''), 1600)
  }

  const handleKey = (k) => {
    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (k === '' || pin.length >= PIN_LENGTH || saving) return
    setPin((p) => (p + k).slice(0, PIN_LENGTH))
  }

  const title =
    mode === 'verify'
      ? 'تایید رمز فعلی'
      : stage === 'enter'
        ? 'تعیین رمز جدید'
        : 'تکرار رمز'

  const subtitle =
    mode === 'verify'
      ? 'برای ادامه رمز فعلی را وارد کن'
      : stage === 'enter'
        ? 'یک رمز ۴ رقمی انتخاب کن'
        : 'رمز را دوباره وارد کن'

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => !o && onClose?.()}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 inset-x-0 z-50',
            'bg-card border-t border-border',
            'rounded-t-[28px]',
            'flex flex-col',
            'focus:outline-none'
          )}
        >
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-10 h-1.5 rounded-full bg-border" />
          </div>

          <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
            <Drawer.Title className="text-lg font-semibold text-fg">
              {title}
            </Drawer.Title>
            <button
              onClick={onClose}
              className="size-9 rounded-full hover:bg-brand-soft flex items-center justify-center text-fg-muted transition active:scale-95"
              aria-label="بستن"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-5 pb-4">
            <p className="text-center text-xs text-fg-muted mb-5">{subtitle}</p>

            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-4 mb-2"
            >
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'size-4 rounded-full border-2 transition-all duration-200',
                    error
                      ? 'bg-danger border-danger'
                      : i < pin.length
                        ? 'bg-brand border-brand scale-110'
                        : 'bg-transparent border-border'
                  )}
                />
              ))}
            </motion.div>

            <div
              className={cn(
                'text-center text-xs mt-3 h-4 transition-colors',
                error ? 'text-danger' : 'text-transparent'
              )}
            >
              {error || '.'}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {KEYS.map((k, idx) => {
                if (k === '') return <div key={idx} />
                if (k === 'del') {
                  return (
                    <button
                      key={idx}
                      onClick={() => handleKey('del')}
                      className="h-14 rounded-2xl flex items-center justify-center text-fg-muted hover:bg-brand-soft transition active:scale-95"
                    >
                      <Delete size={22} />
                    </button>
                  )
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleKey(k)}
                    disabled={saving}
                    className={cn(
                      'h-14 rounded-2xl bg-bg border border-border',
                      'text-2xl font-semibold text-fg',
                      'transition active:scale-95',
                      'disabled:opacity-40'
                    )}
                  >
                    {FA_DIGITS[Number(k)]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pb-safe" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
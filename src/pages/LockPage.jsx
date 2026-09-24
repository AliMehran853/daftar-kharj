import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Delete, Fingerprint, KeyRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PIN_LENGTH } from '@/data/constants'
import { verifyPin, verifyBiometric } from '@/lib/auth'
import { useAuthStore } from '@/store/useAuthStore'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export default function LockPage() {
  const markUnlocked = useAuthStore((s) => s.markUnlocked)
  const pinEnabled = useAuthStore((s) => s.pinEnabled)
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled)

  const [mode, setMode] = useState(biometricEnabled ? 'biometric' : 'pin')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (biometricEnabled && mode === 'biometric') {
      const t = setTimeout(() => {
        triggerBiometric()
      }, 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pin.length !== PIN_LENGTH || mode !== 'pin') return
    const complete = async () => {
      setBusy(true)
      const ok = await verifyPin(pin)
      setBusy(false)
      if (ok) {
        markUnlocked()
      } else {
        triggerError('رمز اشتباه است')
      }
    }
    complete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const triggerBiometric = async () => {
    try {
      setBusy(true)
      await verifyBiometric()
      markUnlocked()
    } catch (e) {
      if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
        triggerError('اثر انگشت تایید نشد')
      }
    } finally {
      setBusy(false)
    }
  }

  const triggerError = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setTimeout(() => setPin(''), 400)
    setTimeout(() => setError(''), 1800)
  }

  const handleKey = (k) => {
    if (k === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }
    if (k === '' || pin.length >= PIN_LENGTH || busy) return
    setPin((p) => (p + k).slice(0, PIN_LENGTH))
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-between px-6 py-10 pt-safe pb-safe">
      {/* لوگو + عنوان */}
      <div className="flex flex-col items-center pt-6">
        <div
          className="size-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          <span className="text-4xl text-white">💰</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-text">دفتر خرج</h1>
        <p className="mt-1.5 text-xs text-text-muted">
          مدیریت معاش و خرج‌های روزانه
        </p>
      </div>

      {/* بخش مرکزی */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
        {mode === 'biometric' ? (
          <BiometricView
            onTry={triggerBiometric}
            onSwitchToPin={pinEnabled ? () => setMode('pin') : null}
            busy={busy}
            error={error}
          />
        ) : (
          <PinView
            pin={pin}
            error={error}
            shake={shake}
            onKey={handleKey}
            busy={busy}
            onSwitchToBiometric={
              biometricEnabled ? () => setMode('biometric') : null
            }
          />
        )}
      </div>

      {/* پاصفحه */}
      <div className="text-[11px] text-text-muted">
        ساخته شده با ❤ در افغانستان
      </div>
    </div>
  )
}

/* ──────────────────────────────
   نمای PIN
────────────────────────────── */
function PinView({ pin, error, shake, onKey, busy, onSwitchToBiometric }) {
  return (
    <div className="w-full flex flex-col items-center">
      {/* عنوان با آیکون */}
      <div className="flex items-center gap-2 text-text-secondary mb-6">
        <KeyRound size={15} />
        <span className="text-sm font-medium">رمز ۴ رقمی را وارد کن</span>
      </div>

      {/* نقطه‌ها */}
      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-4 mb-3"
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'size-3.5 rounded-full transition-all duration-200'
            )}
            style={
              error
                ? {
                    background: 'var(--expense)',
                    boxShadow: '0 0 12px rgba(240, 68, 120, 0.6)',
                  }
                : i < pin.length
                  ? {
                      background: 'var(--primary)',
                      boxShadow: '0 0 12px rgba(62, 120, 212, 0.5)',
                      transform: 'scale(1.1)',
                    }
                  : {
                      background: 'transparent',
                      border: '2px solid var(--border-strong)',
                    }
            }
          />
        ))}
      </motion.div>

      {/* پیام خطا */}
      <div
        className={cn(
          'text-xs mb-6 h-4 transition-colors',
          error ? 'text-expense' : 'text-transparent'
        )}
      >
        {error || '.'}
      </div>

      {/* کیبورد نئومورفیک */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
        {KEYS.map((k, idx) => {
          if (k === '') return <div key={idx} />
          if (k === 'del') {
            return (
              <button
                key={idx}
                onClick={() => onKey('del')}
                className="h-16 rounded-2xl flex items-center justify-center transition press-sm"
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted)',
                }}
                aria-label="حذف"
              >
                <Delete size={22} />
              </button>
            )
          }
          return (
            <button
              key={idx}
              onClick={() => onKey(k)}
              disabled={busy}
              className={cn(
                'h-16 rounded-2xl transition press-sm',
                'text-2xl font-semibold',
                'disabled:opacity-40'
              )}
              style={{
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-raised-sm)',
                color: 'var(--text)',
              }}
            >
              {FA_DIGITS[Number(k)]}
            </button>
          )
        })}
      </div>

      {/* دکمه‌ی سوییچ به اثر انگشت */}
      {onSwitchToBiometric && (
        <button
          onClick={onSwitchToBiometric}
          className="mt-8 text-sm text-primary font-medium flex items-center gap-1.5 transition press-sm"
        >
          <Fingerprint size={16} />
          <span>ورود با اثر انگشت</span>
        </button>
      )}
    </div>
  )
}

/* ──────────────────────────────
   نمای اثر انگشت
────────────────────────────── */
function BiometricView({ onTry, onSwitchToPin, busy, error }) {
  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={onTry}
        disabled={busy}
        className={cn(
          'relative size-32 rounded-full flex items-center justify-center',
          'transition press',
          'disabled:opacity-60'
        )}
        style={{
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-raised)',
          color: 'var(--primary)',
        }}
      >
        {/* حلقه‌های متحرک */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '2px solid var(--primary)', opacity: 0.25 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '2px solid var(--primary)', opacity: 0.25 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.8,
          }}
        />
        <Fingerprint size={56} strokeWidth={1.8} />
      </button>

      <p className="mt-6 text-sm font-medium text-text">
        {busy ? 'در حال بررسی…' : 'برای ورود، اثر انگشت بزن'}
      </p>

      <div
        className={cn(
          'text-xs mt-2 h-4 transition-colors',
          error ? 'text-expense' : 'text-transparent'
        )}
      >
        {error || '.'}
      </div>

      {onSwitchToPin && (
        <button
          onClick={onSwitchToPin}
          className="mt-4 text-sm text-primary font-medium flex items-center gap-1.5 transition press-sm"
        >
          <KeyRound size={16} />
          <span>ورود با رمز عبور</span>
        </button>
      )}
    </div>
  )
}
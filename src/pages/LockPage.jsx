import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Delete, Fingerprint, KeyRound } from 'lucide-react'
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

  /* تلاش برای اثر انگشت هنگام mount */
  useEffect(() => {
    if (biometricEnabled && mode === 'biometric') {
      const t = setTimeout(() => {
        triggerBiometric()
      }, 400)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* وقتی ۴ رقم پر شد */
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
        <img
          src="/icons/logo.png"
          alt="دفتر خرج"
          className="size-20 rounded-3xl bg-brand-soft object-cover shadow-brand"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <h1 className="mt-4 text-2xl font-bold text-fg">دفتر خرج</h1>
        <p className="mt-1.5 text-xs text-fg-muted">
          مدیریت معاش و خرج‌های روزانه
        </p>
      </div>

      {/* بخش مرکزی: PIN یا اثر انگشت */}
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
      <div className="text-[11px] text-fg-muted">
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
      <div className="flex items-center gap-2 text-fg-secondary mb-2">
        <KeyRound size={16} />
        <span className="text-sm font-medium">رمز ۴ رقمی را وارد کن</span>
      </div>

      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-4 my-6"
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
          'text-xs mb-4 h-4 transition-colors',
          error ? 'text-danger' : 'text-transparent'
        )}
      >
        {error || '.'}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-[260px]">
        {KEYS.map((k, idx) => {
          if (k === '') return <div key={idx} />
          if (k === 'del') {
            return (
              <button
                key={idx}
                onClick={() => onKey('del')}
                className="h-14 rounded-2xl flex items-center justify-center text-fg-muted hover:bg-brand-soft transition active:scale-95"
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
                'h-14 rounded-2xl bg-card border border-border',
                'text-2xl font-semibold text-fg',
                'transition active:scale-95 disabled:opacity-40'
              )}
            >
              {FA_DIGITS[Number(k)]}
            </button>
          )
        })}
      </div>

      {onSwitchToBiometric && (
        <button
          onClick={onSwitchToBiometric}
          className="mt-6 text-sm text-brand font-medium flex items-center gap-1.5"
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
          'bg-brand-soft text-brand',
          'transition active:scale-95 disabled:opacity-60'
        )}
      >
        {/* حلقه‌های متحرک */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-brand/30"
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.8,
          }}
        />
        <Fingerprint size={56} strokeWidth={1.8} />
      </button>

      <p className="mt-6 text-sm font-medium text-fg">
        {busy ? 'در حال بررسی…' : 'برای ورود، اثر انگشت بزن'}
      </p>

      <div
        className={cn(
          'text-xs mt-2 h-4 transition-colors',
          error ? 'text-danger' : 'text-transparent'
        )}
      >
        {error || '.'}
      </div>

      {onSwitchToPin && (
        <button
          onClick={onSwitchToPin}
          className="mt-4 text-sm text-brand font-medium flex items-center gap-1.5"
        >
          <KeyRound size={16} />
          <span>ورود با رمز عبور</span>
        </button>
      )}
    </div>
  )
}
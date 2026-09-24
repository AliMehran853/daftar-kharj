import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Check,
  User,
  Banknote,
  PiggyBank,
  Sparkles,
  Shield,
  WifiOff,
  BarChart3,
  ArrowRight,
} from 'lucide-react'
import {
  cn,
  toEnglishDigits,
  toPersianDigits,
  safeNumber,
  formatMoney,
} from '@/lib/utils'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'
import { addTransaction } from '@/db/queries'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [salary, setSalary] = useState('')
  const [hasSavings, setHasSavings] = useState(null)
  const [initialSavings, setInitialSavings] = useState('')
  const [saving, setSaving] = useState(false)

  const updateMany = useSettingsStore((s) => s.updateMany)
  const showToast = useUIStore((s) => s.showToast)
  const triggerRefresh = useUIStore((s) => s.triggerRefresh)

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const canProceed = () => {
    if (step === 1) return firstName.trim().length > 0
    return true
  }

  const finish = async () => {
    if (saving) return
    setSaving(true)
    try {
      await updateMany({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: [firstName, lastName].filter(Boolean).join(' ').trim(),
        monthlySalary: safeNumber(salary),
        onboardingCompleted: true,
      })

      const savingsAmount = safeNumber(initialSavings)
      if (hasSavings && savingsAmount > 0) {
        await addTransaction({
          type: 'income',
          subtype: 'extra',
          amount: savingsAmount,
          categoryId: 'other-income',
          toAccountId: 'savings',
          note: 'پس‌انداز اولیه',
          date: new Date(),
        })
        triggerRefresh()
      }

      showToast('خوش آمدی! 🎉', 'success')
    } catch (e) {
      console.error(e)
      showToast('خطا در ذخیره‌سازی', 'error')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col pt-safe pb-safe">
      {/* نشانگر پیشرفت */}
      <div className="flex justify-center gap-2 pt-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === step ? 'w-8 bg-primary' : 'w-2 bg-border',
              i < step && 'bg-primary'
            )}
          />
        ))}
      </div>

      {/* محتوای مرحله */}
      <div className="flex-1 flex flex-col px-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {step === 0 && <WelcomeStep />}
            {step === 1 && (
              <NameStep
                firstName={firstName}
                lastName={lastName}
                onFirstName={setFirstName}
                onLastName={setLastName}
              />
            )}
            {step === 2 && (
              <SalaryStep value={salary} onChange={setSalary} />
            )}
            {step === 3 && (
              <SavingsStep
                hasSavings={hasSavings}
                setHasSavings={setHasSavings}
                value={initialSavings}
                onChange={setInitialSavings}
              />
            )}
            {step === 4 && (
              <DoneStep
                firstName={firstName}
                salary={salary}
                savings={hasSavings ? initialSavings : ''}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* دکمه‌ها */}
      <div className="p-6 space-y-2">
        {step < TOTAL_STEPS - 1 ? (
          <>
            <Button
              full
              size="lg"
              disabled={!canProceed()}
              onClick={next}
            >
              {step === 0 ? 'بزن بریم' : 'ادامه'}
            </Button>

            {step === 2 && (
              <Button
                full
                variant="ghost"
                onClick={() => {
                  setSalary('')
                  next()
                }}
              >
                فعلاً رد کن
              </Button>
            )}

            {step === 3 && hasSavings === null && (
              <Button
                full
                variant="ghost"
                onClick={() => {
                  setHasSavings(false)
                  next()
                }}
              >
                فعلاً رد کن
              </Button>
            )}

            {step > 0 && (
              <Button
                full
                variant="ghost"
                icon={ArrowRight}
                onClick={back}
              >
                بازگشت
              </Button>
            )}
          </>
        ) : (
          <Button
            full
            size="lg"
            onClick={finish}
            loading={saving}
            icon={Check}
          >
            بریم شروع کنیم
          </Button>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────
   مرحله ۱ — خوش‌آمد
────────────────────────────── */
function WelcomeStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="size-24 rounded-[28px] flex items-center justify-center shadow-brand mb-6"
        style={{
          background: 'var(--gradient-brand)',
        }}
      >
        <span className="text-4xl">💰</span>
      </motion.div>

      <h1 className="text-2xl font-bold text-text">
        به دفتر خرج خوش آمدی
      </h1>
      <p className="text-sm text-text-muted mt-2 max-w-xs leading-relaxed">
        دستیار مالی شخصی تو، کاملاً آفلاین روی همین گوشی.
      </p>

      <div className="w-full max-w-sm mt-8 space-y-2">
        <FeatureRow
          icon={BarChart3}
          color="var(--primary)"
          text="نمودارها و گزارش‌های واضح"
        />
        <FeatureRow
          icon={Shield}
          color="var(--saving)"
          text="قفل و امنیت روی همین گوشی"
        />
        <FeatureRow
          icon={WifiOff}
          color="var(--accent)"
          text="کاملاً آفلاین، بدون سرور"
        />
      </div>
    </div>
  )
}

function FeatureRow({ icon: Icon, color, text }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-btn p-3">
      <div
        className="size-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={18} />
      </div>
      <span className="text-sm text-text-secondary text-right flex-1">
        {text}
      </span>
    </div>
  )
}

/* ──────────────────────────────
   مرحله ۲ — نام
────────────────────────────── */
function NameStep({ firstName, lastName, onFirstName, onLastName }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <User size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">اسمت چیه؟</h2>
      <p className="text-sm text-text-muted mt-1.5 text-center max-w-xs">
        با این اسم تو اپ نمایش داده می‌شی.
      </p>

      <div className="w-full max-w-sm mt-8 space-y-3">
        <Input
          label="اسم"
          placeholder="شریف"
          value={firstName}
          onChange={(e) => onFirstName(e.target.value)}
          maxLength={30}
          autoFocus
        />
        <Input
          label="تخلص (اختیاری)"
          placeholder="نوید"
          value={lastName}
          onChange={(e) => onLastName(e.target.value)}
          maxLength={30}
        />
      </div>
    </div>
  )
}

/* ──────────────────────────────
   مرحله ۳ — معاش
────────────────────────────── */
function SalaryStep({ value, onChange }) {
  const display = value ? toPersianDigits(value) : ''
  const handleChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    onChange(cleaned.slice(0, 10))
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <Banknote size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">معاش ماهانه‌ات چقدره؟</h2>
      <p className="text-sm text-text-muted mt-1.5 text-center max-w-xs">
        این عدد رو بعداً هم می‌تونی از تنظیمات تغییر بدی.
      </p>

      <div className="w-full max-w-sm mt-8">
        <div className="rounded-2xl bg-surface border border-border p-6">
          <input
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            placeholder="۰"
            autoFocus
            className={cn(
              'w-full bg-transparent text-center',
              'text-[40px] leading-none font-bold text-primary',
              'placeholder:text-text-muted/30 focus:outline-none'
            )}
          />
          <div className="text-center text-xs text-text-muted mt-3">
            افغانی
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────
   مرحله ۴ — پس‌انداز اولیه
────────────────────────────── */
function SavingsStep({ hasSavings, setHasSavings, value, onChange }) {
  const display = value ? toPersianDigits(value) : ''
  const handleChange = (e) => {
    const cleaned = toEnglishDigits(e.target.value).replace(/\D/g, '')
    onChange(cleaned.slice(0, 10))
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="size-16 rounded-2xl bg-saving/10 text-saving flex items-center justify-center mb-5">
        <PiggyBank size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">پس‌اندازی داری؟</h2>
      <p className="text-sm text-text-muted mt-1.5 text-center max-w-xs">
        اگه الان پولی کنار گذاشتی، این‌جا واردش کن. اختیاریه.
      </p>

      <div className="w-full max-w-sm mt-8 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setHasSavings(true)}
            className={cn(
              'h-14 rounded-btn font-medium transition press-sm',
              hasSavings === true
                ? 'bg-saving text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary'
            )}
          >
            بله، دارم
          </button>
          <button
            type="button"
            onClick={() => {
              setHasSavings(false)
              onChange('')
            }}
            className={cn(
              'h-14 rounded-btn font-medium transition press-sm',
              hasSavings === false
                ? 'bg-saving text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary'
            )}
          >
            نه، ندارم
          </button>
        </div>

        <AnimatePresence>
          {hasSavings === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-surface border border-border p-5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={display}
                  onChange={handleChange}
                  placeholder="۰"
                  autoFocus
                  className={cn(
                    'w-full bg-transparent text-center',
                    'text-[32px] leading-none font-bold text-saving',
                    'placeholder:text-text-muted/30 focus:outline-none'
                  )}
                />
                <div className="text-center text-xs text-text-muted mt-2">
                  افغانی
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ──────────────────────────────
   مرحله ۵ — پایان
────────────────────────────── */
function DoneStep({ firstName, salary, savings }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
        className="relative size-24 rounded-full bg-primary/15 flex items-center justify-center mb-6"
      >
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="relative size-16 rounded-full bg-primary text-white flex items-center justify-center shadow-brand">
          <Check size={32} strokeWidth={3} />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-text">همه چیز آماده است!</h2>
      <p className="text-sm text-text-muted mt-2 max-w-xs leading-relaxed">
        {firstName ? `${firstName} جان، ` : ''}حالا می‌تونی معاش و خرج‌هات رو
        ثبت کنی و همه‌چیز رو زیر نظر داشته باشی.
      </p>

      <div className="w-full max-w-sm mt-8 space-y-2">
        {safeNumber(salary) > 0 && (
          <SummaryRow
            icon={Banknote}
            color="var(--income)"
            label="معاش ماهانه"
            value={`${formatMoney(salary)} افغانی`}
          />
        )}
        {safeNumber(savings) > 0 && (
          <SummaryRow
            icon={PiggyBank}
            color="var(--saving)"
            label="پس‌انداز اولیه"
            value={`${formatMoney(savings)} افغانی`}
          />
        )}
        <SummaryRow
          icon={Sparkles}
          color="var(--accent)"
          label="وضعیت"
          value="آماده‌ی شروع"
        />
      </div>
    </div>
  )
}

function SummaryRow({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-btn p-3">
      <div
        className="size-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 text-right">
        <div className="text-xs text-text-muted">{label}</div>
        <div className="text-sm font-medium text-text">{value}</div>
      </div>
    </div>
  )
}
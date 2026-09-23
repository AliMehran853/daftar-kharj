import { useState } from 'react'
import {
  User,
  Banknote,
  Lock,
  Fingerprint,
  Bell,
  Clock,
  HardDriveDownload,
  RotateCcw,
  Info,
  ChevronLeft,
  KeyRound,
  Trash2,
  LogOut,
} from 'lucide-react'
import { formatMoney, formatTime12, cn } from '@/lib/utils'
import { APP_NAME, APP_VERSION } from '@/data/constants'
import { setSetting } from '@/db/queries'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { factoryReset } from '@/lib/backup'
import {
  isBiometricAvailable,
  registerBiometric,
  removeBiometric,
  clearPin,
} from '@/lib/auth'

import PageHeader from '@/components/layout/PageHeader'
import Card from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'
import Avatar from '@/components/ui/Avatar'
import ConfirmModal from '@/components/ui/ConfirmModal'

import EditProfileModal from '@/components/app/EditProfileModal'
import SalaryModal from '@/components/app/SalaryModal'
import AboutModal from '@/components/app/AboutModal'
import TimePickerModal from '@/components/app/TimePickerModal'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const auth = useAuthStore()
  const openSheet = useUIStore((s) => s.openSheet)
  const showToast = useUIStore((s) => s.showToast)

  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [salaryOpen, setSalaryOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [biometricBusy, setBiometricBusy] = useState(false)

  const displayName = settings.getDisplayName()
  const initial = settings.getInitial()

  const lockIsFullyEnabled =
    auth.lockEnabled && (auth.pinEnabled || auth.biometricEnabled)

  /* ── روشن/خاموش سوییچ قفل ── */
  const handleToggleLock = async (enabled) => {
    if (enabled) {
      if (!auth.pinEnabled && !auth.biometricEnabled) {
        openSheet('pin-setup', {
          mode: 'set',
          onDone: async () => {
            await setSetting('lockEnabled', true)
            await auth.refresh()
            showToast('قفل فعال شد', 'success')
          },
        })
      } else {
        await setSetting('lockEnabled', true)
        await auth.refresh()
        showToast('قفل فعال شد', 'success')
      }
    } else {
      await setSetting('lockEnabled', false)
      await auth.refresh()
      showToast('قفل غیرفعال شد', 'info')
    }
  }

  /* ── تنظیم / تغییر PIN ── */
  const handleSetupPin = () => {
    if (auth.pinEnabled) {
      openSheet('pin-setup', {
        mode: 'verify',
        onVerified: () => {
          setTimeout(() => {
            openSheet('pin-setup', {
              mode: 'set',
              onDone: async () => {
                await auth.refresh()
                showToast('رمز تغییر کرد', 'success')
              },
            })
          }, 200)
        },
      })
    } else {
      openSheet('pin-setup', {
        mode: 'set',
        onDone: async () => {
          if (!auth.lockEnabled) {
            await setSetting('lockEnabled', true)
          }
          await auth.refresh()
        },
      })
    }
  }

  /* ── حذف PIN ── */
  const handleRemovePin = () => {
    openSheet('pin-setup', {
      mode: 'verify',
      onVerified: async () => {
        await clearPin()
        await auth.refresh()
        showToast('رمز حذف شد', 'info')
      },
    })
  }

  /* ── ثبت / حذف اثر انگشت ── */
  const handleToggleBiometric = async () => {
    setBiometricBusy(true)
    try {
      if (auth.biometricEnabled) {
        await removeBiometric()
        await auth.refresh()
        showToast('اثر انگشت حذف شد', 'info')
      } else {
        const available = await isBiometricAvailable()
        if (!available) {
          showToast('دستگاه یا مرورگر پشتیبانی نمی‌کند', 'error')
          return
        }
        await registerBiometric(displayName)
        if (!auth.lockEnabled) {
          await setSetting('lockEnabled', true)
        }
        await auth.refresh()
        showToast('اثر انگشت فعال شد', 'success')
      }
    } catch (e) {
      console.error(e)
      if (e.name !== 'NotAllowedError' && e.name !== 'AbortError') {
        showToast('خطا در تنظیم اثر انگشت', 'error')
      }
    } finally {
      setBiometricBusy(false)
    }
  }

  /* ── خروج از حساب ── */
  const handleLogout = () => {
    auth.lock()
    setLogoutOpen(false)
    showToast('از حساب خارج شدی', 'info')
  }

  /* ── یادآوری ── */
  const handleToggleReminder = async (v) => {
    await settings.update('reminderEnabled', v)
    showToast(
      v ? 'یادآوری فعال شد' : 'یادآوری غیرفعال شد',
      v ? 'success' : 'info'
    )
  }

  /* ── ریست کامل ── */
  const handleReset = async () => {
    setResetting(true)
    try {
      await factoryReset()
      showToast('همه‌چیز پاک شد', 'success')
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      showToast('خطا در پاک‌سازی', 'error')
      setResetting(false)
    }
  }

  const timeDisplay = settings.reminderTime
    ? formatTime12(settings.reminderTime)
    : '—'

  return (
    <div className="px-4 lg:px-6 py-2 pb-6 space-y-5">
      <PageHeader title="تنظیمات" />

      {/* کارت پروفایل */}
      <button
        onClick={() => setEditProfileOpen(true)}
        className="w-full bg-card border border-border rounded-card p-4 flex items-center gap-3 text-right transition active:scale-[0.99] hover:bg-brand-soft/20"
      >
        <Avatar name={initial} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-fg truncate">{displayName}</div>
          <div className="text-[11px] text-fg-muted mt-0.5">
            حساب محلی روی همین دستگاه
          </div>
        </div>
        <ChevronLeft size={18} className="text-fg-muted shrink-0" />
      </button>

      {/* پروفایل */}
      <Section title="پروفایل">
        <Row
          icon={User}
          color="#D81B60"
          label="ویرایش پروفایل"
          onClick={() => setEditProfileOpen(true)}
        />
        <Row
          icon={Banknote}
          color="#6B4C93"
          label="معاش ماهانه"
          value={`${formatMoney(settings.monthlySalary)} ${settings.currencyLabel}`}
          onClick={() => setSalaryOpen(true)}
        />
      </Section>

      {/* امنیت */}
      <Section title="امنیت">
        <Row
          icon={Lock}
          color="#8E24AA"
          label="قفل برنامه"
          hint="درخواست رمز هنگام ورود"
          right={
            <Switch
              checked={lockIsFullyEnabled}
              onChange={handleToggleLock}
            />
          }
        />

        <Row
          icon={KeyRound}
          color="#D81B60"
          label={auth.pinEnabled ? 'تغییر رمز' : 'تنظیم رمز ۴ رقمی'}
          value={auth.pinEnabled ? 'فعال' : 'غیرفعال'}
          onClick={handleSetupPin}
          action={
            auth.pinEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemovePin()
                }}
                className="size-8 rounded-full hover:bg-danger-soft flex items-center justify-center text-danger transition active:scale-95"
                aria-label="حذف رمز"
              >
                <Trash2 size={15} />
              </button>
            )
          }
        />

        <Row
          icon={Fingerprint}
          color="#6B4C93"
          label="ورود با اثر انگشت"
          value={auth.biometricEnabled ? 'فعال' : 'غیرفعال'}
          hint={biometricBusy ? 'در حال پردازش…' : undefined}
          right={
            <Switch
              checked={auth.biometricEnabled}
              onChange={handleToggleBiometric}
              disabled={biometricBusy}
            />
          }
        />
      </Section>

      {/* یادآوری */}
      <Section title="یادآوری">
        <Row
          icon={Bell}
          color="#D81B60"
          label="یادآوری ثبت روزانه"
          hint="اگر بیش از ۲۴ ساعت ثبت نکردی، یادآوری می‌شود"
          right={
            <Switch
              checked={settings.reminderEnabled}
              onChange={handleToggleReminder}
            />
          }
        />
        {settings.reminderEnabled && (
          <Row
            icon={Clock}
            color="#8E24AA"
            label="زمان یادآوری"
            value={timeDisplay}
            onClick={() => setTimeOpen(true)}
          />
        )}
      </Section>

      {/* داده‌ها */}
      <Section title="داده‌ها">
        <Row
          icon={HardDriveDownload}
          color="#16A34A"
          label="پشتیبان‌گیری و بازیابی"
          hint="خروجی JSON یا بازگردانی از فایل"
          onClick={() => openSheet('backup')}
        />
        <Row
          icon={RotateCcw}
          color="#B91C4A"
          label="پاک‌سازی و شروع مجدد"
          hint="همه‌ی داده‌ها پاک می‌شوند"
          danger
          onClick={() => setResetOpen(true)}
        />
        <Row
          icon={Info}
          color="#9C7A88"
          label="درباره‌ی دفتر خرج"
          value={`نسخه ${APP_VERSION}`}
          onClick={() => setAboutOpen(true)}
        />
      </Section>

      {/* خروج */}
      {lockIsFullyEnabled && (
        <Section title="حساب">
          <Row
            icon={LogOut}
            color="#B91C4A"
            label="خروج از حساب"
            hint="قفل مجدد و نیاز به رمز برای ورود"
            danger
            onClick={() => setLogoutOpen(true)}
          />
        </Section>
      )}

      <div className="pt-3 text-center text-[11px] text-fg-muted leading-relaxed">
        {APP_NAME} • نسخه {APP_VERSION}
        <br />
        ساخته شده با ❤ در افغانستان
      </div>

      {/* مودال‌ها */}
      <EditProfileModal
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
      <SalaryModal open={salaryOpen} onClose={() => setSalaryOpen(false)} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <TimePickerModal
        open={timeOpen}
        onClose={() => setTimeOpen(false)}
        value={settings.reminderTime}
        onSelect={(v) => {
          settings.update('reminderTime', v)
          showToast('زمان یادآوری ذخیره شد', 'success')
        }}
      />
      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="پاک‌سازی کامل؟"
        description="همه‌ی تراکنش‌ها، دسته‌ها و تنظیمات پاک می‌شوند و اپ به حالت اولیه برمی‌گردد. این عمل قابل بازگشت نیست."
        confirmLabel="بله، پاک کن"
        variant="danger"
        loading={resetting}
      />
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="خروج از حساب؟"
        description="برای ورود مجدد باید رمز یا اثر انگشت خود را وارد کنی."
        confirmLabel="بله، خارج شو"
        cancelLabel="انصراف"
        variant="danger"
      />
    </div>
  )
}

/* ──────────────────────────────
   کامپوننت‌های کمکی
────────────────────────────── */
function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-fg-muted mb-2 px-1">
        {title}
      </h2>
      <Card padded={false} className="overflow-hidden divide-y divide-border">
        {children}
      </Card>
    </section>
  )
}

function Row({
  icon: Icon,
  color = '#D81B60',
  label,
  value,
  hint,
  right,
  action,
  danger = false,
  onClick,
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3.5 text-right',
        onClick && 'transition hover:bg-brand-soft/20 active:bg-brand-soft/40'
      )}
    >
      <div
        className="size-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'font-medium text-[14.5px] truncate',
            danger ? 'text-danger' : 'text-fg'
          )}
        >
          {label}
        </div>
        {hint && (
          <div className="text-[11px] text-fg-muted mt-0.5 truncate">
            {hint}
          </div>
        )}
      </div>
      {value && !right && (
        <div className="text-[13px] text-fg-muted shrink-0">{value}</div>
      )}
      {right && <div className="shrink-0">{right}</div>}
      {action && <div className="shrink-0">{action}</div>}
      {onClick && !right && !action && (
        <ChevronLeft size={16} className="text-fg-muted shrink-0" />
      )}
    </Tag>
  )
}
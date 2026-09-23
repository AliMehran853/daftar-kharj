import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { seedDatabase } from '@/db/seed'
import { ROUTES } from '@/data/constants'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useAuthStore } from '@/store/useAuthStore'

import AppLayout from '@/components/layout/AppLayout'
import SheetHost from '@/components/app/SheetHost'
import Toast from '@/components/app/Toast'
import NotificationHost from '@/components/app/NotificationHost'
import LockPage from '@/pages/LockPage'
import OnboardingPage from '@/pages/OnboardingPage'

import HomePage from '@/pages/HomePage'
import ExpensesPage from '@/pages/ExpensesPage'
import SavingsPage from '@/pages/SavingsPage'
import ReportsPage from '@/pages/ReportsPage'
import CategoryDetailPage from '@/pages/CategoryDetailPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  const [ready, setReady] = useState(false)

  const theme = useUIStore((s) => s.theme)
  const applyTheme = useUIStore((s) => s.applyTheme)

  const authLoaded = useAuthStore((s) => s._loaded)
  const lockEnabled = useAuthStore((s) => s.lockEnabled)
  const pinEnabled = useAuthStore((s) => s.pinEnabled)
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled)
  const unlockedThisSession = useAuthStore((s) => s.unlockedThisSession)

  // subscription به onboardingCompleted — تا وقتی تغییر کرد، App دوباره رندر بشه
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted)

  const shouldLock =
    authLoaded &&
    lockEnabled &&
    (pinEnabled || biometricEnabled) &&
    !unlockedThisSession

  // کاربر تازه‌وارد → onboarding
  const showOnboarding = ready && !onboardingCompleted

  useEffect(() => {
    ;(async () => {
      await seedDatabase()
      await Promise.all([
        useSettingsStore.getState().loadSettings(),
        useAuthStore.getState().loadAuth(),
      ])
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    applyTheme(theme)
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const handler = () => {
      if (useUIStore.getState().theme === 'system') {
        useUIStore.getState().applyTheme('system')
      }
    }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [theme, applyTheme])

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-fg-muted">
        در حال آماده‌سازی…
      </div>
    )
  }

  // ۱. اول onboarding (کاربر تازه)
  if (showOnboarding) {
    return (
      <BrowserRouter>
        <OnboardingPage />
        <Toast />
      </BrowserRouter>
    )
  }

  // ۲. بعد قفل
  if (shouldLock) {
    return (
      <BrowserRouter>
        <LockPage />
        <Toast />
      </BrowserRouter>
    )
  }

  // ۳. اپ اصلی
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.EXPENSES} element={<ExpensesPage />} />
          <Route path={ROUTES.SAVINGS} element={<SavingsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route
            path={`${ROUTES.CATEGORY}/:categoryId`}
            element={<CategoryDetailPage />}
          />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Route>
      </Routes>

      <SheetHost />
      <Toast />
      <NotificationHost />
    </BrowserRouter>
  )
}
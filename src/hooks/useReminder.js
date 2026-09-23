import { useEffect, useState, useCallback } from 'react'
import { differenceInHours } from 'date-fns-jalali'
import { getSetting, setSetting, getRecentTransactions } from '@/db/queries'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useUIStore } from '@/store/useUIStore'

const CHECK_INTERVAL = 60 * 1000 // هر ۱ دقیقه

export function useReminder() {
  const reminderEnabled = useSettingsStore((s) => s.reminderEnabled)
  const reminderTime = useSettingsStore((s) => s.reminderTime)
  const openModal = useUIStore((s) => s.openModal)

  const check = useCallback(async () => {
    if (!reminderEnabled) return

    // آخرین باری که این مودال نشون داده شده
    const lastShown = await getSetting('lastReminderShownAt', null)
    const now = Date.now()

    // اگه امروز نشون داده شده، دوباره نشون نده
    if (lastShown) {
      const lastDate = new Date(lastShown)
      const today = new Date()
      const isSameDay =
        lastDate.getFullYear() === today.getFullYear() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getDate() === today.getDate()
      if (isSameDay) return
    }

    // آیا زمان یادآوری رسیده؟
    if (reminderTime) {
      const [h, m] = reminderTime.split(':').map((x) => parseInt(x, 10))
      const target = new Date()
      target.setHours(h || 21, m || 0, 0, 0)
      if (now < target.getTime()) return
    }

    // آخرین تراکنش کاربر
    const recent = await getRecentTransactions(1)
    if (recent.length > 0) {
      const last = recent[0]
      const hoursSince = differenceInHours(new Date(), new Date(last.createdAt))
      if (hoursSince < 24) return
    }
    // اگه هیچ تراکنشی نیست، مودال رو نشون نده (کاربر تازه‌وارد)
    if (recent.length === 0) return

    // همه‌ی شرط‌ها OK → نشون بده
    await setSetting('lastReminderShownAt', now)
    openModal('daily-reminder')
  }, [reminderEnabled, reminderTime, openModal])

  useEffect(() => {
    if (!reminderEnabled) return

    // بررسی اولیه با تأخیر (تا اپ لود بشه)
    const initial = setTimeout(check, 3000)

    // بررسی دوره‌ای
    const interval = setInterval(check, CHECK_INTERVAL)

    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [reminderEnabled, check])

  const triggerManually = useCallback(() => {
    openModal('daily-reminder')
  }, [openModal])

  return { triggerManually }
}
import GreetingToast from './GreetingToast'
import DailyReminderModal from './DailyReminderModal'
import PeriodLockToast from './PeriodLockToast'
import InstallBanner from './InstallBanner'
import { useReminder } from '@/hooks/useReminder'

export default function NotificationHost() {
  // این هوک internally تایمر و چک‌ها رو مدیریت می‌کنه
  useReminder()

  return (
    <>
      <GreetingToast />
      <DailyReminderModal />
      <PeriodLockToast />
      <InstallBanner />
    </>
  )
}
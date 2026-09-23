import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { getSetting, setSetting } from '@/db/queries'
import { useSettingsStore } from '@/store/useSettingsStore'
import { GREETING_RANGES, getCurrentTimeRange } from '@/data/greetings'

const LAST_INDEX_KEY = 'lastGreetingIndex'
const LAST_SHOWN_KEY = 'lastGreetingShownAt'

function pickMessage(range, lastIndex) {
  const messages = GREETING_RANGES[range].messages
  let next = 0
  // چرخش بدون تکرار
  for (let i = 0; i < 8; i++) {
    next = Math.floor(Math.random() * messages.length)
    if (next !== lastIndex) break
  }
  return { message: messages[next], index: next }
}

export default function GreetingToast() {
  const firstName = useSettingsStore((s) => s.firstName)
  const userName = useSettingsStore((s) => s.userName)
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted)

  const [visible, setVisible] = useState(false)
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      // هر روز یک بار
      const lastShown = await getSetting(LAST_SHOWN_KEY, null)
      const now = Date.now()
      if (lastShown) {
        const last = new Date(lastShown)
        const today = new Date()
        const sameDay =
          last.getFullYear() === today.getFullYear() &&
          last.getMonth() === today.getMonth() &&
          last.getDate() === today.getDate()
        if (sameDay) return
      }

      // پیام اول (خوش‌آمد) اگه onboarding تازه تموم شده
      const isFirstEver =
        onboardingCompleted &&
        !(await getSetting('welcomeGreetingSeenAt', null))

      const range = getCurrentTimeRange()
      const lastIndex = await getSetting(LAST_INDEX_KEY, -1)
      const { message, index } = pickMessage(range, lastIndex)

      const displayName = firstName || userName || 'دوست من'
      const r = GREETING_RANGES[range]

      if (cancelled) return

      setData({
        emoji: r.emoji,
        title: isFirstEver ? `خوش آمدی ${displayName}` : `${r.title} ${displayName}`,
        message: isFirstEver
          ? 'خوشحالم که اینجایی. با هم معاش و خرج‌هات رو مدیریت می‌کنیم.'
          : message,
        isFirstEver,
      })

      await setSetting(LAST_SHOWN_KEY, now)
      await setSetting(LAST_INDEX_KEY, index)
      if (isFirstEver) {
        await setSetting('welcomeGreetingSeenAt', now)
      }

      setTimeout(() => !cancelled && setVisible(true), 800)
    })()

    return () => {
      cancelled = true
    }
  }, [firstName, userName, onboardingCompleted])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setVisible(false), 7000)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && data && (
        <motion.div
          initial={{ opacity: 0, y: -80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed top-3 inset-x-3 z-[70] pointer-events-none pt-safe"
        >
          <div
            className="pointer-events-auto max-w-md mx-auto rounded-2xl p-3.5 pr-4 shadow-float text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00B894 0%, #009B7A 100%)',
            }}
          >
            <div className="absolute -top-12 -left-8 size-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative flex items-start gap-3">
              <div className="text-2xl shrink-0 mt-0.5">{data.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14.5px] truncate">
                  {data.title}
                </div>
                <div className="text-[12.5px] text-white/90 mt-0.5 leading-relaxed">
                  {data.message}
                </div>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="size-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 transition active:scale-90"
                aria-label="بستن"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
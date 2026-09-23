import { create } from 'zustand'
import { getSetting, setSetting, setSettings } from '../db/queries'

const DEFAULTS = {
  userName: '',
  firstName: '',
  lastName: '',
  monthlySalary: 0,
  currencyLabel: 'افغانی',
  currencyCode: 'AFN',

  reminderEnabled: true,
  reminderTime: '21:00',
  lastReminderShownAt: null,

  onboardingCompleted: false,
  welcomeGreetingSeenAt: null,
}

export const useSettingsStore = create((set, get) => ({
  ...DEFAULTS,
  _loaded: false,
  _loading: false,

  /** خواندن همه‌ی تنظیمات از Dexie */
  loadSettings: async () => {
    if (get()._loading) return
    set({ _loading: true })
    try {
      const entries = await Promise.all(
        Object.keys(DEFAULTS).map(async (k) => [k, await getSetting(k, DEFAULTS[k])])
      )
      const obj = Object.fromEntries(entries)
      set({ ...obj, _loaded: true, _loading: false })
    } catch (e) {
      console.error('[settings] load failed:', e)
      set({ _loading: false })
    }
  },

  /** به‌روزرسانی یک کلید خاص (هم state، هم DB) */
  update: async (key, value) => {
    set({ [key]: value })
    await setSetting(key, value)
  },

  /** به‌روزرسانی چند کلید با هم */
  updateMany: async (patch) => {
    set(patch)
    await setSettings(patch)
  },

  /* ── کمکی‌ها ── */
  getDisplayName: () => {
    const { firstName, lastName, userName } = get()
    const full = [firstName, lastName].filter(Boolean).join(' ')
    return full || userName || 'دوست من'
  },

  getInitial: () => {
    const { firstName, userName } = get()
    const name = firstName || userName || ''
    return name.trim().charAt(0) || '؟'
  },
}))
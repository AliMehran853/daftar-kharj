import { create } from 'zustand'
import { getSetting } from '../db/queries'

const SESSION_KEY = 'daftar-unlocked'

function readSession() {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(SESSION_KEY) === '1'
}

function writeSession(value) {
  if (typeof sessionStorage === 'undefined') return
  if (value) sessionStorage.setItem(SESSION_KEY, '1')
  else sessionStorage.removeItem(SESSION_KEY)
}

export const useAuthStore = create((set, get) => ({
  /* ── state ── */
  lockEnabled: false,
  pinEnabled: false,
  biometricEnabled: false,
  biometricCredentialId: '',
  unlockedThisSession: false,
  _loaded: false,

  /* ── بارگذاری از DB ── */
  loadAuth: async () => {
    try {
      const [lockEnabled, pinEnabled, biometricEnabled, biometricCredentialId] =
        await Promise.all([
          getSetting('lockEnabled', false),
          getSetting('pinEnabled', false),
          getSetting('biometricEnabled', false),
          getSetting('biometricCredentialId', ''),
        ])

      const lockOn = lockEnabled === true
      const pinOn = pinEnabled === true
      const bioOn = biometricEnabled === true
      const hasMethod = pinOn || bioOn
      const effectiveLock = lockOn && hasMethod

      // اگه قفل واقعاً فعال نیست → کاربر unlocked
      // اگه فعاله → sessionStorage رو چک کن
      let unlocked
      if (!effectiveLock) {
        unlocked = true
        // سشن رو ریست می‌کنیم تا دفعه‌ی بعد که قفل فعال شد، از نو چک بشه
        writeSession(false)
      } else {
        unlocked = readSession()
      }

      set({
        lockEnabled: lockOn,
        pinEnabled: pinOn,
        biometricEnabled: bioOn,
        biometricCredentialId: biometricCredentialId || '',
        unlockedThisSession: unlocked,
        _loaded: true,
      })
    } catch (e) {
      console.error('[auth] load failed:', e)
      set({ _loaded: true })
    }
  },

  /* ── علامت‌گذاری به‌عنوان باز شده ── */
  markUnlocked: () => {
    writeSession(true)
    set({ unlockedThisSession: true })
  },

  /* ── قفل مجدد ── */
  lock: () => {
    writeSession(false)
    set({ unlockedThisSession: false })
  },

  /* ── بعد از تغییرات امنیتی، وضعیت رو از DB دوباره بخون ── */
  refresh: async () => {
    await get().loadAuth()
  },

  /* ── آیا باید LockPage نشون داده بشه؟ ── */
  shouldShowLock: () => {
    const s = get()
    if (!s._loaded) return false
    if (!s.lockEnabled) return false
    if (!s.pinEnabled && !s.biometricEnabled) return false
    return !s.unlockedThisSession
  },
}))
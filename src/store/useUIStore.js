import { create } from 'zustand'

const THEME_KEY = 'daftar-theme'

function getInitialTheme() {
  if (typeof localStorage === 'undefined') return 'system'
  return localStorage.getItem(THEME_KEY) || 'system'
}

export const useUIStore = create((set, get) => ({
  /* ── تم ── */
  theme: getInitialTheme(),
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme)
    }
    set({ theme })
    get().applyTheme(theme)
  },
  applyTheme: (theme) => {
    if (typeof document === 'undefined') return
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const effective = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
    document.documentElement.classList.toggle('dark', effective === 'dark')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', effective === 'dark' ? '#071321' : '#E8F0F6')
    }
  },
  toggleTheme: () => {
    const current = get().theme
    const next = current === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  /* ── شیت‌های پایین ── */
  sheet: null,
  sheetPayload: null,
  openSheet: (name, payload = null) => set({ sheet: name, sheetPayload: payload }),
  closeSheet: () => set({ sheet: null, sheetPayload: null }),

  /* ── مودال‌ها ── */
  modal: null,
  modalPayload: null,
  openModal: (name, payload = null) => set({ modal: name, modalPayload: payload }),
  closeModal: () => set({ modal: null, modalPayload: null }),

  /* ── انتخابگر تاریخ (جدا از Drawer تا کلیک‌ها درست کار کنه) ── */
  datePicker: null, // { value, onSelect }
  openDatePicker: (opts) => set({ datePicker: opts }),
  closeDatePicker: () => set({ datePicker: null }),

  /* ── Toast ── */
  toast: null,
  showToast: (message, type = 'info') =>
    set({ toast: { message, type, id: Date.now() } }),
  clearToast: () => set({ toast: null }),

  /* ── تاریخ و دوره ── */
  selectedMonth: new Date(),
  setSelectedMonth: (date) => set({ selectedMonth: date }),

  activePeriod: 'monthly',
  setActivePeriod: (p) => set({ activePeriod: p }),

  /* ── حریم خصوصی ── */
  privacyMode: false,
  togglePrivacy: () => set((s) => ({ privacyMode: !s.privacyMode })),

  /* ── refresh ── */
  refreshKey: 0,
  triggerRefresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))
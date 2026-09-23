import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toPersianDigits(input) {
  if (input === null || input === undefined) return ''
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d])
}

export function toEnglishDigits(input) {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d))
    .replace(/[٠-٩]/g, (d) => AR_DIGITS.indexOf(d))
}

export function formatNumber(n, { persian = true } = {}) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) {
    return persian ? '۰' : '0'
  }
  const formatted = new Intl.NumberFormat('en-US').format(
    Math.round(Number(n))
  )
  return persian ? toPersianDigits(formatted) : formatted
}

export function formatMoney(n, { persian = true, withSign = false } = {}) {
  const num = Number(n) || 0
  const abs = Math.abs(num)
  const formatted = formatNumber(abs, { persian })
  if (!withSign) return num < 0 ? `−${formatted}` : formatted
  if (num > 0) return `+${formatted}`
  if (num < 0) return `−${formatted}`
  return formatted
}

/**
 * تبدیل ساعت ۲۴ ساعته به ۱۲ ساعته با برچسب فارسی
 * @param {string} time24 مثل "21:00"
 * @returns {string} مثل "۹:۰۰ بعد از ظهر"
 */
export function formatTime12(time24) {
  if (!time24 || typeof time24 !== 'string') return '—'
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10) || 0
  if (Number.isNaN(h)) return '—'
  const period = h < 12 ? 'قبل از ظهر' : 'بعد از ظهر'
  let h12 = h % 12
  if (h12 === 0) h12 = 12
  return `${toPersianDigits(h12)}:${toPersianDigits(
    String(m).padStart(2, '0')
  )} ${period}`
}

export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO() {
  return toISODate(new Date())
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

let scrollLockCount = 0
export function scrollLock(lock) {
  if (typeof document === 'undefined') return
  if (lock) {
    scrollLockCount++
    document.body.style.overflow = 'hidden'
  } else {
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (scrollLockCount === 0) {
      document.body.style.overflow = ''
    }
  }
}

export function safeNumber(input, fallback = 0) {
  const cleaned = toEnglishDigits(String(input ?? '')).replace(/[^\d.-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : fallback
}
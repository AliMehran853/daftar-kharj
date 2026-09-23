import {
  format,
  getDate,
  getMonth,
  getYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  differenceInCalendarDays,
} from 'date-fns-jalali'
import { toPersianDigits, toISODate } from './utils'

export const AFGHAN_MONTHS = [
  'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
  'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
]

// getDay(): 0=Sunday ... 6=Saturday
const WEEKDAY_NAMES = [
  'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه',
  'پنج‌شنبه', 'جمعه', 'شنبه',
]

function toDate(input) {
  if (input instanceof Date) return input
  if (typeof input === 'number') return new Date(input)
  if (typeof input === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
    if (m) {
      const [, y, mo, d] = m
      return new Date(Number(y), Number(mo) - 1, Number(d))
    }
    return new Date(input)
  }
  return new Date()
}

export function formatJalaliLong(input) {
  const d = toDate(input)
  return `${toPersianDigits(getDate(d))} ${
    AFGHAN_MONTHS[getMonth(d)]
  } ${toPersianDigits(getYear(d))}`
}

export function formatJalaliShort(input) {
  const d = toDate(input)
  return `${toPersianDigits(getYear(d))}/${toPersianDigits(
    getMonth(d) + 1
  )}/${toPersianDigits(getDate(d))}`
}

export function formatMonthYear(input) {
  const d = toDate(input)
  return `${AFGHAN_MONTHS[getMonth(d)]} ${toPersianDigits(getYear(d))}`
}

export function formatWeekdayLong(input) {
  const d = toDate(input)
  return WEEKDAY_NAMES[d.getDay()]
}

/**
 * ساعت ۱۲ ساعته — همه‌جا استفاده می‌شه
 * @param {Date|string|number} input
 * @returns {string} مثل "۸:۵۹ بعد از ظهر"
 */
export function formatTime(input) {
  const d = toDate(input)
  const h24 = d.getHours()
  const m = d.getMinutes()

  const period = h24 < 12 ? 'قبل از ظهر' : 'بعد از ظهر'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12

  return `${toPersianDigits(h12)}:${toPersianDigits(
    String(m).padStart(2, '0')
  )} ${period}`
}

export function formatFullDate(input) {
  const d = toDate(input)
  return `${formatWeekdayLong(d)} ${toPersianDigits(
    getDate(d)
  )} ${AFGHAN_MONTHS[getMonth(d)]} ${toPersianDigits(getYear(d))}`
}

export function relativeDayLabel(input) {
  const d = toDate(input)
  const today = new Date()
  const diff = differenceInCalendarDays(startOfDay(d), startOfDay(today))
  if (diff === 0) return 'امروز'
  if (diff === -1) return 'دیروز'
  if (diff === -2) return 'پریروز'
  if (diff === 1) return 'فردا'
  if (diff > 1 && diff <= 7) return `${toPersianDigits(diff)} روز دیگر`
  if (diff < -2 && diff >= -7) return `${toPersianDigits(-diff)} روز پیش`
  return formatJalaliLong(d)
}

export function getMonthRange(input = new Date()) {
  const d = toDate(input)
  return { start: startOfMonth(d), end: endOfMonth(d) }
}

export function getWeekRange(input = new Date()) {
  const d = toDate(input)
  return {
    start: startOfWeek(d, { weekStartsOn: 6 }),
    end: endOfWeek(d, { weekStartsOn: 6 }),
  }
}

export function getYearRange(input = new Date()) {
  const d = toDate(input)
  const year = getYear(d)
  const start = new Date(d)
  start.setFullYear(year - 621, 2, 21)
  const monthStart = startOfMonth(d)
  const firstMonth = subMonths(monthStart, getMonth(d))
  const lastMonth = addMonths(firstMonth, 11)
  return { start: firstMonth, end: endOfMonth(lastMonth) }
}

export function getDayRange(input = new Date()) {
  const d = toDate(input)
  return { start: startOfDay(d), end: endOfDay(d) }
}

export function shiftMonth(input, delta) {
  const d = toDate(input)
  return delta > 0 ? addMonths(d, delta) : subMonths(d, -delta)
}

export function dayKey(input) {
  return toISODate(toDate(input))
}

export {
  toDate,
  isSameDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addDays,
  getDate,
  getMonth,
  getYear,
  format,
}
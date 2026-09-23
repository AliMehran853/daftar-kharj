export const APP_NAME = 'دفتر خرج'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'مدیریت معاش و خرج‌های روزانه'

export const PIN_LENGTH = 4

export const ROUTES = {
  HOME: '/',
  EXPENSES: '/expenses',
  SAVINGS: '/savings',
  REPORTS: '/reports',
  CATEGORY: '/category',
  SETTINGS: '/settings',
  LOCK: '/lock',
  ONBOARDING: '/onboarding',
}

export const ACCOUNTS = {
  WALLET: 'wallet',
  SAVINGS: 'savings',
}

export const TX_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
}

export const TX_SUBTYPES = {
  SALARY: 'salary',
  EXTRA: 'extra',
  TO_SAVINGS: 'to-savings',
  FROM_SAVINGS: 'from-savings',
}

export const CURRENCY_OPTIONS = [
  { value: 'AFN', label: 'افغانی' },
  { value: 'USD', label: 'دالر' },
  { value: 'EUR', label: 'یورو' },
  { value: 'PKR', label: 'کلدار' },
  { value: 'IRR', label: 'تومان' },
]

export const PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
}
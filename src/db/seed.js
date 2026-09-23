import { db } from './schema'
import { DEFAULT_CATEGORIES } from '../data/categories'

const DEFAULT_SETTINGS = {
  userName: '',
  firstName: '',
  lastName: '',
  monthlySalary: 0,
  currencyLabel: 'افغانی',
  currencyCode: 'AFN',

  lockEnabled: false,
  pinEnabled: false,
  pinHash: '',
  pinSalt: '',
  biometricEnabled: false,
  biometricCredentialId: '',

  reminderEnabled: true,
  reminderTime: '21:00',
  lastReminderShownAt: null,

  onboardingCompleted: false,
  welcomeGreetingSeenAt: null,

  theme: 'system',
}

export async function seedDatabase() {
  // دسته‌ها
  const catCount = await db.categories.count()
  if (catCount === 0) {
    await db.categories.bulkPut(
      DEFAULT_CATEGORIES.map((c) => ({ ...c }))
    )
  }

  // تنظیمات
  const now = Date.now()
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    const existing = await db.settings.get(key)
    if (!existing) {
      await db.settings.put({ key, value, updatedAt: now })
    }
  }
}

export async function resetDatabase() {
  await db.transactions.clear()
  await db.categories.clear()
  await db.settings.clear()
  await seedDatabase()
}
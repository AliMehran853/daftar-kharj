import { db } from './schema'
import {
  DEFAULT_CATEGORIES,
  normalizeCategoryId,
} from '../data/categories'

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
  /* ─── دسته‌ها ─── */
  const existingCats = await db.categories.toArray()
  const existingIds = new Set(existingCats.map((c) => c.id))
  const newIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id))

  // ۱. اضافه‌کردن دسته‌های جدیدی که نیستن
  const toAdd = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id))
  if (toAdd.length > 0) {
    await db.categories.bulkPut(toAdd.map((c) => ({ ...c })))
  }

  // ۲. حذف دسته‌های پیش‌فرض قدیمی که دیگه توی لیست جدید نیستن
  const toRemove = existingCats.filter(
    (c) => c.isDefault && !newIds.has(c.id)
  )
  if (toRemove.length > 0) {
    await db.categories.bulkDelete(toRemove.map((c) => c.id))
  }

  // ۳. Migration: تبدیل categoryId قدیمی به جدید
  try {
    const allTxs = await db.transactions.toArray()
    const toUpdate = []
    for (const tx of allTxs) {
      if (!tx.categoryId) continue
      const newId = normalizeCategoryId(tx.categoryId)
      if (newId !== tx.categoryId) {
        toUpdate.push({ ...tx, categoryId: newId })
      }
    }
    if (toUpdate.length > 0) {
      await db.transactions.bulkPut(toUpdate)
      console.log(`[seed] migrated ${toUpdate.length} transactions`)
    }
  } catch (e) {
    console.warn('[seed] migration skipped:', e)
  }

  /* ─── تنظیمات ─── */
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
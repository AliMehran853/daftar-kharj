import { db } from '../db/schema'
import { APP_NAME, APP_VERSION } from '../data/constants'
import { resetDatabase } from '../db/seed'

export async function exportBackup() {
  const [transactions, categories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ])

  const payload = {
    app: APP_NAME,
    appId: 'daftar-kharj',
    version: APP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      transactions,
      categories,
      settings,
    },
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const ts = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
  const filename = `daftar-kharj-backup-${ts}.json`

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)

  return { filename, size: blob.size }
}

function validateBackup(obj) {
  if (!obj || typeof obj !== 'object') {
    return { ok: false, reason: 'فایل نامعتبر است' }
  }
  if (obj.appId !== 'daftar-kharj') {
    return { ok: false, reason: 'این فایل مربوط به «دفتر خرج» نیست' }
  }
  const d = obj.data
  if (!d || !Array.isArray(d.transactions) || !Array.isArray(d.categories)) {
    return { ok: false, reason: 'ساختار داده‌ها معتبر نیست' }
  }
  return { ok: true }
}

export async function restoreBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'))
    reader.onload = async (e) => {
      try {
        const obj = JSON.parse(e.target.result)
        const v = validateBackup(obj)
        if (!v.ok) {
          reject(new Error(v.reason))
          return
        }

        await db.transaction(
          'rw',
          db.transactions,
          db.categories,
          db.settings,
          async () => {
            await db.transactions.clear()
            await db.categories.clear()
            await db.settings.clear()

            if (obj.data.transactions.length) {
              await db.transactions.bulkPut(obj.data.transactions)
            }
            if (obj.data.categories.length) {
              await db.categories.bulkPut(obj.data.categories)
            }
            if (obj.data.settings.length) {
              await db.settings.bulkPut(obj.data.settings)
            }
          }
        )

        resolve({
          transactions: obj.data.transactions.length,
          categories: obj.data.categories.length,
          settings: obj.data.settings.length,
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
}

export async function factoryReset() {
  await resetDatabase()
  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch {}
}
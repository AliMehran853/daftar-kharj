import Dexie from 'dexie'

export const db = new Dexie('daftar-kharj')

db.version(1).stores({
  transactions: 'id, type, date, categoryId, forMemberId, createdAt, [type+date], [categoryId+date]',
  categories: 'id, type, sortOrder',
  settings: 'key',
})

// برای دیباگ
if (import.meta.env.DEV) {
  db.on('ready', () => console.log('[db] ready'))
}
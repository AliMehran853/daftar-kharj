import { db } from './schema'
import { uid, toISODate, todayISO } from '../lib/utils'

/* ─────────────────────────────────────────────
   تراکنش‌ها
   ───────────────────────────────────────────── */

export async function getAllTransactions() {
  const txs = await db.transactions.toArray()
  return txs.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getTransaction(id) {
  return db.transactions.get(id)
}

export async function getRecentTransactions(limit = 8) {
  const txs = await db.transactions.orderBy('createdAt').reverse().limit(limit).toArray()
  return txs
}

export async function getTransactionsBetween(startInput, endInput) {
  const start = toISODate(startInput)
  const end = toISODate(endInput)
  const txs = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()
  return txs.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getTransactionsByCategory(categoryId, startInput, endInput) {
  const start = toISODate(startInput)
  const end = toISODate(endInput)
  const txs = await db.transactions
    .where('[categoryId+date]')
    .between([categoryId, start], [categoryId, end], true, true)
    .toArray()
  return txs.sort((a, b) => b.createdAt - a.createdAt)
}

export async function addTransaction(data) {
  const now = Date.now()
  const tx = {
    id: uid(),
    type: data.type,
    subtype: data.subtype || null,
    amount: Number(data.amount) || 0,
    categoryId: data.categoryId || null,
    fromAccountId: data.fromAccountId || null,
    toAccountId: data.toAccountId || null,
    forMemberId: data.forMemberId || 'self',
    note: data.note || '',
    date: data.date ? toISODate(data.date) : todayISO(),
    createdAt: now,
    updatedAt: now,
  }
  await db.transactions.put(tx)
  return tx
}

export async function updateTransaction(id, patch) {
  const now = Date.now()
  const next = { ...patch, updatedAt: now }
  if (patch.date) next.date = toISODate(patch.date)
  if (patch.amount !== undefined) next.amount = Number(patch.amount) || 0
  await db.transactions.update(id, next)
  return db.transactions.get(id)
}

export async function deleteTransaction(id) {
  return db.transactions.delete(id)
}

/* ─────────────────────────────────────────────
   دسته‌بندی‌ها
   ───────────────────────────────────────────── */

export async function getAllCategories() {
  return db.categories.orderBy('sortOrder').toArray()
}

export async function getCategoriesByType(type) {
  const list = await db.categories.where('type').equals(type).toArray()
  return list.sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function addCategory(data) {
  const cat = { ...data, id: data.id || uid(), isDefault: false }
  await db.categories.put(cat)
  return cat
}

export async function deleteCategory(id) {
  return db.categories.delete(id)
}

/* ─────────────────────────────────────────────
   تنظیمات
   ───────────────────────────────────────────── */

export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: Date.now() })
}

export async function getAllSettings() {
  const rows = await db.settings.toArray()
  const out = {}
  for (const r of rows) out[r.key] = r.value
  return out
}

export async function setSettings(obj) {
  const now = Date.now()
  const rows = Object.entries(obj).map(([key, value]) => ({
    key, value, updatedAt: now,
  }))
  await db.settings.bulkPut(rows)
}

/* ─────────────────────────────────────────────
   محاسبات موجودی (زنده)
   ───────────────────────────────────────────── */

export async function getBalance() {
  const txs = await db.transactions.toArray()
  let wallet = 0
  let savings = 0

  for (const tx of txs) {
    const amt = Number(tx.amount) || 0

    if (tx.type === 'income') {
      if (tx.toAccountId === 'savings') savings += amt
      else wallet += amt
    } else if (tx.type === 'expense') {
      if (tx.fromAccountId === 'savings') savings -= amt
      else wallet -= amt
    } else if (tx.type === 'transfer') {
      if (tx.fromAccountId === 'wallet' && tx.toAccountId === 'savings') {
        wallet -= amt
        savings += amt
      } else if (tx.fromAccountId === 'savings' && tx.toAccountId === 'wallet') {
        savings -= amt
        wallet += amt
      }
    }
  }

  return { wallet, savings }
}

export async function getStatsBetween(startInput, endInput) {
  const start = toISODate(startInput)
  const end = toISODate(endInput)

  const txs = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()

  let salary = 0
  let extraIncome = 0
  let totalIncome = 0
  let totalExpense = 0
  let toSavings = 0
  let fromSavings = 0
  let txCount = txs.length

  for (const tx of txs) {
    const amt = Number(tx.amount) || 0

    if (tx.type === 'income') {
      totalIncome += amt
      if (tx.subtype === 'salary') salary += amt
      else extraIncome += amt
    } else if (tx.type === 'expense') {
      totalExpense += amt
    } else if (tx.type === 'transfer') {
      if (tx.subtype === 'to-savings') toSavings += amt
      else if (tx.subtype === 'from-savings') fromSavings += amt
    }
  }

  return {
    salary,
    extraIncome,
    totalIncome,
    totalExpense,
    toSavings,
    fromSavings,
    txCount,
    transactions: txs,
  }
}

export async function getMonthlyStatsByCategory(startInput, endInput) {
  const start = toISODate(startInput)
  const end = toISODate(endInput)

  const txs = await db.transactions
    .where('date')
    .between(start, end, true, true)
    .toArray()

  const byCategory = {}
  let totalExpense = 0

  for (const tx of txs) {
    if (tx.type !== 'expense') continue
    const key = tx.categoryId || 'other-expense'
    const amt = Number(tx.amount) || 0
    byCategory[key] = (byCategory[key] || 0) + amt
    totalExpense += amt
  }

  const rows = Object.entries(byCategory).map(([categoryId, amount]) => ({
    categoryId,
    amount,
    percent: totalExpense ? (amount / totalExpense) * 100 : 0,
  }))

  rows.sort((a, b) => b.amount - a.amount)

  return { rows, totalExpense }
}

export async function getTransferHistory() {
  const txs = await db.transactions
    .where('type')
    .equals('transfer')
    .toArray()
  return txs.sort((a, b) => b.createdAt - a.createdAt)
}
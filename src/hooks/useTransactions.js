import { useEffect, useState, useCallback } from 'react'
import {
  getRecentTransactions,
  getTransactionsBetween,
  getAllCategories,
  getCategoriesByType,
} from '@/db/queries'
import { useUIStore } from '@/store/useUIStore'

export function useRecentTransactions(limit = 8) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshKey = useUIStore((s) => s.refreshKey)

  const reload = useCallback(async () => {
    const txs = await getRecentTransactions(limit)
    setList(txs)
    setLoading(false)
  }, [limit])

  useEffect(() => {
    reload()
  }, [reload, refreshKey])

  return { transactions: list, loading, reload }
}

export function useTransactionsBetween(start, end) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshKey = useUIStore((s) => s.refreshKey)

  const reload = useCallback(async () => {
    if (!start || !end) return
    const txs = await getTransactionsBetween(start, end)
    setList(txs)
    setLoading(false)
  }, [start, end])

  useEffect(() => {
    reload()
  }, [reload, refreshKey])

  return { transactions: list, loading, reload }
}

export function useCategories(type) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshKey = useUIStore((s) => s.refreshKey)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const data = type
        ? await getCategoriesByType(type)
        : await getAllCategories()
      if (!cancelled) {
        setList(data)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [type, refreshKey])

  return { categories: list, loading }
}
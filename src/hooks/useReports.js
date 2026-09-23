import { useEffect, useState, useCallback } from 'react'
import { getStatsBetween, getMonthlyStatsByCategory } from '@/db/queries'
import { useUIStore } from '@/store/useUIStore'
import {
  getMonthRange,
  getWeekRange,
  getDayRange,
  getYearRange,
  toDate,
} from '@/lib/jalali'

export function useReports(range, period) {
  const [state, setState] = useState({
    stats: null,
    byCategory: null,
    loading: true,
  })
  const refreshKey = useUIStore((s) => s.refreshKey)

  const getRange = useCallback(() => {
    const d = toDate(range)
    if (period === 'daily') return getDayRange(d)
    if (period === 'weekly') return getWeekRange(d)
    if (period === 'yearly') return getYearRange(d)
    return getMonthRange(d)
  }, [range, period])

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    const { start, end } = getRange()
    const [stats, byCategory] = await Promise.all([
      getStatsBetween(start, end),
      getMonthlyStatsByCategory(start, end),
    ])
    setState({ stats, byCategory, loading: false })
  }, [getRange])

  useEffect(() => {
    reload()
  }, [reload, refreshKey])

  return { ...state, reload }
}
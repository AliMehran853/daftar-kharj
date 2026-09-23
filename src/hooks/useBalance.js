import { useEffect, useState, useCallback } from 'react'
import { getBalance, getStatsBetween } from '@/db/queries'
import { getMonthRange } from '@/lib/jalali'
import { useUIStore } from '@/store/useUIStore'

export function useBalance() {
  const [state, setState] = useState({
    wallet: 0,
    savings: 0,
    monthStats: null,
    loading: true,
  })

  const refreshKey = useUIStore((s) => s.refreshKey)

  const reload = useCallback(async () => {
    const { start, end } = getMonthRange(new Date())
    const [balance, stats] = await Promise.all([
      getBalance(),
      getStatsBetween(start, end),
    ])
    setState({
      wallet: balance.wallet,
      savings: balance.savings,
      monthStats: stats,
      loading: false,
    })
  }, [])

  useEffect(() => {
    reload()
  }, [reload, refreshKey])

  return { ...state, reload }
}
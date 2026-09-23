import { toPersianDigits } from '@/lib/utils'

export const CHART_COLORS = [
  '#00B894',
  '#4A9FE8',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#EF4444',
  '#06B6D4',
  '#10B981',
  '#F472B6',
  '#6B7280',
]

export const INCOME_COLOR = '#00B894'
export const EXPENSE_COLOR = '#E74C3C'
export const SAVINGS_COLOR = '#4A9FE8'

/** فونت مشترک برای همه‌ی چارت‌ها */
export function getChartFontFamily() {
  return 'Vazirmatn, system-ui, sans-serif'
}

/** رنگ‌های سراسری برای همه‌ی چارت‌ها */
export function getBaseOptions({ dark = false } = {}) {
  const textColor = dark ? '#B8CCC7' : '#4A6660'
  const mutedColor = dark ? '#7F9C96' : '#7F9C96'
  const gridColor = dark ? 'rgba(0, 209, 167, 0.10)' : 'rgba(15, 38, 32, 0.06)'

  return {
    chart: {
      fontFamily: getChartFontFamily(),
      foreColor: textColor,
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 400,
        animateGradually: { enabled: true, delay: 80 },
        dynamicAnimation: { enabled: true, speed: 300 },
      },
      parentHeightOffset: 0,
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      padding: { left: 4, right: 4, top: -8, bottom: 0 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: dark ? 'dark' : 'light',
      style: {
        fontFamily: getChartFontFamily(),
        fontSize: '12px',
      },
      y: {
        formatter: (v) => `${toPersianDigits(Math.round(v))} افغانی`,
      },
    },
    legend: {
      fontFamily: getChartFontFamily(),
      fontSize: '12px',
      labels: { colors: textColor },
      markers: { size: 6, strokeWidth: 0 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    states: {
      hover: { filter: { type: 'lighten', value: 0.05 } },
      active: { filter: { type: 'none' } },
    },
  }
}

/** یه آرایه از اعداد فارسی برای محور */
export function persianTickFormatter(value) {
  if (value >= 1000000) return `${toPersianDigits((value / 1000000).toFixed(1))}م`
  if (value >= 1000) return `${toPersianDigits(Math.round(value / 1000))}هـ`
  return toPersianDigits(Math.round(value))
}

export function toPersianNumberFormatter(value) {
  return toPersianDigits(Math.round(value))
}
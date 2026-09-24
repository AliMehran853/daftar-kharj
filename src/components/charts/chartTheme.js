import { toPersianDigits } from '@/lib/utils'

export const CHART_COLORS = [
  '#183B70', // Navy primary
  '#7457D9', // Purple saving
  '#16A56A', // Green income
  '#F04478', // Pink expense
  '#3299E8', // Blue info
  '#F5A623', // Orange warning
  '#5B9CFF', // Light blue
  '#8B6CFF', // Light purple
  '#FF4F83', // Light pink
  '#91A6BA', // Muted
]

export const INCOME_COLOR = '#16A56A'
export const EXPENSE_COLOR = '#F04478'
export const SAVINGS_COLOR = '#7457D9'

export function getChartFontFamily() {
  return 'Vazirmatn, system-ui, sans-serif'
}

export function getBaseOptions({ dark = false } = {}) {
  const textColor = dark ? '#91A9C4' : '#66809D'
  const gridColor = dark
    ? 'rgba(91, 156, 255, 0.08)'
    : 'rgba(24, 59, 112, 0.06)'

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

export function persianTickFormatter(value) {
  if (value >= 1000000)
    return `${toPersianDigits((value / 1000000).toFixed(1))}م`
  if (value >= 1000) return `${toPersianDigits(Math.round(value / 1000))}هـ`
  return toPersianDigits(Math.round(value))
}
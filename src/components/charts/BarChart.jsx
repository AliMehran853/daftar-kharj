import Chart from 'react-apexcharts'
import { useMemo } from 'react'
import { toPersianDigits } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import {
  getBaseOptions,
  persianTickFormatter,
  getChartFontFamily,
} from './chartTheme'

function toAlphaColor(hex, alpha) {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return hex
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

export default function BarChart({
  categories = [],
  series = [],
  colors = ['#F04478'],
  height = 240,
  stacked = false,
  showDataLabels = false,
  highlightIndex = null,
  fadeFactor = 0.28,
  compact = false,
}) {
  const theme = useUIStore((s) => s.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  const options = useMemo(() => {
    const base = getBaseOptions({ dark: isDark })
    const mainColor = colors[0] || '#F04478'
    const useHighlight = highlightIndex !== null && series.length === 1

    const distributedColors = useHighlight
      ? categories.map((_, i) =>
          i === highlightIndex ? mainColor : toAlphaColor(mainColor, fadeFactor)
        )
      : colors

    const axisLabelColor = isDark ? '#91A9C4' : '#66809D'

    return {
      ...base,
      chart: {
        ...base.chart,
        type: 'bar',
        stacked,
        parentHeightOffset: 0,
      },
      colors: distributedColors,
      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: 'end',
          columnWidth: compact ? '42%' : useHighlight ? '45%' : '55%',
          horizontal: false,
          distributed: useHighlight,
        },
      },
      dataLabels: {
        enabled: showDataLabels,
        formatter: (val) => {
          if (!val || Number(val) === 0) return ''
          return toPersianDigits(Math.round(Number(val)))
        },
        style: {
          fontSize: '10px',
          fontFamily: getChartFontFamily(),
          fontWeight: 700,
          colors: [isDark ? '#F2F7FF' : '#142A47'],
        },
        background: { enabled: false },
        offsetY: -4,
        dropShadow: { enabled: false },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          rotate: 0,
          hideOverlappingLabels: false,
          trim: false,
          style: {
            fontSize: compact ? '11px' : '10px',
            fontFamily: base.chart.fontFamily,
            colors: useHighlight
              ? categories.map((_, i) =>
                  i === highlightIndex ? mainColor : axisLabelColor
                )
              : axisLabelColor,
            fontWeight: useHighlight
              ? categories.map((_, i) => (i === highlightIndex ? 700 : 500))
              : 500,
          },
          offsetY: 0,
        },
      },
      yaxis: {
        labels: {
          formatter: persianTickFormatter,
          style: { fontSize: '11px' },
        },
      },
      fill: { type: 'solid' },
      legend: {
        ...base.legend,
        show: series.length > 1,
      },
      grid: {
        ...base.grid,
        padding: {
          left: 8,
          right: 12,
          top: -8,
          bottom: 4,
        },
      },
    }
  }, [
    categories,
    series,
    colors,
    isDark,
    stacked,
    showDataLabels,
    highlightIndex,
    fadeFactor,
    compact,
  ])

  if (!series.length || !categories.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-fg-muted"
        style={{ height }}
      >
        داده‌ای برای نمایش نیست
      </div>
    )
  }

  return <Chart type="bar" height={height} options={options} series={series} />
}
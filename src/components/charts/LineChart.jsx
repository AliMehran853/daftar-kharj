import Chart from 'react-apexcharts'
import { useMemo } from 'react'
import { toPersianDigits } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import {
  getBaseOptions,
  persianTickFormatter,
  getChartFontFamily,
} from './chartTheme'

export default function LineChart({
  categories = [],
  series = [],
  colors = ['#16A56A', '#F04478'],
  height = 260,
  width = '100%',
  areaFill = true,
  showDataLabels = false,
}) {
  const theme = useUIStore((s) => s.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  const options = useMemo(() => {
    const base = getBaseOptions({ dark: isDark })
    return {
      ...base,
      chart: { ...base.chart, type: 'area' },
      colors,
      stroke: {
        curve: 'smooth',
        width: 2.5,
        lineCap: 'round',
      },
      fill: areaFill
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.35,
              opacityTo: 0.0,
              stops: [0, 95, 100],
            },
          }
        : { type: 'solid', opacity: 0 },
      markers: {
        size: 0,
        strokeWidth: 0,
        hover: { size: 5 },
      },
      dataLabels: {
        enabled: showDataLabels,
        formatter: (val) => {
          if (!val || Number(val) === 0) return ''
          return toPersianDigits(Math.round(Number(val)))
        },
        style: {
          fontSize: '9px',
          fontFamily: getChartFontFamily(),
          fontWeight: 600,
          colors: colors,
        },
        background: { enabled: false },
        offsetY: -6,
        dropShadow: { enabled: false },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        tickAmount: Math.max(1, categories.length - 1),
        labels: {
          rotate: 0,
          hideOverlappingLabels: false,
          style: {
            fontSize: '10px',
            fontFamily: base.chart.fontFamily,
          },
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          formatter: persianTickFormatter,
          style: { fontSize: '11px' },
        },
      },
      legend: {
        ...base.legend,
        show: series.length > 1,
        position: 'top',
        horizontalAlign: 'center',
      },
      grid: {
        ...base.grid,
        padding: { left: 4, right: 8, top: -12, bottom: 0 },
      },
      tooltip: {
        ...base.tooltip,
        shared: true,
        intersect: false,
        x: {
          formatter: (val) => `روز ${val}`,
        },
      },
    }
  }, [categories, series, colors, isDark, areaFill, showDataLabels])

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

  return (
    <Chart
      type="area"
      height={height}
      width={width}
      options={options}
      series={series}
    />
  )
}
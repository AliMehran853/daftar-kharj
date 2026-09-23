import Chart from 'react-apexcharts'
import { useMemo } from 'react'
import { toPersianDigits } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import { getBaseOptions, persianTickFormatter } from './chartTheme'

export default function BarChart({
  categories = [],
  series = [],
  colors = ['#00B894'],
  height = 240,
  stacked = false,
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
      chart: { ...base.chart, type: 'bar', stacked },
      colors,
      plotOptions: {
        bar: {
          borderRadius: 6,
          borderRadiusApplication: 'end',
          columnWidth: '55%',
          horizontal: false,
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            fontSize: '11px',
            fontFamily: base.chart.fontFamily,
          },
        },
      },
      yaxis: {
        labels: {
          formatter: persianTickFormatter,
          style: { fontSize: '11px' },
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.2,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      legend: {
        ...base.legend,
        show: series.length > 1,
      },
    }
  }, [categories, series, colors, isDark, stacked])

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
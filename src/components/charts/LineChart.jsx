import Chart from 'react-apexcharts'
import { useMemo } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { getBaseOptions, persianTickFormatter } from './chartTheme'

export default function LineChart({
  categories = [],
  series = [],
  colors = ['#00B894', '#E74C3C'],
  height = 260,
  width = '100%',
  areaFill = true,
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
  }, [categories, series, colors, isDark, areaFill])

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
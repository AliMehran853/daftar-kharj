import Chart from 'react-apexcharts'
import { useMemo } from 'react'
import { toPersianDigits } from '@/lib/utils'
import { useUIStore } from '@/store/useUIStore'
import {
  getBaseOptions,
  getChartFontFamily,
  CHART_COLORS,
} from './chartTheme'

export default function DonutChart({
  data = [],
  labels = [],
  colors,
  centerLabel,
  centerValue,
  height = 260,
}) {
  const theme = useUIStore((s) => s.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches)

  const options = useMemo(() => {
    const base = getBaseOptions({ dark: isDark })
    const palette = colors || CHART_COLORS

    return {
      ...base,
      labels,
      colors: palette,
      stroke: {
        width: 2,
        colors: [isDark ? '#12322E' : '#FFFFFF'],
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { show: false }, // ← لیبل حذف شد
              value: {
                show: true,
                fontSize: '26px',
                fontWeight: 700,
                fontFamily: getChartFontFamily(),
                color: isDark ? '#F1F7F5' : '#0F2620',
                offsetY: 0,
                formatter: (v) =>
                  centerValue !== undefined
                    ? centerValue
                    : toPersianDigits(Math.round(Number(v))),
              },
              total: {
                show: false, // ← مجموع هم حذف شد از داخل
              },
            },
          },
        },
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      tooltip: {
        ...base.tooltip,
        y: {
          formatter: (v) => `${toPersianDigits(Math.round(v))} افغانی`,
        },
      },
    }
  }, [data, labels, colors, isDark, centerValue])

  if (!data.length || data.every((v) => !v)) {
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
    <div className="w-full">
      {/* لیبل بالای دونات */}
      {centerLabel && (
        <div className="text-center text-[12px] font-medium text-fg-muted mb-2">
          {centerLabel}
        </div>
      )}

      <Chart type="donut" height={height} options={options} series={data} />
    </div>
  )
}
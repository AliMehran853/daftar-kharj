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
  centerLabel = 'مجموع مصارف',
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
        colors: [isDark ? '#0D2036' : '#EAF2F7'],
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '11px',
                fontFamily: getChartFontFamily(),
                color: isDark ? '#91A9C4' : '#66809D',
                offsetY: 18,
              },
              value: {
                show: true,
                fontSize: '26px',
                fontWeight: 700,
                fontFamily: getChartFontFamily(),
                color: isDark ? '#F2F7FF' : '#142A47',
                offsetY: -8,
                formatter: (v) =>
                  centerValue !== undefined
                    ? centerValue
                    : toPersianDigits(Math.round(Number(v))),
              },
              total: {
                show: true,
                showAlways: true,
                label: centerLabel,
                fontSize: '11px',
                fontFamily: getChartFontFamily(),
                color: isDark ? '#91A9C4' : '#66809D',
                formatter: () =>
                  centerValue !== undefined
                    ? centerValue
                    : toPersianDigits(
                        Math.round(data.reduce((a, b) => a + (Number(b) || 0), 0))
                      ),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: {
        ...base.tooltip,
        y: {
          formatter: (v) => `${toPersianDigits(Math.round(v))} افغانی`,
        },
      },
    }
  }, [data, labels, colors, isDark, centerLabel, centerValue])

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
    <Chart type="donut" height={height} options={options} series={data} />
  )
}
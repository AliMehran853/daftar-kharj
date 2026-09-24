import { toPersianDigits, formatMoney } from './utils'
import { formatFullDate } from './jalali'
import { CATEGORY_MAP } from '../data/categories'
import { APP_NAME, APP_VERSION } from '../data/constants'

/* ─────────────────────────────────────────────
   برچسب نوع تراکنش
   ───────────────────────────────────────────── */
function txTypeLabel(tx) {
  if (tx.type === 'income') {
    return tx.subtype === 'salary' ? 'معاش' : 'درآمد'
  }
  if (tx.type === 'expense') return 'مصرف'
  if (tx.type === 'transfer') {
    return tx.subtype === 'to-savings' ? 'واریز' : 'برداشت'
  }
  return '—'
}

/* ─────────────────────────────────────────────
   استایل مشترک PDF
   ───────────────────────────────────────────── */
function buildStyles(origin) {
  return `
    @font-face {
      font-family: 'Vazirmatn';
      src: url('${origin}/fonts/Vazirmatn-Regular.ttf') format('truetype');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Vazirmatn';
      src: url('${origin}/fonts/Vazirmatn-Medium.ttf') format('truetype');
      font-weight: 500;
    }
    @font-face {
      font-family: 'Vazirmatn';
      src: url('${origin}/fonts/Vazirmatn-SemiBold.ttf') format('truetype');
      font-weight: 600;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    .dk-report {
      font-family: 'Vazirmatn', system-ui, -apple-system, sans-serif;
      direction: rtl;
      color: #1A0F1F;
      background: #FFFFFF;
      padding: 24px;
      font-size: 12px;
      line-height: 1.7;
      width: 100%;
    }

    /* ─── هدر ─── */
    .dk-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      border-bottom: 2px solid #183B70;
      margin-bottom: 24px;
    }
    .dk-header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .dk-header-logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #183B70 0%, #315B95 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 22px;
      line-height: 1;
      padding-bottom: 10px;
      padding-left: 1px;
      flex-shrink: 0;
      overflow: hidden;
    }
    .dk-header-name {
      font-size: 16px;
      font-weight: 700;
      color: #183B70;
      line-height: 1.3;
    }
    .dk-header-sub {
      font-size: 9px;
      color: #91A6BA;
      line-height: 1.3;
      margin-top: 2px;
    }
    .dk-header-meta {
      text-align: left;
      font-size: 10px;
      color: #91A6BA;
      line-height: 1.9;
    }

    /* ─── عنوان ─── */
    .dk-title {
      font-size: 20px;
      font-weight: 700;
      text-align: center;
      color: #142A47;
      margin-top: 8px;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .dk-subtitle {
      font-size: 13px;
      text-align: center;
      color: #66809D;
      margin-bottom: 22px;
      line-height: 1.6;
    }

    /* ─── خلاصه ─── */
    .dk-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 22px;
      margin-bottom: 24px;
    }
    .dk-summary-card {
      padding: 12px 8px;
      border-radius: 12px;
      background: #EEF5F9;
      border: 1px solid #D7E3EC;
      text-align: center;
    }
    .dk-summary-card.income {
      background: #DCFCE7;
      border-color: #B8E7C4;
    }
    .dk-summary-card.savings {
      background: #EFE7F5;
      border-color: #D9C9E9;
    }
    .dk-summary-card.expense {
      background: #FFE4E6;
      border-color: #FFC5CC;
    }
    /* کارت مهم — موجودی فعلی خزانه */
    .dk-summary-card.wallet {
      background: #F0F7FF;
      border: 2px solid #3299E8;
      box-shadow: 0 2px 8px rgba(50, 153, 232, 0.15);
      padding: 11px 7px;
    }
    .dk-summary-label {
      font-size: 9.5px;
      color: #66809D;
      margin-bottom: 6px;
    }
    .dk-summary-card.wallet .dk-summary-label {
      color: #3299E8;
      font-weight: 600;
    }
    .dk-summary-value {
      font-size: 14px;
      font-weight: 700;
      color: #142A47;
      line-height: 1.3;
    }
    .dk-summary-card.income .dk-summary-value { color: #16A56A; }
    .dk-summary-card.savings .dk-summary-value { color: #7457D9; }
    .dk-summary-card.expense .dk-summary-value { color: #F04478; }
    .dk-summary-card.wallet .dk-summary-value {
      color: #3299E8;
      font-size: 15px;
    }

    /* ─── جدول ─── */
    .dk-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .dk-table thead {
      background: #EEF5F9;
    }
    .dk-table th {
      padding: 9px 10px;
      text-align: right;
      font-weight: 600;
      font-size: 11px;
      color: #183B70;
      border-bottom: 2px solid #183B70;
    }
    .dk-table td {
      padding: 9px 10px;
      text-align: right;
      font-size: 11px;
      border-bottom: 1px solid #EEF5F9;
      color: #1A0F1F;
    }
    .dk-table tbody tr:nth-child(even) {
      background: #F7F9FB;
    }
    .dk-table .amount-expense { color: #F04478; font-weight: 600; }
    .dk-table .amount-income { color: #16A56A; font-weight: 600; }

    /* ─── ردیف‌های خلاصه‌ی بالای جدول ─── */
    .dk-table .summary-row td {
      font-weight: 700;
      font-size: 11.5px;
    }

    /* کل پس‌انداز فعلی */
    .dk-table .summary-row.savings-total {
      background: #F5EFFF;
    }
    .dk-table .summary-row.savings-total td {
      color: #7457D9;
      border-top: 2px solid #D9C9E9;
      border-bottom: 1px solid #D9C9E9;
      font-size: 12px;
    }

    /* مجموع واریز */
    .dk-table .summary-row.deposit {
      background: #E8F8F1;
    }
    .dk-table .summary-row.deposit td {
      color: #16A56A;
      border-bottom: 1px solid #B8E7C4;
    }

    /* مجموع برداشت */
    .dk-table .summary-row.withdraw {
      background: #FFF4E5;
    }
    .dk-table .summary-row.withdraw td {
      color: #D97706;
      border-bottom: 1px solid #FCD9A0;
    }

    .dk-table .summary-row .summary-amount {
      font-size: 12.5px;
      font-weight: 700;
    }

    .dk-table-empty {
      text-align: center;
      padding: 30px;
      color: #91A6BA;
      font-size: 12px;
    }

    /* ─── پاصفحه ─── */
    .dk-footer {
      margin-top: 32px;
      padding-top: 14px;
      border-top: 1px solid #EEF5F9;
      text-align: center;
      font-size: 10px;
      color: #91A6BA;
    }
  `
}

/* ─────────────────────────────────────────────
   ساخت بدنه‌ی HTML
   ───────────────────────────────────────────── */
function buildBody({ title, periodLabel, bodyContent }) {
  return `
    <div class="dk-report">
      <div class="dk-header">
        <div class="dk-header-brand">
          <div class="dk-header-logo">خ</div>
          <div>
            <div class="dk-header-name">${APP_NAME}</div>
            <div class="dk-header-sub">مدیریت معاش و خرج‌های روزانه</div>
          </div>
        </div>
        <div class="dk-header-meta">
          <div>تاریخ چاپ: ${formatFullDate(new Date())}</div>
          <div>نسخه ${toPersianDigits(APP_VERSION)}</div>
        </div>
      </div>

      <h1 class="dk-title">${title}</h1>
      ${periodLabel ? `<div class="dk-subtitle">${periodLabel}</div>` : ''}

      ${bodyContent}

      <div class="dk-footer">
        ${APP_NAME} • نسخه ${toPersianDigits(APP_VERSION)}
      </div>
    </div>
  `
}

/* ─────────────────────────────────────────────
   جدول تراکنش‌ها
   - ردیف کل پس‌انداز فعلی (بالای همه)
   - ردیف مجموع واریز
   - ردیف مجموع برداشت
   - بعد تراکنش‌های درآمد/مصرف
   ───────────────────────────────────────────── */
function buildTxTable(txs, stats, currentSavings = 0) {
  /* فیلتر: فقط درآمد و مصرف */
  const regularTxs = txs.filter(
    (tx) => tx.type === 'income' || tx.type === 'expense'
  )

  /* ردیف‌های خلاصه */
  const summaryRows = []

  /* ۱. کل پس‌انداز فعلی */
  summaryRows.push(`
    <tr class="summary-row savings-total">
      <td>کل پس‌انداز فعلی</td>
      <td>—</td>
      <td>—</td>
      <td class="summary-amount" style="text-align: right;">
        ${formatMoney(currentSavings)}
      </td>
    </tr>
  `)

  /* ۲. مجموع واریز */
  if (stats?.toSavings > 0) {
    summaryRows.push(`
      <tr class="summary-row deposit">
        <td>مجموع واریز به پس‌انداز</td>
        <td>—</td>
        <td>—</td>
        <td class="summary-amount" style="text-align: right;">
          +${formatMoney(stats.toSavings)}
        </td>
      </tr>
    `)
  }

  /* ۳. مجموع برداشت */
  if (stats?.fromSavings > 0) {
    summaryRows.push(`
      <tr class="summary-row withdraw">
        <td>مجموع برداشت از پس‌انداز</td>
        <td>—</td>
        <td>—</td>
        <td class="summary-amount" style="text-align: right;">
          −${formatMoney(stats.fromSavings)}
        </td>
      </tr>
    `)
  }

  /* ردیف‌های معمولی */
  const regularRows = regularTxs
    .map((tx) => {
      const cat = CATEGORY_MAP[tx.categoryId]
      const catName = cat?.name || txTypeLabel(tx)
      const amountClass =
        tx.type === 'income' ? 'amount-income' : 'amount-expense'
      const sign = tx.type === 'income' ? '+' : '−'

      return `
        <tr>
          <td>${catName}</td>
          <td>${tx.note || '—'}</td>
          <td>${formatFullDate(tx.date)}</td>
          <td class="${amountClass}" style="text-align: right;">${sign}${formatMoney(tx.amount)}</td>
        </tr>
      `
    })
    .join('')

  if (!regularRows && summaryRows.length === 0) {
    return `<div class="dk-table-empty">تراکنشی برای نمایش نیست</div>`
  }

  const bodyRows = [...summaryRows, ...regularRows].join('')

  return `
    <table class="dk-table">
      <thead>
        <tr>
          <th>دسته</th>
          <th>توضیحات</th>
          <th>تاریخ</th>
          <th style="text-align: right;">مبلغ (افغانی)</th>
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `
}

/* ─────────────────────────────────────────────
   گزارش دوره
   ───────────────────────────────────────────── */
export function buildPeriodReportHtml({
  txs,
  stats,
  periodLabel,
  periodTitle,
  savingsDelta = 0,
  currentWallet = 0,
  currentSavings = 0,
  filename = 'report',
}) {
  const summary = `
    <div class="dk-summary">
      <div class="dk-summary-card income">
        <div class="dk-summary-label">کل درآمد</div>
        <div class="dk-summary-value">+${formatMoney(stats.totalIncome)}</div>
      </div>
      <div class="dk-summary-card expense">
        <div class="dk-summary-label">کل مصارف</div>
        <div class="dk-summary-value">−${formatMoney(stats.totalExpense)}</div>
      </div>
      <div class="dk-summary-card savings">
        <div class="dk-summary-label">پس‌انداز دوره</div>
        <div class="dk-summary-value">
          ${savingsDelta >= 0 ? '+' : '−'}${formatMoney(Math.abs(savingsDelta))}
        </div>
      </div>
      <div class="dk-summary-card wallet">
        <div class="dk-summary-label">موجودی فعلی خزانه</div>
        <div class="dk-summary-value">${formatMoney(currentWallet)}</div>
      </div>
    </div>
  `

  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return {
    styleText: buildStyles(origin),
    bodyHtml: buildBody({
      title: periodTitle || 'گزارش مالی',
      periodLabel,
      bodyContent:
        summary + buildTxTable(txs, stats, currentSavings),
    }),
    filename,
  }
}

/* ─────────────────────────────────────────────
   گزارش پس‌انداز
   ───────────────────────────────────────────── */
export function buildSavingsReportHtml({
  transfers,
  totalIn,
  totalOut,
  currentSavings,
  filename = 'savings',
}) {
  const summary = `
    <div class="dk-summary" style="grid-template-columns: repeat(3, 1fr);">
      <div class="dk-summary-card income">
        <div class="dk-summary-label">مجموع واریز</div>
        <div class="dk-summary-value">+${formatMoney(totalIn)}</div>
      </div>
      <div class="dk-summary-card expense">
        <div class="dk-summary-label">مجموع برداشت</div>
        <div class="dk-summary-value">−${formatMoney(totalOut)}</div>
      </div>
      <div class="dk-summary-card savings">
        <div class="dk-summary-label">پس‌انداز فعلی</div>
        <div class="dk-summary-value">${formatMoney(currentSavings)}</div>
      </div>
    </div>
  `

  const rows = transfers
    .map((tx) => {
      const isDeposit = tx.subtype === 'to-savings'
      const label = isDeposit ? 'واریز' : 'برداشت'
      const sign = isDeposit ? '+' : '−'
      const cls = isDeposit ? 'amount-income' : 'amount-expense'
      return `
        <tr>
          <td>${label}</td>
          <td>${tx.note || '—'}</td>
          <td>${formatFullDate(tx.date)}</td>
          <td class="${cls}" style="text-align: right;">${sign}${formatMoney(tx.amount)}</td>
        </tr>
      `
    })
    .join('')

  const table = transfers.length
    ? `
      <table class="dk-table">
        <thead>
          <tr>
            <th>نوع</th>
            <th>توضیحات</th>
            <th>تاریخ</th>
            <th style="text-align: right;">مبلغ (افغانی)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `
    : `<div class="dk-table-empty">هنوز انتقالی ثبت نشده است</div>`

  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return {
    styleText: buildStyles(origin),
    bodyHtml: buildBody({
      title: 'گزارش پس‌انداز',
      periodLabel: null,
      bodyContent: summary + table,
    }),
    filename,
  }
}

/* ─────────────────────────────────────────────
   دانلود PDF از HTML
   ───────────────────────────────────────────── */
export async function downloadPdf({ styleText, bodyHtml, filename }) {
  if (typeof document === 'undefined') return

  const html2pdfModule = await import('html2pdf.js')
  const html2pdf = html2pdfModule.default || html2pdfModule

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-99999px'
  container.style.top = '0'
  container.style.width = '794px'
  container.style.background = '#FFFFFF'
  container.style.direction = 'rtl'

  const styleEl = document.createElement('style')
  styleEl.textContent = styleText
  container.appendChild(styleEl)

  const contentEl = document.createElement('div')
  contentEl.innerHTML = bodyHtml
  container.appendChild(contentEl)

  document.body.appendChild(container)

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
  } catch {
    /* ignore */
  }

  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const finalFilename = `${filename || 'report'}-${ts}.pdf`

  try {
    await html2pdf()
      .set({
        margin: [8, 8, 10, 8],
        filename: finalFilename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          windowWidth: 794,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.dk-summary-card', 'tr', '.summary-row'],
        },
      })
      .from(contentEl)
      .save()
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  }
}
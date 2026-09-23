import { toPersianDigits, formatMoney } from './utils'
import {
  formatFullDate,
  getYear,
  formatMonthYear,
} from './jalali'
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
   قالب HTML پایه
   ───────────────────────────────────────────── */
function buildHtmlDocument({ title, periodLabel, bodyContent }) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''

  return `<!DOCTYPE html>
<html lang="fa-AF" dir="rtl">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<link rel="preconnect" href="${origin}">
<style>
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

  body {
    font-family: 'Vazirmatn', system-ui, sans-serif;
    direction: rtl;
    color: #1A0F1F;
    background: #FFFFFF;
    padding: 24px;
    font-size: 12px;
    line-height: 1.7;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 14px;
    border-bottom: 2px solid #D81B60;
    margin-bottom: 20px;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .header-logo {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #D81B60 0%, #8E24AA 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 18px;
  }
  .header-name {
    font-size: 16px;
    font-weight: 700;
    color: #D81B60;
  }
  .header-meta {
    text-align: left;
    font-size: 10px;
    color: #9C7A88;
    line-height: 1.8;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    color: #1A0F1F;
    margin-bottom: 4px;
  }
  .subtitle {
    font-size: 13px;
    text-align: center;
    color: #6B3B54;
    margin-bottom: 20px;
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }
  .summary-card {
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #FCE4EC;
    background: #FCE4EC;
    text-align: center;
  }
  .summary-card.income {
    background: #DCFCE7;
    border-color: #DCFCE7;
  }
  .summary-card.savings {
    background: #EFE7F5;
    border-color: #EFE7F5;
  }
  .summary-label {
    font-size: 10px;
    color: #6B3B54;
    margin-bottom: 4px;
  }
  .summary-value {
    font-size: 15px;
    font-weight: 700;
    color: #1A0F1F;
  }
  .summary-card.income .summary-value { color: #16A34A; }
  .summary-card.savings .summary-value { color: #6B4C93; }
  .summary-card.expense .summary-value { color: #B91C4A; }

  .table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .table thead {
    background: #FCE4EC;
  }
  .table th {
    padding: 8px 10px;
    text-align: right;
    font-weight: 600;
    font-size: 11px;
    color: #D81B60;
    border-bottom: 2px solid #D81B60;
  }
  .table td {
    padding: 8px 10px;
    text-align: right;
    font-size: 11px;
    border-bottom: 1px solid #FCE4EC;
    color: #1A0F1F;
  }
  .table tbody tr:nth-child(even) {
    background: #FCF6F9;
  }
  .table .amount-expense { color: #B91C4A; font-weight: 600; }
  .table .amount-income { color: #16A34A; font-weight: 600; }
  .table .amount-transfer { color: #6B4C93; font-weight: 600; }

  .table-empty {
    text-align: center;
    padding: 30px;
    color: #9C7A88;
    font-size: 12px;
  }

  .footer {
    margin-top: 30px;
    padding-top: 14px;
    border-top: 1px solid #FCE4EC;
    text-align: center;
    font-size: 10px;
    color: #9C7A88;
    line-height: 1.8;
  }

  @media print {
    body { padding: 12mm; }
    .table { page-break-inside: auto; }
    .table tr { page-break-inside: avoid; page-break-after: auto; }
    .table thead { display: table-header-group; }
    @page { margin: 12mm; size: A4; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-brand">
      <div class="header-logo">خ</div>
      <div>
        <div class="header-name">${APP_NAME}</div>
        <div style="font-size: 9px; color: #9C7A88;">مدیریت معاش و خرج‌های روزانه</div>
      </div>
    </div>
    <div class="header-meta">
      <div>تاریخ چاپ: ${formatFullDate(new Date())}</div>
      <div>نسخه ${toPersianDigits(APP_VERSION)}</div>
    </div>
  </div>

  <h1 class="title">${title}</h1>
  ${periodLabel ? `<div class="subtitle">${periodLabel}</div>` : ''}

  ${bodyContent}

  <div class="footer">
    ساخته شده با ❤ در افغانستان — ${APP_NAME} نسخه ${toPersianDigits(APP_VERSION)}
  </div>
</body>
</html>`
}

/* ─────────────────────────────────────────────
   جدول تراکنش‌ها
   ───────────────────────────────────────────── */
function buildTxTable(txs) {
  if (!txs.length) {
    return `<div class="table-empty">تراکنشی برای نمایش نیست</div>`
  }

  const rows = txs
    .map((tx) => {
      const cat = CATEGORY_MAP[tx.categoryId]
      const catName = cat?.name || txTypeLabel(tx)
      const amountClass =
        tx.type === 'income'
          ? 'amount-income'
          : tx.type === 'transfer'
            ? 'amount-transfer'
            : 'amount-expense'
      const sign =
        tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''

      return `
        <tr>
          <td>${catName}</td>
          <td>${tx.note || '—'}</td>
          <td>${formatFullDate(tx.date)}</td>
          <td class="${amountClass}">${sign}${formatMoney(tx.amount)}</td>
        </tr>
      `
    })
    .join('')

  return `
    <table class="table">
      <thead>
        <tr>
          <th>دسته</th>
          <th>توضیحات</th>
          <th>تاریخ</th>
          <th>مبلغ (افغانی)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
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
}) {
  const summary = `
    <div class="summary">
      <div class="summary-card income">
        <div class="summary-label">کل درآمد</div>
        <div class="summary-value">+${formatMoney(stats.totalIncome)}</div>
      </div>
      <div class="summary-card expense">
        <div class="summary-label">کل مصارف</div>
        <div class="summary-value">−${formatMoney(stats.totalExpense)}</div>
      </div>
      <div class="summary-card savings">
        <div class="summary-label">پس‌انداز دوره</div>
        <div class="summary-value">
          ${savingsDelta >= 0 ? '+' : '−'}${formatMoney(Math.abs(savingsDelta))}
        </div>
      </div>
    </div>
  `

  return buildHtmlDocument({
    title: periodTitle || 'گزارش مالی',
    periodLabel,
    bodyContent: summary + buildTxTable(txs),
  })
}

/* ─────────────────────────────────────────────
   گزارش پس‌انداز
   ───────────────────────────────────────────── */
export function buildSavingsReportHtml({ transfers, totalIn, totalOut }) {
  const summary = `
    <div class="summary">
      <div class="summary-card savings">
        <div class="summary-label">مجموع واریز</div>
        <div class="summary-value">+${formatMoney(totalIn)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">مجموع برداشت</div>
        <div class="summary-value">−${formatMoney(totalOut)}</div>
      </div>
      <div class="summary-card income">
        <div class="summary-label">موجودی فعلی</div>
        <div class="summary-value">${formatMoney(totalIn - totalOut)}</div>
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
          <td class="${cls}">${sign}${formatMoney(tx.amount)}</td>
        </tr>
      `
    })
    .join('')

  const table = transfers.length
    ? `
      <table class="table">
        <thead>
          <tr>
            <th>نوع</th>
            <th>توضیحات</th>
            <th>تاریخ</th>
            <th>مبلغ (افغانی)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `
    : `<div class="table-empty">هنوز انتقالی ثبت نشده است</div>`

  return buildHtmlDocument({
    title: 'گزارش پس‌انداز',
    periodLabel: null,
    bodyContent: summary + table,
  })
}

/* ─────────────────────────────────────────────
   چاپ از طریق iframe
   ───────────────────────────────────────────── */
export function printHtml(html) {
  if (typeof document === 'undefined') return

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
    }, 1500)
  }

  const doc = iframe.contentDocument || iframe.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()

  const trigger = () => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (e) {
      console.error('[print]', e)
    } finally {
      cleanup()
    }
  }

  if (iframe.contentWindow.document.readyState === 'complete') {
    setTimeout(trigger, 400)
  } else {
    iframe.onload = () => setTimeout(trigger, 400)
  }
}
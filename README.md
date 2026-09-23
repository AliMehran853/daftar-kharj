# Daftar Kharj (دفتر خرج)

> A fully offline PWA for personal salary and expense management.

**Daftar Kharj** is a Progressive Web App built for a school teacher who receives a fixed monthly salary and wants to track daily expenses, monitor remaining balance, and manage savings — all without any server, any account, or any internet connection. Everything stays on the device.

---

## ✨ Features

- **100% offline** — All data lives in IndexedDB on the device. No servers, no tracking, no cloud.
- **Salary-first design** — Everything revolves around one number: the current month's remaining balance.
- **Live balance calculation** — Wallet and savings balances are computed on-the-fly from transactions (never stored).
- **Jalali (Afghan) calendar** — Full Solar Hijri support with Afghan month names (حمل، ثور، ...).
- **Persian UI with RTL** — Complete right-to-left layout using Vazirmatn font.
- **Beautiful charts** — Donut, bar, and line charts powered by ApexCharts.
- **Savings management** — Move money between wallet and savings account, with full transfer history.
- **Reports** — Daily, weekly, monthly, and yearly reports with category breakdowns.
- **PDF export** — Print-friendly reports (Save as PDF from the browser).
- **Backup & restore** — Export all data as JSON and restore from a file.
- **App lock** — 4-digit PIN (PBKDF2 + 100k iterations) and biometric (WebAuthn) authentication.
- **Dark & light mode** — Full theme support with semantic color tokens.
- **Daily reminders** — Smart 24-hour inactivity detection.
- **Greeting messages** — 180 time-based messages across 6 daily ranges (dawn, morning, noon, afternoon, evening, night).
- **Installable PWA** — Add to home screen on Android and iOS.
- **12-hour time format** — All times displayed in Persian 12-hour format.

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + Vite |
| Styling | Tailwind CSS v4 (with semantic CSS variables) |
| Database | Dexie.js (IndexedDB wrapper) |
| State | Zustand |
| Routing | React Router |
| Forms | React Hook Form + Zod |
| Charts | ApexCharts + react-apexcharts |
| Animations | Motion (Framer Motion successor) |
| Bottom Sheets | vaul |
| Icons | Lucide React |
| Jalali Dates | date-fns-jalali |
| PDF | Native `window.print()` + print CSS |
| Auth | Web Crypto API (PBKDF2) + SimpleWebAuthn |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
/**
 * دسته‌های پیش‌فرض اپ
 *
 * ─── مصرف (۶ دسته) ───
 * خرید        → همه‌ی خریدها (خوراک، لباس، لوازم)
 * کرایه       → کرایه موتر، کرایه خانه، قبض‌ها
 * صحت         → دوا، دکتر
 * تعلیم       → کتاب، قلم، فیس
 * هدیه        → عروسی، مهمانی
 * سایر        → بقیه
 *
 * ─── درآمد (۴ دسته) ───
 * معاش، کار آزاد، سود سرمایه، سایر
 */

export const DEFAULT_CATEGORIES = [
  // ─── مصرف ───
  {
    id: 'shopping',
    type: 'expense',
    name: 'خرید',
    icon: 'ShoppingBag',
    color: '#F04478',
    sortOrder: 1,
    isDefault: true,
    placeholder: 'مثلاً خرید نان، لباس، لوازم خانه',
  },
  {
    id: 'transport',
    type: 'expense',
    name: 'کرایه',
    icon: 'CarFront',
    color: '#3299E8',
    sortOrder: 2,
    isDefault: true,
    placeholder: 'مثلاً کرایه موتر، کرایه خانه، قبض برق',
  },
  {
    id: 'health',
    type: 'expense',
    name: 'صحت',
    icon: 'HeartPulse',
    color: '#F5A623',
    sortOrder: 3,
    isDefault: true,
    placeholder: 'مثلاً دوا و دکتر',
  },
  {
    id: 'education',
    type: 'expense',
    name: 'تعلیم',
    icon: 'GraduationCap',
    color: '#7457D9',
    sortOrder: 4,
    isDefault: true,
    placeholder: 'مثلاً کتاب و قلم',
  },
  {
    id: 'gift-out',
    type: 'expense',
    name: 'هدیه',
    icon: 'Gift',
    color: '#16A56A',
    sortOrder: 5,
    isDefault: true,
    placeholder: 'مثلاً هدیه عروسی یا مهمانی',
  },
  {
    id: 'other-expense',
    type: 'expense',
    name: 'سایر',
    icon: 'MoreHorizontal',
    color: '#91A6BA',
    sortOrder: 6,
    isDefault: true,
    placeholder: 'توضیح کوتاه بنویس...',
  },

  // ─── درآمد ───
  {
    id: 'salary',
    type: 'income',
    name: 'معاش',
    icon: 'Wallet',
    color: '#16A56A',
    sortOrder: 1,
    isDefault: true,
    placeholder: 'معاش ماه',
  },
  {
    id: 'freelance',
    type: 'income',
    name: 'کار آزاد',
    icon: 'Briefcase',
    color: '#22C55E',
    sortOrder: 2,
    isDefault: true,
    placeholder: 'مثلاً تدریس خصوصی',
  },
  {
    id: 'investment',
    type: 'income',
    name: 'سود سرمایه',
    icon: 'TrendingUp',
    color: '#06B6D4',
    sortOrder: 3,
    isDefault: true,
    placeholder: 'مثلاً سود تجارت',
  },
  {
    id: 'other-income',
    type: 'income',
    name: 'سایر',
    icon: 'CircleDollarSign',
    color: '#91A6BA',
    sortOrder: 4,
    isDefault: true,
    placeholder: 'توضیح کوتاه بنویس...',
  },
]

/* ─────────────────────────────────────────────
   Aliases: id های قدیمی → id های جدید
   ───────────────────────────────────────────── */
export const LEGACY_CATEGORY_MAP = {
  food: 'shopping',
  home: 'transport',
  bills: 'transport',
  'gift-in': 'other-income',
}

/* ─────────────────────────────────────────────
   CATEGORY_MAP
   ───────────────────────────────────────────── */
const baseMap = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c])
)

export const CATEGORY_MAP = {
  ...baseMap,
  // legacy aliases → دسته‌ی جدید
  food: baseMap.shopping,
  home: baseMap.transport,
  bills: baseMap.transport,
  'gift-in': baseMap['other-income'],
}

/* ─────────────────────────────────────────────
   Helper: نرمال‌سازی id قدیمی به جدید
   ───────────────────────────────────────────── */
export function normalizeCategoryId(id) {
  return LEGACY_CATEGORY_MAP[id] || id
}

/* ─────────────────────────────────────────────
   Helper: گرفتن دسته با id (قدیمی یا جدید)
   ───────────────────────────────────────────── */
export function getCategory(id) {
  return CATEGORY_MAP[id] || null
}
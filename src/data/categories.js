export const DEFAULT_CATEGORIES = [
  // ─── مصرف ───
  {
    id: 'food', type: 'expense', name: 'خوراک', icon: 'Utensils',
    color: '#F59E0B', sortOrder: 1, isDefault: true,
    placeholder: 'مثلاً نهار برنج و کباب',
  },
  {
    id: 'transport', type: 'expense', name: 'کرایه', icon: 'CarFront',
    color: '#0EA5E9', sortOrder: 2, isDefault: true,
    placeholder: 'مثلاً کرایه موتر به بازار',
  },
  {
    id: 'home', type: 'expense', name: 'خانه', icon: 'Home',
    color: '#10B981', sortOrder: 3, isDefault: true,
    placeholder: 'مثلاً کرایه ماه خانه',
  },
  {
    id: 'bills', type: 'expense', name: 'قبض‌ها', icon: 'Receipt',
    color: '#6B4C93', sortOrder: 4, isDefault: true,
    placeholder: 'مثلاً برق، آب، انترنت',
  },
  {
    id: 'shopping', type: 'expense', name: 'خرید', icon: 'ShoppingBag',
    color: '#D81B60', sortOrder: 5, isDefault: true,
    placeholder: 'مثلاً خرید لباس، لوازم خانه...',
  },
  {
    id: 'health', type: 'expense', name: 'صحت', icon: 'HeartPulse',
    color: '#B91C4A', sortOrder: 6, isDefault: true,
    placeholder: 'مثلاً دوا و دکتر',
  },
  {
    id: 'education', type: 'expense', name: 'تعلیم', icon: 'GraduationCap',
    color: '#8E24AA', sortOrder: 7, isDefault: true,
    placeholder: 'مثلاً کتاب و قلم',
  },
  {
    id: 'gift-out', type: 'expense', name: 'هدیه', icon: 'Gift',
    color: '#F06292', sortOrder: 8, isDefault: true,
    placeholder: 'مثلاً هدیه عروسی',
  },
  {
    id: 'other-expense', type: 'expense', name: 'سایر', icon: 'MoreHorizontal',
    color: '#9C7A88', sortOrder: 9, isDefault: true,
    placeholder: 'توضیح کوتاه بنویس...',
  },

  // ─── درآمد ───
  {
    id: 'salary', type: 'income', name: 'معاش', icon: 'Wallet',
    color: '#16A34A', sortOrder: 1, isDefault: true,
    placeholder: 'معاش ماه',
  },
  {
    id: 'freelance', type: 'income', name: 'کار آزاد', icon: 'Briefcase',
    color: '#22C55E', sortOrder: 2, isDefault: true,
    placeholder: 'مثلاً تدریس خصوصی',
  },
  {
    id: 'gift-in', type: 'income', name: 'هدیه', icon: 'Gift',
    color: '#84CC16', sortOrder: 3, isDefault: true,
    placeholder: 'مثلاً عیدی',
  },
  {
    id: 'investment', type: 'income', name: 'سود سرمایه', icon: 'TrendingUp',
    color: '#06B6D4', sortOrder: 4, isDefault: true,
    placeholder: 'مثلاً سود تجارت',
  },
  {
    id: 'other-income', type: 'income', name: 'سایر', icon: 'CircleDollarSign',
    color: '#10B981', sortOrder: 5, isDefault: true,
    placeholder: 'توضیح کوتاه بنویس...',
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c])
)
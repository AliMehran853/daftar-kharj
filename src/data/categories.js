export const DEFAULT_CATEGORIES = [
  // ─── مصرف ───
  {
    id: 'food', type: 'expense', name: 'خوراک', icon: 'Utensils',
    color: '#F59E0B', sortOrder: 1, isDefault: true,
    placeholder: 'مثلاً نهار برنج',
  },
  {
    id: 'transport', type: 'expense', name: 'کرایه', icon: 'CarFront',
    color: '#3B82F6', sortOrder: 2, isDefault: true,
    placeholder: 'مثلاً کرایه موتر',
  },
  {
    id: 'home', type: 'expense', name: 'خانه', icon: 'Home',
    color: '#10B981', sortOrder: 3, isDefault: true,
    placeholder: 'مثلاً کرایه خانه',
  },
  {
    id: 'bills', type: 'expense', name: 'قبض‌ها', icon: 'Receipt',
    color: '#8B5CF6', sortOrder: 4, isDefault: true,
    placeholder: 'مثلاً برق، آب',
  },
  {
    id: 'shopping', type: 'expense', name: 'خرید', icon: 'ShoppingBag',
    color: '#EC4899', sortOrder: 5, isDefault: true,
    placeholder: 'مثلاً لباس بچه‌ها',
  },
  {
    id: 'health', type: 'expense', name: 'صحت', icon: 'HeartPulse',
    color: '#EF4444', sortOrder: 6, isDefault: true,
    placeholder: 'مثلاً دوا',
  },
  {
    id: 'education', type: 'expense', name: 'تعلیم', icon: 'GraduationCap',
    color: '#06B6D4', sortOrder: 7, isDefault: true,
    placeholder: 'مثلاً کتاب، قلم',
  },
  {
    id: 'gift-out', type: 'expense', name: 'هدیه', icon: 'Gift',
    color: '#F472B6', sortOrder: 8, isDefault: true,
    placeholder: 'مثلاً عروسی',
  },
  {
    id: 'other-expense', type: 'expense', name: 'سایر', icon: 'MoreHorizontal',
    color: '#6B7280', sortOrder: 9, isDefault: true,
    placeholder: 'توضیح کوتاه...',
  },

  // ─── درآمد ───
  {
    id: 'salary', type: 'income', name: 'معاش', icon: 'Wallet',
    color: '#00B894', sortOrder: 1, isDefault: true,
    placeholder: 'معاش ماه',
  },
  {
    id: 'freelance', type: 'income', name: 'کار آزاد', icon: 'Briefcase',
    color: '#10B981', sortOrder: 2, isDefault: true,
    placeholder: 'مثلاً تدریس خصوصی',
  },
  {
    id: 'gift-in', type: 'income', name: 'هدیه', icon: 'Gift',
    color: '#F472B6', sortOrder: 3, isDefault: true,
    placeholder: 'مثلاً عیدی',
  },
  {
    id: 'investment', type: 'income', name: 'سود سرمایه', icon: 'TrendingUp',
    color: '#06B6D4', sortOrder: 4, isDefault: true,
    placeholder: 'مثلاً سود تجارت',
  },
  {
    id: 'other-income', type: 'income', name: 'سایر', icon: 'CircleDollarSign',
    color: '#6B7280', sortOrder: 5, isDefault: true,
    placeholder: 'توضیح کوتاه...',
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.id, c])
)
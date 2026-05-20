import { Category } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#22c55e',
  Transportation: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#f97316',
  Bills: '#ef4444',
  Other: '#6b7280',
};

export const CATEGORY_BG: Record<Category, string> = {
  Food: 'bg-green-100 text-green-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Shopping: 'bg-orange-100 text-orange-700',
  Bills: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-600',
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎭',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '💼',
};

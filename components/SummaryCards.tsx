'use client';

import { Expense } from '@/lib/types';
import {
  formatCurrency,
  getTotalAmount,
  getCurrentMonthExpenses,
  getCategoryTotals,
} from '@/lib/utils';
import { DollarSign, Calendar, Tag, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = getTotalAmount(expenses);
  const monthlyExpenses = getCurrentMonthExpenses(expenses);
  const monthlyTotal = getTotalAmount(monthlyExpenses);
  const categoryTotals = getCategoryTotals(expenses);
  const topCategory = categoryTotals[0];
  const avgExpense = expenses.length > 0 ? total / expenses.length : 0;

  const cards = [
    {
      label: 'Total Spent',
      value: formatCurrency(total),
      sub: `${expenses.length} total expenses`,
      icon: DollarSign,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      border: 'border-l-indigo-500',
    },
    {
      label: 'This Month',
      value: formatCurrency(monthlyTotal),
      sub: `${monthlyExpenses.length} expenses`,
      icon: Calendar,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      border: 'border-l-emerald-500',
    },
    {
      label: 'Top Category',
      value: topCategory?.category ?? 'None',
      sub: topCategory ? formatCurrency(topCategory.amount) : 'No data',
      icon: Tag,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      border: 'border-l-amber-500',
    },
    {
      label: 'Avg per Expense',
      value: formatCurrency(avgExpense),
      sub: 'per transaction',
      icon: TrendingUp,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      border: 'border-l-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${card.border}`}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="mt-1.5 text-2xl font-bold text-gray-900 truncate">{card.value}</p>
              <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
            </div>
            <div className={`shrink-0 w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center ml-3`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

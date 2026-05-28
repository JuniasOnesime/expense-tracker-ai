'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';
import { getCategoryTotals, formatCurrency } from '@/lib/utils';
import { CATEGORY_EMOJI } from '@/lib/categories';
import { Budget } from '@/lib/budgets';
import { Expense } from '@/lib/types';

function computeBudgetStreak(expenses: Expense[], budgets: Budget[], now: Date): number {
  if (budgets.length === 0) return 0;
  const totalMonthlyBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  if (totalMonthlyBudget === 0) return 0;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyBudget = totalMonthlyBudget / daysInMonth;
  let streak = 0;
  const today = now.getDate();
  for (let i = 0; i < today; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), today - i);
    const key = format(d, 'yyyy-MM-dd');
    const daySpend = expenses.filter((e) => e.date === key).reduce((s, e) => s + e.amount, 0);
    if (daySpend <= dailyBudget) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function MonthlyInsights() {
  const { expenses } = useExpenses();
  const { budgets } = useBudgets();
  const now = useMemo(() => new Date(), []);

  const monthKey = useMemo(() => format(now, 'yyyy-MM'), [now]);
  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(monthKey)),
    [expenses, monthKey],
  );
  const categoryData = useMemo(() => getCategoryTotals(monthlyExpenses), [monthlyExpenses]);
  const top3 = useMemo(() => categoryData.slice(0, 3), [categoryData]);
  const streak = useMemo(
    () => computeBudgetStreak(expenses, budgets, now),
    [expenses, budgets, now],
  );

  return (
    <div className="max-w-sm mx-auto space-y-7 pt-2">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Monthly Insights</h1>
        <div className="mt-2 border-b-2 border-dashed border-gray-300 mx-0" />
      </div>

      {/* Donut chart */}
      <div className="flex justify-center">
        {categoryData.length === 0 ? (
          <div className="w-44 h-44 rounded-full border-[18px] border-gray-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">Spending</span>
          </div>
        ) : (
          <div className="relative w-52 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="amount"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-md px-2.5 py-1 shadow-sm border border-gray-100">
                <span className="text-xs font-semibold text-gray-600">Spending</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 categories */}
      <div className="space-y-3.5 px-1">
        {top3.length === 0 ? (
          <p className="text-sm text-gray-400 text-center">No spending this month</p>
        ) : (
          <>
            {top3.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div
                  className="w-1 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: cat.fill }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {CATEGORY_EMOJI[cat.category as keyof typeof CATEGORY_EMOJI] ?? '💼'}{' '}
                  {cat.category}: {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
            <p className="text-right text-xs text-gray-400 italic pr-1">
              Top {Math.min(3, top3.length)}!
            </p>
          </>
        )}
      </div>

      {/* Budget Streak */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5">
        <p className="text-sm font-semibold text-gray-600 mb-3">Budget Streak</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold text-emerald-500 leading-none">{streak}</p>
            <p className="text-sm font-semibold text-gray-600 mt-2">days!</p>
          </div>
          <div className="w-16 h-9 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg">🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
}

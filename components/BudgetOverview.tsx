'use client';

import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, Target } from 'lucide-react';
import { BudgetStatus, computeBudgetStatuses, monthLabel } from '@/lib/budgets';
import { Budget } from '@/lib/budgets';
import { Expense } from '@/lib/types';
import { CATEGORY_EMOJI } from '@/lib/categories';
import { formatCurrency } from '@/lib/utils';

interface Props {
  budgets: Budget[];
  expenses: Expense[];
  onSetupClick: () => void;
}

// Bar colour thresholds
function barColor(status: BudgetStatus): string {
  if (status.isOverBudget) return 'bg-red-500';
  if (status.isNearLimit)  return 'bg-amber-400';
  return 'bg-indigo-500';
}

function textColor(status: BudgetStatus): string {
  if (status.isOverBudget) return 'text-red-600';
  if (status.isNearLimit)  return 'text-amber-600';
  return 'text-gray-500';
}

export function BudgetOverview({ budgets, expenses, onSetupClick }: Props) {
  // new Date() evaluated once via useMemo, not on every render
  const now = useMemo(() => new Date(), []);
  const statuses = useMemo(
    () => computeBudgetStatuses(budgets, expenses, now),
    [budgets, expenses, now],
  );
  const label = useMemo(() => monthLabel(now), [now]);

  const overBudget = statuses.filter((s) => s.isOverBudget);
  const nearLimit  = statuses.filter((s) => s.isNearLimit);

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Monthly Budgets</h2>
          <button
            onClick={onSetupClick}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            Set up budgets →
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
          <Target size={28} className="mb-2" />
          <p className="text-sm text-gray-400 font-medium">No budgets set yet</p>
          <p className="text-xs text-gray-300 mt-1">Click &quot;Set up budgets&quot; to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Monthly Budgets</h2>
          <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
        <button
          onClick={onSetupClick}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Edit →
        </button>
      </div>

      {/* Alert banners */}
      {overBudget.length > 0 && (
        <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 font-medium">
            Over budget:{' '}
            {overBudget.map((s) => `${CATEGORY_EMOJI[s.category]} ${s.category}`).join(', ')}
          </p>
        </div>
      )}
      {overBudget.length === 0 && nearLimit.length > 0 && (
        <div className="mx-5 mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <TrendingUp size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">
            Approaching limit:{' '}
            {nearLimit.map((s) => `${CATEGORY_EMOJI[s.category]} ${s.category}`).join(', ')}
          </p>
        </div>
      )}

      {/* Progress bars */}
      <div className="px-5 py-4 space-y-4">
        {statuses.map((status) => (
          <div key={status.category}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700">
                {CATEGORY_EMOJI[status.category]} {status.category}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-xs font-semibold ${textColor(status)}`}>
                  {formatCurrency(status.spent)}
                </span>
                <span className="text-xs text-gray-300">/</span>
                <span className="text-xs text-gray-400">{formatCurrency(status.monthlyLimit)}</span>
              </div>
            </div>

            {/* Track */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor(status)}`}
                style={{ width: `${status.percentage}%` }}
              />
            </div>

            {/* Sub-label */}
            <p className={`text-[11px] mt-1 ${textColor(status)}`}>
              {status.isOverBudget
                ? `${formatCurrency(status.spent - status.monthlyLimit)} over budget`
                : `${formatCurrency(status.remaining)} remaining · ${Math.round(status.rawPercentage)}%`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

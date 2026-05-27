import { format } from 'date-fns';
import { Category } from './types';
import { Expense } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Budget {
  category: Category;
  monthlyLimit: number;
}

export interface BudgetStatus {
  category: Category;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  /** 0–100, capped for progress bar display */
  percentage: number;
  /** Uncapped — may exceed 100 when over budget */
  rawPercentage: number;
  isOverBudget: boolean;
  /** True when 80 %–99 % of limit used */
  isNearLimit: boolean;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const BUDGETS_KEY = 'expense-budgets-v1';

export function getBudgets(): Budget[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? (JSON.parse(raw) as Budget[]) : [];
  } catch {
    return [];
  }
}

export function saveBudgets(budgets: Budget[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the current month as 'yyyy-MM'. Pass a fixed Date to make pure. */
export function monthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function monthLabel(date: Date): string {
  return format(date, 'MMMM yyyy');
}

// ─── Computation ──────────────────────────────────────────────────────────────

/**
 * Compute spend-vs-budget for every configured budget.
 * Accepts `now` as a parameter so callers control when `new Date()` is evaluated
 * (typically from a useMemo or event handler, never directly during render).
 */
export function computeBudgetStatuses(
  budgets: Budget[],
  expenses: Expense[],
  now: Date,
): BudgetStatus[] {
  const month = monthKey(now);
  return budgets
    .filter((b) => b.monthlyLimit > 0)
    .map((budget) => {
      const spent = expenses
        .filter((e) => e.category === budget.category && e.date.startsWith(month))
        .reduce((sum, e) => sum + e.amount, 0);
      const rawPct = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
      return {
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spent,
        remaining: Math.max(0, budget.monthlyLimit - spent),
        percentage: Math.min(rawPct, 100),
        rawPercentage: rawPct,
        isOverBudget: spent > budget.monthlyLimit,
        isNearLimit: rawPct >= 80 && rawPct < 100,
      };
    });
}

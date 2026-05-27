import { format, subMonths } from 'date-fns';
import { Expense, Category } from './types';
import { CATEGORIES } from './categories';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyTotal {
  /** e.g. "May 2026" */
  month: string;
  total: number;
  count: number;
}

export interface CategoryTrend {
  category: Category;
  thisMonth: number;
  lastMonth: number;
  /** Positive = increased spend */
  change: number;
  /** % change; 0 when both months are 0 */
  changePct: number;
}

export interface DashboardInsights {
  totalThisMonth: number;
  totalLastMonth: number;
  /** % change month-over-month; 0 when no prior-month data */
  monthChangePct: number;
  countThisMonth: number;
  avgTransactionAllTime: number;
  /** Average per calendar day so far this month */
  dailyAvgThisMonth: number;
  /** Projection based on daily average × days in month */
  projectedMonthly: number;
  biggestThisMonth: Expense | null;
  topCategoryThisMonth: { category: Category; total: number } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function keyFor(date: Date): string {
  return format(date, 'yyyy-MM');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns monthly totals for the last `count` months.
 * Pass `now` explicitly so the function stays pure / testable.
 */
export function getMonthlyTotals(expenses: Expense[], now: Date, count = 6): MonthlyTotal[] {
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(now, count - 1 - i);
    const key = keyFor(d);
    const month = format(d, 'MMM yyyy');
    const matching = expenses.filter((e) => e.date.startsWith(key));
    return {
      month,
      total: matching.reduce((s, e) => s + e.amount, 0),
      count: matching.length,
    };
  });
}

/**
 * Category spend for this month vs last month.
 * Only returns categories that have non-zero spend in either month.
 */
export function getCategoryTrends(expenses: Expense[], now: Date): CategoryTrend[] {
  const thisKey = keyFor(now);
  const lastKey = keyFor(subMonths(now, 1));

  return CATEGORIES.map((category) => {
    const thisMonth = expenses
      .filter((e) => e.category === category && e.date.startsWith(thisKey))
      .reduce((s, e) => s + e.amount, 0);
    const lastMonth = expenses
      .filter((e) => e.category === category && e.date.startsWith(lastKey))
      .reduce((s, e) => s + e.amount, 0);
    const change = thisMonth - lastMonth;
    const changePct = lastMonth > 0 ? (change / lastMonth) * 100 : thisMonth > 0 ? 100 : 0;
    return { category, thisMonth, lastMonth, change, changePct };
  }).filter((t) => t.thisMonth > 0 || t.lastMonth > 0);
}

/** Compute all insight metrics for the analytics page header cards. */
export function getDashboardInsights(expenses: Expense[], now: Date): DashboardInsights {
  const thisKey = keyFor(now);
  const lastKey = keyFor(subMonths(now, 1));

  const thisMonth = expenses.filter((e) => e.date.startsWith(thisKey));
  const lastMonth = expenses.filter((e) => e.date.startsWith(lastKey));

  const totalThisMonth = thisMonth.reduce((s, e) => s + e.amount, 0);
  const totalLastMonth = lastMonth.reduce((s, e) => s + e.amount, 0);

  const monthChangePct =
    totalLastMonth > 0
      ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
      : totalThisMonth > 0
        ? 100
        : 0;

  const avgTransactionAllTime =
    expenses.length > 0
      ? expenses.reduce((s, e) => s + e.amount, 0) / expenses.length
      : 0;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyAvgThisMonth = dayOfMonth > 0 ? totalThisMonth / dayOfMonth : 0;
  const projectedMonthly = dailyAvgThisMonth * daysInMonth;

  const biggestThisMonth =
    thisMonth.length > 0
      ? [...thisMonth].sort((a, b) => b.amount - a.amount)[0]
      : null;

  const catTotals = CATEGORIES.map((category) => ({
    category,
    total: thisMonth.filter((e) => e.category === category).reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total);

  const topCategoryThisMonth = catTotals[0]?.total > 0 ? catTotals[0] : null;

  return {
    totalThisMonth,
    totalLastMonth,
    monthChangePct,
    countThisMonth: thisMonth.length,
    avgTransactionAllTime,
    dailyAvgThisMonth,
    projectedMonthly,
    biggestThisMonth,
    topCategoryThisMonth,
  };
}

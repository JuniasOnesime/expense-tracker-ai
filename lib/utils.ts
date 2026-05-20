import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Expense, ExpenseFilter } from './types';
import { CATEGORY_COLORS } from './categories';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function filterExpenses(expenses: Expense[], filter: ExpenseFilter): Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date);

    if (filter.startDate && expenseDate < parseISO(filter.startDate)) return false;
    if (filter.endDate && expenseDate > parseISO(filter.endDate)) return false;
    if (filter.category !== 'All' && expense.category !== filter.category) return false;

    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (
        !expense.description.toLowerCase().includes(q) &&
        !expense.category.toLowerCase().includes(q)
      )
        return false;
    }

    return true;
  });
}

export function getTotalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyExpenses(
  expenses: Expense[]
): { month: string; amount: number }[] {
  const map = new Map<string, { label: string; amount: number }>();

  expenses.forEach((expense) => {
    const date = parseISO(expense.date);
    const sortKey = format(date, 'yyyy-MM');
    const label = format(date, 'MMM yyyy');
    const existing = map.get(sortKey);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      map.set(sortKey, { label, amount: expense.amount });
    }
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ month: v.label, amount: v.amount }));
}

export function getCategoryTotals(
  expenses: Expense[]
): { category: string; amount: number; percentage: number; fill: string }[] {
  const map = new Map<string, number>();
  const total = getTotalAmount(expenses);

  expenses.forEach((expense) => {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount);
  });

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? '#6b7280',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getCurrentMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  return expenses.filter((expense) =>
    isWithinInterval(parseISO(expense.date), {
      start: startOfMonth(now),
      end: endOfMonth(now),
    })
  );
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

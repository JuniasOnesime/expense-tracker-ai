'use client';

import { useMemo, useState } from 'react';
import { Expense } from '@/lib/types';
import { filterExpenses, getTotalAmount, formatCurrency, exportToCSV } from '@/lib/utils';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseFilters, FilterState } from './ExpenseFilters';
import { Download, ReceiptText } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    startDate: '',
    endDate: '',
  });

  const filtered = useMemo(() => {
    return filterExpenses(expenses, {
      search: filters.search,
      category: filters.category,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filters]);

  const total = getTotalAmount(filtered);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <ExpenseFilters filters={filters} onChange={setFilters} />
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <span className="text-sm font-semibold text-gray-900">
              {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
            </span>
            <span className="ml-2 text-sm text-gray-400">
              · Total: <span className="font-semibold text-gray-700">{formatCurrency(total)}</span>
            </span>
          </div>
          <button
            onClick={() => exportToCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <ReceiptText size={40} className="mb-3" />
            <p className="text-sm font-medium text-gray-400">No expenses found</p>
            <p className="text-xs text-gray-300 mt-1">
              {expenses.length === 0
                ? 'Add your first expense above'
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

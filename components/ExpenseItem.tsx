'use client';

import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_BG, CATEGORY_EMOJI } from '@/lib/categories';
import { Edit2, Trash2 } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  function handleDelete() {
    if (confirm('Delete this expense?')) {
      onDelete(expense.id);
    }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
      {/* Category icon */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-base">
        {CATEGORY_EMOJI[expense.category]}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BG[expense.category]}`}>
            {expense.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <p className="text-sm font-bold text-gray-900 tabular-nums">
          {formatCurrency(expense.amount)}
        </p>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

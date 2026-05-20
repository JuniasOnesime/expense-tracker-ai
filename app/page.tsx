'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { SummaryCards } from '@/components/SummaryCards';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseItem } from '@/components/ExpenseItem';
import { ExportModal } from '@/components/ExportModal';
import { Expense } from '@/lib/types';

const SpendingChart = dynamic(
  () => import('@/components/SpendingChart').then((m) => m.SpendingChart),
  { ssr: false }
);
const CategoryPieChart = dynamic(
  () => import('@/components/CategoryPieChart').then((m) => m.CategoryPieChart),
  { ssr: false }
);

export default function DashboardPage() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  function handleSubmit(data: Omit<Expense, 'id' | 'createdAt'>) {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
    setEditingExpense(undefined);
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingExpense(undefined);
  }

  const recent = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of your spending</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-white hover:shadow-sm transition-all"
          >
            <FileDown size={15} />
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards expenses={expenses} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SpendingChart expenses={expenses} />
        <CategoryPieChart expenses={expenses} />
      </div>

      {/* Recent expenses */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Expenses</h2>
          <Link
            href="/expenses"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <p className="text-4xl mb-2">💸</p>
            <p className="text-sm text-gray-400 font-medium">No expenses yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click &quot;Add Expense&quot; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={handleEdit}
                onDelete={deleteExpense}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ExpenseForm expense={editingExpense} onSubmit={handleSubmit} onClose={handleClose} />
      )}

      {showExport && (
        <ExportModal expenses={expenses} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}

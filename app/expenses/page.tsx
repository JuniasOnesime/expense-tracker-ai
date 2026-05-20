'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Expense } from '@/lib/types';

export default function ExpensesPage() {
  const { expenses, isLoaded, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [showForm, setShowForm] = useState(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage all your expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Expense
        </button>
      </div>

      <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={deleteExpense} />

      {showForm && (
        <ExpenseForm expense={editingExpense} onSubmit={handleSubmit} onClose={handleClose} />
      )}
    </div>
  );
}

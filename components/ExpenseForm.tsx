'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';

type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: ExpenseInput) => void;
  onClose: () => void;
}

interface Fields {
  amount: string;
  category: Category;
  description: string;
  date: string;
}

interface Errors {
  amount?: string;
  description?: string;
  date?: string;
}

export function ExpenseForm({ expense, onSubmit, onClose }: ExpenseFormProps) {
  const [fields, setFields] = useState<Fields>({
    amount: expense?.amount.toString() ?? '',
    category: expense?.category ?? 'Food',
    description: expense?.description ?? '',
    date: expense?.date ?? format(new Date(), 'yyyy-MM-dd'),
  });
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const e: Errors = {};
    const amt = parseFloat(fields.amount);
    if (!fields.amount || isNaN(amt) || amt <= 0) {
      e.amount = 'Enter a valid amount greater than $0';
    }
    if (!fields.description.trim()) {
      e.description = 'Description is required';
    }
    if (!fields.date) {
      e.date = 'Date is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      amount: parseFloat(parseFloat(fields.amount).toFixed(2)),
      category: fields.category,
      description: fields.description.trim(),
      date: fields.date,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={fields.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={`w-full pl-7 pr-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                  errors.amount
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={fields.category}
              onChange={(e) => set('category', e.target.value as Category)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition-shadow"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="What did you spend on?"
              value={fields.description}
              maxLength={100}
              onChange={(e) => set('description', e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                errors.description
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={fields.date}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => set('date', e.target.value)}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow ${
                errors.date
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
            >
              {expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import { getExpenses, saveExpenses } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { SEED_EXPENSES } from '@/lib/seed';

type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    // Lazy initializer runs once on mount — reads localStorage synchronously,
    // avoiding a setState-in-effect cascade. getExpenses() returns [] when
    // called server-side, so SSR/hydration is safe.
    const stored = getExpenses();
    if (stored.length === 0) {
      saveExpenses(SEED_EXPENSES);
      return SEED_EXPENSES;
    }
    return stored;
  });

  // localStorage is read synchronously in the initializer above, so the
  // expenses array is ready before the first render — no async loading phase.
  const isLoaded = true;

  function addExpense(input: ExpenseInput): Expense {
    const expense: Expense = {
      ...input,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const next = [expense, ...prev];
      saveExpenses(next);
      return next;
    });
    return expense;
  }

  function updateExpense(id: string, updates: Partial<ExpenseInput>): void {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveExpenses(next);
      return next;
    });
  }

  function deleteExpense(id: string): void {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveExpenses(next);
      return next;
    });
  }

  return { expenses, isLoaded, addExpense, updateExpense, deleteExpense };
}

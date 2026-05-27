'use client';

import { useState } from 'react';
import { Budget, getBudgets, saveBudgets } from '@/lib/budgets';
import { Category } from '@/lib/types';

export function useBudgets() {
  const [budgets, setBudgetsState] = useState<Budget[]>(() => getBudgets());

  function setBudget(category: Category, monthlyLimit: number): void {
    setBudgetsState((prev) => {
      const next = [...prev.filter((b) => b.category !== category)];
      if (monthlyLimit > 0) next.push({ category, monthlyLimit });
      saveBudgets(next);
      return next;
    });
  }

  function removeBudget(category: Category): void {
    setBudgetsState((prev) => {
      const next = prev.filter((b) => b.category !== category);
      saveBudgets(next);
      return next;
    });
  }

  return { budgets, setBudget, removeBudget };
}

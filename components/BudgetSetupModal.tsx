'use client';

import { useState } from 'react';
import { X, Target, Trash2, Check } from 'lucide-react';
import { CATEGORIES, CATEGORY_EMOJI, CATEGORY_BG } from '@/lib/categories';
import { Budget } from '@/lib/budgets';
import { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  budgets: Budget[];
  onSave: (category: Category, limit: number) => void;
  onRemove: (category: Category) => void;
  onClose: () => void;
}

export function BudgetSetupModal({ budgets, onSave, onRemove, onClose }: Props) {
  // Draft values keyed by category — initialised from current budgets
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    CATEGORIES.forEach((cat) => {
      const b = budgets.find((x) => x.category === cat);
      init[cat] = b ? String(b.monthlyLimit) : '';
    });
    return init;
  });
  const [saved, setSaved] = useState<Set<string>>(new Set());

  function handleSave(category: Category) {
    const raw = drafts[category] ?? '';
    const val = parseFloat(raw);
    if (raw === '' || isNaN(val) || val < 0) return;
    if (val === 0) {
      onRemove(category);
    } else {
      onSave(category, val);
    }
    setSaved((prev) => new Set([...prev, category]));
    setTimeout(() => setSaved((prev) => { const n = new Set(prev); n.delete(category); return n; }), 1500);
  }

  function handleRemove(category: Category) {
    setDrafts((prev) => ({ ...prev, [category]: '' }));
    onRemove(category);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Monthly Budgets</h2>
              <p className="text-xs text-gray-400">Set a spending limit per category</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {CATEGORIES.map((category) => {
            const existing = budgets.find((b) => b.category === category);
            const isSaved = saved.has(category);
            const draft = drafts[category] ?? '';

            return (
              <div key={category} className="flex items-center gap-3">
                {/* Category badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold min-w-[130px] ${CATEGORY_BG[category]}`}>
                  <span>{CATEGORY_EMOJI[category]}</span>
                  <span>{category}</span>
                </div>

                {/* Amount input */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    placeholder="No limit"
                    value={draft}
                    onChange={(e) => {
                      setDrafts((prev) => ({ ...prev, [category]: e.target.value }));
                      setSaved((prev) => { const n = new Set(prev); n.delete(category); return n; });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(category); }}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleSave(category)}
                  disabled={draft === '' || isNaN(parseFloat(draft))}
                  className={`shrink-0 p-2 rounded-lg transition-all ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-30'
                  }`}
                  title="Save"
                >
                  <Check size={15} />
                </button>
                {existing && (
                  <button
                    onClick={() => handleRemove(category)}
                    className="shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                    title="Remove budget"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400 text-center">
            Changes save instantly. Budgets reset at the start of each month.
          </p>
          <button
            onClick={onClose}
            className="mt-3 w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper used in BudgetOverview — exported to avoid re-importing formatCurrency there
export { formatCurrency };

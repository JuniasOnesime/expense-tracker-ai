'use client';

import { Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/categories';
import { Search, X } from 'lucide-react';

export interface FilterState {
  search: string;
  category: Category | 'All';
  startDate: string;
  endDate: string;
}

interface ExpenseFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  const hasActive =
    filters.search || filters.category !== 'All' || filters.startDate || filters.endDate;

  function clear() {
    onChange({ search: '', category: 'All', startDate: '', endDate: '' });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-shadow"
          />
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as Category | 'All' })
          }
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:border-gray-300 transition-shadow"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-shadow"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-shadow"
          />
        </div>

        {hasActive && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

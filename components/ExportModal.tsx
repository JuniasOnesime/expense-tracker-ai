'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { X, Download, Loader2, Table2, Braces, FileText, CheckSquare, Square } from 'lucide-react';
import { Expense, Category } from '@/lib/types';
import { CATEGORIES, CATEGORY_EMOJI } from '@/lib/categories';
import { filterExpenses, formatCurrency, formatDate } from '@/lib/utils';
import { exportAsCSV, exportAsJSON, exportAsPDF } from '@/lib/exportUtils';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  icon: React.ElementType;
  desc: string;
  badge?: string;
}[] = [
  { id: 'csv', label: 'CSV', icon: Table2, desc: 'Spreadsheet compatible' },
  { id: 'json', label: 'JSON', icon: Braces, desc: 'Developer friendly' },
  { id: 'pdf', label: 'PDF', icon: FileText, desc: 'Print ready', badge: 'Styled' },
];

export function ExportModal({ expenses, onClose }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState(`expenses-${format(new Date(), 'yyyy-MM-dd')}`);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [isExporting, setIsExporting] = useState(false);

  const filtered = useMemo(() => {
    return filterExpenses(expenses, {
      search: '',
      category: 'All',
      startDate,
      endDate,
    })
      .filter((e) => selectedCategories.has(e.category))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, startDate, endDate, selectedCategories]);

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);
  const preview = filtered.slice(0, 5);
  const allCatsSelected = selectedCategories.size === CATEGORIES.length;

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function toggleAll() {
    setSelectedCategories(allCatsSelected ? new Set() : new Set(CATEGORIES));
  }

  async function handleExport() {
    if (filtered.length === 0) return;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 500));
    const name = filename.trim() || `expenses-${format(new Date(), 'yyyy-MM-dd')}`;
    if (exportFormat === 'csv') exportAsCSV(filtered, name);
    else if (exportFormat === 'json') exportAsJSON(filtered, name);
    else await exportAsPDF(filtered, name);
    setIsExporting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Expenses</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure your export options, preview the data, then download
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Format */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Export Format
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {FORMAT_OPTIONS.map(({ id, label, icon: Icon, desc, badge }) => {
                  const active = exportFormat === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setExportFormat(id)}
                      className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                        active
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      {badge && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                          {badge}
                        </span>
                      )}
                      <Icon size={22} className={active ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className={`text-sm font-bold ${active ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {label}
                      </span>
                      <span className="text-xs text-gray-400 leading-tight">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filename */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Filename
              </p>
              <div className="flex items-stretch">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="my-expenses"
                  className="flex-1 px-3 py-2 text-sm border border-r-0 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 hover:border-gray-300 transition-shadow"
                />
                <span className="flex items-center px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-r-lg text-gray-400 font-mono">
                  .{exportFormat}
                </span>
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                Date Range <span className="normal-case font-normal text-gray-300">(leave blank for all)</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-gray-300 transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Categories
                </p>
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  {allCatsSelected ? (
                    <CheckSquare size={13} />
                  ) : (
                    <Square size={13} />
                  )}
                  {allCatsSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = selectedCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {CATEGORY_EMOJI[cat]}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Data Preview
                </p>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  filtered.length > 0
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <span>{filtered.length} records</span>
                  {filtered.length > 0 && (
                    <>
                      <span className="text-indigo-300">·</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </>
                  )}
                </div>
              </div>

              {preview.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-300">
                  <p className="text-2xl mb-1">🔍</p>
                  <p className="text-sm text-gray-400">No records match the selected filters</p>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500 whitespace-nowrap">Date</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Category</th>
                        <th className="text-right px-4 py-2.5 font-semibold text-gray-500">Amount</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-gray-500">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                            {formatDate(expense.date)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600">{expense.category}</td>
                          <td className="px-4 py-2.5 text-gray-900 font-semibold text-right tabular-nums">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 max-w-[140px] truncate">
                            {expense.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length > 5 && (
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                      … and {filtered.length - 5} more record{filtered.length - 5 !== 1 ? 's' : ''} not shown
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
          <p className="text-xs text-gray-400">
            {filtered.length === 0
              ? 'Adjust your filters to include records'
              : `${filtered.length} record${filtered.length !== 1 ? 's' : ''} will be exported as .${exportFormat}`}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0 || isExporting}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed min-w-[140px] justify-center"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download size={14} />
                  Export {filtered.length > 0 ? `${filtered.length} records` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

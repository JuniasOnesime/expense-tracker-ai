'use client';

import { Expense } from '@/lib/types';
import { getMonthlyExpenses } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SpendingChartProps {
  expenses: Expense[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-indigo-600 font-bold">${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  const data = getMonthlyExpenses(expenses);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Monthly Spending
      </h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-gray-300 text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f3ff' }} />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

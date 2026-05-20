'use client';

import { Expense } from '@/lib/types';
import { getCategoryTotals, formatCurrency } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CategoryPieChartProps {
  expenses: Expense[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-sm font-medium text-gray-700">{d.category}</p>
      <p className="font-bold" style={{ color: d.fill }}>
        {formatCurrency(d.amount)}
      </p>
      <p className="text-xs text-gray-400">{d.percentage.toFixed(1)}%</p>
    </div>
  );
}

export function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  const data = getCategoryTotals(expenses);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        By Category
      </h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-44 text-gray-300 text-sm">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

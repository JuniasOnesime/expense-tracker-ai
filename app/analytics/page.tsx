'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, BarChart2 } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { getDashboardInsights, getCategoryTrends } from '@/lib/analytics';
import { formatCurrency } from '@/lib/utils';
import { CATEGORY_EMOJI, CATEGORY_BG } from '@/lib/categories';

const SpendingChart = dynamic(
  () => import('@/components/SpendingChart').then((m) => m.SpendingChart),
  { ssr: false },
);

// ─── Small reusable cards ─────────────────────────────────────────────────────

interface InsightCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: 'green' | 'red' | 'neutral' | 'indigo';
  icon: React.ReactNode;
}

function InsightCard({ label, value, sub, accent = 'indigo', icon }: InsightCardProps) {
  const accentMap = {
    green:   'bg-emerald-50  text-emerald-600  border-emerald-100',
    red:     'bg-red-50      text-red-600      border-red-100',
    neutral: 'bg-gray-50     text-gray-500     border-gray-100',
    indigo:  'bg-indigo-50   text-indigo-600   border-indigo-100',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-3 ${accentMap[accent]}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Category trend row ───────────────────────────────────────────────────────

function TrendRow({ category, thisMonth, lastMonth, change, changePct }: ReturnType<typeof getCategoryTrends>[number]) {
  const up = change > 0;
  const flat = change === 0;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${CATEGORY_BG[category]}`}>
        {CATEGORY_EMOJI[category]} {category}
      </span>
      <div className="flex-1 min-w-0" />
      <span className="text-sm font-semibold text-gray-700 w-20 text-right">{formatCurrency(thisMonth)}</span>
      <div className={`flex items-center gap-0.5 w-16 justify-end text-xs font-semibold ${flat ? 'text-gray-400' : up ? 'text-red-500' : 'text-emerald-600'}`}>
        {flat ? <Minus size={13} /> : up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {flat ? '—' : `${up ? '+' : ''}${Math.round(changePct)}%`}
      </div>
      <span className="text-xs text-gray-400 w-20 text-right">{formatCurrency(lastMonth)}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { expenses } = useExpenses();

  // Evaluate new Date() once per render cycle, memoized
  const now = useMemo(() => new Date(), []);

  const insights = useMemo(() => getDashboardInsights(expenses, now), [expenses, now]);
  const trends   = useMemo(() => getCategoryTrends(expenses, now),    [expenses, now]);

  const monthChangeAccent =
    insights.monthChangePct > 10 ? 'red' :
    insights.monthChangePct < -5 ? 'green' : 'neutral';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-400 mt-0.5">Spending insights and trends</p>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          label="This month"
          value={formatCurrency(insights.totalThisMonth)}
          sub={`${insights.countThisMonth} transactions`}
          icon={<BarChart2 size={15} />}
          accent="indigo"
        />
        <InsightCard
          label="vs last month"
          value={`${insights.monthChangePct >= 0 ? '+' : ''}${Math.round(insights.monthChangePct)}%`}
          sub={formatCurrency(insights.totalLastMonth) + ' last month'}
          icon={insights.monthChangePct >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          accent={monthChangeAccent}
        />
        <InsightCard
          label="Daily average"
          value={formatCurrency(insights.dailyAvgThisMonth)}
          sub={`Projected: ${formatCurrency(insights.projectedMonthly)}`}
          icon={<Minus size={15} />}
          accent="neutral"
        />
        <InsightCard
          label="Avg transaction"
          value={formatCurrency(insights.avgTransactionAllTime)}
          sub="all time"
          icon={<ArrowUpRight size={15} />}
          accent="neutral"
        />
      </div>

      {/* Top category + biggest expense */}
      {(insights.topCategoryThisMonth || insights.biggestThisMonth) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.topCategoryThisMonth && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">Top category this month</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{CATEGORY_EMOJI[insights.topCategoryThisMonth.category]}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{insights.topCategoryThisMonth.category}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(insights.topCategoryThisMonth.total)}</p>
                </div>
              </div>
            </div>
          )}
          {insights.biggestThisMonth && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400 font-medium mb-1">Biggest expense this month</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{CATEGORY_EMOJI[insights.biggestThisMonth.category]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">{insights.biggestThisMonth.description}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(insights.biggestThisMonth.amount)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spending chart (reuses existing component) */}
      <SpendingChart expenses={expenses} />

      {/* Category trends table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Category Trends</h2>
          <p className="text-xs text-gray-400 mt-0.5">This month vs last month</p>
        </div>
        {trends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <p className="text-sm text-gray-400">No spending data yet</p>
          </div>
        ) : (
          <div className="px-5">
            {/* Column headers */}
            <div className="flex items-center gap-3 pt-3 pb-1">
              <span className="text-xs text-gray-400 flex-1">Category</span>
              <span className="text-xs text-gray-400 w-20 text-right">This month</span>
              <span className="text-xs text-gray-400 w-16 text-right">Change</span>
              <span className="text-xs text-gray-400 w-20 text-right">Last month</span>
            </div>
            {trends.map((t) => <TrendRow key={t.category} {...t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

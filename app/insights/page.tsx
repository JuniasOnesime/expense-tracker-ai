'use client';

import dynamic from 'next/dynamic';

const MonthlyInsights = dynamic(
  () => import('@/components/MonthlyInsights').then((m) => m.MonthlyInsights),
  { ssr: false },
);

export default function InsightsPage() {
  return <MonthlyInsights />;
}

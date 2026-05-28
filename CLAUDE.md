@AGENTS.md

# expense-tracker-ai

A fully client-side personal expense tracker built with Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and Recharts. All data persists in localStorage — no backend, no database, no auth.

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.8.1 |
| Icons | lucide-react | 1.16.0 |
| Dates | date-fns | 4.2.1 |
| Font | Geist (next/font/google) | — |

---

## Project Layout

```
app/
  layout.tsx          — root layout: Geist font, Navigation sidebar, <main> wrapper
  page.tsx            — /          Dashboard
  expenses/page.tsx   — /expenses  Full expense list + filters + CSV export
  analytics/page.tsx  — /analytics Insight cards, monthly chart, category trends
  insights/page.tsx   — /insights  MonthlyInsights (donut chart, top-3, budget streak)
  globals.css         — Tailwind base styles

components/
  Navigation.tsx      — Desktop sidebar + mobile hamburger drawer
  MonthlyInsights.tsx — Donut chart + top-3 category list + budget streak card
  SummaryCards.tsx    — 4 KPI cards (total, this month, top category, avg)
  SpendingChart.tsx   — Bar chart of monthly spend (last 6 months)
  CategoryPieChart.tsx— Donut pie chart of all-time category breakdown
  BudgetOverview.tsx  — Per-category monthly budget progress bars
  BudgetSetupModal.tsx— Modal to set/edit monthly budgets per category
  ExpenseForm.tsx     — Add / edit expense modal
  ExpenseList.tsx     — Filterable expense list
  ExpenseItem.tsx     — Single expense row with edit/delete
  ExpenseFilters.tsx  — Search, category, date-range filter bar
  ReceiptScanner.tsx  — OCR receipt upload with multi-stage progress

lib/
  types.ts            — Category, Expense, ExpenseFilter types
  categories.ts       — CATEGORIES array, CATEGORY_COLORS, CATEGORY_BG, CATEGORY_EMOJI
  storage.ts          — getExpenses() / saveExpenses() over localStorage
  budgets.ts          — Budget type, getBudgets/saveBudgets, computeBudgetStatuses
  analytics.ts        — getMonthlyTotals, getCategoryTrends, getDashboardInsights
  utils.ts            — formatCurrency, formatDate, getCategoryTotals, filterExpenses, exportToCSV
  seed.ts             — SEED_EXPENSES loaded on first visit (20 sample expenses)
  receiptOcr.ts       — OcrResult, ScanStage types + OCR logic

hooks/
  useExpenses.ts      — CRUD over expenses with localStorage sync
  useBudgets.ts       — CRUD over budgets with localStorage sync
  useReceiptScan.ts   — Receipt scanning state machine
```

---

## Data Model

```typescript
type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

interface Expense {
  id: string;          // Date.now().toString(36) + random
  amount: number;
  category: Category;
  description: string;
  date: string;        // YYYY-MM-DD — always this format in storage
  createdAt: string;   // ISO 8601
}

interface Budget {
  category: Category;
  monthlyLimit: number;
}
```

localStorage keys:
- `expense-tracker-v1` — `Expense[]`
- `expense-budgets-v1` — `Budget[]`

On first load, if no expenses exist, `SEED_EXPENSES` is written (20 entries across 3 months).

---

## Category Constants

Always import from `@/lib/categories`, never hard-code colors or emojis.

```typescript
CATEGORY_COLORS: Record<Category, string>  // hex — used for Recharts Cell fill
CATEGORY_BG:     Record<Category, string>  // Tailwind classes — used for badge chips
CATEGORY_EMOJI:  Record<Category, string>  // used in lists and trend rows
```

Colors: Food `#22c55e` · Transportation `#3b82f6` · Entertainment `#a855f7` · Shopping `#f97316` · Bills `#ef4444` · Other `#6b7280`

---

## State & Hooks

Both hooks initialize synchronously from localStorage (no `useEffect` loading phase):

```typescript
const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
const { budgets, setBudget, removeBudget } = useBudgets();
```

`useExpenses` seeds on first call. Neither hook has an async loading state — `isLoaded` on `useExpenses` is always `true`.

---

## Key Patterns

### Every page that uses hooks or charts MUST be a Client Component

```typescript
'use client';  // ← required at the top of all page files in this project
```

All four pages (Dashboard, Expenses, Analytics, Insights) are `'use client'`. The root layout is the only Server Component.

### Dynamic imports with `ssr: false` require `'use client'`

Next.js 16 throws at build time if `{ ssr: false }` is used inside a Server Component:

```
`ssr: false` is not allowed with `next/dynamic` in Server Components.
Please move it into a Client Component.
```

Fix: ensure the file using `dynamic(…, { ssr: false })` has `'use client'` at the top. Every page that imports a chart component does this.

```typescript
'use client';

import dynamic from 'next/dynamic';

const SpendingChart = dynamic(
  () => import('@/components/SpendingChart').then((m) => m.SpendingChart),
  { ssr: false },
);
```

### `new Date()` is always memoized

Never call `new Date()` directly during render — it creates a new value every render and breaks memoized comparisons. Always:

```typescript
const now = useMemo(() => new Date(), []);
```

Pass `now` explicitly to every analytics/budget helper that accepts it (`getDashboardInsights`, `getCategoryTrends`, `computeBudgetStatuses`, etc.).

### Chart components must be client-only

`SpendingChart`, `CategoryPieChart`, and the `PieChart` inside `MonthlyInsights` all use Recharts, which requires the DOM. Import them with `dynamic` + `ssr: false` from page files. The component files themselves carry `'use client'`.

### Modal pattern

Modals (ExpenseForm, BudgetSetupModal) use a `fixed inset-0` overlay with a backdrop. State is always lifted to the page — the modal receives `onClose` and `onSubmit` props and renders nothing when the parent doesn't mount it.

---

## Navigation

`components/Navigation.tsx` owns the sidebar (desktop) and hamburger drawer (mobile).

Adding a new route: add one object to the `navItems` array, import the icon from `lucide-react`.

```typescript
const navItems = [
  { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses',  label: 'Expenses',  icon: Receipt },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/insights',  label: 'Insights',  icon: Lightbulb },
];
```

---

## Analytics Helpers

All live in `lib/analytics.ts`. They are pure functions — pass `now: Date` explicitly.

| Function | Returns |
|---|---|
| `getMonthlyTotals(expenses, now, count?)` | Last N months of totals + counts |
| `getCategoryTrends(expenses, now)` | This month vs last month per category |
| `getDashboardInsights(expenses, now)` | Full set of KPIs (total, MoM %, daily avg, biggest, top category) |

---

## Budget Streak (MonthlyInsights)

Computed in `MonthlyInsights.tsx`, not in `lib/`. The algorithm:

1. Sum all configured monthly budget limits → `totalMonthlyBudget`
2. `dailyBudget = totalMonthlyBudget / daysInMonth`
3. Walk backwards from today (up to the 1st of the month), counting consecutive days where total daily spend ≤ `dailyBudget`
4. Returns `0` if no budgets are configured

Budget streak is only meaningful after the user sets at least one budget via "Set Budgets" on the Dashboard.

---

## Styling Conventions

- Tailwind CSS 4 — no `tailwind.config.js`; configured via PostCSS
- Card pattern: `bg-white rounded-xl border border-gray-100 shadow-sm p-5`
- Section header pattern: `text-sm font-semibold text-gray-700 uppercase tracking-wide`
- Accent colors: indigo-600 for primary actions, emerald-500 for positive/streak numbers, red-500 for over-budget
- No external component library (no shadcn, no MUI)
- Responsive: `flex-col lg:flex-row`, `grid-cols-1 lg:grid-cols-2`, mobile-first

---

## Adding a New Screen — Checklist

1. Create `app/<route>/page.tsx` — must start with `'use client'`
2. Dynamic-import any Recharts component with `{ ssr: false }`
3. Memoize `new Date()` with `useMemo(() => new Date(), [])`
4. Add a `{ href, label, icon }` entry to `navItems` in `Navigation.tsx`
5. Use `useExpenses()` and/or `useBudgets()` for data — no prop drilling from layout
6. Follow the card/section-header styling patterns above

---

## Known Gotchas

| Symptom | Cause | Fix |
|---|---|---|
| 500: `` `ssr: false` is not allowed … `` | `dynamic()` with `ssr: false` used in a Server Component | Add `'use client'` to the page file |
| Charts invisible on first screenshot / headless render | Recharts needs ~3–4 s after hydration to paint SVG | Not a bug — add adequate wait time in automation; real browsers are instant |
| Budget Streak shows 0 | No budgets configured | User must set budgets on Dashboard first |
| Seed data shows stale dates | `SEED_EXPENSES` dates are hardcoded to 2026-05 | Update `lib/seed.ts` dates when testing month-sensitive features |

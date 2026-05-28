---
description: Scaffold a new page + component following the expense-tracker-ai conventions
argument-hint: <screen-name e.g. "spending-goals">
---

# new-screen: $ARGUMENTS

Scaffold a complete new screen named **$ARGUMENTS** following the conventions in CLAUDE.md.

## Step 1 — Derive names

From `$ARGUMENTS` compute:

- **route** — lowercase, hyphenated (`spending-goals` → `/spending-goals`)
- **ComponentName** — PascalCase (`spending-goals` → `SpendingGoals`)
- **Nav label** — Title Case (`spending-goals` → `Spending Goals`)
- **Icon** — pick the most fitting icon from lucide-react for the label (e.g. Target, PieChart, Wallet, CalendarDays, TrendingUp, Lightbulb, BookOpen, Star)

## Step 2 — Create the component file

Create `components/<ComponentName>.tsx`:

```typescript
'use client';

import { useMemo } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgets } from '@/hooks/useBudgets';

export function <ComponentName>() {
  const { expenses } = useExpenses();
  const { budgets }  = useBudgets();
  const now = useMemo(() => new Date(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900"><Nav label></h1>
        <p className="text-sm text-gray-400 mt-0.5"><!-- one-line subtitle --></p>
      </div>
      {/* TODO: implement */}
    </div>
  );
}
```

Rules to enforce:
- `'use client'` must be the very first line
- `now` via `useMemo(() => new Date(), [])` — never inline `new Date()` in render
- Use `useExpenses()` / `useBudgets()` directly — no prop drilling from the layout
- If the component will use a Recharts chart, stub out a `dynamic` import for it inside this file and note it for Step 3

## Step 3 — Create the page file

Create `app/<route>/page.tsx`:

```typescript
'use client';

import dynamic from 'next/dynamic';

const <ComponentName> = dynamic(
  () => import('@/components/<ComponentName>').then((m) => m.<ComponentName>),
  { ssr: false },
);

export default function <ComponentName>Page() {
  return <<ComponentName> />;
}
```

**Critical:** `'use client'` MUST be the very first line. Next.js 16 throws a build error if
`{ ssr: false }` appears inside a Server Component:

```
`ssr: false` is not allowed with `next/dynamic` in Server Components.
Please move it into a Client Component.
```

Always use `dynamic` + `{ ssr: false }` — all components in this project use client hooks
and/or Recharts.

## Step 4 — Wire up navigation

Open `components/Navigation.tsx`.

1. Import the chosen icon from `lucide-react` in the existing import line.
2. Add one entry to `navItems`:

```typescript
{ href: '/<route>', label: '<Nav label>', icon: <Icon> },
```

Place it after the last existing entry.

## Step 5 — Verify

Check each of the following before reporting done:

- [ ] `components/<ComponentName>.tsx` exists and starts with `'use client'`
- [ ] `app/<route>/page.tsx` exists, starts with `'use client'`, uses `dynamic` + `{ ssr: false }`
- [ ] `Navigation.tsx` has the new `navItems` entry and the icon is imported
- [ ] No obvious TypeScript errors (wrong import paths, missing types)

## Step 6 — Report

Tell the user:
- The three files created / modified with their paths
- The URL to visit: `http://localhost:3000/<route>` (or `:3001` if the port was shifted)
- What to implement next inside the component's `TODO` placeholder

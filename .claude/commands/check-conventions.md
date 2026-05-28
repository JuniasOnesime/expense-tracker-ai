---
description: Audit the codebase for violations of the expense-tracker-ai coding conventions
---

# check-conventions

Audit `app/`, `components/`, `lib/`, and `hooks/` for violations of the conventions
documented in CLAUDE.md. Every check targets a real class of bug that has caused
problems in this project.

---

## Check 1 — Missing `'use client'` on page files (ERROR)

Scan every file matching `app/**/page.tsx`.

Flag any that do NOT have `'use client'` as the very first non-blank line.

Why it matters: Next.js 16 throws a build-time 500 if `dynamic(…, { ssr: false })` or
any React hook is used inside a Server Component. All pages in this project use hooks
and/or Recharts, so every page must be a Client Component.

---

## Check 2 — `new Date()` called outside `useMemo` (WARN)

Scan all `.tsx` files in `app/` and `components/`.

Flag any call to `new Date()` that appears directly in a component body or JSX expression
and is NOT wrapped in `useMemo(() => new Date(), [])`.

Why it matters: an inline `new Date()` creates a new object on every render, defeating
memoization and causing downstream `useMemo` dependencies (analytics, budget helpers) to
recompute on every keystroke or state change.

Acceptable patterns (do NOT flag):
- `useMemo(() => new Date(), [])`
- `new Date(someString)` parsing a stored date string — that is date-fns territory, not the time source

---

## Check 3 — Hardcoded category colors or emojis (WARN)

Scan all `.tsx` and `.ts` files in `app/` and `components/`.

Flag any hardcoded value that belongs in `lib/categories.ts`:

Colors to look for:
`#22c55e`, `#3b82f6`, `#a855f7`, `#f97316`, `#ef4444`, `#6b7280`

Emojis to look for:
`🍔`, `🚗`, `🎭`, `🛍️`, `📄`, `💼`

Exceptions — do NOT flag:
- Occurrences inside `lib/categories.ts` itself (that is the source of truth)
- Comments or documentation strings

Why it matters: if a category color changes in `CATEGORY_COLORS`, hardcoded copies
silently go out of sync. Always import from `@/lib/categories`.

---

## Check 4 — `dynamic()` import missing `{ ssr: false }` (WARN)

Scan all `.tsx` files in `app/` and `components/`.

Flag any call to `dynamic(` that does NOT have `ssr: false` in its options object.

Why it matters: every component in this project uses localStorage hooks or Recharts,
neither of which works during server-side rendering. A `dynamic()` without `ssr: false`
may silently succeed in dev but crash or hydration-mismatch in production.

---

## Check 5 — Recharts imported directly without `'use client'` (ERROR)

Scan all `.tsx` and `.ts` files for `from 'recharts'`.

For each match, check whether the same file has `'use client'` at the top.

Flag any file that imports from `recharts` without `'use client'`.

Why it matters: Recharts uses browser DOM APIs that do not exist in Node.js. Importing
it in a Server Component causes an immediate runtime crash.

---

## Check 6 — localStorage accessed outside the storage layer (WARN)

Scan all `.tsx` and `.ts` files in `app/`, `components/`, and `hooks/`.

Flag any direct call to `localStorage.getItem` or `localStorage.setItem` that does NOT
live inside `lib/storage.ts` or `lib/budgets.ts`.

Why it matters: localStorage access must be guarded with `typeof window !== 'undefined'`
for SSR safety. The storage layer already handles this. Bypassing it in components or
hooks is brittle.

---

## Report format

For each check, output:

**Check N — <name>** `PASSED` / `N issue(s) found`

If issues were found, list them as a table:

| File | Line | Issue |
|---|---|---|
| `components/Foo.tsx` | 12 | `new Date()` called outside useMemo |

After all checks, print a one-line summary:

```
Summary: X error(s), Y warning(s) — see above.
```

or

```
Summary: All 6 checks passed. No violations found.
```

For every ERROR, suggest the exact one-line fix inline below the table row.

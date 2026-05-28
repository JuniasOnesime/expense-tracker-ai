---
description: Rewrite lib/seed.ts so expense dates align with the current and previous two months
argument-hint: [YYYY-MM, defaults to today's month]
---

# refresh-seed

Rewrite `lib/seed.ts` so all seed expense dates fall within the current month and the
two preceding months. This fixes the Known Gotcha in CLAUDE.md: seed dates are hardcoded
and go stale, causing month-sensitive features (Monthly Insights, Analytics, Budget Streak,
category trends) to show empty or incorrect data.

## Step 1 — Determine the base month

If `$ARGUMENTS` is provided and matches the format `YYYY-MM`, use it as the base month.
Otherwise read today's real date from the system (do NOT use any hardcoded date).

Compute three month keys:
- `thisMonth`  — the base month (YYYY-MM)
- `lastMonth`  — one month before
- `twoBack`    — two months before

## Step 2 — Read the current seed file

Read `lib/seed.ts` in full. Capture all existing expense objects. Note:
- Total number of entries
- Which categories are present
- The amount and description for each entry (both will be preserved exactly)

## Step 3 — Plan date distribution

Distribute the existing entries across the three months:
- ~40% of entries → `thisMonth` — use days between 1 and today's day-of-month (never a future date)
- ~35% of entries → `lastMonth` — spread across days 3–28
- ~25% of entries → `twoBack`   — spread across days 5–25

Space dates naturally — avoid putting multiple expenses on the exact same day unless
the descriptions make that plausible (e.g. two food entries on a grocery day is fine).

Set each `createdAt` to the same calendar date as `date` with a plausible time
(e.g. `YYYY-MM-DDT10:30:00Z`). Never set `createdAt` before `date`.

## Step 4 — Write the updated file

Overwrite `lib/seed.ts` preserving exactly:
- All `id` values (s1, s2, … must stay the same)
- All `amount` values
- All `category` values
- All `description` values
- The TypeScript import and `SEED_EXPENSES` export structure

Only change `date` and `createdAt` fields.

The file must remain valid TypeScript and must compile without errors.

## Step 5 — Confirm

After writing, read back `lib/seed.ts` and report:
- How many expenses now fall in each of the three months (thisMonth / lastMonth / twoBack)
- The full date range covered (earliest date → latest date)
- Remind the user that the app caches seed data in localStorage on first load:
  to see the new dates, either clear `localStorage` in DevTools
  (Application → Storage → Local Storage → delete `expense-tracker-v1`)
  or open the app in a private/incognito window.

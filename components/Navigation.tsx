'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Menu, X, TrendingUp, BarChart2 } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses',  label: 'Expenses',  icon: Receipt },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-indigo-950 text-white min-h-screen shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-900">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">ExpenseTracker</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-indigo-900">
          <p className="text-xs text-indigo-400">Data stored locally in your browser</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-indigo-950 text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="font-bold text-base">ExpenseTracker</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md hover:bg-indigo-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-72 bg-indigo-950 text-white flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-900">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <span className="font-bold">ExpenseTracker</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-indigo-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

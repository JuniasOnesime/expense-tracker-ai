import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'ExpenseTracker — Personal Finance',
  description: 'Track your personal expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
        <Navigation />
        <main className="flex-1 p-5 lg:p-8 min-w-0 max-w-5xl lg:max-w-none mx-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}

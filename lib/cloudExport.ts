import { Expense } from './types';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'json' | 'pdf';
export type IntegrationStatus = 'connected' | 'available' | 'coming_soon';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: string[];
  tag?: string;
  color: string;
}

export interface CloudIntegration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
  lastSync?: string;
  accentColor: string;
  bgColor: string;
}

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;
  templateName: string;
  format: string;
  recordCount: number;
  destination: string;
  sizeLabel: string;
}

export interface ActiveSchedule {
  id: string;
  templateName: string;
  frequency: string;
  destination: string;
  nextRun: string;
  enabled: boolean;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'Full dated record sorted chronologically. Ready for your accountant.',
    icon: '🧾',
    columns: ['Date', 'Category', 'Amount', 'Description'],
    tag: 'Popular',
    color: 'indigo',
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: 'Spending totals grouped by month with top category per month.',
    icon: '📅',
    columns: ['Month', 'Total Spent', 'Top Category', '# Transactions'],
    color: 'emerald',
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Breakdown by category with percentages and averages.',
    icon: '📊',
    columns: ['Category', 'Total', '% of Spend', 'Avg per Transaction', 'Count'],
    tag: 'Insightful',
    color: 'amber',
  },
  {
    id: 'budget-review',
    name: 'Budget Review',
    description: 'Month-over-month comparison to spot trends and outliers.',
    icon: '📈',
    columns: ['Category', 'This Month', 'Last Month', 'Change', '% Change'],
    tag: 'New',
    color: 'rose',
  },
];

// ─── Integrations ────────────────────────────────────────────────────────────

export const CLOUD_INTEGRATIONS: CloudIntegration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Auto-save every export to a dedicated Drive folder',
    logo: '📁',
    status: 'available',
    accentColor: '#4285F4',
    bgColor: '#EBF3FF',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Live sync — expenses appear in your spreadsheet instantly',
    logo: '📊',
    status: 'available',
    accentColor: '#34A853',
    bgColor: '#E8F5E9',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Backup exports automatically to a Dropbox folder',
    logo: '📦',
    status: 'available',
    accentColor: '#0061FF',
    bgColor: '#E8F0FF',
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Microsoft OneDrive — syncs with Office apps',
    logo: '☁️',
    status: 'available',
    accentColor: '#0078D4',
    bgColor: '#E5F1FA',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Push expenses into a Notion database automatically',
    logo: '⬛',
    status: 'coming_soon',
    accentColor: '#000000',
    bgColor: '#F5F5F5',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Sync to an Airtable base with custom field mapping',
    logo: '🟡',
    status: 'coming_soon',
    accentColor: '#FCB400',
    bgColor: '#FFF8E1',
  },
];

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_HISTORY: ExportHistoryEntry[] = [
  {
    id: 'h1',
    timestamp: '2026-05-18T14:32:00Z',
    templateName: 'Tax Report',
    format: 'PDF',
    recordCount: 20,
    destination: 'Downloaded',
    sizeLabel: '42 KB',
  },
  {
    id: 'h2',
    timestamp: '2026-05-15T09:15:00Z',
    templateName: 'Monthly Summary',
    format: 'CSV',
    recordCount: 12,
    destination: 'juniasonesime@gmail.com',
    sizeLabel: '3 KB',
  },
  {
    id: 'h3',
    timestamp: '2026-05-01T08:00:00Z',
    templateName: 'Category Analysis',
    format: 'JSON',
    recordCount: 20,
    destination: 'Google Drive',
    sizeLabel: '8 KB',
  },
  {
    id: 'h4',
    timestamp: '2026-04-30T20:11:00Z',
    templateName: 'Budget Review',
    format: 'PDF',
    recordCount: 15,
    destination: 'Shared link',
    sizeLabel: '35 KB',
  },
  {
    id: 'h5',
    timestamp: '2026-04-01T07:00:00Z',
    templateName: 'Tax Report',
    format: 'CSV',
    recordCount: 8,
    destination: 'Dropbox',
    sizeLabel: '2 KB',
  },
];

export const SEED_SCHEDULES: ActiveSchedule[] = [
  {
    id: 'sc1',
    templateName: 'Monthly Summary',
    frequency: 'Monthly',
    destination: 'juniasonesime@gmail.com',
    nextRun: '2026-06-01T08:00:00Z',
    enabled: true,
  },
  {
    id: 'sc2',
    templateName: 'Tax Report',
    frequency: 'Quarterly',
    destination: 'Google Drive',
    nextRun: '2026-07-01T08:00:00Z',
    enabled: false,
  },
];

// ─── Export generators ────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildCSV(expenses: Expense[]): string {
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  return [['Date', 'Category', 'Amount', 'Description'].join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCSV(expenses: Expense[], filename: string) {
  triggerDownload(new Blob([buildCSV(expenses)], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

export function downloadJSON(expenses: Expense[], filename: string) {
  const data = expenses.map(({ date, category, amount, description }) => ({
    date, category, amount, description,
  }));
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `${filename}.json`
  );
}

export async function downloadPDF(expenses: Expense[], filename: string, templateName: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(templateName, 14, 17);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated ${format(new Date(), 'MMMM d, yyyy')} · ${expenses.length} records · ${formatCurrency(total)}`, 14, 26);
  doc.text('ExpenseTracker · Personal Finance', 14, 33);

  autoTable(doc, {
    startY: 48,
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: expenses.map((e) => [
      format(new Date(e.date + 'T00:00:00'), 'MMM d, yyyy'),
      e.category,
      formatCurrency(e.amount),
      e.description,
    ]),
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${filename}.pdf`);
}

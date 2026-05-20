import { format } from 'date-fns';
import { Expense } from './types';
import { formatCurrency } from './utils';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

export function exportAsJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  download(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `${filename}.json`
  );
}

export async function exportAsPDF(expenses: Expense[], filename: string): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF();
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const generatedOn = format(new Date(), 'MMMM d, yyyy');

  // Header block
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Report', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${generatedOn}`, 14, 24);
  doc.text(
    `${expenses.length} record${expenses.length !== 1 ? 's' : ''}  ·  Total: ${formatCurrency(total)}`,
    14,
    30
  );

  // Table
  autoTable(doc, {
    startY: 44,
    head: [['Date', 'Category', 'Amount', 'Description']],
    body: expenses.map((e) => [
      format(new Date(e.date + 'T00:00:00'), 'MMM d, yyyy'),
      e.category,
      formatCurrency(e.amount),
      e.description,
    ]),
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } })
        .internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 8,
        { align: 'center' }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

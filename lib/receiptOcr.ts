import { Category } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OcrResult {
  amount: number | null;
  description: string;
  /** YYYY-MM-DD or null if not detected */
  date: string | null;
  category: Category | null;
  /** 0–1 confidence score */
  confidence: number;
}

export type ScanStage =
  | 'idle'
  | 'reading'       // FileReader loading the image
  | 'detecting'     // OCR engine warming up / detecting text regions
  | 'extracting'    // Parsing fields from detected text
  | 'done';

// ─── Simulated OCR ────────────────────────────────────────────────────────────
//
// In production this would call Tesseract.js (client-side) or a cloud
// Vision API. The simulation produces plausible results with realistic
// multi-stage progress so the full UI flow can be developed and tested
// without an OCR backend.

const DEMO_RECEIPTS: OcrResult[] = [
  { amount: 24.50,  description: 'Starbucks Coffee',      date: null, category: 'Food',           confidence: 0.94 },
  { amount: 156.80, description: 'Whole Foods Market',    date: null, category: 'Food',           confidence: 0.91 },
  { amount: 45.00,  description: 'Uber Trip',             date: null, category: 'Transportation', confidence: 0.88 },
  { amount: 12.99,  description: 'Spotify Premium',       date: null, category: 'Entertainment',  confidence: 0.96 },
  { amount: 234.50, description: 'Amazon Purchase',       date: null, category: 'Shopping',       confidence: 0.85 },
  { amount: 120.00, description: 'Electric Bill — May',   date: null, category: 'Bills',          confidence: 0.92 },
  { amount: 38.75,  description: 'Thai Garden Restaurant',date: null, category: 'Food',           confidence: 0.89 },
  { amount: 67.20,  description: 'Shell Gas Station',     date: null, category: 'Transportation', confidence: 0.93 },
];

/** Called from an event handler (never during render). */
export async function extractReceiptData(
  _file: File,
  onStageChange: (stage: ScanStage) => void,
): Promise<OcrResult> {
  onStageChange('reading');
  await delay(600);

  onStageChange('detecting');
  await delay(900 + jitter(400));

  onStageChange('extracting');
  await delay(700 + jitter(300));

  onStageChange('done');

  // Pick a demo result and attach today's date
  const base = DEMO_RECEIPTS[Math.floor(Math.random() * DEMO_RECEIPTS.length)];
  return {
    ...base,
    date: todayString(),
  };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Math.random() is called only from async event-handler context, not render. */
function jitter(maxMs: number): number {
  return Math.random() * maxMs;
}

function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

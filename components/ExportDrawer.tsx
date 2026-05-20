'use client';

import { useState, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import QRCode from 'react-qr-code';
import {
  X, FileText, Send, Calendar, Cloud, History,
  Check, Copy, RefreshCw, Loader2, Mail, Link2,
  Play, Pause, Plus, ChevronRight, Zap, BarChart3,
  Download, Clock, Globe,
} from 'lucide-react';
import { Expense } from '@/lib/types';
import {
  EXPORT_TEMPLATES, CLOUD_INTEGRATIONS, SEED_HISTORY, SEED_SCHEDULES,
  ExportHistoryEntry, ActiveSchedule, ExportTemplate, ExportFormat,
  downloadCSV, downloadJSON, downloadPDF,
} from '@/lib/cloudExport';
import { formatCurrency, getTotalAmount } from '@/lib/utils';

type Tab = 'templates' | 'send' | 'schedule' | 'integrations' | 'history';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'send', label: 'Send & Share', icon: Send },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'integrations', label: 'Integrations', icon: Cloud },
  { id: 'history', label: 'History', icon: History },
];

const TEMPLATE_ACCENT: Record<string, string> = {
  indigo: 'border-indigo-200 bg-indigo-50 ring-indigo-300',
  emerald: 'border-emerald-200 bg-emerald-50 ring-emerald-300',
  amber: 'border-amber-200 bg-amber-50 ring-amber-300',
  rose: 'border-rose-200 bg-rose-50 ring-rose-300',
};
const TEMPLATE_TAG_COLOR: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
};

// ─── Tab: Templates ───────────────────────────────────────────────────────────

function TemplatesTab({ expenses }: { expenses: Expense[] }) {
  const [selected, setSelected] = useState<ExportTemplate>(EXPORT_TEMPLATES[0]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const filename = `${selected.id}-${format(new Date(), 'yyyy-MM-dd')}`;
    const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (exportFormat === 'csv') downloadCSV(sorted, filename);
    else if (exportFormat === 'json') downloadJSON(sorted, filename);
    else await downloadPDF(sorted, filename, selected.name);
    setIsGenerating(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Choose a Template
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {EXPORT_TEMPLATES.map((tpl) => {
            const active = selected.id === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setSelected(tpl)}
                className={`relative text-left p-3.5 rounded-xl border-2 transition-all ${
                  active
                    ? `${TEMPLATE_ACCENT[tpl.color]} ring-2 ring-offset-1`
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                {tpl.tag && (
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TEMPLATE_TAG_COLOR[tpl.color]}`}>
                    {tpl.tag}
                  </span>
                )}
                <p className="text-xl mb-1">{tpl.icon}</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{tpl.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{tpl.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Columns preview */}
      <div className="bg-gray-50 rounded-xl p-3.5">
        <p className="text-xs font-semibold text-gray-500 mb-2">Columns included</p>
        <div className="flex flex-wrap gap-1.5">
          {selected.columns.map((col) => (
            <span key={col} className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-600 font-medium">
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2.5">
          {expenses.length} records · {formatCurrency(getTotalAmount(expenses))} total
        </p>
      </div>

      {/* Format + Generate */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          File Format
        </p>
        <div className="flex gap-2 mb-4">
          {(['pdf', 'csv', 'json'] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setExportFormat(fmt)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all uppercase tracking-wide ${
                exportFormat === fmt
                  ? 'border-indigo-500 bg-indigo-600 text-white'
                  : 'border-gray-100 text-gray-500 hover:border-gray-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || done}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            done
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
          }`}
        >
          {isGenerating ? (
            <><Loader2 size={15} className="animate-spin" /> Generating…</>
          ) : done ? (
            <><Check size={15} /> Downloaded!</>
          ) : (
            <><Download size={15} /> Generate {selected.name}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Send & Share ────────────────────────────────────────────────────────

function SendShareTab({ expenses }: { expenses: Expense[] }) {
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [shareLink] = useState(
    `https://expensetracker.app/share/${Math.random().toString(36).substring(2, 10)}`
  );
  const [copied, setCopied] = useState(false);
  const [sheetsState, setSheetsState] = useState<'idle' | 'connecting' | 'done'>('idle');

  async function sendEmail() {
    if (!email) return;
    setEmailState('sending');
    await new Promise((r) => setTimeout(r, 1800));
    setEmailState('sent');
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function connectSheets() {
    setSheetsState('connecting');
    await new Promise((r) => setTimeout(r, 2200));
    setSheetsState('done');
  }

  return (
    <div className="space-y-5">
      {/* Email */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Mail size={14} className="text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Email Report</p>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Send a PDF report directly to any email address.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="recipient@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailState('idle'); }}
            disabled={emailState === 'sent'}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={sendEmail}
            disabled={!email || emailState !== 'idle'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              emailState === 'sent'
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40'
            }`}
          >
            {emailState === 'sending' ? (
              <Loader2 size={13} className="animate-spin" />
            ) : emailState === 'sent' ? (
              <><Check size={13} /> Sent!</>
            ) : (
              <><Send size={13} /> Send</>
            )}
          </button>
        </div>
        {emailState === 'sent' && (
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            ✓ Report delivered to {email}
          </p>
        )}
      </div>

      {/* Share link + QR */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
            <Globe size={14} className="text-violet-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Shareable Link</p>
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-full">
            View only
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Anyone with this link can view a read-only snapshot of your expenses.
        </p>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 font-mono truncate">
            {shareLink}
          </div>
          <button
            onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 bg-white border border-gray-100 rounded-xl">
            <QRCode value={shareLink} size={80} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Scan to open</p>
            <p className="text-xs text-gray-400 leading-snug">
              Share this QR code so others can instantly open your expense report on any device.
            </p>
            <p className="text-xs text-gray-300 mt-2">Expires in 7 days</p>
          </div>
        </div>
      </div>

      {/* Google Sheets */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 size={14} className="text-green-600" />
          </div>
          <p className="text-sm font-bold text-gray-900">Google Sheets</p>
          {sheetsState === 'done' && (
            <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live sync active
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Export directly to a Google Sheet. New expenses sync automatically every 24h.
        </p>
        {sheetsState === 'done' ? (
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-800">Connected to Google Sheets</p>
              <p className="text-xs text-emerald-600">{expenses.length} rows synced · Just now</p>
            </div>
          </div>
        ) : (
          <button
            onClick={connectSheets}
            disabled={sheetsState === 'connecting'}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-green-200 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors disabled:opacity-60"
          >
            {sheetsState === 'connecting' ? (
              <><Loader2 size={14} className="animate-spin" /> Connecting to Google…</>
            ) : (
              <>📊 Open in Google Sheets</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Schedule ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [schedules, setSchedules] = useState<ActiveSchedule[]>(SEED_SCHEDULES);
  const [showNew, setShowNew] = useState(false);
  const [newFreq, setNewFreq] = useState('monthly');
  const [newTemplate, setNewTemplate] = useState('Monthly Summary');
  const [newDest, setNewDest] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleSchedule(id: string) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  async function saveSchedule() {
    if (!newDest) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    const next: ActiveSchedule = {
      id: `sc${Date.now()}`,
      templateName: newTemplate,
      frequency: newFreq.charAt(0).toUpperCase() + newFreq.slice(1),
      destination: newDest,
      nextRun: new Date(Date.now() + 86400000 * 7).toISOString(),
      enabled: true,
    };
    setSchedules((prev) => [...prev, next]);
    setShowNew(false);
    setSaving(false);
    setNewDest('');
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Active Schedules
          </p>
          <button
            onClick={() => setShowNew((v) => !v)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            <Plus size={13} /> New schedule
          </button>
        </div>

        <div className="space-y-2.5">
          {schedules.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-gray-900">{s.templateName}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      s.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {s.frequency} · {s.destination}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                    <Clock size={11} />
                    <span>Next: {format(new Date(s.nextRun), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleSchedule(s.id)}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    s.enabled
                      ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                  }`}
                  title={s.enabled ? 'Pause' : 'Resume'}
                >
                  {s.enabled ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showNew && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
          <p className="text-sm font-bold text-indigo-900">New Scheduled Export</p>

          <div>
            <label className="block text-xs text-indigo-700 font-medium mb-1">Template</label>
            <select
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {EXPORT_TEMPLATES.map((t) => (
                <option key={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-indigo-700 font-medium mb-1">Frequency</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['daily', 'weekly', 'monthly', 'quarterly'].map((f) => (
                <button
                  key={f}
                  onClick={() => setNewFreq(f)}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    newFreq === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-indigo-100 text-indigo-700 hover:border-indigo-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-indigo-700 font-medium mb-1">
              Destination (email or cloud)
            </label>
            <input
              type="text"
              placeholder="email@example.com or Google Drive"
              value={newDest}
              onChange={(e) => setNewDest(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-indigo-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={saveSchedule}
            disabled={!newDest || saving}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Zap size={14} /> Activate Schedule</>}
          </button>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-500">How scheduling works</p>
        <p>Exports run automatically at 8:00 AM on the scheduled day and are delivered to your destination within minutes.</p>
      </div>
    </div>
  );
}

// ─── Tab: Integrations ────────────────────────────────────────────────────────

function IntegrationsTab() {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  async function connect(id: string) {
    setConnecting(id);
    await new Promise((r) => setTimeout(r, 2000));
    setConnected((prev) => new Set([...prev, id]));
    setConnecting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
        <Zap size={14} className="text-indigo-600 shrink-0" />
        <p className="text-xs text-indigo-700">
          Connect a service to automatically sync or backup your expense data.
        </p>
      </div>

      <div className="space-y-2.5">
        {CLOUD_INTEGRATIONS.map((integration) => {
          const isConnected = connected.has(integration.id);
          const isConnecting = connecting === integration.id;
          const isComingSoon = integration.status === 'coming_soon';

          return (
            <div
              key={integration.id}
              className={`flex items-center gap-3.5 p-4 bg-white border rounded-xl shadow-sm transition-all ${
                isConnected ? 'border-emerald-200' : 'border-gray-100'
              }`}
            >
              {/* Logo */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: integration.bgColor }}
              >
                {integration.logo}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{integration.name}</p>
                  {isComingSoon && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 font-bold rounded-full">
                      Soon
                    </span>
                  )}
                  {isConnected && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{integration.description}</p>
              </div>

              {/* Action */}
              {!isComingSoon && (
                <button
                  onClick={() => !isConnected && connect(integration.id)}
                  disabled={isConnecting || isConnected}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60'
                  }`}
                >
                  {isConnecting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : isConnected ? (
                    <><Check size={12} /> Connected</>
                  ) : (
                    <>Connect <ChevronRight size={12} /></>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ expenses }: { expenses: Expense[] }) {
  const [history, setHistory] = useState<ExportHistoryEntry[]>(SEED_HISTORY);
  const [reExporting, setReExporting] = useState<string | null>(null);

  async function reExport(entry: ExportHistoryEntry) {
    setReExporting(entry.id);
    await new Promise((r) => setTimeout(r, 900));
    const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const filename = `${entry.templateName.toLowerCase().replace(' ', '-')}-reexport`;
    if (entry.format === 'CSV') downloadCSV(sorted, filename);
    else if (entry.format === 'JSON') downloadJSON(sorted, filename);
    else await downloadPDF(sorted, filename, entry.templateName);

    const newEntry: ExportHistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: new Date().toISOString(),
      templateName: entry.templateName,
      format: entry.format,
      recordCount: expenses.length,
      destination: 'Downloaded',
      sizeLabel: entry.sizeLabel,
    };
    setHistory((prev) => [newEntry, ...prev]);
    setReExporting(null);
  }

  const FORMAT_COLOR: Record<string, string> = {
    PDF: 'bg-rose-100 text-rose-700',
    CSV: 'bg-emerald-100 text-emerald-700',
    JSON: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {history.length} exports
        </p>
        <button
          onClick={() => setHistory([])}
          className="text-xs text-red-400 hover:text-red-500 font-medium transition-colors"
        >
          Clear history
        </button>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-300">
          <History size={32} className="mb-3" />
          <p className="text-sm text-gray-400 font-medium">No export history yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors group">
              <div className="shrink-0 w-9 h-9 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                <FileText size={15} className="text-gray-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.templateName}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${FORMAT_COLOR[entry.format] ?? 'bg-gray-100 text-gray-600'}`}>
                    {entry.format}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {entry.destination} · {entry.recordCount} records · {entry.sizeLabel}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                </p>
              </div>

              <button
                onClick={() => reExport(entry)}
                disabled={reExporting === entry.id}
                className="shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-indigo-50 text-indigo-500 transition-all disabled:opacity-50"
                title="Re-export"
              >
                {reExporting === entry.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export function ExportDrawer({ expenses, onClose }: { expenses: Expense[]; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('templates');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="relative flex flex-col w-full max-w-md bg-white shadow-2xl z-10 h-full">

        {/* Header */}
        <div className="bg-indigo-950 text-white px-5 py-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold">Export & Share</h2>
              <p className="text-xs text-indigo-300 mt-0.5">
                {expenses.length} records · {formatCurrency(getTotalAmount(expenses))}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-indigo-900 transition-colors text-indigo-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 bg-indigo-900 rounded-xl p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-white text-indigo-700'
                    : 'text-indigo-400 hover:text-indigo-200'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:block">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'templates' && <TemplatesTab expenses={expenses} />}
          {activeTab === 'send' && <SendShareTab expenses={expenses} />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'integrations' && <IntegrationsTab />}
          {activeTab === 'history' && <HistoryTab expenses={expenses} />}
        </div>
      </div>
    </div>
  );
}

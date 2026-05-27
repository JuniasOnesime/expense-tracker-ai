'use client';

import { useRef, useState } from 'react';
import { X, Upload, ScanLine, Check, RefreshCw, AlertCircle, Camera } from 'lucide-react';
import { OcrResult, ScanStage } from '@/lib/receiptOcr';
import { useReceiptScan } from '@/hooks/useReceiptScan';
import { CATEGORIES, CATEGORY_EMOJI } from '@/lib/categories';
import { Category, Expense } from '@/lib/types';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StageIndicator({ stage }: { stage: ScanStage }) {
  const steps: { key: ScanStage; label: string }[] = [
    { key: 'reading',    label: 'Loading image' },
    { key: 'detecting',  label: 'Detecting text' },
    { key: 'extracting', label: 'Extracting fields' },
    { key: 'done',       label: 'Complete' },
  ];
  const activeIdx = steps.findIndex((s) => s.key === stage);

  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isActive   = i === activeIdx;
        const isComplete = i < activeIdx || stage === 'done';
        return (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                isComplete ? 'bg-emerald-500' : isActive ? 'bg-indigo-500 animate-pulse' : 'bg-gray-200'
              }`}
            >
              {isComplete ? (
                <Check size={11} className="text-white" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`} />
              )}
            </div>
            <span
              className={`text-sm ${
                isComplete ? 'text-emerald-700 font-medium' : isActive ? 'text-indigo-700 font-semibold' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Review form ──────────────────────────────────────────────────────────────

interface ReviewFormProps {
  result: OcrResult;
  onConfirm: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
  onRescan: () => void;
}

function ReviewForm({ result, onConfirm, onRescan }: ReviewFormProps) {
  const [amount, setAmount]       = useState(result.amount != null ? String(result.amount) : '');
  const [description, setDesc]    = useState(result.description);
  const [date, setDate]           = useState(result.date ?? '');
  const [category, setCategory]   = useState<Category>(result.category ?? 'Other');

  function handleSubmit() {
    const parsed = parseFloat(amount);
    if (!parsed || !description.trim() || !date) return;
    onConfirm({ amount: parsed, description: description.trim(), date, category });
  }

  return (
    <div className="space-y-4">
      {/* Confidence badge */}
      <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
        <Check size={14} className="text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-700 font-medium">
          Fields extracted — review and confirm before adding
        </p>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full">
          {Math.round(result.confidence * 100)}% confident
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{CATEGORY_EMOJI[cat]}</span>
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onRescan}
          className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} /> Rescan
        </button>
        <button
          onClick={handleSubmit}
          disabled={!amount || !description.trim() || !date}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Check size={15} /> Add Expense
        </button>
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

interface Props {
  onAdd: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export function ReceiptScanner({ onAdd }: Props) {
  const { state, open, close, selectFile, resetScan } = useReceiptScan();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) selectFile(file);
  }

  function handleConfirm(data: Omit<Expense, 'id' | 'createdAt'>) {
    onAdd(data);
    close();
  }

  const isScanning = state.stage !== 'idle' && state.stage !== 'done';

  return (
    <>
      {/* Trigger button — rendered inline by parent */}
      <button
        onClick={open}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-sm font-medium rounded-lg hover:shadow-sm hover:border-gray-300 transition-all"
      >
        <Camera size={15} />
        Scan Receipt
      </button>

      {/* Modal */}
      {state.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <ScanLine size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Scan Receipt</h2>
                  <p className="text-xs text-gray-400">Upload a photo to auto-fill expense details</p>
                </div>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Stage: idle — drop zone */}
              {state.stage === 'idle' && !state.imageUrl && (
                <>
                  {state.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                      <AlertCircle size={14} className="shrink-0" />
                      {state.error}
                    </div>
                  )}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                  >
                    <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Upload size={24} className="text-indigo-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700">Drop a receipt photo here</p>
                      <p className="text-xs text-gray-400 mt-0.5">or click to browse · JPG, PNG, HEIC</p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}

              {/* Stage: scanning — image + progress */}
              {isScanning && (
                <div className="space-y-4">
                  {state.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={state.imageUrl}
                        alt="Receipt preview"
                        className="w-full max-h-52 object-contain"
                      />
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 mb-3">Processing receipt…</p>
                    <StageIndicator stage={state.stage} />
                  </div>
                </div>
              )}

              {/* Stage: done — review form */}
              {state.stage === 'done' && state.result && (
                <div className="space-y-4">
                  {state.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={state.imageUrl}
                        alt="Receipt preview"
                        className="w-full max-h-36 object-contain"
                      />
                    </div>
                  )}
                  <ReviewForm
                    result={state.result}
                    onConfirm={handleConfirm}
                    onRescan={resetScan}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

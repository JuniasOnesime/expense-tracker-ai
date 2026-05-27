'use client';

import { useState, useCallback } from 'react';
import { OcrResult, ScanStage, extractReceiptData } from '@/lib/receiptOcr';

export interface ReceiptScanState {
  isOpen: boolean;
  imageUrl: string | null;
  stage: ScanStage;
  result: OcrResult | null;
  error: string | null;
}

const INITIAL: ReceiptScanState = {
  isOpen: false,
  imageUrl: null,
  stage: 'idle',
  result: null,
  error: null,
};

export function useReceiptScan() {
  const [state, setState] = useState<ReceiptScanState>(INITIAL);

  const open = useCallback(() => {
    setState({ ...INITIAL, isOpen: true });
  }, []);

  const close = useCallback(() => {
    // Revoke any object URL we created to avoid memory leaks
    setState((prev) => {
      if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
      return INITIAL;
    });
  }, []);

  const selectFile = useCallback((file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setState((prev) => ({ ...prev, imageUrl, stage: 'reading', result: null, error: null }));

    extractReceiptData(file, (stage) => {
      setState((prev) => ({ ...prev, stage }));
    })
      .then((result) => {
        setState((prev) => ({ ...prev, result, stage: 'done' }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          stage: 'idle',
          error: 'Could not read the receipt. Please try a clearer photo.',
        }));
      });
  }, []);

  const resetScan = useCallback(() => {
    setState((prev) => {
      if (prev.imageUrl) URL.revokeObjectURL(prev.imageUrl);
      return { ...INITIAL, isOpen: true };
    });
  }, []);

  return { state, open, close, selectFile, resetScan };
}

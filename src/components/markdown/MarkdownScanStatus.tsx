'use client';

import React from 'react';

type StatusState = 'idle' | 'active' | 'done' | 'error';

interface MarkdownScanStatusProps {
  isCapturing: boolean;
  isScanning: boolean;
  isSummarizing: boolean;
  scanError: string | null;
  summaryError: string | null;
  scannedText: string;
  hasSummary: boolean;
  onRetry?: () => void;
}

const stateStyles: Record<StatusState, string> = {
  idle: 'border-white/10 bg-white/5 text-slate-200',
  active: 'border-sky-400/40 bg-sky-500/10 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.15)]',
  done: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100 shadow-[0_0_18px_rgba(16,185,129,0.18)]',
  error: 'border-rose-500/50 bg-rose-500/10 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
};

const stateLabels: Record<StatusState, string> = {
  idle: 'Waiting',
  active: 'In progress',
  done: 'Completed',
  error: 'Action needed',
};

const MarkdownScanStatus: React.FC<MarkdownScanStatusProps> = ({
  isCapturing,
  isScanning,
  isSummarizing,
  scanError,
  summaryError,
  scannedText,
  hasSummary,
  onRetry,
}) => {
  const captureState: StatusState = scanError
    ? 'error'
    : isCapturing
      ? 'active'
      : scannedText
        ? 'done'
        : 'idle';

  const ocrState: StatusState = scanError
    ? 'error'
    : isScanning
      ? 'active'
      : scannedText
        ? 'done'
        : 'idle';

  const summaryState: StatusState = summaryError
    ? 'error'
    : isSummarizing
      ? 'active'
      : hasSummary
        ? 'done'
        : scannedText
          ? 'idle'
          : 'idle';

  const statuses = [
    {
      key: 'capture',
      icon: '📸',
      title: 'Capture View',
      state: captureState,
      description:
        captureState === 'active'
          ? 'Taking a high-fidelity snapshot of your note.'
          : captureState === 'done'
            ? 'Snapshot captured successfully.'
            : captureState === 'error'
              ? 'We could not capture the page. Try again.'
              : 'Ready to capture your current view.',
    },
    {
      key: 'ocr',
      icon: '🔍',
      title: 'Extract Text',
      state: ocrState,
      description:
        ocrState === 'active'
          ? 'Detecting and cleaning the text from the snapshot.'
          : ocrState === 'done'
            ? 'Text detected successfully.'
            : ocrState === 'error'
              ? 'Text detection failed. Capture again to retry.'
              : 'Waiting for a snapshot before extracting text.',
    },
    {
      key: 'summary',
      icon: '✨',
      title: 'Summarize & Chat',
      state: summaryState,
      description:
        summaryState === 'active'
          ? 'Generating an elegant summary for your captured note.'
          : summaryState === 'done'
            ? 'Summary ready. Start chatting with the assistant.'
            : summaryState === 'error'
              ? 'Unable to summarise the captured text. Retry to continue.'
              : 'Awaiting extracted text before generating a summary.',
    },
  ];

  const showRetry = Boolean((scanError || summaryError) && onRetry);

  return (
    <div className="space-y-2">
      {statuses.map((status) => (
        <div
          key={status.key}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur ${stateStyles[status.state]}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/30 text-lg">
            {status.icon}
          </span>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-wide text-white/90">{status.title}</p>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                {stateLabels[status.state]}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-white/70">
              {status.description}
            </p>
          </div>
        </div>
      ))}

      {showRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-100 transition-transform duration-200 hover:scale-[1.02] hover:border-rose-300/60"
        >
          <span className="h-2 w-2 animate-ping rounded-full bg-rose-300"></span>
          Retry processing
        </button>
      )}
    </div>
  );
};

export default MarkdownScanStatus;



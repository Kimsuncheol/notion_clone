'use client';

import DocumentScannerTwoToneIcon from '@mui/icons-material/DocumentScannerTwoTone';
import html2canvas from 'html2canvas';
import { useCallback, useEffect, useRef, useState } from 'react';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { createWorker, type Worker } from 'tesseract.js';
import 'katex/dist/katex.min.css';
import { db } from '@/constants/firebase';
import ScreenCaptureChatRoom from '../markdown/ScreenCaptureChatRoom';

const FALLBACK_RGB_COLOR = 'rgb(128, 128, 128)';
const UNSUPPORTED_COLOR_FUNCTION_PATTERN = /(oklch|oklab)\([^)]*\)/gi;
const TRANSPARENT_PIXEL_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const PROPERTIES_TO_OVERRIDE: string[] = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
];

const TEXT_AREA_ID = 'react-markdown-container';
const SUMMARY_ENDPOINT = 'http://127.0.0.1:8000/summarize';

const containsUnsupportedColor = (value: string | null | undefined): value is string => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.includes('oklch(') || lower.includes('oklab(');
};

const replaceUnsupportedColorWithRgb = (value: string): string => {
  UNSUPPORTED_COLOR_FUNCTION_PATTERN.lastIndex = 0;
  return value.replace(UNSUPPORTED_COLOR_FUNCTION_PATTERN, FALLBACK_RGB_COLOR);
};

const sanitizeStyleDeclaration = (style: CSSStyleDeclaration) => {
  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    const currentValue = style.getPropertyValue(property);
    if (!containsUnsupportedColor(currentValue)) {
      continue;
    }

    const priority = style.getPropertyPriority(property);
    style.setProperty(property, replaceUnsupportedColorWithRgb(currentValue), priority);
  }
};

const sanitizeCssRule = (rule: CSSRule) => {
  if (typeof CSSStyleRule !== 'undefined' && rule instanceof CSSStyleRule) {
    sanitizeStyleDeclaration(rule.style);
    return;
  }

  if (typeof CSSGroupingRule !== 'undefined' && rule instanceof CSSGroupingRule) {
    Array.from(rule.cssRules).forEach(sanitizeCssRule);
    return;
  }

  if (typeof CSSKeyframesRule !== 'undefined' && rule instanceof CSSKeyframesRule) {
    Array.from(rule.cssRules).forEach((keyframeRule) => {
      if (typeof CSSKeyframeRule !== 'undefined' && keyframeRule instanceof CSSKeyframeRule) {
        sanitizeStyleDeclaration(keyframeRule.style);
      }
    });
  }
};

const prepareClonedDocumentForCapture = (clonedDoc: Document) => {
  clonedDoc
    .querySelectorAll<HTMLElement>('[style]')
    .forEach((element) => sanitizeStyleDeclaration(element.style));

  clonedDoc.querySelectorAll('style').forEach((styleElement) => {
    const text = styleElement.textContent ?? '';
    if (!containsUnsupportedColor(text)) {
      return;
    }
    styleElement.textContent = replaceUnsupportedColorWithRgb(text);
  });

  Array.from(clonedDoc.styleSheets).forEach((styleSheet) => {
    try {
      const rules = styleSheet.cssRules;
      if (!rules) return;
      Array.from(rules).forEach(sanitizeCssRule);
    } catch (error) {
      console.warn('Unable to sanitize stylesheet for capture:', error);
    }
  });

  const view = clonedDoc.defaultView;
  let allowedOrigin = '';
  if (view?.location?.origin) {
    allowedOrigin = view.location.origin.toLowerCase();
  } else if (clonedDoc.baseURI) {
    try {
      allowedOrigin = new URL(clonedDoc.baseURI).origin.toLowerCase();
    } catch {
      allowedOrigin = '';
    }
  } else if (typeof window !== 'undefined') {
    allowedOrigin = window.location.origin.toLowerCase();
  }

  if (view) {
    clonedDoc.querySelectorAll<HTMLElement>('*').forEach((element) => {
      const computed = view.getComputedStyle(element);

      PROPERTIES_TO_OVERRIDE.forEach((property) => {
        const rawValue = computed.getPropertyValue(property);
        const value = typeof rawValue === 'string' ? rawValue : '';

        if (containsUnsupportedColor(value)) {
          element.style.setProperty(property, replaceUnsupportedColorWithRgb(value), 'important');
          return;
        }

        const lowerCasedValue = String(value).toLowerCase();
        const hasHttpUrl = lowerCasedValue.includes('http://') || lowerCasedValue.includes('https://');
        if (
          property === 'background-image' &&
          lowerCasedValue.includes('url(') &&
          !lowerCasedValue.includes('data:') &&
          hasHttpUrl &&
          (allowedOrigin ? !lowerCasedValue.includes(allowedOrigin) : true)
        ) {
          element.style.setProperty(property, 'none', 'important');
        }
      });

      Array.from(computed)
        .filter((property) => property.startsWith('--'))
        .forEach((property) => {
          const value = computed.getPropertyValue(property);
          if (containsUnsupportedColor(value)) {
            element.style.setProperty(property, replaceUnsupportedColorWithRgb(value), 'important');
          }
        });
    });
  }

  const referenceUrl = view?.location?.href || clonedDoc.baseURI || (typeof window !== 'undefined' ? window.location.href : '');

  clonedDoc.querySelectorAll('img').forEach((imageElement) => {
    if (!(imageElement instanceof HTMLImageElement)) {
      return;
    }

    const originalSrc = imageElement.getAttribute('src');
    if (!originalSrc || originalSrc.startsWith('data:')) {
      return;
    }

    let isSameOrigin = false;
    try {
      const resolved = new URL(originalSrc, referenceUrl);
      const resolvedOrigin = resolved.origin.toLowerCase();
      isSameOrigin = allowedOrigin ? resolvedOrigin === allowedOrigin : true;
    } catch {
      isSameOrigin = false;
    }

    if (!isSameOrigin) {
      imageElement.src = TRANSPARENT_PIXEL_DATA_URL;
      return;
    }

    imageElement.crossOrigin = 'anonymous';
    imageElement.setAttribute('crossorigin', 'anonymous');
    imageElement.referrerPolicy = 'no-referrer';
    imageElement.setAttribute('referrerpolicy', 'no-referrer');
  });
};

interface ScreenCaptureToolProps {
  noteId: string;
}

const ScreenCaptureTool: React.FC<ScreenCaptureToolProps> = ({ noteId }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [, setScanError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [expectedQuestions, setExpectedQuestions] = useState<string[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const [triggerY, setTriggerY] = useState<number>(() => (typeof window !== 'undefined' ? window.innerHeight / 2 : 0));
  const [isDraggingTrigger, setIsDraggingTrigger] = useState(false);
  const dragOffsetRef = useRef(0);
  const dragMovedRef = useRef(false);
  const previousUserSelectRef = useRef<string>('');
  const hasInitialisedTriggerRef = useRef(false);

  const clearChatHistory = useCallback(async () => {
    if (!noteId) {
      return;
    }

    try {
      const messagesRef = collection(db, 'chat', noteId, 'messages');
      const snapshot = await getDocs(messagesRef);
      if (snapshot.empty) {
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      await batch.commit();
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }, [noteId]);

  // const hasSummary = summary.trim().length > 0;

  const captureButtonRef = useRef<HTMLSpanElement>(null);

  const isBusy = isCapturing || isScanning || isSummarizing;

  const clampTriggerY = useCallback((value: number) => {
    if (typeof window === 'undefined') {
      return value;
    }

    const buttonHeight = triggerButtonRef.current?.offsetHeight ?? 0;
    const maxY = Math.max(0, window.innerHeight - buttonHeight);
    const clamped = Math.min(Math.max(value, 0), maxY);
    return Number.isNaN(clamped) ? 0 : clamped;
  }, []);

  const handleTriggerMouseMove = useCallback((event: MouseEvent) => {
    event.preventDefault();
    const nextPosition = clampTriggerY(event.clientY - dragOffsetRef.current);

    setTriggerY((prev) => {
      if (!dragMovedRef.current && Math.abs(prev - nextPosition) > 1) {
        dragMovedRef.current = true;
      }
      return nextPosition;
    });
  }, [clampTriggerY]);

  const handleTriggerMouseUp = useCallback(() => {
    setIsDraggingTrigger(false);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleTriggerMouseMove);
      window.removeEventListener('mouseup', handleTriggerMouseUp);
      document.body.style.userSelect = previousUserSelectRef.current;
    }
  }, [handleTriggerMouseMove]);

  const handleTriggerMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isBusy || typeof window === 'undefined') {
      return;
    }

    event.preventDefault();
    setIsDraggingTrigger(true);
    dragMovedRef.current = false;

    const clampedCurrent = clampTriggerY(triggerY);
    setTriggerY(clampedCurrent);
    dragOffsetRef.current = event.clientY - clampedCurrent;

    previousUserSelectRef.current = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleTriggerMouseMove);
    window.addEventListener('mouseup', handleTriggerMouseUp);
  }, [clampTriggerY, handleTriggerMouseMove, handleTriggerMouseUp, isBusy, triggerY]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasInitialisedTriggerRef.current) {
      return;
    }

    const buttonHeight = triggerButtonRef.current?.offsetHeight ?? 0;
    setTriggerY(clampTriggerY(window.innerHeight / 2 - buttonHeight / 2));
    hasInitialisedTriggerRef.current = true;
  }, [clampTriggerY]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => { };
    }

    const handleResize = () => {
      setTriggerY((prev) => clampTriggerY(prev));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleTriggerMouseMove);
      window.removeEventListener('mouseup', handleTriggerMouseUp);
    };
  }, [clampTriggerY, handleTriggerMouseMove, handleTriggerMouseUp]);

  const getWorker = useCallback(async () => {
    if (!workerRef.current) {
      workerRef.current = await createWorker('eng');
    }
    return workerRef.current;
  }, []);

  const handleScanClick = useCallback(async () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    if (isCapturing || isScanning || isSummarizing) {
      return;
    }
    if (typeof document === 'undefined') {
      return;
    }

    setScanError(null);
    setSummaryError(null);
    setScannedText('');
    setSummary('');
    setExpectedQuestions([]);
    setCapturedImage(null);
    setShowModal(true);

    const textAreaElement = document.getElementById(TEXT_AREA_ID) as HTMLElement | null;
    if (!textAreaElement) {
      setScanError('Preview not available for scanning.');
      return;
    }

    setIsCapturing(true);

    try {
      const canvas = await html2canvas(textAreaElement, {
        backgroundColor: null,
        useCORS: true,
        allowTaint: false,
        imageTimeout: 15000,
        logging: false,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        onclone: prepareClonedDocumentForCapture,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);
    } catch (error) {
      console.error('Text capture failed', error);
      setScanError('Unable to capture the preview for scanning.');
      setShowModal(true);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isScanning, isSummarizing]);

  const handleRetry = useCallback(() => {
    if (isCapturing || isScanning) {
      return;
    }

    if (!scannedText) {
      handleScanClick();
      return;
    }

    const lastText = scannedText;
    setSummary('');
    setSummaryError(null);
    setIsSummarizing(false);
    setExpectedQuestions([]);
    setScannedText('');

    requestAnimationFrame(() => {
      setScannedText(lastText);
    });
  }, [handleScanClick, isCapturing, isScanning, scannedText]);

  useEffect(() => {
    if (!capturedImage) {
      return;
    }

    let cancelled = false;

    const scanImage = async () => {
      setIsScanning(true);
      setScanError(null);

      try {
        const worker = await getWorker();
        const result = await worker.recognize(capturedImage);
        if (!cancelled) {
          setScannedText(result.data.text.trim());
        }
      } catch (error) {
        console.error('Text scanning failed', error);
        if (!cancelled) {
          setScanError('Unable to scan text from image.');
          setScannedText('');
        }
      } finally {
        if (!cancelled) {
          setIsScanning(false);
        }
      }
    };

    scanImage();

    return () => {
      cancelled = true;
    };
  }, [capturedImage, getWorker]);

  useEffect(() => {
    if (!scannedText) {
      setSummary('');
      setSummaryError(null);
      setIsSummarizing(false);
      setExpectedQuestions([]);
      return;
    }

    let cancelled = false;

    const requestSummary = async () => {
      setIsSummarizing(true);
      setSummaryError(null);

      try {
        const response = await fetch(SUMMARY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Don't touch the below line
          body: JSON.stringify({ content: scannedText.trim() }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API Response:', data);
        console.log('Response type:', typeof data);
        console.log('Response keys:', Object.keys(data || {}));

        // Try multiple possible field names for summary
        const summaryText = typeof data === 'string'
          ? data
          : (data?.summary || data?.text || data?.content || data?.response);

        // Try multiple possible field names for questions
        const questions = Array.isArray(data?.expected_questions)
          ? data.expected_questions
          : Array.isArray(data?.expectedQuestions)
            ? data.expectedQuestions
            : Array.isArray(data?.questions)
              ? data.questions
              : [];

        console.log('Extracted summary:', summaryText);
        console.log('Extracted questions:', questions);

        if (!cancelled) {
          if (typeof summaryText === 'string' && summaryText.trim()) {
            setSummary(summaryText.trim());
            setExpectedQuestions(questions.filter((q: unknown): q is string => typeof q === 'string' && q.trim().length > 0));
          } else {
            setSummary('');
            setExpectedQuestions([]);
            setSummaryError('No summary returned from server.');
          }
        }
      } catch (error) {
        console.error('Summary request failed', error);
        if (!cancelled) {
          setSummary('');
          setExpectedQuestions([]);
          setSummaryError('Unable to generate summary.');
        }
      } finally {
        if (!cancelled) {
          setIsSummarizing(false);
        }
      }
    };

    requestSummary();

    return () => {
      cancelled = true;
    };
  }, [scannedText]);

  useEffect(() => {
    return () => {
      const worker = workerRef.current;
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePageExit = () => {
      void clearChatHistory();
    };

    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('pagehide', handlePageExit);

    return () => {
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('pagehide', handlePageExit);
      void clearChatHistory();
    };
  }, [clearChatHistory]);

  const handleCloseModal = useCallback(() => {
    if (isBusy) {
      return;
    }
    setShowModal(false);
  }, [isBusy]);

  return (
    <>
      <button
        type="button"
        ref={triggerButtonRef}
        onClick={handleScanClick}
        onMouseDown={handleTriggerMouseDown}
        disabled={isBusy}
        className={`group fixed right-0 z-[1100] transition-transform duration-300 hover:translate-x-1 disabled:cursor-not-allowed ${isDraggingTrigger ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ top: triggerY }}
        aria-label="Open screen capture studio"
      >
        <div className="absolute inset-0l bg-gradient-to-r from-sky-500/40 via-blue-500/30 to-emerald-400/40 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative flex items-center gap-3">
          <span
            className="relative h-10 w-10 hover:w-15 transition-all duration-300 rounded-l-full bg-gradient-to-br from-sky-500 to-indigo-500 p-2 shadow-lg ring-1 ring-white/20 group-hover:scale-110"
            ref={captureButtonRef}>
            <DocumentScannerTwoToneIcon
              sx={{
                fontSize: 22,
                position: 'absolute',
                left: `9px`,
                top: '9px'
              }} />
          </span>
        </div>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[1200] bg-slate-950/80 backdrop-blur-xl"
          onClick={handleCloseModal}
        >
          <div className="flex h-full w-full items-center justify-center px-6 py-10">
            <div
              className="relative flex h-[640px] w-[540px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/80 to-slate-950 shadow-[0_40px_80px_-35px_rgba(15,23,42,0.85)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.15),transparent_60%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-slate-400">Session</p>
                    <h2 className="text-xl font-semibold text-white">AI Strategy Lounge</h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 uppercase tracking-[0.3em] text-emerald-200">
                      Live
                    </span>
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="relative flex flex-1 flex-col overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_70%)]" />
                  <div className="relative flex-1 overflow-hidden px-8 pb-6 pt-4">
                    <ScreenCaptureChatRoom
                      noteId={noteId}
                      summary={summary}
                      summaryError={summaryError}
                      isSummarizing={isSummarizing}
                      expectedQuestions={expectedQuestions}
                      onRetry={handleRetry}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default ScreenCaptureTool;

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import DocumentScannerTwoToneIcon from '@mui/icons-material/DocumentScannerTwoTone';
import html2canvas from 'html2canvas';
import { createWorker, type Worker } from 'tesseract.js';

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

const ScreenCaptureTool = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const modalSideLength = 500;

  const getWorker = useCallback(async () => {
    if (!workerRef.current) {
      workerRef.current = await createWorker('eng');
    }
    return workerRef.current;
  }, []);

  const handleScanClick = useCallback(async () => {
    if (isCapturing || isScanning) {
      return;
    }
    if (typeof document === 'undefined') {
      return;
    }

    setScanError(null);
    setScannedText('');
    setCapturedImage(null);
    setShowModal(false);

    const textAreaElement = document.getElementById(TEXT_AREA_ID) as HTMLElement | null;
    if (!textAreaElement) {
      setScanError('Preview not available for scanning.');
      setShowModal(true);
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
      setShowModal(true);
    } catch (error) {
      console.error('Text capture failed', error);
      setScanError('Unable to capture the preview for scanning.');
      setShowModal(true);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isScanning]);

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

  useEffect(() => (
    () => {
      const worker = workerRef.current;
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    }
  ), []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const isBusy = isCapturing || isScanning;

  return (
    <>
      <button
        type="button"
        onClick={handleScanClick}
        disabled={isBusy}
        className="fixed right-0 top-1/2 z-[1100] flex -translate-y-1/2 items-center gap-2 rounded-l-full border border-blue-400 bg-white py-2 px-3 text-blue-500 shadow-lg hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Scan text from preview"
      >
        <DocumentScannerTwoToneIcon fontSize="small" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4"
          onClick={handleCloseModal}
        >
          <div
            className={`relative flex h-[${modalSideLength}px] w-[${modalSideLength}px] flex-col overflow-hidden rounded-lg border border-blue-400 bg-white`}
            onClick={(event) => event.stopPropagation()}
          >
            {capturedImage ? (
              <div className="relative flex-1 w-full">
                <Image
                  src={capturedImage}
                  alt="Captured preview"
                  fill
                  unoptimized
                  style={{ objectFit: 'contain' }}
                  sizes="400px"
                />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-blue-50 text-sm text-blue-600">
                Preview unavailable.
              </div>
            )}
            <div className="w-full h-fit border-t border-blue-100 bg-white px-3 py-2 text-xs text-gray-700">
              {isScanning ? (
                <p className="italic text-gray-500">Scanning text…</p>
              ) : scanError ? (
                <p className="text-red-500">{scanError}</p>
              ) : scannedText ? (
                <p className="whitespace-pre-wrap break-all break-words text-balance">{scannedText}</p>
              ) : (
                <p className="italic text-gray-500">No text detected.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScreenCaptureTool;

'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

interface DrawingCanvasHandle {
  exportData: () => string | null;
  clearCanvas: () => void;
  syncSize: () => void;
}

interface DrawingCanvasProps {
  data: string | null;
  brushSize: number;
  brushColor: string;
  tool: 'pen' | 'eraser';
  onDirty: () => void;
}

const svgToCursorUrl = (svg: string, hotspotX: number, hotspotY: number) => {
  const trimmedSvg = svg.replace(/\s+/g, ' ').trim();
  return `url("data:image/svg+xml,${encodeURIComponent(trimmedSvg)}") ${hotspotX} ${hotspotY}, crosshair`;
};

const createPenCursor = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
      <path fill="${color}" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
      <path fill="${color}" d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/>
    </svg>
  `;
  return svgToCursorUrl(svg, 2, 28);
};

const ERASER_CURSOR_URL = svgToCursorUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
    <path fill="#ffffff" d="M16.24 3.56a1.996 1.996 0 0 0-2.82 0L2.99 13.99a2 2 0 0 0 0 2.83l3.18 3.18c.37.37.88.58 1.41.58h6.23c.53 0 1.04-.21 1.41-.59l7.07-7.07c.78-.78.78-2.05 0-2.83zm2.83 7.07-7.07 7.07H7.58l-3.18-3.18 7.07-7.07z"/>
    <path fill="#ffffff" d="m20.49 2.08-1.41 1.41 2.83 2.83 1.41-1.41z"/>
  </svg>
`, 8, 24);

const createCanvasId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `canvas-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeCanvases = (canvases?: (string | null)[]): (string | null)[] => {
  if (Array.isArray(canvases) && canvases.length > 0) {
    return canvases;
  }

  return [null];
};

type CanvasItem = {
  id: string;
  data: string | null;
};

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({
  data,
  brushSize,
  brushColor,
  tool,
  onDirty,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const latestDataRef = useRef<string | null>(data ?? null);
  const cursorStyle = useMemo(
    () => (tool === 'eraser' ? ERASER_CURSOR_URL : createPenCursor(brushColor)),
    [brushColor, tool],
  );

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const hasExistingDimensions = canvas.width > 0 && canvas.height > 0;
    const snapshot = hasExistingDimensions ? canvas.toDataURL('image/png') : latestDataRef.current;

    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setContext(ctx);

    if (snapshot) {
      const image = new Image();
      image.onload = () => {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      };
      image.src = snapshot;
    } else {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [syncCanvasSize]);

  useEffect(() => {
    latestDataRef.current = data ?? null;

    const canvas = canvasRef.current;
    if (!canvas || !context) {
      return;
    }

    if (!data) {
      context.save();
      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.save();
      context.globalCompositeOperation = 'source-over';
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.restore();
    };
    image.src = data;
  }, [context, data]);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.lineWidth = brushSize;
  }, [brushSize, context]);

  useEffect(() => {
    if (!context) {
      return;
    }

    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    context.strokeStyle = tool === 'eraser' ? '#000000' : brushColor;
  }, [brushColor, context, tool]);

  const getCoordinates = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return { offsetX: 0, offsetY: 0 };
      }

      const rect = canvas.getBoundingClientRect();

      if ('touches' in event) {
        const touch = event.touches[0];
        return {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        };
      }

      return {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
    },
    [],
  );

  const startDrawing = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!context) return;

      setIsDrawing(true);
      const { offsetX, offsetY } = getCoordinates(event);
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    },
    [context, getCoordinates],
  );

  const draw = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || !context) return;

      event.preventDefault();
      const { offsetX, offsetY } = getCoordinates(event);

      context.lineTo(offsetX, offsetY);
      context.stroke();
      onDirty();
    },
    [context, getCoordinates, isDrawing, onDirty],
  );

  const stopDrawing = useCallback(() => {
    if (!context) {
      return;
    }

    setIsDrawing(false);
    context.closePath();
  }, [context]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.save();
    context.globalCompositeOperation = 'source-over';
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();
    latestDataRef.current = null;
    onDirty();
  }, [context, onDirty]);

  const exportCanvasData = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      exportData: exportCanvasData,
      clearCanvas,
      syncSize: syncCanvasSize,
    }),
    [clearCanvas, exportCanvasData, syncCanvasSize],
  );

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="h-full w-full touch-none"
      style={{ touchAction: 'none', cursor: cursorStyle }}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

interface CanvasProps {
  handwritingId?: string;
  initialCanvases?: (string | null)[];
  onSave?: (canvases: (string | null)[]) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export default function Canvas({
  handwritingId,
  initialCanvases,
  onSave,
  onDelete,
  onDirtyChange,
  isSaving = false,
  isDeleting = false,
}: CanvasProps) {
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState('#000000');
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [isDirty, setIsDirty] = useState(false);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(() => {
    return normalizeCanvases(initialCanvases).map((data) => ({
      id: createCanvasId(),
      data,
    }));
  });
  const canvasHandlesRef = useRef<Map<string, DrawingCanvasHandle>>(new Map());

  const normalizedInitialCanvases = useMemo(
    () => normalizeCanvases(initialCanvases),
    [initialCanvases],
  );

  useEffect(() => {
    setCanvasItems(
      normalizedInitialCanvases.map((data) => ({
        id: createCanvasId(),
        data,
      })),
    );
    setIsDirty(false);
    onDirtyChange?.(false);
  }, [normalizedInitialCanvases, onDirtyChange]);

  const setCanvasHandle = useCallback((id: string, handle: DrawingCanvasHandle | null) => {
    if (!handle) {
      canvasHandlesRef.current.delete(id);
      return;
    }

    canvasHandlesRef.current.set(id, handle);
  }, []);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    onDirtyChange?.(true);
  }, [onDirtyChange]);

  const markClean = useCallback(() => {
    setIsDirty(false);
    onDirtyChange?.(false);
  }, [onDirtyChange]);

  const gatherCanvasData = useCallback((): (string | null)[] => {
    return canvasItems.map((item) => {
      const handle = canvasHandlesRef.current.get(item.id);
      return handle?.exportData() ?? null;
    });
  }, [canvasItems]);

  const isProcessing = isSaving || isDeleting;
  const isExistingHandwriting = Boolean(handwritingId);

  const handleSave = useCallback(async () => {
    if (!onSave || isProcessing) {
      return;
    }

    const canvasesToSave = gatherCanvasData();
    try {
      await onSave(canvasesToSave);
      markClean();
    } catch (error) {
      console.error('Failed to save handwriting canvas:', error);
    }
  }, [gatherCanvasData, isProcessing, markClean, onSave]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isProcessing) {
      return;
    }

    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete handwriting canvas:', error);
    }
  }, [isProcessing, onDelete]);

  const handleAddCanvas = useCallback(() => {
    setCanvasItems((prev) => {
      markDirty();
      return [
        ...prev,
        {
          id: createCanvasId(),
          data: null,
        },
      ];
    });
  }, [markDirty]);

  const handleRemoveCanvas = useCallback(
    (canvasId: string) => {
      setCanvasItems((prev) => {
        if (prev.length <= 1) {
          return prev;
        }

        const next = prev.filter((item) => item.id !== canvasId);
        if (next.length === prev.length) {
          return prev;
        }

        canvasHandlesRef.current.delete(canvasId);
        markDirty();
        return next;
      });
    },
    [markDirty],
  );

  const handleClearCanvas = useCallback((canvasId: string) => {
    const handle = canvasHandlesRef.current.get(canvasId);
    handle?.clearCanvas();
  }, []);

  const saveButtonLabel = useMemo(() => {
    if (!isExistingHandwriting) {
      return 'Save Canvas';
    }

    return isDirty ? 'Save Changes' : 'Save Canvas';
  }, [isDirty, isExistingHandwriting]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        if (onSave && !isProcessing) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, isProcessing, onSave]);

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="sticky top-4 z-20 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="brush-size" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Brush Size
            </label>
            <input
              id="brush-size"
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
              className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
            />
            <span className="min-w-[2rem] text-xs text-gray-600 dark:text-gray-400">
              {brushSize}px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="brush-color" className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Color
            </label>
            <input
              id="brush-color"
              type="color"
              value={brushColor}
              onChange={(event) => setBrushColor(event.target.value)}
              className="h-8 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tool
            </span>
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                tool === 'pen'
                  ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
              }`}
            >
              Select Pen
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                tool === 'eraser'
                  ? 'border-blue-500 bg-blue-500 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400'
              }`}
            >
              Eraser
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!onSave || isProcessing}
              className="rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 dark:border-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:border-blue-900 dark:disabled:bg-blue-900/60"
            >
              {isSaving ? 'Saving…' : saveButtonLabel}
            </button>
            {isExistingHandwriting && (
              <button
                onClick={handleDelete}
                disabled={!onDelete || isProcessing}
                className="rounded-lg border border-red-500 bg-red-50 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:border-red-200 disabled:text-red-300 dark:border-red-500/80 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20 dark:disabled:border-red-900 dark:disabled:text-red-700"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        {canvasItems.map((item, index) => {
          const isLast = index === canvasItems.length - 1;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-300 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Canvas {index + 1}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleClearCanvas(item.id)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Clear
                  </button>
                  {canvasItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveCanvas(item.id)}
                      className="rounded-lg border border-red-500 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:border-red-500/80 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div className="relative min-h-[60vh] overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
                <DrawingCanvas
                  ref={(instance) => setCanvasHandle(item.id, instance)}
                  data={item.data}
                  brushSize={brushSize}
                  brushColor={brushColor}
                  tool={tool}
                  onDirty={markDirty}
                />
              </div>
              {isLast && (
                <button
                  onClick={handleAddCanvas}
                  className="w-full self-start rounded-lg border border-dashed border-gray-300 p-4 font-medium text-gray-600 transition hover:border-blue-400 hover:text-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                >
                  + Add Canvas
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';

interface DragItem {
  type: 'image';
  file: File;
}

interface ImageContent {
  src: string | null;
  alt?: string;
  width?: number;
  height?: number;
}

interface Props {
  initialContent?: ImageContent;
  onContentChange?: (content: ImageContent) => void;
}

const ImageBlock: React.FC<Props> = ({ 
  initialContent = { src: null },
  onContentChange 
}) => {
  const [src, setSrc] = useState<string | null>(initialContent.src);
  const [alt, setAlt] = useState<string>(initialContent.alt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when content changes
  const memoizedOnContentChange = useCallback((content: ImageContent) => {
    onContentChange?.(content);
  }, [onContentChange]);

  useEffect(() => {
    const currentContent: ImageContent = { src };
    if (alt) currentContent.alt = alt;
    if (initialContent.width !== undefined) currentContent.width = initialContent.width;
    if (initialContent.height !== undefined) currentContent.height = initialContent.height;
    
    const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(initialContent);
    if (contentChanged) {
      memoizedOnContentChange(currentContent);
    }
  }, [src, alt, initialContent, memoizedOnContentChange]);

  // React DND drop handler
  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'image',
    drop: (item) => {
      handleFileUpload(item.file);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      drop(containerRef.current);
    }
  }, [drop]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsLoading(true);
    const url = URL.createObjectURL(file);
    setSrc(url);
    setAlt(file.name);
    setIsLoading(false);
  }, []);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileUpload(file);
            break;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handleFileUpload]);

  // Handle native drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!src) {
      fileInputRef.current?.click();
    }
  }, [src]);

  // Handle alt text change
  const handleAltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAlt(e.target.value);
  }, []);

  // Handle image removal
  const handleRemove = useCallback(() => {
    setSrc(null);
    setAlt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`w-full min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          isOver || isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${src ? 'border-solid' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Upload image file"
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            <span className="text-gray-500">Uploading image...</span>
          </div>
        ) : src ? (
          <div className="relative group w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={src} 
              alt={alt || "Uploaded image"} 
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🖼️</div>
            <div className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isOver || isDragOver ? 'Drop image here' : 'Add an image'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Drag & drop, paste, or click to upload
            </div>
          </div>
        )}
      </div>
      
      {src && (
        <div className="mt-3">
          <input
            type="text"
            placeholder="Add alt text (optional)"
            value={alt}
            onChange={handleAltChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
};

export default ImageBlock; 
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

  // Update parent when src changes - but only if content actually changed
  const memoizedOnContentChange = useCallback((content: ImageContent) => {
    onContentChange?.(content);
  }, [onContentChange]);

  useEffect(() => {
    const currentContent = { src, alt: initialContent.alt };
    const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(initialContent);
    if (contentChanged) {
      memoizedOnContentChange(currentContent);
    }
  }, [src, initialContent, memoizedOnContentChange]);

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: 'image',
    drop: (item) => {
      const url = URL.createObjectURL(item.file);
      setSrc(url);
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

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-[150px] flex items-center justify-center border-2 border-dashed rounded ${isOver ? 'border-blue-400 bg-blue-50' :
        'border-gray-300'}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={initialContent.alt || "Uploaded"} className="max-w-full max-h-96" />
      ) : (
        <span className="text-gray-500">Drag & Drop image here</span>
      )}
    </div>
  );
};

export default ImageBlock; 
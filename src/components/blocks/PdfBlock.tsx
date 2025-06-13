import React, { useEffect, useCallback } from 'react';

interface PdfContent {
  src: string | null;
  name?: string;
}

interface Props {
  initialContent?: PdfContent;
  onContentChange?: (content: PdfContent) => void;
}

const PdfBlock: React.FC<Props> = ({ 
  initialContent = { src: null },
  onContentChange 
}) => {
  // Report initial content to parent - but only once to avoid infinite loops
  const memoizedOnContentChange = useCallback((content: PdfContent) => {
    onContentChange?.(content);
  }, [onContentChange]);

  useEffect(() => {
    // Only call once on mount to report initial content
    memoizedOnContentChange(initialContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  return (
    <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded">
      <span className="text-gray-500">
        [PDF Viewer Placeholder - {initialContent.name || 'No file'}]
      </span>
    </div>
  );
};

export default PdfBlock; 
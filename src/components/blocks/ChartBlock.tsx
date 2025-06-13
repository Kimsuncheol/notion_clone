import React, { useEffect, useCallback } from 'react';

interface ChartContent {
  chartType?: string;
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

interface Props {
  initialContent?: ChartContent;
  onContentChange?: (content: ChartContent) => void;
}

const ChartBlock: React.FC<Props> = ({ 
  initialContent = { chartType: 'bar' },
  onContentChange 
}) => {
  // Report initial content to parent - but only once to avoid infinite loops
  const memoizedOnContentChange = useCallback((content: ChartContent) => {
    onContentChange?.(content);
  }, [onContentChange]);

  useEffect(() => {
    // Only call once on mount to report initial content
    memoizedOnContentChange(initialContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded">
      <span className="text-gray-500">[Chart Placeholder - {initialContent.chartType}]</span>
    </div>
  );
};

export default ChartBlock; 
'use client';
import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { BarChart, LineChart, PieChart, ScatterChart, Gauge } from '@mui/x-charts';
import { useEditMode } from '@/contexts/EditModeContext';
import ChartDataView from './ChartDataView';

interface ChartContent {
  chartType: string;
  data?: {
    labels?: string[];
    values?: number[];
    series?: Array<{ data: number[]; label?: string }>;
    xData?: number[];
    yData?: number[];
  };
  config?: {
    width?: number;
    height?: number;
    title?: string;
  };
}

interface Props {
  initialContent?: ChartContent;
  onContentChange?: (content: ChartContent) => void;
}

const ChartBlock: React.FC<Props> = ({ 
  initialContent = { 
    chartType: 'bar',
    data: {
      labels: ['A', 'B', 'C', 'D'],
      values: [10, 20, 15, 25]
    },
    config: {
      width: 600,
      height: 300,
      title: 'Sample Chart',
    }
  },
  onContentChange 
}) => {
  const [content, setContent] = useState<ChartContent>(initialContent);
  // viewMode can be 'chart' | 'data' | 'type'
  const [viewMode, setViewMode] = useState<'chart' | 'data' | 'type'>('chart');
  const { isEditMode } = useEditMode();

  // Label validation and deduplication
  const validateAndCleanLabels = useCallback((labels: string[], values: number[]): { labels: string[]; values: number[] } => {
    const cleanedLabels = [...labels];
    const cleanedValues = [...values];
    const seen = new Set<string>();
    
    for (let i = 0; i < cleanedLabels.length; i++) {
      const originalLabel = cleanedLabels[i].trim();
      if (originalLabel === '') {
        cleanedLabels[i] = `Label ${i + 1}`;
      }
      
      let finalLabel = cleanedLabels[i].trim();
      let counter = 1;
      
      // Generate unique label if duplicate exists
      while (seen.has(finalLabel.toLowerCase())) {
        counter++;
        finalLabel = `${originalLabel || `Label ${i + 1}`} (${counter})`;
      }
      
      cleanedLabels[i] = finalLabel;
      seen.add(finalLabel.toLowerCase());
    }
    
    return { labels: cleanedLabels, values: cleanedValues };
  }, []);

  // Check if labels have duplicates
  const hasDuplicateLabels = useMemo(() => {
    const labels = content.data?.labels || [];
    const normalizedLabels = labels.map(label => label.trim().toLowerCase()).filter(Boolean);
    return normalizedLabels.length !== new Set(normalizedLabels).size;
  }, [content.data?.labels]);

  // Manual validation function (called on explicit user action)
  const applyLabelValidation = useCallback(() => {
    if (content.data?.labels && content.data?.values) {
      const { labels, values } = validateAndCleanLabels(content.data.labels, content.data.values);
      const cleanedContent = {
        ...content,
        data: {
          ...content.data,
          labels,
          values
        }
      };
      
      // Only update if there are actual changes
      if (JSON.stringify(cleanedContent.data.labels) !== JSON.stringify(content.data.labels)) {
        setContent(cleanedContent);
      }
    }
  }, [content, validateAndCleanLabels]);

  // Report content changes to parent (without automatic validation to prevent infinite loops)
  const memoizedOnContentChange = useCallback((newContent: ChartContent) => {
    onContentChange?.(newContent);
  }, [onContentChange]);

  useEffect(() => {
    if (JSON.stringify(content) !== JSON.stringify(initialContent)) {
      memoizedOnContentChange(content);
    }
  }, [content, memoizedOnContentChange, initialContent]);

  const handleChartTypeChange = (newType: string) => {
    const newContent = { ...content, chartType: newType };
    setContent(newContent);
  };

  // Render the chart preview based on the current content
  const renderChart = () => {
    const { chartType, data, config } = content;
    const width = config?.width || 600;
    const height = config?.height || 300;

    try {
      switch (chartType) {
        case 'bar':
          return (
            <BarChart
              hideLegend={true}
              width={width}
              height={height}
              series={[{
                data: data?.values || [10, 20, 15, 25],
                label: '',
              }]}
              xAxis={[{
                data: data?.labels || ['A', 'B', 'C', 'D'],
                scaleType: 'band',
              }]}
            />
          );
        case 'line':
          return (
            <LineChart
              hideLegend={true}
              width={width}
              height={height}
              series={[{
                data: data?.values || [10, 20, 15, 25],
                label: '',
              }]}
              xAxis={[{
                data: data?.labels || ['A', 'B', 'C', 'D'],
                scaleType: 'band',
              }]}
            />
          );
        case 'pie':
          const pieData = (data?.labels || ['A', 'B', 'C', 'D']).map((label, index) => ({
            id: index,
            value: (data?.values || [10, 20, 15, 25])[index],
            label,
          }));
          return <PieChart hideLegend={true} width={width} height={height} series={[{ data: pieData }]} />;
        case 'scatter':
          return (
            <ScatterChart
              hideLegend={true}
              width={width}
              height={height}
              series={[{
                data: (data?.values || [10, 20, 15, 25]).map((val, idx) => ({ x: idx + 1, y: val, id: idx })),
                label: '',
              }]}
            />
          );
        case 'gauge':
          return <Gauge width={width} height={height} value={data?.values?.[0] || 75} valueMax={100} text="" />;
        default:
          return (
            <div className="w-full h-48 bg-gray-800 text-white flex items-center justify-center rounded">
              <span className="text-gray-500">Chart type &quot;{chartType}&quot; not supported yet</span>
            </div>
          );
      }
    } catch (err) {
      return (
        <div className="w-full h-48 bg-red-100 flex items-center justify-center rounded">
          <span className="text-red-500">Error rendering chart: {(err as Error).message}</span>
        </div>
      );
    }
  };

  // Helpers for editing table data
  const updateLabel = (idx: number, newLabel: string) => {
    const newLabels = [...(content.data?.labels || [])];
    newLabels[idx] = newLabel;
    // Only update local state - no more Redux
    setContent({ ...content, data: { ...content.data, labels: newLabels } } as ChartContent);
  };

  const updateValue = (idx: number, newVal: number) => {
    const newValues = [...(content.data?.values || [])];
    newValues[idx] = newVal;
    setContent({ ...content, data: { ...content.data, values: newValues } } as ChartContent);
  };

  const insertRow = (index: number) => {
    const labels = [...(content.data?.labels || [])];
    const values = [...(content.data?.values || [])];
    labels.splice(index, 0, `Label ${index + 1}`);
    values.splice(index, 0, 0);
    setContent({ ...content, data: { ...content.data, labels, values } } as ChartContent);
  };

  const addRowToEnd = () => insertRow((content.data?.labels || []).length);

  const deleteRow = (idx: number) => {
    const newLabels = [...(content.data?.labels || [])];
    const newValues = [...(content.data?.values || [])];
    newLabels.splice(idx, 1);
    newValues.splice(idx, 1);
    setContent({ ...content, data: { ...content.data, labels: newLabels, values: newValues } } as ChartContent);
  };

  // Menu popover state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRow, setMenuRow] = useState<number | null>(null);

  const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
    setAnchorEl(event.currentTarget);
    setMenuRow(rowIndex);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuRow(null);
  };

  const handleMenuAction = (action: 'delete' | 'above' | 'below') => {
    if (menuRow === null) return;
    if (action === 'delete') {
      deleteRow(menuRow);
    } else if (action === 'above') {
      insertRow(menuRow);
    } else if (action === 'below') {
      insertRow(menuRow + 1);
    }
    closeMenu();
  };

  if (!isEditMode) {
    // In read-only mode always show the chart
    return (
      <div className="w-full">
        <div className="bg-gray-800 text-white p-4 rounded border border-gray-700">
          {renderChart()}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-800 text-white p-4 rounded border border-gray-700">
        {/* Mode Buttons */}
        <div className="mb-4 flex items-center gap-2">
          <button
            className={`px-4 py-1 text-sm text-white rounded-full ${viewMode==='chart' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'} ${hasDuplicateLabels && viewMode !== 'chart' ? 'ring-2 ring-yellow-500' : ''}`}
            onClick={() => {
              if (hasDuplicateLabels && viewMode !== 'chart') {
                applyLabelValidation();
              }
              setViewMode('chart');
            }}
            title={hasDuplicateLabels ? 'Chart view - Warning: Duplicate labels detected (will auto-fix)' : 'Chart view'}
          >
            📊 Chart {hasDuplicateLabels && viewMode !== 'chart' && '⚠️'}
          </button>
          <button
            className={`px-4 py-1 text-sm text-white rounded-full ${viewMode==='data' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'}`}
            onClick={() => setViewMode('data')}
          >
            📝 Data
          </button>
          <button
            className={`px-4 py-1 text-sm text-white rounded-full ${viewMode==='type' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'}`}
            onClick={() => setViewMode('type')}
          >
            🗂️ Type
          </button>
        </div>

        {/* Render Section Based on Mode */}
        {viewMode === 'chart' && (
          <div className="light-gray-chart">
            {renderChart()}
            {/* style overrides for light gray chart visuals */}
            <style jsx global>{`
              .light-gray-chart text { fill: #d1d5db !important; }
              .light-gray-chart .MuiChartsAxis-line, .light-gray-chart .MuiChartsAxis-root line { stroke: #d1d5db !important; }
            `}</style>
          </div>
        )}

        {viewMode === 'data' && (
          <ChartDataView
            labels={content.data?.labels || []} // Now passing labels as prop
            values={content.data?.values || []}
            updateLabel={updateLabel}
            updateValue={updateValue}
            handleTriggerClick={handleTriggerClick}
            anchorEl={anchorEl}
            closeMenu={closeMenu}
            handleMenuAction={handleMenuAction}
            addRowToEnd={addRowToEnd}
          />
        )}

        {viewMode === 'type' && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Chart Type:</label>
            <select
              value={content.chartType}
              onChange={(e) => handleChartTypeChange(e.target.value)}
              className="px-2 py-1 border rounded text-sm text-white bg-gray-800"
              aria-label="Chart type selection"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="gauge">Gauge</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartBlock;
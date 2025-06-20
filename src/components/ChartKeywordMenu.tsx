'use client';
import React from 'react';

interface ChartKeywordMenuProps {
  onSelectChart: (chartType: string) => void;
  onClose: () => void;
  filterToken?: string;
}

const ChartKeywordMenu: React.FC<ChartKeywordMenuProps> = ({ onSelectChart, onClose, filterToken }) => {
  const chartTypes = [
    { token: '/bar', type: 'bar', label: 'Bar Chart', icon: '📊' },
    { token: '/line', type: 'line', label: 'Line Chart', icon: '📈' },
    { token: '/pie', type: 'pie', label: 'Pie Chart', icon: '🥧' },
    { token: '/scatter', type: 'scatter', label: 'Scatter Plot', icon: '🔸' },
    { token: '/gauge', type: 'gauge', label: 'Gauge Chart', icon: '⏲️' }
  ];

  // Filter menu options by an optional filter token (e.g., "/ba" or "/bar")
  const filteredTypes = React.useMemo(() => {
    if (!filterToken || filterToken === 'chart') return chartTypes;
    const lower = filterToken.toLowerCase();
    return chartTypes.filter((c) => c.token.startsWith(lower));
  }, [filterToken, chartTypes]);

  const handleSelectChart = (chartType: string) => {
    onSelectChart(chartType);
    onClose();
  };

  return (
    <div className="w-60 p-4 rounded bg-gray-800 text-white text-xs shadow-lg">
      <div className="mb-2 font-semibold">Select Chart Type</div>
      <div className="space-y-1">
        {filteredTypes.map((chart) => (
          <button
            key={chart.type}
            onClick={() => handleSelectChart(chart.type)}
            className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-900 text-left transition-colors"
          >
            <span>{chart.icon}</span>
            <span>{chart.label}</span>
            <span className="ml-auto text-gray-400">{chart.token}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartKeywordMenu; 
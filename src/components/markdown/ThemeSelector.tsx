import React, { useState, useRef, useEffect } from 'react';
import { Extension } from '@codemirror/state';
import { blueColor2, grayColor2, grayColor4 } from '@/constants/color';

export interface ThemeOption {
  name: string;
  value: string;
  theme: Extension;
  category: 'light' | 'dark';
}

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeValue: string) => void;
  themes: ThemeOption[];
  isDarkMode: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  themes,
  isDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter themes based on current mode
  const availableThemes = themes.filter(theme => 
    isDarkMode ? theme.category === 'dark' : theme.category === 'light'
  );

  const currentThemeObj = themes.find(theme => theme.value === currentTheme);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (themeValue: string) => {
    onThemeChange(themeValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
        <span>{currentThemeObj?.name || 'Theme'}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto" style={{ backgroundColor: grayColor4 }}>
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
              {isDarkMode ? 'Dark Themes' : 'Light Themes'}
            </div>
            {availableThemes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeSelect(theme.value)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors cursor-pointer`}
                style={{ 
                  backgroundColor: currentTheme === theme. value? grayColor2 : grayColor4,
                  color: currentTheme === theme.value ? blueColor2 : 'white',
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 
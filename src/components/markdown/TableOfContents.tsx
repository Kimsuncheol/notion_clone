import { grayColor9 } from '@/constants/color';
import React, { useMemo, useState, useEffect } from 'react';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  line: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  onHeadingClick?: (headingId: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  className = '',
  onHeadingClick
}) => {
  const [activeHeading, setActiveHeading] = useState<string>('');

  // Parse markdown content to extract headings
  const headings = useMemo((): HeadingItem[] => {
    if (!content || content.trim() === '') return [];

    const lines = content.split('\n');
    const headings: HeadingItem[] = [];

    lines.forEach((line, index) => {
      // Match markdown headings (# ## ### etc.)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();

        // Create a clean ID from the heading text
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

        // Ensure unique IDs
        let uniqueId = id;
        let counter = 1;
        while (headings.some(h => h.id === uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }

        headings.push({
          id: uniqueId,
          text,
          level,
          line: index + 1
        });
      }
    });

    return headings;
  }, [content]);

  // Handle heading click
  const handleHeadingClick = (heading: HeadingItem) => {
    setActiveHeading(heading.id);

    if (onHeadingClick) {
      onHeadingClick(heading.id);
    } else {
      // Default behavior: scroll to the heading in preview
      const element = document.getElementById(heading.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Auto-detect active heading based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
      let activeId = '';

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) { // Consider active if within 10px from top
            activeId = element.id;
            break;
          }
        }
      }

      if (activeId !== activeHeading) {
        setActiveHeading(activeId);
      }
    };

    const debounce = (func: () => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return function executedFunction() {
        const later = () => {
          clearTimeout(timeout);
          func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    const debouncedHandleScroll = debounce(handleScroll, 100);

    window.addEventListener('scroll', debouncedHandleScroll);
    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, [headings, activeHeading]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className='w-64 sticky top-24 h-fit ml-4'>
      {/* TOC Container */}
      <div className={`border-l border-gray-200 dark:border-gray-700 ${className} p-4`}>
        {/* TOC Content */}
        <nav className="space-y-1">
          {headings.map((heading, index) => {
            const isActive = heading.id === activeHeading;
            const indentClass = {
              1: 'ml-0',
              2: 'ml-3',
              3: 'ml-6',
              4: 'ml-9',
              5: 'ml-12',
              6: 'ml-15'
            }[heading.level] || 'ml-0';

            return (
              <div
                key={`${heading.id}-${index}`}
                className={`flex items-start gap-2 ${indentClass}`}
              >
                {/* If isActve, move a bit left slowly */}
                <div
                  onClick={() => handleHeadingClick(heading)}
                  className={`
                    text-left text-sm leading-relaxed transition-colors duration-200 flex-1 py-0.5
                    ${isActive && 'font-semibold translate-x-[-4px] duration-50 ease-in-out transition-transform '}
                  `}
                  style={{ color: isActive ? 'white': grayColor9 }}
                  title={heading.text}
                >
                  <span className="block break-all">
                    {heading.text}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;

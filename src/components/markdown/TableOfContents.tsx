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

  // Optimized helper function to strip markdown formatting from text
  const stripMarkdown = useMemo(() => {
    // Compile regex patterns once for better performance
    const patterns = [
      [/<[^>]*>/g, ''],                           // HTML tags
      [/!\[([^\]]*)\]\([^)]*\)/g, '$1'],         // Images
      [/\[([^\]]+)\]\([^)]*\)/g, '$1'],          // Links
      [/\[([^\]]+)\]\[[^\]]*\]/g, '$1'],         // Reference links
      [/`{1,3}([^`]+)`{1,3}/g, '$1'],            // Inline code (optimized)
      [/(\*\*|__)([^*_]+)\1/g, '$2'],            // Bold (combined)
      [/(\*|_)([^*_]+)\1/g, '$2'],               // Italic (combined)
      [/~~([^~]+)~~/g, '$1'],                    // Strikethrough
      [/==([^=]+)==/g, '$1']                     // Highlight
    ] as const;

    return (text: string): string => {
      let result = text;
      for (const [pattern, replacement] of patterns) {
        result = result.replace(pattern, replacement);
      }
      return result.trim();
    };
  }, []);

  // Optimized helper function to generate ID from heading text (matches MarkdownPreviewPane)
  const generateHeadingId = useMemo(() => {
    // Compile regex patterns once
    const specialCharsPattern = /[^a-z0-9\s-]/g;
    const spacesPattern = /\s+/g;
    const multiHyphensPattern = /-+/g;
    const edgeHyphensPattern = /^-|-$/g;

    return (text: string): string => {
      return text
        .toLowerCase()
        .replace(specialCharsPattern, '')
        .replace(spacesPattern, '-')
        .replace(multiHyphensPattern, '-')
        .replace(edgeHyphensPattern, '');
    };
  }, []);

  // Optimized markdown parsing to extract headings
  const headings = useMemo((): HeadingItem[] => {
    if (!content || content.trim() === '') return [];

    const lines = content.split('\n');
    const headings: HeadingItem[] = [];
    const seenIds = new Set<string>(); // Use Set for O(1) lookup instead of array.some()
    let inCodeBlock = false;

    // Compile regex patterns once
    const codeBlockPattern = /^```/;
    const atxPattern = /^(#{1,6})\s+(.+?)(?:\s+#{1,6})?\s*$/;
    const setextH1Pattern = /^=+\s*$/;
    const setextH2Pattern = /^-+\s*$/;

    const linesLength = lines.length;
    for (let index = 0; index < linesLength; index++) {
      const line = lines[index];
      const trimmedLine = line.trim();

      // Track code blocks to skip headings inside them
      if (codeBlockPattern.test(trimmedLine)) {
        inCodeBlock = !inCodeBlock;
        continue;
      }

      // Skip lines inside code blocks
      if (inCodeBlock) {
        continue;
      }

      // Match ATX-style headings (# ## ### etc.)
      const atxMatch = atxPattern.exec(line);
      if (atxMatch) {
        const level = atxMatch[1].length;
        const rawText = atxMatch[2].trim();
        const displayText = stripMarkdown(rawText);

        // Generate ID using the same logic as MarkdownPreviewPane
        let uniqueId = generateHeadingId(displayText);

        // Ensure unique IDs using Set for faster lookup
        if (seenIds.has(uniqueId)) {
          let counter = 1;
          while (seenIds.has(`${uniqueId}-${counter}`)) {
            counter++;
          }
          uniqueId = `${uniqueId}-${counter}`;
        }
        seenIds.add(uniqueId);

        headings.push({
          id: uniqueId,
          text: displayText,
          level,
          line: index + 1
        });
        continue;
      }

      // Match Setext-style headings (underlined with === or ---)
      if (index > 0) {
        const prevLine = lines[index - 1];
        const prevTrimmed = prevLine.trim();

        if (prevTrimmed !== '') {
          const isH1 = setextH1Pattern.test(trimmedLine);
          const isH2 = !isH1 && setextH2Pattern.test(trimmedLine);

          if (isH1 || isH2) {
            const level = isH1 ? 1 : 2;
            const displayText = stripMarkdown(prevTrimmed);

            // Generate ID using the same logic as MarkdownPreviewPane
            let uniqueId = generateHeadingId(displayText);

            // Ensure unique IDs
            if (seenIds.has(uniqueId)) {
              let counter = 1;
              while (seenIds.has(`${uniqueId}-${counter}`)) {
                counter++;
              }
              uniqueId = `${uniqueId}-${counter}`;
            }
            seenIds.add(uniqueId);

            // Check if we already added this heading (from the previous line)
            const lastHeading = headings[headings.length - 1];
            if (!lastHeading || lastHeading.line !== index) {
              headings.push({
                id: uniqueId,
                text: displayText,
                level,
                line: index
              });
            }
          }
        }
      }
    }

    return headings;
  }, [content, stripMarkdown, generateHeadingId]);

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

  // Optimized auto-detect active heading based on scroll position
  useEffect(() => {
    if (headings.length === 0) return;

    // Cache heading elements to avoid repeated DOM queries
    const headingElementsCache = headings
      .map(h => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElementsCache.length === 0) return;

    const scrollThreshold = 150;
    let rafId: number | null = null;

    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for better performance
      rafId = requestAnimationFrame(() => {
        let activeId = '';

        // Find the heading that's currently in view (iterate backwards for efficiency)
        for (let i = headingElementsCache.length - 1; i >= 0; i--) {
          const element = headingElementsCache[i];
          const rect = element.getBoundingClientRect();

          if (rect.top <= scrollThreshold) {
            activeId = element.id;
            break;
          }
        }

        // If no heading is above threshold, activate the first one if visible
        if (!activeId && headingElementsCache[0]) {
          const firstRect = headingElementsCache[0].getBoundingClientRect();
          if (firstRect.top > 0 && firstRect.top < window.innerHeight) {
            activeId = headingElementsCache[0].id;
          }
        }

        // Only update state if the active heading changed
        if (activeId !== activeHeading) {
          setActiveHeading(activeId);
        }

        rafId = null;
      });
    };

    // Throttle scroll events for better performance
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (throttleTimeout === null) {
        throttleTimeout = setTimeout(() => {
          handleScroll();
          throttleTimeout = null;
        }, 100);
      }
    };

    // Listen to both window scroll and scroll on the markdown container
    const markdownContainer = document.querySelector('#react-markdown-container')?.parentElement;

    window.addEventListener('scroll', throttledHandleScroll, { passive: true, capture: true });
    if (markdownContainer) {
      markdownContainer.addEventListener('scroll', throttledHandleScroll, { passive: true });
    }

    // Initial check
    handleScroll();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (throttleTimeout !== null) {
        clearTimeout(throttleTimeout);
      }
      window.removeEventListener('scroll', throttledHandleScroll, true);
      if (markdownContainer) {
        markdownContainer.removeEventListener('scroll', throttledHandleScroll);
      }
    };
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
                <div
                  onClick={() => handleHeadingClick(heading)}
                  className={`
                    text-left text-sm leading-relaxed transition-all duration-200 flex-1 py-0.5
                    cursor-pointer hover:text-white
                    ${isActive
                      ? 'font-bold translate-x-[-4px]'
                      : 'ml-4'
                    }
                  `}
                  style={{ color: isActive ? 'white' : grayColor9 }}
                  title={heading.text}
                >
                  <span className="block break-words">
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

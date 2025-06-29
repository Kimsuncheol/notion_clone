'use client';
import React, { useState, useEffect } from 'react';
import { fetchPublicNoteContent, FirebaseNoteContent } from '@/services/firebase';
import { Block, TextBlock } from '@/types/blocks';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { 
  StyledTextBlock as StyledBlockType, 
  ListBlock as ListBlockType, 
  OrderedListBlock as OrderedListBlockType, 
  TableBlock as TableBlockType, 
  ImageBlock as ImageBlockType, 
  ChartBlock as ChartBlockType,
  LaTeXBlock as LaTeXBlockType,
} from '@/types/blocks';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Props {
  pageId: string;
}

const PublicNoteViewer: React.FC<Props> = ({ pageId }) => {
  const [noteContent, setNoteContent] = useState<FirebaseNoteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicNote = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const content = await fetchPublicNoteContent(pageId);
        if (content) {
          setNoteContent(content);
        } else {
          setError('Note not found or not public');
        }
      } catch (err) {
        console.error('Error loading public note:', err);
        setError('Failed to load note');
        toast.error('Failed to load note');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicNote();
  }, [pageId]);

  const renderBlock = (block: Block) => {
    const blockContent = (() => {
      switch (block.type) {
        case 'text':
          return (
            <div className="p-2">
                          <div className="text-base leading-relaxed">
              {(block as TextBlock).content || ''}
            </div>
            </div>
          );
        case 'styled':
          return (
            <div className="p-2">
              <div className={`${(block as StyledBlockType).className} leading-relaxed`}>
                {(block as StyledBlockType).content || ''}
              </div>
            </div>
          );
        case 'list':
          return (
            <div className="p-2">
              <ul className="space-y-1">
                {(block as ListBlockType).content.map((item, idx) => (
                  <li key={idx} className={`ml-${item.level * 4} flex items-start`}>
                    <span className="mr-2 mt-1 text-xs">
                      {item.level === 0 ? '•' : item.level === 1 ? '◦' : '▪'}
                    </span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        case 'orderedlist':
          return (
            <div className="p-2">
              <ol className="space-y-1">
                {(block as OrderedListBlockType).content.map((item, idx) => (
                  <li key={idx} className={`ml-${item.level * 4} flex items-start`}>
                    <span className="mr-2">{idx + 1}.</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        case 'table':
          const tableBlock = block as TableBlockType;
          return (
            <div className="p-2">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                  <tbody>
                    {Array.from({ length: tableBlock.content.rows }, (_, row) => (
                      <tr key={row}>
                        {Array.from({ length: tableBlock.content.cols }, (_, col) => (
                          <td key={col} className="border border-gray-300 dark:border-gray-600 p-2">
                            {tableBlock.content.cells[`${row},${col}`] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        case 'image':
          const imageBlock = block as ImageBlockType;
          return (
            <div className="p-2">
              {imageBlock.content.src ? (
                <img 
                  src={imageBlock.content.src} 
                  alt={imageBlock.content.alt || 'Image'} 
                  className="max-w-full h-auto rounded"
                />
              ) : (
                <div className="text-gray-500 italic">No image uploaded</div>
              )}
            </div>
          );
        case 'chart':
          const chartBlock = block as ChartBlockType;
          return (
            <div className="p-2">
              <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  📊 {chartBlock.content.config?.title || `${chartBlock.content.chartType.charAt(0).toUpperCase() + chartBlock.content.chartType.slice(1)} Chart`}
                </div>
                <div className="text-gray-500 italic">Interactive charts not available in public view</div>
              </div>
            </div>
          );
        case 'latex':
          const latexBlock = block as LaTeXBlockType;
          return (
            <div className="p-2">
              <div className={`border border-gray-200 dark:border-gray-700 rounded p-4 bg-white dark:bg-gray-800 ${
                latexBlock.content.displayMode ? 'text-center' : ''
              }`}>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  📐 LaTeX Math 
                  <span className={`px-2 py-1 text-xs rounded ${
                    latexBlock.content.displayMode 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {latexBlock.content.displayMode ? 'Display' : 'Inline'}
                  </span>
                </div>
                {latexBlock.content.latex ? (
                  <div className="latex-container">
                    <Latex
                      delimiters={latexBlock.content.displayMode ? [
                        { left: '$$', right: '$$', display: true },
                        { left: '\\[', right: '\\]', display: true }
                      ] : [
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false }
                      ]}
                      strict={false}
                    >
                      {latexBlock.content.displayMode ? `$$${latexBlock.content.latex}$$` : `$${latexBlock.content.latex}$`}
                    </Latex>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No equation provided</div>
                )}
                {latexBlock.content.latex && (
                  <div className="mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                    Raw: {latexBlock.content.latex}
                  </div>
                )}
              </div>
            </div>
          );
        default:
          return null;
      }
    })();

    return (
      <div key={block.id} className="mb-2">
        {blockContent}
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <div className="text-gray-500">Loading public note...</div>
        </div>
      </div>
    );
  }

  if (error || !noteContent) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Note Not Available</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'This note is either private or does not exist.'}
          </p>
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Public Notes
            </Link>
            <div>
              <Link 
                href="/signin" 
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Sign in to access your private notes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold">
            📝 Notion Clone
          </Link>
          <span className="text-gray-500">Public Note</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
            ← Dashboard
          </Link>
          <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
            Sign In
          </Link>
        </div>
      </header>

      <DndProvider backend={HTML5Backend}>
        <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
          <article className="w-full max-w-3xl px-6 space-y-1">
            {/* Title and metadata */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{noteContent.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700 pb-4">
                <span className="flex items-center gap-1">
                  🌐 <span>Public Note</span>
                </span>
                <span>By {noteContent.authorName || noteContent.authorEmail?.split('@')[0] || 'Anonymous'}</span>
                <span>Updated {formatDate(noteContent.updatedAt)}</span>
                <span>Created {formatDate(noteContent.createdAt)}</span>
              </div>
            </div>

            {/* Content blocks */}
            <div className="space-y-2">
              {noteContent.blocks.length > 0 ? (
                noteContent.blocks.map((block) => renderBlock(block))
              ) : (
                <div className="text-gray-500 italic text-center py-8">
                  This note is empty.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 text-sm mb-4">
                This is a public note shared on Notion Clone
              </p>
              <div className="space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Browse More Public Notes
                </Link>
                <Link 
                  href="/signin" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create Your Own Notes
                </Link>
              </div>
            </div>
          </article>
        </main>
      </DndProvider>
    </div>
  );
};

export default PublicNoteViewer; 
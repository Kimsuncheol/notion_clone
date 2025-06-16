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
  PdfBlock as PdfBlockType 
} from '@/types/blocks';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Skeleton, Box } from '@mui/material';

interface Props {
  pageId: string;
}

// Skeleton component for loading public note
const PublicNoteLoadingSkeleton = () => (
  <div className="min-h-screen bg-[color:var(--background)]">
    {/* Header Skeleton */}
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-4">
        <Skeleton variant="text" width={150} height={28} />
        <Skeleton variant="text" width={80} height={20} />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton variant="rectangular" width={90} height={32} />
        <Skeleton variant="rectangular" width={70} height={32} />
      </div>
    </header>

    {/* Main Content Skeleton */}
    <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
      <article className="w-full max-w-3xl px-6">
        {/* Title and metadata skeleton */}
        <div className="mb-8">
          <Skeleton variant="text" width="70%" height={48} sx={{ mb: 2 }} />
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="text" width={140} height={16} />
            <Skeleton variant="text" width={130} height={16} />
          </div>
        </div>

        {/* Content blocks skeleton */}
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="75%" height={24} />
            </Box>
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <Skeleton variant="text" width="60%" height={16} sx={{ mx: 'auto', mb: 2 }} />
          <div className="flex justify-center space-x-4">
            <Skeleton variant="text" width={180} height={16} />
            <Skeleton variant="text" width={140} height={16} />
          </div>
        </div>
      </article>
    </main>
  </div>
);

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
          return (
            <div className="p-2">
              <div className="text-gray-500 italic">Chart content (interactive charts not available in public view)</div>
            </div>
          );
        case 'pdf':
          const pdfBlock = block as PdfBlockType;
          return (
            <div className="p-2">
              {pdfBlock.content.src ? (
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    PDF: {pdfBlock.content.name || 'Document'}
                  </div>
                  <a 
                    href={pdfBlock.content.src} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View PDF →
                  </a>
                </div>
              ) : (
                <div className="text-gray-500 italic">No PDF uploaded</div>
              )}
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
      <PublicNoteLoadingSkeleton />
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
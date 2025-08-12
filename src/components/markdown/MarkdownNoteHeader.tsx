import React from 'react'

interface MarkdownNoteHeaderProps {
  title: string;
  titleRef: React.RefObject<HTMLDivElement | null>;
  handleTitleInput: (e: React.FormEvent<HTMLDivElement>) => void;
  viewMode: 'edit' | 'preview' | 'split';
}

export default function MarkdownNoteHeader({ title, titleRef, handleTitleInput, viewMode }: MarkdownNoteHeaderProps) {
  return (
    <div className={`w-full border-r flex flex-col p-4 pb-2 gap-6 border-gray-200 dark:border-gray-700 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
      <div
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleTitleInput}
        onKeyDown={(e) => {
          // Prevent Enter key from creating new lines (optional)
          if (e.key === 'Enter') {
            e.preventDefault();
            // e.currentTarget.textContent += '\n';
          }
        }}
        className="w-full text-5xl font-bold bg-transparent flex items-end justify-between border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
        ref={titleRef}
      >
        <span className='text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]'>
          {title}
        </span>
      </div>
      {!title && (
        <div className="absolute pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500">
          Untitled
        </div>
      )}
      <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
    </div>
  )
}

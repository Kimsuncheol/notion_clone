'use client';
import React, { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ManualModal: React.FC<Props> = ({ open, onClose }) => {
  const { setShowManual } = useModalStore();

  // Click-outside detection to close manual modal
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside the manual modal content
      if (!target.closest('.manual-modal-content')) {
        setShowManual(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setShowManual, onClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowManual(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, setShowManual, onClose]);

  const handleCloseManual = () => {
    setShowManual(false);
    onClose();
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 manual-modal">
      <div className="bg-[color:var(--background)] text-[color:var(--foreground)] rounded shadow-lg w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto manual-modal-content">
        <button
          className="absolute top-2 right-2 text-lg px-2"
          onClick={handleCloseManual}
          aria-label="Close manual"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">📖 Notion Clone Manual</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">⌨️ Keyboard Shortcuts</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> - Create new block</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Backspace</kbd> - Delete empty block or merge with previous</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑↓</kbd> - Navigate between blocks</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘S</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> - Save note with author info</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘\</kbd> / <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+\</kbd> - Toggle sidebar</li>
                <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Tab</kbd> - Indent list items</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📝 Slash Commands</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li><code>/list</code> - Create bullet list</li>
                <li><code>/ol</code> or <code>/orderedlist</code> - Create numbered list</li>
                <li><code>/table</code> - Create table (5x5 default)</li>
                <li><code>/image</code> - Create image block</li>
                <li><code>/chart</code> - Create chart block</li>
                <li><code>/pdf</code> - Create PDF block</li>
                <li><code>/code</code> - Create code block with syntax highlighting</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎨 Text Styling</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li><code>/h1</code> to <code>/h5</code> - Headings (largest to smallest)</li>
                <li><code>/b</code> - Bold text</li>
                <li><code>/bh1</code> to <code>/bh5</code> - Bold headings</li>
                <li><code>/ih1</code> to <code>/ih5</code> - Italic headings</li>
                <li><code>/bih1</code> to <code>/bih5</code> - Bold italic headings</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">📋 Lists & Tables</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• <strong>Lists:</strong> Tab to indent (• → ◦ → ▪)</li>
                <li>• <strong>Ordered Lists:</strong> Tab changes numbering (1→a→i→A)</li>
                <li>• Click numbers to manually cycle types</li>
                <li>• <strong>Tables:</strong> Arrow keys to navigate cells</li>
                <li>• Enter in last row adds new row</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🖼️ Media & Files</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Drag & drop images into image blocks</li>
                <li>• PDF blocks support file upload</li>
                <li>• Charts support interactive data visualization</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💻 Code Blocks</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Tab for indentation (2 spaces)</li>
                <li>• Ctrl/Cmd+Enter to exit and add new block</li>
                <li>• Escape to exit code block</li>
                <li>• Click ⚙️ to change programming language</li>
                <li>• Click ▶️ Run to execute code</li>
                <li>• Supports JavaScript, Python, Java, C++, HTML, CSS, SQL & more</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🌐 Sharing & Privacy</h3>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Toggle 🌐 Public / 🔒 Private in editor</li>
                <li>• Public notes appear on dashboard</li>
                <li>• Author info saved with each note</li>
                <li>• Only note owners can edit their notes</li>
                <li>• Click 📤 <strong>Share</strong> in the header to open a dropdown for Twitter 🐦, Facebook 📘, LinkedIn 💼, Reddit 🤖, or copy the link 🔗</li>
                <li>• Click 🔓 <em>Unprotected</em> / 🔒 <em>Protected</em> in the header to toggle screen-capture protection (disables selection & shortcuts and blurs content when the tab loses focus)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💬 Comments & Collaboration</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Click 💬 to add/view comments on blocks</li>
                <li>• Enhanced UI with avatars and formatting</li>
                <li>• Hover menu (⊞) for block options</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 text-center">
            💡 <strong>Tip:</strong> Use the sidebar to organize notes in folders. Double-click to rename folders and pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualModal; 
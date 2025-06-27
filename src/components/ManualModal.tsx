'use client';
import React, { useEffect, useState } from 'react';
import { useModalStore } from '@/store/modalStore';
import { useColorStore } from '@/store/colorStore';
import SearchIcon from '@mui/icons-material/Search';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Manual content organized into pages
const manualPages = [
  {
    id: 'keyboard',
    title: '⌨️ Keyboard Shortcuts',
    content: [
      { key: 'Enter', desc: 'Create new block' },
      { key: 'Backspace', desc: 'Delete empty block or merge with previous' },
      { key: '↑↓', desc: 'Navigate between blocks' },
      { key: '⌘S / Ctrl+S', desc: 'Save note with author info' },
      { key: '⌘\\ / Ctrl+\\', desc: 'Toggle sidebar' },
      { key: 'Tab', desc: 'Indent list items' },
    ]
  },
  {
    id: 'slash',
    title: '📝 Slash Commands',
    content: [
      { key: '/list', desc: 'Create bullet list' },
      { key: '/ol or /orderedlist', desc: 'Create numbered list' },
      { key: '/table', desc: 'Create table (5x5 default)' },
      { key: '/image', desc: 'Create image block' },
      { key: '/chart or /bar, /line', desc: 'Create chart block' },

      { key: '/code', desc: 'Create code block with syntax highlighting' },
      { key: '/latex', desc: 'Create LaTeX math equation block' },
    ]
  },
  {
    id: 'styling',
    title: '🎨 Text Styling',
    content: [
      { key: '/h1 to /h5', desc: 'Headings (largest to smallest)' },
      { key: '/b', desc: 'Bold text' },
      { key: '/bh1 to /bh5', desc: 'Bold headings' },
      { key: '/ih1 to /ih5', desc: 'Italic headings' },
      { key: '/bih1 to /bih5', desc: 'Bold italic headings' },
    ]
  },
  {
    id: 'lists',
    title: '📋 Lists & Tables',
    content: [
      { key: 'Lists', desc: 'Tab to indent (• → ◦ → ▪)' },
      { key: 'Ordered Lists', desc: 'Tab changes numbering (1→a→i→A)' },
      { key: 'Click numbers', desc: 'Manually cycle types' },
      { key: 'Tables', desc: 'Arrow keys to navigate cells' },
      { key: 'Enter in last row', desc: 'Adds new row' },
    ]
  },
  {
    id: 'media',
    title: '🖼️ Media & Files',
    content: [
      { key: 'Images', desc: 'Drag & drop images into image blocks' },
      { key: 'LaTeX Math', desc: 'Type /latex for mathematical equations' },
      { key: 'Charts', desc: 'Support multiple types: bar, line, pie, scatter, gauge' },
      { key: 'Chart tokens', desc: 'Type /bar, /line to show chart menu' },
    ]
  },
  {
    id: 'code',
    title: '💻 Code Blocks',
    content: [
      { key: 'Tab', desc: 'Indentation (2 spaces)' },
      { key: 'Ctrl/Cmd+Enter', desc: 'Exit and add new block' },
      { key: 'Escape', desc: 'Exit code block' },
      { key: '⚙️ Settings', desc: 'Change programming language' },
      { key: '▶️ Run', desc: 'Execute code' },
      { key: 'Languages', desc: 'JavaScript, Python, Java, C++, HTML, CSS, SQL & more' },
    ]
  },
  {
    id: 'latex',
    title: '📐 LaTeX Math',
    content: [
      { key: '/latex', desc: 'Create LaTeX math equation block' },
      { key: 'Display/Inline', desc: 'Toggle between display mode (centered) and inline mode' },
      { key: 'Quick insert', desc: 'Use sample equations: Quadratic Formula, Euler\'s Identity, etc.' },
      { key: 'Fractions', desc: '\\frac{a}{b} creates fractions' },
      { key: 'Superscript', desc: '^{text} for superscripts (e.g., x^2)' },
      { key: 'Subscript', desc: '_{text} for subscripts (e.g., x_1)' },
      { key: 'Greek letters', desc: '\\alpha, \\beta, \\gamma, \\pi, etc.' },
      { key: 'Operators', desc: '\\sum, \\int, \\sqrt{}, \\pm, \\infty' },
      { key: 'Matrices', desc: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    ]
  },
  {
    id: 'sharing',
    title: '🌐 Sharing & Privacy',
    content: [
      { key: '🌐 Public / 🔒 Private', desc: 'Toggle in editor' },
      { key: 'Public notes', desc: 'Appear on dashboard' },
      { key: 'Author info', desc: 'Saved with each note' },
      { key: 'Editing', desc: 'Only note owners can edit their notes' },
      { key: '📤 Share', desc: 'Twitter, Facebook, LinkedIn, Reddit, or copy link' },
      { key: '🔓/🔒 Protection', desc: 'Toggle screen-capture protection' },
    ]
  },
  {
    id: 'comments',
    title: '💬 Comments & Collaboration',
    content: [
      { key: '💬 Comments', desc: 'Click to add/view comments on blocks' },
      { key: 'Enhanced UI', desc: 'Avatars and formatting' },
      { key: 'Hover menu (⊞)', desc: 'Block options' },
      { key: '🗑️ Remove', desc: 'Delete blocks via hover menu' },
    ]
  }
];

const ManualModal: React.FC<Props> = ({ open, onClose }) => {
  const { setShowManual } = useModalStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPages, setFilteredPages] = useState(manualPages);
  const backgroundColor = useColorStore(state => state.backgroundColor);

  // Filter pages based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPages(manualPages);
      return;
    }

    const filtered = manualPages.filter(page => 
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.content.some(item => 
        item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    setFilteredPages(filtered);
    setCurrentPage(0); // Reset to first page when searching
  }, [searchTerm]);

  // Export to PDF functionality
  const exportToPDF = () => {
    const content = filteredPages.map(page => 
      `${page.title}\n\n${page.content.map(item => `${item.key}: ${item.desc}`).join('\n')}`
    ).join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notion-clone-manual.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Click-outside detection to close manual sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside the manual sidebar content
      if (!target.closest('.manual-sidebar-content')) {
        setShowManual(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setShowManual, onClose]);

  // Handle Escape key to close sidebar
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
  
  const currentPageData = filteredPages[currentPage];
  const totalPages = filteredPages.length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" />
      
      {/* Right Sidebar */}
      <div 
        className={`fixed top-0 right-0 z-50 w-96 h-full text-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } manual-sidebar-content`}
        style={{ backgroundColor }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">
              📖 Manual
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                title="Export to PDF"
              >
                <PictureAsPdfIcon fontSize="small" />
                Export
              </button>
              <button
                className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
                onClick={handleCloseManual}
                aria-label="Close manual"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search manual content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {totalPages === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">No results found</h3>
                <p className="text-gray-400">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-gray-100">{currentPageData.title}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/50 rounded-full text-sm">
                    <span className="text-blue-300">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="space-y-4">
                    {currentPageData.content.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex-shrink-0">
                          <kbd className="px-2 py-1 bg-blue-900/50 text-blue-200 rounded text-sm font-mono">
                            {item.key}
                          </kbd>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-300">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          {/* Please don't touch below code */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-gray-200"
                >
                  <NavigateBeforeIcon />
                  {}
                </button>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {filteredPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      title={`Go to page ${index + 1}`}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPage 
                          ? 'bg-blue-500' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-gray-200"
                >
                  {}
                  <NavigateNextIcon />
                </button>
              </div>
            </div>
          )}

          {/* Tip Footer */}
          <div className="p-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              💡 <strong>Tip:</strong> Use the sidebar to organize notes in folders. Double-click to rename folders and pages.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManualModal; 
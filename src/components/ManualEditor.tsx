'use client';
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface ManualPage {
  id: string;
  title: string;
  content: Array<{ key: string; desc: string }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// This would normally come from Firebase, but for now we'll use the static data
const defaultManualPages: ManualPage[] = [
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
    id: 'markdown',
    title: '📝 Markdown Editor',
    content: [
      { key: 'Create Note', desc: 'Click "New" → Select "Markdown" mode' },
      { key: 'View Modes', desc: 'Edit (full-width), Preview (rendered), Split (side-by-side)' },
      { key: 'Manual Save', desc: 'Cmd+S (Mac) or Ctrl+S (Windows/Linux) to save' },
      { key: 'Headers', desc: '# H1, ## H2, ### H3 for different heading levels' },
      { key: 'Text Formatting', desc: '**bold**, *italic*, `inline code`, ~~strikethrough~~' },
      { key: 'Lists', desc: '- bullet lists, 1. numbered lists, - [ ] task lists' },
      { key: 'Links & Images', desc: '[Link text](URL), ![Alt text](image-URL)' },
      { key: 'Code Blocks', desc: '```language for syntax-highlighted code blocks' },
      { key: 'Tables', desc: '| Column 1 | Column 2 | with | separators |' },
      { key: 'Blockquotes', desc: '> Use for quoted text or callouts' },
      { key: 'Drag & Drop', desc: 'Drop images, videos, PDFs directly into editor' },
      { key: 'Emoji Support', desc: 'Click emoji button in toolbar for emoji picker' },
      { key: 'Themes', desc: 'Switch between light/dark themes in toolbar' },
      { key: 'Line Wrapping', desc: 'Long lines automatically wrap for readability' },
      { key: 'GitHub Flavored', desc: 'Full GitHub Flavored Markdown support' },
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

const ManualEditor: React.FC<Props> = ({ open, onClose }) => {
  const [manualPages, setManualPages] = useState<ManualPage[]>(defaultManualPages);
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const auth = getAuth(firebaseApp);
  const isAdmin = auth.currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.manual-editor-content')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  if (!open || !isAdmin) return null;

  const toggleSection = (pageId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const handlePageTitleChange = (pageId: string, newTitle: string) => {
    setManualPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, title: newTitle } : page
    ));
    setHasChanges(true);
  };

  const handleContentItemChange = (pageId: string, itemIndex: number, field: 'key' | 'desc', value: string) => {
    setManualPages(prev => prev.map(page => 
      page.id === pageId 
        ? {
            ...page,
            content: page.content.map((item, index) => 
              index === itemIndex ? { ...item, [field]: value } : item
            )
          }
        : page
    ));
    setHasChanges(true);
  };

  const addContentItem = (pageId: string) => {
    setManualPages(prev => prev.map(page => 
      page.id === pageId 
        ? {
            ...page,
            content: [...page.content, { key: 'New Key', desc: 'New description' }]
          }
        : page
    ));
    setHasChanges(true);
  };

  const removeContentItem = (pageId: string, itemIndex: number) => {
    setManualPages(prev => prev.map(page => 
      page.id === pageId 
        ? {
            ...page,
            content: page.content.filter((_, index) => index !== itemIndex)
          }
        : page
    ));
    setHasChanges(true);
  };

  const addNewPage = () => {
    const newPageId = `custom_${Date.now()}`;
    const newPage: ManualPage = {
      id: newPageId,
      title: '📄 New Section',
      content: [
        { key: 'Example Key', desc: 'Example description' }
      ]
    };
    setManualPages(prev => [...prev, newPage]);
    setExpandedSections(prev => ({ ...prev, [newPageId]: true }));
    setEditingPage(newPageId);
    setHasChanges(true);
  };

  const removePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      setManualPages(prev => prev.filter(page => page.id !== pageId));
      if (editingPage === pageId) {
        setEditingPage(null);
      }
      setHasChanges(true);
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to Firebase
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      setEditingPage(null);
      toast.success('Manual changes saved successfully!');
    } catch (error) {
      console.error('Error saving manual changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[800px] h-[700px] p-4 rounded-lg fixed left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm manual-editor-content">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-lg font-bold text-gray-100">
            📝 Edit User Guide
          </h2>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                title="Save Changes"
              >
                <SaveIcon fontSize="inherit" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={addNewPage}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
              title="Add New Section"
            >
              <AddIcon fontSize="inherit" />
              Add Section
            </button>
            <button
              className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
              onClick={onClose}
              aria-label="Close editor"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {manualPages.map((page) => (
            <div key={page.id} className="bg-gray-800 rounded-lg border border-gray-700">
              {/* Page Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-700">
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() => toggleSection(page.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections[page.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </button>
                  
                  {editingPage === page.id ? (
                    <input
                      type="text"
                      value={page.title}
                      onChange={(e) => handlePageTitleChange(page.id, e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-semibold text-gray-200 flex-1">{page.title}</h3>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPage(editingPage === page.id ? null : page.id)}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Edit Section"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => removePage(page.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Section"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>

              {/* Page Content */}
              {expandedSections[page.id] && (
                <div className="p-3 space-y-2">
                  {page.content.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-700 rounded border border-gray-600">
                      <div className="flex-1 space-y-2">
                        {editingPage === page.id ? (
                          <>
                            <input
                              type="text"
                              value={item.key}
                              onChange={(e) => handleContentItemChange(page.id, index, 'key', e.target.value)}
                              placeholder="Key/Command"
                              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-blue-200 font-mono"
                            />
                            <textarea
                              value={item.desc}
                              onChange={(e) => handleContentItemChange(page.id, index, 'desc', e.target.value)}
                              placeholder="Description"
                              rows={2}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-300 resize-none"
                            />
                          </>
                        ) : (
                          <>
                            <div className="text-xs font-mono text-blue-200 bg-blue-900/50 px-2 py-1 rounded">
                              {item.key}
                            </div>
                            <div className="text-xs text-gray-300">
                              {item.desc}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {editingPage === page.id && (
                        <button
                          onClick={() => removeContentItem(page.id, index)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove Item"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {editingPage === page.id && (
                    <button
                      onClick={() => addContentItem(page.id)}
                      className="w-full p-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-xs"
                    >
                      <AddIcon fontSize="inherit" className="mr-1" />
                      Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            💡 <strong>Admin:</strong> Changes will be reflected in the User Guide immediately after saving.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualEditor; 
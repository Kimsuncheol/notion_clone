'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';

export interface PageNode {
  id: string;
  name: string;
}

interface FolderNode {
  id: string;
  name: string;
  isOpen: boolean;
  pages: PageNode[];
}

interface SidebarProps {
  selectedPageId: string;
  onSelectPage: (id: string) => void;
}

export interface SidebarHandle {
  renamePage: (id: string, name: string) => void;
  updatePage: (oldId: string, newId: string, name: string) => void;
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(({ selectedPageId, onSelectPage }, ref) => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFolder = () => {
    const id = generateId();
    setFolders([...folders, { id, name: 'New folder', isOpen: true, pages: [] }]);
    setEditingId(id);
    setTempName('New folder');
  };

  const addPage = (folderId: string) => {
    setFolders((prev) =>
      prev.map((f) =>
        f.id === folderId
          ? { ...f, pages: [...f.pages, { id: generateId(), name: 'Untitled' }] }
          : f
      )
    );
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, isOpen: !f.isOpen } : f)));
  };

  const handleDoubleClick = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const handleRename = (id: string) => {
    if (tempName.trim() === '') return;
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === id) return { ...f, name: tempName };
        return { ...f, pages: f.pages.map((p) => (p.id === id ? { ...p, name: tempName } : p)) };
      })
    );
    setEditingId(null);
  };

  useImperativeHandle(ref, () => ({
    renamePage: (id: string, name: string) => {
      setFolders((prev) =>
        prev.map((f) => ({
          ...f,
          pages: f.pages.map((p) => (p.id === id ? { ...p, name } : p)),
        }))
      );
    },
    updatePage: (oldId: string, newId: string, name: string) => {
      setFolders((prev) =>
        prev.map((f) => ({
          ...f,
          pages: f.pages.map((p) =>
            p.id === oldId ? { ...p, id: newId, name } : p
          ),
        }))
      );
    },
  }));

  const renderFolder = (folder: FolderNode) => (
    <div key={folder.id}>
      <div
        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/50 dark:hover:bg-white/10 ${
          folder.isOpen ? 'font-semibold' : ''
        }`}
        onClick={() => handleToggleFolder(folder.id)}
        onDoubleClick={() => handleDoubleClick(folder.id, folder.name)}
      >
        {editingId === folder.id ? (
          <input
            className="w-full bg-transparent focus:outline-none text-sm"
            aria-label="Folder name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={() => handleRename(folder.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename(folder.id);
            }}
            autoFocus
          />
        ) : (
          <span>📁 {folder.name}</span>
        )}
        <button
          className="text-lg px-1"
          title="Add page"
          onClick={(e) => {
            e.stopPropagation();
            addPage(folder.id);
          }}
        >
          ➕
        </button>
      </div>
      {folder.isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-1">
          {folder.pages.map((page) => (
            <div
              key={page.id}
              className={`px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center gap-2 ${
                selectedPageId === page.id ? 'bg-black/10 dark:bg-white/10' : ''
              }`}
              onClick={() => onSelectPage(page.id)}
              onDoubleClick={() => handleDoubleClick(page.id, page.name)}
            >
              {editingId === page.id ? (
                <input
                  className="w-full bg-transparent focus:outline-none text-sm"
                  aria-label="Page name"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => handleRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(page.id);
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <span>📝</span>
                  <span className="truncate">{page.name}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 bg-[color:var(--background)]">
      <div className="flex items-center justify-between mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Workspace</span>
        <button title="Add folder" onClick={addFolder} className="text-lg">
          ➕
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {folders.map(renderFolder)}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 
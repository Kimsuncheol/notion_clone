'use client';
import React, { useRef, useEffect, useState } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {  FolderNode, NoteNode } from '@/store/slices/sidebarSlice';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SkeletonForFolderTree from './skeletonUI/skeletonForFolderTree';
import { useRouter } from 'next/navigation';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import { getPositionById } from '../utils/offsetUtils';
import { useOffsetStore } from '@/store/offsetStore';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import { fetchSubNotes, addSubNotePage } from '@/services/firebase';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAppDispatch } from '@/store/hooks';
import { addSubNote as addSubNoteAction } from '@/store/slices/sidebarSlice';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

// Add this interface for sub-notes
interface FirebaseSubNoteContent {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date | null;
}

interface FolderTreeProps {
  folders: FolderNode[];
  isLoading: boolean;
  selectedPageId: string;
  selectedPageIdToEditTitle: string | null;
  tempName: string;
  hoveredFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  onDoubleClick: (id: string, name: string) => void;
  onRename: (id: string) => void;
  onSetTempName: (name: string) => void;
  onSetHoveredFolderId: (id: string | null) => void;
  onPageClick: (pageId: string) => void;
  onContextMenu: (e: React.MouseEvent, noteId: string) => void;
  isDefaultFolder: (folderType?: 'private' | 'public' | 'custom' | 'trash') => boolean;
  mainContentHeight: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  isLoading,
  selectedPageId,
  selectedPageIdToEditTitle,
  tempName,
  hoveredFolderId,
  onToggleFolder,
  onDoubleClick,
  onRename,
  onSetTempName,
  onSetHoveredFolderId,
  onPageClick,
  onContextMenu,
  isDefaultFolder,
  mainContentHeight,
}) => {
  const folderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [onHoveredPageId, setOnHoveredPageId] = useState<string | null>(null);
  const [onHoveredSubNoteId, setOnHoveredSubNoteId] = useState<string | null>(null);
  const [subNotesMap, setSubNotesMap] = useState<Record<string, FirebaseSubNoteContent[]>>({});
  const [loadingSubNotes, setLoadingSubNotes] = useState<Record<string, boolean>>({});
  const { setSelectedParentSubNoteId, setSelectedNoteId } = useAddaSubNoteSidebarStore();
  const { whereToOpenSubNote, setWhereToOpenSubNote, setSelectedPageIdToEditTitle } = useSidebarStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const {
    toggleShowMoreOptionsAddaSubNoteSidebar
  } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
  const { setOffset } = useOffsetStore();
  const dispatch = useAppDispatch();
  const auth = getAuth(firebaseApp);

  // Load sub-notes when folders change or when a folder is opened
  useEffect(() => {
    const loadSubNotesForOpenFolders = async () => {
      for (const folder of folders) {
        if (folder.isOpen) {
          for (const note of folder.notes) {
            // Only load if we haven't loaded them yet and not currently loading
            if (!subNotesMap[note.id] && !loadingSubNotes[note.id]) {
              setLoadingSubNotes(prev => ({ ...prev, [note.id]: true }));

              try {
                const subNotes = await fetchSubNotes(note.id);
                setSubNotesMap(prev => ({ ...prev, [note.id]: subNotes as unknown as FirebaseSubNoteContent[] }));
              } catch (error) {
                console.error(`Error fetching sub-notes for note ${note.id}:`, error);
                setSubNotesMap(prev => ({ ...prev, [note.id]: [] }));
              } finally {
                setLoadingSubNotes(prev => ({ ...prev, [note.id]: false }));
              }
            }
          }
        }
      }
    };

    loadSubNotesForOpenFolders();
  }, [folders, subNotesMap, loadingSubNotes]);

  // Listen for external sub-notes changes (trash/restore/delete)
  useEffect(() => {
    const handler = (e: CustomEvent<{ parentIds: string[] }>) => {
      const parentIds: string[] = e?.detail?.parentIds || [];
      parentIds.forEach(async (pid) => {
        try {
          setLoadingSubNotes(prev => ({ ...prev, [pid]: true }));
          const updated = await fetchSubNotes(pid);
          setSubNotesMap(prev => ({ ...prev, [pid]: updated as unknown as FirebaseSubNoteContent[] }));
        } catch (err) {
          console.error('Failed to refresh sub-notes for', pid, err);
        } finally {
          setLoadingSubNotes(prev => ({ ...prev, [pid]: false }));
        }
      });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('subnotes-changed', handler as unknown as EventListener);
      return () => window.removeEventListener('subnotes-changed', handler as unknown as EventListener);
    }
  }, []);

  useEffect(() => {
    folders.forEach(folder => {
      if (folder.isOpen) {
        const folderElement = folderRefs.current[folder.id];
        if (folderElement) {
          const height = folderElement.offsetHeight;
          console.log(`Folder "${folder.name}" height: ${height}px`);
          console.log(`Folder "${folder.name}" height / mainContentHeight: ${(height / mainContentHeight) * 100}%`);
        }
      }
    });
  }, [folders, mainContentHeight]);

  // If users click out of the input, reset the selectedPageIdToEditTitle
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('blur', () => {
        setSelectedPageIdToEditTitle(null);
      });
    }
  }, [selectedPageIdToEditTitle]);

  const renderFolder = (folder: FolderNode) => {
    const getFolderIcon = (folderType?: string, isHovered?: boolean) => {
      switch (folderType) {
        case 'private':
          return <LockIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
        case 'public':
          return <PublicIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
        case 'trash':
          return (
            <DeleteOutlineIcon
              style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }}
            />
          );
        default:
          return '📁';
      }
    };

    const isFolderDefault = isDefaultFolder(folder.folderType);
    const isHovered = hoveredFolderId === folder.id;

    const handleFolderClick = () => {
      onToggleFolder(folder.id);
    };

    return (
      <div key={folder.id} ref={el => { folderRefs.current[folder.id] = el; }}>
        <div
          className={`group flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${folder.isOpen ? 'font-semibold' : ''
            }`}
          onClick={handleFolderClick}
          onDoubleClick={() => !isFolderDefault && onDoubleClick(folder.id, folder.name)}
          onMouseEnter={() => onSetHoveredFolderId(folder.id)}
          onMouseLeave={() => onSetHoveredFolderId(null)}
        >
          <div className="flex items-center gap-2 text-sm">
            {getFolderIcon(folder.folderType, isHovered)} {folder.name}
          </div>
        </div>
        {folder.isOpen && (
          <div className={`ml-4 mt-1 flex flex-col gap-1 ${folder.folderType === 'trash' ? 'trash-folder-content' : ''}`}>
            {folder.notes.map((note: NoteNode) => (
              <div key={note.id}>
                <div
                  className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === note.id ? 'bg-black/10 dark:bg-white/10' : ''}`}
                  onMouseEnter={() => setOnHoveredPageId(note.id)}
                  onMouseLeave={() => setOnHoveredPageId(null)}
                  onDoubleClick={() => onDoubleClick(note.id, note.name)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onContextMenu(e, note.id);
                  }}
                >
                  {selectedPageIdToEditTitle === note.id ? (
                    <input
                      ref={inputRef}
                      className="w-full bg-transparent focus:outline-none text-sm"
                      aria-label="Page name"
                      value={tempName}
                      onChange={(e) => onSetTempName(e.target.value)}
                      onBlur={() => onRename(note.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onRename(note.id);
                      }}
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden"
                        onClick={() => {
                          onPageClick(note.id);
                          router.push(`/note/${note.id}`);
                        }}
                        id={note.id + 'note'}
                      >
                        {/* If the note has subnotes, show the arrow forward icon */}
                        {onHoveredPageId === note.id && subNotesMap[note.id] && subNotesMap[note.id].length > 0 ? (
                          <ArrowForwardIosIcon style={{ fontSize: '12px', transform: whereToOpenSubNote === note.id ? 'rotate(90deg)' : 'rotate(0deg)' }} onClick={(e) => { 
                            e.preventDefault();
                            e.stopPropagation();
                            setWhereToOpenSubNote(note.id);
                            setSelectedParentSubNoteId(note.id, '');
                            console.log('whereToOpenSubNote in folder tree: ', whereToOpenSubNote);
                          }} />
                        ) : (
                          <TextSnippetIcon style={{ fontSize: '12px' }} />
                        )}
                        <span className="truncate">{note.name}</span>
                      </div>

                      {onHoveredPageId === note.id && (
                        <div className="flex items-center gap-1">
                          <MoreHorizIcon style={{ fontSize: '12px' }} onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const offset = getPositionById(note.id + 'note');
                            setOffset(offset.x, offset.y);
                            toggleShowMoreOptionsAddaSubNoteSidebar(null, null, note.id, null);
                          }} />
                          <AddIcon style={{ fontSize: '12px' }} onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              const user = auth.currentUser;
                              if (!user) return;
                              const authorName = user.displayName || user.email?.split('@')[0] || 'Anonymous';
                              const created = await addSubNotePage(note.id, user.uid, authorName);
                              const isStringId = typeof created === 'string';
                              const newSubNormalized: FirebaseSubNoteContent = isStringId
                                ? {
                                    id: created as string,
                                    title: '',
                                    createdAt: new Date(),
                                    updatedAt: null,
                                  }
                                : (created as FirebaseSubNoteContent);
                              setSubNotesMap(prev => ({
                                ...prev,
                                [note.id]: [
                                  newSubNormalized,
                                  ...(prev[note.id] || [])
                                ]
                              }));
                              dispatch(addSubNoteAction({ noteId: note.id, subNote: { id: newSubNormalized.id, title: newSubNormalized.title, createdAt: newSubNormalized.createdAt, updatedAt: newSubNormalized.updatedAt || null } }));
                              setWhereToOpenSubNote(note.id);
                              // Open AddaSubNoteSidebar for this parent and focus the new sub-note
                              setSelectedNoteId(newSubNormalized.id);
                              toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, note.id);
                            } catch (e) {
                              console.error('Failed to add sub-note', e);
                            }
                          }} />
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Display sub-notes */}
                {whereToOpenSubNote === note.id && subNotesMap[note.id] && subNotesMap[note.id].length > 0 && (
                  <div className="ml-6 mt-1 flex flex-col gap-1" id={note.id + 'subnotes'}>
                    {subNotesMap[note.id].map((subNote) => (
                      <div
                        key={subNote.id}
                        className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer flex items-center justify-between"
                        onMouseEnter={() => setOnHoveredSubNoteId(subNote.id)}
                        onMouseLeave={() => setOnHoveredSubNoteId(null)}
                      >
                        <div className="flex items-center gap-2 cursor-pointer overflow-hidden"
                          id={subNote.id + 'subnote'}
                        onClick={() => {
                            setSelectedParentSubNoteId(note.id, subNote.id);
                            toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, note.id);
                          }}
                        >
                          <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                          <span className="truncate">{subNote.title || 'Untitled'}</span>
                        </div>
                        {/* More options for sub-note */}
                        {onHoveredSubNoteId === subNote.id && (
                          <div className="flex items-center gap-1">
                            <MoreHorizIcon style={{ fontSize: '12px' }} onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const offset = getPositionById(subNote.id + 'subnote');
                              setOffset(offset.x, offset.y);
                              setSelectedParentSubNoteId(note.id, subNote.id);
                              toggleShowMoreOptionsAddaSubNoteSidebar(null, null, note.id, null);
                            }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <SkeletonForFolderTree />;
  }

  if (folders.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
        <span>No folders yet. Click ➕ to add one.</span>
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {folders.filter((folder: FolderNode) => folder.folderType !== 'trash').map(renderFolder)}
    </nav>
  );
};

export default FolderTree;
// 'use client';
// import React, { useRef, useEffect, useState } from 'react';

// import TextSnippetIcon from '@mui/icons-material/TextSnippet';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import { FolderNode, NoteNode } from '@/store/slices/sidebarSlice';
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// import AddIcon from '@mui/icons-material/Add';
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
// import LockIcon from '@mui/icons-material/Lock';
// import PublicIcon from '@mui/icons-material/Public';
// import FolderIcon from '@mui/icons-material/Folder';

// import { fetchSubNotes } from '@/services/firebase';
// import SkeletonForFolderTree from './skeletonUI/skeletonForFolderTree';
// import { useRouter } from 'next/navigation';
// import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
// import { getPositionById } from '../utils/offsetUtils';
// import { useOffsetStore } from '@/store/offsetStore';
// import { FirebaseSubNoteContent } from '@/types/firebase';

// interface FolderTreeProps {
//   folders: FolderNode[];
//   isLoading: boolean;
//   selectedPageId: string;
//   editingId: string | null;
//   tempName: string;
//   hoveredFolderId: string | null;
//   onToggleFolder: (folderId: string) => void;
//   onDoubleClick: (id: string, name: string) => void;
//   onRename: (id: string) => void;
//   onSetTempName: (name: string) => void;
//   onSetHoveredFolderId: (id: string | null) => void;
//   onPageClick: (pageId: string) => void;
//   onContextMenu: (e: React.MouseEvent, noteId: string) => void;
//   isDefaultFolder: (folderType?: 'private' | 'public' | 'custom' | 'trash') => boolean;
//   mainContentHeight: number;
// }

// const FolderTree: React.FC<FolderTreeProps> = ({
//   folders,
//   isLoading,
//   selectedPageId,
//   editingId,
//   tempName,
//   hoveredFolderId,
//   onToggleFolder,
//   onDoubleClick,
//   onRename,
//   onSetTempName,
//   onSetHoveredFolderId,
//   onPageClick,
//   onContextMenu,
//   isDefaultFolder,
//   mainContentHeight,
// }) => {
//   const folderRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const [onHoveredPageId, setOnHoveredPageId] = useState<string | null>(null);
//   const [subNotesMap, setSubNotesMap] = useState<Record<string, FirebaseSubNoteContent[]>>({});
//   const [loadingSubNotes, setLoadingSubNotes] = useState<Record<string, boolean>>({});

//   const router = useRouter();
//   const {
//     toggleShowMoreOptionsAddaSubNoteSidebar
//   } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
//   const { setOffset } = useOffsetStore();

//   useEffect(() => {
//     const loadSubNotesForOpenFolders = async () => {
//       for (const folder of folders) {
//         if (folder.isOpen) {
//           for (const note of folder.notes) {
//             if (!subNotesMap[note.id] && !loadingSubNotes[note.id]) {
//               setLoadingSubNotes(prev => ({ ...prev, [note.id]: true }));

//               try {
//                 const subNotes = await fetchSubNotes(note.id);
//                 setSubNotesMap(prev => ({ ...prev, [note.id]: subNotes }));
//               } catch (error) {
//                 console.error(`Error fetching sub-notes for note ${note.id}:`, error);
//                 setSubNotesMap(prev => ({ ...prev, [note.id]: [] }));
//               } finally {
//                 setLoadingSubNotes(prev => ({ ...prev, [note.id]: false }));
//               }
//             }
//           }
//         }
//       }
//     };

//     loadSubNotesForOpenFolders();
//   }, [folders, subNotesMap, loadingSubNotes]);


//   useEffect(() => {
//     folders.forEach(folder => {
//       if (folder.isOpen) {
//         const folderElement = folderRefs.current[folder.id];
//         if (folderElement) {
//           const height = folderElement.offsetHeight;
//           console.log(`Folder "${folder.name}" height: ${height}px`);
//           console.log(`Folder "${folder.name}" height / mainContentHeight: ${(height / mainContentHeight) * 100}%`);
//         }
//       }
//     });
//   }, [folders, mainContentHeight]);

//   const renderFolder = (folder: FolderNode) => {
//     const getFolderIcon = (folderType?: string, isHovered?: boolean) => {
//       switch (folderType) {
//         case 'private':
//           return <LockIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
//         case 'public':
//           return <PublicIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
//         case 'trash':
//           return (
//             <DeleteOutlineIcon
//               style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }}
//             />
//           );
//         default:
//           return <FolderIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
//       }
//     };

//     const isFolderDefault = isDefaultFolder(folder.folderType);
//     const isHovered = hoveredFolderId === folder.id;

//     const handleFolderClick = () => {
//       onToggleFolder(folder.id);
//     };

//     return (
//       <div key={folder.id} ref={el => { folderRefs.current[folder.id] = el; }}>
//         <div
//           className={`group flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${folder.isOpen ? 'font-semibold' : ''
//             }`}
//           onClick={handleFolderClick}
//           onDoubleClick={() => !isFolderDefault && onDoubleClick(folder.id, folder.name)}
//           onMouseEnter={() => onSetHoveredFolderId(folder.id)}
//           onMouseLeave={() => onSetHoveredFolderId(null)}
//         >
//           <div className="flex items-center gap-2 text-sm">
//             {getFolderIcon(folder.folderType, isHovered)} {folder.name}
//           </div>
//         </div>
//         {folder.isOpen && (
//           <div className={`ml-4 mt-1 flex flex-col gap-1 ${folder.folderType === 'trash' ? 'trash-folder-content' : ''}`}>
//             {folder.notes.map((note: NoteNode) => (
//               <div
//                 key={note.id}
//                 className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === note.id ? 'bg-black/10 dark:bg-white/10' : ''}`}
//                 onMouseEnter={() => setOnHoveredPageId(note.id)}
//                 onMouseLeave={() => setOnHoveredPageId(null)}
//                 onDoubleClick={() => onDoubleClick(note.id, note.name)}
//                 onContextMenu={(e) => {
//                   e.preventDefault();
//                   onContextMenu(e, note.id);
//                 }}
//               >
//                 {editingId === note.id ? (
//                   <input
//                     className="w-full bg-transparent focus:outline-none text-sm"
//                     aria-label="Page name"
//                     value={tempName}
//                     onChange={(e) => onSetTempName(e.target.value)}
//                     onBlur={() => onRename(note.id)}
//                     onKeyDown={(e) => {
//                       if (e.key === 'Enter') onRename(note.id);
//                     }}
//                     autoFocus
//                   />
//                 ) : (
//                   <>
//                     <div className="flex items-center gap-2 flex-1 min-w-0"
//                       onClick={() => {
//                         onPageClick(note.id);
//                         router.push(`/note/${note.id}`);
//                       }}
//                       id={note.id + 'note'}
//                     >
//                       {onHoveredPageId === note.id ? (
//                         <ArrowForwardIosIcon style={{ fontSize: '12px' }} />
//                       ) : (
//                         <TextSnippetIcon style={{ fontSize: '12px' }} />
//                       )}
//                       <span className="truncate">{note.name}</span>
//                     </div>
//                     {/* If the note has subnotes, display them here */}
//                     {fetchSubNotes(note.id).then(subNotes => {
//                       return (
//                         <div className="flex items-center gap-1 text-xs">
//                           {subNotes.map(subNote => (
//                             <div key={subNote.id}>{subNote.title}</div>
//                           ))}
//                         </div>
//                       );
//                     })}

//                     {onHoveredPageId === note.id && (
//                       <div className="flex items-center gap-1">
//                         <MoreHorizIcon style={{ fontSize: '12px' }} onClick={() => {
//                           const offset = getPositionById(note.id + 'note');
//                           setOffset(offset.x, offset.y);
//                           toggleShowMoreOptionsAddaSubNoteSidebar(null, null, note.id, null);
//                         }} />
//                         <AddIcon style={{ fontSize: '12px' }} onClick={() => {
//                           const offset = getPositionById(note.id + 'note');
//                           setOffset(offset.x, offset.y);
//                           toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, note.id);
//                         }} />
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (isLoading) {
//     return <SkeletonForFolderTree />;
//   }

//   if (folders.length === 0) {
//     return (
//       <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
//         <span>No folders yet. Click ➕ to add one.</span>
//       </div>
//     );
//   }

//   return (
//     <nav className="flex flex-col gap-1">
//       {folders.filter((folder: FolderNode) => folder.folderType !== 'trash').map(renderFolder)}
//     </nav>
//   );
// };

// export default FolderTree; 
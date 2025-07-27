'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Container, Box, Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import { fetchPublicNotes, PublicNote } from '@/services/firebase';
import toast from 'react-hot-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

// 컴포넌트 lazy loading
import dynamic from 'next/dynamic';
import PublicNotesSection from './PublicNotesSection';

const SidebarContainer = dynamic(() => import('./SidebarContainer'), {
  ssr: false, // SSR 비활성화로 빠른 초기 렌더링
});

const CreateNoteForm = dynamic(() => import('./CreateNoteForm'), {
  ssr: false,
});

// const PublicNotesSection = dynamic(() => import('./PublicNotesSection'), {
//   ssr: false,
// });

interface DashboardLayoutProps {
  user: User | null;
}

// 캐시된 공개 노트 (메모리 캐시)
let cachedPublicNotes: PublicNote[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [isPublicNotesLoading, setIsPublicNotesLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [askText, setAskText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // 캐시 유효성 검사
  const isCacheValid = useMemo(() => {
    return cachedPublicNotes && (Date.now() - cacheTimestamp < CACHE_DURATION);
  }, []);

  // 최적화된 공개 노트 로딩
  const loadPublicNotes = useCallback(async () => {
    // 캐시가 유효하면 캐시 사용
    if (isCacheValid && cachedPublicNotes) {
      setPublicNotes(cachedPublicNotes);
      return;
    }

    setIsPublicNotesLoading(true);
    try {
      const notes = await fetchPublicNotes(5);
      setPublicNotes(notes);
      
      // 캐시 업데이트
      cachedPublicNotes = notes;
      cacheTimestamp = Date.now();
    } catch (error) {
      console.error('Error loading public notes:', error);
      toast.error('Failed to load public notes');
    } finally {
      setIsPublicNotesLoading(false);
    }
  }, [isCacheValid]);

  // 사이드바 데이터 로딩
  const loadSidebarDataAsync = useCallback(async () => {
    if (!user) return;
    
    setIsSidebarLoading(true);
    try {
      await dispatch(loadSidebarData());
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setIsSidebarLoading(false);
    }
  }, [user, dispatch]);

  // 병렬 로딩으로 초기화
  useEffect(() => {
    // 즉시 캐시된 데이터가 있으면 표시
    if (isCacheValid && cachedPublicNotes) {
      setPublicNotes(cachedPublicNotes);
    }

    // 비동기 작업들을 병렬로 실행
    Promise.all([
      loadPublicNotes(),
      loadSidebarDataAsync(),
    ]).catch(error => {
      console.error('Dashboard initialization error:', error);
    });
  }, [user, dispatch, isCacheValid, loadPublicNotes, loadSidebarDataAsync]);

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  // 점진적 로딩: 핵심 UI부터 표시
  const showSkeleton = isPublicNotesLoading && publicNotes.length === 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <NoteCreationProvider>
        <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
          {/* 사용자가 있고 사이드바가 표시되어야 할 때 */}
          {user && sidebarVisible && (
            <>
              {isSidebarLoading ? (
                // 사이드바 skeleton
                <Box sx={{ width: 280, flexShrink: 0, bgcolor: '#2d3748', p: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: '#4a5568', mb: 2 }} />
                    <Skeleton variant="rectangular" width="60%" height={24} sx={{ bgcolor: '#4a5568' }} />
                  </Box>
                  {[...Array(6)].map((_, idx) => (
                    <Skeleton 
                      key={idx} 
                      variant="rectangular" 
                      width="100%" 
                      height={32} 
                      sx={{ bgcolor: '#4a5568', mb: 1 }} 
                    />
                  ))}
                </Box>
              ) : (
                <SidebarContainer
                  user={user}
                  sidebarVisible={sidebarVisible}
                  setSidebarVisible={setSidebarVisible}
                  selectedPageId={selectedPageId}
                  onSelectPage={handleSelectPage}
                />
              )}
            </>
          )}
          
          <div className="flex-1 flex flex-col">
            <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
              {/* Create Note Form - 즉시 표시 */}
              <CreateNoteForm
                askText={askText}
                onAskTextChange={setAskText}
                isUserAuthenticated={!!user}
                onFilesSelect={setSelectedFiles}
                selectedFiles={selectedFiles}
              />

              {/* Public Notes Section - 캐시된 데이터나 skeleton 표시 */}
              <PublicNotesSection
                publicNotes={publicNotes}
                isLoading={showSkeleton}
                onNoteClick={handleNoteClick}
              />
            </Container>
          </div>
        </div>
      </NoteCreationProvider>
    </DndProvider>
  );
};

export default DashboardLayout;
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { User } from 'firebase/auth';
// import { Container, Box, Skeleton } from '@mui/material';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch } from '@/store/hooks';
// import { loadSidebarData } from '@/store/slices/sidebarSlice';
// import { fetchPublicNotes, PublicNote } from '@/services/firebase';
// import toast from 'react-hot-toast';
// import SidebarContainer from './SidebarContainer';
// import CreateNoteForm from './CreateNoteForm';
// import PublicNotesSection from './PublicNotesSection';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

// interface DashboardLayoutProps {
//   user: User | null;
// }

// const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
//   const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitializing, setIsInitializing] = useState(true); // 초기화 상태 추가
//   const [askText, setAskText] = useState('');
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [selectedPageId, setSelectedPageId] = useState<string>('initial');
//   const [sidebarVisible, setSidebarVisible] = useState(true);
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const initializeDashboard = async () => {
//       try {
//         // 공개 노트 로드
//         await loadPublicNotes();
        
//         // 사용자가 있으면 사이드바 데이터 로드
//         if (user) {
//           await dispatch(loadSidebarData());
//         }
//       } catch (error) {
//         console.error('Dashboard initialization error:', error);
//       } finally {
//         setIsInitializing(false); // 초기화 완료
//       }
//     };

//     initializeDashboard();
//   }, [user, dispatch]);

//   const loadPublicNotes = async () => {
//     setIsLoading(true);
//     try {
//       const notes = await fetchPublicNotes(5);
//       setPublicNotes(notes);
//     } catch (error) {
//       console.error('Error loading public notes:', error);
//       toast.error('Failed to load public notes');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleNoteClick = (noteId: string) => {
//     router.push(`/note/${noteId}`);
//   };

//   const handleSelectPage = (pageId: string) => {
//     setSelectedPageId(pageId);
//     router.push(`/note/${pageId}`);
//   };

//   // 초기화 중이면 skeleton UI 표시
//   if (isInitializing) {
//     return (
//       <DndProvider backend={HTML5Backend}>
//         <NoteCreationProvider>
//           <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
//             {/* Sidebar Skeleton */}
//             {user && (
//               <Box sx={{ width: 280, flexShrink: 0, bgcolor: '#2d3748', p: 2 }}>
//                 <Box sx={{ mb: 3 }}>
//                   <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: '#4a5568', mb: 2 }} />
//                   <Skeleton variant="rectangular" width="60%" height={24} sx={{ bgcolor: '#4a5568' }} />
//                 </Box>
//                 {[...Array(6)].map((_, idx) => (
//                   <Skeleton 
//                     key={idx} 
//                     variant="rectangular" 
//                     width="100%" 
//                     height={32} 
//                     sx={{ bgcolor: '#4a5568', mb: 1 }} 
//                   />
//                 ))}
//               </Box>
//             )}
            
//             <div className="flex-1 flex flex-col">
//               <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
//                 {/* Create Note Form Skeleton */}
//                 <Box sx={{ mb: 4 }}>
//                   <Skeleton variant="rectangular" width="100%" height={120} sx={{ bgcolor: '#4a5568', mb: 2 }} />
//                   <Box sx={{ display: 'flex', gap: 2 }}>
//                     <Skeleton variant="rectangular" width={100} height={36} sx={{ bgcolor: '#4a5568' }} />
//                     <Skeleton variant="rectangular" width={80} height={36} sx={{ bgcolor: '#4a5568' }} />
//                   </Box>
//                 </Box>

//                 {/* Public Notes Section Skeleton */}
//                 <Box sx={{ width: '100%', mx: 'auto' }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                     <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: '#4a5568' }} />
//                   </Box>
                  
//                   <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
//                     {[...Array(3)].map((_, idx) => (
//                       <Box
//                         key={idx}
//                         sx={{
//                           width: 250,
//                           height: 200,
//                           backgroundColor: '#4a5568',
//                           borderRadius: 2,
//                         }}
//                       >
//                         <Skeleton variant="rectangular" animation="wave" height={80} sx={{ bgcolor: '#5a6676' }} />
//                         <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                           <Skeleton variant="text" animation="wave" width="80%" height={16} sx={{ bgcolor: '#5a6676' }} />
//                           <Skeleton variant="text" animation="wave" width="60%" height={12} sx={{ bgcolor: '#5a6676' }} />
//                           <Skeleton variant="text" animation="wave" width="40%" height={10} sx={{ bgcolor: '#5a6676' }} />
//                         </Box>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Box>
//               </Container>
//             </div>
//           </div>
//         </NoteCreationProvider>
//       </DndProvider>
//     );
//   }

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <NoteCreationProvider>
//         <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
//           {/* 사용자가 있을 때만 사이드바 렌더링 */}
//           {user && (
//             <SidebarContainer
//               user={user}
//               sidebarVisible={sidebarVisible}
//               setSidebarVisible={setSidebarVisible}
//               selectedPageId={selectedPageId}
//               onSelectPage={handleSelectPage}
//             />
//           )}
          
//           <div className="flex-1 flex flex-col">
//             <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
//               <CreateNoteForm
//                 askText={askText}
//                 onAskTextChange={setAskText}
//                 isUserAuthenticated={!!user}
//                 onFilesSelect={setSelectedFiles}
//                 selectedFiles={selectedFiles}
//               />

//               {/* PublicNotesSection은 항상 렌더링 */}
//               <PublicNotesSection
//                 publicNotes={publicNotes}
//                 isLoading={isLoading}
//                 onNoteClick={handleNoteClick}
//               />
//             </Container>
//           </div>
//         </div>
//       </NoteCreationProvider>
//     </DndProvider>
//   );
// };

// export default DashboardLayout;
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { User } from 'firebase/auth';
// import { Container } from '@mui/material';
// import { useRouter } from 'next/navigation';
// import { useAppDispatch } from '@/store/hooks';
// import { loadSidebarData } from '@/store/slices/sidebarSlice';
// import { fetchPublicNotes, PublicNote } from '@/services/firebase';
// import toast from 'react-hot-toast';
// import SidebarContainer from './SidebarContainer';
// import CreateNoteForm from './CreateNoteForm';
// import PublicNotesSection from './PublicNotesSection';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

// interface DashboardLayoutProps {
//   user: User | null;
// }

// const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
//   const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [askText, setAskText] = useState('');
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [selectedPageId, setSelectedPageId] = useState<string>('initial');
//   const [sidebarVisible, setSidebarVisible] = useState(true);
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const initializeDashboard = async () => {
//       try {
//         await loadPublicNotes();

//         if (user) {
//           await dispatch(loadSidebarData());
//         }
//       } catch (error) {
//         console.error('Error initializing dashboard:', error);
//         toast.error('Failed to initialize dashboard');
//       } finally {
//         setIsLoading(false);  // Complete loading state
//       }
//     };

//     initializeDashboard();
//     // loadPublicNotes();
//     // if (user) {
//     //   dispatch(loadSidebarData());
//     // }
//   }, [user, dispatch]);

//   const loadPublicNotes = async () => {
//     setIsLoading(true);
//     try {
//       const notes = await fetchPublicNotes(5);
//       setPublicNotes(notes);
//     } catch (error) {
//       console.error('Error loading public notes:', error);
//       toast.error('Failed to load public notes');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleNoteClick = (noteId: string) => {
//     router.push(`/note/${noteId}`);
//   };

//   const handleSelectPage = (pageId: string) => {
//     setSelectedPageId(pageId);
//     router.push(`/note/${pageId}`);
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <NoteCreationProvider>
//         <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
//           <SidebarContainer
//             user={user}
//             sidebarVisible={sidebarVisible}
//             setSidebarVisible={setSidebarVisible}
//             selectedPageId={selectedPageId}
//             onSelectPage={handleSelectPage}
//           />
//           <div className="flex-1 flex flex-col">
//             <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
//               <CreateNoteForm
//                 askText={askText}
//                 onAskTextChange={setAskText}
//                 isUserAuthenticated={!!user}
//                 onFilesSelect={setSelectedFiles}
//                 selectedFiles={selectedFiles}
//               />

//               <PublicNotesSection
//                 publicNotes={publicNotes}
//                 isLoading={isLoading}
//                 onNoteClick={handleNoteClick}
//               />
//             </Container>
//           </div>
//         </div>
//       </NoteCreationProvider>
//     </DndProvider>
//   );
// };

// export default DashboardLayout; 
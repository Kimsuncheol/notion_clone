'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Box, Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import { setAllItems } from '@/store/slices/dashboardSlice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';
import RefreshTimeoutModal from '@/components/RefreshTimeoutModal';
import CreateNoteForm from './CreateNoteForm';

// 컴포넌트 lazy loading
import dynamic from 'next/dynamic';
import TrendingHeader from '../trending/TrendingHeader';
import TrendingGrid from '../trending/TrendingGrid';
import { mockTrendingItems } from '@/constants/mockDatalist';
import ChipsBar from './ChipsBar';
// import PublicNotesSection from './PublicNotesSection';

const SidebarContainer = dynamic(() => import('./SidebarContainer'), {
  ssr: false, // SSR 비활성화로 빠른 초기 렌더링
  loading: () => <Skeleton variant="rectangular" width="100%" height={40} sx={{ bgcolor: '#4a5568', mb: 2 }} />
});

interface DashboardLayoutProps {
  user: User | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [sidebarVisible, setSidebarVisible] = useState(true);

  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Get filtered items from Redux store
  const filteredItems = useAppSelector(state => state.dashboard.filteredItems);



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
    // Initialize dashboard data with mock items
    dispatch(setAllItems(mockTrendingItems));

    // 비동기 작업들을 병렬로 실행
    Promise.all([
      loadSidebarDataAsync(),
    ]).catch(error => {
      console.error('Dashboard initialization error:', error);
    }).finally(() => {
      // After all the loading is done, clear the timeout
    });

  }, [user, dispatch, loadSidebarDataAsync]);

  const handleSelectPage = async (pageId: string) => {
    setSelectedPageId(pageId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/note/${pageId}`);
  };

  // mock

  // If the page is timed out, show the timeout UI
  // Overlay modal will handle timeouts; keep rendering baseline UI underneath

  return (
    <DndProvider backend={HTML5Backend}>
      <NoteCreationProvider>
        <div className="flex min-h-screen text-sm sm:text-base" >
          <RefreshTimeoutModal
            open={showTimeoutModal}
            onRefresh={() => window.location.reload()}
            onClose={() => setShowTimeoutModal(false)}
          />
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

          <div className="flex-1 flex flex-col justify-center items-center">
            <div className='w-[80%] mx-auto'>
              <TrendingHeader />
            </div>
            {/* How do I add sticky effect to the 'create-note-form'? */}
            <div className='w-[80%] h-dvh flex justify-center items-center' id='create-note-form-section'>
              {/* Create Note Form - 즉시 표시 */}
              <CreateNoteForm/>
            </div>
            <div className='w-[80%] flex flex-col gap-4' id='my-notes-section'>
              <ChipsBar />
              <TrendingGrid items={filteredItems} />
            </div>
          </div>
        </div>
      </NoteCreationProvider>
    </DndProvider>
  );
};

export default DashboardLayout;
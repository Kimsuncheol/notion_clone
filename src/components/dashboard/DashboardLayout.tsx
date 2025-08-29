'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import { setAllItems } from '@/store/slices/dashboardSlice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';
import RefreshTimeoutModal from '@/components/RefreshTimeoutModal';
import CreateNoteForm from './CreateNoteForm';

// 컴포넌트 lazy loading
import TrendingHeader from '../trending/TrendingHeader';
import TrendingGrid from '../trending/TrendingGrid';
import { mockTrendingItems } from '@/constants/mockDatalist';
import ChipsBar from './ChipsBar';

interface DashboardLayoutProps {
  user: User | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  const dispatch = useAppDispatch();
  
  // Get filtered items from Redux store
  const filteredItems = useAppSelector(state => state.dashboard.filteredItems);

  // 사이드바 데이터 로딩
  const loadSidebarDataAsync = useCallback(async () => {
    if (!user) return;

    try {
      await dispatch(loadSidebarData());
    } catch (error) {
      console.error('Error loading sidebar data:', error);
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
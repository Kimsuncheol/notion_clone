'use client';
import React, { useEffect, useCallback } from 'react';
import { useModalStore } from '@/store/modalStore';
import { updateUserBeginnerStatus } from '@/services/firebase';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onCloseManualSidebar?: () => void;
}

const BeginnerConfirmModal: React.FC<Props> = ({ open, onClose, onCloseManualSidebar }) => {
  const { setIsBeginner, setManualDismissedForSession } = useModalStore();

  const handleYes = useCallback(async () => {
    try {
      console.log('Updating beginner status to false');
      await updateUserBeginnerStatus(false);
      setIsBeginner(false);
      setManualDismissedForSession(false);

      onClose();
      onCloseManualSidebar?.();
      toast.success('Welcome! You can always access the manual later from the help menu.');
    } catch (error) {
      console.error('Error updating beginner status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  }, [setIsBeginner, setManualDismissedForSession, onClose, onCloseManualSidebar]);

  const handleNo = useCallback(() => {
    setManualDismissedForSession(true);
    onClose();
    onCloseManualSidebar?.();
  }, [setManualDismissedForSession, onClose, onCloseManualSidebar]);

  // Click outside to close modal
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.beginner-confirm-modal-content')) {
        handleNo();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleNo]);

  // Handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleNo();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, handleNo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#262626] text-white text-sm rounded-lg p-6 max-w-sm w-full mx-4 beginner-confirm-modal-content">
        <div className="text-center mb-6">
          <div className="text-2xl mb-3">📖</div>
          <p className="text-white">Have you read through the manual?</p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleYes}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
          >
            Yes
          </button>
          <button
            onClick={handleNo}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-medium"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeginnerConfirmModal; 
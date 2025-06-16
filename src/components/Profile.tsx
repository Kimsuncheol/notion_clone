'use client';
import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import SettingsComponent from './SettingsComponent';
import { useModalStore } from '@/store/modalStore';

interface Props {
  onClose?: () => void;
}

const Profile: React.FC<Props> = ({ onClose }) => {
  const { showSettings, setShowSettings } = useModalStore();
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out');
      onClose?.();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleNewWorkspace = () => {
    toast('New workspace functionality coming soon', { icon: 'ℹ️' });
  };

  const handleCreateWorkAccount = () => {
    toast('Create work account functionality coming soon', { icon: 'ℹ️' });
  };

  const handleAddAnotherAccount = () => {
    toast('Add another account functionality coming soon', { icon: 'ℹ️' });
  };

  const handleInviteMembers = () => {
    toast('Invite members functionality coming soon', { icon: 'ℹ️' });
  };

  if (!user) {
    return null;
  }

  const userName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <>
      <div className="w-60 aspect-square p-2 rounded-lg bg-gray-800">
        {/* Top Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
            {userName}&apos;s workspace
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
            >
              ⚙️ Settings
            </button>
            <button
              onClick={handleInviteMembers}
              className="flex-1 px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
            >
              👥 Invite members
            </button>
          </div>
        </div>

        {/* Middle Section */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            {user.email}
          </div>
          
          <div className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
            <span className="text-sm">선</span>
            <span className="text-sm font-medium">선철 김&apos;s Notion</span>
            <span className="ml-auto text-green-500">✓</span>
          </div>

          <button
            onClick={handleNewWorkspace}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>➕</span>
            <span>New workspace</span>
          </button>

          <button
            onClick={handleCreateWorkAccount}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>💼</span>
            <span>Create work account</span>
          </button>

          <button
            onClick={handleAddAnotherAccount}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>👤</span>
            <span>Add another account</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <span>🚪</span>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsComponent onClose={() => setShowSettings(false)} />
      )}
    </>
  );
};

export default Profile;

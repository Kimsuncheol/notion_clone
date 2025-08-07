'use client';
import React, { useState, useEffect } from 'react';
import { getAuth, deleteUser } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { useModalStore } from '@/store/modalStore';

interface SettingsComponentProps {
  onClose: () => void;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'notifications' | 'general'>('preferences');
  const [activePreferenceTab, setActivePreferenceTab] = useState<'appearance' | 'language'>('appearance');
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>('auto');
  const [language, setLanguage] = useState('en-US');
  const [_, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [chatRoomNotifications, setChatRoomNotifications] = useState(true);
  const [aiChatNotifications, setAiChatNotifications] = useState(true);
  const { setShowSettings } = useModalStore();
  const auth = getAuth(firebaseApp);

  // Click-outside detection to close settings modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close if clicking outside the settings modal content
      if (!target.closest('.settings-modal-content')) {
        setShowSettings(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSettings, onClose]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSettings(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [setShowSettings, onClose]);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-UK', name: 'English (UK)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'ko', name: 'Korean' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
  ];

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  const handleDeleteWorkspace = () => {
    if (window.confirm('Are you sure you want to delete your entire workspace? This action cannot be undone.')) {
      toast.error('Delete workspace functionality is not yet implemented');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.')) {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await deleteUser(currentUser);
          toast.success('Account deleted successfully');
          setShowSettings(false);
          onClose();
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account. Please try again or contact support.');
      }
    }
  };

  const handleSaveNotificationPreferences = () => {
    // Here you could save preferences to Firebase or localStorage
    toast.success('Notification preferences saved');
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    onClose();
  };

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 settings-modal">
      <div className="w-4/5 h-4/5 bg-[#262626] rounded-lg shadow-xl flex flex-col settings-modal-content">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Settings</h2>
          <button
            onClick={handleCloseSettings}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✖
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('preferences')}
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === 'preferences'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-3 py-2 rounded ${
                  activeTab === 'general'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                General
              </button>
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#262626]">
            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Preferences</h3>
                
                <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActivePreferenceTab('appearance')}
                    className={`pb-2 px-1 ${
                      activePreferenceTab === 'appearance'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Appearance
                  </button>
                  <button
                    onClick={() => setActivePreferenceTab('language')}
                    className={`pb-2 px-1 ${
                      activePreferenceTab === 'language'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Language & Time
                  </button>
                </div>

                {activePreferenceTab === 'appearance' && (
                  <div>
                    <div className="mb-4">
                      <label htmlFor="theme-select" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Theme</label>
                      <select
                        id="theme-select"
                        value={appearance}
                        onChange={(e) => setAppearance(e.target.value as 'light' | 'dark' | 'auto')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activePreferenceTab === 'language' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="language-select" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Language</label>
                      <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="timezone-select" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Timezone</label>
                      <select
                        id="timezone-select"
                        defaultValue={timeZone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Notifications</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive updates and notifications via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle email notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">Chat Room Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications for new messages in support chat rooms
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chatRoomNotifications}
                        onChange={(e) => setChatRoomNotifications(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle chat room notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">AI Chat Room Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications for AI chat responses and updates
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiChatNotifications}
                        onChange={(e) => setAiChatNotifications(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle AI chat notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleSaveNotificationPreferences}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">General</h3>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-red-800 dark:text-red-400 font-semibold mb-2">Danger Zone</h4>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-4">
                    These actions are permanent and cannot be undone.
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={handleDeleteWorkspace}
                      className="w-full text-left px-4 py-3 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div className="font-medium text-red-800 dark:text-red-400">Delete entire workspace</div>
                      <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all your notes, folders, and workspace data</div>
                    </button>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-4 py-3 border border-red-300 dark:border-red-700 rounded bg-white dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div className="font-medium text-red-800 dark:text-red-400">Delete your account</div>
                      <div className="text-sm text-red-600 dark:text-red-500">Permanently delete your account and all associated data</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsComponent; 
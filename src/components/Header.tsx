'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { firebaseApp } from '@/constants/firebase';
import { getAuth } from 'firebase/auth';
import SocialShareDropdown from './SocialShareDropdown';
import NotificationCenter from './NotificationCenter';
import { useModalStore } from '@/store/modalStore';
import { getUnreadNotificationCount } from '@/services/firebase';
import NotificationsIcon from '@mui/icons-material/Notifications';
import toast from 'react-hot-toast';

interface Props {
  onOpenManual: () => void;
}

const Header: React.FC<Props> = ({ onOpenManual }) => {
  const pathname = usePathname();
  const auth = getAuth(firebaseApp);
  const [captureProtectionEnabled, setCaptureProtectionEnabled] = useState(false);
  const captureProtectionRef = useRef(false); // tracks current protection state
  const [showSocialDropdown, setShowSocialDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Notification state
  const { 
    showNotifications, 
    setShowNotifications, 
    unreadNotificationCount, 
    setUnreadNotificationCount 
  } = useModalStore();
  
  // Load unread notification count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (auth.currentUser) {
        try {
          const count = await getUnreadNotificationCount();
          setUnreadNotificationCount(count);
        } catch (error) {
          console.error('Error loading unread notification count:', error);
        }
      }
    };

    loadUnreadCount();
    // Set up interval to check for new notifications
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [auth.currentUser, setUnreadNotificationCount]);

  // Check if we're on a note page
  const isNotePage = pathname.startsWith('/note/') && pathname !== '/note';
  const noteId = pathname.startsWith('/note/') ? pathname.split('/note/')[1] : '';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSocialDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCaptureProtection = () => {
    setCaptureProtectionEnabled(!captureProtectionEnabled);
    captureProtectionRef.current = !captureProtectionEnabled;
    
    if (!captureProtectionEnabled) {
      console.log('Enabling capture prevention');
      // Enable capture prevention
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      (document.body.style as unknown as Record<string, string>).mozUserSelect = 'none';
      (document.body.style as unknown as Record<string, string>).msUserSelect = 'none';
      
      // Disable right click
      document.addEventListener('contextmenu', preventDefaultAction);
      // Disable certain keyboard shortcuts
      document.addEventListener('keydown', preventKeyboardShortcuts);
      // Add blur overlay on focus out
      window.addEventListener('blur', addBlurOverlay);
      
      toast.success('Screen capture protection enabled');
    } else {
      // Disable capture prevention
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      (document.body.style as unknown as Record<string, string>).mozUserSelect = '';
      (document.body.style as unknown as Record<string, string>).msUserSelect = '';
      
      document.removeEventListener('contextmenu', preventDefaultAction);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      window.removeEventListener('blur', addBlurOverlay);
      removeBlurOverlay();
      
      toast.success('Screen capture protection disabled');
    }
  };

  const preventDefaultAction = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const preventKeyboardShortcuts = (e: KeyboardEvent) => {
    // Prevent F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+Shift+C, etc.
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
      (e.metaKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
      (e.metaKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
    ) {
      e.preventDefault();
      return false;
    }
  };

  const addBlurOverlay = () => {
    // Guard: if protection is disabled, do nothing
    if (!captureProtectionRef.current) return;

    if (document.getElementById('capture-protection-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'capture-protection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      z-index: 999999;
      pointer-events: none;
    `;
    overlay.textContent = 'Content Protected - Focus Required';
    document.body.appendChild(overlay);
    
    // Remove overlay when window regains focus
    const removeOnFocus = () => {
      removeBlurOverlay();
      window.removeEventListener('focus', removeOnFocus);
    };
    window.addEventListener('focus', removeOnFocus);
  };

  const removeBlurOverlay = () => {
    const overlay = document.getElementById('capture-protection-overlay');
    if (overlay) {
      overlay.remove();
    }
  };

  return (
    <header className="w-full flex items-center justify-end px-6 py-2 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
      {/* Social Media Sharing Dropdown - only show on note pages */}
      {isNotePage && (
        <div className="relative mr-4" ref={dropdownRef}>
          <button
            onClick={() => setShowSocialDropdown(!showSocialDropdown)}
            className="rounded px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
            title="Share this note"
          >
            <span>📤</span>
            <span>Share</span>
            <span className={`text-xs transition-transform ${showSocialDropdown ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {showSocialDropdown && (
            <div className="absolute top-full left-0 mt-1" >
              <SocialShareDropdown noteId={noteId} onClose={() => setShowSocialDropdown(false)} />
            </div>
          )}
        </div>
      )}

      {/* Screen Capture Prevention - only show on note pages */}
      {isNotePage && (
        <button
          onClick={toggleCaptureProtection}
          className={`rounded px-3 py-1 text-sm flex items-center gap-1 mr-2 ${
            captureProtectionEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={captureProtectionEnabled ? 'Disable Capture Protection' : 'Enable Capture Protection'}
        >
          <span>{captureProtectionEnabled ? '🔒' : '🔓'}</span>
          <span>{captureProtectionEnabled ? 'Protected' : 'Unprotected'}</span>
        </button>
      )}

      {pathname !== '/dashboard' && (
        <Link href="/dashboard" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1 mr-2">
          <span>🌐</span>
          <span>Dashboard</span>
        </Link>
      )}
      
      {!auth.currentUser && (
        <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center gap-1">
          <span>🔑</span>
          <span className="sr-only">Sign In</span>
        </Link>
      )}

      {/* Notification Center Button */}
      {auth.currentUser && (
        <button
          onClick={() => setShowNotifications(true)}
          className="relative rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2 flex items-center gap-1"
          title="Notifications"
        >
          <NotificationsIcon fontSize="small" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>
      )}

      <button
        onClick={onOpenManual}
        className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2"
      >
        📖 Manual
      </button>

      {/* Notification Center Modal */}
      <NotificationCenter
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationCountChange={setUnreadNotificationCount}
      />
    </header>
  );
};

export default Header; 
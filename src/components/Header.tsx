'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { firebaseApp } from '@/constants/firebase';
import { getAuth } from 'firebase/auth';
import { CopyToClipboard } from 'react-copy-to-clipboard';
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

  // Check if we're on a note page
  const isNotePage = pathname.startsWith('/note/') && pathname !== '/note';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
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

  const handleShare = (platform: string) => {
    const noteId = pathname.split('/note/')[1];
    const shareUrl = `${window.location.origin}/note/${noteId}`;
    const title = 'Check out this note!';
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    setShowSocialDropdown(false); // Close dropdown after sharing
  };

  const handleCopyLink = () => {
    toast.success('Link copied to clipboard!');
    setShowSocialDropdown(false); // Close dropdown after copying
  };

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
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              <div className="flex items-center" id="social-media-sharing">
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 rounded-l-md transition-colors"
                  title="Share on Twitter"
                >
                  🐦
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="px-3 py-2 text-xs bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1 transition-colors"
                  title="Share on Facebook"
                >
                  📘
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 transition-colors"
                  title="Share on LinkedIn"
                >
                  💼
                </button>
                <button
                  onClick={() => handleShare('reddit')}
                  className="px-3 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 transition-colors"
                  title="Share on Reddit"
                >
                  🤖
                </button>
                <CopyToClipboard text={currentUrl} onCopy={handleCopyLink}>
                  <button
                    className="px-3 py-2 text-xs bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-1 rounded-r-md transition-colors"
                    title="Copy Link"
                  >
                    🔗
                  </button>
                </CopyToClipboard>
              </div>
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

      <button
        onClick={onOpenManual}
        className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 ml-2"
      >
        📖 Manual
      </button>
    </header>
  );
};

export default Header; 
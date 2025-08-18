import React, { useEffect } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { trendingPageModalBgColor, trendingPageSelectionColor } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface TrendingHeaderModalProps {
  options: { label: string, value: string, path: string }[];
  onClose: () => void;
  router: AppRouterInstance;
}

export default function TrendingHeaderModal({ options, onClose, router }: TrendingHeaderModalProps) {
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      
      const target = event.target as HTMLElement; // Cast to Element
      const modal = document.querySelector('.trending-header-modal');

      if (modal && !modal.contains(target) && !target.closest('#trending-header-item-with-avatar')) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);

  return (
    <List sx={{ position: 'absolute', top: '72px', right: '20px', width: '200px', backgroundColor: trendingPageModalBgColor, borderRadius: '8px', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className='trending-header-modal'>
      {options.map((option) => (
        <ListItem
          key={option.value}
          onClick={async () => {
            if (option.label === "Sign out") {
              await signOut(auth);
              toast.success('Successfully signed out');
              onClose();
              return;
            }
            router.push(option.path);
            onClose();
          }}
          sx={{
            cursor: 'pointer',
            '&:hover': { backgroundColor: trendingPageSelectionColor }
          }}
        >
          <ListItemText primary={option.label} />
        </ListItem>
      ))}
    </List>
  )
}

import React, { useEffect, useState } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { grayColor4, grayColor5 } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface TrendingHeaderModalProps {
  options: { label: string, value: string, path: string }[];
  onClose: () => void;
  router: AppRouterInstance;
  shouldPreventNavigation: boolean;
  onBlockedNavigation: () => void;
}

export default function TrendingHeaderModal({
  options,
  onClose,
  router,
  shouldPreventNavigation,
  onBlockedNavigation,
}: TrendingHeaderModalProps) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const [menuItems, setMenuItems] = useState<{ label: string, value: string, path: string }[]>([]);

  useEffect(() => {
    setMenuItems(options);

  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;

      const target = event.target as HTMLElement; // Cast to Element
      const modal = document.querySelector('.trending-header-modal');

      if (modal && !modal.contains(target) && !target.closest('.trending-header-item-with-icon')) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);


  return (
    <List sx={{ position: 'absolute', top: '72px', right: '20px', width: '200px', backgroundColor: grayColor4, borderRadius: '8px', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className='trending-header-modal'>
      {menuItems.map((option) => (
        <ListItem
          key={option.value}
          onClick={async () => {
            if (shouldPreventNavigation) {
              onBlockedNavigation();
              return;
            }

            if (option.label === "Sign Out") {
              await signOut(auth);
              toast.success('Successfully signed out');
              onClose();
              router.push(option.path);
              return;
            } else {
              // Check if the user is logged in
              if (user) {
                router.push(option.path);
                onClose();
              } else {
                toast.error('Please sign in to access this page');
              }
            }
          }}
          sx={{
            cursor: 'pointer',
            p: '2px 16px',
            '&:hover': { backgroundColor: grayColor5 }
          }}
        >
          <ListItemText primary={option.label} 
          sx={{
            '& .MuiListItemText-primary': { fontSize: '14px' },
            '& .MuiListItemText-secondary': { fontSize: '12px' },
          }} />
        </ListItem>
      ))}
    </List>
  )
}

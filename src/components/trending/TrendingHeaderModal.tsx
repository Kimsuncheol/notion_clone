import React, { useEffect, useState } from 'react'
import { List, ListItem, ListItemText } from '@mui/material'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { grayColor4, grayColor5 } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { getAuth, signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';

interface TrendingHeaderModalProps {
  options: { label: string, value: string, path: string }[];
  subOptions: { label: string, value: string, path: string }[];
  isClickedOther: boolean;
  setIsClickedOther: (isClickedOther: boolean) => void;
  onClose: () => void;
  router: AppRouterInstance;
}

export default function TrendingHeaderModal({ options, subOptions, isClickedOther, setIsClickedOther, onClose, router }: TrendingHeaderModalProps) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const [menuItems, setMenuItems] = useState<{ label: string, value: string, path: string }[]>([]);

  useEffect(() => {
    if (isClickedOther) {
      setMenuItems(subOptions);
    } else {
      setMenuItems(options);
    }
  }, [options, subOptions, isClickedOther]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;

      const target = event.target as HTMLElement; // Cast to Element
      const modal = document.querySelector('.trending-header-modal');

      if (modal && !modal.contains(target) && !target.closest('.trending-header-item-with-icon')) {
        setIsClickedOther(false);
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose, setIsClickedOther]);


  return (
    <List sx={{ position: 'absolute', top: '72px', right: '20px', width: '200px', backgroundColor: grayColor4, borderRadius: '8px', boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)', zIndex: 1000 }} className='trending-header-modal'>
      {menuItems.map((option) => (
        <ListItem
          key={option.value}
          onClick={async () => {
            if (option.label === "Sign Out") {
              await signOut(auth);
              toast.success('Successfully signed out');
              onClose();
              router.push('/signin');
              return;
            } else if (option.label !== 'Others') {
              // Check if the user is logged in
              if (user) {
                router.push(option.path);
                onClose();
              } else {
                toast.error('Please sign in to access this page');
              }
            } else {
              setIsClickedOther(true);
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

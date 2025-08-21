import React, { useEffect } from 'react'
import { List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import { trendingPageModalBgColor, trendingPageSelectionColor } from '@/constants/color'
import FunctionsIcon from '@mui/icons-material/Functions';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';



interface SelectSpecialCharactersModalProps {
  onClose: () => void;
  onSelectLaTeX: () => void;
  onSelectEmoji: () => void;
  position?: { top?: string; right?: string; left?: string; bottom?: string };
}

export default function SelectSpecialCharactersModal({ 
  onClose, 
  onSelectLaTeX, 
  onSelectEmoji,
  position = { top: '72px', right: '20px' }
}: SelectSpecialCharactersModalProps) {
  
  const options = [
    {
      label: 'Math Expression',
      icon: <FunctionsIcon sx={{ color: 'white' }} />,
      action: onSelectLaTeX,
    },
    {
      label: 'Emoji',
      icon: <EmojiEmotionsIcon sx={{ color: 'white' }} />,
      action: onSelectEmoji,
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      
      const target = event.target as HTMLElement;
      const modal = document.querySelector('.special-characters-modal');

      if (modal && !modal.contains(target) && !target.closest('#special-characters-trigger')) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);

  
  // if user clicks outside the modal, close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      const modal = document.querySelector('.special-characters-modal');
      
      if (modal && !modal.contains(target) && !target.closest('#special-characters-modal-trigger')) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [onClose]);
  
  
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [onClose]);
  
  return (
    <List 
      sx={{ 
        position: 'absolute', 
        top: position.top,
        right: position.right,
        left: position.left,
        bottom: position.bottom,
        width: '200px', 
        backgroundColor: trendingPageModalBgColor, 
        borderRadius: '8px', 
        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)', 
        zIndex: 1000,
        color: 'white',
        padding: '8px 0',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }} 
      className='special-characters-modal'
    >
      {options.map((option) => (
        <ListItem
          key={option.label}
          onClick={() => {
            option.action();
            onClose();
          }}
          sx={{
            cursor: 'pointer',
            padding: '12px 16px',
            '&:hover': { backgroundColor: trendingPageSelectionColor },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <ListItemIcon sx={{ minWidth: '40px', fontSize: '20px', color: 'white' }}>
            {option.icon}
          </ListItemIcon>
          <ListItemText 
            primary={option.label}
            primaryTypographyProps={{
              fontSize: '14px',
              fontWeight: 500,
            }}
          />
        </ListItem>
      ))}
    </List>
  )
}
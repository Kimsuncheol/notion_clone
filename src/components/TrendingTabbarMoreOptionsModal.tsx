import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, Link, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { grayColor2 } from '@/constants/color';

interface TrendingTabbarMoreOptionsModalProps {
  options: { label: string, value: string }[];
}

interface MenuItem {
  value: string;
  label: string;
  path?: string;
  isSubtext?: boolean;
  subtext?: string;
}

export default function TrendingTabbarMoreOptionsModal() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const managerEmail = 'cheonjae6@naver.com';

  const menuItems: MenuItem[] = [
    { value: 'Announcements', label: 'announcements', path: `/${managerEmail}/posts/announcements` },
    { value: 'Tags', label: 'tags', path: '/tags' },
    { value: 'Service Policy', label: 'service policy', path: '/policy/terms' },
    { value: 'Email', label: 'cheonjae6@naver.com', subtext: 'contact', isSubtext: true }
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item: typeof menuItems[0]) => {
    handleClose();
    console.log('Selected:', item.value);
  };

  return (
    <Box sx={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'end', alignItems: 'center'}}>
      <IconButton
        onClick={handleClick}
        sx={{
          backgroundColor: 'transparent',
          color: 'white',
          borderColor: 'transparent',
          p: 0,
          justifyContent: 'end',
          alignItems: 'center',
          display: 'flex',
          width: '100%',
          height: '100%',
          '&. Multi': {
            display: 'none',
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: '24px' }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: grayColor2,
            border: '1px solid #4a5568',
            mt: 1,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              color: 'white',
              fontSize: '14px',
              borderBottom: '1px solid #4a5568',
              '&:hover': {
                backgroundColor: '#4a5568',
              },
              '&:last-child': {
                borderBottom: 'none',
              }
            }
          }
        }}
      >
        {menuItems.map((item, index) => (
          item.path ? (
            <Link href={item.path || ''} key={item.value} style={{ textDecoration: 'none' }} >
              <MenuItem
                key={item.value}
                onClick={() => handleItemClick(item)}
                sx={{
                  color: item.isSubtext ? '#a0aec0' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  height: '45px',
                  textTransform: index !== menuItems.length - 1 ? 'capitalize' : 'none',
                }}
              >
                {item.subtext && <Typography sx={{ color: '#a0aec0', fontSize: '11px', lineHeight: 1 }}>{item.subtext}</Typography>}
                {item.label}
              </MenuItem>
            </Link>
          ) : (
            <Link href={`mailto:${item.label}`} key={item.value} style={{ textDecoration: 'none' }} >
              <MenuItem
                key={item.value}
                onClick={() => handleItemClick(item)}
                sx={{
                  color: item.isSubtext ? '#a0aec0' : 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  height: '45px',
                  textTransform: index !== menuItems.length - 1 ? 'capitalize' : 'none',
                }}
              >
                {item.subtext && <Typography sx={{ color: '#a0aec0', fontSize: '11px', lineHeight: 1 }}>{item.subtext}</Typography>}
                {item.label}
              </MenuItem>
            </Link>
          )
        ))}
      </Menu>
    </Box>
  );
}

import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, Typography, SvgIcon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const StellateIcon = () => (
  <Box
    sx={{
      width: 20,
      height: 20,
      backgroundColor: '#718096',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <SvgIcon sx={{ width: 16, height: 16, fill: 'white' }}>
      <svg viewBox="0 0 16 16">
        <rect width="16" height="16" rx="3" fill="#718096"/>
        <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </SvgIcon>
  </Box>
);

export default function TrendingTabbarMoreOptionsModal() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedValue, setSelectedValue] = useState('');
  const isOpen = Boolean(anchorEl);

  const menuItems = [
    { value: 'announcements', label: '공지사항' },
    { value: 'tags', label: '태그 목록' },
    { value: 'service-policy', label: '서비스 정책' },
    { value: 'slack', label: 'Slack' },
    { value: 'contact', label: '문의' },
    { value: 'email', label: 'contact@velog.io', isSubtext: true }
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item: typeof menuItems[0]) => {
    setSelectedValue(item.value);
    handleClose();
    console.log('Selected:', item.value);
  };

  return (
    <Box sx={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'end', paddingRight: '12px' }}>
      <Button
        variant="outlined"
        onClick={handleClick}
        sx={{
          backgroundColor: 'transparent',
          color: 'white',
          borderColor: 'transparent',
          p: 0,
          justifyContent: 'end',
          alignItems: 'center',
          width: 'fit-content',
          height: '40px',
        }}
      >
        <MoreVertIcon sx={{ fontSize: '24px' }} />
      </Button>

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
            backgroundColor: '#2d3748',
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
        {menuItems.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => handleItemClick(item)}
            sx={{
              color: item.isSubtext ? '#a0aec0' : 'white',
            }}
          >
            {item.label}
          </MenuItem>
        ))}
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderTop: '1px solid #4a5568',
            backgroundColor: '#2d3748',
            gap: 1,
          }}
        >
          <StellateIcon />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ color: '#a0aec0', fontSize: '11px', lineHeight: 1 }}>
              Powered by
            </Typography>
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: 1.2 }}>
              Stellate
            </Typography>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
}
// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Menu, MenuItem, Typography, SvgIcon, IconButton } from '@mui/material';
// import { ExpandMore } from '@mui/icons-material';
// import MoreVertIcon from '@mui/icons-material/MoreVert';

// const StellateIcon = () => (
//   <Box
//     sx={{
//       width: 20,
//       height: 20,
//       backgroundColor: '#718096',
//       borderRadius: 1,
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }}
//   >
//     <SvgIcon sx={{ width: 16, height: 16, fill: 'white' }}>
//       <svg viewBox="0 0 16 16">
//         <rect width="16" height="16" rx="3" fill="#718096"/>
//         <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//       </svg>
//     </SvgIcon>
//   </Box>
// );

// export default function TrendingTabbarMoreOptionsModal() {
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const [selectedValue, setSelectedValue] = useState('');
//   const isOpen = Boolean(anchorEl);

//   const menuItems = [
//     { value: 'announcements', label: '공지사항' },
//     { value: 'tags', label: '태그 목록' },
//     { value: 'service-policy', label: '서비스 정책' },
//     { value: 'slack', label: 'Slack' },
//     { value: 'contact', label: '문의' },
//     { value: 'email', label: 'contact@velog.io', isSubtext: true }
//   ];

//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleItemClick = (item: typeof menuItems[0]) => {
//     setSelectedValue(item.value);
//     handleClose();
//     console.log('Selected:', item.value);
//   };

//   const getDisplayValue = () => {
//     if (!selectedValue) return '옵션 선택';
//     const item = menuItems.find(item => item.value === selectedValue);
//     return item ? item.label : '';
//   };

//   return (
//     <Box sx={{ position: 'relative', minWidth: 200 }}>
//       <Button
//         variant="outlined"
//         onClick={handleClick}
//         endIcon={<ExpandMore sx={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />}
//         sx={{
//           backgroundColor: 'transparent',
//           color: 'white',
//           borderColor: '#4a5568',
//           padding: '12px 16px',
//           fontSize: '14px',
//           textTransform: 'none',
//           justifyContent: 'space-between',
//           // width: '100%',
//           '&:hover': {
//             backgroundColor: '#2d3748',
//             borderColor: '#718096',
//           }
//         }}
//       >
//         {getDisplayValue()}
//         {/* <MoreVertIcon /> */}
//       </Button>

//       <Menu
//         anchorEl={anchorEl}
//         open={isOpen}
//         onClose={handleClose}
//         PaperProps={{
//           sx: {
//             backgroundColor: '#2d3748',
//             border: '1px solid #4a5568',
//             mt: 1,
//             minWidth: 200,
//             '& .MuiMenuItem-root': {
//               color: 'white',
//               fontSize: '14px',
//               borderBottom: '1px solid #4a5568',
//               '&:hover': {
//                 backgroundColor: '#4a5568',
//               },
//               '&:last-child': {
//                 borderBottom: 'none',
//               }
//             }
//           }
//         }}
//       >
//         {menuItems.map((item) => (
//           <MenuItem
//             key={item.value}
//             onClick={() => handleItemClick(item)}
//             sx={{
//               color: item.isSubtext ? '#a0aec0' : 'white',
//             }}
//           >
//             {item.label}
//           </MenuItem>
//         ))}
        
//         <Box
//           sx={{
//             display: 'flex',
//             alignItems: 'center',
//             padding: '12px 16px',
//             borderTop: '1px solid #4a5568',
//             backgroundColor: '#2d3748',
//             gap: 1,
//           }}
//         >
//           <StellateIcon />
//           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//             <Typography sx={{ color: '#a0aec0', fontSize: '11px', lineHeight: 1 }}>
//               Powered by
//             </Typography>
//             <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 500, lineHeight: 1.2 }}>
//               Stellate
//             </Typography>
//           </Box>
//         </Box>
//       </Menu>
//     </Box>
//   );
// }
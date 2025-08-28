import { grayColor4, grayColor1, grayColor3, blackColor2 } from '@/constants/color'
import { IconButton, InputAdornment, TextField, List, ListItem, ListItemText, SxProps } from '@mui/material'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';

export default function CreateNoteForm() {
  const IconButtonStyle = {
    backgroundColor: grayColor1,
    color: grayColor3,
    padding: 1.2,
    '&:hover': {
      backgroundColor: blackColor2,
    }
  }
  const IconButtonFontSize = 24;
  const [openAddFileandMoreSelectModal, setOpenAddFileandMoreSelectModal] = useState(false);

  return (
    <div className='w-full h-full flex flex-col gap-[100px] justify-center items-center'>
      <div className='text-2xl font-bold'>What do you want to create?</div>
      <div className='w-full flex justify-center items-center relative'>
        <TextField
          placeholder='Enter your prompt here...'
          variant='outlined'
          multiline
          rows={1}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <IconButton
                  sx={IconButtonStyle}
                  id='add-file-select-button'
                  onClick={() => setOpenAddFileandMoreSelectModal(!openAddFileandMoreSelectModal)}
                >
                  <AddIcon sx={{ fontSize: IconButtonFontSize }} />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  sx={IconButtonStyle}>
                  <ArrowUpwardRoundedIcon sx={{ fontSize: IconButtonFontSize }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '26px',
              backgroundColor: grayColor1,
              color: grayColor3,
              padding: '12px',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            }
          }}
        />
        {openAddFileandMoreSelectModal && (
          <AddFileSelect
            onClose={() => setOpenAddFileandMoreSelectModal(false)}
          />
        )}
      </div>
    </div>
  )
}

function AddFileSelect({ onClose }: { onClose: () => void }) {
  const ListItemStyle: SxProps | ((index: number) => SxProps) = (index: number) => ({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4px 8px',
    '&:hover': {
      backgroundColor: blackColor2,
    },
    borderBottom: index !== 2 ? `1px solid ${blackColor2}` : 'none'
  })
  // If users click outside the modal or the button, close the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('#add-file-select-list');
      const button = document.querySelector('#add-file-select-button');
      if (modal && !modal.contains(event.target as Node) && !button?.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <List
      id='add-file-select-list'
      sx={{
        position: 'absolute',
        top: '-150px',
        left: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        backgroundColor: grayColor4,
        borderRadius: '10px',
        padding: '10px',
      }}>
      <ListItem sx={ListItemStyle(0)}>
        <ListItemText primary="Add photos & files" />
      </ListItem>
      <ListItem sx={ListItemStyle(1)}>
        <ListItemText primary="Connect Google Drive" />
      </ListItem>
      <ListItem sx={ListItemStyle(2)}>
        <ListItemText primary="Connect OneDrive" />
      </ListItem>
    </List>
  )
}
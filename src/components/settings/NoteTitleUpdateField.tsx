import { grayColor3 } from '@/constants/color';
import { mintColor1 } from '@/constants/color';
import { fontSize, fontSizeLarge } from '@/constants/size';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { fetchUserSettings, updateUserMyNotesTitle } from '@/services/settings/firebase';

export default function NoteTitleUpdateField() {
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings?.myNotesTitle) {
          setNoteTitle(settings.myNotesTitle);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadUserSettings();
  }, []);

  const handleSave = async () => {
    try {
      await updateUserMyNotesTitle(noteTitle);
      setIsTitleEditing(false);
    } catch (error) {
      console.error('Error updating note title:', error);
    }
  };
  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full items-center'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSizeLarge }}>My Notes title</div>
        {isTitleEditing ? (
          <div className='flex gap-4 w-4/5 items-center'>
            <TextField
              variant="outlined"
              fullWidth
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  border: isTitleEditing ? '1px solid #595959' : 'none',
                  color: 'white',
                  fontSize: fontSize,
                },
                '& .MuiInputBase-input': { paddingX: '12px', paddingY: '16.5px' }
              }}
            />
            <div className='text-[16px] font-semibold cursor-pointer text-right' style={{ color: mintColor1 }} onClick={handleSave}>Save</div>
          </div>
        ) : (
          <div className='flex w-4/5 gap-4 items-center h-[58px] cursor-pointer text-right'>
            <div className='text-[16px] font-semibold w-full h-full' style={{ color: grayColor3 }}>{noteTitle}</div>
            <div className='text-[16px] font-semibold' style={{ color: mintColor1, width: '9.23%' }} onClick={() => setIsTitleEditing(true)}>Edit</div>
          </div>
        )}
      </div>
      <div className='' style={{ color: grayColor3, fontSize: fontSize }}>This is the title of your note page</div>
    </div>
  )
}

import { generalTextColor } from '@/constants/color';
import { settingsPageMintColor } from '@/constants/color';
import { fontSize } from '@/constants/size';
import { TextField } from '@mui/material';
import React, { useState } from 'react'

export default function NoteTitleUpdateField() {
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full items-center'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSize }}>My Notes title</div>
        {isTitleEditing ? (
          <div className='flex gap-4 w-full items-center'>
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
                }
              }}
            />
            <div className='text-[16px] font-semibold' style={{ color: settingsPageMintColor }} onClick={() => {
              // update note title
              setIsTitleEditing(false);
            }}>Save</div>
          </div>
        ) : (
          <div className='flex w-4/5 gap-4 items-center h-[58px]'>
            <div className='text-[16px] font-semibold w-full h-full' style={{ color: generalTextColor }}>{noteTitle}</div>
            <div className='text-[16px] font-semibold' style={{ color: settingsPageMintColor, width: '9.23%' }} onClick={() => setIsTitleEditing(true)}>Edit</div>
          </div>
        )}
      </div>
      <div className='' style={{ color: generalTextColor, fontSize: fontSize }}>This is the title of your note page</div>
    </div>
  )
}

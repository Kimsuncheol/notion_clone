import { mintColor1 } from "@/constants/color";
import { fontSize, fontSizeXXLarge } from "@/constants/size";
import { updateUserShortBioAndDisplayName } from "@/services/settings/firebase";
import { CustomUserProfile } from "@/types/firebase";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";

interface UsernameSelfIntroductionUpdateProps {
  userProfile: CustomUserProfile | null;
}

export default function UsernameSelfIntroductionUpdate({ userProfile }: UsernameSelfIntroductionUpdateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [shortBio, setShortBio] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || null);
    setShortBio(userProfile?.shortBio || null);

    return () => {
      setDisplayName(null);
      setShortBio(null);
    }
  }, [userProfile]);

  return (
    <div className='flex flex-col gap-4 items-start w-4/5'>
      {/* update self introduction with edit button */}
      {isEditing ? (
        <div className='flex flex-col gap-4 items-end w-full'>
          {/* update display name */}
          <TextField
            type="text"
            placeholder='Display Name...'
            value={displayName || ''}
            onChange={(e) => setDisplayName(e.target.value)}
            autoFocus={true}
            fullWidth={true}
            multiline
            inputProps={{
              style: {
                fontSize: fontSize,
                color: 'white',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                border: '1px solid #595959',
                paddingY: '12.5px',
              },
            }}
          />
          <TextField
            type="text"
            placeholder='Self Introduction...'
            value={shortBio || ''}
            onChange={(e) => setShortBio(e.target.value)}
            autoFocus={true}
            fullWidth={true}
            multiline
            inputProps={{
              style: {
                fontSize: fontSize,
                color: 'white',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                border: '1px solid #595959',
                paddingY: '12.5px',
              }
            }}
          />
          <div className='text-[16px] font-semibold' style={{ color: mintColor1 }} onClick={() => {
            // update self introduction
            updateUserShortBioAndDisplayName(shortBio as string, displayName as string);
            setIsEditing(false);
          }}>Save</div>
        </div>
      ): (
        <div className='flex flex-col gap-4 items-start w-full'>
          <div className='font-semibold' style={{ fontSize: fontSizeXXLarge }}>{userProfile?.displayName || 'Anonymous'}</div>
          <div className='text-white'>{userProfile?.shortBio || 'short bio...'}</div>
          <div className='' style={{ color: mintColor1 }} onClick={() => setIsEditing(true)}>Update</div>
        </div>
      )}
    </div>
  )
}
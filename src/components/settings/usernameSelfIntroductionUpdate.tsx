import { mintColor1 } from "@/constants/color";
import { firebaseApp } from "@/constants/firebase";
import { fontSize, fontSizeXXLarge } from "@/constants/size";
import { TextField } from "@mui/material";
import { Auth, getAuth, User } from "firebase/auth";
import { useState } from "react";

export default function UsernameSelfIntroductionUpdate() {
  const auth: Auth = getAuth(firebaseApp);
  const user: User | null = auth.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [selfIntroduction, setSelfIntroduction] = useState<string | null>(null);

  return (
    <div className='flex flex-col gap-4 items-start w-4/5'>
      <div className='font-semibold' style={{ fontSize: fontSizeXXLarge }}>{user?.displayName || 'Anonymous'}</div>
      {/* update self introduction with edit button */}
      {!isEditing && (
        <div className='' style={{ color: mintColor1 }} onClick={() => setIsEditing(true)}>Update</div>
      )}
      {isEditing && (
        <div className='flex flex-col gap-4 items-end w-full'>
          <TextField
            type="text"
            placeholder='Self Introduction...'
            value={selfIntroduction || ''}
            onChange={(e) => setSelfIntroduction(e.target.value)}
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
              }
            }}
          />
          <div className='text-[16px] font-semibold' style={{ color: mintColor1 }} onClick={() => {
            // update self introduction
            setIsEditing(false);
          }}>Save</div>
        </div>
      )}
    </div>
  )
}
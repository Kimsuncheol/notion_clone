import { settingsPageMintColor } from "@/constants/color";
import { firebaseApp } from "@/constants/firebase";
import { Avatar } from "@mui/material";
import { Auth, getAuth, User } from "firebase/auth";

export default function AvatarUpdate() {
  const auth: Auth = getAuth(firebaseApp);
  const user: User | null = auth.currentUser;
  const sideLength: number = 128;

  return (
    <div className="flex items-center gap-4 pr-8 border-r-[1px] border-gray-200 w-1/5">
      {/* Avatar and the Avatar update and the Delete Avatar*/}
      <div className='flex gap-4 flex-col items-center justify-center'>
        <Avatar src={user?.photoURL || ''} sx={{ width: sideLength, height: sideLength }} />
        <div className='px-4 py-[6px] rounded-md cursor-pointer' onClick={() => { }} style={{ backgroundColor: settingsPageMintColor }}>
          <div className='text-[16px] font-semibold text-black'>Update Avatar</div>
        </div>
        <div className='px-4 py-[6px] rounded-md cursor-pointer' onClick={() => { }} style={{ color: settingsPageMintColor }}>
          <div className='text-[16px] font-semibold'>Delete Avatar</div>
        </div>
      </div>
    </div>
  )
}
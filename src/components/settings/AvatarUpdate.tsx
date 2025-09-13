import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useEffect, useState } from "react";
import { CustomUserProfile } from "@/types/firebase";
import { updateUserAvatar, uploadAvatarToStorage } from "@/services/settings/firebase";
import { mintColor1, mintColor2 } from "@/constants/color";
import toast from 'react-hot-toast';
import { useMarkdownStore } from "@/store/markdownEditorContentStore";

interface AvatarUpdateProps {
  userProfile: CustomUserProfile | null;
}

export default function AvatarUpdate({ userProfile }: AvatarUpdateProps) {
  const { avatar, setAvatar } = useMarkdownStore();
  const sideLength: number = 128;
  const editIconSize: number = 40;
  const editIconPosition: number = sideLength / 2 + (Math.sqrt(2) * (editIconSize / 2));
  // const [avatar, setAvatar] = useState<string | null>(userProfile?.photoURL || null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    setAvatar(userProfile?.avatar || null);
    // return () => setAvatar(null);
  }, [userProfile, setAvatar]);

  console.log('avatar: ', avatar);

  const checkImageSize = (file: File): boolean => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      // error message
      toast.error('Image size is too big')
      return false;
    }
    // successfully uploaded image
    toast.success('Successfully uploaded image')
    return true;
  };

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (!checkImageSize(file)) {
        return;
      }
      
      try {
        const downloadURL = await uploadAvatarToStorage(file);
        setAvatar(downloadURL);
        console.log('Selected file uploaded:', downloadURL);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = 'avatar-input';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    input.click();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  return (
    <div className="flex items-center gap-4 pr-8 border-r-[1px] border-gray-200 w-1/5">
      <div className='flex gap-8 flex-col items-center justify-center'>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`transition-all relative duration-200 rounded-full ${isDragging
            ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105'
            : 'hover:scale-105'
            }`}
        >
          <Avatar
            src={avatar || ''}
            sx={{
              width: sideLength,
              height: sideLength,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              filter: isDragging ? 'brightness(1.1)' : 'brightness(1)'
            }}
            onClick={handleAvatarClick}
          >
          </Avatar>
          {isHovering && (
            <AddPhotoAlternateIcon sx={{
              fontSize: editIconSize,
              position: 'absolute',
              top: editIconPosition,
              left: editIconPosition,
              color: isDragging ? '#3b82f6' : 'inherit'
            }} />
          )}
        </div>
        {isDragging && (
          <div className="text-sm text-blue-500 font-medium animate-pulse">
            Drop image here
          </div>
        )}
        <div className="flex flex-col gap-4">
          <UpdateAvatarButton
            avatar={avatar}
            userProfile={userProfile}
            text="Update"
            onClick={() => {updateUserAvatar(avatar!)}} />
          <UpdateAvatarButton
            avatar={avatar}
            userProfile={userProfile}
            text="Remove"
            onClick={()  => {
              updateUserAvatar('');
              setAvatar(null);
            }} 
            // onClick={() => async () => {
            //   await updateUserPhotoURL('');
            //   setAvatar(null);
            // }} 
            />
        </div>
      </div>
    </div>
  )
}

interface UpdateAvatarButtonProps {
  avatar: string | null;
  userProfile: CustomUserProfile | null;
  text: string;
  onClick: () => void;
}

function UpdateAvatarButton({ avatar, userProfile, text, onClick }: UpdateAvatarButtonProps) {
  return (
    <Button
      // variant="text"
      variant="contained"
      size="small"
      sx={{
        backgroundColor: text === 'Update'? mintColor1: 'transparent',
        color: text === 'Update'? 'black': mintColor1,
        boxShadow: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        '&:hover': {
          backgroundColor: text === 'Update'? mintColor2: 'transparent',
          color: text === 'Update'? 'black': mintColor2,
        }
      }}
      onClick={onClick}
      disabled={!avatar && !userProfile?.photoURL}
    >
      {text}
    </Button>
  )
}
import { firebaseApp } from "@/constants/firebase";
import { Avatar } from "@mui/material";
import { Auth, getAuth, User } from "firebase/auth";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { useState } from "react";

export default function AvatarUpdate() {
  const auth: Auth = getAuth(firebaseApp);
  const user: User | null = auth.currentUser;
  const sideLength: number = 128;
  const editIconSize: number = 40;
  const editIconPosition: number = sideLength / 2 + (Math.sqrt(2) * (editIconSize / 2));
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
      };
      reader.readAsDataURL(file);
      console.log('Selected file:', file);
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
      <div className='flex gap-4 flex-col items-center justify-center'>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`transition-all relative duration-200 rounded-full ${
            isDragging 
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
      </div>
    </div>
  )
}
import { mintColor1 } from '@/constants/color';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import { TagType } from '@/types/firebase';
import { TextField } from '@mui/material';
import React from 'react'

interface MarkdownNoteHeaderProps {
  title: string;
  titleRef: React.RefObject<HTMLDivElement | null>;
  handleTitleInput: (e: React.FormEvent<HTMLDivElement>) => void;
  viewMode: 'edit' | 'preview' | 'split';
}

export default function MarkdownNoteHeader({ title, titleRef, handleTitleInput, viewMode }: MarkdownNoteHeaderProps) {
  const { tags, setTags } = useMarkdownEditorContentStore();

  return (
    <div className={`w-full flex flex-col p-4 pb-2 gap-6 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
      <div className="relative">
        <div
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleTitleInput}
          onKeyDown={(e) => {
            // Prevent Enter key from creating new lines
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="w-full text-5xl font-bold bg-transparent flex items-end justify-between border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          ref={titleRef}
          data-placeholder="Untitled"
        />
        {/* Show placeholder only when empty */}
        {!title ? (
          <div className="absolute top-0 left-0 pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500 leading-[1.5]">
            Untitled
          </div>
        ) : (
          <div className="absolute top-0 left-0 pointer-events-none text-5xl font-bold leading-[1.5]" style={{ color: 'white' }}>
            {title}
          </div>
        )}
      </div>
      <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag.name} onClick={() => {
            // If users click the tag, it should disappear from the list
            const newTags = tags.filter((t) => t.id !== tag.id);
            console.log(newTags);
            setTags(newTags);
          }} />
        ))}
        <TagInput tags={tags} setTags={setTags} />
      </div>
    </div>
  )
}

function Tag({ tag, onClick }: { tag: string, onClick: () => void }) {
  return (
    <div
      className="text-gray-200 px-3 py-2 rounded-md text-sm hover:bg-gray-700 cursor-pointer"
      style={{ color: mintColor1 }}
      onClick={onClick}
    >
      {tag}
    </div>
  )
}

function TagInput({ tags, setTags }: { tags: TagType[], setTags: (tags: TagType[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <TextField
        variant="outlined"
        size="small"
        placeholder="Add Tag"
        sx={{
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .MuiInputBase-root': {
            color: 'white',
          },
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const tagName = (e.target as HTMLInputElement).value.trim();
            if (tagName) {
              const newTags = [...tags, {
                id: Date.now().toString(),
                name: tagName,
                createdAt: new Date(),
                updatedAt: new Date()
              }];
              setTags(newTags);
              console.log(newTags);
              (e.target as HTMLInputElement).value = '';
            }
          }
        }}
      />
    </div>
  )
}
// import { mintColor1 } from '@/constants/color';
// import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
// import { TagType } from '@/types/firebase';
// import { TextField } from '@mui/material';
// import React from 'react'

// interface MarkdownNoteHeaderProps {
//   title: string;
//   titleRef: React.RefObject<HTMLDivElement | null>;
//   handleTitleInput: (e: React.FormEvent<HTMLDivElement>) => void;
//   viewMode: 'edit' | 'preview' | 'split';
// }

// export default function MarkdownNoteHeader({ title, titleRef, handleTitleInput, viewMode }: MarkdownNoteHeaderProps) {
//   const { tags, setTags } = useMarkdownEditorContentStore();

//   return (
//     <div className={`w-full flex flex-col p-4 pb-2 gap-6 ${viewMode === 'preview' ? 'hidden' : ''}`} id="title-input-container">
//       <div
//         contentEditable
//         suppressContentEditableWarning={true}
//         onInput={handleTitleInput}
//         onKeyDown={(e) => {
//           // Prevent Enter key from creating new lines (optional)
//           if (e.key === 'Enter') {
//             e.preventDefault();
//             // e.currentTarget.textContent += '\n';
//           }
//         }}
//         className="w-full text-5xl font-bold bg-transparent flex items-end justify-between border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]"
//         style={{
//           wordBreak: 'break-word',
//           overflowWrap: 'break-word',
//         }}
//         ref={titleRef}
//       >
//         <span className='text-5xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[1.2em] focus:outline-none leading-[1.5]'>
//           {title}
//         </span>
//       </div>
//       {!title && (
//         <div className="absolute pointer-events-none text-5xl font-bold text-gray-400 dark:text-gray-500">
//           Untitled
//         </div>
//       )}
//       <hr className="border-gray-200 dark:border-gray-700 w-[60px] border-2" />
//       {/* Tags */}
//       <div className="flex flex-wrap gap-2">
//         {tags.map((tag) => (
//           <Tag key={tag.id} tag={tag.name} onClick={() => {
//             // If users click the tag, it should disappear from the list
//             const newTags = tags.filter((t) => t.id !== tag.id);
//             console.log(newTags);
//             setTags(newTags);
//           }} />
//         ))}
//         <TagInput tags={tags} setTags={setTags} />
//       </div>
//     </div>
//   )
// }

// function Tag({ tag, onClick }: { tag: string, onClick: () => void }) {
//   return (
//     <div
//       className="text-gray-200 px-3 py-2 rounded-md text-sm hover:bg-gray-700"
//       style={{ color: mintColor1 }}
//       onClick={onClick}
//     >
//       {tag}
//     </div>
//   )
// }

// function TagInput({ tags, setTags }: { tags: TagType[], setTags: (tags: TagType[]) => void }) {
//   return (
//     <div className="flex flex-wrap gap-2">
//       <TextField
//         variant="outlined"
//         size="small"
//         placeholder="Add Tag"
//         sx={{
//           '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
//           '& .Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
//           '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
//           '& .MuiInputBase-root': {
//             color: 'white',
//           },
//         }}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter') {
//             e.preventDefault();
//             const tagName = (e.target as HTMLInputElement).value.trim();
//             if (tagName) {
//               const newTags = [...tags, {
//                 id: Date.now().toString(),
//                 name: tagName,
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//               }];
//               setTags(newTags);
//               console.log(newTags);
//               (e.target as HTMLInputElement).value = '';
//             }
//           }
//         }}
//       />
//     </div>
//   )
// }
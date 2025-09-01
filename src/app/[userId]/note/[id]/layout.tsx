'use client'
import { grayColor2 } from '@/constants/color';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

interface NoteLayoutProps {
  children: React.ReactNode;
}

export default function NoteLayout({ children }: NoteLayoutProps) {
  const viewMode = useMarkdownEditorContentStore(state => state.viewMode);
  return (
    <div className={`${viewMode === 'split' ? 'h-screen' : ''} text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      {children}
    </div>
  );
}

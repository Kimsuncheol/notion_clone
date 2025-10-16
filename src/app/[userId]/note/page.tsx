'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
// Removed unused import - using MarkdownEditorForNotePage instead
import { EditModeProvider } from "@/contexts/EditModeContext";


import { Comment } from '@/types/comments';
import MarkdownEditorForNotePage from "@/components/markdown/MarkdownEditorForNotePage";
import { useMarkdownStore } from "@/store/markdownEditorContentStore";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { NOTE_NAVIGATION_BLOCK_MESSAGE, isNoteComposerPath, shouldBlockNoteNavigation } from "@/utils/noteNavigation";

// Full editor interface component
interface FullEditorInterfaceProps {

  handleBlockCommentsChange?: (comments: Record<string, Comment[]>) => void;
  templateTitle?: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
}

function FullEditorInterface({
  handleBlockCommentsChange,
  templateTitle,
}: FullEditorInterfaceProps) {
  return (
    <EditModeProvider initialEditMode={true}>
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative" id="note-page">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <MarkdownEditorForNotePage

            onBlockCommentsChange={handleBlockCommentsChange}
            templateTitle={templateTitle}
          />
        </div>
      </div>
    </EditModeProvider>
  );
}



// Main NotePage component
export default function NotePage() {
  const [showChatModal, setShowChatModal] = useState(false);
  const title = useMarkdownStore((state) => state.title);
  const content = useMarkdownStore((state) => state.content);
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef<string | null>(null);
  const shouldBlockNavigation = useMemo(
    () => shouldBlockNoteNavigation(pathname, title, content),
    [pathname, title, content]
  );
  const shouldBlockNavigationRef = useRef(shouldBlockNavigation);

  useEffect(() => {
    shouldBlockNavigationRef.current = shouldBlockNavigation;
  }, [shouldBlockNavigation]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!pathname || !isNoteComposerPath(pathname)) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  useEffect(() => {
    if (!pathname || !isNoteComposerPath(pathname)) return;

    const handlePopState = () => {
      if (!shouldBlockNavigationRef.current) return;
      toast.error(NOTE_NAVIGATION_BLOCK_MESSAGE);
      if (pathnameRef.current) {
        router.push(pathnameRef.current);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return (
    <FullEditorInterface
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
    />
  );
}

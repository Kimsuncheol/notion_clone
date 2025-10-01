'use client';
import React, { useState } from "react";
// Removed unused import - using MarkdownEditorForNotePage instead
import { EditModeProvider } from "@/contexts/EditModeContext";


import { Comment } from '@/types/comments';
import MarkdownEditorForNotePage from "@/components/markdown/MarkdownEditorForNotePage";

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

  return (
    <FullEditorInterface
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
    />
  );
}
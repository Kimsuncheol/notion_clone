'use client';
import React, { useState } from "react";
// Removed unused import - using MarkdownEditorForNotePage instead
import { EditModeProvider } from "@/contexts/EditModeContext";


import { Comment } from '@/types/comments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MarkdownEditorForNotePage from "@/components/markdown/MarkdownEditorForNotePage";


// Enhanced AI Chat trigger for authenticated users
interface EnhancedAIChatTriggerProps {
  showChatModal: boolean;
  onOpenChat: () => void;
}

function EnhancedAIChatTrigger({ showChatModal, onOpenChat }: EnhancedAIChatTriggerProps) {
  if (showChatModal) return null;

  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-10 right-10 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl z-50"
      title="Open AI Chat"
    >
      <SmartToyIcon style={{ fontSize: '1.5rem' }} />
    </button>
  );
}

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
  showChatModal,
  setShowChatModal,
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
        <EnhancedAIChatTrigger 
          showChatModal={showChatModal} 
          onOpenChat={() => setShowChatModal(true)} 
        />
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
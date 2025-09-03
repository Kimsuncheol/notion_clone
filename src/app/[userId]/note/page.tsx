'use client';
import React, { useState } from "react";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';


import { Comment } from '@/types/comments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AIChatSidebar from '@/components/AIChatSidebar';
import MarkdownEditorForNotePage from "@/components/markdown/MarkdownEditorForNotePage";

// AI Chat trigger button component
interface AIChatTriggerProps {
  showChatModal: boolean;
  onOpenChat: () => void;
}

function AIChatTrigger({ showChatModal, onOpenChat }: AIChatTriggerProps) {
  if (showChatModal) return null;

  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-4 right-4 p-2 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center z-50"
      title="Open AI Chat"
    >
      <SmartToyIcon fontSize="inherit" />
    </button>
  );
}

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
  handleSaveTitle?: (title: string) => void;
  handleBlockCommentsChange?: (comments: Record<string, Comment[]>) => void;
  templateTitle?: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
}

function FullEditorInterface({
  handleSaveTitle,
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
            onSaveTitle={handleSaveTitle}
            onBlockCommentsChange={handleBlockCommentsChange}
            templateTitle={templateTitle}
          />
        </div>
        <AIChatSidebar
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
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
  const auth = getAuth(firebaseApp);

  return (
    <FullEditorInterface
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
    />
  );
}
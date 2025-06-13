'use client';
import React, { useState, useRef, use as usePromise } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import ManualModal from "@/components/ManualModal";
import { useRouter } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: Props) {
  // `params` is a promise in the latest Next.js canary; unwrap it for future-proofing.
  const { id } = usePromise(params);
  const [selectedPageId, setSelectedPageId] = useState<string>(id);
  const [showManual, setShowManual] = useState(false);
  const sidebarRef = useRef<SidebarHandle>(null);
  const router = useRouter();

  const handleSaveTitle = (title: string) => {
    // Update the page name in the sidebar
    sidebarRef.current?.renamePage(selectedPageId, title);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
      <div className="flex-1 flex flex-col">
        <Header onOpenManual={() => setShowManual(true)} />
        <Editor key={selectedPageId} pageId={selectedPageId} onSaveTitle={handleSaveTitle} />
      </div>
      <ManualModal open={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}

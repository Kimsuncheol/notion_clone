'use client';
import React, { useState, useRef } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import ManualModal from "@/components/ManualModal";

interface Props {
  params: { id: string };
}

export default function NotePage({ params }: Props) {
  const { id } = params;
  const [selectedPageId, setSelectedPageId] = useState<string>(id);
  const [showManual, setShowManual] = useState(false);
  const sidebarRef = useRef<SidebarHandle>(null);

  const handleSaveTitle = (title: string) => {
    sidebarRef.current?.renamePage(selectedPageId, title);
  };

  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
      <div className="flex-1 flex flex-col">
        <Header onOpenManual={() => setShowManual(true)} />
        <Editor key={selectedPageId} onSaveTitle={handleSaveTitle} />
      </div>
      <ManualModal open={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}

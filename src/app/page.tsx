'use client';
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";

export default function Home() {
  const [selectedPageId, setSelectedPageId] = useState<string>("initial");

  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar selectedPageId={selectedPageId} onSelectPage={setSelectedPageId} />
      <Editor key={selectedPageId} />
    </div>
  );
}

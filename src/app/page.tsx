import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar />
      <MainContent />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-6 px-4">
      <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Workspace
      </div>
      <nav className="flex flex-col gap-1">
        <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
          📝 <span className="truncate">Untitled</span>
        </button>
        <button className="flex items-center gap-2 rounded px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10">
          ➕ <span className="truncate">Add page</span>
        </button>
      </nav>
    </aside>
  );
}

function MainContent() {
  return (
    <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
      <article className="w-full max-w-3xl px-6">
        <input
          type="text"
          placeholder="Untitled"
          className="w-full bg-transparent text-4xl sm:text-5xl font-bold focus:outline-none placeholder:text-gray-400 mb-8"
        />
        <p className="text-gray-500 mb-6">
          Type / for blocks, @ to link docs or people
        </p>

        <h2 className="text-2xl font-semibold mb-4">Sample Heading</h2>
        <p className="mb-4 leading-7">
          This is a paragraph block. Use it to start writing your ideas, plans or
          documentation.
        </p>

        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>A bulleted list item</li>
          <li>
            An indented bullet:
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Nested bullet item</li>
            </ul>
          </li>
          <li>Another bullet</li>
        </ul>

        <code className="block bg-black/\[0.05\] dark:bg-white/\[0.08\] rounded p-4 text-sm mb-8 font-mono whitespace-pre">
{`const hello = "world";
console.log(hello);`}
        </code>

        <div className="text-gray-400 select-none text-center">— End of page —</div>
      </article>
    </main>
  );
}

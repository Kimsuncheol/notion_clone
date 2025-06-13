import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";

export default function Home() {
  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar />
      <Editor />
    </div>
  );
}

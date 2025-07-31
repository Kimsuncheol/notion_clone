import { Metadata } from 'next';

interface NoteLayoutProps {
  children: React.ReactNode;
}

export default function NoteLayout({ children }: NoteLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-[color:var(--foreground)]">
      {children}
    </div>
  );
}

// Generate dynamic metadata based on the note ID
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const noteId = params.id;
  
  return {
    title: `Note ${noteId} | Note Editor`,
    description: `Edit and view note ${noteId} with markdown support`,
    robots: {
      index: false, // Don't index individual notes for privacy
      follow: false,
    },
  };
}
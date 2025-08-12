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
type GenerateMetadataProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: `Note ${id} | Note Editor`,
    description: `Edit and view note ${id} with markdown support`,
    robots: {
      index: false, // Don't index individual notes for privacy
      follow: false,
    },
  };
}
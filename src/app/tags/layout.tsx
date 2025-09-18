import { grayColor2 } from '@/constants/color';

interface TagsLayoutProps {
  children: React.ReactNode;
}

export default function TagsLayout({ children }: TagsLayoutProps) {
  return (
    <div className={`h-screen text-[color:var(--foreground)]`} style={{
      backgroundColor: grayColor2
    }}>
      {children}
    </div>
  );
}

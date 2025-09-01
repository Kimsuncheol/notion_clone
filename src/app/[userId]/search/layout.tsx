import TrendingHeader from '@/components/trending/TrendingHeader';
import { Metadata } from 'next';

interface SearchLayoutProps {
  children: React.ReactNode;
}

export default function SearchLayout({ children }: SearchLayoutProps) {
  return (
    <div className="min-h-screen w-[80%] mx-auto">
      <TrendingHeader />
      {children}
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Search | Velog Clone',
  description: 'Search for posts and articles',
};

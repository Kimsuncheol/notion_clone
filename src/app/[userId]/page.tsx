import { redirect } from 'next/navigation';

interface UserHomePageProps {
  params: {
    userId?: string;
  };
}

export default function UserHomePage({ params }: UserHomePageProps) {
  const userId = params?.userId;

  if (!userId) {
    redirect('/trending/week');
  }

  redirect(`/${encodeURIComponent(userId)}/trending/week`);
}

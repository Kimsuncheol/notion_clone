import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/note/initial');
  return null;
}

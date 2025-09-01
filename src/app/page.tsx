import { redirect } from 'next/navigation';
import 'katex/dist/katex.min.css';
import { firebaseApp } from '@/constants/firebase';
import { getAuth } from 'firebase/auth';

export default function Home() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const userEmail = user?.email;
  
  redirect(`/${userEmail}/trending/week`);
  return null;
}

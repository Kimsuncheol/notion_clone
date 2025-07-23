import { redirect } from 'next/navigation';
import 'katex/dist/katex.min.css';

export default function Home() {
  redirect('/dashboard');
  return null;
}

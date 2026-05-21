// Redirige la raíz al bosque

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/bosque');
}
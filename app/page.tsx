// Redirige la raíz al bosque

import { redirect } from 'next/navigation';
// me cago en mi
export default function Home() {
  redirect('/bosque');
}
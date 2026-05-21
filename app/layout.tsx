import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bosque Live 🌿',
  description: 'TikTok Live forest game',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '0G RAG Agent - Diamond IO Codebase Expert',
  description: 'Query the Diamond IO codebase using 0G Storage and RAG',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

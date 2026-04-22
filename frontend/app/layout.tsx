import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'celx-atendimento',
  description: 'Sistema de atendimento',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

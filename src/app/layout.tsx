import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Reebok IC Manager - Gestión de Códigos IC',
  description: 'Aplicación especializada para la gestión completa de Códigos IC de Reebok',
  keywords: ['Reebok', 'Códigos IC', 'Gestión', 'Inventario'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="icon" href="/favicon.ico" />
        <title>Reebok IC Manager</title>
        <meta
          name="description"
          content="Sistema especializado de gestión de Códigos IC para Reebok"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
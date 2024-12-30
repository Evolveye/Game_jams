import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: `CactuJam 13`,
  description: `Created for CactuJam`,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body>
        {children}
      </body>
    </html>
  )
}

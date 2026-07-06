import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Newsreader, Public_Sans, JetBrains_Mono } from 'next/font/google'
import { PageLoadProvider } from '@/components/page-load-provider'
import './globals.css'

const newsreader = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
})
const publicSans = Public_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ClimateCred — Climate Claim Verification',
  description:
    'Retrieval-augmented verification of climate claims against peer-reviewed evidence.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F6F7F2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} ${jetbrainsMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <PageLoadProvider>
          {children}
        </PageLoadProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

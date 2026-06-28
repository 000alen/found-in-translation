import './global.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { literaryFont } from './fonts'
import { CommentsProvider } from './components/comments/CommentsProvider'
import { ThemeProvider } from './components/theme/ThemeProvider'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Found in Translation',
    template: '%s | Found in Translation',
  },
  description:
    'Side-by-side translations with phrase-level links, alignment tools, and collaborative commentary.',
  openGraph: {
    title: 'Found in Translation',
    description:
      'Side-by-side translations with phrase-level links, alignment tools, and collaborative commentary.',
    url: baseUrl,
    siteName: 'Found in Translation',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={cx(GeistSans.variable, GeistMono.variable, literaryFont.variable)}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <ThemeProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 pt-5 md:px-8">
            <CommentsProvider>
              <Navbar />
              <main className="flex flex-1 flex-col">{children}</main>
            </CommentsProvider>
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

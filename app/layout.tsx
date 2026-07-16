import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'eunbilog',
    template: '%s | eunbilog',
  },
  description: '앱 개발, 야구, 부업, 행정 정보까지 — 은비의 블로그',
  metadataBase: new URL('https://eunbilog.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`}>
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              eunbilog
            </Link>
            <nav className="flex gap-4 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-900">블로그</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-gray-100 py-8 text-center text-sm text-gray-400">
          © 2026 eunbilog.com
        </footer>
      </body>
    </html>
  )
}

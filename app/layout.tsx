import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Text Battle Game',
  description: '12세 이상을 위한 텍스트 배틀 게임',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
              {children}
              
              {/* Hidden admin entrance */}
              <div className="fixed bottom-4 right-4">
                <a href="/admin" className="admin-icon block w-8 h-8 text-white">
                  🦄
                </a>
              </div>
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
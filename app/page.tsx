'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [showLoginOptions, setShowLoginOptions] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasCharacter, setHasCharacter] = useState(false)
  const [checkingCharacter, setCheckingCharacter] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user?.id) {
      // Check if user has a character
      checkUserCharacter()
    } else {
      setCheckingCharacter(false)
    }
  }, [session, status])

  const checkUserCharacter = async () => {
    try {
      const response = await fetch('/api/characters/my')
      if (response.ok) {
        const data = await response.json()
        setHasCharacter(data.characters && data.characters.length > 0)
      }
    } catch (error) {
      console.error('Error checking character:', error)
    } finally {
      setCheckingCharacter(false)
    }
  }

  if (status === 'loading' || checkingCharacter) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold mb-8 text-white">
          Text Battle
        </h1>
        {session ? (
          // Logged in user menu
          <div className="space-y-4">
            <p className="text-white mb-4">
              환영합니다, {session.user.name || "Player"}님!
            </p>
            
            <Link href="/mypage" className="block">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors">
                내 페이지
              </button>
            </Link>
            
            {hasCharacter ? (
              <Link href="/leaderboard" className="block">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition-colors">
                  배틀 시작!
                </button>
              </Link>
            ) : (
              <Link href="/create-character" className="block">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded transition-colors">
                  첫 캐릭터 생성하기
                </button>
              </Link>
            )}
            
            <Link href="/leaderboard" className="block">
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded transition-colors">
                리더보드
              </button>
            </Link>

            {/* 관리자 버튼 - 특정 사용자에게만 표시 */}
            {(session.user.email === 'admin@example.com' || (session.user as any).isAdmin) && (
              <Link href="/admin" className="block">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded transition-colors">
                  관리자 패널
                </button>
              </Link>
            )}
            
            <button
              onClick={() => {
                import('next-auth/react').then(({ signOut }) => {
                  signOut({ callbackUrl: '/' })
                })
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : !showLoginOptions ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowLoginOptions(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors"
            >
              시작하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => {
                // Use signIn from next-auth for Kakao login
                import('next-auth/react').then(({ signIn }) => {
                  signIn('kakao', { callbackUrl: '/mypage' });
                });
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-8 rounded transition-colors"
            >
              카카오톡으로 시작
            </button>
            
            <Link href="/auth/email" className="block">
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded transition-colors">
                이메일로 가입/로그인
              </button>
            </Link>
            
            <Link href="/guest" className="block">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition-colors">
                게스트로 플레이 (1회)
              </button>
            </Link>
            
            <button
              onClick={() => setShowLoginOptions(false)}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              뒤로가기
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
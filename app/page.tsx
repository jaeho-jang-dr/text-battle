'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition, staggerContainer, staggerItem, buttonVariants, glowAnimation } from '@/lib/animations'

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
        setHasCharacter(true)
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
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg animate-pulse">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <motion.main 
      className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24"
      initial="initial"
      animate="animate"
      exit="exit"
      {...pageTransition}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <motion.div 
          className="text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 gradient-text"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              Text Battle Game
            </motion.h1>
          </motion.div>
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-8"
            variants={staggerItem}
          >
            12세 이상을 위한 텍스트 배틀 게임
          </motion.p>
          
          <AnimatePresence mode="wait">
            {session ? (
              // Logged in user menu
              <motion.div 
                key="logged-in"
                className="space-y-4 max-w-sm mx-auto"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.p 
                  className="text-white mb-4 text-lg"
                  variants={staggerItem}
                >
                  Welcome, <span className="gradient-text font-bold">{session.user.name}</span>!
                </motion.p>
              
                {hasCharacter ? (
                  <>
                    <motion.div variants={staggerItem}>
                      <Link href="/my-character">
                        <motion.div
                          className="block w-full btn-primary text-center cursor-pointer"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          My Character
                        </motion.div>
                      </Link>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                      <Link href="/play">
                        <motion.div
                          className="block w-full btn-success text-center cursor-pointer glow-green"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Play Game
                        </motion.div>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={staggerItem}>
                    <Link href="/create-character">
                      <motion.div
                        className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl text-center cursor-pointer"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        Create Character
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              
                <motion.div variants={staggerItem}>
                  <Link href="/leaderboard">
                    <motion.div
                      className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl text-center cursor-pointer"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Leaderboard
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div variants={staggerItem}>
                  <motion.button
                    onClick={() => {
                      import('next-auth/react').then(({ signOut }) => {
                        signOut({ callbackUrl: '/' })
                      })
                    }}
                    className="block w-full btn-secondary text-center"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Sign Out
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : !showLoginOptions ? (
              <motion.div 
                key="start"
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.button
                  onClick={() => setShowLoginOptions(true)}
                  className="block w-full max-w-sm mx-auto btn-primary text-center glow-blue"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  {...glowAnimation}
                >
                  시작하기
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="login-options"
                className="space-y-4 max-w-sm mx-auto"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <motion.div variants={staggerItem}>
                  <motion.button
                    onClick={() => {
                      // Use signIn from next-auth for Kakao login
                      import('next-auth/react').then(({ signIn }) => {
                        signIn('kakao', { callbackUrl: '/create-character' });
                      });
                    }}
                    className="block w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl text-center"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    카카오톡으로 시작
                  </motion.button>
                </motion.div>
                
                <motion.div variants={staggerItem}>
                  <Link href="/auth/email">
                    <motion.div
                      className="block w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl text-center cursor-pointer"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      이메일로 가입/로그인
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div variants={staggerItem}>
                  <Link href="/guest">
                    <motion.div
                      className="block w-full btn-success text-center cursor-pointer"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      게스트로 플레이 (1회)
                    </motion.div>
                  </Link>
                </motion.div>
                
                <motion.div variants={staggerItem}>
                  <motion.button
                    onClick={() => setShowLoginOptions(false)}
                    className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    뒤로가기
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.main>
  )
}
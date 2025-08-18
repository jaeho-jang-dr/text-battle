/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.FIREBASE_DEPLOY === 'true' ? 'export' : undefined,
  images: {
    domains: ['k.kakaocdn.net'], // 카카오톡 프로필 이미지용
    unoptimized: process.env.FIREBASE_DEPLOY === 'true',
  },
  // Firebase hosting specific configurations
  trailingSlash: false,
  // Disable Image Optimization API for static export
  experimental: {
    // Enable if you need server actions in production
    // serverActions: true,
  },
}

module.exports = nextConfig
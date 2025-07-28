/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lovable 배포를 위한 설정
  output: 'standalone',
  
  images: {
    domains: ['localhost'],
    unoptimized: true // Lovable 호환성
  },
  
  reactStrictMode: true,
  
  // React DevTools 에러 방지
  env: {
    NEXT_PUBLIC_REACT_DEVTOOLS: 'false',
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV || 'development'
  },
  
  // 실험적 기능
  experimental: {
    serverActions: true
  },
  
  // 개발 환경에서 React DevTools 비활성화
  webpack: (config, { dev }) => {
    if (dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-devtools-core': false,
      }
    }
    return config
  }
}

module.exports = nextConfig
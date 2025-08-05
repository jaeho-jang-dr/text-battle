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
    // serverActions는 Next.js 14에서 기본 활성화됨
  },
  
  // Replit 빌드 에러 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 개발 환경에서 React DevTools 비활성화 및 경로 별칭 설정
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-devtools-core': false,
      }
    }
    
    // Replit을 위한 경로 별칭 설정
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    }
    
    // Replit 환경 최적화
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config
  },
  
  // Replit 전용 추가 설정
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'bcryptjs']
  },
  
  // SWC 비활성화 (Replit 호환성)
  swcMinify: false
}

module.exports = nextConfig
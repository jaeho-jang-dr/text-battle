/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  reactStrictMode: true,
  // React DevTools 에러 방지
  env: {
    NEXT_PUBLIC_REACT_DEVTOOLS: 'false'
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
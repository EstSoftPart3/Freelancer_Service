/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 정적 Export 활성화
  output: 'export',
  
  // basePath 설정 (context-path와 일치)
  // basePath: '/api',
  
  // 이미지 최적화 비활성화 (정적 export 필수)
  images: {
    unoptimized: true,
  },
  
  // 개발 환경에서만 API 프록시 사용 (정적 export와 호환 안됨)
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
      ]
    },
  }),
}

module.exports = nextConfig





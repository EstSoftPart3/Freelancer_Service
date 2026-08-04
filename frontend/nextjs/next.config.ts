import type { NextConfig } from "next";
import path from "path";

// 서버(컨테이너) 안에서 백엔드로 나가는 주소.
// NEXT_PUBLIC_API_BASE_URL 에 공개 도메인(https://job.estsw.co.kr/api)을 넣으면
// 아래 rewrites 가 자기 자신을 가리켜 무한 루프가 되므로, 내부 주소는 반드시 분리한다.
// 운영값 예: http://backend:8080/api (compose 서비스명)
const BACKEND =
  process.env.API_INTERNAL_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080/api'

const nextConfig: NextConfig = {
  // Docker 배포용 — .next/standalone 에 최소 실행본을 떨군다(없으면 이미지가 1GB 초과).
  output: 'standalone',
  // 모노레포 상위(frontend/, 레포 루트)를 추적 루트로 잡지 않도록 고정.
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND}/:path*`,
      },
    ]
  },
};

export default nextConfig;

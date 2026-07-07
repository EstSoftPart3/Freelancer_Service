// 서버 레이아웃 — 메타데이터(noindex) export용. UI는 클라이언트 컴포넌트에 위임.
// ('use client' 컴포넌트는 metadata를 export할 수 없어 분리)
import type { Metadata } from 'next'
import MyPageLayoutClient from '@/components/mypage/MyPageLayoutClient'

// 마이페이지 전체(하위 22페이지) 색인 제외 — robots.txt disallow와 이중 방어
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return <MyPageLayoutClient>{children}</MyPageLayoutClient>
}

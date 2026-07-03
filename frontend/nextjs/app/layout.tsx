// Mirrors vue_js/src/App.vue — Root layout: Header, Footer, Modal container, Providers
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import Script from 'next/script'
import './globals.css'
import CommonHeader from '@/components/common/CommonHeader'
import CommonFooter from '@/components/common/CommonFooter'
import CommonModalContainer from '@/components/common/CommonModalContainer'
import Providers from '@/components/common/Providers'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

// SEO placeholder — 각 page.tsx에서 generateMetadata()로 오버라이드
export const metadata: Metadata = {
  title: {
    default: 'Freelancer Service',
    template: '%s | Freelancer Service',
  },
  description: '프리랜서와 기업을 연결하는 서비스',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <CommonHeader />
          {/* App.vue .main: padding-top은 헤더 높이(64px) 보정 */}
          <main className="flex-1 pt-16">{children}</main>
          <CommonModalContainer />
          <CommonFooter />
        </Providers>
        {/* Kakao Maps SDK — 주소 지오코딩 (회원가입, 프로젝트 등록 등) */}
        {/* autoload=false: SDK의 document.write 기반 라이브러리 로딩이 비동기 스크립트에서 차단되는 문제 회피.
            각 사용처에서 kakao.maps.load(callback)으로 명시적으로 초기화한다. */}
        <Script
          src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=90610faa13d02b09f83a700d0885a872&libraries=services&autoload=false"
          strategy="beforeInteractive"
        />
        {/* Daum 우편번호 검색 — 전역 1회 로드 (이전엔 일부 화면에만 개별 로드돼 방문 순서에 따라 동작이 들쭉날쭉했음) */}
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="afterInteractive"
        />
        {/* offset: 헤더(64px) + 여유 8px = 72px */}
        <Toaster position="top-center" offset="72px" richColors duration={2000} closeButton />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}

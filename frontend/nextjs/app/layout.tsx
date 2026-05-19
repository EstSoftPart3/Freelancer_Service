// Mirrors vue_js/src/App.vue — Root layout: Header, Footer, Modal container, Providers
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
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
        <Toaster position="top-center" richColors />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}

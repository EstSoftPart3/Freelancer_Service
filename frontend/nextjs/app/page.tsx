// Mirrors vue_js/src/fo/views/MainPage.vue
import type { Metadata } from 'next'
import MainPage from '@/components/main/MainPage'

export const metadata: Metadata = {
  title: '홈',
  description: '프리랜서와 기업을 연결하는 서비스',
}

export default function Page() {
  return <MainPage />
}

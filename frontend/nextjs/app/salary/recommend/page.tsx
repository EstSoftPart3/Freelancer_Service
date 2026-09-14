import type { Metadata } from 'next'
import SalaryRecommendScreen from '@/components/salary/SalaryRecommendScreen'

export const metadata: Metadata = {
  title: '추천 프로젝트',
  robots: { index: false }, // Phase2 시연용 — 정식 반영 전까지 색인 제외
}

export default function SalaryRecommendPage() {
  return <SalaryRecommendScreen />
}

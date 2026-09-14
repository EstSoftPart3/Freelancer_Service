import type { Metadata } from 'next'
import SalaryRankingScreen from '@/components/salary/SalaryRankingScreen'

export const metadata: Metadata = {
  title: '연봉순위표',
  robots: { index: false }, // Phase2 시연용 — 정식 반영 전까지 색인 제외
}

export default function SalaryRankingPage() {
  return <SalaryRankingScreen />
}

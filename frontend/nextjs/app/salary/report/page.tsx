import type { Metadata } from 'next'
import SalaryReportScreen from '@/components/salary/SalaryReportScreen'

export const metadata: Metadata = {
  title: '연봉 리포트',
  robots: { index: false }, // Phase2 시연용 — 정식 반영 전까지 색인 제외
}

export default function SalaryReportPage() {
  return <SalaryReportScreen />
}

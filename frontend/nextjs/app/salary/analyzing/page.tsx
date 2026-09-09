import type { Metadata } from 'next'
import SalaryAnalyzingScreen from '@/components/salary/SalaryAnalyzingScreen'

export const metadata: Metadata = {
  title: '연봉 분석 중',
  robots: { index: false },
}

export default function SalaryAnalyzingPage() {
  return <SalaryAnalyzingScreen />
}

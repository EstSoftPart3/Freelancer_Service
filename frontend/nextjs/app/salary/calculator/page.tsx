import type { Metadata } from 'next'
import SalaryCalculatorForm from '@/components/salary/SalaryCalculatorForm'

export const metadata: Metadata = {
  title: '연봉계산기',
  robots: { index: false }, // Phase2 시연용 — 정식 반영 전까지 색인 제외
}

export default function SalaryCalculatorPage() {
  return <SalaryCalculatorForm />
}

import type { Metadata } from 'next'
import CalendarClient from '@/components/mypage/common/CalendarClient'

export const metadata: Metadata = { title: '일정 관리' }

export default function CalendarPage() {
  return <CalendarClient />
}

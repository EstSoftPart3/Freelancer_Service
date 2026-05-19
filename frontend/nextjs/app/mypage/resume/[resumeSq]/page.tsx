import type { Metadata } from 'next'
import ResumeFormClient from '@/components/mypage/personal/ResumeFormClient'

export const metadata: Metadata = { title: '이력서 수정' }

interface Props {
  params: Promise<{ resumeSq: string }>
}

export default async function ResumeEditPage({ params }: Props) {
  const { resumeSq } = await params
  return <ResumeFormClient resumeSq={Number(resumeSq)} />
}

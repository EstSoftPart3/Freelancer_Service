import type { Metadata } from 'next'
import { Suspense } from 'react'
import QnaDetailClient from '@/components/community/QnaDetailClient'

interface Props {
  params: Promise<{ board_sq: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board_sq } = await params
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api'
    const res = await fetch(`${baseUrl}/qna/${board_sq}`, { cache: 'no-store' })
    if (res.ok) {
      const data = (await res.json()) as { output: { ttl: string } }
      if (data.output?.ttl) return { title: data.output.ttl }
    }
  } catch {}
  return { title: 'QnA 상세' }
}

export default async function QnaDetailPage({ params }: Props) {
  const { board_sq } = await params
  return <Suspense><QnaDetailClient boardSq={board_sq} /></Suspense>
}

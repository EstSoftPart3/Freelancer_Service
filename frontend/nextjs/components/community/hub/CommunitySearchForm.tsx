'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// 커뮤니티 통합 검색폼 — 허브 좌측 사이드바(데스크톱)와 본문 상단(모바일)에서 공용.
export default function CommunitySearchForm() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const kw = keyword.trim()
    if (!kw) return
    router.push(`/community/list?searchType=all&keyword=${encodeURIComponent(kw)}`)
  }

  return (
    <form onSubmit={onSearch} className="flex items-center gap-1 rounded-lg border px-2">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="검색어를 입력하세요"
        className="h-9 border-none px-1 shadow-none focus-visible:ring-0"
      />
    </form>
  )
}

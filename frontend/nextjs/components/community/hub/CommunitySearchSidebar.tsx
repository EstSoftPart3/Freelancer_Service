'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import type { SkillTagShortcut } from '@/lib/community'

interface Props {
  tags: SkillTagShortcut[]
}

export default function CommunitySearchSidebar({ tags }: Props) {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const kw = keyword.trim()
    if (!kw) return
    router.push(`/community/list?searchType=all&keyword=${encodeURIComponent(kw)}`)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex items-center gap-1 rounded-lg border px-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="h-9 border-none px-1 shadow-none focus-visible:ring-0"
        />
      </form>

      {tags.length > 0 && (
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-semibold">Q&A 기술 태그</h3>
          <ul className="space-y-1">
            {tags.map((t) => (
              <li key={t.skillTagSq}>
                <button
                  type="button"
                  onClick={() => router.push(`/qna?tag=${encodeURIComponent(t.skillTagNm)}`)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-4 w-4" />
                  {t.skillTagNm}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

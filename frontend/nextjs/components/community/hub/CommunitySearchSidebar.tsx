'use client'
import { useRouter } from 'next/navigation'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import CommunitySearchForm from '@/components/community/hub/CommunitySearchForm'
import type { SkillTagShortcut } from '@/lib/community'

interface Props {
  tags: SkillTagShortcut[]
}

export default function CommunitySearchSidebar({ tags }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* 모바일은 본문 상단의 CommunitySearchForm이 담당 — 중복 노출 방지 */}
      <div className="hidden lg:block">
        <CommunitySearchForm />
      </div>

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

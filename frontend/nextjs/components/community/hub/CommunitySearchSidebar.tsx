'use client'
import { useRouter } from 'next/navigation'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import CommunitySearchForm from '@/components/community/hub/CommunitySearchForm'
import { useBoardCategories } from '@/hooks/useBoardCategories'
import { BOARD_CATEGORY_TIPS } from '@/components/community/boardMeta'
import type { SkillTagShortcut } from '@/lib/community'

interface Props {
  tags: SkillTagShortcut[]
}

export default function CommunitySearchSidebar({ tags }: Props) {
  const router = useRouter()
  const categories = useBoardCategories()

  return (
    <div className="space-y-4">
      {/* 모바일은 본문 상단의 CommunitySearchForm이 담당 — 중복 노출 방지 */}
      <div className="hidden lg:block">
        <CommunitySearchForm />
      </div>

      {/* 게시판 카테고리 — Q&A 기술 태그보다 위. 태그는 Q&A 한 게시판의 하위 축이고
          카테고리는 일반게시판 전체를 가르는 축이라 더 큰 단위가 먼저 온다. */}
      {categories.length > 0 && (
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-semibold">게시판 카테고리</h3>
          <ul className="space-y-1">
            {categories.map((c) => (
              <li key={c.commonCodeSq}>
                <button
                  type="button"
                  onClick={() => router.push(`/board?category=${c.commonCodeSq}`)}
                  title={BOARD_CATEGORY_TIPS[c.commonCodeSq]}
                  className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  {c.commonCodeNm}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

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

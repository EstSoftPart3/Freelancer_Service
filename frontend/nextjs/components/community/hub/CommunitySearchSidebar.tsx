'use client'
import { useRouter } from 'next/navigation'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import CommunitySearchForm from '@/components/community/hub/CommunitySearchForm'
import { BOARD_TYPE_LABEL, type BoardType } from '@/components/community/boardMeta'
import type { SkillTagShortcut } from '@/lib/community'

interface Props {
  tags: SkillTagShortcut[]
}

// Phase2 재설계 이후 대분류 자체가 게시판 종류라, 예전처럼 "일반게시판의 카테고리"
// 하나로 뭉뚱그릴 수 없다 — 헤더 메가메뉴와 같은 5종을 그대로 링크한다.
const BOARDS: readonly Exclude<BoardType, 'all'>[] = ['career', 'tech', 'company', 'teamup', 'lounge']

export default function CommunitySearchSidebar({ tags }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* 모바일은 본문 상단의 CommunitySearchForm이 담당 — 중복 노출 방지 */}
      <div className="hidden lg:block">
        <CommunitySearchForm />
      </div>

      {/* 게시판 — Q&A 기술 태그보다 위. 태그는 한 게시판의 하위 축이고
          게시판 종류는 커뮤니티 전체를 가르는 축이라 더 큰 단위가 먼저 온다. */}
      <div className="rounded-lg border p-3">
        <h3 className="mb-2 text-sm font-semibold">게시판</h3>
        <ul className="space-y-1">
          {BOARDS.map((b) => (
            <li key={b}>
              <button
                type="button"
                onClick={() => router.push(`/${b}`)}
                className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                {BOARD_TYPE_LABEL[b]}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {tags.length > 0 && (
        <div className="rounded-lg border p-3">
          <h3 className="mb-2 text-sm font-semibold">기술 태그</h3>
          <ul className="space-y-1">
            {tags.map((t) => (
              <li key={t.skillTagSq}>
                <button
                  type="button"
                  onClick={() => router.push(`/tech?tag=${encodeURIComponent(t.skillTagNm)}`)}
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

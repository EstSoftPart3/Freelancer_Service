'use client'
import { useBoardCategories } from '@/hooks/useBoardCategories'
import { InfoTooltip } from '@/components/ui/tooltip'
import { BOARD_CATEGORY_TIPS, type BoardType } from '@/components/community/boardMeta'

interface Props {
  boardType: BoardType
  // null = 전체. URL의 ?category= 값을 숫자로 파싱한 결과가 그대로 들어온다.
  selected: number | null
  onSelect: (categoryCd: number | null) => void
}

/**
 * 중분류가 있는 게시판(커리어소통·기술소통·프로젝트·라운지) 전용 카테고리 필터 줄.
 *
 * 게시판 종류를 고르는 상위 탭(CategoryTabs)과 다른 축이라 시각적으로도 구분한다 —
 * 상위 탭은 알약형 버튼, 이쪽은 얇은 테두리 칩이다. 중분류가 없는 게시판(요즘회사 등)에서는
 * 아무것도 그리지 않는다.
 */
export default function BoardCategoryTabs({ boardType, selected, onSelect }: Props) {
  const categories = useBoardCategories(boardType)
  if (categories.length === 0) return null

  const chip = (active: boolean) =>
    `shrink-0 cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1 text-[13px] transition-colors ${
      active
        ? 'border-foreground bg-foreground font-semibold text-background'
        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <div className="mb-3 flex items-center gap-1.5">
      {/* 칩 자체만 가로 스크롤 — 안내 아이콘을 이 안에 두면 칩이 많은 좁은 화면에서
          스크롤해야만 보이므로 바깥에 고정한다. */}
      <div className="flex min-w-0 gap-1.5 overflow-x-auto pb-1">
        <button type="button" onClick={() => onSelect(null)} className={chip(selected === null)}>
          전체
        </button>
        {categories.map((c) => (
          <button
            key={c.commonCodeSq}
            type="button"
            onClick={() => onSelect(c.commonCodeSq)}
            className={chip(selected === c.commonCodeSq)}
          >
            {c.commonCodeNm}
          </button>
        ))}
      </div>
      <InfoTooltip label="카테고리 안내" className="shrink-0">
        <p className="font-semibold">카테고리</p>
        <ul className="mt-1 space-y-1">
          {categories.map((c) => (
            <li key={c.commonCodeSq}>
              · <span className="font-medium">{c.commonCodeNm}</span>
              {BOARD_CATEGORY_TIPS[c.commonCodeSq] ? ` — ${BOARD_CATEGORY_TIPS[c.commonCodeSq]}` : ''}
            </li>
          ))}
        </ul>
      </InfoTooltip>
    </div>
  )
}

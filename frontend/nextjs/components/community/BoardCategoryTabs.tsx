'use client'
import { useBoardCategories } from '@/hooks/useBoardCategories'

interface Props {
  // null = 전체. URL의 ?category= 값을 숫자로 파싱한 결과가 그대로 들어온다.
  selected: number | null
  onSelect: (categoryCd: number | null) => void
}

/**
 * 일반게시판(/board) 전용 카테고리 필터 줄.
 *
 * 게시판 종류를 고르는 상위 탭(CategoryTabs)과 다른 축이라 시각적으로도 구분한다 —
 * 상위 탭은 알약형 버튼, 이쪽은 얇은 테두리 칩이다.
 */
export default function BoardCategoryTabs({ selected, onSelect }: Props) {
  const categories = useBoardCategories()

  const chip = (active: boolean) =>
    `shrink-0 cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1 text-[13px] transition-colors ${
      active
        ? 'border-foreground bg-foreground font-semibold text-background'
        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
    }`

  return (
    <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
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
  )
}

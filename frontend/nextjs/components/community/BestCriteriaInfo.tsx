'use client'

// 추천글/인기글/베스트글 선정 기준을 시현하기 위한 안내 팝오버.
// 백엔드 findBestBoards SQL 기준과 1:1로 일치시킨다:
//   score = board_view_cnt*1 + board_comment_cnt*2 + board_recommend_cnt*3
//   daily=1일 / weekly=7일 / monthly=30일 이내 작성글, 삭제글 제외, score DESC(동점 최신순)
import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function BestCriteriaInfo({ note }: { note?: string }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="선정 기준 안내"
        className="inline-flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        <Info className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0 text-xs">
        <p className="font-semibold text-foreground">선정 기준</p>
        <p className="mt-1">
          <span className="font-medium text-foreground">점수</span> = 조회수 × 1 + 댓글 × 2 + 추천 × 3
        </p>
        <ul className="mt-1.5 space-y-0.5">
          <li>· 지금 인기: 최근 1일 이내 작성글</li>
          <li>· 주간 인기: 최근 7일 이내 작성글</li>
          <li>· 월간 인기: 최근 30일 이내 작성글</li>
        </ul>
        <p className="mt-1.5">점수가 높은 순으로 정렬되며, 동점이면 최신글이 우선입니다.</p>
        {note && <p className="mt-1.5 text-foreground">{note}</p>}
      </PopoverContent>
    </Popover>
  )
}

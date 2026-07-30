'use client'

// 추천글/인기글/베스트글 선정 기준을 시현하기 위한 안내 팝오버.
// 백엔드 findBestBoards SQL 기준과 1:1로 일치시킨다:
//   score = board_view_cnt*1 + board_comment_cnt*2 + board_recommend_cnt*3
//   daily=1일 / weekly=7일 / monthly=30일 이내 작성글, 삭제글 제외, score DESC(동점 최신순)
// 세 기간을 나열하지 않는다 — 보고 있는 목록의 기준만 note로 알려주면 되고,
// 나머지 두 기간은 이 자리에서 알 필요가 없다.
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
        <p className="mt-1">점수가 높은 순으로 정렬되며, 동점이면 최신글이 우선입니다.</p>
        <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
          <li>· 기간은 <span className="font-medium text-foreground">작성일</span> 기준입니다(댓글·추천이 달린 날 기준이 아닙니다).</li>
          <li>· 자유게시판·Q&amp;A 글만 집계하며, 공지사항은 제외됩니다.</li>
          <li>· 삭제된 글은 집계에서 빠집니다.</li>
        </ul>
        {note && <p className="mt-1.5 text-foreground">{note}</p>}
      </PopoverContent>
    </Popover>
  )
}

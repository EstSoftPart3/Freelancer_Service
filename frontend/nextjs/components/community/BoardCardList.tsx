'use client'
import Link from 'next/link'
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { fmtDate, STATUS, BOARD_TYPE_LABEL, resolveBoardType, type BoardType } from '@/components/community/boardMeta'
import type { BoardItem } from '@/types'

interface Props {
  boardList: BoardItem[]
  boardType: BoardType
}

// 모바일(md 미만) 목록 — 카드형. md 이상은 BoardTable이 담당한다.
// 카드 전체를 Link로 감싸지 않는다(내부 태그 Link와 a-in-a 중첩 방지).
export default function BoardCardList({ boardList, boardType }: Props) {
  if (boardList.length === 0) {
    return <div className="rounded-lg border py-12 text-center text-muted-foreground">게시글이 없습니다.</div>
  }

  return (
    <ul className="space-y-2">
      {boardList.map((b) => {
        const resolvedType = resolveBoardType(b, boardType)
        const isRowQna = resolvedType === 'qna'
        const status = isRowQna && b.boardAdoptStatusCd ? STATUS[b.boardAdoptStatusCd] : undefined
        const hasTags = (b.skillTags?.length ?? 0) > 0 || (b.normalTags?.length ?? 0) > 0
        return (
          <li key={b.sq} className="rounded-lg border p-3 transition-colors hover:bg-muted/30">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {BOARD_TYPE_LABEL[resolvedType]}
              </span>
              {/* 카테고리 뱃지 — 미분류(null)인 기존 글에는 아무것도 그리지 않는다 */}
              {b.categoryNm && (
                <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary">
                  {b.categoryNm}
                </span>
              )}
              {status && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                  {status.label}
                </span>
              )}
            </div>
            <Link href={`/${resolvedType}/${b.sq}`} className="line-clamp-2 font-medium hover:text-primary hover:underline">
              {b.ttl}
              {isRowQna && !!b.answerCnt && b.answerCnt > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">답변 {b.answerCnt}</span>
              )}
            </Link>
            {hasTags && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {b.skillTags?.map((t) => (
                  <Link
                    key={t.skillTagSq}
                    href={`/${resolvedType}?tag=${encodeURIComponent(t.skillTagNm)}`}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
                  >
                    <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3 w-3" />
                    {t.skillTagNm}
                  </Link>
                ))}
                {b.normalTags?.map((t) => (
                  <Link
                    key={t}
                    href={`/${resolvedType}?tag=${encodeURIComponent(t)}`}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground hover:text-primary"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="truncate">{b.userNickname}</span>
              <span className="shrink-0">{fmtDate(b.createdAt)}</span>
              <span className="ml-auto flex shrink-0 items-center gap-1"><Eye className="h-3.5 w-3.5" />{b.viewCnt}</span>
              <span className="flex shrink-0 items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{b.commentCnt}</span>
              <span className="flex shrink-0 items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{b.recommendCnt}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

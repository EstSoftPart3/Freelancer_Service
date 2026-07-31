'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { fmtDate, STATUS, resolveBoardType, canOpenDetail, type BoardType } from '@/components/community/boardMeta'
import { CategoryBadge, BoardTypeBadge, SecretBadge } from '@/components/community/CategoryBadge'
import type { BoardItem } from '@/types'

interface Props {
  boardList: BoardItem[]
  boardType: BoardType
  // 비공개 글의 잠금 판정용 — 내 글이면 열 수 있다
  viewerSq?: number
}

interface TagRowProps {
  skillTags: BoardItem['skillTags']
  normalTags: BoardItem['normalTags']
  resolvedType: BoardType
}

const TAG_GAP = 4 // gap-1
const BADGE_WIDTH = 40 // "+N" 뱃지 자리 확보용 예상 너비

// 태그 줄 — 빈 경우에도 고정 높이를 두어 모든 로우 높이를 통일.
// 한 줄에 다 안 들어가면 잘라내는 대신 들어가는 만큼만 보여주고 나머지는 +N으로 표기한다.
function TagRow({ skillTags, normalTags, resolvedType }: TagRowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // 최초 전체 렌더에서 잰 태그별 실제 너비 — 이후 리사이즈 재계산에 재사용
  const widthsRef = useRef<number[]>([])
  const total = (skillTags?.length ?? 0) + (normalTags?.length ?? 0)
  const [visibleCount, setVisibleCount] = useState(total)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || total === 0) return

    if (widthsRef.current.length !== total) {
      widthsRef.current = Array.from(el.children)
        .filter((c): c is HTMLElement => c instanceof HTMLElement && !c.dataset.overflowBadge)
        .map((c) => c.offsetWidth)
    }

    const compute = () => {
      const widths = widthsRef.current
      const max = el.clientWidth
      let used = 0
      let fit = 0
      for (const w of widths) {
        const need = w + (fit > 0 ? TAG_GAP : 0)
        if (used + need > max) break
        used += need
        fit++
      }
      if (fit >= total) {
        setVisibleCount(total)
        return
      }
      while (fit > 0 && used + TAG_GAP + BADGE_WIDTH > max) {
        used -= widths[fit - 1] + (fit > 1 ? TAG_GAP : 0)
        fit--
      }
      setVisibleCount(fit)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [total])

  const skillLen = skillTags?.length ?? 0
  const visibleSkillTags = skillTags?.slice(0, Math.min(visibleCount, skillLen)) ?? []
  const visibleNormalTags = normalTags?.slice(0, Math.max(0, visibleCount - skillLen)) ?? []
  const hiddenCount = total - visibleCount

  return (
    <div ref={containerRef} className="mt-1 flex h-5 flex-nowrap items-center gap-1 overflow-hidden">
      {visibleSkillTags.map((t) => (
        <Link
          key={t.skillTagSq}
          href={`/${resolvedType}?tag=${encodeURIComponent(t.skillTagNm)}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
        >
          <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3 w-3" />
          {t.skillTagNm}
        </Link>
      ))}
      {visibleNormalTags.map((t) => (
        <Link
          key={t}
          href={`/${resolvedType}?tag=${encodeURIComponent(t)}`}
          className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground hover:text-primary"
        >
          #{t}
        </Link>
      ))}
      {hiddenCount > 0 && (
        <span
          data-overflow-badge
          className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  )
}

// 데스크톱(md 이상) 목록 — 헤더 없는 리스트형 행. md 미만은 BoardCardList가 담당한다.
export default function BoardTable({ boardList, boardType, viewerSq }: Props) {
  const isQna = boardType === 'qna'
  const isAll = boardType === 'all'
  const hasStatusCol = isQna || isAll

  if (boardList.length === 0) {
    return <div className="rounded-lg border py-12 text-center text-muted-foreground">게시글이 없습니다.</div>
  }

  return (
    <ul className="divide-y rounded-lg border">
      {boardList.map((b) => {
        const resolvedType = resolveBoardType(b, boardType)
        const isRowQna = resolvedType === 'qna'
        const status = isRowQna && b.boardAdoptStatusCd ? STATUS[b.boardAdoptStatusCd] : undefined
        const locked = !canOpenDetail(b, viewerSq)
        return (
          <li key={b.sq} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
            <div className="min-w-0 flex-1">
              {/* 뱃지 줄 — 전체보기에서는 유형 뱃지를 먼저 달아 카테고리 없는 Q&A 행도 줄을 맞춘다.
                  카테고리는 미분류(null)면 그리지 않는다 */}
              <div className="mb-0.5 flex items-center gap-1.5">
                {isAll && <BoardTypeBadge type={resolvedType} />}
                {b.secret && <SecretBadge />}
                <CategoryBadge name={b.categoryNm} />
                {locked ? (
                  // 잠긴 항목은 링크로 만들지 않는다 — 눌러서 403을 보는 것보다 낫다
                  <span
                    className="min-w-0 truncate font-medium text-muted-foreground"
                    title="작성자와 운영자만 볼 수 있는 문의입니다."
                  >
                    {b.ttl}
                  </span>
                ) : (
                  <Link
                    href={`/${resolvedType}/${b.sq}`}
                    className="min-w-0 truncate font-medium hover:text-primary hover:underline"
                  >
                    {b.ttl}
                    {isRowQna && !!b.answerCnt && b.answerCnt > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">답변 {b.answerCnt}</span>
                    )}
                  </Link>
                )}
              </div>
              <TagRow skillTags={b.skillTags} normalTags={b.normalTags} resolvedType={resolvedType} />
            </div>
            <span className="w-20 shrink-0 truncate text-center text-sm">{b.userNickname}</span>
            <span className="w-16 shrink-0 text-center text-xs text-muted-foreground">{fmtDate(b.createdAt)}</span>
            <div className="flex w-44 shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="flex w-12 items-center gap-1"><Eye className="h-3.5 w-3.5" />{b.viewCnt}</span>
              <span className="flex w-12 items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{b.commentCnt}</span>
              <span className="flex w-12 items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{b.recommendCnt}</span>
            </div>
            {hasStatusCol && (
              <span className="w-16 shrink-0 text-center">
                {status && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                    {status.label}
                  </span>
                )}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

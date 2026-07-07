'use client'
import Link from 'next/link'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import type { BoardItem } from '@/types'

function fmtDate(iso: string) {
  const d = new Date(iso)
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

type BoardType = 'board' | 'qna' | 'notice' | 'all'

const STATUS: Record<number, { label: string; cls: string }> = {
  1501: { label: '진행중', cls: 'bg-yellow-100 text-yellow-800' },
  1502: { label: '채택완료', cls: 'bg-green-100 text-green-800' },
  1503: { label: '자체해결', cls: 'bg-gray-100 text-gray-700' },
  1504: { label: '미해결', cls: 'bg-red-100 text-red-700' },
}

interface Props {
  boardList: BoardItem[]
  boardType: BoardType
}

export default function BoardTable({ boardList, boardType }: Props) {
  const isQna = boardType === 'qna'
  const isAll = boardType === 'all'

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-muted-foreground">
            <th className="w-14 px-3 py-2.5 text-center font-medium">순번</th>
            <th className="px-3 py-2.5 font-medium">제목</th>
            <th className="w-20 px-3 py-2.5 text-center font-medium">작성자</th>
            <th className="w-24 px-3 py-2.5 text-center font-medium">등록일</th>
            <th className="w-14 px-3 py-2.5 text-center font-medium">조회</th>
            <th className="hidden w-14 px-3 py-2.5 text-center font-medium md:table-cell">댓글</th>
            <th className="hidden w-14 px-3 py-2.5 text-center font-medium md:table-cell">추천</th>
            {(isQna || isAll) && <th className="hidden w-20 px-3 py-2.5 text-center font-medium sm:table-cell">상태</th>}
          </tr>
        </thead>
        <tbody>
          {boardList.length === 0 ? (
            <tr>
              <td colSpan={isQna || isAll ? 8 : 7} className="py-12 text-center text-muted-foreground">
                게시글이 없습니다.
              </td>
            </tr>
          ) : (
            boardList.map((b) => {
              const resolvedType = b.boardType ?? (boardType === 'all' ? 'board' : boardType)
              const isRowQna = resolvedType === 'qna'
              return (
              <tr key={b.sq} className="border-b transition-colors hover:bg-muted/30">
                <td className="px-3 py-2.5 text-center text-muted-foreground">{b.sq}</td>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/${resolvedType}/${b.sq}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {b.ttl}
                    {isRowQna && !!b.answerCnt && b.answerCnt > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">답변 {b.answerCnt}</span>
                    )}
                  </Link>
                  {/* 태그 줄 — 빈 경우에도 고정 높이를 두어 모든 로우 높이를 통일 */}
                  <div className="mt-1 flex h-5 flex-nowrap items-center gap-1 overflow-hidden">
                    {b.skillTags?.map((t) => (
                      <Link
                        key={t.skillTagSq}
                        href={`/${resolvedType}?tag=${encodeURIComponent(t.skillTagNm)}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
                      >
                        <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3 w-3" />
                        {t.skillTagNm}
                      </Link>
                    ))}
                    {b.normalTags?.map((t) => (
                      <Link
                        key={t}
                        href={`/${resolvedType}?tag=${encodeURIComponent(t)}`}
                        className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground hover:text-primary"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">{b.userNm}</td>
                <td className="px-3 py-2.5 text-center">{fmtDate(b.createdAt)}</td>
                <td className="px-3 py-2.5 text-center">{b.viewCnt}</td>
                <td className="hidden px-3 py-2.5 text-center md:table-cell">{b.commentCnt}</td>
                <td className="hidden px-3 py-2.5 text-center md:table-cell">{b.recommendCnt}</td>
                {(isQna || isAll) && (
                  <td className="hidden px-3 py-2.5 text-center sm:table-cell">
                    {isRowQna && b.boardAdoptStatusCd && STATUS[b.boardAdoptStatusCd] && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[b.boardAdoptStatusCd].cls}`}>
                        {STATUS[b.boardAdoptStatusCd].label}
                      </span>
                    )}
                  </td>
                )}
              </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

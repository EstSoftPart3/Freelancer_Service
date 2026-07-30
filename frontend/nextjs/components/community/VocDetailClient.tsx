'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import BoardPost from '@/components/community/BoardPost'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { incrementView } from '@/lib/viewCount'
import type { BoardDetail, AnswerSummary } from '@/types'

interface Props {
  boardSq: string
}

const emptyBoard: BoardDetail = {
  sq: 0, ttl: '', description: '', userSq: 0, userNickname: '', createdAt: '',
  viewCnt: 0, recommendCnt: 0, commentCnt: 0, skillTags: [], normalTags: [],
  attachments: [], comments: [], answers: [],
}

function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 고객의 소리 상세.
 *
 * Q&A와 저장소·답변 구조는 같지만 화면 성격이 다르다 — 답변은 운영자가 BO에서만 달고,
 * 사용자끼리 주고받는 축(답변 작성·채택·댓글·추천)이 없다. 그래서 QnaDetailClient 를
 * 재사용하지 않고 읽기 전용 답변 목록만 두었다.
 */
export default function VocDetailClient({ boardSq }: Props) {
  const router = useRouter()
  const { setViewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(emptyBoard)
  const [loading, setLoading] = useState(true)

  const getBoard = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/voc/${boardSq}`)
      setBoardInfo(data.output)
      setViewerSq(data.output.viewerSq ?? null)
    } catch (err: unknown) {
      // 403 = 남의 비공개 글, 404 = 없거나 삭제된 글. 둘 다 목록으로 돌려보낸다.
      // (서버도 "있는데 못 본다"와 "없다"를 구분해 알려주지 않는다 — 존재 자체가 정보다)
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      alertStore.show(res?.data?.message ?? '글을 불러올 수 없습니다.', 'danger')
      router.replace('/voc')
    } finally {
      setLoading(false)
    }
  }, [boardSq, setViewerSq, router])

  useEffect(() => {
    incrementView(`/voc/${boardSq}`)
    getBoard()
  }, [boardSq, getBoard])

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center text-muted-foreground">
        불러오는 중입니다...
      </div>
    )
  }

  const answers = boardInfo.answers ?? []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BoardPost boardInfo={boardInfo} boardType="voc" onRefresh={getBoard} />

      <div className="mt-8">
        <h2 className="mb-4 text-base font-semibold">운영자 답변 ({answers.length})</h2>
        {answers.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            아직 답변이 등록되지 않았습니다. 확인 후 답변드리겠습니다.
          </p>
        ) : (
          answers.map((answer: AnswerSummary) => (
            <article key={answer.sq ?? Math.random()} className="mb-3 rounded-lg border bg-muted/30 p-4">
              {answer.isDeletedYn === 'Y' ? (
                <p className="text-sm text-muted-foreground">삭제된 답변입니다.</p>
              ) : (
                <>
                  <h3 className="font-medium">{answer.ttl}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {answer.userNickname} · {fmtDate(answer.createdAt)}
                  </p>
                  {answer.description && (
                    <div
                      className="prose prose-sm mt-3 max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(answer.description) }}
                    />
                  )}
                </>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}

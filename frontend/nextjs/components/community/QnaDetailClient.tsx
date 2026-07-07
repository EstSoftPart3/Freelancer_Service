'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import AnswerForm from '@/components/community/AnswerForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { incrementView } from '@/lib/viewCount'
import type { BoardDetail, AnswerSummary } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  boardSq: string
  // 서버에서 미리 조회한 초기 데이터 — SEO용으로 초기 HTML에 본문을 포함시킨다.
  // viewerSq 등 사용자별 필드가 없으므로 마운트 후 getBoard()로 1회 갱신한다(기존 동작 유지).
  initialData?: BoardDetail | null
}

const emptyBoard: BoardDetail = {
  sq: 0, ttl: '', description: '', userSq: 0, userNm: '', createdAt: '',
  viewCnt: 0, recommendCnt: 0, commentCnt: 0, skillTags: [], normalTags: [],
  attachments: [], comments: [], answers: [],
}

const STATUS: Record<number, { label: string; cls: string }> = {
  1501: { label: '진행중', cls: 'bg-yellow-100 text-yellow-800' },
  1502: { label: '채택완료', cls: 'bg-green-100 text-green-800' },
  1503: { label: '자체해결', cls: 'bg-gray-100 text-gray-700' },
  1504: { label: '미해결', cls: 'bg-red-100 text-red-700' },
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function QnaDetailClient({ boardSq, initialData }: Props) {
  const searchParams = useSearchParams()
  const { setViewerSq, viewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(initialData ?? emptyBoard)

  // 답변 작성 모달
  const [answerOpen, setAnswerOpen] = useState(false)

  // 답변 수정 모달
  const [editAnswer, setEditAnswer] = useState<BoardDetail | null>(null)

  // 답변 상세 모달
  const [detailAnswer, setDetailAnswer] = useState<BoardDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // 채택 확인
  const [adoptConfirm, setAdoptConfirm] = useState<{ open: boolean; sq: number }>({ open: false, sq: 0 })

  const getBoard = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/qna/${boardSq}`)
      setBoardInfo(data.output)
      setViewerSq(data.output.viewerSq ?? null)
      // URL에 answerSq가 있으면 자동 모달 오픈
      const targetSq = Number(searchParams.get('answerSq'))
      if (targetSq) openAnswerDetail(targetSq)
    } catch { alertStore.show('게시글을 불러올 수 없습니다.', 'danger') }
  }, [boardSq, setViewerSq, searchParams])

  useEffect(() => {
    incrementView(`/qna/${boardSq}`)
    getBoard()
  }, [boardSq, getBoard])

  const openAnswerDetail = async (sq: number) => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/answer/${sq}`)
      incrementView(`/answer/${sq}`)
      setDetailAnswer(data.output)
      setDetailOpen(true)
    } catch { alertStore.show('답변을 불러올 수 없습니다.', 'danger') }
  }

  const handleAdopt = async (sq: number) => {
    try {
      const { data } = await api.patch<{ status: string; message: string }>(`/answer/${sq}/adopt`)
      if (data.status === 'OK') {
        alertStore.show(data.message, 'success'); setDetailOpen(false); getBoard()
      } else alertStore.show(data.message, 'danger')
    } catch { alertStore.show('답변 채택에 실패했습니다.', 'danger') }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* QnA 본문 */}
      <BoardPost
        boardInfo={boardInfo}
        boardType="qna"
        onRefresh={getBoard}
        onAnswerWrite={() => {
          if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
          setAnswerOpen(true)
        }}
      />

      {/* 답변 목록 */}
      <div className="mt-8">
        <h4 className="mb-4 text-base font-semibold">
          답변 ({boardInfo.answers?.length ?? 0})
        </h4>
        {boardInfo.answers?.map((answer: AnswerSummary) => (
          <div
            key={answer.sq ?? Math.random()}
            className={cn(
              'mb-3 cursor-pointer rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/60',
              answer.sq == null && 'cursor-default opacity-60',
            )}
            onClick={() => { if (answer.sq != null) openAnswerDetail(answer.sq) }}
          >
            <div className="flex items-center gap-2">
              <h5 className="flex-1 font-medium">
                {answer.isDeletedYn === 'Y' ? '삭제된 답변입니다.' : answer.ttl}
              </h5>
              {answer.isAdoptedYn === 'Y' && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">채택 답변</span>
              )}
            </div>
            {answer.isDeletedYn === 'N' && (
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>
                  <MessageSquare className="mr-1 inline h-3 w-3" />
                  By {answer.userNm} · {fmtDate(answer.createdAt)}
                </span>
                <span>조회 {answer.viewCnt} · 댓글 {answer.commentCnt} · 추천 {answer.recommendCnt}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 댓글 */}
      <BoardComment
        comments={boardInfo.comments}
        boardSq={boardInfo.sq}
        onRefresh={getBoard}
      />

      {/* 답변 작성 다이얼로그 */}
      <Dialog open={answerOpen} onOpenChange={setAnswerOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl sm:max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QnA 답변 작성</DialogTitle>
          </DialogHeader>
          {answerOpen && (
            <AnswerForm
              boardSq={boardSq}
              onSuccess={() => { setAnswerOpen(false); getBoard() }}
              onCancel={() => setAnswerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 답변 수정 다이얼로그 */}
      <Dialog open={editAnswer != null} onOpenChange={(o) => { if (!o) setEditAnswer(null) }}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl sm:max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>QnA 답변 수정</DialogTitle>
          </DialogHeader>
          {editAnswer && (
            <AnswerForm
              boardSq={boardSq}
              editTarget={editAnswer}
              onSuccess={() => { setEditAnswer(null); getBoard() }}
              onCancel={() => setEditAnswer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 답변 상세 다이얼로그 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl sm:max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>답변 상세</DialogTitle>
          </DialogHeader>
          {detailAnswer && (
            <>
              <BoardPost
                boardInfo={detailAnswer}
                boardType="answer"
                parentUserSq={boardInfo.userSq}
                adoptStatusCd={boardInfo.boardAdoptStatusCd}
                onRefresh={() => { getBoard(); setDetailOpen(false) }}
                onAdopt={() => setAdoptConfirm({ open: true, sq: detailAnswer.sq })}
                onEdit={() => { setDetailOpen(false); setEditAnswer(detailAnswer) }}
              />
              <BoardComment
                comments={detailAnswer.comments ?? []}
                answerSq={detailAnswer.sq}
                isAnswer
                onRefresh={() => openAnswerDetail(detailAnswer.sq)}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={adoptConfirm.open}
        title="답변 채택"
        message="채택 이후 변경 불가합니다. 답변을 채택 하시겠습니까?"
        onConfirm={() => handleAdopt(adoptConfirm.sq)}
        onClose={() => setAdoptConfirm({ open: false, sq: 0 })}
      />
    </div>
  )
}

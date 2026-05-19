'use client'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { BoardDetail, AnswerSummary } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  boardSq: string
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

export default function QnaDetailClient({ boardSq }: Props) {
  const searchParams = useSearchParams()
  const { setViewerSq, viewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(emptyBoard)

  // 답변 작성 폼 상태
  const [answerOpen, setAnswerOpen] = useState(false)
  const [answerTtl, setAnswerTtl] = useState('')
  const [answerDesc, setAnswerDesc] = useState('')

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
    api.patch(`/board/${boardSq}/increment-view`).catch(() => {})
    getBoard()
  }, [boardSq, getBoard])

  const openAnswerDetail = async (sq: number) => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/answer/${sq}`)
      api.patch(`/answer/${sq}/increment-view`).catch(() => {})
      setDetailAnswer(data.output)
      setDetailOpen(true)
    } catch { alertStore.show('답변을 불러올 수 없습니다.', 'danger') }
  }

  const submitAnswer = async () => {
    if (!answerTtl.trim()) { alertStore.show('제목을 입력해주세요.', 'danger'); return }
    if (!answerDesc.trim()) { alertStore.show('내용을 입력해주세요.', 'danger'); return }
    try {
      const formData = new FormData()
      formData.append('ttl', answerTtl)
      formData.append('description', answerDesc)
      formData.append('qnaSq', boardSq)
      const { data } = await api.post<{ status: string; message: string }>('/answer', formData)
      if (data.status === 'CREATED') {
        alertStore.show(data.message, 'success')
        setAnswerOpen(false); setAnswerTtl(''); setAnswerDesc('')
        getBoard()
      } else alertStore.show('답변 등록에 실패하였습니다.', 'danger')
    } catch { alertStore.show('답변 등록에 실패하였습니다.', 'danger') }
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>답변 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              value={answerTtl}
              onChange={(e) => setAnswerTtl(e.target.value)}
              placeholder="제목"
              className="flex h-8 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <textarea
              value={answerDesc}
              onChange={(e) => setAnswerDesc(e.target.value)}
              placeholder="답변 내용을 입력해주세요."
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={submitAnswer}
                className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >등록</button>
              <button
                onClick={() => setAnswerOpen(false)}
                className="rounded-lg border px-4 py-1.5 text-sm hover:bg-muted"
              >취소</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 답변 상세 다이얼로그 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
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

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { VoteDetail } from '@/components/vote/types'

interface Props {
  voteSq: number
  initialData: VoteDetail
}

export default function VoteDetailClient({ voteSq, initialData }: Props) {
  const router = useRouter()
  const { userSq, authChecked, isLoggedIn } = useUserStore()
  const [vote, setVote] = useState<VoteDetail>(initialData)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showBars, setShowBars] = useState(vote.myVoteOptionSq != null || vote.closed)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    api.patch(`/votes/${voteSq}/increment-view`).catch(() => {})
    // 서버 SSR 조회는 비인증 요청이라 내 투표 여부(myVoteOptionSq)를 알 수 없다 — 마운트 후 1회 갱신한다
    // (BoardDetailClient가 viewerSq를 처리하는 것과 같은 패턴).
    if (!authChecked) return
    api
      .get<{ output: VoteDetail }>(`/votes/${voteSq}`)
      .then(({ data }) => {
        setVote(data.output)
        if (data.output.myVoteOptionSq != null || data.output.closed) setShowBars(true)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteSq, authChecked])

  const hasVoted = vote.myVoteOptionSq != null
  const isOwner = authChecked && userSq === vote.userSq
  const canVote = !vote.closed && !hasVoted

  const handleVote = async () => {
    if (!authChecked || !isLoggedIn()) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }
    if (selectedOption == null) {
      alertStore.show('선택지를 골라주세요.', 'danger')
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/votes/${voteSq}/ballot`, { voteOptionSq: selectedOption })
      const { data } = await api.get<{ output: VoteDetail }>(`/votes/${voteSq}`)
      setVote(data.output)
      setShowBars(true)
      alertStore.show('투표가 완료되었습니다.', 'success')
    } catch {
      alertStore.show('투표에 실패했습니다. 이미 참여했거나 마감된 투표일 수 있습니다.', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.patch(`/votes/${voteSq}`)
      alertStore.show('투표가 삭제되었습니다.', 'success')
      router.push('/vote')
    } catch {
      alertStore.show('삭제에 실패했습니다.', 'danger')
    }
  }

  const total = vote.totalVoteCnt

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className={vote.closed ? 'text-muted-foreground' : 'font-medium text-primary'}>
            {vote.closed ? '마감됨' : '진행중'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(vote.voteEndDt).toLocaleString('ko-KR')} 마감
          </span>
        </div>
        <h1 className="text-2xl font-bold">{vote.voteTtl}</h1>
        <div className="mt-1 text-sm text-muted-foreground">{vote.userNickname ?? '알 수 없음'}</div>
        {vote.voteDescriptionEdt && (
          <p className="mt-4 whitespace-pre-wrap text-sm">{vote.voteDescriptionEdt}</p>
        )}
      </div>

      <div className="space-y-3">
        {vote.options.map((opt) => {
          const percent = total > 0 ? Math.round((opt.voteCnt / total) * 1000) / 10 : 0
          const isMine = vote.myVoteOptionSq === opt.voteOptionSq

          if (!showBars) {
            return (
              <button
                key={opt.voteOptionSq}
                type="button"
                onClick={() => setSelectedOption(opt.voteOptionSq)}
                disabled={!canVote}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  selectedOption === opt.voteOptionSq
                    ? 'border-primary bg-primary/5 font-medium'
                    : 'hover:bg-muted/50'
                }`}
              >
                {opt.voteOptionNm}
              </button>
            )
          }

          return (
            <div key={opt.voteOptionSq} className="relative overflow-hidden rounded-lg border">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                  isMine ? 'bg-primary/25' : 'bg-muted'
                }`}
                style={{ width: `${percent}%` }}
              />
              <div className="relative flex items-center justify-between p-3 text-sm">
                <span className={isMine ? 'font-semibold' : ''}>
                  {opt.voteOptionNm}
                  {isMine && ' (내 선택)'}
                </span>
                <span className="font-medium">
                  {percent}% ({opt.voteCnt.toLocaleString()}표)
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {canVote && (
        <Button disabled={submitting || selectedOption == null} onClick={handleVote} className="w-full">
          {submitting ? '투표 중...' : '투표하기'}
        </Button>
      )}

      <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          총 {total.toLocaleString()}명 참여 · 조회 {vote.voteViewCnt.toLocaleString()}
        </span>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> 삭제
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="투표 삭제"
        message="이 투표를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        onConfirm={handleDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  )
}

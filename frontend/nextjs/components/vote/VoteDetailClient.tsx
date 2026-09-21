'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { incrementView } from '@/lib/viewCount'
import type { VoteDetail } from '@/components/vote/types'

interface Props {
  voteSq: number
  // SSR 조회 실패(백엔드 일시 장애)일 때는 null — 마운트 후 CSR로 재시도한다.
  initialData: VoteDetail | null
}

const emptyVote: VoteDetail = {
  voteSq: 0, voteTtl: '', voteDescriptionEdt: null, userSq: 0, userNickname: null,
  voteCategoryCd: 0, voteEndDt: new Date().toISOString(), voteCreatedAtDtm: '', voteViewCnt: 0,
  closed: true, totalVoteCnt: 0, myVoteOptionSq: null, options: [],
}

export default function VoteDetailClient({ voteSq, initialData }: Props) {
  const router = useRouter()
  const { userSq, authChecked, isLoggedIn } = useUserStore()
  const [vote, setVote] = useState<VoteDetail>(initialData ?? emptyVote)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showBars, setShowBars] = useState(
    initialData != null && (initialData.myVoteOptionSq != null || initialData.closed),
  )
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    // 조회수 증가는 voteSq당 1회만 — authChecked 갱신 때마다 재실행되는 아래 effect와
    // 분리해 둔다(InterviewDetailClient와 같은 패턴). incrementView 자체에 3초 dedup이
    // 있지만, /me 인증 확인이 느려지면(콜드 스타트 등) 그 창을 넘겨 조회수가 중복 집계될 수 있다.
    incrementView(`/votes/${voteSq}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteSq])

  useEffect(() => {
    // SSR 조회가 일시 장애로 실패했다면(initialData null) 인증 여부와 무관하게 즉시 재시도한다.
    // authChecked 를 의존성에 넣지 않는다 — 넣으면 authChecked 가 false→true 로 바뀔 때
    // 아래 authChecked 갱신용 effect와 함께 이 fetch도 다시 돌아 같은 요청이 중복 발생한다.
    if (initialData != null) return
    api
      .get<{ output: VoteDetail }>(`/votes/${voteSq}`)
      .then(({ data }) => {
        setVote(data.output)
        if (data.output.myVoteOptionSq != null || data.output.closed) setShowBars(true)
      })
      .catch(() => alertStore.show('투표 정보를 불러올 수 없습니다.', 'danger'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voteSq, initialData])

  useEffect(() => {
    // SSR 조회 자체가 실패했다면 위 effect가 이미 처리한다.
    if (initialData == null) return
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
  }, [voteSq, authChecked, initialData])

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
    } catch (err) {
      alertStore.show(
        getApiErrorMessage(err, '투표에 실패했습니다. 이미 참여했거나 마감된 투표일 수 있습니다.'),
        'danger',
      )
      // 다른 탭·기기에서 이미 참여했거나 그새 마감된 경우(409/400) 화면이 옛 상태로 남아
      // 같은 실패를 되풀이하지 않도록 서버 상태로 다시 맞춘다.
      api
        .get<{ output: VoteDetail }>(`/votes/${voteSq}`)
        .then(({ data }) => {
          setVote(data.output)
          if (data.output.myVoteOptionSq != null || data.output.closed) setShowBars(true)
        })
        .catch(() => {})
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

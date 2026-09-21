'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { incrementView } from '@/lib/viewCount'
import { RESULT_LABEL, type InterviewDetail } from '@/components/interview/types'

interface Props {
  interviewReviewSq: number
  // SSR 조회 실패(백엔드 일시 장애)일 때는 null — 마운트 후 CSR로 재시도한다.
  initialData: InterviewDetail | null
}

const emptyReview: InterviewDetail = {
  interviewReviewSq: 0, userSq: 0, userNickname: null, companyNm: '', jobNm: '',
  careerLevel: '', interviewDt: null, interviewStages: [], questionEdt: null,
  difficultyStar: null, atmosphereEdt: null, resultCd: null, proposedSalary: null,
  interviewViewCnt: 0, interviewCreatedAtDtm: '',
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`난이도 ${value}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'}`}
        />
      ))}
    </span>
  )
}

export default function InterviewDetailClient({ interviewReviewSq, initialData }: Props) {
  const router = useRouter()
  const { userSq, authChecked } = useUserStore()
  const [review, setReview] = useState<InterviewDetail>(initialData ?? emptyReview)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    incrementView(`/interviews/${interviewReviewSq}`)

    // SSR 조회가 일시 장애로 실패했다면(initialData null) 마운트 후 CSR로 재시도한다.
    if (initialData == null) {
      api
        .get<{ output: InterviewDetail }>(`/interviews/${interviewReviewSq}`)
        .then(({ data }) => setReview(data.output))
        .catch(() => alertStore.show('면접후기 정보를 불러올 수 없습니다.', 'danger'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewReviewSq, initialData])

  const isOwner = authChecked && userSq === review.userSq

  const handleDelete = async () => {
    try {
      await api.patch(`/interviews/${interviewReviewSq}`)
      alertStore.show('면접후기가 삭제되었습니다.', 'success')
      router.push('/interview')
    } catch (err) {
      alertStore.show(getApiErrorMessage(err, '삭제에 실패했습니다.'), 'danger')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {review.resultCd && (
            <Badge variant={review.resultCd === 'PASS' ? 'default' : 'secondary'}>
              {RESULT_LABEL[review.resultCd] ?? review.resultCd}
            </Badge>
          )}
          {review.difficultyStar != null && <StarRating value={review.difficultyStar} />}
        </div>
        <h1 className="text-2xl font-bold">{review.companyNm}</h1>
        <div className="mt-1 text-sm text-muted-foreground">
          {review.jobNm} · {review.careerLevel}
          {review.interviewDt && ` · ${review.interviewDt} 면접`}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{review.userNickname ?? '익명'}</div>
      </div>

      {review.interviewStages.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">면접단계</h2>
          <div className="flex flex-wrap gap-1.5">
            {review.interviewStages.map((stage) => (
              <Badge key={stage} variant="outline">{stage}</Badge>
            ))}
          </div>
        </section>
      )}

      {review.questionEdt && (
        <section>
          <h2 className="mb-2 font-semibold">면접 질문</h2>
          <p className="whitespace-pre-wrap text-sm">{review.questionEdt}</p>
        </section>
      )}

      {review.atmosphereEdt && (
        <section>
          <h2 className="mb-2 font-semibold">면접 분위기</h2>
          <p className="whitespace-pre-wrap text-sm">{review.atmosphereEdt}</p>
        </section>
      )}

      {review.proposedSalary != null && (
        <section>
          <h2 className="mb-2 font-semibold">제안 연봉</h2>
          <p className="text-sm">{review.proposedSalary.toLocaleString()}만원</p>
        </section>
      )}

      <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          조회 {review.interviewViewCnt.toLocaleString()}
        </span>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" /> 삭제
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="면접후기 삭제"
        message="이 면접후기를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        onConfirm={handleDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  )
}

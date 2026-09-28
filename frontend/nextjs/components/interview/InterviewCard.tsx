import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Star } from 'lucide-react'
import { RESULT_LABEL, type InterviewListItem } from './types'

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`난이도 ${value}점`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'}`}
        />
      ))}
    </span>
  )
}

export default function InterviewCard({ review }: { review: InterviewListItem }) {
  return (
    <Link href={`/interview/${review.interviewReviewSq}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {review.resultCd && (
              <Badge variant={review.resultCd === 'PASS' ? 'default' : 'secondary'}>
                {RESULT_LABEL[review.resultCd] ?? review.resultCd}
              </Badge>
            )}
            {review.difficultyStar != null && <StarRating value={review.difficultyStar} />}
          </div>
          <CardTitle className="line-clamp-1">{review.companyNm}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          {review.jobNm} · {review.careerLevel}
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span>{review.userNickname ?? '익명'}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {review.interviewViewCnt.toLocaleString()}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

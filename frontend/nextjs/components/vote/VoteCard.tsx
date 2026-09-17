import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'
import { VOTE_CATEGORIES, type VoteListItem } from './types'

function isClosed(voteEndDt: string) {
  return new Date(voteEndDt).getTime() < Date.now()
}

export default function VoteCard({ vote }: { vote: VoteListItem }) {
  const closed = isClosed(vote.voteEndDt)
  const categoryNm = VOTE_CATEGORIES.find((c) => c.commonCodeSq === vote.voteCategoryCd)?.commonCodeNm

  return (
    <Link href={`/vote/${vote.voteSq}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="mb-1 flex items-center gap-2">
            <Badge variant={closed ? 'secondary' : 'default'}>{closed ? '마감' : '진행중'}</Badge>
            {categoryNm && <Badge variant="outline">{categoryNm}</Badge>}
            <span className="text-xs text-muted-foreground">{vote.optionCnt}개 선택지</span>
          </div>
          <CardTitle className="line-clamp-2">{vote.voteTtl}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 text-sm text-muted-foreground">
          {vote.userNickname ?? '알 수 없음'}
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {vote.totalVoteCnt.toLocaleString()}명 참여
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {closed ? '마감됨' : `${new Date(vote.voteEndDt).toLocaleDateString('ko-KR')} 마감`}
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

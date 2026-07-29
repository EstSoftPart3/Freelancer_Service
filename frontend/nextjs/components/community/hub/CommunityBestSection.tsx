import Link from 'next/link'
import { Trophy } from 'lucide-react'
import BestCriteriaInfo from '@/components/community/BestCriteriaInfo'
import type { CommunityBestItem } from '@/types'

interface Props {
  items: CommunityBestItem[]
}

export default function CommunityBestSection({ items }: Props) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-bold">
          <Trophy className="h-4 w-4 text-amber-500" /> 베스트글
          <BestCriteriaInfo />
        </h2>
        <Link href="/community/list?sort=recommend" className="text-xs text-muted-foreground hover:text-primary hover:underline">
          전체보기
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
          아직 베스트글이 없습니다.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={`${item.boardType}-${item.sq}`} className="p-3">
              <Link href={`/${item.boardType}/${item.sq}`} className="block font-medium hover:text-primary hover:underline">
                {item.ttl}
              </Link>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.userNickname}</span>
                <span>조회 {item.viewCnt}</span>
                <span>추천 {item.recommendCnt}</span>
                <span>댓글 {item.commentCnt}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

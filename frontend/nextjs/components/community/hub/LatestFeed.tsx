import Link from 'next/link'
import type { BoardItem } from '@/types'

interface Props {
  items: BoardItem[]
}

export default function LatestFeed({ items }: Props) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">새글피드</h2>
        <Link href="/community/list" className="text-xs text-muted-foreground hover:text-primary hover:underline">
          더보기
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border bg-muted/30 py-8 text-center text-sm text-muted-foreground">
          아직 게시글이 없습니다.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((item) => (
            <li key={`${item.boardType}-${item.sq}`} className="p-3">
              <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {/* Q&A 는 카테고리가 없고(categoryNm null), 일반게시판은 자유/현장정보/기능요청/정보 중 하나다.
                    예전엔 '자유주제'로 고정돼 있어 정보·현장정보 글까지 자유로 보였다. */}
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {item.boardType === 'qna' ? 'Q&A' : (item.categoryNm ?? '자유')}
                </span>
              </div>
              <Link
                href={`/${item.boardType ?? 'board'}/${item.sq}`}
                className="block truncate font-medium hover:text-primary hover:underline"
              >
                {item.ttl}
              </Link>
              <div className="mt-1 text-xs text-muted-foreground">{item.userNickname}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

import Link from 'next/link'
import { BOARD_TYPE_LABEL, type BoardType } from '@/components/community/boardMeta'
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
                {/* 중분류가 있으면 그 이름(연봉·개발 등)을, 없으면(요즘회사처럼 단일 게시판이거나
                    옛 QnA) 게시판 종류 이름을 보여준다. */}
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {item.categoryNm ?? BOARD_TYPE_LABEL[(item.boardType ?? 'board') as Exclude<BoardType, 'all'>]}
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

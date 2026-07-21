'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { alertStore } from '@/stores/alertStore'
import { useBoardStore } from '@/stores/boardStore'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import api from '@/lib/api'
import { incrementView } from '@/lib/viewCount'
import type { BoardDetail } from '@/types'

type BoardCategory = 'board' | 'notice'

interface Props {
  boardSq: string
  boardCategory: BoardCategory
  // 서버에서 미리 조회한 초기 데이터 — SEO용으로 초기 HTML에 본문을 포함시킨다.
  // viewerSq 등 사용자별 필드가 없으므로 마운트 후 getBoard()로 1회 갱신한다(기존 동작 유지).
  initialData?: BoardDetail | null
}

const emptyBoard: BoardDetail = {
  sq: 0, ttl: '', description: '', userSq: 0, userNm: '', createdAt: '',
  viewCnt: 0, recommendCnt: 0, commentCnt: 0, skillTags: [], normalTags: [],
  attachments: [], comments: [],
}

export default function BoardDetailClient({ boardSq, boardCategory, initialData }: Props) {
  const router = useRouter()
  const { setViewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(initialData ?? emptyBoard)

  const getBoard = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/${boardCategory}/${boardSq}`)
      setBoardInfo(data.output)
      setViewerSq(data.output.viewerSq ?? null)
    } catch (err: unknown) {
      // 삭제됐거나 유효하지 않은 게시글은 백엔드가 400을 반환한다.
      // 이 경우 안내 후 해당 게시판 목록으로 되돌린다(그 외 일시적 오류는 이동하지 않음).
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      if (res?.status === 400) {
        alertStore.show(res.data?.message ?? '삭제되었거나 존재하지 않는 게시글입니다.', 'danger')
        router.replace(boardCategory === 'notice' ? '/notice' : '/board')
      } else {
        alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
      }
    }
  }, [boardSq, boardCategory, setViewerSq, router])

  useEffect(() => {
    incrementView(`/${boardCategory}/${boardSq}`)
    getBoard()
  }, [boardSq, boardCategory, getBoard])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BoardPost
        boardInfo={boardInfo}
        boardType={boardCategory === 'notice' ? 'notice' : 'board'}
        onRefresh={getBoard}
      />
      <BoardComment
        comments={boardInfo.comments}
        boardSq={boardInfo.sq}
        onRefresh={getBoard}
      />
    </div>
  )
}

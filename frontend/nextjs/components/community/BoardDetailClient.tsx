'use client'
import { useCallback, useEffect, useState } from 'react'
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
  const { setViewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(initialData ?? emptyBoard)

  const getBoard = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/${boardCategory}/${boardSq}`)
      setBoardInfo(data.output)
      setViewerSq(data.output.viewerSq ?? null)
    } catch { alertStore.show('게시글을 불러올 수 없습니다.', 'danger') }
  }, [boardSq, boardCategory, setViewerSq])

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

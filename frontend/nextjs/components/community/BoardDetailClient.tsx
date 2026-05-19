'use client'
import { useCallback, useEffect, useState } from 'react'
import { alertStore } from '@/stores/alertStore'
import { useBoardStore } from '@/stores/boardStore'
import BoardPost from '@/components/community/BoardPost'
import BoardComment from '@/components/community/BoardComment'
import api from '@/lib/api'
import type { BoardDetail } from '@/types'

type BoardCategory = 'board' | 'notice'

interface Props {
  boardSq: string
  boardCategory: BoardCategory
}

const emptyBoard: BoardDetail = {
  sq: 0, ttl: '', description: '', userSq: 0, userNm: '', createdAt: '',
  viewCnt: 0, recommendCnt: 0, commentCnt: 0, skillTags: [], normalTags: [],
  attachments: [], comments: [],
}

export default function BoardDetailClient({ boardSq, boardCategory }: Props) {
  const { setViewerSq } = useBoardStore()
  const [boardInfo, setBoardInfo] = useState<BoardDetail>(emptyBoard)

  const getBoard = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: BoardDetail }>(`/${boardCategory}/${boardSq}`)
      setBoardInfo(data.output)
      setViewerSq(data.output.viewerSq ?? null)
    } catch { alertStore.show('게시글을 불러올 수 없습니다.', 'danger') }
  }, [boardSq, boardCategory, setViewerSq])

  useEffect(() => {
    api.patch(`/board/${boardSq}/increment-view`).catch(() => {})
    getBoard()
  }, [boardSq, getBoard])

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <BoardPost
        boardInfo={boardInfo}
        boardType={boardCategory === 'notice' ? 'board' : 'board'}
        onRefresh={getBoard}
      />
      {boardCategory !== 'notice' && (
        <BoardComment
          comments={boardInfo.comments}
          boardSq={boardInfo.sq}
          onRefresh={getBoard}
        />
      )}
    </div>
  )
}

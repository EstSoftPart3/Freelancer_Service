'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { BOARD_CATEGORY_FALLBACK, type BoardCategory, type BoardType } from '@/components/community/boardMeta'

/**
 * 게시판 중분류(카테고리) 목록을 서버에서 가져온다. Phase2 재설계 이후 중분류는 대분류별로
 * 갈리므로(커리어소통의 연봉·이직 vs 기술소통의 개발·AI) boardType을 반드시 받는다.
 *
 * 초기값은 하드코딩 폴백이라 첫 페인트에서 탭이 비어 보이지 않고, 응답이 오면 교체된다.
 * 조회에 실패해도 폴백이 남으므로 카테고리 탭·선택이 통째로 사라지지 않는다.
 */
export function useBoardCategories(boardType: BoardType): BoardCategory[] {
  const [categories, setCategories] = useState<BoardCategory[]>(
    () => [...(BOARD_CATEGORY_FALLBACK[boardType] ?? [])],
  )

  useEffect(() => {
    let alive = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategories([...(BOARD_CATEGORY_FALLBACK[boardType] ?? [])])
    api
      .get<{ output: BoardCategory[] }>('/community/board-categories', { params: { boardType } })
      .then(({ data }) => {
        if (alive && data.output?.length) setCategories(data.output)
      })
      .catch(() => {
        /* 폴백 유지 — 카테고리는 부가 기능이라 실패를 사용자에게 알리지 않는다 */
      })
    return () => { alive = false }
  }, [boardType])

  return categories
}

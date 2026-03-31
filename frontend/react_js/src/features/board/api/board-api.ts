import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/notice/api/notice-api'
// 기존 타입 재사용
import { type AdminBoard } from '../data/schema'

// 1. 목록 응답을 위한 전용 인터페이스 정의
export interface AdminBoardListResponse {
  boards: AdminBoard[]
  totalElements: number
  page: number
  size: number
}

// 2. 검색/필터를 위한 파라미터 타입 정의
export interface BoardQueryParams {
  page: number
  size: number
  typeCds?: number[] // 여러 유형 필터링용
  keyword?: string // 통합 검색용
  tagKeyword?: string // 태그 검색용
  sortField?: string
  sortOrder?: string
  [key: string]: number | string | number[] | undefined
}

export const boardApi = {
  /** * 게시글 목록 조회
   * [수정] params 타입을 AdminBoard가 아닌 전용 QueryParams로 변경
   */
  getBoards: async (params: BoardQueryParams) => {
    return await api.$get<ApiResponse<AdminBoardListResponse>>(
      '/admin/board',
      params as Record<string, unknown>
    )
  },

  /** * 게시글 상세 조회
   */
  getBoardDetail: async (boardSq: number, boardTypeCd: number) => {
    return await api.$get<ApiResponse<AdminBoard>>(
      `/admin/board/${boardSq}?boardTypeCd=${boardTypeCd}`
    )
  },

  /** * 게시글 등록
   */
  createBoard: async (boardTypeCd: number, formData: FormData) => {
    return await api.$post(
      `/admin/board?boardTypeCd=${boardTypeCd}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
  },

  /** * 게시글 수정
   */
  updateBoard: async (
    boardSq: number,
    boardTypeCd: number,
    formData: FormData
  ) => {
    return await api.$patch(
      `/admin/board/${boardSq}?boardTypeCd=${boardTypeCd}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
  },

  /** * 게시글 삭제
   */
  deleteBoard: async (boardSq: number, mainType: string) => {
    return await api.$delete(`/admin/board/${boardSq}?mainType=${mainType}`)
  },

  // board-api.ts 에 추가

  /** * 댓글 등록 (관리자 권한)
   */
  createComment: async (
    targetSq: number,
    description: string,
    parentCommentSq?: number,
    targetType: 'BOARD' | 'ANSWER' = 'BOARD'
  ) => {
    const params = new URLSearchParams()
    if (targetType === 'ANSWER') {
      params.append('answerSq', targetSq.toString())
    } else {
      params.append('boardSq', targetSq.toString())
    }
    params.append('description', description)
    if (parentCommentSq)
      params.append('parentCommentSq', parentCommentSq.toString())

    return await api.$post(`/admin/board/comment?${params.toString()}`)
  },

  /** * 댓글 수정 (관리자 권한)
   */
  updateComment: async (commentSq: number, description: string) => {
    const params = new URLSearchParams()
    params.append('description', description)

    return await api.$patch(
      `/admin/board/comment/${commentSq}?${params.toString()}`
    )
  },

  /** * 댓글 삭제 (관리자 권한)
   */
  deleteComment: async (commentSq: number) => {
    return await api.$delete(`/admin/board/comment/${commentSq}`)
  },

  /** * Q&A 답변 등록
   */
  createAnswer: async (formData: FormData) => {
    return await api.$post('/admin/board/answer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

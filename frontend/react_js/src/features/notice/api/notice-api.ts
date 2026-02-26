import { api } from '@/lib/api'
// 1. Zod 스키마 자체가 아니라 정의된 'Notice' 타입만 가져옵니다.
// 2. ESLint 규칙에 따라 'import type'을 사용합니다.
import type { Notice } from '../data/schema'

// 백엔드 ApiResponse 구조 정의
export interface ApiResponse<T> {
  status: string
  message: string
  output: T
}

// 목록 응답의 output 구조 정의
export interface NoticeListResponse {
  boards: Notice[] // noticeSchema 대신 'Notice' 타입을 사용해야 합니다.
  totalElements: number
  page: number
  size: number
}

export const noticeApi = {
  /**
   * 공지사항 등록
   */
  createNotice: async (formData: FormData) => {
    return await api.$post('/notice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 공지사항 수정
   */
  updateNotice: async (boardSq: number, formData: FormData) => {
    // 사용자님의 api.$put에 config가 없다면 $patch를 사용하거나 api.ts를 수정하세요.
    return await api.$patch(`/notice/${boardSq}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * 공지사항 목록 조회
   */
  getNotices: async (
    page: number = 1,
    size: number = 10,
    keyword?: string, // 추가
    sortField?: string, // 추가
    sortOrder?: string // 추가
  ): Promise<ApiResponse<NoticeListResponse>> => {
    // 쿼리 스트링 조립
    let url = `/notice?page=${page}&size=${size}`
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
    if (sortField) url += `&sortField=${sortField}`
    if (sortOrder) url += `&sortOrder=${sortOrder}`

    return await api.$get<ApiResponse<NoticeListResponse>>(url)
  },

  // 공지사항 삭제
  deleteNotice: async (boardSq: number) => {
    return await api.$delete(`/notice/${boardSq}`)
  },

  /**
   * 공지사항 상세 조회 (수정 폼 데이터 채우기용)
   */
  getNoticeDetail: async (boardSq: number) => {
    return await api.$get<ApiResponse<Notice>>(`/notice/${boardSq}`)
  },

  // 댓글 삭제 메서드
  deleteComment: async (commentSq: number) => {
    return await api.$delete(`/notice/comments/${commentSq}`)
  },

  /** * [추가] 공지사항 댓글 등록
   */
  createNoticeComment: async (data: {
    boardSq: number
    description: string
    parentCommentSq: number | null
  }) => {
    return await api.$post('/notice/comments', data)
  },

  /** * [추가] 공지사항 댓글 수정
   */
  updateNoticeComment: async (
    commentSq: number,
    data: {
      description: string
    }
  ) => {
    return await api.$put(`/notice/comments/${commentSq}`, data)
  },
}

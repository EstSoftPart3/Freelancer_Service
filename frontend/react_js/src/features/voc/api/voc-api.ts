import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/notice/api/notice-api'
import { type AdminVoc, type AdminVocDetail } from '../data/schema'

export interface AdminVocListResponse {
  boards: AdminVoc[]
  totalElements: number
  page: number
  size: number
}

export interface VocQueryParams {
  page: number
  size: number
  keyword?: string
  /** 미지정=전체 / true=답변완료 / false=미답변 */
  answered?: boolean
  sortField?: string
  sortOrder?: string
}

export const vocApi = {
  getVocs: async (params: VocQueryParams) => {
    const qs = new URLSearchParams()
    qs.append('page', String(params.page))
    qs.append('size', String(params.size))
    if (params.keyword) qs.append('keyword', params.keyword)
    // answered 는 false 도 의미 있는 값이라 `if (params.answered)` 로 거르면 안 된다.
    if (params.answered !== undefined) qs.append('answered', String(params.answered))
    if (params.sortField) qs.append('sortField', params.sortField)
    if (params.sortOrder) qs.append('sortOrder', params.sortOrder)

    return await api.$get<ApiResponse<AdminVocListResponse>>(
      `/admin/voc?${qs.toString()}`
    )
  },

  getVocDetail: async (boardSq: number) => {
    return await api.$get<ApiResponse<AdminVocDetail>>(`/admin/voc/${boardSq}`)
  },

  /** 답변 등록 — 문의자에게 알림이 발송된다 */
  createAnswer: async (boardSq: number, ttl: string, description: string) => {
    const qs = new URLSearchParams({ ttl, description })
    return await api.$post(`/admin/voc/${boardSq}/answer?${qs.toString()}`)
  },

  deleteVoc: async (boardSq: number) => {
    return await api.$delete(`/admin/voc/${boardSq}`)
  },
}

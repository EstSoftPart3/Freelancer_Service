import { api } from '@/lib/api'
import type { AdminVote } from '../data/schema'

export interface ApiResponse<T> {
  status: string
  message: string
  output: T
}

export interface VoteListResponse {
  votes: AdminVote[]
  totalElements: number
  page: number
  size: number
}

export interface VoteMutatePayload {
  voteTtl: string
  voteDescriptionEdt: string | null
  voteCategoryCd: number
  voteEndDt: string
  // 수정 시 undefined 면 기존 선택지를 그대로 둔다(참여자가 있으면 백엔드가 409로 막는다).
  options?: string[]
}

export const voteApi = {
  getVotes: async (
    page = 1,
    size = 10,
    keyword?: string,
    category?: number,
    sortType = 'latest'
  ): Promise<ApiResponse<VoteListResponse>> => {
    let url = `/admin/vote?page=${page}&size=${size}&sortType=${sortType}`
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
    if (category) url += `&category=${category}`
    return await api.$get<ApiResponse<VoteListResponse>>(url)
  },

  getVoteDetail: async (voteSq: number) => {
    return await api.$get<ApiResponse<AdminVote>>(`/admin/vote/${voteSq}`)
  },

  createVote: async (payload: VoteMutatePayload) => {
    return await api.$post('/admin/vote', payload)
  },

  updateVote: async (voteSq: number, payload: VoteMutatePayload) => {
    return await api.$patch(`/admin/vote/${voteSq}`, payload)
  },

  deleteVote: async (voteSq: number) => {
    return await api.$delete(`/admin/vote/${voteSq}`)
  },
}

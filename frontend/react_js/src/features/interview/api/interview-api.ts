import { api } from '@/lib/api'
import type { AdminInterview } from '../data/schema'

export interface ApiResponse<T> {
  status: string
  message: string
  output: T
}

export interface InterviewListResponse {
  reviews: AdminInterview[]
  totalElements: number
  page: number
  size: number
}

export interface InterviewMutatePayload {
  companyNm: string
  jobNm: string
  careerLevel: string
  interviewDt: string | null
  interviewStages: string[]
  questionEdt: string | null
  difficultyStar: number | null
  atmosphereEdt: string | null
  resultCd: string | null
  proposedSalary: number | null
}

export const interviewApi = {
  getReviews: async (
    page = 1,
    size = 10,
    keyword?: string,
    sortType = 'latest'
  ): Promise<ApiResponse<InterviewListResponse>> => {
    let url = `/admin/interview?page=${page}&size=${size}&sortType=${sortType}`
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
    return await api.$get<ApiResponse<InterviewListResponse>>(url)
  },

  getReviewDetail: async (interviewReviewSq: number) => {
    return await api.$get<ApiResponse<AdminInterview>>(`/admin/interview/${interviewReviewSq}`)
  },

  createReview: async (payload: InterviewMutatePayload) => {
    return await api.$post('/admin/interview', payload)
  },

  updateReview: async (interviewReviewSq: number, payload: InterviewMutatePayload) => {
    return await api.$patch(`/admin/interview/${interviewReviewSq}`, payload)
  },

  deleteReview: async (interviewReviewSq: number) => {
    return await api.$delete(`/admin/interview/${interviewReviewSq}`)
  },
}

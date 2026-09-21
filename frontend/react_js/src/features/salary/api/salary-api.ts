import { api } from '@/lib/api'
import type { AdminSalary } from '../data/schema'

// 서버가 내려준 실패 사유(400/409 등 { message })를 그대로 보여주기 위한 추출기 — 없으면 fallback.
export function apiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}

export interface ApiResponse<T> {
  status: string
  message: string
  output: T
}

export interface SalaryListResponse {
  submissions: AdminSalary[]
  totalElements: number
  page: number
  size: number
}

export interface SalaryMutatePayload {
  userSq: number | null
  isSeedYn: 'Y' | 'N'
  seedNickname: string | null
  employmentType: string
  jobNm: string
  careerBucket: string
  regionNm: string
  annualSalary: number
  skillTagNms: string[]
  ageBand: string | null
  educationNm: string | null
  companySize: string | null
  companyType: string | null
  positionNm: string | null
  teamSize: string | null
  employmentSubtype: string | null
  remoteType: string | null
  bonusAmount: number | null
  stockOpt: string | null
  jobChangeCount: string | null
  companyNm: string | null
  prevAnnualSalary: number | null
  jobChangedYm: string | null
}

export const salaryApi = {
  getSubmissions: async (
    page = 1,
    size = 10,
    keyword?: string,
    isSeedYn?: string,
    sortType = 'latest'
  ): Promise<ApiResponse<SalaryListResponse>> => {
    let url = `/admin/salary?page=${page}&size=${size}&sortType=${sortType}`
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
    if (isSeedYn) url += `&isSeedYn=${isSeedYn}`
    return await api.$get<ApiResponse<SalaryListResponse>>(url)
  },

  getSubmissionDetail: async (salarySubmissionSq: number) => {
    return await api.$get<ApiResponse<AdminSalary>>(`/admin/salary/${salarySubmissionSq}`)
  },

  createSubmission: async (payload: SalaryMutatePayload) => {
    return await api.$post('/admin/salary', payload)
  },

  updateSubmission: async (salarySubmissionSq: number, payload: SalaryMutatePayload) => {
    return await api.$patch(`/admin/salary/${salarySubmissionSq}`, payload)
  },

  deleteSubmission: async (salarySubmissionSq: number) => {
    return await api.$delete(`/admin/salary/${salarySubmissionSq}`)
  },
}

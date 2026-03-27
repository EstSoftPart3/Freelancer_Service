import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/dashboard/data/types'
import { type AdminUser } from '../data/schema'

// 회사(소속) 타입 정의
export interface Company {
  companySq: number
  companyNm: string // 회사 이름 (필수값)
  companyCeoNm?: string // 대표자 이름 (기업 인증 시)
  companyBizNum?: string // 사업자 등록번호 (기업 인증 시)
  companyOpenDt?: string // 개업일자 (기업 인증 시)
  companyUrl?: string // 기업 URL
  companyAddress?: string // 회사 주소
  companyDetailAddress?: string // 회사 상세 주소
  userTypeCd?: number
  userSq?: number
  userId?: string
  userPhoneNum?: string // 대표번호 (=휴대폰 번호, 필수값)
}

export interface CompanyQueryParams {
  keyword?: string
}

export interface CompanyVerifyPayload {
  companyNm: string
  companyCeoNm: string
  companyBizNum: string
  companyOpenDt: string // yyyy-MM-dd
}

// 기업의 인증 상태
export const AUTH_STATUS = { PENDING: '2501', VERIFIED: '2502' } as const

// 1. 목록 응답을 위한 전용 인터페이스 정의
export interface AdminUserListResponse {
  users: AdminUser[]
  totalElements: number
  page: number
  size: number
}

// 2. 검색/필터를 위한 파라미터 타입 정의
export interface UserQueryParams {
  page: number
  size: number
  typeCds?: number[]
  companySqs?: number[]
  userGenderCds?: number[]
  keyword?: string
  tagKeyword?: string
  sortField?: string
  sortOrder?: string
  [key: string]: number | string | number[] | undefined
}

export const userApi = {
  /** * 유저 목록 조회
   */
  getUsers: async (params: UserQueryParams) => {
    return await api.$get<ApiResponse<AdminUserListResponse>>(
      '/admin/users',
      params as Record<string, unknown>
    )
  },

  /** * 유저 수정
   */
  updateUser: async (userSq: number, formData: FormData) => {
    return await api.$patch(`/admin/users/${userSq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** 유저 삭제
   */
  deleteUser: async (userSq: number) => {
    return await api.$delete(`/admin/user/${userSq}`)
  },

  /** 마스터 패스워드 검증
   */
  verifyPassword: async (password: string) => {
    return await api.$post('/admin/users/verify-password', {
      masterPassword: password,
    })
  },
}

export const userCompanyApi = {
  /** * 회사(소속) 목록 조회
   */
  getCompanies: async (params: CompanyQueryParams) => {
    return await api.$get<ApiResponse<Company[]>>(
      '/admin/users/companies',
      params as Record<string, unknown>
    )
  },

  /** * 회사(소속) 상세 조회
   */
  getCompanyDetail: async (companySq: number) => {
    return await api.$get<ApiResponse<Company>>(
      `/admin/users/companies/${companySq}`
    )
  },

  /** * 회사(소속) 수정
   */
  updateCompany: async (companySq: number, formData: FormData) => {
    return await api.$patch(`/admin/users/companies/${companySq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** * 회사(소속) 인증
   */
  verifyCompany: async (payload: CompanyVerifyPayload) => {
    return await api.$post<ApiResponse<boolean>>(
      '/mypage/edit/verify-enterprise',
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  },
}

import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/dashboard/data/types'
import { type AdminUser } from '../data/schema'

// 회사(소속) 타입 정의
export interface Company {
  companySq: number
  companyNm: string
}

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

// ──────────────────────────────────────────────────────
// 회사(소속) 검색 API
// TODO: 백엔드 구현 후 실제 API 호출로 교체
// ──────────────────────────────────────────────────────

const MOCK_COMPANIES: Company[] = [
  { companySq: 1, companyNm: 'EST소프트' },
  { companySq: 2, companyNm: '삼성전자' },
  { companySq: 3, companyNm: 'LG전자' },
  { companySq: 4, companyNm: 'SK하이닉스' },
  { companySq: 5, companyNm: '네이버' },
  { companySq: 6, companyNm: '카카오' },
  { companySq: 7, companyNm: '쿠팡' },
  { companySq: 8, companyNm: '배달의민족' },
  { companySq: 9, companyNm: '라인' },
  { companySq: 10, companyNm: '토스' },
  { companySq: 11, companyNm: '현대자동차' },
  { companySq: 12, companyNm: '기아' },
  { companySq: 13, companyNm: 'KT' },
  { companySq: 14, companyNm: 'SK텔레콤' },
  { companySq: 15, companyNm: '포스코' },
  { companySq: 16, companyNm: '한화' },
  { companySq: 17, companyNm: '롯데정보통신' },
  { companySq: 18, companyNm: '넥슨' },
  { companySq: 19, companyNm: '엔씨소프트' },
  { companySq: 20, companyNm: '크래프톤' },
]

/**
 * 회사(소속) 검색
 * TODO: 백엔드 API 구현 후 아래 mock 로직을 실제 API 호출로 교체하세요.
 * 예: return await api.$get<ApiResponse<Company[]>>('/admin/companies', { keyword })
 */
export async function searchCompanies(keyword: string): Promise<Company[]> {
  // 네트워크 지연 시뮬레이션 (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (!keyword.trim()) return MOCK_COMPANIES

  return MOCK_COMPANIES.filter((c) =>
    c.companyNm.toLowerCase().includes(keyword.toLowerCase())
  )
}

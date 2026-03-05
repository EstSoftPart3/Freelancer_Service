import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/dashboard/data/types'
import { type AdminUser } from '../data/schema'

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

  /** * 유저 상세 조회
   */

  /** * 유저 수정
   */
  updateUser: async (userSq: number, formData: FormData) => {
    return await api.$patch(`/admin/user/${userSq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** 유저 삭제
   */
  deleteUser: async (userSq: number) => {
    return await api.$delete(`/admin/user/${userSq}`)
  },

  /** * 프로필 이미지 수정
   */
  updateProfileImage: async (profileImageSq: number, formData: FormData) => {
    return await api.$patch(`/admin/user/profile/${profileImageSq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  updateCompany: async (companySq: number, formData: FormData) => {
    return await api.$patch(`/admin/user/company/${companySq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  resetPassword: async (userSq: number) => {
    return await api.$patch(`/admin/user/reset/${userSq}`)
  },
}

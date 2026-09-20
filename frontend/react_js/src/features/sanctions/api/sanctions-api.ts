import { api } from '@/lib/api'

export interface SanctionUserItem {
  userSq: number
  userType: string
  email: string
  userNm: string
  companyNm?: string
  phone: string
  sanctionCount: number
  reportCount: number
  sanctionStatus: string
  sanctionReason: string
  suspendedUntilDtm?: string
}

export interface SanctionsResponse {
  data: {
    userList: SanctionUserItem[]
    totalCount: number
    currentPage: number
  }
}

export const sanctionsApi = {
  getSanctionedUsers: async (params: {
    page?: number
    size?: number
    search_keyword?: string
    user_type?: string
  }): Promise<SanctionsResponse> => {
    const response = await api.$get('/v1/bo/sanctions/users', { params })
    return response
  },
}
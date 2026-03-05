// [Freelancer Service]
import { api } from '@/lib/api'

// 1. 신고 상세 및 리스트 아이템 타입 정의
export interface AdminReport {
  reportSq: number
  reporterSq: number
  reporterNm: string
  targetTypeCd: number
  targetTypeNm: string
  targetSq: number
  targetTtl: string

  targetDescription?: string // 신고 대상의 실제 본문 내용
  processDesc?: string | null // 관리자가 작성한 처리 메모

  originTypeCd?: number
  reasonCd: number
  reasonNm: string
  content?: string | null
  statusCd: number
  statusNm: string
  processorNm?: string | null
  createdAt: string
  processedAt?: string | null
}

// 2. 신고 목록 응답 인터페이스
export interface AdminReportListResponse {
  reports: AdminReport[]
  totalElements: number
  page: number
  size: number
}

// 3. 신고 검색 쿼리 파라미터
export interface ReportQueryParams {
  page: number
  size: number
  statusCds?: number[]
  keyword?: string
  sortField?: string
  sortOrder?: string
  [key: string]: number | string | number[] | undefined
}

export const reportApi = {
  /**
   * 신고 목록 조회
   */
  getReports: async (params: ReportQueryParams) => {
    return await api.$get<AdminReportListResponse>(
      '/report',
      params as Record<string, unknown>
    )
  },

  /**
   * GET /admin/report/{reportSq} (실제 경로는 API 인스턴스 설정에 따라 '/report/{reportSq}')
   */
  getReportDetail: async (reportSq: number) => {
    return await api.$get<AdminReport>(`/report/${reportSq}`)
  },

  /**
   * 신고 처리 (처리완료/반려)
   */
  processReport: async (
    reportSq: number,
    statusCd: number,
    processDesc?: string
  ) => {
    const params = new URLSearchParams()
    params.append('statusCd', statusCd.toString())
    if (processDesc) params.append('processDesc', processDesc)

    return await api.$patch(`/report/${reportSq}/process?${params.toString()}`)
  },
}

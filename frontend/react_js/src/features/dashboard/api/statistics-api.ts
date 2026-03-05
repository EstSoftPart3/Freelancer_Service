import { api } from '@/lib/api'
// 기존 api 경로에 맞게 수정
import type {
  ApiResponse,
  chartDataProps,
  summaryDataProps,
  latestPostsDataProps,
} from '../data/types'

export const fetchChartData = async (startDate: string, endDate: string) => {
  const res = await api.$get<ApiResponse<chartDataProps[]>>(
    '/admin/dashboard/chart',
    { startDate, endDate }
  )
  return res.output
}

export const fetchSummaryData = async () => {
  const res = await api.$get<ApiResponse<summaryDataProps[]>>(
    '/admin/dashboard/summary'
  )
  return res.output
}

export const fetchLatestPostsData = async () => {
  const res = await api.$get<ApiResponse<latestPostsDataProps[]>>(
    '/admin/dashboard/latestpost'
  )
  return res.output
}

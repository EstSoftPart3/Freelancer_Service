import { z } from 'zod'

export const adminReportSchema = z.object({
  // --- 신고 기본 정보 ---
  reportSq: z.number(),
  reporterSq: z.number(),
  reporterNm: z.string(),

  // --- 신고 대상 정보 ---
  targetTypeCd: z.number(),
  targetTypeNm: z.string(),
  targetSq: z.number(),
  targetTtl: z.string(),

  targetDescription: z.string().nullable().optional(),

  originTypeCd: z.number().optional().nullable(),

  // --- 신고 사유 및 내용 ---
  reasonCd: z.number(),
  reasonNm: z.string(),
  content: z.string().nullable().optional(),

  // --- 처리 상태 및 정보 ---
  statusCd: z.number(),
  statusNm: z.string(),
  processDesc: z.string().nullable().optional(),
  processorNm: z.string().nullable().optional(),

  // --- 일시 정보 ---
  createdAt: z.string(),
  processedAt: z.string().nullable().optional(),
})

export const reportSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional(),
  statusCds: z.array(z.number()).optional(),
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

export type AdminReport = z.infer<typeof adminReportSchema>
export type ReportSearch = z.infer<typeof reportSearchSchema>

import { z } from 'zod'

/** 모집 상태 — 서버가 NOW() 와 모집기간을 비교해 계산해 내려준다(저장된 컬럼이 아니다). */
export const RECRUIT_STATUS = {
  RECRUITING: 'RECRUITING',
  SCHEDULED: 'SCHEDULED',
  CLOSED: 'CLOSED',
} as const

export const RECRUIT_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  RECRUITING: { label: '모집중', color: 'bg-green-600 hover:bg-green-700' },
  SCHEDULED: { label: '모집예정', color: 'bg-blue-500 hover:bg-blue-600' },
  CLOSED: { label: '마감', color: 'bg-slate-400 hover:bg-slate-500' },
}

export const adminProjectSchema = z.object({
  projectSq: z.number(),
  projectTtl: z.string(),
  companySq: z.number().nullable().optional(),
  companyNm: z.string().nullable().optional(),
  userSq: z.number().nullable().optional(),
  userId: z.string().nullable().optional(),
  recruitStartDt: z.string().nullable().optional(),
  recruitEndDt: z.string().nullable().optional(),
  projectStartDt: z.string().nullable().optional(),
  projectEndDt: z.string().nullable().optional(),
  recruitStatus: z.string().nullable().optional(),
  projectSalary: z.number().nullable().optional(),
  salaryNegotiableYn: z.string().nullable().optional(),
  viewCnt: z.number().nullable().optional(),
  scrapCnt: z.number().nullable().optional(),
  applicationCnt: z.number().nullable().optional(),
  isDeletedYn: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
})

export type AdminProject = z.infer<typeof adminProjectSchema>

/** 상세 — 목록 필드 + 본문·주소 */
export interface AdminProjectDetail extends AdminProject {
  descriptionTxt?: string | null
  preferenceTxt?: string | null
  address?: string | null
  detailAddress?: string | null
  modifiedAt?: string | null
}

/** 수정 요청. 보내지 않은 필드는 서버가 기존 값을 유지한다. */
export interface AdminProjectUpdate {
  projectTtl?: string
  projectSalary?: number | null
  salaryNegotiableYn?: string
  recruitStartDt?: string
  recruitEndDt?: string
  projectStartDt?: string
  projectEndDt?: string
  descriptionTxt?: string
  preferenceTxt?: string
}

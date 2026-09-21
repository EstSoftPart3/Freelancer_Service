import { z } from 'zod'

export const adminInterviewSchema = z.object({
  interviewReviewSq: z.number(),
  userSq: z.number().nullable().optional(),
  userNickname: z.string().nullable().optional(),
  companyNm: z.string(),
  jobNm: z.string(),
  careerLevel: z.string(),
  interviewDt: z.string().nullable().optional(),
  difficultyStar: z.number().nullable().optional(),
  resultCd: z.string().nullable().optional(),
  interviewViewCnt: z.number(),
  interviewCreatedAtDtm: z.string(),
  interviewIsDeletedYn: z.enum(['Y', 'N']).nullable().optional(),
  // 상세 조회에서만 채워진다(목록 API는 내려주지 않는다).
  interviewStages: z.array(z.string()).optional(),
  questionEdt: z.string().nullable().optional(),
  atmosphereEdt: z.string().nullable().optional(),
  proposedSalary: z.number().nullable().optional(),
})

export type AdminInterview = z.infer<typeof adminInterviewSchema>

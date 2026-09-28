import { z } from 'zod'

export const adminSalarySchema = z.object({
  salarySubmissionSq: z.number(),
  userSq: z.number().nullable().optional(),
  userNickname: z.string().nullable().optional(),
  isSeedYn: z.enum(['Y', 'N']),
  seedNickname: z.string().nullable().optional(),
  isDeletedYn: z.enum(['Y', 'N']).nullable().optional(),
  createdAtDtm: z.string().nullable().optional(),
  employmentType: z.string(),
  jobNm: z.string(),
  careerBucket: z.string(),
  regionNm: z.string(),
  annualSalary: z.number(),
  companyNm: z.string().nullable().optional(),
  // 상세 조회에서만 채워진다(목록 API는 내려주지 않는다).
  skillTagNms: z.array(z.string()).optional(),
  ageBand: z.string().nullable().optional(),
  educationNm: z.string().nullable().optional(),
  companySize: z.string().nullable().optional(),
  companyType: z.string().nullable().optional(),
  positionNm: z.string().nullable().optional(),
  teamSize: z.string().nullable().optional(),
  employmentSubtype: z.string().nullable().optional(),
  remoteType: z.string().nullable().optional(),
  bonusAmount: z.number().nullable().optional(),
  stockOpt: z.string().nullable().optional(),
  jobChangeCount: z.string().nullable().optional(),
  prevAnnualSalary: z.number().nullable().optional(),
  jobChangedYm: z.string().nullable().optional(),
})

export type AdminSalary = z.infer<typeof adminSalarySchema>

// [Freelancer Service] 활동 로그 조회 라우트
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AuditLogList } from '@/features/audit'

// 활동 로그 조회 주소창 파라미터 정의
const auditSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''),
  userTypeCd: z.string().optional().catch(''),
  actionType: z.string().optional().catch(''),
  targetType: z.string().optional().catch(''),
  startDate: z.string().optional().catch(''),
  endDate: z.string().optional().catch(''),
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

export const Route = createFileRoute('/_authenticated/contents/audit/')({
  validateSearch: (search) => auditSearchSchema.parse(search),
  component: AuditLogList,
})

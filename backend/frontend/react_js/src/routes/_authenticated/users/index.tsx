import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Users } from '@/features/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''), // 통합 검색어
  typeCds: z.array(z.number()).optional().catch([]), // 유저 유형 필터
  companySqs: z.array(z.number()).optional().catch([]), // 소속 필터
  userGenderCds: z.array(z.number()).optional().catch([]), // 성별 필터
  tagKeyword: z.string().optional().catch(''), // 태그 검색어
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
})

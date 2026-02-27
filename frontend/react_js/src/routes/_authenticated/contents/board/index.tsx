// [Freelancer Service] 게시글 관리
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BoardList } from '@/features/board'

// 게시글 관리 페이지 주소창 파라미터 정의
const boardSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''), // 통합 검색어
  typeCds: z.array(z.number()).optional().catch([]), // 게시글 유형 필터
  tagKeyword: z.string().optional().catch(''), // 태그 검색어
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

export const Route = createFileRoute('/_authenticated/contents/board/')({
  validateSearch: boardSearchSchema,
  component: BoardList,
})

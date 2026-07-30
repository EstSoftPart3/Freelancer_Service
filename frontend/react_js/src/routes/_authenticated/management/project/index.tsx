// [Freelancer Service] 프로젝트 관리
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ProjectList } from '@/features/project'

// 프로젝트 관리 페이지 주소창 파라미터 정의
const projectSearchSchema = z.object({
  page: z.number().optional().catch(1),
  keyword: z.string().optional().catch(''), // 프로젝트명·소속명·계정 통합 검색어
  // 모집 상태 필터. 미지정이면 전체 (RECRUITING / SCHEDULED / CLOSED)
  recruitStatus: z.string().optional().catch(undefined),
  // 삭제된 공고 포함 여부. 기본은 감춘다 — 복구 대상을 찾을 때만 켠다
  includeDeleted: z.boolean().optional().catch(false),
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

export const Route = createFileRoute('/_authenticated/management/project/')({
  validateSearch: projectSearchSchema,
  component: ProjectList,
})

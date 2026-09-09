// [Freelancer Service] 신고 관리 라우트 설정
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ReportList } from '@/features/report'

// [수정] 신고 관리 컴포넌트 호출

// 1. 신고 관리 전용 주소창 파라미터(Search Schema) 정의
const reportSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''), // 신고자, 사유 등 검색어
  // [수정] typeCds 대신 statusCds(신고 상태)를 사용합니다.
  statusCds: z.array(z.number()).optional().catch([]),
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
})

// 2. 라우트 정의 업데이트
export const Route = createFileRoute('/_authenticated/contents/report/')({
  validateSearch: (search) => reportSearchSchema.parse(search), // 스키마 검증
  component: ReportList, // [수정] 신고 관리 메인 컴포넌트로 교체
})

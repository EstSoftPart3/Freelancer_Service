// [Freelancer Service] 고객의 소리 관리
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { VocList } from '@/features/voc'

// 고객의 소리 관리 페이지 주소창 파라미터 정의
const vocSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  keyword: z.string().optional().catch(''), // 제목·내용·작성자 통합 검색어
  // 처리 상태 필터. undefined = 전체 / false = 미답변 / true = 답변완료
  answered: z.boolean().optional().catch(undefined),
  sortField: z.string().optional().catch('createdAt'),
  sortOrder: z.string().optional().catch('DESC'),
  // 접수 알림 메일의 바로가기(?view={sq})가 쓰는 파라미터.
  // 목록만 열면 운영자가 방금 들어온 문의를 다시 찾아야 하므로, 이 값이 있으면 상세 패널까지 연다.
  view: z.number().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/contents/voc/')({
  validateSearch: vocSearchSchema,
  component: VocList,
})

// [Freelancer Service] 소속(기업) 관리
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CompanyList } from '@/features/company'

// 소속 관리 페이지 주소창 파라미터 정의
const companySearchSchema = z.object({
  page: z.number().optional().catch(1),
  keyword: z.string().optional().catch(''), // 소속명·대표자·사업자번호 통합 검색어
  authCds: z.array(z.number()).optional().catch([]), // 사업자 인증 상태 필터 (2501 미인증 / 2502 인증완료)
})

export const Route = createFileRoute('/_authenticated/management/company/')({
  validateSearch: companySearchSchema,
  component: CompanyList,
})

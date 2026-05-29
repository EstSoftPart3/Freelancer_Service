// [Freelancer Service] 견적의뢰서
import { createFileRoute } from '@tanstack/react-router'
import { EstimatesList } from '@/features/estimates/index'

// 경로 확인

// 견적의뢰서 페이지에서 주소창에 담길 파라미터 정의
// const estimatesSearchSchema = z.object({
//   page: z.number().optional().catch(1),
//   pageSize: z.number().optional().catch(10),
//   filter: z.string().optional().catch(''), // 검색어
//   status: z.string().optional().catch(''), // 상태 필터 (전체/대기/승인/반려)
// })

export const Route = createFileRoute('/_authenticated/contents/estimates/')({
  //validateSearch: estimatesSearchSchema,
  component: EstimatesList, // 이제 EstimatesList라는 컴포넌트를 보여줄 겁니다.
})

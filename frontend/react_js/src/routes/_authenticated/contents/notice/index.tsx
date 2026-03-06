// [Freelancer Service] 공지사항
import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { NoticeList } from '@/features/notice'

// 경로 확인!

// 공지사항 페이지에서 주소창에 담길 파라미터 정의
const noticeSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''), // 검색어
})

export const Route = createFileRoute('/_authenticated/contents/notice/')({
  validateSearch: noticeSearchSchema,
  component: NoticeList, // 이제 NoticeList라는 컴포넌트를 보여줄 겁니다.
})

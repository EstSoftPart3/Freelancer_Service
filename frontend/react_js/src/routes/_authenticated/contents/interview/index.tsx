import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { InterviewList } from '@/features/interview'

const interviewSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/contents/interview/')({
  validateSearch: interviewSearchSchema,
  component: InterviewList,
})

import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SalaryList } from '@/features/salary'

const salarySearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/contents/salary/')({
  validateSearch: salarySearchSchema,
  component: SalaryList,
})

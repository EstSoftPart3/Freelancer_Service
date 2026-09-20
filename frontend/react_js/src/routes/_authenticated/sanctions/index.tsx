import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import SanctionsPage from '@/features/sanctions/components/sanctions'

const sanctionsSearchSchema = z.object({
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
  keyword: z.string().optional(),
  userType: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/sanctions/')({
  validateSearch: (search) => sanctionsSearchSchema.parse(search),
  component: SanctionsPage,
})
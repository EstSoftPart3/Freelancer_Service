import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BannerList } from '@/features/banners'

const bannerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  sortField: z.string().optional().catch('displayOrder'),
  sortOrder: z.string().optional().catch('ASC'),
})

export const Route = createFileRoute('/_authenticated/contents/banners/')({
  validateSearch: bannerSearchSchema,
  component: BannerList,
})

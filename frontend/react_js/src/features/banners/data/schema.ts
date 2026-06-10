import { z } from 'zod'

export const bannerSchema = z.object({
  bannerSq: z.number(),
  bannerTitle: z.string(),
  bannerImageUrl: z.string(),
  displayOrder: z.number(),
  startDtm: z.string(),
  endDtm: z.string(),
  isActive: z.boolean(),
  bannerClickCount: z.number(),
  bannerLinkUrl: z.string().optional(),
})

export type Banner = z.infer<typeof bannerSchema>

export interface BannerListResponse {
  banners: Banner[]
  totalElements: number
  page: number
  size: number
}

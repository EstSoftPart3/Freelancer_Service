import { z } from 'zod'

/** 배너 목록·상세 (BO `/admin/banners` 스키마) */
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

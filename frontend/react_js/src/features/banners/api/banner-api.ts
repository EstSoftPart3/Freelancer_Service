import { api, baseUrl } from '@/lib/api'
import type { Banner, BannerListResponse } from '../data/schema'

export interface ApiResponse<T> {
  status: string
  message: string
  output: T
}

export type BannerListParams = {
  page?: number
  size?: number
  sortField?: string
  sortOrder?: string
  keyword?: string
}

/** API 경로(/files/...) → img src용 전체 URL */
export function resolveBannerImageUrl(url?: string): string {
  if (!url) return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url
  }
  return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function normalizeBanner(banner: Banner): Banner {
  return {
    ...banner,
    isActive: Boolean(
      banner.isActive ??
        (banner as Banner & { active?: boolean }).active
    ),
    bannerImageUrl: resolveBannerImageUrl(banner.bannerImageUrl),
    startDtm:
      typeof banner.startDtm === 'string'
        ? banner.startDtm
        : String(banner.startDtm),
    endDtm:
      typeof banner.endDtm === 'string' ? banner.endDtm : String(banner.endDtm),
  }
}

export const bannerApi = {
  /** GET /admin/banners */
  getBanners: async (params: BannerListParams = {}) => {
    const response = await api.$get<ApiResponse<BannerListResponse>>(
      '/admin/banners',
      {
        page: params.page ?? 1,
        size: params.size ?? 10,
        ...(params.keyword ? { keyword: params.keyword } : {}),
        ...(params.sortField ? { sortField: params.sortField } : {}),
        ...(params.sortOrder ? { sortOrder: params.sortOrder } : {}),
      }
    )
    if (response.output?.banners) {
      response.output.banners = response.output.banners.map(normalizeBanner)
    }
    return response
  },

  /** GET /admin/banners/{bannerSq} */
  getBanner: async (bannerSq: number) => {
    const response = await api.$get<ApiResponse<Banner>>(
      `/admin/banners/${bannerSq}`
    )
    if (response.output) {
      response.output = normalizeBanner(response.output)
    }
    return response
  },

  /** POST /admin/banners (multipart) */
  createBanner: async (formData: FormData) => {
    return await api.$post<ApiResponse<null>>('/admin/banners', formData)
  },

  /** PATCH /admin/banners/{bannerSq} (multipart) */
  updateBanner: async (bannerSq: number, formData: FormData) => {
    return await api.$patch<ApiResponse<null>>(
      `/admin/banners/${bannerSq}`,
      formData
    )
  },

  /** DELETE /admin/banners/{bannerSq} */
  deleteBanner: async (bannerSq: number) => {
    return await api.$delete<ApiResponse<null>>(`/admin/banners/${bannerSq}`)
  },

  /** PATCH /admin/banners/{bannerSq}/toggle-active */
  toggleActive: async (bannerSq: number) => {
    return await api.$patch<ApiResponse<null>>(
      `/admin/banners/${bannerSq}/toggle-active`
    )
  },
}

// import { api } from '@/lib/api'
import type { Banner, BannerListResponse } from '../data/schema'

interface ApiResponse<T> {
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

export const bannerApi = {
  /** GET /admin/banners */
  getBanners: async (_params: BannerListParams) => {
    // return await api.$get<ApiResponse<BannerListResponse>>('/admin/banners', {
    //   params,
    // })
    void _params
    return Promise.resolve(null as unknown as ApiResponse<BannerListResponse>)
  },

  /** GET /admin/banners/{bannerSq} */
  getBanner: async (_bannerSq: number) => {
    // return await api.$get<ApiResponse<Banner>>(`/admin/banners/${bannerSq}`)
    void _bannerSq
    return Promise.resolve(null as unknown as ApiResponse<Banner>)
  },

  /** POST /admin/banners (multipart) */
  createBanner: async (_formData: FormData) => {
    // return await api.$post('/admin/banners', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // })
    void _formData
    return Promise.resolve(null)
  },

  /** PATCH /admin/banners/{bannerSq} (multipart) */
  updateBanner: async (_bannerSq: number, _formData: FormData) => {
    // return await api.$patch(`/admin/banners/${bannerSq}`, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // })
    void _bannerSq
    void _formData
    return Promise.resolve(null)
  },

  /** DELETE /admin/banners/{bannerSq} */
  deleteBanner: async (_bannerSq: number) => {
    // return await api.$delete(`/admin/banners/${bannerSq}`)
    void _bannerSq
    return Promise.resolve(null)
  },

  /** PATCH /admin/banners/{bannerSq}/toggle-active */
  toggleActive: async (_bannerSq: number) => {
    // return await api.$patch(`/admin/banners/${bannerSq}/toggle-active`)
    void _bannerSq
    return Promise.resolve(null)
  },
}

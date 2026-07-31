import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/notice/api/notice-api'
import type {
  AdminProject,
  AdminProjectDetail,
  AdminProjectUpdate,
} from '../data/schema'

export interface AdminProjectListResponse {
  projects: AdminProject[]
  totalElements: number
  page: number
  size: number
}

export interface ProjectQueryParams {
  page: number
  size: number
  keyword?: string
  /** 모집 상태 다중 선택. 빈 배열이면 전체 */
  recruitStatuses?: string[]
  includeDeleted?: boolean
  sortField?: string
  sortOrder?: string
}

export const projectApi = {
  getProjects: async (params: ProjectQueryParams) => {
    const qs = new URLSearchParams()
    qs.append('page', String(params.page))
    qs.append('size', String(params.size))
    if (params.keyword) qs.append('keyword', params.keyword)
    // 같은 키를 여러 번 붙인다 — 서버가 List<String> 으로 받는다
    params.recruitStatuses?.forEach((st) => qs.append('recruitStatus', st))
    // includeDeleted 는 false 도 유효값이지만 서버 기본이 false 라 true 일 때만 보낸다.
    if (params.includeDeleted) qs.append('includeDeleted', 'true')
    if (params.sortField) qs.append('sortField', params.sortField)
    if (params.sortOrder) qs.append('sortOrder', params.sortOrder)

    return await api.$get<ApiResponse<AdminProjectListResponse>>(
      `/admin/projects?${qs.toString()}`
    )
  },

  getProjectDetail: async (projectSq: number) =>
    await api.$get<ApiResponse<AdminProjectDetail>>(`/admin/projects/${projectSq}`),

  /** 수정. JSON 으로 보낸다(게시글과 달리 파일 업로드가 없다). */
  updateProject: async (projectSq: number, payload: AdminProjectUpdate) =>
    await api.$patch(`/admin/projects/${projectSq}`, payload, {
      headers: { 'Content-Type': 'application/json' },
    }),

  /** 논리 삭제 — 지원 이력이 프로젝트를 참조하므로 행을 지우지 않는다 */
  deleteProject: async (projectSq: number) =>
    await api.$delete(`/admin/projects/${projectSq}`),

  restoreProject: async (projectSq: number) =>
    await api.$patch(`/admin/projects/${projectSq}/restore`),
}

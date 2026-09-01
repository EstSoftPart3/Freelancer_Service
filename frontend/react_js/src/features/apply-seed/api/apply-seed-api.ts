import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/notice/api/notice-api'

// ── 요청 ────────────────────────────────────────────────────────────────────

/**
 * 배분 요청 (미리보기 · 등록 공용).
 *
 * randomSeed 와 plannedAt 을 미리보기 응답에서 그대로 되돌려야 같은 결과가 저장된다.
 * 등록 때 plannedAt 이 없으면 서버가 400 으로 거절한다.
 */
export interface ApplySeedRequest {
  randomSeed: number
  plannedAt?: string | null
  /** 비우면 채용중인 공고 전체 */
  projectSqs?: number[] | null
  hotMin?: number
  hotMax?: number
  normalMin?: number
  normalMax?: number
  coldMin?: number
  coldMax?: number
  /** 조회수 = 지원 건수 + (지원 건수 × 이 비율%) */
  viewExtraMinPct?: number
  viewExtraMaxPct?: number
}

export interface ApplySeedRevokeRequest {
  /** 비우면 전체 공고의 봇 지원이 대상 */
  projectSqs?: number[] | null
}

// ── 응답 ────────────────────────────────────────────────────────────────────

export interface ApplySeedProject {
  projectSq: number
  projectTtl: string
  companyNm: string | null
  recruitStartDt: string
  recruitEndDt: string
  /** FO 카드에 "지원 N건" 으로 뜨는 값. 실사용자 지원을 포함한다 */
  candidateCnt: number
  /** 그중 봇이 만든 건수 */
  botApplicationCnt: number
  viewCnt: number
}

export interface ApplySeedBot {
  userSq: number
  userId: string
  userNickname: string
  /** null 이면 이력서가 없는 봇 */
  resumeSq: number | null
}

export interface ApplySeedStatus {
  totalBots: number
  botsWithResume: number
  botsWithoutResume: number
  bots: ApplySeedBot[]
}

export type ApplySeedTier = 'HOT' | 'NORMAL' | 'COLD'

export interface ApplySeedAllocation {
  projectSq: number
  projectTtl: string
  companyNm: string | null
  tier: ApplySeedTier
  currentCnt: number
  plannedCnt: number
  /** 이 공고에 적용된 조회수 가산 비율(%) */
  viewExtraPct: number
  /** 이번에 더해질 조회수 */
  plannedViewCnt: number
  botUserSqs: number[]
}

export interface ApplySeedPlan {
  randomSeed: number
  plannedAt: string
  summary: {
    targetProjects: number
    totalApplications: number
    totalViews: number
    usableBots: number
    botsWithoutResume: number
  }
  allocations: ApplySeedAllocation[]
  warnings: string[]
}

export interface ApplySeedCommit {
  randomSeed: number
  targetProjects: number
  insertedApplications: number
  insertedViews: number
  createdResumes: number
}

export interface ApplySeedRevokeSample {
  projectSq: number
  projectTtl: string
  count: number
}

export interface ApplySeedRevoke {
  applications: number
  affectedProjects: number
  samples: ApplySeedRevokeSample[]
}

export const applySeedApi = {
  /** 모집기간이 오늘을 포함하는 공고만 온다. */
  projects: async () =>
    await api.$get<ApiResponse<ApplySeedProject[]>>('/admin/apply-seed/projects'),

  bots: async () =>
    await api.$get<ApiResponse<ApplySeedStatus>>('/admin/apply-seed/bots'),

  /** 이력서 없는 봇에게 만들어 준다. 멱등하다. */
  ensureResumes: async () =>
    await api.$post<ApiResponse<number>>('/admin/apply-seed/resumes', {}),

  /** 배분 미리보기. DB 에 아무것도 쓰지 않는다. */
  preview: async (request: ApplySeedRequest) =>
    await api.$post<ApiResponse<ApplySeedPlan>>('/admin/apply-seed/preview', request),

  /** 실제 등록. 미리보기의 randomSeed·plannedAt 을 그대로 실을 것. */
  apply: async (request: ApplySeedRequest) =>
    await api.$post<ApiResponse<ApplySeedCommit>>('/admin/apply-seed/apply', request),

  revokePreview: async (request: ApplySeedRevokeRequest) =>
    await api.$post<ApiResponse<ApplySeedRevoke>>('/admin/apply-seed/revoke/preview', request),

  /** 물리 삭제 + project_candidate_cnt 원복. */
  revoke: async (request: ApplySeedRevokeRequest) =>
    await api.$post<ApiResponse<ApplySeedRevoke>>('/admin/apply-seed/revoke', request),
}

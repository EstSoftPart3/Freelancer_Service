import { api } from '@/lib/api'
import { type ApiResponse } from '@/features/notice/api/notice-api'

/** 한 요청에 담을 수 있는 최대 글 수. 서버의 @Size(max=50) 와 같아야 한다. */
export const SEED_CHUNK_SIZE = 50

// ── 요청 ────────────────────────────────────────────────────────────────────

export interface SeedAnswerInput {
  title: string
  body: string
  comments?: string[]
}

/** 외부 AI 가 만들어 붙여넣는 콘텐츠. 작성자·작성일시·채택여부는 서버가 배분한다. */
export interface SeedPostInput {
  type: 'BOARD' | 'QNA'
  categoryHintCd?: number | null
  title: string
  body: string
  comments?: string[]
  answers?: SeedAnswerInput[]
}

export interface SeedAdoptRatio {
  inProgress: number
  adopted: number
  selfSolved: number
  unresolved: number
}

export interface SeedOptions {
  spreadDays: number
  hotWindowRatio?: number[]
  authorUserSqs?: number[] | null
  commentMin: number
  commentMax: number
  answerMin: number
  answerMax: number
  viewMin: number
  viewMax: number
  adoptRatio: SeedAdoptRatio
  balanceCategories: boolean
}

export interface SeedCommunityRequest {
  randomSeed: number
  /** 미리보기가 돌려준 값을 등록에 그대로 실어야 같은 결과가 저장된다. */
  plannedAt?: string | null
  options: SeedOptions
  posts: SeedPostInput[]
}

// ── 응답 ────────────────────────────────────────────────────────────────────

export interface SeedPlanComment {
  userSq: number
  userNickname: string
  description: string
  createdAt: string
}

export interface SeedPlanAnswer {
  title: string
  bodyHtml: string
  userSq: number
  userNickname: string
  createdAt: string
  viewCnt: number
  adopted: boolean
  comments: SeedPlanComment[]
}

export interface SeedPlanRow {
  index: number
  type: 'BOARD' | 'QNA'
  boardTypeCd: number
  title: string
  bodyHtml: string
  userSq: number
  userNickname: string
  createdAt: string
  viewCnt: number
  categoryCd: number | null
  categoryNm: string | null
  adoptStatusCd: number | null
  adoptStatusNm: string | null
  answers: SeedPlanAnswer[]
  comments: SeedPlanComment[]
}

export interface SeedCount {
  code: number
  name: string
  count: number
}

export interface SeedAuthorStat {
  userSq: number
  userId: string
  userNickname: string
  boards: number
  answers: number
  comments: number
  total: number
}

export interface SeedSummary {
  totalBoards: number
  totalQna: number
  totalAnswers: number
  totalComments: number
  countByCategory: SeedCount[]
  countByAdoptStatus: SeedCount[]
  countByAuthor: SeedAuthorStat[]
  createdAtMin: string | null
  createdAtMax: string | null
}

export interface SeedPlanResponse {
  randomSeed: number
  plannedAt: string
  summary: SeedSummary
  rows: SeedPlanRow[]
  warnings: string[]
}

export interface SeedCommitResponse {
  insertedBoards: number
  insertedAnswers: number
  insertedComments: number
  boardSqs: number[]
  executedAt: string
  summary: SeedSummary
  warnings: string[]
}

export interface SeedRevokeSample {
  boardSq: number
  title: string
  userNickname: string
  createdAt: string
  boardTypeCd: number
}

export interface SeedRevokeResponse {
  executed: boolean
  wide: boolean
  boards: number
  answers: number
  comments: number
  recalculatedBoards: number
  recalculatedAnswers: number
  samples: SeedRevokeSample[]
}

export interface SeedRevokeRequest {
  boardSqs?: number[] | null
  userSqs?: number[] | null
  createdFrom?: string | null
  createdTo?: string | null
}

export const seedApi = {
  /** 외부 AI 에 붙여넣을 프롬프트. 카테고리를 서버가 공통코드에서 읽어 조립한다. */
  getPrompt: async (count: number) =>
    await api.$get<ApiResponse<string>>('/admin/seed/prompt', { count }),

  /** 배분 미리보기. DB 에 아무것도 쓰지 않는다. */
  preview: async (request: SeedCommunityRequest) =>
    await api.$post<ApiResponse<SeedPlanResponse>>(
      '/admin/seed/community/preview',
      request
    ),

  /** 등록. 미리보기 응답의 randomSeed·plannedAt 을 그대로 실어야 한다. */
  commit: async (request: SeedCommunityRequest) =>
    await api.$post<ApiResponse<SeedCommitResponse>>(
      '/admin/seed/community',
      request
    ),

  revokePreview: async (request: SeedRevokeRequest) =>
    await api.$post<ApiResponse<SeedRevokeResponse>>(
      '/admin/seed/community/revoke/preview',
      request
    ),

  revoke: async (request: SeedRevokeRequest) =>
    await api.$post<ApiResponse<SeedRevokeResponse>>(
      '/admin/seed/community/revoke',
      request
    ),
}

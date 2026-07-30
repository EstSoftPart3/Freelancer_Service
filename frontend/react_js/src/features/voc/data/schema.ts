import { z } from 'zod'

/** BO 고객의 소리 목록 행. 백엔드 AdminBoardListDTO 의 VOC 사용분만 추린 것이다. */
export const adminVocSchema = z.object({
  sq: z.number(),
  userSq: z.number().nullable().optional(),
  userId: z.string().nullable().optional(),
  userNm: z.string().nullable().optional(),
  userNickname: z.string().nullable().optional(),
  ttl: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  viewCnt: z.number().nullable().optional(),
  commentCnt: z.number().nullable().optional(),
  // 답변 개수. 0이면 미답변 — 이 화면의 처리 대기 목록이 곧 answerCnt === 0 이다.
  answerCnt: z.number().nullable().optional(),
  secret: z.boolean().optional(),
})

export type AdminVoc = z.infer<typeof adminVocSchema>

/** 상세 응답(BoardResponse). 답변 목록과 첨부를 함께 내려준다. */
export interface AdminVocDetail {
  sq: number
  ttl: string
  description: string
  userSq: number
  userNickname: string
  createdAt: string
  viewCnt: number
  secret?: boolean
  attachments?: { fileSq: number; fileOriginalNm: string }[]
  answers?: {
    sq: number | null
    ttl: string
    description?: string
    userNickname: string
    createdAt: string
    isDeletedYn: 'Y' | 'N'
  }[]
}

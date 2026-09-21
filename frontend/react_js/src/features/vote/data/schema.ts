import { z } from 'zod'

export const voteOptionResultSchema = z.object({
  voteOptionSq: z.number(),
  voteOptionNm: z.string(),
  voteOptionOrder: z.number(),
  voteCnt: z.number(),
})

export const adminVoteSchema = z.object({
  voteSq: z.number(),
  voteTtl: z.string(),
  voteDescriptionEdt: z.string().nullable().optional(),
  userSq: z.number().nullable().optional(),
  userNickname: z.string().nullable().optional(),
  voteCategoryCd: z.number().nullable().optional(),
  voteEndDt: z.string().nullable().optional(),
  voteCreatedAtDtm: z.string(),
  voteViewCnt: z.number(),
  optionCnt: z.number().nullable().optional(),
  totalVoteCnt: z.number().nullable().optional(),
  voteIsDeletedYn: z.enum(['Y', 'N']).nullable().optional(),
  closed: z.boolean().optional(),
  // 상세 조회에서만 채워진다(목록 API는 옵션별 집계를 내려주지 않는다).
  options: z.array(voteOptionResultSchema).optional(),
})

export type AdminVote = z.infer<typeof adminVoteSchema>
export type VoteOptionResult = z.infer<typeof voteOptionResultSchema>

import { z } from 'zod'

// 댓글 스키마: 백엔드 필드명(sq, parentCommentSq, description 등)에 맞춤
export const commentSchema = z.object({
  sq: z.number(), // commentSq -> sq
  parentCommentSq: z.number().nullable(), // parentSq -> parentCommentSq
  description: z.string(), // content -> description
  userNm: z.string(),
  createdAt: z.string(),
  isDeletedYn: z.enum(['Y', 'N']).optional(), // 백엔드 결과에 없을 수 있으므로 optional
  childComments: z.array(z.any()).optional(), // children -> childComments
})

export const noticeSchema = z.object({
  sq: z.number(),
  userSq: z.number(),
  userNm: z.string(),
  ttl: z.string(),
  viewCnt: z.number(),
  commentCnt: z.number(),
  recommendCnt: z.number(),
  answerCnt: z.number().optional(), // 백엔드 결과 확인 후 추가
  boardAdoptStatusCd: z.number().nullable(),
  createdAt: z.string(),
  normalTags: z.array(z.string()).optional(),
  skillTags: z.array(z.any()).optional(),
  description: z.string().optional(),
  attachments: z
    .array(
      z.object({
        fileSq: z.number(),
        fileOriginalNm: z.string(),
      })
    )
    .optional(),
  comments: z.array(commentSchema).optional(),
})

export type Notice = z.infer<typeof noticeSchema>
export type Comment = z.infer<typeof commentSchema>

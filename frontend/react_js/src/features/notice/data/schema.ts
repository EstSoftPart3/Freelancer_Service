import { z } from 'zod'

export const noticeSchema = z.object({
  sq: z.number(), // DTO의 Long
  userSq: z.number(),
  userNm: z.string(),
  ttl: z.string(), // title -> ttl 로 변경
  viewCnt: z.number(),
  commentCnt: z.number(),
  recommendCnt: z.number(),
  answerCnt: z.number(),
  boardAdoptStatusCd: z.number().nullable(), // Null일 수 있음
  createdAt: z.string(), // LocalDateTime은 ISO 스트링으로 옵니다
  normalTags: z.array(z.string()).optional(),
  skillTags: z.array(z.any()).optional(), // 필요시 더 구체적으로 정의
  description: z.string().optional(),
  attachments: z
    .array(
      z.object({
        fileSq: z.number(),
        fileOriginalNm: z.string(),
      })
    )
    .optional(),
})

export type Notice = z.infer<typeof noticeSchema>

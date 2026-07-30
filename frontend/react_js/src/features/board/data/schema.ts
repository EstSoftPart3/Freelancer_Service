// src/features/board/data/schema.ts
import { z } from 'zod'

export const adminBoardSchema = z.object({
  // --- 목록/공통 필드 (백엔드 JSON 필드명 일치화) ---
  sq: z.number(),
  userSq: z.number().nullable().optional(), // JSON에 추가됨
  userNm: z.string(),
  userNickname: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  ttl: z.string(),

  // [주의] 현재 목록 JSON에는 boardTypeCd가 없습니다.
  // 백엔드 수정 전까지 에러 방지를 위해 optional로 변경합니다.
  boardTypeCd: z.number().optional(),

  // 게시판 카테고리 (공통코드 3200 하위). 일반 게시글에만 값이 있고 Q&A·답변은 null.
  boardCategoryCd: z.number().nullable().optional(),
  boardCategoryNm: z.string().nullable().optional(),

  createdAt: z.string(),
  viewCnt: z.number(),
  commentCnt: z.number(),
  recommendCnt: z.number(),
  answerCnt: z.number().nullable().optional(), // JSON에 추가됨

  // [수정] adoptStatusCd -> boardAdoptStatusCd (이름 변경)
  boardAdoptStatusCd: z.number().nullable(),

  // [주의] 현재 목록 JSON에는 mainType이 없습니다. optional 변경.
  mainType: z.enum(['BOARD', 'ANSWER']).optional(),

  // --- 상세 조회 시 추가되는 필드 ---
  description: z.string().optional(),
  normalTags: z.array(z.string()).nullable().optional(),
  skillTags: z.array(z.string()).nullable().optional(),
  attachments: z
    .array(
      z.object({
        fileSq: z.number(),
        fileOriginalNm: z.string(),
      })
    )
    .optional(),
})

export type AdminBoard = z.infer<typeof adminBoardSchema>

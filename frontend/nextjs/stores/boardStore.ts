import { create } from 'zustand'
import type { SkillTag, Attachment } from '@/types'

interface BoardData {
  ttl: string
  description: string
  normalTags: string[]
  skillTags: SkillTag[]
  attachments: Attachment[]
  // 게시판 카테고리 코드. null = 미분류(카테고리 도입 전 글도 이 상태다)
  categoryCd: number | null
}

const empty: BoardData = {
  ttl: '', description: '', normalTags: [], skillTags: [], attachments: [], categoryCd: null,
}

interface BoardState {
  viewerSq: number | null
  boardData: BoardData
  editSq: number
  setViewerSq: (sq: number | null) => void
  resetBoard: () => void
  setBoard: (payload: {
    sq: number; ttl: string; description: string
    normalTags: string[]; skillTags: SkillTag[]; attachments: Attachment[]
    categoryCd?: number | null
  }) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  viewerSq: null,
  boardData: { ...empty },
  editSq: 0,
  setViewerSq: (sq) => set({ viewerSq: sq }),
  resetBoard: () => set({ boardData: { ...empty }, editSq: 0 }),
  setBoard: (payload) => set({
    boardData: {
      ttl: payload.ttl,
      description: payload.description,
      normalTags: [...payload.normalTags],
      skillTags: [...payload.skillTags],
      attachments: [...payload.attachments],
      categoryCd: payload.categoryCd ?? null,
    },
    editSq: payload.sq,
  }),
}))

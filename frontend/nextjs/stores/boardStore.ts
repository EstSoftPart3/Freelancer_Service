import { create } from 'zustand'
import type { SkillTag, Attachment } from '@/types'

interface BoardData {
  ttl: string
  description: string
  normalTags: string[]
  skillTags: SkillTag[]
  attachments: Attachment[]
}

const empty: BoardData = {
  ttl: '', description: '', normalTags: [], skillTags: [], attachments: [],
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
    },
    editSq: payload.sq,
  }),
}))

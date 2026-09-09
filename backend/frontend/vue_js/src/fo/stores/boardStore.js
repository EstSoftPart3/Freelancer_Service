import { defineStore } from 'pinia'

export const useBoardStore = defineStore('board', {
  state: () => ({
    viewerSq: null,
    boardData: {
      ttl: '',
      description: '',
      normalTags: [],
      skillTags: [],
      attachments: [],
    },
    editSq: 0,
    answerCommentData: {
      description: '',
    },
  }),
  actions: {
    resetBoard() {
      this.boardData = {
        ttl: '',
        description: '',
        normalTags: [],
        skillTags: [],
        attachments: [],
      }
      this.editSq = 0
    },
    resetAnswerComment() {
      this.answerCommentData = {
        ttl: '',
        description: '',
        normalTags: [],
        skillTags: [],
        attachments: [],
      }
    },

    // 게시글 수정의 경우
    setBoard(payload) {
      this.boardData = {
        ttl: payload.ttl,
        description: payload.description,
        normalTags: [...payload.normalTags],
        skillTags: [...payload.skillTags],
        attachments: [...payload.attachments],
      }
      this.editSq = payload.sq
    },
  },
})

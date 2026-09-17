export interface VoteOptionResult {
  voteOptionSq: number
  voteOptionNm: string
  voteOptionOrder: number
  voteCnt: number
}

// 공통코드 3250(IT) / 3251(일반) — parent 1410(투표_카테고리).
export const VOTE_CATEGORIES = [
  { commonCodeSq: 3250, commonCodeNm: 'IT' },
  { commonCodeSq: 3251, commonCodeNm: '일반' },
] as const

export interface VoteListItem {
  voteSq: number
  voteTtl: string
  userSq: number
  userNickname: string | null
  voteCategoryCd: number
  voteEndDt: string
  voteCreatedAtDtm: string
  voteViewCnt: number
  optionCnt: number
  totalVoteCnt: number
}

export interface VoteListResponse {
  page: number
  size: number
  totalElements: number
  votes: VoteListItem[]
}

export interface VoteDetail {
  voteSq: number
  voteTtl: string
  voteDescriptionEdt: string | null
  userSq: number
  userNickname: string | null
  voteCategoryCd: number
  voteEndDt: string
  voteCreatedAtDtm: string
  voteViewCnt: number
  closed: boolean
  totalVoteCnt: number
  myVoteOptionSq: number | null
  options: VoteOptionResult[]
}

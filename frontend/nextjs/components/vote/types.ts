export interface VoteOptionResult {
  voteOptionSq: number
  voteOptionNm: string
  voteOptionOrder: number
  voteCnt: number
}

export interface VoteListItem {
  voteSq: number
  voteTtl: string
  userSq: number
  userNickname: string | null
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
  voteEndDt: string
  voteCreatedAtDtm: string
  voteViewCnt: number
  closed: boolean
  totalVoteCnt: number
  myVoteOptionSq: number | null
  options: VoteOptionResult[]
}

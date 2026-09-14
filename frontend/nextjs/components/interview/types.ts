export const CAREER_LEVELS = ['신입', '1~3년', '3~5년', '5~10년', '10년+'] as const
export type CareerLevel = (typeof CAREER_LEVELS)[number]

export const INTERVIEW_STAGES = ['서류', '코딩테스트', '1차 기술면접', '2차 기술면접', '임원면접', '최종면접'] as const
export type InterviewStage = (typeof INTERVIEW_STAGES)[number]

export interface InterviewListItem {
  interviewReviewSq: number
  userSq: number
  userNickname: string | null
  companyNm: string
  jobNm: string
  careerLevel: string
  interviewDt: string | null
  difficultyStar: number | null
  resultCd: string | null
  interviewViewCnt: number
  interviewCreatedAtDtm: string
}

export interface InterviewListResponse {
  page: number
  size: number
  totalElements: number
  reviews: InterviewListItem[]
}

export interface InterviewDetail {
  interviewReviewSq: number
  userSq: number
  userNickname: string | null
  companyNm: string
  jobNm: string
  careerLevel: string
  interviewDt: string | null
  interviewStages: string[]
  questionEdt: string | null
  difficultyStar: number | null
  atmosphereEdt: string | null
  resultCd: string | null
  proposedSalary: number | null
  interviewViewCnt: number
  interviewCreatedAtDtm: string
}

export const RESULT_LABEL: Record<string, string> = {
  PASS: '합격',
  FAIL: '불합격',
  PENDING: '대기중',
}

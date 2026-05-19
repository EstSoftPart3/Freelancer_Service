export type UserType = 'PERSONAL' | 'COMPANY'

export interface User {
  userSq: number
  userNm: string
  userTypeCd: number        // 301 = PERSONAL, 302 = COMPANY (API 응답값)
  address?: string
  latitude?: number
  longitude?: number
  isAffiliated?: boolean
  affiliatedCompanySq?: number
  companyAuthStatusCd?: string
}

export interface AlertState {
  visible: boolean
  message: string
  type: 'success' | 'danger' | 'info'
}

export interface ModalConfig {
  component: React.ComponentType<Record<string, unknown>>
  props?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ApiResponse<T> {
  output: T
  message?: string
  status: string
}

// Daum 우편번호 API 전역 타입
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void
      }) => { open: () => void }
    }
    kakao: {
      maps: {
        services: {
          Geocoder: new () => {
            addressSearch: (
              addr: string,
              cb: (result: Array<{ x: string; y: string }>, status: string) => void,
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }
}

// ---------- Community ----------
export interface SkillTag {
  skillTagSq: number
  skillTagNm: string
}

export interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

export interface Comment {
  sq: number
  userSq: number
  userNm: string
  userProfileImgUrl?: string
  description: string
  createdAt: string
  recommendCnt: number
  parentCommentSq?: number
  childComments?: Comment[]
}

export interface AnswerSummary {
  sq: number | null
  ttl: string
  userNm: string
  createdAt: string
  viewCnt: number
  commentCnt: number
  recommendCnt: number
  isAdoptedYn: 'Y' | 'N'
  isDeletedYn: 'Y' | 'N'
}

export interface BoardItem {
  sq: number
  ttl: string
  userSq: number
  userNm: string
  createdAt: string
  viewCnt: number
  commentCnt: number
  recommendCnt: number
  skillTags: SkillTag[]
  normalTags: string[]
  answerCnt?: number
  boardAdoptStatusCd?: number
}

export interface BoardDetail extends BoardItem {
  description: string
  attachments: Attachment[]
  comments: Comment[]
  viewerSq?: number
  isAdoptedYn?: string
  answers?: AnswerSummary[]
}

export interface BoardListResponse {
  boards: BoardItem[]
  totalElements: number
}

// ---------- Project ----------
export type UserRole = 'PERSONAL' | 'COMPANY_EXTERNAL' | 'COMPANY_MEMBER' | 'COMPANY_AUTHOR'

export interface RequiredSkillGroup {
  parentSkillTagNm: string
  childSkillTagNms: string[]
}

export interface ProjectItem {
  projectSq: number
  projectTtl: string
  companyNm: string
  companyImageUrl?: string
  projectStartDt: string
  projectEndDt: string
  projectRecruitEndDt: string
  devGradeNm: string
  requiredEduLvl: string
  formattedSalary: string
  salaryNegotiableYn: 'Y' | 'N'
  reqSkills: string[]
  addressTypeCd: number
  detailedAddress?: string
  subwayAddress?: string
  projectViewCnt: number
  projectScrapCnt: number
  isScrap: 0 | 1
}

export interface ProjectDetail {
  projectSq: number
  projectTtl: string
  companyNm: string
  companyImageUrl?: string
  projectDetail: string
  projectRecruitStartDt: string
  projectRecruitEndDt: string
  interviewStartDt: string
  interviewEndDt: string
  projectStartDt: string
  projectEndDt: string
  projectRequiredSkills: RequiredSkillGroup[]
  projectPreferredSkills: RequiredSkillGroup[]
  projectPreferredEtc: string
  projectWorkType: string[]
  addressTypeCd: number
  detailedAddress?: string
  detailedAddressDetail?: string
  subwayAddress?: string
  formattedSalary: string
  salaryNegotiableYn: 'Y' | 'N'
  userRole: UserRole
  isApplied: 0 | 1
  isScrap: 0 | 1
  projectScrapCnt: number
  projectViewCnt: number
}

export interface FilterOption {
  areaSq?: number
  areaName?: string
  common_code_sq?: number
  nm?: string
}

export interface ProjectFilters {
  regions: FilterOption[]
  careers: FilterOption[]
  educations: FilterOption[]
  jobTypes: FilterOption[]
}

export interface ProjectSearchParams {
  addressCodeSq?: number
  projectDeveloperGradeCd?: number
  educationCd?: number
  jobRoleCd?: number
  minPrice?: number
  distance?: number
  searchKeyword?: string
  searchType?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  size?: number
}

// ---------- MyPage ----------
export interface UserInfo {
  userId: string
  userPw: string
  userNm: string
  userEmail: string
  userBirthDt?: string
  userGenderNm?: string
  userPhoneNum: string
  address: string
  detailAddress: string
  zonecode: string
  sigunguCode: string
  latitude?: number | null
  longitude?: number | null
  userProfileImageUrl?: string
  companyNm?: string
}

export interface AffiliationInfo {
  companyNm: string
  companyCeoNm?: string
  companyOpenDt?: string
  companyUrl?: string
  address: string
  joinDt?: string
  profileImageUrl?: string
  companyIsRecruitingYn: 'Y' | 'N'
}

export interface AffiliationEditInfo extends AffiliationInfo {
  userPhoneNum: string
  detailAddress: string
  zonecode: string
  sigunguCode: string
  latitude?: number | null
  longitude?: number | null
  companyGreetingTxt: string
  tagNm: string[]
  companyProfileImageUrl?: string
}

export interface ResumeItem {
  resumeSq: number
  resumeTtl: string
  resumeCreatedAtDtm: string
  resumeIsRepresentativeYn: 'Y' | 'N'
}

export interface CalendarEvent {
  scheduleSq?: number
  scheduleTtl: string
  scheduleTypeCd: number
  scheduleAllDayYn: 'Y' | 'N'
  start: string
  end: string
  projectSq?: number
  resumeSq?: number
  applicationSq?: number
}

export interface ApplicationItem {
  applicationSq: number
  projectTitle: string
  companyTitle: string
  applicantType: string
  appliedDt: string
  readApplicationDt?: string
  applicantCnt: number
  resumeTitle: string
  resumeSq: number
  projectSq: number
  isRecruitEnded: boolean
  interviewDt?: string
}

export interface ScrapProjectItem {
  projectSq: number
  projectTtl: string
  company: { companyNm: string }
  dday: number | null
  createdAt: string
  candidateCnt: number
  address: { parentSigungu: string; sigungu: string }
  developerGrade: string
  requiredEducation: string
  skillTags: string[]
  recruitStartDt: string
  recruitEndDt: string
}

export interface ScrapCompanyItem {
  id: number
  sq?: number
  companyNm: string
  isRecruitingYn: 'Y' | 'N'
  memberCnt: number
  tags?: string[]
  openDt?: string
}

export interface AffiliationApplyItem {
  applicationSq: number
  companyNm: string
  resumeTtl: string
  statusCd: number
  isDeleted: 'Y' | 'N'
  createdAt: string
  readAt?: string
  applicantCnt: number
}

export interface CompanyMember {
  id: number
  userSq: number
  userNm: string
  resumeSq: number
  resumeTtl: string
  careerYr: number
  skillTagNms: string[]
  careerStartDt: string
  careerEndDt?: string
  leavedYn: number
}

export interface AffiliationApplicant {
  applicationSq: number
  userNm: string
  career: number
  skills: Array<{ skillTagNm: string }>
  createdAt: string
  readAt?: string
  statusCd: number
}

export interface CompanyProject {
  projectSq: number
  projectTtl: string
  companyNm: string
  projectCreatedDt: string
  recruitStartDt: string
  recruitEndDt: string
  applicantCnt: number
  address: string
  devGradeNm: string
  requiredEduLvl: string
  reqSkills: string[]
}

export interface DaumPostcodeResult {
  zonecode: string
  roadAddress: string
  jibunAddress: string
  userSelectedType: 'R' | 'J'
  sigunguCode: string
}

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

// Kakao Maps 인스턴스 타입 (window.kakao 선언에서 참조)
export interface KakaoLatLngBoundsInstance {
  getSouthWest: () => { getLat: () => number; getLng: () => number }
  getNorthEast: () => { getLat: () => number; getLng: () => number }
}
export interface KakaoMapInstance {
  setCenter: (pos: unknown) => void
  getLevel: () => number
  setLevel: (level: number, opts?: { anchor?: unknown; animate?: boolean }) => void
  panTo: (pos: unknown) => void
  getBounds: () => KakaoLatLngBoundsInstance
  relayout: () => void
}
export interface KakaoMarkerInstance { setMap: (map: KakaoMapInstance | null) => void }
export interface KakaoInfoWindowInstance { open: (map: KakaoMapInstance, marker: KakaoMarkerInstance) => void; close: () => void }
export interface KakaoCustomOverlayInstance {
  setMap: (map: KakaoMapInstance | null) => void
  setZIndex: (z: number) => void
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
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, opts: { center: unknown; level: number }) => KakaoMapInstance
        LatLng: new (lat: number, lng: number) => unknown
        LatLngBounds: new () => KakaoLatLngBoundsInstance
        Marker: new (opts: { position: unknown; map: KakaoMapInstance }) => KakaoMarkerInstance
        InfoWindow: new (opts: { content: string }) => KakaoInfoWindowInstance
        CustomOverlay: new (opts: { position: unknown; content: HTMLElement; zIndex?: number }) => KakaoCustomOverlayInstance
        event: {
          addListener: (target: unknown, event: string, cb: () => void) => void
          removeListener: (target: unknown, event: string, cb: () => void) => void
        }
        services: {
          Geocoder: new () => {
            addressSearch: (
              addr: string,
              cb: (result: Array<{ x: string; y: string; address?: { b_code?: string } }>, status: string) => void,
            ) => void
          }
          Places: new () => {
            keywordSearch: (
              keyword: string,
              cb: (result: Array<{ place_name: string; address_name: string; x: string; y: string }>, status: string) => void,
              opts?: { category_group_code?: string },
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
  // 전체보기(통합 목록)에서만 채워짐 — 'board' | 'qna', 상세/태그 링크 분기용
  boardType?: 'board' | 'qna'
}

export interface CommunityBestItem {
  sq: number
  boardType: 'board' | 'qna'
  ttl: string
  userNm: string
  viewCnt: number
  commentCnt: number
  recommendCnt: number
  createdAt: string
  score: number
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
  projectCreatedDt: string
  recruitStartDt: string
  recruitEndDt: string
  recruitStatus: string
  devGradeNm: string
  requiredEduLvl: string
  formattedSalary: string
  salaryNegotiableYn: 'Y' | 'N'
  reqSkills: string[]
  addressTypeCd: number
  detailedAddress?: string
  subwayAddress?: string
  viewCnt: number
  applicantCnt: number
  hasScrapped: 'Y' | 'N'
  latitude?: number
  longitude?: number
  distance?: number | null
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
  projectAddress?: string
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
  common_code_nm?: string
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
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
}

export interface ProjectRegionGroup {
  sigungu: string
  projectCount: number
  latitude: number
  longitude: number
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
  scheduleCnt?: string
  scheduleTypeCd: number
  scheduleAllDayYn: 'Y' | 'N'
  start: string
  end: string
  // 원본 데이터 — FullCalendar가 뷰(월/주)에 따라 재해석하는 info.event.startStr/allDay 대신
  // 여기서 시작/종료/종일 여부를 그대로 읽어야 뷰 전환 후에도 값이 바뀌지 않는다.
  scheduleStartDtm?: string
  scheduleEndDtm?: string
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
  applicantName?: string
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

import { userCompanyApi, type Company } from '@/features/users/api/users-api'

/**
 * 소속(기업) 관리 전용 API.
 *
 * <p>백엔드 엔드포인트는 {@code /admin/users/companies} 로 이미 있고 유저 관리 화면의
 * 소속 검색 다이얼로그가 같은 것을 쓴다. 그래서 새 API 를 파지 않고 기존 {@code userCompanyApi} 를
 * 그대로 재노출한다 — 파일을 옮기면 users 쪽 import 가 전부 깨지는데 그만한 이득이 없다.</p>
 *
 * <p><b>서버 페이징이 없다.</b> 이 API 는 조건에 맞는 소속을 한 번에 다 준다. 소속 수가
 * 수십 건 수준이라 화면에서 잘라 쓰는 편이 단순하고, 검색도 서버가 해준다.
 * 데이터가 수백 건을 넘기면 {@code AdminUsersMapper.findAllCompanies} 에 LIMIT/OFFSET 을 넣고
 * 이 파일의 소비자(목록 화면)만 고치면 된다.</p>
 */
export const companyApi = {
  getCompanies: (keyword?: string) =>
    userCompanyApi.getCompanies(keyword ? { keyword } : {}),

  getCompanyDetail: userCompanyApi.getCompanyDetail,
  updateCompany: userCompanyApi.updateCompany,
  createCompany: userCompanyApi.createCompany,
}

/** 목록 행. 백엔드가 인증상태·소속원 수를 함께 내려준다(Phase 6-A 에서 추가). */
export interface CompanyRow extends Company {
  companyAuthStatusCd?: number
  memberCnt?: number
  userNm?: string
}

/** 사업자 인증 상태 공통코드 */
export const COMPANY_AUTH = { PENDING: 2501, VERIFIED: 2502 } as const

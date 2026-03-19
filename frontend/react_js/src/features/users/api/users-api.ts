import { api } from '@/lib/api';
import { type ApiResponse } from '@/features/dashboard/data/types';
import { type AdminUser } from '../data/schema';

// 회사(소속) 타입 정의
export interface Company {
  companySq: number;
  companyNm: string;
  companyRegNum?: string; // 사업자 등록번호
  companyAddress?: string; // 회사 주소
}

// 1. 목록 응답을 위한 전용 인터페이스 정의
export interface AdminUserListResponse {
  users: AdminUser[];
  totalElements: number;
  page: number;
  size: number;
}

// 2. 검색/필터를 위한 파라미터 타입 정의
export interface UserQueryParams {
  page: number;
  size: number;
  typeCds?: number[];
  keyword?: string;
  tagKeyword?: string;
  sortField?: string;
  sortOrder?: string;
  [key: string]: number | string | number[] | undefined;
}

export const userApi = {
  /** * 유저 목록 조회
   */
  getUsers: async (params: UserQueryParams) => {
    return await api.$get<ApiResponse<AdminUserListResponse>>(
      '/admin/users',
      params as Record<string, unknown>
    );
  },

  /** * 유저 수정
   */
  updateUser: async (userSq: number, formData: FormData) => {
    return await api.$patch(`/admin/users/${userSq}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** 유저 삭제
   */
  deleteUser: async (userSq: number) => {
    return await api.$delete(`/admin/user/${userSq}`);
  },

  /** 마스터 패스워드 검증
   */
  verifyPassword: async (password: string) => {
    return await api.$post('/admin/users/verify-password', {
      masterPassword: password,
    });
  },
};

// ──────────────────────────────────────────────────────
// 회사(소속) 검색 API
// TODO: 백엔드 구현 후 실제 API 호출로 교체
// ──────────────────────────────────────────────────────

let MOCK_COMPANIES: Company[] = [
  {
    companySq: 1,
    companyNm: 'EST소프트',
    companyRegNum: '111-22-33333',
    companyAddress: '서울 서초구 반포대로 3',
  },
  {
    companySq: 2,
    companyNm: '삼성전자',
    companyRegNum: '135-86-06836',
    companyAddress: '경기 수원시 영통구 삼성로 129',
  },
  {
    companySq: 3,
    companyNm: 'LG전자',
    companyRegNum: '107-86-13833',
    companyAddress: '서울 영등포구 여의대로 128',
  },
  {
    companySq: 4,
    companyNm: 'SK하이닉스',
    companyRegNum: '126-81-22363',
    companyAddress: '경기 이천시 부발읍 경충대로 2091',
  },
  {
    companySq: 5,
    companyNm: '네이버 주식회사',
    companyRegNum: '220-81-62517',
    companyAddress: '경기 성남시 분당구 불정로 6',
  },
  {
    companySq: 6,
    companyNm: '주식회사 카카오',
    companyRegNum: '120-81-47521',
    companyAddress: '제주 제주시 첨단로 242',
  },
  {
    companySq: 7,
    companyNm: '쿠팡',
    companyRegNum: '120-88-00767',
    companyAddress: '서울 송파구 송파대로 570',
  },
  {
    companySq: 8,
    companyNm: '배달의민족',
    companyRegNum: '120-87-65763',
    companyAddress: '서울 송파구 위례성대로 2',
  },
  {
    companySq: 9,
    companyNm: '라인',
    companyRegNum: '314-86-22442',
    companyAddress: '경기 성남시 분당구 분당내곡로 131',
  },
  {
    companySq: 10,
    companyNm: '토스',
    companyRegNum: '206-86-66258',
    companyAddress: '서울 강남구 테헤란로 142',
  },
  {
    companySq: 11,
    companyNm: '현대자동차',
    companyRegNum: '101-81-09147',
    companyAddress: '서울 서초구 헌릉로 12',
  },
  {
    companySq: 12,
    companyNm: '기아',
    companyRegNum: '119-81-02316',
    companyAddress: '서울 서초구 헌릉로 12',
  },
  {
    companySq: 13,
    companyNm: 'KT',
    companyRegNum: '102-81-42945',
    companyAddress: '경기 성남시 분당구 불정로 90',
  },
  {
    companySq: 14,
    companyNm: 'SK텔레콤',
    companyRegNum: '104-81-37225',
    companyAddress: '서울 중구 을지로 65',
  },
  {
    companySq: 15,
    companyNm: '포스코',
    companyRegNum: '506-81-02102',
    companyAddress: '경북 포항시 남구 동해안로 6261',
  },
  {
    companySq: 16,
    companyNm: '한화',
    companyRegNum: '104-81-19830',
    companyAddress: '서울 중구 세종대로 92',
  },
  {
    companySq: 17,
    companyNm: '롯데정보통신',
    companyRegNum: '114-86-09673',
    companyAddress: '서울 금천구 가산디지털2로 179',
  },
  {
    companySq: 18,
    companyNm: '넥슨',
    companyRegNum: '211-86-30263',
    companyAddress: '경기 성남시 분당구 판교로256번길 7',
  },
  {
    companySq: 19,
    companyNm: '엔씨소프트',
    companyRegNum: '211-86-30472',
    companyAddress: '경기 성남시 분당구 대왕판교로644번길 12',
  },
  {
    companySq: 20,
    companyNm: '크래프톤',
    companyRegNum: '214-87-94186',
    companyAddress: '서울 강남구 테헤란로 231',
  },
];

/**
 * 회사(소속) 검색
 * TODO: 백엔드 API 구현 후 아래 mock 로직을 실제 API 호출로 교체하세요.
 * 예: return await api.$get<ApiResponse<Company[]>>('/admin/companies', { keyword })
 */
export async function searchCompanies(keyword: string): Promise<Company[]> {
  // 네트워크 지연 시뮬레이션 (200ms)
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!keyword.trim()) return MOCK_COMPANIES;

  return MOCK_COMPANIES.filter((c) =>
    c.companyNm.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * 특정 회사 상세 정보 조회
 */
export async function getCompanyDetail(
  companySq: number
): Promise<Company | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const company = MOCK_COMPANIES.find((c) => c.companySq === companySq);
  return company || null;
}

/**
 * 특정 회사 정보 수정
 */
export async function updateCompanyDetail(
  companySq: number,
  data: Partial<Company>
): Promise<Company> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const index = MOCK_COMPANIES.findIndex((c) => c.companySq === companySq);
  if (index === -1) throw new Error('Company not found');

  MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], ...data };
  return MOCK_COMPANIES[index];
}

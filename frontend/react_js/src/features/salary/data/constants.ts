// FO(nextjs/components/salary/SalaryCalculatorForm.tsx)와 값이 동일해야 한다.
export const EMPLOYMENT_TYPES = [
  { value: 'EMPLOYED', label: '재직중' },
  { value: 'FREELANCE', label: '프리랜서' },
] as const

export const YEAR_BUCKETS = ['1~2년', '3~5년', '6~9년', '10년+'] as const
export const EMPLOYMENT_SUBTYPES = ['정규직', '계약직'] as const
export const COMPANY_SIZES = ['10인 미만', '10~49명', '50~299명', '300~999명', '1,000명 이상'] as const
export const COMPANY_TYPES = ['스타트업', '중소기업', '중견기업', '대기업'] as const
export const POSITIONS = ['사원', '주임', '대리', '과장', '차장', '부장급 이상'] as const
export const TEAM_SIZES = ['1~4명', '5~9명', '10~19명', '20명 이상'] as const
export const REMOTE_TYPES = ['완전 출근', '하이브리드', '완전 재택'] as const
export const STOCK_OPTS = ['없음', '있음'] as const
export const JOB_CHANGE_COUNTS = ['0회', '1~2회', '3~4회', '5회 이상'] as const

export function employmentTypeLabel(code?: string | null): string {
  return EMPLOYMENT_TYPES.find((o) => o.value === code)?.label ?? code ?? '-'
}

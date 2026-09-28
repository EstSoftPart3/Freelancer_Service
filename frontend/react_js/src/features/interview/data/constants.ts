// FO(nextjs/components/interview/types.ts)와 값이 동일해야 한다.
export const CAREER_LEVELS = ['신입', '1~3년', '3~5년', '5~10년', '10년+'] as const

export const INTERVIEW_STAGES = [
  '서류',
  '코딩테스트',
  '1차 기술면접',
  '2차 기술면접',
  '임원면접',
  '최종면접',
] as const

export const RESULT_OPTIONS = [
  { value: 'PASS', label: '합격' },
  { value: 'FAIL', label: '불합격' },
  { value: 'PENDING', label: '대기중' },
] as const

export function resultLabel(code?: string | null): string {
  return RESULT_OPTIONS.find((o) => o.value === code)?.label ?? '-'
}

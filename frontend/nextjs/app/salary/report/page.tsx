import ComingSoonPanel from '@/components/common/ComingSoonPanel'

export default function SalaryReportPage() {
  return (
    <ComingSoonPanel
      eyebrow="연봉 리포트"
      title="연봉 리포트"
      description="연봉계산기에서 입력한 값은 저장돼 있어요. 다음 단계에서 함께 만들 화면입니다."
      items={[
        '내 연봉 · 그룹 내 상위 N% · 백분위 게이지',
        '연봉 분포 히스토그램, 연도별 추정 연봉, 하드 버전',
        '기술스택 추가 시 추정 연봉 재계산, 회사·이직·프로젝트 추천',
        '최근 3개월 이직 연봉 동향(닉네임 마스킹)',
      ]}
    />
  )
}

import ComingSoonPanel from '@/components/common/ComingSoonPanel'

export default function SalaryRankingPage() {
  return (
    <ComingSoonPanel
      eyebrow="연봉순위표"
      title="같은 조건 개발자 사이에서 내 순위"
      description="다음 단계에서 함께 만들 화면입니다."
      items={[
        '탭: 내 그룹 내 순위 / 전체 랭킹',
        '직무 · 연차 · 기술스택으로 그룹 필터링',
        '연봉 분포 히스토그램, 연차별 중앙값 그래프',
        '표: 순위 · 마스킹 닉네임 · 직무/연차 · 연봉 · 최근 변동',
      ]}
    />
  )
}

import ComingSoonPanel from '@/components/common/ComingSoonPanel'

export default function InterviewPage() {
  return (
    <ComingSoonPanel
      eyebrow="면접후기"
      title="회사별 면접 후기 모음"
      description="다음 단계에서 함께 만들 화면입니다."
      items={[
        '검색 없이 진입해도 최신 후기가 바로 보이는 목록',
        '회사별 집계 카드(평점 · 난이도 · 합격률 · 후기 건수)',
        '후기 항목: 직무/연차 · 전형단계 · 결과 · 면접 질문',
        '"면접 후기 작성" 버튼 → 등록 폼으로 이동',
      ]}
    />
  )
}

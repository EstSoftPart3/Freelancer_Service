import ComingSoonPanel from '@/components/common/ComingSoonPanel'

export default function VotePage() {
  return (
    <ComingSoonPanel
      eyebrow="투표"
      title="개발자들의 생각을 가볍게 묻는 투표"
      description="다음 단계에서 함께 만들 화면입니다."
      items={[
        '카드 그리드 — 질문 + 선택지 + 투표 결과 막대',
        '투표 후 실시간 퍼센트 애니메이션으로 전환',
        '카드 하단에 참여 인원 수 노출',
      ]}
    />
  )
}

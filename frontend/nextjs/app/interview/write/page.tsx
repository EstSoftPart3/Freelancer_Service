import ComingSoonPanel from '@/components/common/ComingSoonPanel'

export default function InterviewWritePage() {
  return (
    <ComingSoonPanel
      eyebrow="면접후기 작성"
      title="면접 후기 등록"
      description="다음 단계에서 함께 만들 화면입니다."
      items={[
        '회사 · 직무 · 연차 · 지원경로 · 면접일 · 전형단계 · 난이도 · 결과',
        '면접 질문 여러 개 추가/삭제',
        '익명 여부 선택',
        '등록 시 커뮤니티 > 커리어/소통 > 면접에도 함께 노출',
      ]}
    />
  )
}

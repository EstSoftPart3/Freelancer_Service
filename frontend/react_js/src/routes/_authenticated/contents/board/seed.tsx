// [Freelancer Service] 커뮤니티 시드 — 외부 AI 가 만든 더미 게시글 반자동 등록
import { createFileRoute } from '@tanstack/react-router'
import { BoardSeed } from '@/features/board-seed'

export const Route = createFileRoute('/_authenticated/contents/board/seed')({
  component: BoardSeed,
})

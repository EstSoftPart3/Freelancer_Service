// [Freelancer Service] 봇 지원 시드 — 채용중 공고에 봇 계정 지원을 반자동 등록
import { createFileRoute } from '@tanstack/react-router'
import { ApplySeed } from '@/features/apply-seed'

export const Route = createFileRoute('/_authenticated/management/project/apply-seed')({
  component: ApplySeed,
})

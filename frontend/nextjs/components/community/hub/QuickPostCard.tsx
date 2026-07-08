'use client'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'

export default function QuickPostCard() {
  const { isLoggedIn, authChecked } = useUserStore()

  if (!authChecked) return null

  if (!isLoggedIn()) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">로그인하면 커뮤니티에 글을 남길 수 있어요.</p>
        <Link
          href="/login"
          className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          로그인
        </Link>
      </div>
    )
  }

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/30 p-4">
      <PenLine className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">지금 커뮤니티에 글을 남겨보세요.</p>
      <Link
        href="/board/register"
        className="inline-flex h-8 flex-1 shrink-0 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted sm:flex-none"
      >
        일반글 쓰기
      </Link>
      <Link
        href="/qna/register"
        className="inline-flex h-8 flex-1 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:flex-none"
      >
        질문하기
      </Link>
    </div>
  )
}

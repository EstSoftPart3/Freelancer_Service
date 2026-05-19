import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: '아이디 찾기 결과',
}

interface Props {
  searchParams: Promise<{ output?: string }>
}

interface FindIdOutput {
  userId: string
  userNm?: string
  regDt?: string
}

export default async function FindAccountResultPage({ searchParams }: Props) {
  const params = await searchParams
  let output: FindIdOutput | null = null
  try {
    if (params.output) output = JSON.parse(decodeURIComponent(params.output)) as FindIdOutput
  } catch { /* malformed query param */ }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">아이디 찾기 결과</h1>
        <div className="rounded-xl border bg-card p-6 shadow-lg">
          {output?.userId ? (
            <>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                입력하신 정보와 일치하는 아이디입니다.
              </p>
              <table className="mb-6 w-full text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="py-2 pr-4 text-left font-medium text-muted-foreground">아이디</th>
                    <td className="py-2 font-semibold">{output.userId}</td>
                  </tr>
                  {output.userNm && (
                    <tr className="border-b">
                      <th className="py-2 pr-4 text-left font-medium text-muted-foreground">이름</th>
                      <td className="py-2">{output.userNm}</td>
                    </tr>
                  )}
                  {output.regDt && (
                    <tr>
                      <th className="py-2 pr-4 text-left font-medium text-muted-foreground">가입일</th>
                      <td className="py-2">{output.regDt}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <p className="mb-6 text-center text-sm text-muted-foreground">
              일치하는 회원 정보를 찾을 수 없습니다.
            </p>
          )}
          <div className="flex gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center')}>
              로그인
            </Link>
            <Link href="/find-account?tab=resetPassword" className={cn(buttonVariants(), 'flex-1 justify-center')}>
              비밀번호 찾기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

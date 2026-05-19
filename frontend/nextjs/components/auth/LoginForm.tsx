'use client'
// Mirrors vue_js/src/fo/views/login&signup/LoginPage.vue
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { setCookie } from '@/lib/cookies'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { User } from '@/types'
import { cn } from '@/lib/utils'

type LoginType = 'PERSONAL' | 'COMPANY'

const DOMAIN_PROVIDERS = [
  { label: 'naver.com', value: 'naver.com' },
  { label: 'gmail.com', value: 'gmail.com' },
  { label: 'kakao.com', value: 'kakao.com' },
  { label: 'nate.com', value: 'nate.com' },
]

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useUserStore()

  const [loginType, setLoginType] = useState<LoginType>('PERSONAL')
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [idSave, setIdSave] = useState(false)
  const [loading, setLoading] = useState(false)

  // 저장된 아이디 불러오기
  useEffect(() => {
    const savedType = localStorage.getItem('savedLoginType') as LoginType | null
    if (savedType === 'PERSONAL' || savedType === 'COMPANY') setLoginType(savedType)
    setAutoLogin(localStorage.getItem('autoLogin') === 'true')
  }, [])

  useEffect(() => {
    const savedKey = loginType === 'PERSONAL' ? 'savedPersonalId' : 'savedCompanyId'
    const saved = localStorage.getItem(savedKey) ?? ''
    setId(saved)
    setIdSave(!!saved)
  }, [loginType])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      userId: id,
      userPw: password,
      userTypeCd: loginType === 'PERSONAL' ? 301 : 302,
      autoLogin,
    }

    try {
      const { data } = await api.post<{ output: { accessToken: string; refreshToken: string } }>(
        '/login',
        payload,
      )
      const { accessToken, refreshToken } = data.output
      if (!accessToken || !refreshToken) throw new Error('토큰 정보가 응답에 없습니다.')

      setCookie('accessToken', accessToken, autoLogin ? 30 : 1)
      setCookie('refreshToken', refreshToken, autoLogin ? 30 : 1)

      // 유저 정보 로드
      const { data: meData } = await api.post<{ output: User }>('/me')
      const user = meData.output
      setUser(user)
      setCookie('userType', user.userTypeCd === 301 ? 'PERSONAL' : 'COMPANY', autoLogin ? 30 : 1)

      // 아이디 저장 처리
      if (idSave) {
        localStorage.setItem(
          loginType === 'PERSONAL' ? 'savedPersonalId' : 'savedCompanyId',
          id,
        )
        localStorage.setItem('savedLoginType', loginType)
      } else {
        localStorage.removeItem('savedPersonalId')
        localStorage.removeItem('savedCompanyId')
      }
      if (autoLogin) localStorage.setItem('autoLogin', 'true')
      else localStorage.removeItem('autoLogin')

      // GA4: login
      alertStore.show(`${user.userNm}님 안녕하세요.`, 'success')
      router.push('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        '로그인에 실패했습니다.'
      alertStore.show(msg, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    alertStore.show(`${provider} 로그인은 준비 중입니다.`, 'danger')
  }

  const tabCls = (active: boolean) =>
    cn(
      'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
    )

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">회원 로그인</h1>

        <div className="rounded-xl border bg-card p-6 shadow-lg">
          {/* 개인 / 기업 탭 */}
          <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
            <button className={tabCls(loginType === 'PERSONAL')} onClick={() => setLoginType('PERSONAL')}>
              개인회원
            </button>
            <button className={tabCls(loginType === 'COMPANY')} onClick={() => setLoginType('COMPANY')}>
              기업회원
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">아이디</label>
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">비밀번호</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                maxLength={32}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={autoLogin}
                  onCheckedChange={(v) => setAutoLogin(!!v)}
                />
                로그인 유지
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={idSave}
                  onCheckedChange={(v) => setIdSave(!!v)}
                />
                아이디 저장
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link
              href={`/sign-up?loginType=${loginType}`}
              className="text-muted-foreground hover:text-foreground"
            >
              회원가입
            </Link>
            <Link
              href="/find-account"
              className="text-muted-foreground hover:text-foreground"
            >
              아이디/비밀번호 찾기
            </Link>
          </div>

          <Separator className="my-5" />

          <p className="mb-3 text-center text-sm text-muted-foreground">소셜 계정으로 로그인</p>
          <div className="flex justify-center gap-3">
            {DOMAIN_PROVIDERS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleSocialLogin(p.label)}
                className="flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold text-muted-foreground hover:bg-muted"
                title={p.label}
              >
                {p.label[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

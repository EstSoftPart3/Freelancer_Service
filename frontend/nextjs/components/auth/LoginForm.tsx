'use client'
// Mirrors vue_js/src/fo/views/login&signup/LoginPage.vue
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { clearAuthCookies, setCookie } from '@/lib/cookies'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { UserApiResponse } from '@/types'

type LoginType = 'PERSONAL' | 'COMPANY'

// 사파리 프라이빗 모드·저장소 차단 정책 등에서는 localStorage 접근 자체가 SecurityError 를 던진다.
// 이 폼의 localStorage 사용은 전부 "있으면 편의 기능" 수준(아이디 저장·자동 로그인 기억)이라,
// 예외를 삼켜서 로그인 폼 자체가 마운트 단계에서 죽는 것만 막는다.
function safeStorageGet(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeStorageSet(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* 저장소 차단 환경 — 무시 */ }
}
function safeStorageRemove(key: string) {
  try { localStorage.removeItem(key) } catch { /* 저장소 차단 환경 — 무시 */ }
}

const SOCIAL_PROVIDERS = [
  { name: 'kakao', title: '카카오 로그인', img: '/img/social/kakao.png' },
  { name: 'naver', title: '네이버 로그인', img: '/img/social/naver.png' },
  { name: 'google', title: '구글 로그인', img: '/img/social/google.png' },
  { name: 'apple', title: '애플 로그인', img: '/img/social/apple.png' },
]

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, clearUser, isLoggedIn } = useUserStore()

  // 헤더 "로그인"은 개인, "기업서비스 > 기업 로그인"은 ?loginType=COMPANY 로 들어온다.
  // 회원가입(SignUpPageClient)과 동일한 방식 — 진입 경로가 그대로 회원 유형을 정하고,
  // 이 페이지 안에서 개인/기업을 서로 바꿀 수 있는 탭은 두지 않는다(잘못된 경로로 가입·로그인하는 걸 막기 위함).
  const loginType: LoginType = searchParams.get('loginType') === 'COMPANY' ? 'COMPANY' : 'PERSONAL'
  // 연봉계산기처럼 로그인 필수 화면에서 튕겨온 경우 로그인 후 원래 화면으로 되돌린다.
  // 외부 도메인으로 열린 리다이렉트(오픈 리다이렉트)를 막기 위해 "/"로 시작하는 내부 경로만 허용한다.
  const redirectParam = searchParams.get('redirect')
  // "//evil.com" 처럼 "/"로 시작하지만 스킴 상대 URL로 해석돼 외부로 나가는 경우까지 막는다.
  const redirectTo =
    redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : '/'
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [autoLogin, setAutoLogin] = useState(false)
  const [idSave, setIdSave] = useState(false)
  const [loading, setLoading] = useState(false)

  // 저장된 아이디 불러오기 — 회원 유형은 더 이상 기억하지 않고(경로가 곧 유형이므로),
  // 그 유형으로 마지막에 저장해둔 아이디만 불러온다.
  useEffect(() => {
    setAutoLogin(safeStorageGet('autoLogin') === 'true')
    const savedKey = loginType === 'PERSONAL' ? 'savedPersonalId' : 'savedCompanyId'
    const saved = safeStorageGet(savedKey) ?? ''
    setId(saved)
    setIdSave(!!saved)
  }, [loginType])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 개인으로 로그인해 둔 채 헤더의 "기업서비스 > 기업 로그인"으로 들어와도(그 반대도 마찬가지)
    // 새 로그인 전에 이전 세션을 먼저 정리한다 — 안 그러면 이전 계정의 쿠키·스토어 값이
    // 새 토큰 저장 사이에 잠깐 섞여 있을 수 있다.
    if (isLoggedIn()) {
      clearUser()
      clearAuthCookies()
    }

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

      // 로그인 유지: 체크=30일 영구, 미체크=세션 쿠키(브라우저 종료 시 로그아웃)
      setCookie('accessToken', accessToken, autoLogin ? 30 : null)
      setCookie('refreshToken', refreshToken, autoLogin ? 30 : null)

      // 유저 정보 로드
      const { data: meData } = await api.post<{ output: UserApiResponse }>('/me')
      const user = meData.output
      setUser(user)
      setCookie('userType', user.userTypeCd === 301 ? 'PERSONAL' : 'COMPANY', autoLogin ? 30 : null)

      // 아이디 저장 처리
      if (idSave) {
        safeStorageSet(
          loginType === 'PERSONAL' ? 'savedPersonalId' : 'savedCompanyId',
          id,
        )
      } else {
        safeStorageRemove('savedPersonalId')
        safeStorageRemove('savedCompanyId')
      }
      if (autoLogin) safeStorageSet('autoLogin', 'true')
      else safeStorageRemove('autoLogin')

      // GA4: login
      alertStore.show(`${user.userNm}님 안녕하세요.`, 'success')
      router.push(redirectTo)
    } catch (err: unknown) {
      // 다른 인증 폼(FindAccountForm 등)은 전부 getApiErrorMessage 를 쓴다. 여기만 손으로
      // response.data.message 만 봐서, 인터셉터가 Error 로 바꾼 "HTTP 200 + status 필드"
      // 실패(예: 비밀번호 불일치)는 서버 문구 대신 항상 이 기본 메시지로만 떴다.
      alertStore.show(getApiErrorMessage(err, '로그인에 실패했습니다.'), 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    alertStore.show(`${provider} 로그인은 준비 중입니다.`, 'danger')
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">
          {loginType === 'COMPANY' ? '기업 로그인' : '개인 로그인'}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {loginType === 'COMPANY'
            ? '기업 회원 계정으로 로그인합니다.'
            : '개인 회원 계정으로 로그인합니다.'}
        </p>

        <div className="rounded-xl border bg-card p-6 shadow-lg">
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
            {SOCIAL_PROVIDERS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSocialLogin(p.name)}
                title={p.title}
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border hover:opacity-80"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.title} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

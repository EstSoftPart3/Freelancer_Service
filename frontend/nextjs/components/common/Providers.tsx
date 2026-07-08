'use client'
// App.vue onMounted 로직을 담당 — 토큰 존재 시 /me 호출해 userStore 초기화
import { useEffect } from 'react'
import { isAxiosError } from 'axios'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import { getCookie, clearAuthCookies } from '@/lib/cookies'
import api from '@/lib/api'
import { User } from '@/types'

export default function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser, setAuthChecked } = useUserStore()

  useEffect(() => {
    const token = getCookie('accessToken')
    if (!token) {
      clearUser()
      setAuthChecked(true)
      return
    }

    api
      .post<{ output: User }>('/me')
      .then(({ data }) => {
        setUser(data.output)
      })
      .catch((e) => {
        clearUser()
        // 서버가 거부한 토큰(400/401 등)은 쿠키도 제거 — 남겨두면 proxy.ts가
        // 쿠키 존재만 보고 /login 진입을 홈으로 돌려보내는 불일치가 생긴다.
        // (네트워크 일시 장애는 제외해 불필요한 로그아웃을 피한다)
        if (isAxiosError(e) && e.response) clearAuthCookies()
      })
      .finally(() => {
        setAuthChecked(true)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // logout=true 쿼리 파라미터 처리 (CommonHeader.vue logout → redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('logout') === 'true') {
      alertStore.show('로그아웃되었습니다.', 'success')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  return <>{children}</>
}

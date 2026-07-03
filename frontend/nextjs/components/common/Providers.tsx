'use client'
// App.vue onMounted 로직을 담당 — 토큰 존재 시 /me 호출해 userStore 초기화
import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { User } from '@/types'

function getCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

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
      .catch(() => {
        clearUser()
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

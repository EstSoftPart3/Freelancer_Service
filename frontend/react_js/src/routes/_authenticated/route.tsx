// [Freelancer_Service] 로그인 인증
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  // 1. 페이지를 로드하기 전에 실행되는 보안 검사
  beforeLoad: ({ location }) => {
    // Zustand 스토어에서 직접 상태를 가져옵니다.
    const { auth } = useAuthStore.getState()

    // 2. 액세스 토큰이 없다면 로그인 페이지로 강제 이동
    if (!auth.accessToken) {
      throw redirect({
        to: '/sign-in',
        search: {
          // 로그인 후 원래 가려던 페이지로 돌아오기 위해 현재 경로를 저장합니다.
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

import { useNavigate, useLocation } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      // 서버 DB의 refreshToken을 지워야 이 로그인이 완전히 무효화된다.
      // 클라이언트 상태만 지우면 탈취된 토큰이 있을 경우 로그아웃이 무력화된다.
      await api.$post('/admin/logout')
    } catch {
      // 네트워크 오류 등으로 서버 무효화에 실패해도 이 브라우저에서는 로그아웃시킨다.
    }
    auth.reset()
    // Preserve current location for redirect after sign-in
    const currentPath = location.href
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}

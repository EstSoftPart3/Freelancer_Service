// [Freelancer_Service] 로그인 화면
import { useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  // TanStack Router에서 쿼리 파라미터(redirectTo)를 가져옵니다.
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            관리자 로그인
          </CardTitle>
          <CardDescription>
            서비스 관리를 위해 아이디와 비밀번호를 <br />
            입력하고 로그인해 주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        {/* <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            로그인 시 서비스{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              이용약관
            </a>{' '}
            및{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              개인정보처리방침
            </a>
            에 동의하게 됩니다.
          </p>
        </CardFooter> */}
      </Card>
    </AuthLayout>
  )
}

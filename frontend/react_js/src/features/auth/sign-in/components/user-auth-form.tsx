// [Freelancer_Service] 로그인 관련
import { useState } from 'react'
import { z } from 'zod'
import type { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// import { Link } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
// import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  id: z.string().min(1, '아이디를 입력해주세요.'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요.')
    .min(7, '비밀번호는 최소 7자 이상이어야 합니다.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

interface LoginResponse {
  status: string
  message: string
  output: {
    userSq: number
    userNm: string
    userTypeCd: number
    token: {
      accessToken: string
      refreshToken: string
    }
    latitude: number | null
    longitude: number | null
    isAffiliated: string | null
    companyAuthStatusCd: number | null
  }
}

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // 2. API 호출 (제네릭에 LoginResponse 적용)
      const response = await api.$post<LoginResponse>('/admin/login', {
        // const response = await api.$post<LoginResponse>('/api/admin/login', {
        userId: data.id,
        userPw: data.password,
        userTypeCd: 303,
        autoLogin: false, // DTO에 있는 필드 추가 (필요시)
      })

      console.log("response : ", response);

      // 3. 데이터 추출 로직 수정
      // api.$post가 이미 바디({status, message, output})를 반환하므로
      // response.output에서 바로 꺼내야 합니다.
      const { output } = response

      if (!output) {
        throw new Error('응답 데이터가 비어있습니다.')
      }

      const { token, ...userInfo } = output

      // 4. 상태 저장
      auth.setAccessToken(token.accessToken)

      auth.setUser({
        accountNo: String(userInfo.userSq || ''), // userSq가 null일 경우 대비
        userId: data.id,
        userName: userInfo.userNm,
        role: ['ADMIN'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })

      localStorage.setItem('refreshToken', token.refreshToken)
      toast.success(`반가워요, ${userInfo.userNm} 관리자님!`)

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>
      // 백엔드 에러 메시지 우선 출력
      const errorMessage =
        axiosError.response?.data?.message || '로그인 중 오류가 발생했습니다.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID</FormLabel>
              <FormControl>
                <Input placeholder='관리자 아이디를 입력하세요' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              {/* <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link> */}
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          로그인
        </Button>

        {/* <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div> */}

        {/* <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div> */}
      </form>
    </Form>
  )
}

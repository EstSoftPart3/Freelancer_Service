import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AlertProvider } from '@/contexts/AlertContext'
import { api, setClearLoginState } from '@/lib/axios'
import CommonHeader from '@/components/common/CommonHeader'
import CommonFooter from '@/components/common/CommonFooter'
import CommonAlert from '@/components/common/CommonAlert'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent Component={Component} pageProps={pageProps} />
      </AlertProvider>
    </AuthProvider>
  )
}

function AppContent({ Component, pageProps }) {
  const { setUserInfo, clearUser } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // axios에 clearUser 함수 등록
    setClearLoginState(clearUser)

    // 자동 로그인 체크
    const fetchUserInfo = async () => {
      try {
        const res = await api.$post('/me')
        const data = res.output

        setUserInfo({
          userSq: data.userSq,
          userNm: data.userNm,
          userTypeCd: data.userTypeCd,
        })
      } catch (error) {
        // 자동 로그인 실패 시 로그인 정보 초기화
        console.log('자동 로그인 실패 (정상)')
        // clearUser()는 호출하지 않음 (무한 루프 방지)
      }
    }

    fetchUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 클라이언트에서만 렌더링 (Hydration 오류 방지)
  if (!mounted) {
    return (
      <div id="app">
        <div className="main">
          <Component {...pageProps} />
        </div>
      </div>
    )
  }

  return (
    <div id="app">
      <CommonHeader />
      <CommonAlert />
      <div className="main">
        <Component {...pageProps} />
      </div>
      <CommonFooter />

      <style jsx global>{`
        #app {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main {
          flex: 1;
          min-height: 700px;
          padding-top: 100px;
        }
      `}</style>
    </div>
  )
}

export default MyApp




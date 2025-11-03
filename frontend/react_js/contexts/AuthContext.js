import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    userSq: '',
    userNm: '',
    userType: '', // 'PERSONAL' or 'COMPANY'
  })

  // localStorage에서 초기값 로드
  useEffect(() => {
    const userSq = localStorage.getItem('userSq') || ''
    const userNm = localStorage.getItem('userNm') || ''
    const userType = localStorage.getItem('userType') || ''
    
    setUser({ userSq, userNm, userType })
  }, [])

  const isLoggedIn = !!user.userNm

  const setUserInfo = useCallback(({ userSq, userNm, userTypeCd }) => {
    const userType =
      userTypeCd === 301 ? 'PERSONAL' : userTypeCd === 302 ? 'COMPANY' : userTypeCd === 303 ? 'ADMIN' : ''

    setUser({ userSq, userNm, userType })

    localStorage.setItem('userSq', userSq)
    localStorage.setItem('userNm', userNm)
    localStorage.setItem('userType', userType)
  }, [])

  const clearUser = useCallback(() => {
    setUser({ userSq: '', userNm: '', userType: '' })

    localStorage.removeItem('userSq')
    localStorage.removeItem('userNm')
    localStorage.removeItem('userType')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('autoLogin')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        setUserInfo,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}





// 클라이언트 사이드 쿠키 유틸리티
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

// days=null → 만료 미설정(세션 쿠키): 브라우저 종료 시 삭제
export function setCookie(name: string, value: string, days: number | null = 7) {
  const expires = days == null ? '' : `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`
}

export function clearAuthCookies() {
  document.cookie = 'accessToken=; Max-Age=0; path=/'
  document.cookie = 'refreshToken=; Max-Age=0; path=/'
  document.cookie = 'userType=; Max-Age=0; path=/'
}

// 클라이언트 사이드 쿠키 유틸리티
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const row = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  // split('=')[1] 이면 값에 '=' 이 하나라도 더 있을 때(패딩 붙은 base64 등) 뒷부분이 잘린다.
  return row?.slice(name.length + 1)
}

// days=null → 만료 미설정(세션 쿠키): 브라우저 종료 시 삭제
export function setCookie(name: string, value: string, days: number | null = 7) {
  // getCookie 와 같은 가드. lib/api.ts 의 401 인터셉터가 이 함수들을 호출하는데,
  // 그 axios 인스턴스는 서버 쪽 호출도 지원하도록 만들어져 있어 여기서 document 가
  // 없으면 ReferenceError 로 죽는다 — 조용히 넘어가는 편이 안전하다.
  if (typeof document === 'undefined') return
  const expires = days == null ? '' : `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return
  document.cookie = 'accessToken=; Max-Age=0; path=/'
  document.cookie = 'refreshToken=; Max-Age=0; path=/'
  document.cookie = 'userType=; Max-Age=0; path=/'
}

/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    if (cookieValue === undefined) return undefined
    // 저장 시 encodeURIComponent 하므로 읽을 때 디코딩.
    // 인코딩 이전(구버전)에 저장된 원문 쿠키는 %가 없어 그대로 반환되고,
    // 깨진 % 시퀀스면 URIError를 삼켜 원문을 반환한다.
    try {
      return decodeURIComponent(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return undefined
}

/**
 * Set a cookie with name, value, and optional max age
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE
): void {
  if (typeof document === 'undefined') return

  // 값에 한글/JSON 특수문자(따옴표·중괄호 등)가 들어가면 HTTP Cookie 헤더 규격을 위반해
  // 백엔드 Spring Security StrictHttpFirewall이 요청을 거부(비ASCII 헤더 값)한다.
  // 특히 FO(localhost:3000)와 쿠키를 공유하는 localhost 환경에서 FO 로그인까지 400 유발.
  // encodeURIComponent로 항상 ASCII 안전한 값으로 저장한다(읽을 때 getCookie가 디코딩).
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`
}

/**
 * Remove a cookie by setting its max age to 0
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; path=/; max-age=0`
}
